# Interactive Bible

A Bible reader with two panels: the text on the left, and on the right the context for the selected verse
(cross-references, the places it names on a map, and the events it belongs to). Static site, no build step, no backend.

## Run it

```sh
python3 -m http.server 8000   # then open http://localhost:8000/#John.3.16
```

Links use OSIS-style references in the hash: `#John.3` opens a chapter, `#John.3.16` selects a verse.
Arrow keys change chapter; Esc closes the context panel.

## Data

| Path | What it holds |
| --- | --- |
| `data/books.json` | 66 books: OSIS id, English name, verse count per chapter. |
| `data/text/kjv/<id>.json` | KJV text, one array of verses per chapter. |
| `data/xref/<id>.json` | Cross-references keyed `"chapter.verse"`, each `[target, votes]`, strongest first. |
| `data/places.json` | 1,220 places as `[id, name, lon, lat, kind]`; the index is the place number. |
| `data/vctx/<id>.json` | Per verse: `places` (place numbers named in it) and `events` (`[title, year]` it belongs to). |
| `data/basemap.json` | Land, lakes and main rivers of the Bible lands for the Places map (Natural Earth, simplified). |

Rebuild with `tools/fetch_sources.sh` then `python3 tools/build_data.py`.

`atlas/` is the Bible data pack for the atlas engine (eras, events, tours, places and `manifest.json`); see
`atlas/README.md`. Rebuild its events and places with `python3 tools/build_atlas.py`.

Sources: places and events from [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata)
(CC BY-SA 4.0), the base map from Natural Earth (public domain), and the King James Version (1769), public domain, and cross-references from
[OpenBible.info](https://www.openbible.info/labs/cross-references/) (CC BY), both via
[scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases).
NKJV will replace KJV as the default once it is licensed from HarperCollins Christian Publishing; until then the
context panel links out to the verse in NKJV on Bible Gateway.
