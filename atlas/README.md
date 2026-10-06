# Bible atlas pack

A data pack for the atlas engine: the Bible's places, events and journeys, in the same shapes as the atlas's own files
(see `manifest.json` and the plan in `plan/atlas-engine.md`). Every event and tour step also carries a `refs`/`ref` field (OSIS references such as `Acts.13.4-5`),
so the Bible reader can link to the map and back.

| File | What it holds |
| --- | --- |
| `eras.json` | 11 periods from the Patriarchs (2000 BC) to the Early Church (AD 100), English and Chinese. `snapshots` are empty until the world map has borders for the region. |
| `events.json` | 298 events that have a known place, from Theographic Bible Metadata: year (and `endYear`), `level`, `category`, title and place in English and Chinese, `lat`/`lon`, the first verse as `summary` (KJV) and `summary_zh` (和合本), `refs`, `people` and `places`. Level 1 is a short hand-picked list of key events; level 2 are top-level events; level 3 are events that are part of a larger one. |
| `places.json` | 1,220 places with coordinates: `id`, `name`, `name_zh`, `lon`, `lat`, `kind`, `precision` and how many verses name it. |
| `tours.json` | 24 hand-written tours, 205 steps, each with a `ref`. Each tour has a `group` (`patriarchs`, `land`, `kingdom`, `exile`, `jesus`, `church`), and the file is in that order, oldest first within a group. The reader shows the same tours. AI-drafted from the biblical text; the coordinates of the stops were set by hand. |
| `media/` | Indexes of the tour media, made by `tools/make_media.py`: `pictures.json` (an AI picture per step), `narration.json` and `narration-en.json` (each step's note read in Chinese and English by a male and a female voice, keyed by a CRC of the note) and `music.json` (a track per period). The files themselves are on the atlas's R2 under `apps/bible/`, which `media.base` in the manifest names; prompts and scripts are in `tools/media/`. The atlas reads all but `narration-en.json`. |

`events.json` and `places.json` are built by `tools/build_atlas.py` (run `tools/fetch_sources.sh` first);
Chinese names come from `tools/atlas_zh.json` (和合本 spellings, AI-drafted). `manifest.json`, `eras.json` and `tours.json` are edited by hand.

Years follow Theographic's traditional chronology (Exodus 1490 BC, Solomon's temple 1011 BC, Jesus born 3 BC);
many scholars date the early periods later. Event coordinates are Theographic's and for regions (Egypt, Canaan,
the Jordan) are a rough centre point.

Sources and licences: [Theographic Bible Metadata](https://github.com/robertrouse/theographic-bible-metadata)
(CC BY-SA 4.0, so this folder is shared under CC BY-SA 4.0 too); King James Version and 和合本 (both public domain)
via [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases).

`plugins/` holds the pack's atlas plugins. `journey.js` traces each leg of a tour on the map (copied from the atlas's
demo pack). `bridge.js` lets the reader drive the atlas it embeds in its Places tab (`?embed=1`) with `postMessage`:
the reader starts tours and pins a verse's places, and the atlas reports tour steps and clicked verses back. The
messages are listed at the top of the file.

