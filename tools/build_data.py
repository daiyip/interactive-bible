#!/usr/bin/env python3
"""Build data/ from the downloaded sources in tools/src (see tools/fetch_sources.sh).

Writes
  data/books.json            [{id, name, chapters: [verse count per chapter]}]
  data/text/kjv/<id>.json    [[verse text, ...] per chapter]
  data/xref/<id>.json        {"chapter.verse": [[target, votes], ...]} strongest first
  data/places.json, data/vctx/, data/basemap.json   see build_places() and build_basemap()
Book ids are OSIS (Gen, Exod, ... Rev), as in the OpenBible cross-references.
"""
import json, os, re

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
        books.append({"id": bid, "name": name, "chapters": [len(c) for c in chapters]})
    write(os.path.join(DATA, "books.json"), books)
    return {b["id"]: b["chapters"] for b in books}


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




# --- Places (Theographic Bible Metadata, CC BY-SA 4.0) and a base map (Natural Earth, public domain) ---------

def build_places():
    """data/places.json   [[id, name, lon, lat, kind], ...]   (index = place number)
       data/vctx/<id>.json  {"places": {"chapter.verse": [place numbers]},
                             "events": {"chapter.verse": [[title, year], ...]}}  (events this verse belongs to)"""
    load = lambda n: {r["id"]: r["fields"] for r in json.load(open(os.path.join(SRC, "theographic", n), encoding="utf-8"))}
    places, verses, events = load("places.json"), load("verses.json"), load("events.json")
    index, out = {}, []
    for pid, p in places.items():
        if p.get("latitude") and p.get("longitude") and not p.get("duplicate_of"):
            index[pid] = len(out)
            out.append([p["placeLookup"], p.get("displayTitle") or p["kjvName"], round(float(p["longitude"]), 3),
                        round(float(p["latitude"]), 3), p.get("featureType", "")])
    write(os.path.join(DATA, "places.json"), out)
    vplaces, vevents = {}, {}
    year = lambda s: int(re.match(r"^-?\d+", s).group()) if re.match(r"^-?\d+", s) else None
    for v in verses.values():
        b, c, n = v["osisRef"].split(".")
        ps = [index[p] for p in v.get("places", []) if p in index]
        if ps:
            vplaces.setdefault(b, {})[f"{c}.{n}"] = ps
        es = [[events[e]["title"], year(events[e]["startDate"])] for e in v.get("event", []) if e in events]
        if es:
            vevents.setdefault(b, {})[f"{c}.{n}"] = es
    for b in set(vplaces) | set(vevents):
        write(os.path.join(DATA, "vctx", b + ".json"), {"places": vplaces.get(b, {}), "events": vevents.get(b, {})})
    return len(out), sum(map(len, vplaces.values())), sum(map(len, vevents.values()))


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
    print("places, verses with places, verses with events:", build_places())
    build_basemap()
