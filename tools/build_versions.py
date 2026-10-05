"""Builds data/text/<version>/<id>.json for the extra translations, on the KJV's verse numbers (as data/text/kjv).

All are public domain, from scrollmapper/bible_databases (see tools/fetch_sources.sh):
  bsb    Berean Standard Bible (2022; dedicated to the public domain in 2023)
  asv    American Standard Version (1901)
  ylt    Young's Literal Translation (1898)
  darby  Darby Bible (1889)
  bbe    Bible in Basic English (1949/1964)
  cuvt   和合本 in traditional characters (data/text/cuv is the same text in simplified characters)
  cuvl   文理和合本, the classical Chinese Union Version (1919)
and web, the World English Bible (public domain), from TehShrike/world-english-bible.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "src")
DATA = os.path.join(ROOT, "data")

def clean(version, s):
    s = s.strip()
    if version == "darby":
        s = re.sub(r"(?<=[a-z,;:])God\b", " God", s).replace("*", "")  # the source runs words into "God"; * marks a note
    if version == "ylt":
        s = s.replace("`", "‘").replace("--", "—")  # the source opens quotes with a backtick
    if version == "bbe":
        s = s.replace("***", "…").replace("+", "")  # *** where the Hebrew is uncertain
    if version in ("cuvt", "cuvl"):
        s = re.sub(r"\s+", "", s)  # the source spaces out the words
    return re.sub(r"\s{2,}", " ", s)

def build(version, source, books):
    data = json.load(open(os.path.join(SRC, source), encoding="utf-8"))
    assert len(data["books"]) == 66
    os.makedirs(os.path.join(DATA, "text", version), exist_ok=True)
    for b, book in zip(books, data["books"]):
        chapters = []
        for n, c in zip(b["chapters"], book["chapters"]):
            verses = [""] * n
            for v in c["verses"]:
                k = min(v["verse"], n) - 1  # a verse past the KJV's last joins it (3 John 1:15, Revelation 12:18)
                verses[k] = (verses[k] + ("" if version in ("cuvt", "cuvl") else " ") + clean(version, v["text"])).strip()
            chapters.append(verses)
        json.dump(chapters, open(os.path.join(DATA, "text", version, b["id"] + ".json"), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",", ":"))

def build_web(books):
    """The World English Bible: per book, a list of pieces of text, each with its chapter and verse. It puts the
    doxology of Romans at 14:24-26, where the KJV has it at 16:25-27."""
    os.makedirs(os.path.join(DATA, "text", "web"), exist_ok=True)
    for b in books:
        chapters = [[""] * n for n in b["chapters"]]
        for x in json.load(open(os.path.join(SRC, "web", b["id"] + ".json"), encoding="utf-8")):
            if "verseNumber" not in x:
                continue
            c, v = x["chapterNumber"], x["verseNumber"]
            if b["id"] == "Rom" and c == 14 and v > 23:
                c, v = 16, v + 1
            k = min(v, len(chapters[c - 1])) - 1
            chapters[c - 1][k] = (chapters[c - 1][k] + " " + x["value"].strip()).strip()
        json.dump(chapters, open(os.path.join(DATA, "text", "web", b["id"] + ".json"), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",", ":"))

books = json.load(open(os.path.join(DATA, "books.json")))
build_web(books)
print("web")
for version, source in [("bsb", "versions/BSB.json"), ("asv", "versions/ASV.json"), ("ylt", "versions/YLT.json"),
                        ("darby", "versions/Darby.json"), ("bbe", "versions/BBE.json"),
                        ("cuvt", "ChiUn.json"), ("cuvl", "versions/ChiUnL.json")]:
    build(version, source, books)
    print(version)
