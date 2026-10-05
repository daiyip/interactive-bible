"""Builds data/harmony.json, a harmony of the Gospels, from tools/harmony.txt (written for this app, after the order of
the classic harmonies). Each line is: part | title | Chinese title | Matthew | Mark | Luke | John, references as
"3:13-17", "5:1-7:29" or several joined by "; ". Every reference is checked against the KJV text.

harmony.json: {"parts": [[name, name_zh], ...], "sections": [[part, title, title_zh, [Matthew refs], [Mark refs],
[Luke refs], [John refs]], ...]}, refs as "Matt.3.13-17" or "Matt.5.1-Matt.7.29" (across chapters).
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
GOSPELS = ["Matt", "Mark", "Luke", "John"]
PARTS_ZH = {"Beginnings": "降生与童年", "Preparation": "预备", "Early ministry": "早期的事工", "Galilee": "在加利利",
            "Withdrawals": "退到外邦地区", "Later ministry": "往耶路撒冷的路上", "Last week": "最后一周",
            "Passion": "受难", "Risen": "复活"}

def main():
    text = {b: json.load(open(os.path.join(ROOT, "data", "text", "kjv", f"{b}.json"))) for b in GOSPELS}
    def has(b, c, v):
        return 0 < c <= len(text[b]) and 0 < v <= len(text[b][c - 1])
    parts, sections, bad = [], [], []
    for line in open(os.path.join(HERE, "harmony.txt"), encoding="utf-8"):
        if not line.strip() or line.startswith("#"):
            continue
        part, title, zh, *refs = [x.strip() for x in line.split("|")]
        if part not in [p[0] for p in parts]:
            parts.append([part, PARTS_ZH[part]])
        out = []
        for b, cell in zip(GOSPELS, refs):
            got = []
            for r in filter(None, (x.strip() for x in cell.split(";"))):
                m = re.fullmatch(r"(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?", r)
                if not m:
                    bad.append((title, b, r)); continue
                c, v = int(m[1]), int(m[2])
                c2, v2 = int(m[3] or c), int(m[4] or v)
                if not has(b, c, v) or not has(b, c2, v2) or (c2, v2) < (c, v):
                    bad.append((title, b, r)); continue
                got.append(f"{b}.{c}.{v}" + ("" if (c2, v2) == (c, v) else f"-{v2}" if c2 == c else f"-{b}.{c2}.{v2}"))
            out.append(got)
        sections.append([[p[0] for p in parts].index(part), title, zh, *out])
    if bad:
        sys.exit(f"bad references: {bad}")
    json.dump({"parts": parts, "sections": sections}, open(os.path.join(ROOT, "data", "harmony.json"), "w"),
              ensure_ascii=False, separators=(",", ":"))
    print(len(sections), "sections", file=sys.stderr)

main()
