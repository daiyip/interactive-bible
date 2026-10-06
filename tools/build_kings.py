"""Build data/kings.json: the kings of the united kingdom, Israel and Judah, and the prophets of their time.

Reigns follow Edwin Thiele's chronology (The Mysterious Numbers of the Hebrew Kings), the one most Bible atlases use;
the first year includes any co-regency, so a son's reign can start before his father's ends. The verdict is the one
the book of Kings gives ("did that which was right / evil in the sight of the LORD"; David's in 1 Kings 15:5, Solomon's
in 1 Kings 11:6). Each king's account is checked
against the KJV text (his name must appear in its first verse), and is linked to his entry in data/people.json
through the people data/vctx links to that verse.

Usage: python3 tools/build_kings.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
people = json.loads((ROOT / "data/people.json").read_text())
_text, _ctx = {}, {}


def verse(ref):
    b, c, v = ref.split(".")
    if b not in _text:
        _text[b] = json.loads((ROOT / f"data/text/kjv/{b}.json").read_text())
    return _text[b][int(c) - 1][int(v) - 1]


def linked(ref):
    b, c, v = ref.split(".")
    if b not in _ctx:
        _ctx[b] = json.loads((ROOT / f"data/vctx/{b}.json").read_text())["people"]
    return _ctx[b].get(f"{c}.{v}", [])


# (kingdom, name, Chinese name, name as the first verse spells it, first year BC, last year BC, verdict,
#  account in Kings (or Samuel), account in Chronicles or None). Verdict: g right, e evil, None (Kings gives none).
KINGS = [
    ("U", "Saul", "扫罗", "Saul", 1050, 1010, None, "1Sam.9.2-1Sam.31.13", "1Chr.10.1-1Chr.10.14"),
    ("U", "David", "大卫", "David", 1010, 970, "g", "2Sam.2.1-1Kgs.2.11", "1Chr.11.1-1Chr.29.30"),
    ("U", "Solomon", "所罗门", "Solomon", 970, 931, "e", "1Kgs.1.39-1Kgs.11.43", "2Chr.1.1-2Chr.9.31"),
    ("J", "Rehoboam", "罗波安", "Rehoboam", 931, 913, "e", "1Kgs.12.1-1Kgs.14.31", "2Chr.10.1-2Chr.12.16"),
    ("J", "Abijam", "亚比央", "Abijam", 913, 911, "e", "1Kgs.15.1-1Kgs.15.8", "2Chr.13.1-2Chr.14.1"),
    ("J", "Asa", "亚撒", "Asa", 911, 870, "g", "1Kgs.15.9-1Kgs.15.24", "2Chr.14.1-2Chr.16.14"),
    ("J", "Jehoshaphat", "约沙法", "Jehoshaphat", 872, 848, "g", "1Kgs.22.41-1Kgs.22.50", "2Chr.17.1-2Chr.20.37"),
    ("J", "Jehoram", "约兰", "Jehoram", 853, 841, "e", "2Kgs.8.16-2Kgs.8.24", "2Chr.21.1-2Chr.21.20"),
    ("J", "Ahaziah", "亚哈谢", "Ahaziah", 841, 841, "e", "2Kgs.8.25-2Kgs.9.29", "2Chr.22.1-2Chr.22.9"),
    ("J", "Athaliah", "亚她利雅", "Athaliah", 841, 835, None, "2Kgs.11.1-2Kgs.11.16", "2Chr.22.10-2Chr.23.21"),
    ("J", "Joash", "约阿施", "Jehoash", 835, 796, "g", "2Kgs.11.21-2Kgs.12.21", "2Chr.24.1-2Chr.24.27"),
    ("J", "Amaziah", "亚玛谢", "Amaziah", 796, 767, "g", "2Kgs.14.1-2Kgs.14.20", "2Chr.25.1-2Chr.25.28"),
    ("J", "Uzziah (Azariah)", "乌西雅（亚撒利雅）", "Azariah", 792, 740, "g", "2Kgs.15.1-2Kgs.15.7", "2Chr.26.1-2Chr.26.23"),
    ("J", "Jotham", "约坦", "Jotham", 750, 735, "g", "2Kgs.15.32-2Kgs.15.38", "2Chr.27.1-2Chr.27.9"),
    ("J", "Ahaz", "亚哈斯", "Ahaz", 735, 715, "e", "2Kgs.16.1-2Kgs.16.20", "2Chr.28.1-2Chr.28.27"),
    ("J", "Hezekiah", "希西家", "Hezekiah", 715, 686, "g", "2Kgs.18.1-2Kgs.20.21", "2Chr.29.1-2Chr.32.33"),
    ("J", "Manasseh", "玛拿西", "Manasseh", 697, 642, "e", "2Kgs.21.1-2Kgs.21.18", "2Chr.33.1-2Chr.33.20"),
    ("J", "Amon", "亚们", "Amon", 642, 640, "e", "2Kgs.21.19-2Kgs.21.26", "2Chr.33.21-2Chr.33.25"),
    ("J", "Josiah", "约西亚", "Josiah", 640, 609, "g", "2Kgs.22.1-2Kgs.23.30", "2Chr.34.1-2Chr.35.27"),
    ("J", "Jehoahaz", "约哈斯", "Jehoahaz", 609, 609, "e", "2Kgs.23.31-2Kgs.23.34", "2Chr.36.1-2Chr.36.4"),
    ("J", "Jehoiakim", "约雅敬", "Jehoiakim", 609, 598, "e", "2Kgs.23.36-2Kgs.24.7", "2Chr.36.5-2Chr.36.8"),
    ("J", "Jehoiachin", "约雅斤", "Jehoiachin", 598, 597, "e", "2Kgs.24.8-2Kgs.24.17", "2Chr.36.9-2Chr.36.10"),
    ("J", "Zedekiah", "西底家", "Zedekiah", 597, 586, "e", "2Kgs.24.18-2Kgs.25.7", "2Chr.36.11-2Chr.36.21"),
    ("I", "Jeroboam", "耶罗波安", "Jeroboam", 931, 910, "e", "1Kgs.12.20-1Kgs.14.20", None),
    ("I", "Nadab", "拿答", "Nadab", 910, 909, "e", "1Kgs.15.25-1Kgs.15.31", None),
    ("I", "Baasha", "巴沙", "Baasha", 909, 886, "e", "1Kgs.15.33-1Kgs.16.7", None),
    ("I", "Elah", "以拉", "Elah", 886, 885, None, "1Kgs.16.8-1Kgs.16.14", None),
    ("I", "Zimri", "心利", "Zimri", 885, 885, "e", "1Kgs.16.15-1Kgs.16.20", None),
    ("I", "Omri", "暗利", "Omri", 885, 874, "e", "1Kgs.16.21-1Kgs.16.28", None),
    ("I", "Ahab", "亚哈", "Ahab", 874, 853, "e", "1Kgs.16.29-1Kgs.22.40", None),
    ("I", "Ahaziah", "亚哈谢", "Ahaziah", 853, 852, "e", "1Kgs.22.51-2Kgs.1.18", None),
    ("I", "Joram", "约兰", "Jehoram", 852, 841, "e", "2Kgs.3.1-2Kgs.9.26", None),
    ("I", "Jehu", "耶户", "Jehu", 841, 814, "e", "2Kgs.9.2-2Kgs.10.36", None),
    ("I", "Jehoahaz", "约哈斯", "Jehoahaz", 814, 798, "e", "2Kgs.13.1-2Kgs.13.9", None),
    ("I", "Jehoash", "约阿施", "Jehoash", 798, 782, "e", "2Kgs.13.10-2Kgs.13.25", None),
    ("I", "Jeroboam II", "耶罗波安二世", "Jeroboam", 793, 753, "e", "2Kgs.14.23-2Kgs.14.29", None),
    ("I", "Zachariah", "撒迦利雅", "Zachariah", 753, 753, "e", "2Kgs.15.8-2Kgs.15.12", None),
    ("I", "Shallum", "沙龙", "Shallum", 752, 752, None, "2Kgs.15.13-2Kgs.15.15", None),
    ("I", "Menahem", "米拿现", "Menahem", 752, 742, "e", "2Kgs.15.17-2Kgs.15.22", None),
    ("I", "Pekahiah", "比加辖", "Pekahiah", 742, 740, "e", "2Kgs.15.23-2Kgs.15.26", None),
    ("I", "Pekah", "比加", "Pekah", 752, 732, "e", "2Kgs.15.27-2Kgs.15.31", None),
    ("I", "Hoshea", "何细亚", "Hoshea", 732, 722, "e", "2Kgs.17.1-2Kgs.17.6", None),
]

# (kingdom they spoke to, name, Chinese name, name as the verse spells it, from BC, to BC, verse that introduces them)
PROPHETS = [
    ("U", "Samuel", "撒母耳", "Samuel", 1060, 1015, "1Sam.3.20"),
    ("U", "Nathan", "拿单", "Nathan", 1000, 970, "2Sam.7.2"),
    ("I", "Ahijah", "亚希雅", "Ahijah", 931, 910, "1Kgs.11.29"),
    ("I", "Elijah", "以利亚", "Elijah", 860, 850, "1Kgs.17.1"),
    ("I", "Elisha", "以利沙", "Elisha", 850, 795, "1Kgs.19.16"),
    ("I", "Jonah", "约拿", "Jonah", 785, 770, "2Kgs.14.25"),
    ("I", "Amos", "阿摩司", "Amos", 760, 750, "Amos.1.1"),
    ("I", "Hosea", "何西阿", "Hosea", 755, 715, "Hos.1.1"),
    ("J", "Isaiah", "以赛亚", "Isaiah", 740, 681, "Isa.1.1"),
    ("J", "Micah", "弥迦", "Micah", 735, 700, "Mic.1.1"),
    ("J", "Nahum", "那鸿", "Nahum", 663, 612, "Nah.1.1"),
    ("J", "Zephaniah", "西番雅", "Zephaniah", 640, 620, "Zeph.1.1"),
    ("J", "Jeremiah", "耶利米", "Jeremiah", 627, 586, "Jer.1.1"),
    ("J", "Huldah", "户勒大", "Huldah", 622, 622, "2Kgs.22.14"),
    ("J", "Habakkuk", "哈巴谷", "Habakkuk", 609, 598, "Hab.1.1"),
]

# Turning points drawn across the chart: (year BC, English, Chinese, verse).
EVENTS = [
    (931, "The kingdom divides", "国度分裂", "1Kgs.12.19"),
    (722, "Samaria falls to Assyria", "撒玛利亚被亚述攻陷", "2Kgs.17.6"),
    (586, "Jerusalem falls to Babylon", "耶路撒冷被巴比伦攻陷", "2Kgs.25.9"),
]

# Key events in each kingdom, marked on its column at their year: (kingdom, year BC, English, Chinese, verses, a word
# the first verse must contain). Years follow the same chronology as the reigns; most are approximate.
ACTS = [
    ("I", 931, "Golden calves at Bethel and Dan", "在伯特利和但设立金牛犊", "1Kgs.12.28-1Kgs.12.30", "calves"),
    ("J", 926, "Shishak plunders the temple", "示撒掠夺圣殿", "1Kgs.14.25-1Kgs.14.28", "Shishak"),
    ("J", 912, "Abijah defeats Jeroboam", "亚比雅大败耶罗波安", "2Chr.13.13-2Chr.13.18", "Jeroboam"),
    ("J", 896, "Asa renews the covenant", "亚撒带领百姓重新立约", "2Chr.15.8-2Chr.15.15", "Asa"),
    ("I", 880, "Omri builds Samaria", "暗利建造撒玛利亚", "1Kgs.16.24-1Kgs.16.24", "Samaria"),
    ("I", 860, "Elijah on Mount Carmel", "以利亚在迦密山", "1Kgs.18.20-1Kgs.18.40", "Carmel"),
    ("I", 853, "Ahab dies at Ramoth-gilead", "亚哈死在基列拉末", "1Kgs.22.29-1Kgs.22.38", "Ramoth"),
    ("J", 853, "Jehoshaphat's singers before the army", "约沙法派歌唱的人走在军前", "2Chr.20.20-2Chr.20.24", "Jehoshaphat"),
    ("I", 841, "Jehu's revolt at Jezreel", "耶户在耶斯列起事", "2Kgs.9.24-2Kgs.9.33", "Jehu"),
    ("J", 835, "Joash crowned, Athaliah killed", "约阿施登基，亚她利雅被杀", "2Kgs.11.12-2Kgs.11.16", "king"),
    ("J", 812, "Joash repairs the temple", "约阿施修理圣殿", "2Kgs.12.9-2Kgs.12.14", "Jehoiada"),
    ("I", 797, "Elisha dies", "以利沙去世", "2Kgs.13.20-2Kgs.13.21", "Elisha"),
    ("J", 790, "Israel breaks Jerusalem's wall", "以色列拆毁耶路撒冷的城墙", "2Kgs.14.11-2Kgs.14.14", "Jehoash"),
    ("I", 760, "Amos preaches at Bethel", "阿摩司在伯特利说预言", "Amos.7.10-Amos.7.17", "Bethel"),
    ("J", 750, "Uzziah struck with leprosy", "乌西雅长了大麻风", "2Chr.26.19-2Chr.26.21", "Uzziah"),
    ("J", 740, "Isaiah's vision in the temple", "以赛亚在殿中见异象", "Isa.6.1-Isa.6.8", "Uzziah"),
    ("I", 733, "Assyria takes Galilee", "亚述夺取加利利", "2Kgs.15.29-2Kgs.15.29", "Tiglathpileser"),
    ("J", 732, "Ahaz copies the Damascus altar", "亚哈斯仿造大马士革的坛", "2Kgs.16.10-2Kgs.16.16", "Damascus"),
    ("J", 715, "Hezekiah cleanses the temple", "希西家洁净圣殿", "2Chr.29.3-2Chr.29.5", "doors"),
    ("J", 701, "Sennacherib turned back from Jerusalem", "西拿基立在耶路撒冷城外败退", "2Kgs.19.32-2Kgs.19.36", "Assyria"),
    ("J", 648, "Manasseh repents in Babylon", "玛拿西在巴比伦悔改", "2Chr.33.11-2Chr.33.13", "Manasseh"),
    ("J", 622, "The book of the law found", "发现律法书", "2Kgs.22.8-2Kgs.23.3", "law"),
    ("J", 609, "Josiah killed at Megiddo", "约西亚死在米吉多", "2Kgs.23.29-2Kgs.23.30", "Josiah"),
    ("J", 605, "Daniel taken to Babylon", "但以理被掳到巴比伦", "Dan.1.1-Dan.1.6", "Nebuchadnezzar"),
    ("J", 597, "Jehoiachin taken to Babylon", "约雅斤被掳到巴比伦", "2Kgs.24.12-2Kgs.24.16", "Jehoiachin"),
]


def norm(s):
    return s.lower().replace("-", "").replace("–", "")


def person(name, ref, father=None):
    """The person the verse names: by main name, else a son of the previous king by that name, else by other name."""
    main = lambda i: norm(people[i][0].split(" (")[0]) == norm(name)
    here = linked(ref.split("-")[0])
    for i in here:
        if main(i):
            return i
    if father is not None:
        for i in range(len(people)):
            if main(i) and people[i][3] == father:
                return i
    for i in here:
        if norm(name) in map(norm, (people[i][10] or "").split(",")):
            return i
    return None


bad, kings, prophets = [], [], []
for k, name, zh, spelt, a, z, verdict, ref, chr_ in KINGS:
    first = ref.split("-")[0]
    if norm(spelt) not in norm(verse(first)):
        bad.append(f"{name}: {spelt!r} not in {first}: {verse(first)[:100]}")
    for r in filter(None, [ref, chr_]):
        for end in r.split("-"):
            verse(end)  # a reference past the end of a chapter fails here
    prev = next((row[-1] for row in reversed(kings) if row[0] == k), None)
    kings.append([k, name, zh, -a, -z, verdict, ref, chr_, person(spelt, ref, prev)])
for k, name, zh, spelt, a, z, ref in PROPHETS:
    if norm(spelt) not in norm(verse(ref)):
        bad.append(f"{name}: {spelt!r} not in {ref}")
    prophets.append([k, name, zh, -a, -z, ref, person(spelt, ref)])
for y, en, zh, ref in EVENTS:
    verse(ref)
for k, y, en, zh, ref, word in ACTS:
    a, z = ref.split("-")
    verse(z)
    if norm(word) not in norm(verse(a)):
        bad.append(f"{en}: {word!r} not in {a}: {verse(a)[:100]}")
if bad:
    raise SystemExit("\n".join(bad))

out = {"kings": kings, "prophets": prophets, "events": [[-y, en, zh, ref] for y, en, zh, ref in EVENTS],
       "acts": [[k, -y, en, zh, ref] for k, y, en, zh, ref, word in ACTS]}
(ROOT / "data/kings.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
for row in kings + prophets:
    print(row[0], row[1], row[3], row[4], row[-1], people[row[-1]][0] if row[-1] is not None else "-- no person")
