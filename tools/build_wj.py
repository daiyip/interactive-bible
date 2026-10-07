"""Builds data/wj/<version>.json: where the words of Jesus are in each verse, for red letters.

The marks come from seven1m/open-bibles (see tools/fetch_sources.sh): the KJV in OSIS (<q who="Jesus">) and the
World English Bible in USFX (<wj>). Each marked stretch is found again in this app's own text of the verse, so the
file holds character ranges into data/text/<version>: {"John": {"3.3": [[33, 129]]}}.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "src")
DATA = os.path.join(ROOT, "data")
BOOKS = [b["id"] for b in json.load(open(os.path.join(DATA, "books.json")))]
USFX = "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split()
TOKEN = re.compile(r"<[^>]+>|[^<]+")

def segments(path, verse_of, wj_on, wj_off, skip):
    """{(book, c, v): [marked text, ...]} from a marked-up source."""
    out, verse, wj, skipping, cur = {}, None, False, 0, ""
    def flush():
        nonlocal cur
        if verse and wj and cur.strip():
            out.setdefault(verse, []).append(cur)
        cur = ""
    for tok in TOKEN.findall(open(path, encoding="utf-8").read()):
        if tok.startswith("<"):
            name = re.match(r"</?\s*([\w:]+)", tok)
            name = name and name.group(1)
            if name in skip:
                if tok.startswith("</"): skipping -= 1
                elif not tok.endswith("/>"): skipping += 1
                continue
            v = verse_of(tok)
            if v is not None or wj_on(tok) or wj_off(tok):
                flush()
            if v is not None: verse = v or None
            if wj_on(tok): wj = True
            if wj_off(tok): wj = False
        elif not skipping and wj:
            cur += tok
    flush()
    return out

def kjv_verse(tok):
    m = re.match(r'<verse osisID="(\w+)\.(\d+)\.(\d+)" sID', tok)
    if m: return (m.group(1), int(m.group(2)), int(m.group(3)))
    return "" if tok.startswith("<verse eID") else None

web_at = {"book": None, "c": 0}
def web_verse(tok):
    """USFX marks the book (<book id="JHN">) and chapter (<c id="3"/>) once, then each verse by number alone."""
    m = re.match(r'<book id="(\w+)"', tok)
    if m: web_at["book"] = BOOKS[USFX.index(m.group(1))] if m.group(1) in USFX else None; return ""
    m = re.match(r'<c id="(\d+)"', tok)
    if m: web_at["c"] = int(m.group(1)); return ""
    m = re.match(r'<v id="(\d+)"', tok)
    if m: return (web_at["book"], web_at["c"], int(m.group(1))) if web_at["book"] else ""
    return "" if tok.startswith("<ve") else None

def norm(s):
    """Letters and digits only, lower case, with each kept character's index in s."""
    keep = [(c.lower(), i) for i, c in enumerate(s) if c.isalnum()]
    return "".join(c for c, _ in keep), [i for _, i in keep]

def ranges(text, segs):
    t, idx = norm(text)
    out, start = [], 0
    for seg in segs:
        n, _ = norm(seg)
        if not n: continue
        at = t.find(n, start)
        if at < 0: continue
        a, z = idx[at], idx[at + len(n) - 1] + 1
        while a > 0 and text[a - 1] in "“‘\"'(": a -= 1  # opening quote marks belong to the words
        while z < len(text) and text[z] in ".,;:!?’”\"')": z += 1
        if out and a <= out[-1][1] + 2: out[-1][1] = z
        else: out.append([a, z])
        start = at + len(n)
    return out

def build(version, segs):
    wj, found, missed = {}, 0, 0
    for (book, c, v), ss in segs.items():
        try: text = json.load(open(os.path.join(DATA, "text", version, book + ".json")))[c - 1][v - 1]
        except (FileNotFoundError, IndexError): missed += 1; continue
        r = ranges(text, ss)
        if r: wj.setdefault(book, {})[f"{c}.{v}"] = r; found += 1
        else: missed += 1
    os.makedirs(os.path.join(DATA, "wj"), exist_ok=True)
    json.dump(wj, open(os.path.join(DATA, "wj", version + ".json"), "w"), separators=(",", ":"))
    print(version, found, "verses", missed, "not matched")

build("kjv", segments(os.path.join(SRC, "eng-kjv.osis.xml"), kjv_verse,
                      lambda t: t.startswith('<q who="Jesus"') and "sID" in t, lambda t: t.startswith("<q eID"), {"note"}))
build("web", segments(os.path.join(SRC, "eng-web.usfx.xml"), web_verse,
                      lambda t: t == "<wj>", lambda t: t == "</wj>", {"f", "x", "fig"}))
