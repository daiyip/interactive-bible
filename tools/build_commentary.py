"""Builds data/commentary/ from Matthew Henry's Concise Commentary (public domain).

The text comes from the CrossWire SWORD module MHCC (Ubuntu package sword-comm-mhcc, which ships it), read with
diatheke. The module's .conf says zCom4, but its files are zCom, so fix that first:

    apt-get download sword-comm-mhcc && dpkg-deb -x sword-comm-mhcc_*.deb pkg
    mkdir -p ~/.sword && cp -r pkg/usr/share/sword/* ~/.sword/
    sed -i 's/ModDrv=zCom4/ModDrv=zCom/' ~/.sword/mods.d/mhcc.conf
    apt-get install diatheke && python3 tools/build_commentary.py

<book>.json  {"intro": [paragraph, ...], "ch": [{"o": [[title, from, to], ...], "s": [[from, to, [paragraph, ...]], ...]}, ...]}
             one entry per chapter: its outline from the commentary, and its sections, each on a run of verses.
             A paragraph marks a reference as {text|Osis.ref}.
"""
import html, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "data", "commentary")
books = json.load(open(os.path.join(ROOT, "data", "books.json")))
IDS = {b["id"] for b in books}

ENTRY = re.compile(r"^.+? (\d+):(\d+): ", re.M)
HEAD = re.compile(r'<hi type="bold">\s*Verses?\s+(\d+)(?:\s*[-–,]\s*(\d+))?[^<]*</hi>')
ROW = re.compile(r"<row><cell>(.*?)</cell><cell>\s*\((\d+)(?:\s*[-–,]\s*(\d+))?\)?\s*</cell></row>", re.S)
# References the module left as plain text ("Mal 2:10", "Rev. 14:10,11", "(Joel 1:8-13)"): Henry's abbreviations.
ABBR = {b["name"].lower().replace(" ", ""): b["id"] for b in books}
ABBR.update({b["id"].lower(): b["id"] for b in books})
ABBR.update({"is": "Isa", "jr": "Jer", "ezek": "Ezek", "eze": "Ezek", "he": "Heb", "psa": "Ps", "ps": "Ps", "joh": "John",
             "eccl": "Eccl", "ec": "Eccl", "dn": "Dan", "da": "Dan", "ro": "Rom", "mt": "Matt", "re": "Rev", "pr": "Prov",
             "lu": "Luke", "ge": "Gen", "ex": "Exod", "de": "Deut", "nu": "Num", "ep": "Eph", "ac": "Acts", "php": "Phil",
             "zec": "Zech", "le": "Lev", "jas": "Jas", "james": "Jas", "jos": "Josh", "ga": "Gal", "mr": "Mark", "tit": "Titus",
             "ho": "Hos", "mi": "Mic", "am": "Amos", "ha": "Hab", "so": "Song", "la": "Lam", "ezr": "Ezra", "zep": "Zeph",
             "jdg": "Judg", "1co": "1Cor", "2co": "2Cor", "1pe": "1Pet", "2pe": "2Pet", "1ti": "1Tim", "2ti": "2Tim",
             "1jo": "1John", "2jo": "2John", "3jo": "3John", "1ki": "1Kgs", "2ki": "2Kgs", "1ch": "1Chr", "2ch": "2Chr",
             "1sa": "1Sam", "2sa": "2Sam", "1th": "1Thess", "2th": "2Thess", "mal": "Mal", "col": "Col", "heb": "Heb",
             "rev": "Rev", "matt": "Matt", "gal": "Gal", "rom": "Rom", "eph": "Eph", "deut": "Deut", "hos": "Hos", "1kin": "1Kgs", "2kin": "2Kgs", "1pet": "1Pet", "2pet": "2Pet"})
PLAIN = re.compile(r"\b((?:I{1,3} |[1-3] ?)?[A-Z][a-z]{0,12})\.? (\d+):(\d+)(?:[-,](\d+))?")
NCH = {b["id"]: b["chapters"] for b in books}


def link_plain(s):
    def one(m):
        name = re.sub(r"^(I{1,3}) ", lambda n: str(len(n.group(1))), m.group(1))
        b = ABBR.get(name.lower().replace(" ", ""))
        c, v, z = int(m.group(2)), int(m.group(3)), m.group(4)
        if not b or c > len(NCH[b]) or v > NCH[b][c - 1]:
            return m.group(0)
        r = f"{b}.{c}.{v}" + (f"-{z}" if z and int(z) > v else "")
        return f"{{{m.group(0)}|{r}}}"
    return "".join(part if part.startswith("{") else PLAIN.sub(one, part) for part in re.split(r"(\{[^}]*\})", s))


REF = re.compile(r'<reference osisRef="([^"]+)"[^>]*>(.*?)</reference>', re.S)


def entries(book, c):
    """The chapter's distinct entries, in order: [(first verse, markup)]. Linked verses repeat an entry."""
    out = subprocess.run(["diatheke", "-b", "MHCC", "-k", f"{book} {c}"], capture_output=True, text=True).stdout
    out = out.rsplit("(MHCC)", 1)[0]
    found, last = [], None
    marks = list(ENTRY.finditer(out))
    for i, m in enumerate(marks):
        if int(m.group(1)) != c:
            continue
        body = out[m.end(): marks[i + 1].start() if i + 1 < len(marks) else len(out)].strip()
        if body and body != last:
            found.append((int(m.group(2)), body))
        last = body or last
    return found


def ref_id(osis):
    """'Phil.4.11-Phil.4.18' → 'Phil.4.11-18'; a reference to a book the app lacks (none) is dropped."""
    a, _, z = osis.partition("-")
    if a.split(".")[0] not in IDS:
        return None
    if z:
        za, aa = z.split("."), a.split(".")
        if za[:2] == aa[:2] and len(za) == 3:
            return f"{a}-{za[2]}"
        if len(za) == 3 and za[0] == aa[0]:
            return f"{a}-{z}"
    return a


def paragraphs(markup):
    def ref(m):
        r, text = ref_id(m.group(1)), re.sub(r"<[^>]+>", "", m.group(2)).strip()
        return f"{{{text}|{r}}}" if r and text else text
    s = REF.sub(ref, markup)
    s = re.sub(r'<div [^>]*type="(?:x-p|introduction)"[^>]*/>', "\n\n", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s).replace("#(", "(").replace("#", "")
    out = []
    for p in re.split(r"\n\s*\n", s):
        p = re.sub(r"\s+", " ", p).strip()
        p = link_plain(re.sub(r" ([,.;:?!)])", r"\1", p).replace("( ", "("))
        if p:
            out.append(p)
    return out


def chapter(book, c, last_verse):
    intro, outline, parts = [], [], []
    for v, body in entries(book, c):
        if '<title type="x-ms">' in body and '<title type="x-s2">' in body:  # the book's introduction, before chapter 1
            pre, sep, body = body.partition('<title type="x-s2">')
            body = sep + body
            intro = paragraphs(re.sub(r'<title type="x-ms">.*?</title>', "", pre))
        body = re.sub(r'<title type="x-ms">.*?</title>', "", body)
        body = re.sub(r'<title type="x-s2">.*?</title>|<title type="x-IS">.*?</title>', "", body)
        for m in ROW.finditer(body):
            title = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))).strip()
            outline.append([title, int(m.group(2)), int(m.group(3) or m.group(2))])
        body = re.sub(r"<table>.*?</table>", "", body, flags=re.S)
        # An entry may hold several sections, each opening "Verses 9-21".
        heads = list(HEAD.finditer(body))
        if not heads:
            parts.append([v, body])
            continue
        if paragraphs(body[: heads[0].start()]):
            parts.append([v, body[: heads[0].start()]])
        for i, h in enumerate(heads):
            parts.append([int(h.group(1)), body[h.end(): heads[i + 1].start() if i + 1 < len(heads) else len(body)]])
    sections = []
    for i, (v, body) in enumerate(parts):
        paras = paragraphs(body)
        if not paras:
            continue
        if sections and v <= sections[-1][0]:  # out of order: keep it with the section before
            sections[-1][2].extend(paras)
            continue
        sections.append([v, 0, paras])
    for i, s in enumerate(sections):
        s[1] = (sections[i + 1][0] - 1) if i + 1 < len(sections) else last_verse
    return intro, {"o": outline, "s": sections}


def main():
    os.makedirs(OUT, exist_ok=True)
    words = 0
    for b in books:
        data = {"intro": [], "ch": []}
        for c, n in enumerate(b["chapters"], 1):
            intro, ch = chapter(b["id"], c, n)
            if intro:
                data["intro"] = intro
            data["ch"].append(ch)
            words += sum(len(p.split()) for s in ch["s"] for p in s[2])
        empty = [c for c, ch in enumerate(data["ch"], 1) if not ch["s"]]
        if empty:
            print(b["id"], "no comment on chapters", empty)
        with open(os.path.join(OUT, b["id"] + ".json"), "w") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{words:,} words")


if __name__ == "__main__":
    main()
