#!/bin/sh
# Downloads the source data into tools/src (not committed). Then run tools/build_data.py.
# KJV text: public domain. Cross-references: OpenBible.info, CC BY. Both via scrollmapper/bible_databases (MIT).
set -e
cd "$(dirname "$0")"
mkdir -p src
B=https://raw.githubusercontent.com/scrollmapper/bible_databases/e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c
curl -sSfo src/KJV.json $B/formats/json/KJV.json
curl -sSfo src/cross_references.txt $B/sources/extras/cross_references.txt
curl -sSfo src/ChiUn.json $B/formats/json/ChiUn.json   # 和合本, public domain
# Places and events: Theographic Bible Metadata (CC BY-SA 4.0). Base map: Natural Earth (public domain).
mkdir -p src/theographic src/naturalearth
T=https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/cfb1c485d4da6fb63a69cb3b7f5b0752792f46bc/json
for f in books events people places verses; do curl -sSfo src/theographic/$f.json $T/$f.json; done
N=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
for f in ne_50m_land ne_50m_lakes ne_50m_rivers_lake_centerlines; do curl -sSfo src/naturalearth/$f.geojson $N/$f.geojson; done
# Strong's numbers on each KJV word, and Strong's dictionary: MetaV (CC BY-SA 3.0).
mkdir -p src/metav
M=https://raw.githubusercontent.com/theonize/KJV-bible-database-with-metadata-MetaV-/master/CSV
for f in MainIndex StrongsIndex Strongs; do curl -sSfo src/metav/$f.csv $M/$f.csv; done
# Topics: Nave's Topical Bible (public domain), as CSV from BradyStephenson/bible-data (CC BY 4.0).
mkdir -p src/naves
curl -sSfo src/naves/NavesTopicalDictionary.csv https://raw.githubusercontent.com/BradyStephenson/bible-data/main/NavesTopicalDictionary.csv
# More translations, all public domain: from scrollmapper (above), and the World English Bible from TehShrike.
mkdir -p src/versions src/web
for f in BSB ASV YLT Darby BBE ChiUnL; do curl -sSfo src/versions/$f.json $B/formats/json/$f.json; done
W=https://raw.githubusercontent.com/TehShrike/world-english-bible/master/json
python3 -c "import json; [print(b['id'], b['name'].lower().replace(' ', '')) for b in json.load(open('../data/books.json'))]" |
  while read id name; do curl -sSfo src/web/$id.json $W/$name.json; done
# Words of Jesus (red letters): the KJV in OSIS and the WEB in USFX, both public domain, from seven1m/open-bibles.
O=https://raw.githubusercontent.com/seven1m/open-bibles/master
for f in eng-kjv.osis.xml eng-web.usfx.xml; do curl -sSfo src/$f $O/$f; done
