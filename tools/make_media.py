"""Make the tour media: a picture for every step, narration in Chinese and English (two voices each) and background
music for every period, then upload it to R2 and write the indexes the atlas and the reader load.

Inputs (edited by hand, in git):
  tools/media/scenes.json     {"tour.<tour>.<step>": picture prompt}
  tools/media/narration.json  {"<tour>/<step>": {"script", "direct"}}: the Chinese caption with pauses and stress marked
                              by punctuation, and a one-line reading direction. English steps read their caption as is.
  tools/media/music.json      {"bible/<era id>": music prompt}

Usage: python3 tools/make_media.py generate [pictures] [narration] [music]   # missing files only; all three by default
       python3 tools/make_media.py pack                                      # convert and write atlas/media/*.json
       python3 tools/make_media.py upload                                    # send what R2 lacks
       python3 tools/make_media.py all                                       # the three in turn
       python3 tools/make_media.py status
Keys: GOOGLE_API_KEY (narration with Gemini 2.5 Pro TTS, music with Lyria 3.5), OPENAI_API_KEY (pictures with GPT Image 2,
or PICTURES=gemini for Gemini), ATLAS_R2_ACCOUNT_ID / ATLAS_R2_ACCESS_KEY_ID / ATLAS_R2_SECRET_ACCESS_KEY / ATLAS_R2_BUCKET.
Needs Pillow and boto3 (pip install pillow boto3), and afconvert (macOS) or ffmpeg.

Raw files go to $BIBLE_MEDIA (default ~/Pictures/bible-media), packed ones to $BIBLE_MEDIA/packed/{ai,narration,music};
neither is in git. Packed names carry a content hash, so R2 serves them as immutable and an edit gets a new name.
On R2 they live under apps/bible/ (served at https://data.atlas.daiyip.com/apps/bible/), the folder the atlas gives this
app; atlas/manifest.json "media" points the atlas there, and the reader reads the same indexes.
Narration is keyed by a CRC of the caption it reads ("h"), so a step whose caption changed stays silent until it is
narrated again rather than reading old words."""
import base64, io, json, os, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.request, wave, zlib
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
P = lambda *a: os.path.join(ROOT, *a)
WORK = os.path.expanduser(os.environ.get("BIBLE_MEDIA", "~/Pictures/bible-media"))
R2_PREFIX = "apps/bible/"
VOICES = ["Charon", "Kore"]
LANGS = {"zh": "text_zh", "en": "text"}
TTS = "gemini-2.5-pro-preview-tts"
IMAGE_MODELS = {"openai": ("gpt-image-2", "GPT Image 2"), "gemini": ("gemini-3.1-flash-image", "Gemini")}
PIC_RULES = (" Historically accurate clothing, architecture and objects for the period and place. No text, no writing, no captions,"
             " no signatures, nothing anachronistic, no gore, no close-up portraits.")
STYLE = {
    "zh": "你是圣经历史纪录片的旁白，讲一段圣经故事，要有明显的重音和起伏，像在讲给听众听，而不是念稿。"
          "整体语速比平常稍快、流畅紧凑，停顿短而干脆。用标准普通话，圣经人名地名按和合本读。",
    "en": "You are the narrator of a documentary about the history of the Bible. Tell this moment as a story, with clear stress "
          "and rise and fall, as if speaking to listeners rather than reading. Keep a lively, flowing pace with short, crisp pauses. "
          "Use a warm, neutral English accent.",
}

def load(path, default=None):
    return json.load(open(P(path))) if os.path.exists(P(path)) else default

def crc(text): return format(zlib.crc32(text.encode()), "08x")

def tours(): return load("atlas/tours.json")

def eras(): return load("atlas/eras.json")["eras"]

def post(url, body, headers, tries=6, timeout=600):
    req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", **headers})
    for k in range(tries):
        try:
            return json.load(urllib.request.urlopen(req, timeout=timeout))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or k == tries - 1: raise
            time.sleep(15 * (k + 1))
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if k == tries - 1: raise
            time.sleep(10)

def google(model, body):
    return post(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", body,
                {"x-goog-api-key": os.environ["GOOGLE_API_KEY"]})

def fail(what, e):
    print("FAIL", what, (e.read().decode() if hasattr(e, "read") else str(e))[:200], flush=True)

def run(jobs, fn, threads):
    with ThreadPoolExecutor(threads) as ex: list(ex.map(fn, jobs))

# ---------- generate ----------

def gen_pictures():
    provider = os.environ.get("PICTURES", "openai")
    model = IMAGE_MODELS[provider][0]
    prompts = load("tools/media/scenes.json", {})
    out = os.path.join(WORK, "pictures", provider)
    os.makedirs(out, exist_ok=True)
    def one(key):
        path = os.path.join(out, key + ".png")
        if os.path.exists(path): return
        try:
            if provider == "openai":
                r = post("https://api.openai.com/v1/images/generations",
                         {"model": model, "prompt": prompts[key] + PIC_RULES, "size": "1536x1024", "quality": "medium", "n": 1},
                         {"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"]})
                data = base64.b64decode(r["data"][0]["b64_json"])
            else:
                r = google(model, {"contents": [{"parts": [{"text": prompts[key] + PIC_RULES}]}],
                                   "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "3:2"}}})
                data = base64.b64decode(next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p))
            open(path, "wb").write(data); print("picture", key, flush=True)
        except Exception as e: fail(key, e)
    run(sorted(prompts), one, 3)

def narration_jobs():
    scripts = load("tools/media/narration.json", {})
    for tr in tours():
        for i, s in enumerate(tr["steps"]):
            for lang, field in LANGS.items():
                text = s.get(field)
                if not text: continue
                sc = scripts.get(f"{tr['id']}/{i}", {}) if lang == "zh" else {}
                for v in VOICES:
                    name = f"{lang}__{tr['id']}__{i}__{v}__{crc(text)}.wav"
                    yield lang, f"{tr['id']}/{i}", text, sc, v, name

def gen_narration():
    out = os.path.join(WORK, "narration")
    os.makedirs(out, exist_ok=True)
    def one(job):
        lang, key, text, sc, v, name = job
        path = os.path.join(out, name)
        if os.path.exists(path): return
        lead = "请朗读：" if lang == "zh" else "Read aloud:"
        prompt = STYLE[lang] + (sc.get("direct") or "") + "\n\n" + lead + (sc.get("script") or text)
        try:
            r = google(TTS, {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["AUDIO"],
                             "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": v}}}}})
            part = r["candidates"][0]["content"]["parts"][0]["inlineData"]
            raw = base64.b64decode(part["data"])
            if part.get("mimeType", "").startswith("audio/wav"): open(path, "wb").write(raw)
            else:
                with wave.open(path + ".tmp", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(raw)
                os.replace(path + ".tmp", path)
            print("narration", lang, key, v, flush=True)
        except Exception as e: fail(f"{lang} {key} {v}", e)
    run(list(narration_jobs()), one, int(os.environ.get("THREADS", 6)))

def gen_music():
    prompts = load("tools/media/music.json", {})
    out = os.path.join(WORK, "music")
    os.makedirs(out, exist_ok=True)
    def one(key):
        path = os.path.join(out, key.replace("/", "__") + ".mp3")
        if os.path.exists(path): return
        try:
            r = post("https://generativelanguage.googleapis.com/v1beta/interactions", {"model": "lyria-3.5", "input": prompts[key]},
                     {"x-goog-api-key": os.environ["GOOGLE_API_KEY"]}, tries=4)
            audio = next(c["data"] for st in r.get("steps", []) for c in st.get("content") or [] if c.get("type") == "audio")
            open(path, "wb").write(base64.b64decode(audio)); print("music", key, flush=True)
        except Exception as e: fail(key, e)
    run(sorted(prompts), one, 4)

# ---------- pack ----------

def to_m4a(src, kbps, mono):
    with tempfile.NamedTemporaryFile(suffix=".m4a") as tmp:
        if shutil.which("afconvert"):
            cmd = ["afconvert", "-f", "m4af", "-d", "aac", "-b", str(kbps * 1000)] + (["-c", "1"] if mono else []) + [src, tmp.name]
        else:
            cmd = ["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-c:a", "aac", "-b:a", f"{kbps}k"] + (["-ac", "1"] if mono else []) + [tmp.name]
        subprocess.run(cmd, check=True)
        return open(tmp.name, "rb").read()

def put(folder, stem, ext, data, keep):
    name = f"{stem}-{zlib.crc32(data):08x}.{ext}"
    path = os.path.join(WORK, "packed", folder, name)
    if not os.path.exists(path): open(path, "wb").write(data)
    keep.add(name)
    return name

def prune(folder, keep):
    for f in os.listdir(os.path.join(WORK, "packed", folder)):
        if f not in keep: os.remove(os.path.join(WORK, "packed", folder, f))

def save_index(name, obj):
    os.makedirs(P("atlas/media"), exist_ok=True)
    json.dump(obj, open(P("atlas/media", name), "w"), separators=(",", ":"), sort_keys=True, ensure_ascii=False)

def pack_pictures():
    from PIL import Image
    # The chosen provider's picture first, else the other's (a prompt one of them refused can be made with the other).
    first = os.environ.get("PICTURES", "openai")
    order = [first] + [p for p in IMAGE_MODELS if p != first]
    skip = set(load("tools/media/skip.json", []))  # steps whose picture was judged wrong
    events = {f"tour.{tr['id']}.{i}": s.get("event") for tr in tours() for i, s in enumerate(tr["steps"])}
    keys, images, keep = {}, {}, set()
    os.makedirs(os.path.join(WORK, "packed", "ai"), exist_ok=True)
    for key in sorted(events):
        src = next((p for p in order if os.path.exists(os.path.join(WORK, "pictures", p, key + ".png"))), None)
        if not src or key in skip: continue
        im = Image.open(os.path.join(WORK, "pictures", src, key + ".png")).convert("RGB")
        im.thumbnail((960, 640), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=60, method=6)
        name = put("ai", key.replace("tour.", "").replace(".", "-"), "webp", buf.getvalue(), keep)
        images["ai-" + key] = {"f": name, "ai": IMAGE_MODELS[src][1], "w": im.width, "h": im.height}
        keys["a:" + key] = "ai-" + key
        # The atlas shows a step's event picture when the step names an event, so the event gets this picture too.
        if events[key]: keys.setdefault("a:" + events[key], "ai-" + key)
    prune("ai", keep)
    save_index("pictures.json", {"keys": keys, "images": images})
    print("pictures:", len(images))

def pack_narration():
    src = os.path.join(WORK, "narration")
    os.makedirs(os.path.join(WORK, "packed", "narration"), exist_ok=True)
    jobs = [j for j in narration_jobs() if os.path.exists(os.path.join(src, j[5]))]
    def one(job):
        lang, key, text, sc, v, name = job
        data = to_m4a(os.path.join(src, name), 40, True)
        return lang, key, crc(text), v, data
    index, keep = {"zh": {}, "en": {}}, set()
    with ThreadPoolExecutor(8) as ex:
        for lang, key, h, v, data in ex.map(one, jobs):
            index[lang].setdefault(key, {"h": h})[v] = put("narration", f"{lang}__{key.replace('/', '__')}__{v}", "m4a", data, keep)
    prune("narration", keep)
    save_index("narration.json", index["zh"])      # the atlas's shape: Chinese captions
    save_index("narration-en.json", index["en"])   # read by the reader only
    print("narration:", len(index["zh"]), "zh steps,", len(index["en"]), "en steps")

def pack_music():
    src = os.path.join(WORK, "music")
    os.makedirs(os.path.join(WORK, "packed", "music"), exist_ok=True)
    index, keep = {}, set()
    for f in sorted(os.listdir(src)) if os.path.isdir(src) else []:
        if not f.endswith(".mp3"): continue
        key = f[:-4].replace("__", "/", 1)
        index[key] = {"f": put("music", f[:-4], "m4a", to_m4a(os.path.join(src, f), 96, False), keep)}
    prune("music", keep)
    save_index("music.json", index)
    print("music:", len(index))

# ---------- upload ----------

def upload():
    import boto3
    s3 = boto3.client("s3", endpoint_url=f"https://{os.environ['ATLAS_R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
                      aws_access_key_id=os.environ["ATLAS_R2_ACCESS_KEY_ID"],
                      aws_secret_access_key=os.environ["ATLAS_R2_SECRET_ACCESS_KEY"], region_name="auto")
    bucket = os.environ["ATLAS_R2_BUCKET"]
    for folder, ctype in (("ai", "image/webp"), ("narration", "audio/mp4"), ("music", "audio/mp4")):
        local = os.path.join(WORK, "packed", folder)
        if not os.path.isdir(local): continue
        prefix = R2_PREFIX + folder + "/"
        have = set()
        for page in s3.get_paginator("list_objects_v2").paginate(Bucket=bucket, Prefix=prefix):
            have.update(o["Key"] for o in page.get("Contents", []))
        todo = [f for f in sorted(os.listdir(local)) if prefix + f not in have]
        run(todo, lambda f: s3.upload_file(os.path.join(local, f), bucket, prefix + f,
                                            ExtraArgs={"ContentType": ctype, "CacheControl": "public, max-age=31536000, immutable"}), 16)
        print(folder, ":", len(todo), "uploaded,", len(have), "already there")

def status():
    pics = load("tools/media/scenes.json", {})
    have = lambda k: any(os.path.exists(os.path.join(WORK, "pictures", p, k + ".png")) for p in IMAGE_MODELS)
    print("pictures:", sum(map(have, pics)), "/", len(pics))
    jobs = list(narration_jobs())
    print("narration:", sum(os.path.exists(os.path.join(WORK, "narration", j[5])) for j in jobs), "/", len(jobs))
    mus = load("tools/media/music.json", {})
    print("music:", sum(os.path.exists(os.path.join(WORK, "music", k.replace("/", "__") + ".mp3")) for k in mus), "/", len(mus))

if __name__ == "__main__":
    cmd, what = sys.argv[1], sys.argv[2:] or ["pictures", "narration", "music"]
    gens = {"pictures": gen_pictures, "narration": gen_narration, "music": gen_music}
    if cmd in ("generate", "all"):
        with ThreadPoolExecutor(3) as ex: list(ex.map(lambda w: gens[w](), what))  # the three use different APIs
    if cmd in ("pack", "all"): pack_pictures(); pack_narration(); pack_music()
    if cmd in ("upload", "all"): upload()
    if cmd == "status": status()
