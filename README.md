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
verse in it. Tapping any selected verse clears the whole selection, as do a tap on the page outside the verses,
the panel's ×, and Esc. On a phone the panel is a sheet over the bottom of the text: drag or tap
its handle to make it taller or shorter, and scrolling the text lowers it to a strip so the verses stay in reach.

- **Cross-references**: the verses most often linked to this one, strongest first, as a list or as a web: the verse
  in the middle and its 12 strongest links around it in Bible order, sized by votes, with faint lines between the
  ones that link to each other. Tapping one moves there and redraws the web.
- **People**: everyone the verse names. Open a person for a short biography, their family (each one a link), and
  every verse that names them; the card stays open as you walk through those verses. **Family tree** shows them
  from their grandparents down to their grandchildren as a foldable outline, under their whole line back; tapping a
  name redraws the tree around that person.
- **Places**: the [atlas](https://atlas.daiyip.com) map with the places the verse names pinned, and the events it
  belongs to. The map is the atlas itself, embedded with this site's pack in its simple dark style (`?style=night`, also used by the links that
  open the full atlas); a small built-in map stands in while it
  loads. Places the Bible renames show their other names (Luz and Bethel, Jebus and Jerusalem), each linked to its
  verse. **Land of Canaan** opens the land as Joshua 13–21 divides it: east and west of the Jordan, the tribes (Judah
  by district), and the Levites' cities, each place with its verse, beside a map that pins the tribe you pick.
- **Links**: the verse in NKJV on Bible Gateway, other translations side by side, and a Wikipedia search.

The panel shows only what the selected verses hold. **Context**, first in the dock (or the button in the empty panel) opens
the same four tabs for the whole chapter, with no verse selected: every cross-reference (each marked with its verse),
everyone and every place the chapter names, and its events. With verses selected, a switch at the top of the panel
moves between them and their chapter. On a computer the panel keeps showing the chapter until it is closed.

Above a chapter's context, **About** the book: what it is about, its author and date (traditional views), a key verse
with its text, and an outline whose sections open their first chapter, with the open chapter's section marked. It
folds away and stays folded until opened again.

**Topics** under a verse's text are the topics of Nave's Topical Bible that cite it, the broadest first (a chapter's:
those citing most of its verses). Tap one for the topic: its headings, as Nave's indents them, each with its
references, the ones that take in your verse marked; "See" headings open related topics. The search box finds topics
by name, and shows the most cited ones before you type. About half the topics have Chinese names (the main ones,
and the people and places); the headings are Nave's English.

**Commentary** under a verse's text is Matthew Henry's Concise Commentary on the section that takes it in, with its
verses and title from Henry's outline of the chapter; a long section shows its first lines and **Read more**. A
chapter's context lists all its sections (and, on chapter 1, Henry's introduction to the book), each opening in place.
References in the comment go to that passage. The comment is in English in both languages. Henry has no comment on
Leviticus 19 or Psalm 108.

**Parallel accounts**: in the Gospels, a verse lists the sections of a harmony of the Gospels it belongs to, with the
other Gospels' passages. A section opens with the accounts side by side (on a phone, swiped across, with a tab for
each), your verse marked; ‹ › step through the life of Jesus in order, and the back button lists all 164 sections by
part, each with the Gospels that tell it. The search box finds sections by title.

**Listen** in the dock is a switch: on, it reads the chapter aloud in the device's own voice, one verse at a time from the
selected verse (or the first), lighting the verse it reads and keeping it in view, then carries on into the next
chapter. It reads the first translation shown, in English or Chinese. While it is on, a player above the dock pauses, steps a verse
back or forward, changes the speed (0.8× to 1.5×) and picks the voice from those the device has for the language (each with its
region, higher-quality ones marked HD); speed and voice are remembered.
Turning Listen off, or moving to another chapter by hand, stops it. It needs no connection when the device's voices are installed.

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

**Books** (the book name in the top bar) lists the books by section, each coloured: Law, History, Poetry & Wisdom,
Major and Minor Prophets, Gospels, Acts, Paul's letters, General letters and Revelation. Type in the box at the top to
narrow the list by English or Chinese name; "John 3" or "约翰福音 3" and Enter opens that chapter. Under the box are the
last chapters read in other books, and a book's chapters tick off the ones already read.

**Translations**: the translation button in the top bar opens a menu of ten public-domain translations, each with
its full name and year. English: King James Version (1769), World English Bible, Berean Standard Bible, American
Standard Version (1901), Young's Literal Translation, Darby (1889) and the Bible in Basic English. 中文: 和合本 in
simplified or traditional characters, and the classical 文理和合本. **Side by side with** adds a second translation:
in two columns, verse beside verse, where the text is wide enough, and under each verse on a phone. With a Chinese translation first, the whole app is in Chinese: book names, people, places, events,
tours and the atlas map. The Hebrew and Greek words follow the KJV's wording, whatever you read.

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

**My reading** (in the dock) holds these, all kept in the browser with nothing sent anywhere:

- **Plan**: the Bible in a year, Genesis to Revelation in 365 days of whole chapters, each day about the same
  length. It shows today's chapters, how far along you are, and what to catch up on. A chapter counts as read once
  you reach its end, or tick it off by hand. Today's reading also sits in the empty context panel.
  **How to read** picks the order, before or during the plan: **Start to finish** (Genesis to Revelation, chapter by
  chapter) or **Old & New together** (each day some of both Testaments, each from its start). **Psalms and Proverbs
  every day** takes those two books out of the order and reads a psalm and a chapter of Proverbs daily, round and
  round, **In order** or **Random** (each round still reads every chapter once, shuffled; the same plan keeps its order). Changing these mid-plan re-spreads the days and keeps what you have read.
- **Streak**: at the top of Plan, how many days in a row you have read, your best run, and a calendar of the last
  17 weeks, darker for days with more chapters. A day counts once you reach the end of a chapter that has been open
  for 20 seconds, or finish practising a memory passage; plan or no plan.
- **Highlights**: the verses you have coloured (yellow, green, blue or pink) or written a note on, in Bible order.
  Colour a verse or add a note under its text in the context panel. **Export** saves the plan, streak, highlights and notes
  to a file; **Import** merges one back, for moving to another browser.
- **Memory**: passages to learn by heart. **Memorize** under a verse's text adds it (or the selected verses, as one
  passage). Practise by typing: the first letter of each word is enough, whole words work too (in Chinese, each
  character). Three ways to see the passage while you type: **Dimmed** (every word shown faintly), **Some hidden**
  (about two words in five blanked at random) or **Blank** (nothing until you type it). A wrong letter shakes the word;
  three wrong, or **Hint**, gives it away. At the end, the score, then **Got it**, which moves the passage up a box and
  brings it back after 1, 2, 4, 8, 16, then every 32 days, or **Again**, which brings it round once more today.
  Passages due today are also offered in the empty context panel. Export and Import carry them too.
- **Offline** (its own tab): every chapter you open stays readable offline. **Save for offline** keeps the rest of the Bible in
  the current translation too (about 13 MB, or 17 MB for both). Add the site to the home screen to use it as an
  app. The atlas map needs a connection; offline, the small built-in map stands in.

On an iPhone or iPad, where Safari has no install prompt, a card shows how to add the app to the Home Screen (Share,
then Add to Home Screen, then Add; inside WeChat and other in-app browsers, open the page in Safari first). It shows
only in the browser, never in the installed app. **Not now** hides it until the next visit, **Don't show it again**
for good; the install button in My reading brings it back.

On a Mac the card shows too. In Safari 17 or later it points to File › Add to Dock; in Chrome and Edge it points to
the install icon in the address bar and adds a one-click **Install** button when the browser offers one. Firefox and
older Safari can't install web apps, so nothing shows there.

An installed app has no browser toolbar, so the top bar gains **‹** and **›** to go back and forward through the
passages you've visited, handy after following cross-references. The chapter buttons there become **⌃** and **⌄**
for the previous and next chapter. In the browser the top bar is unchanged.

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
| `data/intros.json` | Per book: `author`, `date` and `about` as `[English, Chinese]`, `key` (`"chapter.verse"`), and `outline` as `[[first chapter, title, title_zh], ...]` (verses for one-chapter books). Written for this app; authors and dates follow traditional views. |
| `data/topics/index.json` | Nave's 5,319 topics as `[name, name_zh, references, file]`; a topic's number is its place in the list. |
| `data/topics/<k>.json` | Topics `k×100` to `k×100+99`: `[[depth, heading, [refs]], ...]`, refs as `"Gen.6.16-20"` or `"Num.17"` (a whole chapter); a "See" heading is `[depth, name, [], topic]`. |
| `data/topics/v/<id>.json` | Per verse `"chapter.verse"` (or `"chapter"`, for a whole chapter): the topics citing it. |
| `data/commentary/<book>.json` | Matthew Henry's Concise Commentary: `intro` (the book's introduction, as paragraphs) and `ch`, per chapter `{"o": [[title, from, to], ...], "s": [[from, to, [paragraph, ...]], ...]}`, the outline and the sections. A paragraph marks a reference as `{text\|Osis.ref}`. Built by `tools/build_commentary.py`. |
| `data/harmony.json` | A harmony of the Gospels: `parts` as `[name, name_zh]`, and 164 `sections` as `[part, title, title_zh, [Matthew refs], [Mark refs], [Luke refs], [John refs]]`, refs as `"Matt.3.13-17"` or `"Matt.5.1-Matt.7.29"`. Built by `tools/build_harmony.py` from `tools/harmony.txt`. |
| `data/basemap.json` | Land, lakes and main rivers of the Bible lands for the Places map (Natural Earth, simplified). |
| `atlas/` | The atlas data pack (see above). |

To rebuild, run `tools/fetch_sources.sh` to download the sources into `tools/src/`. Then run
`python3 tools/build_data.py` for `data/` and `python3 tools/build_atlas.py` for the pack's events and places.
`python3 tools/build_kings.py` rebuilds the kings (checking every account against the KJV), and
`python3 tools/build_names.py && python3 tools/build_lands.py` rebuild the place names and the land of Canaan from
`data/`. `python3 tools/build_versions.py` rebuilds the other translations on the KJV's verse numbers. `python3 tools/build_harmony.py` rebuilds the Gospel harmony from `tools/harmony.txt`, checking every reference against the KJV. `python3 tools/build_commentary.py` rebuilds the commentary from the SWORD module MHCC (its docstring says how to install it and diatheke). `python3 tools/build_topics.py` rebuilds the topics (Chinese names for the main ones are in `tools/topics_zh.json`). `python3 tools/build_strongs.py` rebuilds the Hebrew and Greek words, matching MetaV's tagged words to the
KJV text (99.9% match).

## Translation

The English text is the King James Version for now. NKJV will become the default once it is licensed from HarperCollins
Christian Publishing. Until then, the Links tab opens each verse in NKJV on Bible Gateway. The text layer is one
folder per translation (`data/text/<translation>/`), so adding one does not change the reader.

## Sources and licences

- **King James Version (1769)**, **和合本**, **文理和合本**, **BSB**, **ASV**, **YLT**, **Darby** and **BBE**: public
  domain, via [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases).
- **World English Bible**: public domain, via [TehShrike/world-english-bible](https://github.com/TehShrike/world-english-bible).
- **Cross-references** from [OpenBible.info](https://www.openbible.info/labs/cross-references/): CC BY.
- **People, places and events** from [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata):
  CC BY-SA 4.0. Biographies are the opening of each person's entry in Easton's Bible Dictionary (1897, public domain). The `atlas/` pack is shared under CC BY-SA 4.0 too.
- **Hebrew and Greek words**: Strong's numbers on each KJV word from
  [MetaV](https://github.com/theonize/KJV-bible-database-with-metadata-MetaV-) (CC BY-SA 3.0), with Strong's
  definitions from [Open Scriptures](https://github.com/openscriptures/strongs) (CC BY-SA).
- **Topics**: Nave's Topical Bible (1896, public domain), from
  [BibleData](https://github.com/BradyStephenson/bible-data) by Brady Stephenson: CC BY 4.0. Chinese topic names are
  written for this app.
- **Commentary**: Matthew Henry's Concise Commentary (public domain), from the CrossWire SWORD module MHCC as
  packaged by Debian and Ubuntu (`sword-comm-mhcc`).
- **Gospel harmony**: written for this app, after the order of the classic harmonies.
- **Base map** from [Natural Earth](https://www.naturalearthdata.com/): public domain.

Years follow a traditional chronology, with the Exodus in 1490 BC; many scholars date the early periods later. The
tours were drafted with AI from the biblical text, and the Chinese names of places and events (`tools/atlas_zh.json`,
和合本 spellings) and of people (`tools/people_zh.json`) were drafted with AI from the 和合本 verses that name them.
