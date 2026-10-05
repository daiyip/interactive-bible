"""Build the Hebrew and Greek word data: which original word stands behind each word of the KJV.

data/strongs/<book>.json maps "chapter.verse" to [[i, n], ...]: the i-th word of the verse (counting words as the
app does, see WORD below) translates Strong's number n (Hebrew in the Old Testament, Greek in the New), or a list of
numbers when the word carries more than one. data/lexicon/H72.json holds Strong's entries H7200-H7299 (and so on) as
{"7225": [lemma, transliteration, pronunciation, definition, part of speech]}.

The tagging is MetaV's word-level KJV (CC BY-SA 3.0, its Strong's dictionary from openscriptures/strongs); its words
are matched to this site's KJV text one by one, allowing for apostrophes, hyphens and capitals that differ.

Usage: sh tools/fetch_sources.sh (once), then python3 tools/build_strongs.py
"""
import csv, collections, difflib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools/src/metav"
# A word as the app counts them (Intl.Segmenter keeps "brother’s" whole and splits "Tubal-cain").
WORD = re.compile(r"[^\W\d_]+(?:['’][^\W\d_]+)*")
key = lambda w: w.lower().replace("’", "'")

books = json.loads((ROOT / "data/books.json").read_text())
strongs = collections.defaultdict(list)
for r in csv.DictReader(open(SRC / "StrongsIndex.csv")):
    strongs[int(r["WordID"])].append(r["StrongsID"])
words = collections.defaultdict(list)  # (book, chapter, verse) -> [(word, [numbers])]
for r in csv.DictReader(open(SRC / "MainIndex.csv")):
    for part in re.split(r"-", r["Word"]):  # MetaV keeps "Tubal-cain" as one word; the tag goes on its last part
        words[int(r["BookID"]), int(r["Chapter"]), int(r["VerseNum"])].append([part, []])
    words[int(r["BookID"]), int(r["Chapter"]), int(r["VerseNum"])][-1][1] = strongs.get(int(r["WordID"]), [])

out_dir = ROOT / "data/strongs"
out_dir.mkdir(exist_ok=True)
tagged = matched = 0
used = set()
for bi, b in enumerate(books):
    text = json.loads((ROOT / f"data/text/kjv/{b['id']}.json").read_text())
    out = {}
    for ci, chapter in enumerate(text):
        for vi, verse in enumerate(chapter):
            ours = [key(w) for w in WORD.findall(verse or "")]
            theirs = words.get((bi + 1, ci + 1, vi + 1), [])
            tags = []
            sm = difflib.SequenceMatcher(None, ours, [key(w) for w, _ in theirs], autojunk=False)
            for a, j, size in sm.get_matching_blocks():
                for k in range(size):
                    nums = theirs[j + k][1]
                    if nums:
                        ns = [int(n[1:]) for n in nums]
                        used.update(n[0] + n[1:] for n in nums)
                        tags.append([a + k, ns[0] if len(ns) == 1 else ns])
            tagged += sum(1 for _, n in theirs if n)
            matched += len(tags)
            if tags:
                out[f"{ci + 1}.{vi + 1}"] = tags
    (out_dir / f"{b['id']}.json").write_text(json.dumps(out, separators=(",", ":")))
print(f"{matched} of {tagged} tagged words matched to the text ({100 * matched / tagged:.2f}%)")

# Strong's entries, in files of a hundred.
lex_dir = ROOT / "data/lexicon"
lex_dir.mkdir(exist_ok=True)
chunks = collections.defaultdict(dict)
for r in csv.DictReader(open(SRC / "Strongs.csv")):
    sid = r["StrongsID"].strip()
    m = re.fullmatch(r"([HG])(\d+)", sid)
    if not m:
        continue
    n = int(m[2])
    desc = re.sub(r"\s+", " ", r["description"]).strip()
    chunks[m[1] + str(n // 100)][str(n)] = [r["lemma"].strip(), r["xlit"].strip(), r["pronounce"].strip(), desc,
                                            r["PartOfSpeech"].strip()]
for name, entries in chunks.items():
    (lex_dir / f"{name}.json").write_text(json.dumps(entries, ensure_ascii=False, separators=(",", ":")))
missing = [s for s in used if s[1:] not in chunks.get(s[0] + str(int(s[1:]) // 100), {})]
print(f"{len(chunks)} lexicon files; {len(missing)} numbers used in the text have no entry: {sorted(missing)[:20]}")
