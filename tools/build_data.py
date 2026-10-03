#!/usr/bin/env python3
"""Build data/ from the downloaded sources in tools/src (see tools/fetch_sources.sh).

Writes
  data/books.json            [{id, name, name_zh, chapters: [verse count per chapter]}]
  data/text/kjv/<id>.json    [[verse text, ...] per chapter]
  data/text/cuv/<id>.json    the same for 和合本 (Chinese Union Version), in simplified characters, on KJV verse numbers
  data/xref/<id>.json        {"chapter.verse": [[target, votes], ...]} strongest first
  data/people.json, data/people/                                       see build_people()
  data/places.json, data/vctx/, data/search.json, data/basemap.json   see build_places(), build_search(), build_basemap()
Book ids are OSIS (Gen, Exod, ... Rev), as in the OpenBible cross-references.
"""
import itertools, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "src")
DATA = os.path.join(ROOT, "data")

BOOKS = [
    ("Gen", "Genesis"), ("Exod", "Exodus"), ("Lev", "Leviticus"), ("Num", "Numbers"), ("Deut", "Deuteronomy"),
    ("Josh", "Joshua"), ("Judg", "Judges"), ("Ruth", "Ruth"), ("1Sam", "1 Samuel"), ("2Sam", "2 Samuel"),
    ("1Kgs", "1 Kings"), ("2Kgs", "2 Kings"), ("1Chr", "1 Chronicles"), ("2Chr", "2 Chronicles"), ("Ezra", "Ezra"),
    ("Neh", "Nehemiah"), ("Esth", "Esther"), ("Job", "Job"), ("Ps", "Psalms"), ("Prov", "Proverbs"),
    ("Eccl", "Ecclesiastes"), ("Song", "Song of Solomon"), ("Isa", "Isaiah"), ("Jer", "Jeremiah"),
    ("Lam", "Lamentations"), ("Ezek", "Ezekiel"), ("Dan", "Daniel"), ("Hos", "Hosea"), ("Joel", "Joel"),
    ("Amos", "Amos"), ("Obad", "Obadiah"), ("Jonah", "Jonah"), ("Mic", "Micah"), ("Nah", "Nahum"),
    ("Hab", "Habakkuk"), ("Zeph", "Zephaniah"), ("Hag", "Haggai"), ("Zech", "Zechariah"), ("Mal", "Malachi"),
    ("Matt", "Matthew"), ("Mark", "Mark"), ("Luke", "Luke"), ("John", "John"), ("Acts", "Acts"),
    ("Rom", "Romans"), ("1Cor", "1 Corinthians"), ("2Cor", "2 Corinthians"), ("Gal", "Galatians"),
    ("Eph", "Ephesians"), ("Phil", "Philippians"), ("Col", "Colossians"), ("1Thess", "1 Thessalonians"),
    ("2Thess", "2 Thessalonians"), ("1Tim", "1 Timothy"), ("2Tim", "2 Timothy"), ("Titus", "Titus"),
    ("Phlm", "Philemon"), ("Heb", "Hebrews"), ("Jas", "James"), ("1Pet", "1 Peter"), ("2Pet", "2 Peter"),
    ("1John", "1 John"), ("2John", "2 John"), ("3John", "3 John"), ("Jude", "Jude"), ("Rev", "Revelation"),
]
IDS = {b[0] for b in BOOKS}
NAMES_ZH = ("创世记 出埃及记 利未记 民数记 申命记 约书亚记 士师记 路得记 撒母耳记上 撒母耳记下 列王纪上 列王纪下 历代志上 历代志下 "
            "以斯拉记 尼希米记 以斯帖记 约伯记 诗篇 箴言 传道书 雅歌 以赛亚书 耶利米书 耶利米哀歌 以西结书 但以理书 何西阿书 约珥书 "
            "阿摩司书 俄巴底亚书 约拿书 弥迦书 那鸿书 哈巴谷书 西番雅书 哈该书 撒迦利亚书 玛拉基书 马太福音 马可福音 路加福音 约翰福音 "
            "使徒行传 罗马书 哥林多前书 哥林多后书 加拉太书 以弗所书 腓立比书 歌罗西书 帖撒罗尼迦前书 帖撒罗尼迦后书 提摩太前书 "
            "提摩太后书 提多书 腓利门书 希伯来书 雅各书 彼得前书 彼得后书 约翰一书 约翰二书 约翰三书 犹大书 启示录").split()
assert len(NAMES_ZH) == len(BOOKS)
# Chinese names of places and events (和合本 spellings, AI-drafted), shared with tools/build_atlas.py.
ZH = json.load(open(os.path.join(ROOT, "tools", "atlas_zh.json"), encoding="utf-8"))
# Chinese names of people (和合本 spellings, AI-drafted from the verses that name them): "names" by name, and
# "titles" for the people Theographic tells apart with a display title ("Joseph (son of Jacob)").
PEOPLE_ZH = json.load(open(os.path.join(ROOT, "tools", "people_zh.json"), encoding="utf-8"))
ORDER = {b[0]: i for i, b in enumerate(BOOKS)}
ref_key = lambda ref: (ORDER[ref.split(".")[0]], *map(int, ref.split(".")[1:]))
load_theographic = lambda n: {r["id"]: r["fields"] for r in json.load(open(os.path.join(SRC, "theographic", n), encoding="utf-8"))}


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def build_text():
    kjv = json.load(open(os.path.join(SRC, "KJV.json"), encoding="utf-8"))
    assert len(kjv["books"]) == 66
    books = []
    for (bid, name), book in zip(BOOKS, kjv["books"]):
        chapters = []
        for c in book["chapters"]:
            verses = [v["text"].strip() for v in c["verses"]]
            assert [v["verse"] for v in c["verses"]] == list(range(1, len(verses) + 1)), (bid, c["chapter"])
            chapters.append(verses)
        write(os.path.join(DATA, "text", "kjv", bid + ".json"), chapters)
        books.append({"id": bid, "name": name, "name_zh": NAMES_ZH[len(books)], "chapters": [len(c) for c in chapters]})
    write(os.path.join(DATA, "books.json"), books)
    build_cuv(books)
    return {b["id"]: b["chapters"] for b in books}


CUV_FIX = str.maketrans({"「": "“", "」": "”", "『": "‘", "』": "’", "著": "着"})


def build_cuv(books):
    """和合本 on the KJV's verse numbers. It splits two chapters differently (3 John 1:14-15, Revelation 12:17-18);
    the extra verse is joined to the one before it."""
    import opencc  # pip install opencc-python-reimplemented
    t2s = opencc.OpenCC("t2s")
    cuv = json.load(open(os.path.join(SRC, "ChiUn.json"), encoding="utf-8"))
    assert len(cuv["books"]) == 66
    for b, book in zip(books, cuv["books"]):
        chapters = []
        for n, c in zip(b["chapters"], book["chapters"]):
            # Drop the spaces the source puts between words (and before 神); mainland quotes and 着.
            verses = [re.sub(r"\s+", "", t2s.convert(v["text"])).translate(CUV_FIX) for v in c["verses"]]
            verses = verses[:n - 1] + ["".join(verses[n - 1:])] if len(verses) > n else verses + [""] * (n - len(verses))
            chapters.append(verses)
        write(os.path.join(DATA, "text", "cuv", b["id"] + ".json"), chapters)


def build_xref(counts):
    ref = re.compile(r"^(\w+)\.(\d+)\.(\d+)$")
    per_book = {}
    for line in open(os.path.join(SRC, "cross_references.txt"), encoding="utf-8"):
        if line.startswith("From"):
            continue
        src, dst, votes = line.rstrip("\n").split("\t")
        votes = int(votes)
        if votes <= 0:  # negative votes mean readers judged the link unhelpful
            continue
        m = ref.match(src)
        ends = dst.split("-")
        if not m or not all(ref.match(e) for e in ends):
            continue
        b, c, v = m.group(1), int(m.group(2)), int(m.group(3))
        if b not in IDS or any(ref.match(e).group(1) not in IDS for e in ends):
            continue
        if c > len(counts[b]) or v > counts[b][c - 1]:
            continue
        per_book.setdefault(b, {}).setdefault(f"{c}.{v}", []).append([dst, votes])
    total = 0
    for b, verses in per_book.items():
        for k in verses:
            verses[k].sort(key=lambda x: -x[1])
            total += len(verses[k])
        write(os.path.join(DATA, "xref", b + ".json"), verses)
    return total




# --- People (Theographic Bible Metadata, CC BY-SA 4.0; biographies from Easton's Bible Dictionary, public domain) ----

PEOPLE_CHUNK = 256


def bio(text):
    """The first paragraph of an Easton's entry, cut at a sentence end near 700 characters.
    Its links ([Ex. 6:20](/exod#Exod.6.20)) become reader links ([Ex. 6:20](#Exod.6.20))."""
    text = re.sub(r"\]\(/[^)#]*#([^)]+)\)", r"](#\1)", text.strip().split("\n\n")[0].strip())
    if len(text) > 800:
        # sentence ends outside links and brackets, not after an abbreviation such as "Ex." or "i.e."
        cut = [m.end() for m in re.finditer(r"(\w+)\.\s+(?=[A-Z])", text[:700])
               if len(m.group(1)) > 3 and text[:m.start()].count("(") == text[:m.start()].count(")")
               and text[:m.start()].count("[") == text[:m.start()].count("]")]
        text = text[:cut[-1]].strip() + " …" if cut else text
    return text


def aliases(f):
    """Other names for search ("Cephas,Simeon"). God's, Jesus's and the Holy Spirit's are titles ("Lord", "Light"), left out."""
    if f["personLookup"] in ("god_1324", "jesus_905", "holy_spirit_7400"):
        return ""
    return ",".join(a for a in f.get("alsoCalled", "").split(",") if a[:1].isupper() and not a.isupper())


def build_people(verses):
    """data/people.json  [[name, name_zh, gender, father, mother, [partners], [children], [siblings], verse count,
                          first verse, other names], ...]
                         (index = person number; family members are person numbers or null; other names are
                          English, comma-separated, for search)
       data/people/<n>.json  for persons n*256 .. n*256+255: [[biography, [verse, ...]], ...]  (loaded on demand)
       Returns {Theographic id: person number}."""
    people = load_theographic("people.json")
    refs = {}
    for v in verses.values():
        for p in v.get("people", []):
            refs.setdefault(p, []).append(v["osisRef"])
    ids = sorted((p for p in people if p in refs), key=lambda p: (people[p]["name"], -len(refs[p])))
    index = {p: i for i, p in enumerate(ids)}
    one = lambda f, k: index.get((f.get(k) or [None])[0])
    many = lambda f, k: [index[x] for x in f.get(k, []) if x in index]
    out, more = [], []
    for p in ids:
        f, r = people[p], sorted(refs[p], key=ref_key)
        name = f.get("displayTitle") or f["name"]
        zh = PEOPLE_ZH["titles"].get(name) or PEOPLE_ZH["names"].get(f["name"], "")
        # Jesus is "the son (as was supposed) of Joseph" (Luke 3:23): his line names Mary.
        father = None if f["personLookup"] == "jesus_905" else one(f, "father")
        out.append([name, zh, f["gender"][0], father, one(f, "mother"), many(f, "partners"), many(f, "children"),
                    many(f, "siblings"), len(r), r[0], aliases(f)])
        more.append([bio(f["dictText"][0]) if f.get("dictText") else "", r])
    write(os.path.join(DATA, "people.json"), out)
    for n in range(0, len(more), PEOPLE_CHUNK):
        write(os.path.join(DATA, "people", f"{n // PEOPLE_CHUNK}.json"), more[n:n + PEOPLE_CHUNK])
    return index


# --- Places (Theographic Bible Metadata, CC BY-SA 4.0) and a base map (Natural Earth, public domain) ---------

def build_places(verses, people):
    """data/places.json   [[id, name, lon, lat, kind, name_zh], ...]   (index = place number)
       data/vctx/<id>.json  {"places": {"chapter.verse": [place numbers]},
                             "people": {"chapter.verse": [person numbers]}  (see build_people()),
                             "years": {"chapter": year, "chapter.verse": year where it differs from its chapter's},
                             "events": {"chapter.verse": [[title, year, title_zh], ...]}}  (events this verse belongs to)
       Chinese names are "" where tools/atlas_zh.json has none."""
    places, events = load_theographic("places.json"), load_theographic("events.json")
    index, out = {}, []
    for pid, p in places.items():
        if p.get("latitude") and p.get("longitude") and not p.get("duplicate_of"):
            index[pid] = len(out)
            out.append([p["placeLookup"], p.get("displayTitle") or p["kjvName"], round(float(p["longitude"]), 3),
                        round(float(p["latitude"]), 3), p.get("featureType", "")])
            out[-1].append(ZH["place_names"].get(out[-1][1], ""))
    write(os.path.join(DATA, "places.json"), out)
    vplaces, vpeople, vevents, vyears = {}, {}, {}, {}
    year = lambda s: int(re.match(r"^-?\d+", s).group()) if re.match(r"^-?\d+", s) else None
    for v in verses.values():
        b, c, n = v["osisRef"].split(".")
        ps = [index[p] for p in v.get("places", []) if p in index]
        if ps:
            vplaces.setdefault(b, {})[f"{c}.{n}"] = ps
        if v.get("people"):
            vpeople.setdefault(b, {})[f"{c}.{n}"] = [people[p] for p in v["people"] if p in people]
        es = [[events[e]["title"], year(events[e]["startDate"]), ZH["event_titles"].get(events[e]["title"], "")]
              for e in v.get("event", []) if e in events]
        if es:
            vevents.setdefault(b, {})[f"{c}.{n}"] = es
    # A verse Theographic leaves undated takes the year of the dated verse before it in its book (or after it, at the
    # start of a book). Haggai has no dates at all; its prophecies are dated to 520 BC (Hag 1:1).
    for b, vs in itertools.groupby(sorted(verses.values(), key=lambda v: ref_key(v["osisRef"])), lambda v: v["osisRef"].split(".")[0]):
        vs = list(vs)
        dated = [v.get("yearNum") for v in vs]
        last = next((y for y in dated if y is not None), {"Hag": -520}.get(b))
        for v, y in zip(vs, dated):
            last = y if y is not None else last
            if last is not None:
                _, c, n = v["osisRef"].split(".")
                vyears.setdefault(b, {}).setdefault(c, {})[n] = last
    for b in set(vplaces) | set(vpeople) | set(vevents) | set(vyears):
        write(os.path.join(DATA, "vctx", b + ".json"), {"places": vplaces.get(b, {}), "people": vpeople.get(b, {}),
                                                        "events": vevents.get(b, {}), "years": chapter_years(vyears.get(b, {}))})
    build_search(out, verses, index, events, year)
    return len(out), sum(map(len, vplaces.values())), sum(map(len, vevents.values()))


def chapter_years(chapters):
    """{"3": {"16": year, ...}} → {"3": the chapter's commonest year, "3.16": year if it differs}  (years as Theographic dates
    each verse, for setting the map's timeline when the verse has no dated event)"""
    out = {}
    for c, verses in chapters.items():
        common = max(set(verses.values()), key=list(verses.values()).count)
        out[c] = common
        out.update({f"{c}.{n}": y for n, y in verses.items() if y != common})
    return out


def build_search(places, verses, index, events, year):
    """data/search.json  {"places": [[name, name_zh, kind, first verse, verse count], ...] (as data/places.json),
                          "events": [[title, title_zh, year, first verse, verse count], ...]}  for the search box"""
    key = ref_key
    pref, eref = {}, {}
    for v in sorted(verses.values(), key=lambda v: key(v["osisRef"])):
        for p in v.get("places", []):
            if p in index:
                pref.setdefault(index[p], []).append(v["osisRef"])
        for e in v.get("event", []):
            if e in events:
                eref.setdefault(e, []).append(v["osisRef"])
    ps = [[p[1], p[5], p[4], pref[i][0], len(pref[i])] if i in pref else [p[1], p[5], p[4], None, 0]
          for i, p in enumerate(places)]
    es = [[events[e]["title"], ZH["event_titles"].get(events[e]["title"], ""), year(events[e]["startDate"]), r[0], len(r)]
          for e, r in sorted(eref.items(), key=lambda kv: key(kv[1][0]))]
    write(os.path.join(DATA, "search.json"), {"places": ps, "events": es})


def build_basemap():
    """data/basemap.json: land, lakes and main rivers of the Bible lands, simplified, as lon/lat rings and lines."""
    from shapely.geometry import box, shape, mapping  # pip install shapely
    clip = box(8, 20, 52, 46)
    def geoms(name, keep=None, tol=0.03):
        out = []
        for f in json.load(open(os.path.join(SRC, "naturalearth", name), encoding="utf-8"))["features"]:
            if not f["geometry"] or (keep and f["properties"].get("name") not in keep):
                continue
            g = shape(f["geometry"]).intersection(clip).simplify(tol, preserve_topology=True)
            if g.is_empty:
                continue
            m = mapping(g)
            parts = {"Polygon": [m["coordinates"]], "MultiPolygon": m["coordinates"], "LineString": [[m["coordinates"]]],
                     "MultiLineString": [[l] for l in m["coordinates"]]}.get(m["type"])
            if parts is None:  # a GeometryCollection left by clipping
                continue
            for part in parts:
                for ring in part:
                    if len(ring) > 1:
                        out.append([[round(x, 2), round(y, 2)] for x, y in ring])
        return out
    write(os.path.join(DATA, "basemap.json"), {
        "land": geoms("ne_50m_land.geojson"),
        "lakes": geoms("ne_50m_lakes.geojson", tol=0.01),
        "rivers": geoms("ne_50m_rivers_lake_centerlines.geojson",
                        {"Nile", "Jordan", "Euphrates", "Al Furat", "Firat", "Tigris", "Dicle", "Damietta Branch", "Rosetta Branch"}, 0.02),
    })


if __name__ == "__main__":
    counts = build_text()
    print("books:", len(counts), "verses:", sum(sum(c) for c in counts.values()))
    print("cross-references kept:", build_xref(counts))
    verses = load_theographic("verses.json")
    people = build_people(verses)
    print("people:", len(people))
    print("places, verses with places, verses with events:", build_places(verses, people))
    build_basemap()
