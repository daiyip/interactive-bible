"""Build data/lands.json: the land of Canaan as Joshua divides it (Joshua 13-21), as a tree of regions, tribes and
towns. Each town is a place index into data/places.json with the verse that names it, taken from the verse-to-place
links in data/vctx/Josh.json, so the tree lists exactly the places the text names in each passage.

Usage: python3 tools/build_names.py && python3 tools/build_lands.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ctx = json.loads((ROOT / "data/vctx/Josh.json").read_text())["places"]
places = json.loads((ROOT / "data/places.json").read_text())
# One spot under several names (Luz and Bethel, Kirjath-sepher and Debir) is listed once, under its main entry.
MAIN = {i: ids[0] for ids, _ in json.loads((ROOT / "data/names.json").read_text()) for i in ids}

# Each group: (id, English name, Chinese name, chapter, first verse, last verse) or a list of sub-groups.
TREE = [
    ("east", "East of the Jordan", "约旦河东", [
        ("reuben", "Reuben", "流便", 13, 15, 23),
        ("gad", "Gad", "迦得", 13, 24, 28),
        ("manasseh-e", "Half tribe of Manasseh", "玛拿西半支派", 13, 29, 31),
    ]),
    ("west", "West of the Jordan", "约旦河西", [
        ("judah", "Judah", "犹大", [
            ("judah-border", "Borders", "边界", 15, 1, 12),
            ("judah-caleb", "Caleb's portion", "迦勒的地业", 15, 13, 19),
            ("judah-south", "The south (Negev)", "南地", 15, 21, 32),
            ("judah-valley", "The lowland (Shephelah)", "高原", 15, 33, 47),
            ("judah-hills", "The hill country", "山地", 15, 48, 60),
            ("judah-wild", "The wilderness", "旷野", 15, 61, 63),
        ]),
        ("ephraim", "Ephraim", "以法莲", 16, 1, 10),
        ("manasseh-w", "Manasseh", "玛拿西", 17, 1, 18),
        ("benjamin", "Benjamin", "便雅悯", 18, 11, 28),
        ("simeon", "Simeon", "西缅", 19, 1, 9),
        ("zebulun", "Zebulun", "西布伦", 19, 10, 16),
        ("issachar", "Issachar", "以萨迦", 19, 17, 23),
        ("asher", "Asher", "亚设", 19, 24, 31),
        ("naphtali", "Naphtali", "拿弗他利", 19, 32, 39),
        ("dan", "Dan", "但", 19, 40, 48),
    ]),
    ("levi", "The Levites' cities", "利未人的城", [
        ("refuge", "Cities of refuge", "逃城", 20, 7, 8),
        ("aaron", "Aaron's family (Kohath)", "亚伦的子孙（哥辖）", 21, 9, 19),
        ("kohath", "The rest of Kohath", "哥辖其余的子孙", 21, 20, 26),
        ("gershon", "Gershon", "革顺", 21, 27, 33),
        ("merari", "Merari", "米拉利", 21, 34, 40),
    ]),
]


def towns(c, a, z):
    seen, out = set(), []
    for v in range(a, z + 1):
        for i in ctx.get(f"{c}.{v}", []):
            i = MAIN.get(i, i)
            if i not in seen:
                seen.add(i)
                out.append([i, f"{c}.{v}"])
    return out


def node(g):
    if isinstance(g[3], list):
        kids = [node(k) for k in g[3]]
        return {"id": g[0], "name": g[1], "zh": g[2], "kids": kids}
    c, a, z = g[3], g[4], g[5]
    return {"id": g[0], "name": g[1], "zh": g[2], "ref": f"Josh.{c}.{a}-Josh.{c}.{z}", "towns": towns(c, a, z)}


tree = {"id": "canaan", "name": "Land of Canaan", "zh": "迦南地", "kids": [node(g) for g in TREE]}
(ROOT / "data/lands.json").write_text(json.dumps(tree, ensure_ascii=False, separators=(",", ":")))


def show(n, d=0):
    t = n.get("towns")
    print("  " * d + n["name"], len(t) if t else "", ", ".join(places[i][1] for i, _ in (t or []))[:150])
    for k in n.get("kids", []):
        show(k, d + 1)


if __name__ == "__main__":
    show(tree)
