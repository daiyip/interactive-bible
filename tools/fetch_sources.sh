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
