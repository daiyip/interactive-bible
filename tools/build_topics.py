"""Builds data/topics/ from Nave's Topical Bible (public domain; CSV from BradyStephenson/bible-data, CC BY 4.0).

index.json   [[name, name_zh, verse count, file], ...]; a topic's number is its place in the list.
<k>.json     topics k*100 to k*100+99: [[depth, label, [refs]], ...] with refs as "Gen.6.16-20" or "Num.17", and a
             "See" line as [depth, label, [], topic number].
v/<book>.json  per verse "chapter.verse" (or per chapter "chapter", for refs to a whole chapter): the topics citing it.
"""
import csv, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "data", "topics")
CODES = ("GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS "
         "JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM "
         "HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV").split()
books = json.load(open(os.path.join(ROOT, "data", "books.json")))
BOOK = {code: b["id"] for code, b in zip(CODES, books)}
BOOK.update({"SOS": "Song", "SOL": "Song", "JUDE": "Jude", "1JHN": "1John", "2JHN": "2John", "3JHN": "3John"})
NCH = {b["id"]: b["chapters"] for b in books}
SMALL = set("of the and to in for by with a an on at from as upon into or his her its their our".split())
# Chinese names: written for the main topics (tools/topics_zh.json), else a person's or place's name that matches.
ZH = {}
for row in json.load(open(os.path.join(ROOT, "data", "people.json"))) + json.load(open(os.path.join(ROOT, "data", "search.json")))["places"]:
    if row[1]:
        ZH.setdefault(row[0].upper(), row[1])
ZH.update({k.upper(): v for k, v in json.load(open(os.path.join(HERE, "topics_zh.json"))).items()})

def nice(s):
    """NAVE'S CAPITALS → Title Case, keeping small words small (and "GOD' S" → "God's")."""
    s = re.sub(r"(\w)' S\b", r"\1'S", s.replace("&gt;", "").strip())
    def word(m):
        w = m.group(0)
        return w.lower() if w.lower() in SMALL else w[0] + w[1:].lower()
    out = re.sub(r"[A-Z][A-Z'\-]*[A-Z]|[A-Z]", lambda m: word(m) if m.group(0).isupper() and len(m.group(0)) > 1 else m.group(0), s)
    return out[0].upper() + out[1:] if out else out

BOOK_RE = re.compile(r"(?<![A-Za-z0-9])(" + "|".join(sorted(BOOK, key=len, reverse=True)) + r")\s+(\d)", re.I)

def parse_refs(text):
    """'EXO 6:16-20; JOS 21:4,10; 1CH 6:2,3; 23:13' → ['Exod.6.16-20', 'Josh.21.4', 'Josh.21.10', ...]."""
    refs, book = [], None
    for part in text.split(";"):
        part = part.strip().rstrip(".")
        m = re.match(r"([1-3]?[A-Za-z]{2,4})\s+(.*)$", part)
        if m and m.group(1).upper() in BOOK:
            book, part = BOOK[m.group(1).upper()], m.group(2)
        if book is None or not re.match(r"^\d", part):
            break
        m = re.match(r"^(\d+)(?::([\d,\-\s]+))?(?:-(\d+)(?::(\d+))?)?", part)
        c = int(m.group(1))
        if c > len(NCH[book]):
            continue
        if m.group(2):
            for piece in m.group(2).replace(" ", "").split(","):
                if not piece:
                    continue
                a, _, z = piece.partition("-")
                if not a.isdigit():
                    continue
                if z and ":" not in z and z.isdigit() and int(z) > int(a):
                    refs.append(f"{book}.{c}.{a}-{z}")
                else:
                    refs.append(f"{book}.{c}.{a}")
        else:
            refs.append(f"{book}.{c}")
    return refs

def main():
    rows = list(csv.DictReader(open(os.path.join(HERE, "src", "naves", "NavesTopicalDictionary.csv"), encoding="utf-8-sig")))
    names = [r["subject"].strip() for r in rows]
    by_name = {}
    for i, n in enumerate(names):
        by_name.setdefault(re.sub(r"\W+", " ", n.upper()).strip(), i)
    topics, verse_map = [], {}
    for i, r in enumerate(rows):
        entries = []
        for line in r["entry"].replace("\r", "").split("\n"):
            if not line.strip():
                continue
            depth = min(3, (len(line) - len(line.lstrip())) // 5)
            text = re.sub(r"(\w)' ([sS])\b", r"\1'\2", re.sub(r"\[\d+\]", "", line.strip().lstrip("-").strip()))
            see = re.match(r"See (.+?)\s*$", text)
            if see:
                target = by_name.get(re.sub(r"\W+", " ", see.group(1).upper()).strip())
                if target is not None and target != i:
                    entries.append([depth, nice(see.group(1)), [], target])
                continue
            m = BOOK_RE.search(text)
            label, refs = (text[:m.start()].strip(" ,;:"), parse_refs(text[m.start():])) if m else (text, [])
            entries.append([depth, nice(label) if label.isupper() or re.search(r"\b[A-Z]{3,}\b", label) else label, refs])
            for ref in refs:
                b, c, *v = ref.split(".")
                keys = [c] if not v else [f"{c}.{n}" for n in (range(int(v[0].split("-")[0]), int(v[0].split("-")[1]) + 1) if "-" in v[0] else [int(v[0])])]
                for k in keys:
                    verse_map.setdefault(b, {}).setdefault(k, set()).add(i)
        topics.append(entries)
    counts = [sum(len(e[2]) for e in es) for es in topics]
    os.makedirs(os.path.join(OUT, "v"), exist_ok=True)
    index = [[nice(n), ZH.get(n.upper(), ZH.get(re.sub(r"\s*\(.*\)$", "", n).upper(), "")), counts[i], i // 100] for i, n in enumerate(names)]
    dump = lambda path, x: json.dump(x, open(os.path.join(OUT, path), "w"), ensure_ascii=False, separators=(",", ":"))
    dump("index.json", index)
    for k in range(0, len(topics), 100):
        dump(f"{k // 100}.json", topics[k:k + 100])
    for b in NCH:
        # Each verse's topics, the most specific (fewest references) first. (Nave's has none in the Song of Solomon.)
        dump(f"v/{b}.json", {k: sorted(s, key=lambda i: counts[i]) for k, s in verse_map.get(b, {}).items()})
    print(len(index), "topics,", sum(counts), "references,", sum(1 for c in counts if not c), "without references", file=sys.stderr)

main()
