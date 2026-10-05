<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="img/logo-white.svg">
    <img src="img/logo.svg" width="112" alt="Interactive Bible logo: an open book with lines of text on both pages">
  </picture>
</p>

# Interactive Bible

**Live at [bible.daiyip.com](https://bible.daiyip.com)**

A Bible reader with the context of every verse beside it. The text is on the left. Selecting a verse opens a panel
on the right with four tabs. Tapping another verse grows the selection to reach it, and the tabs then cover every
verse in it. Tapping a selected verse lets go of it (one in the middle takes the verses after it along, since a
selection has no gaps), and × closes the panel. On a phone the panel is a sheet over the bottom of the text: drag or tap
its handle to make it taller or shorter, and scrolling the text lowers it to a strip so the verses stay in reach.

- **Cross-references**: the verses most often linked to this one, strongest first, as a list or as a web: the verse
  in the middle and its 12 strongest links around it in Bible order, sized by votes, with faint lines between the
  ones that link to each other. Tapping one moves there and redraws the web.
- **People**: everyone the verse names. Open a person for a short biography, their family (each one a link), and
  every verse that names them; the card stays open as you walk through those verses.
- **Places**: the [atlas](https://atlas.daiyip.com) map with the places the verse names pinned, and the events it
  belongs to. The map is the atlas itself, embedded with this site's pack; a small built-in map stands in while it
  loads.
- **Links**: the verse in NKJV on Bible Gateway, other translations side by side, and a Wikipedia search.

**Tours** walk through a journey one step at a time, with no verse to pick first: Abraham, Joseph, the Exodus,
David, Elijah, Jonah, the exile and return, Jesus, and Paul's journeys. Open them from **Tours** in the dock (the floating buttons at the bottom of the text), or
from the list in the empty context panel. Each step opens its verses and flies the map to it, tracing the journey;
stepping on the map moves the reader along too. **Play** runs a tour by itself: each step stays long enough to read its note (a
bar shows how long), its verses light up one after another, and the map traces the leg from the last stop. Tapping
a verse or Pause stops it.

**Verse card**: **Card**, under the selected verse, draws a picture to share (1080×1350, light or dark): the verse
over a map of the places it names (or its chapter's, or the Holy Land), with the reference and the site. Phones
share it straight to an app; elsewhere it downloads as a PNG.

**Word study**: every word of the selected verse, in the context panel, can be tapped. It opens every verse of that
translation that uses the word, with a bar for each book from Genesis to Revelation (tap one to keep that book's
verses) and the books that use it most. English matches the whole word, ignoring case; 和合本 has no spaces, so the
browser splits the verse into words and the study offers the shorter words inside the one tapped (神爱世人, 神爱,
爱, …).

**Search** (the magnifier, or `/`) finds references ("John 3:16", "约翰福音 3"), books, people, places, events, tours
and words in the text.

**Translations**: the switch in the top bar picks the King James Version, 和合本 (the Chinese Union Version, in
simplified characters), or both side by side, verse by verse. With 和合本 first, the whole app is in Chinese: book
names, people, places, events, tours and the atlas map.

**Timeline** (in the dock): a card above the dock that runs through the eras of the Bible, from the beginnings in Genesis to the
early church, and marks the year of the chapter or verse being read. Each era opens a card with its dates, a summary,
the chapters set in it (book by book), its events, and a link to that time on the atlas map. The eras are the atlas
pack's (`atlas/eras.json`), shown at equal widths so the short ones can be tapped.

**My reading** (in the dock) holds three things, all kept in the browser with nothing sent anywhere:

- **Plan**: the Bible in a year, Genesis to Revelation in 365 days of whole chapters, each day about the same
  length. It shows today's chapters, how far along you are, and what to catch up on. A chapter counts as read once
  you reach its end, or tick it off by hand. Today's reading also sits in the empty context panel.
- **Highlights**: the verses you have coloured (yellow, green, blue or pink) or written a note on, in Bible order.
  Colour a verse or add a note under its text in the context panel. **Export** saves the plan, highlights and notes
  to a file; **Import** merges one back, for moving to another browser.
- **Offline**: every chapter you open stays readable offline. **Save for offline** keeps the rest of the Bible in
  the current translation too (about 13 MB, or 17 MB for both). Add the site to the home screen to use it as an
  app. The atlas map needs a connection; offline, the small built-in map stands in.

It is a static site with no build step and no backend, served by GitHub Pages. `sw.js` is the service worker that
keeps it working offline, and `manifest.webmanifest` makes it installable.

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
| [`#Acts.13.4-5`](https://bible.daiyip.com/#Acts.13.4-5) | a range of verses, all selected (the links from the atlas look like this) |

The arrow keys change chapter, `/` opens search, and Esc closes the context panel.

## Run it locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000/#John.3.16
```

## Logo

`img/logo.svg` (black) and `img/logo-white.svg` (white) are the logo: an open book, one page solid and one open, each
with three lines of text, drawn in the same line style as the atlas's folded map. `img/favicon.svg` is the browser icon (it turns white in dark mode), with
`img/icon-32.png` and `img/icon-180.png` for browsers and phones that need a PNG.

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
| `data/vctx/<id>.json` | Per verse: `places` and `people` (place and person numbers named in it), `events` (`[title, year, title_zh]` it belongs to), and `years` (the year of each chapter, and of each verse that differs from it), which set the map's year and the timeline mark. A verse's year is that of its first event lasting under two years, else Theographic's year for the verse. |
| `data/timeline.json` | For each era of `atlas/eras.json` (plus `before` for Genesis 1–11): the chapters set in it as `[book, first chapter, last chapter]` runs. |
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
