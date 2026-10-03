# Interactive Bible

**Live at [bible.daiyip.com](https://bible.daiyip.com)**

A Bible reader with the context of every verse beside it. The text is on the left. Selecting a verse opens a panel
on the right with four tabs:

- **Cross-references**: the verses most often linked to this one, strongest first.
- **People**: everyone the verse names. Open a person for a short biography, their family (each one a link), and
  every verse that names them; the card stays open as you walk through those verses.
- **Places**: the [atlas](https://atlas.daiyip.com) map with the places the verse names pinned, and the events it
  belongs to. The map is the atlas itself, embedded with this site's pack; a small built-in map stands in while it
  loads.
- **Links**: the verse in NKJV on Bible Gateway, other translations side by side, and a Wikipedia search.

**Tours** walk through a journey one step at a time, with no verse to pick first: Abraham, Joseph, the Exodus,
David, Elijah, Jonah, the exile and return, Jesus, and Paul's journeys. Open them from **Tours** in the top bar, or
from the list in the empty context panel. Each step opens its verses and flies the map to it, tracing the journey;
stepping on the map moves the reader along too.

**Search** (the magnifier, or `/`) finds references ("John 3:16", "约翰福音 3"), books, people, places, events, tours
and words in the text.

**Translations**: the switch in the top bar picks the King James Version, 和合本 (the Chinese Union Version, in
simplified characters), or both side by side, verse by verse. With 和合本 first, the whole app is in Chinese: book
names, people, places, events, tours and the atlas map.

It is a static site with no build step and no backend, served by GitHub Pages.

## The Bible on the atlas

`atlas/` is the Bible Lands data pack for the [atlas](https://atlas.daiyip.com) engine. It holds 298 events,
1,220 places, 11 eras and 11 tours (the same tours as the reader).
Open it on the atlas map and timeline:

- [Alongside the atlas's own history](https://atlas.daiyip.com/?pack=https://bible.daiyip.com/atlas/manifest.json)
- [On its own](https://atlas.daiyip.com/?pack=https://bible.daiyip.com/atlas/manifest.json&packonly=1)

Every event and tour step links back to its verses here. See [`atlas/README.md`](atlas/README.md) for the files.

## Links

References use OSIS-style ids in the hash:

| Link | Opens |
| --- | --- |
| [`#John.3`](https://bible.daiyip.com/#John.3) | a chapter |
| [`#John.3.16`](https://bible.daiyip.com/#John.3.16) | a chapter with a verse selected |
| [`#Acts.13.4-5`](https://bible.daiyip.com/#Acts.13.4-5) | a range of verses, with the first one selected (the links from the atlas look like this) |

The arrow keys change chapter, `/` opens search, and Esc closes the context panel.

## Run it locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000/#John.3.16
```

## Data

| Path | What it holds |
| --- | --- |
| `data/books.json` | 66 books: OSIS id, English and Chinese name, verse count per chapter. |
| `data/text/kjv/<id>.json` | KJV text, one array of verses per chapter. |
| `data/text/cuv/<id>.json` | 和合本 text in simplified characters, on the KJV's verse numbers. |
| `data/xref/<id>.json` | Cross-references keyed `"chapter.verse"`, each `[target, votes]`, strongest first. |
| `data/people.json` | 3,067 people as `[name, name_zh, gender, father, mother, [partners], [children], [siblings], verse count, first verse, other names]`; the index is the person number, and family members are person numbers. |
| `data/people/<n>.json` | For persons `n×256` to `n×256+255`: `[biography, [verses]]`, loaded when a person is opened. |
| `data/places.json` | 1,220 places as `[id, name, lon, lat, kind, name_zh]`; the index is the place number. |
| `data/vctx/<id>.json` | Per verse: `places` and `people` (place and person numbers named in it), and `events` (`[title, year, title_zh]` it belongs to). |
| `data/search.json` | For the search box: every place and event with its Chinese name, first verse and verse count. |
| `data/basemap.json` | Land, lakes and main rivers of the Bible lands for the Places map (Natural Earth, simplified). |
| `atlas/` | The atlas data pack (see above). |

To rebuild, run `tools/fetch_sources.sh` to download the sources into `tools/src/`. Then run
`python3 tools/build_data.py` for `data/` and `python3 tools/build_atlas.py` for the pack's events and places.

## Translation

The English text is the King James Version for now. NKJV will become the default once it is licensed from HarperCollins
Christian Publishing. Until then, the Links tab opens each verse in NKJV on Bible Gateway. The text layer is one
folder per translation (`data/text/<translation>/`), so adding one does not change the reader.

## Sources and licences

- **King James Version (1769)** and **和合本**: public domain, via
  [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases).
- **Cross-references** from [OpenBible.info](https://www.openbible.info/labs/cross-references/): CC BY.
- **People, places and events** from [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata):
  CC BY-SA 4.0. Biographies are the opening of each person's entry in Easton's Bible Dictionary (1897, public domain). The `atlas/` pack is shared under CC BY-SA 4.0 too.
- **Base map** from [Natural Earth](https://www.naturalearthdata.com/): public domain.

Years follow a traditional chronology, with the Exodus in 1490 BC; many scholars date the early periods later. The
tours were drafted with AI from the biblical text, and the Chinese names of places and events (`tools/atlas_zh.json`,
和合本 spellings) and of people (`tools/people_zh.json`) were drafted with AI from the 和合本 verses that name them.
