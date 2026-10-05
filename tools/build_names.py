"""Build data/names.json: places the Bible says were renamed or known by other names.

Each entry is the place (indices into data/places.json: the one data/vctx links to the anchor verse, then any other
entry for the same spot under one of its names) and its names in the order the text gives them, each with a verse that
uses it. The verses are checked against the KJV text, so a typo in a reference fails the build.

Usage: python3 tools/build_names.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
places = json.loads((ROOT / "data/places.json").read_text())
_text, _ctx = {}, {}


def verse(ref):
    b, c, v = ref.split(".")
    if b not in _text:
        _text[b] = json.loads((ROOT / f"data/text/kjv/{b}.json").read_text())
    return _text[b][int(c) - 1][int(v) - 1]


def linked(ref):
    b, c, v = ref.split(".")
    if b not in _ctx:
        _ctx[b] = json.loads((ROOT / f"data/vctx/{b}.json").read_text())["places"]
    return _ctx[b].get(f"{c}.{v}", [])


# (place name in data/places.json, anchor verse that links it, [(name, Chinese name, verse that uses or gives it), ...])
# The KJV spelling to look for in each verse is the English name before any " (" note.
NAMES = [
    ("Bethel", "Gen.28.19", [("Luz", "路斯", "Gen.28.19"), ("Beth-el", "伯特利", "Gen.28.19"), ("Beth-aven", "伯亚文", "Hos.4.15")]),
    ("Hebron", "Gen.23.2", [("Kirjath-arba", "基列亚巴", "Gen.23.2"), ("Hebron", "希伯仑", "Josh.14.15")]),
    ("Dan", "Judg.18.29", [("Laish", "拉亿", "Judg.18.29"), ("Leshem", "利善", "Josh.19.47"), ("Dan", "但", "Judg.18.29")]),
    ("Jerusalem", "Josh.18.28", [("Salem", "撒冷", "Gen.14.18"), ("Jebus", "耶布斯", "Judg.19.10"),
                                ("Jerusalem", "耶路撒冷", "Josh.18.28"), ("city of David", "大卫城", "2Sam.5.7")]),
    ("Zoar", "Gen.19.22", [("Bela", "比拉", "Gen.14.2"), ("Zoar", "琐珥", "Gen.19.22")]),
    ("Engedi", "2Chr.20.2", [("Hazazon-tamar", "哈洗逊他玛", "2Chr.20.2"), ("En-gedi", "隐基底", "2Chr.20.2")]),
    ("Debir", "Josh.15.15", [("Kirjath-sepher", "基列西弗", "Josh.15.15"), ("Kirjath-sannah", "基列萨拿", "Josh.15.49"),
                            ("Debir", "底璧", "Josh.15.15")]),
    ("Hormah", "Judg.1.17", [("Zephath", "洗法", "Judg.1.17"), ("Hormah", "何珥玛", "Judg.1.17")]),
    ("Kiriath-jearim", "Josh.15.60", [("Baalah", "巴拉", "Josh.15.9"), ("Kirjath-baal", "基列巴力", "Josh.15.60"),
                                     ("Kirjath-jearim", "基列耶琳", "Josh.15.9")]),
    ("Bethlehem", "Gen.35.19", [("Ephrath", "以法他", "Gen.35.19"), ("Beth-lehem", "伯利恒", "Gen.35.19")]),
    ("Kadesh-barnea", "Num.32.8", [("En-mishpat", "安密巴", "Gen.14.7"), ("Kadesh", "加低斯", "Gen.14.7"),
                                  ("Kadesh-barnea", "加低斯巴尼亚", "Num.32.8")]),
    ("Kenath", "Num.32.42", [("Kenath", "基纳", "Num.32.42"), ("Nobah", "挪巴", "Num.32.42")]),
    ("Sea of Galilee", "Matt.4.18", [("sea of Chinnereth", "基尼烈湖", "Num.34.11"), ("lake of Gennesaret", "革尼撒勒湖", "Luke.5.1"),
                                    ("sea of Galilee", "加利利海", "Matt.4.18"), ("sea of Tiberias", "提比哩亚海", "John.21.1")]),
    ("Salt Sea", "Gen.14.3", [("vale of Siddim", "西订谷", "Gen.14.3"), ("salt sea", "盐海", "Gen.14.3"),
                             ("sea of the plain", "亚拉巴海", "Deut.3.17")]),
    ("Acco", "Judg.1.31", [("Accho", "亚柯", "Judg.1.31"), ("Ptolemais", "多利买", "Acts.21.7")]),
    ("Beersheba", "Gen.21.31", [("Beer-sheba", "别是巴", "Gen.21.31"), ("Shebah", "示巴", "Gen.26.33")]),
    ("Lod", "1Chr.8.12", [("Lod", "罗德", "1Chr.8.12"), ("Lydda", "吕大", "Acts.9.32")]),
    ("Joppa", "Jonah.1.3", [("Japho", "约帕", "Josh.19.46"), ("Joppa", "约帕", "Jonah.1.3")]),
    ("Mount Hermon", "Deut.3.8", [("Hermon", "黑门", "Deut.3.8"), ("Sirion", "西连", "Deut.3.9"), ("Shenir", "示尼珥", "Deut.3.9"),
                                 ("Sion", "西云", "Deut.4.48")]),
    ("Mount Sinai", "Exod.19.11", [("Horeb", "何烈山", "Exod.3.1"), ("mount Sinai", "西奈山", "Exod.19.11")]),
    ("Samaria", "1Kgs.16.24", [("hill Samaria", "撒玛利亚山", "1Kgs.16.24"), ("Samaria", "撒玛利亚", "1Kgs.16.24")]),
]


def norm(s):
    return s.lower().replace("-", "").replace("\u2013", "").replace(" ", "").replace("kirjath", "kiriath")


out, bad = [], []
for current, anchor, names in NAMES:
    cand = [i for i in linked(anchor) if norm(places[i][1]).startswith(norm(current))]
    if not cand:
        cand = [i for i, p in enumerate(places) if norm(p[1]) == norm(current)][:1]
    if not cand:
        bad.append(f"{current}: no place at {anchor}")
        continue
    for name, _, ref in names:
        if norm(name) not in norm(verse(ref)):
            bad.append(f"{current}: {name!r} not in {ref}: {verse(ref)[:90]}")
    # Other entries in data/places.json for the same spot under one of these names (e.g. Sea of Chinnereth).
    here, keys = places[cand[0]], {norm(n) for n, _, _ in names}
    same = [i for i, p in enumerate(places) if i != cand[0] and norm(p[1]).split("(")[0] in keys
            and abs(p[2] - here[2]) + abs(p[3] - here[3]) < 0.3]
    out.append([[cand[0], *same], [[n, z, r] for n, z, r in names]])

if bad:
    raise SystemExit("\n".join(bad))
(ROOT / "data/names.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
for ids, ns in out:
    print([places[i][0] for i in ids], " → ".join(n for n, _, _ in ns))
