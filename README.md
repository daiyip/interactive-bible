# Interactive Bible

**Live at [bible.daiyip.com](https://bible.daiyip.com)**

A Bible reader with the context of every verse beside it. The text is on the left. Selecting a verse opens a panel
on the right with three tabs:

- **Cross-references**: the verses most often linked to this one, strongest first.
- **Places**: a map of the places the verse names, and the events it belongs to.
- **Links**: the verse in NKJV on Bible Gateway, other translations side by side, and a Wikipedia search.

**Tours** walk through a journey one step at a time, with no verse to pick first: Abraham, Joseph, the Exodus,
David, Elijah, Jonah, the exile and return, Jesus, and Paul's journeys. Open them from **Tours** in the top bar, or
from the list in the empty context panel. Each step opens its verses and links to the same step on the atlas map.

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

The arrow keys change chapter, and Esc closes the context panel.

## Run it locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000/#John.3.16
```

## Data

| Path | What it holds |
| --- | --- |
| `data/books.json` | 66 books: OSIS id, English name, verse count per chapter. |
| `data/text/kjv/<id>.json` | KJV text, one array of verses per chapter. |
| `data/xref/<id>.json` | Cross-references keyed `"chapter.verse"`, each `[target, votes]`, strongest first. |
| `data/places.json` | 1,220 places as `[id, name, lon, lat, kind]`; the index is the place number. |
| `data/vctx/<id>.json` | Per verse: `places` (place numbers named in it) and `events` (`[title, year]` it belongs to). |
| `data/basemap.json` | Land, lakes and main rivers of the Bible lands for the Places map (Natural Earth, simplified). |
| `atlas/` | The atlas data pack (see above). |

To rebuild, run `tools/fetch_sources.sh` to download the sources into `tools/src/`. Then run
`python3 tools/build_data.py` for `data/` and `python3 tools/build_atlas.py` for the pack's events and places.

## Translation

The text is the King James Version for now. NKJV will become the default once it is licensed from HarperCollins
Christian Publishing. Until then, the Links tab opens each verse in NKJV on Bible Gateway. The text layer is one
folder per translation (`data/text/<translation>/`), so adding one does not change the reader.

## Sources and licences

- **King James Version (1769)** and **和合本**: public domain, via
  [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases).
- **Cross-references** from [OpenBible.info](https://www.openbible.info/labs/cross-references/): CC BY.
- **Places and events** from [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata):
  CC BY-SA 4.0. The `atlas/` pack is shared under CC BY-SA 4.0 too.
- **Base map** from [Natural Earth](https://www.naturalearthdata.com/): public domain.

Years follow a traditional chronology, with the Exodus in 1490 BC; many scholars date the early periods later. The
tours were drafted with AI from the biblical text.
