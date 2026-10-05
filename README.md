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
  every verse that names them; the card stays open as you walk through those verses. **Family tree** shows them
  from their grandparents down to their grandchildren as a foldable outline, under their whole line back; tapping a
  name redraws the tree around that person.
- **Places**: the [atlas](https://atlas.daiyip.com) map with the places the verse names pinned, and the events it
  belongs to. The map is the atlas itself, embedded with this site's pack; a small built-in map stands in while it
  loads. Places the Bible renames show their other names (Luz and Bethel, Jebus and Jerusalem), each linked to its
  verse. **Land of Canaan** opens the land as Joshua 13–21 divides it: east and west of the Jordan, the tribes (Judah
  by district), and the Levites' cities, each place with its verse, beside a map that pins the tribe you pick.
- **Links**: the verse in NKJV on Bible Gateway, other translations side by side, and a Wikipedia search.

The panel shows only what the selected verses hold. **Context**, first in the dock (or the button in the empty panel) opens
the same four tabs for the whole chapter, with no verse selected: every cross-reference (each marked with its verse),
everyone and every place the chapter names, and its events. With verses selected, a switch at the top of the panel
moves between them and their chapter. On a computer the panel keeps showing the chapter until it is closed.

**Listen** (by the chapter title) reads the chapter aloud in the device's own voice, one verse at a time from the
selected verse (or the first), lighting the verse it reads and keeping it in view, then carries on into the next
chapter. It reads the first translation shown, in English or Chinese. The player above the dock pauses, steps a verse
back or forward, changes the speed (0.8× to 1.5×) and, on wider screens, the voice; speed and voice are remembered.
Moving to another chapter by hand stops it. It needs no connection when the device's voices are installed.

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

**Hebrew and Greek**: in the KJV, a word that translates a Hebrew or Greek word also shows that word at the top of its
word study: the original, its transliteration and pronunciation, part of speech and Strong's definition. **Every verse
with this word** lists all the verses that use it, how the KJV translates it each time (רָעָה: feed 51, shepherds 28,
shepherd 26, …; tap one to keep those verses) and the books it is in. Under the verse text, **Hebrew words** or
**Greek words** unfolds the verse's original words, each with the English word it stands behind, so 和合本 readers can
open them too.

**Search** (the magnifier, or `/`) finds references ("John 3:16", "约翰福音 3"), books, people, places, events, tours
and words in the text.

**Translations**: the switch in the top bar picks the King James Version, 和合本 (the Chinese Union Version, in
simplified characters), or both side by side, verse by verse. With 和合本 first, the whole app is in Chinese: book
names, people, places, events, tours and the atlas map.

**Timeline** (in the dock): a card above the dock that runs through the eras of the Bible, from the beginnings in Genesis to the
early church, and marks the year of the chapter or verse being read. Each era opens a card with its dates, a summary,
the chapters set in it (book by book), its events, and a link to that time on the atlas map. The eras are the atlas
pack's (`atlas/eras.json`), shown at equal widths so the short ones can be tapped.

**Share** (the arrow in the top bar, and in every dialog) gives a link to exactly what is on screen: the passage and
selected verses, the translation, the open tab, the person whose card is open, the sheet's size on phones, a running
tour, and an open family tree, land of Canaan, kings chart or era. On a phone it opens the share sheet; elsewhere it
copies the link. Opening the link restores that view once (the translation only for that visit), then the address
goes back to the plain passage.

**Kings of Israel and Judah** opens from the eras of the kings and from any king's or prophet's card: Saul to Zedekiah
with the two kingdoms side by side and time running down, each reign as long as its years (Thiele's dates), coloured by
the verdict the book of Kings gives, with the prophets of each kingdom beside it and the division, the fall of Samaria
and the fall of Jerusalem across both. Tapping a king shows his years and verdict, links to his account in Kings and
Chronicles, and his family tree. Opened while reading a king's account, it starts at him.

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

On an iPhone or iPad, where Safari has no install prompt, a card shows how to add the app to the Home Screen (Share,
then Add to Home Screen, then Add; inside WeChat and other in-app browsers, open the page in Safari first). It shows
only in the browser, never in the installed app. **Not now** hides it until the next visit, **Don't show it again**
for good; the install button in My reading brings it back.

On a Mac the card shows too. In Safari 17 or later it points to File › Add to Dock; in Chrome and Edge it points to
the install icon in the address bar and adds a one-click **Install** button when the browser offers one. Firefox and
older Safari can't install web apps, so nothing shows there.

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
| `data/lands.json` | The land as Joshua 13–21 divides it: nested `{id, name, zh, kids}` groups down to `{..., ref, towns}`, each town `[place number, "chapter.verse"]`. Built from the verse-to-place links in `data/vctx/Josh.json`. |
| `data/names.json` | Places the Bible renames or calls by other names: `[[place numbers], [[name, name_zh, verse], ...]]`, every verse checked against the KJV. |
| `data/kings.json` | 42 kings as `[kingdom U/I/J, name, name_zh, from, to, verdict g/e/null, account, account in Chronicles, person]` (years negative for BC), 15 prophets as `[kingdom, name, name_zh, from, to, verse, person]`, and turning points as `[year, title, title_zh, verse]`. |
| `data/strongs/<id>.json` | Per verse `"chapter.verse"`: `[[i, n], ...]`, the i-th word of the KJV verse (words as `Intl.Segmenter` splits them) translates Strong's number n (Hebrew in the Old Testament, Greek in the New), or a list of numbers. |
| `data/lexicon/<H\|G><k>.json` | Strong's entries `k×100` to `k×100+99` as `{"n": [lemma, transliteration, pronunciation, definition, part of speech]}`. |
| `data/basemap.json` | Land, lakes and main rivers of the Bible lands for the Places map (Natural Earth, simplified). |
| `atlas/` | The atlas data pack (see above). |

To rebuild, run `tools/fetch_sources.sh` to download the sources into `tools/src/`. Then run
`python3 tools/build_data.py` for `data/` and `python3 tools/build_atlas.py` for the pack's events and places.
`python3 tools/build_kings.py` rebuilds the kings (checking every account against the KJV), and
`python3 tools/build_names.py && python3 tools/build_lands.py` rebuild the place names and the land of Canaan from
`data/`. `python3 tools/build_strongs.py` rebuilds the Hebrew and Greek words, matching MetaV's tagged words to the
KJV text (99.9% match).

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
- **Hebrew and Greek words**: Strong's numbers on each KJV word from
  [MetaV](https://github.com/theonize/KJV-bible-database-with-metadata-MetaV-) (CC BY-SA 3.0), with Strong's
  definitions from [Open Scriptures](https://github.com/openscriptures/strongs) (CC BY-SA).
- **Base map** from [Natural Earth](https://www.naturalearthdata.com/): public domain.

Years follow a traditional chronology, with the Exodus in 1490 BC; many scholars date the early periods later. The
tours were drafted with AI from the biblical text, and the Chinese names of places and events (`tools/atlas_zh.json`,
和合本 spellings) and of people (`tools/people_zh.json`) were drafted with AI from the 和合本 verses that name them.
