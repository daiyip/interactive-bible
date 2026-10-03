// Bridge to the Bible reader. When the reader embeds the atlas in its side panel (an iframe with ?embed=1), it drives
// the atlas with postMessage and follows it back. Every message is an object with `bible: 1` and a `type`:
//
//   reader → atlas   {type: "tour", id, step}              start a tour at a step (from 0)
//                    {type: "places", places, year}        pin a verse's places ([[name, lon, lat], ...]) and frame them
//   atlas → reader   {type: "ready"}                       the map is up; the reader replies with what to show
//                    {type: "tour-step", id, index}        a tour step started in the atlas
//                    {type: "tour-end"}
//                    {type: "ref", ref}                    a verse link or an event was clicked, e.g. "Acts.13.4-5"
//
// Messages are only taken from the Bible reader's sites, and only sent to the page that embeds the atlas.

const READERS = ["https://bible.daiyip.com", "https://daiyip.github.io"];
const trusted = (origin) => READERS.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

export default function setup(atlas) {
  if (window.parent === window) return; // not embedded
  let reader = null; // the embedding page's origin, learned from its first message
  const send = (msg) => reader && window.parent.postMessage({ bible: 1, ...msg }, reader);
  let pins = [];

  const clearPins = () => { pins.forEach((m) => m.remove()); pins = []; };
  const showPlaces = (places, year) => {
    if (atlas.tour) document.querySelector("#tour .tour-close")?.click();
    clearPins();
    if (year != null) atlas.setYear(year);
    if (!places?.length) return;
    // Places a few kilometres apart share one pin, so their names don't overprint.
    const groups = [];
    for (const [name, lon, lat] of places) {
      const g = groups.find((g) => Math.abs(g.lon - lon) < 0.08 && Math.abs(g.lat - lat) < 0.08);
      if (g) g.names.push(name); else groups.push({ lon, lat, names: [name] });
    }
    for (const { lon, lat, names } of groups) {
      const el = document.createElement("div");
      el.className = "bible-pin";
      el.innerHTML = "<i></i><span></span>";
      el.lastChild.textContent = names.join(", ");
      pins.push(new atlas.maplibregl.Marker({ element: el, anchor: "left", offset: [-6, 0] }).setLngLat([lon, lat]).addTo(atlas.map));
    }
    const lons = places.map((p) => p[1]), lats = places.map((p) => p[2]);
    const bounds = [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]];
    atlas.map.fitBounds(bounds, { padding: { top: 70, bottom: 40, left: 40, right: 90 }, maxZoom: 7, duration: 1200 });
  };

  const style = document.createElement("style");
  style.textContent = `.bible-pin { display: flex; align-items: center; gap: 5px; pointer-events: none; }
    .bible-pin i { width: 12px; height: 12px; border-radius: 50%; background: #c0392b; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.4); }
    .bible-pin span { font: 600 13px system-ui, sans-serif; color: #1f2024; text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff; white-space: nowrap; }`;
  document.head.append(style);

  addEventListener("message", (e) => {
    const m = e.data;
    if (e.source !== window.parent || !trusted(e.origin) || !m || m.bible !== 1) return;
    reader = e.origin;
    if (m.type === "tour") { clearPins(); atlas.startTour(m.id, m.step || 0); }
    else if (m.type === "places") showPlaces(m.places, m.year);
  });
  atlas.on("tour-step", ({ id, index }) => send({ type: "tour-step", id, index }));
  atlas.on("tour-end", () => send({ type: "tour-end" }));
  // An event opened on the map: the reader opens its verses. (Tour steps open events too; the tour drives those.)
  atlas.on("event", ({ event }) => { if (!atlas.tour && event?.refs?.length) send({ type: "ref", ref: event.refs[0] }); });

  // Verse links on event and map cards open in the reader beside the map, not in a new tab.
  const base = atlas.pack.refs?.url.split("{ref}")[0];
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || !reader || !base || !a.href.startsWith(base)) return;
    e.preventDefault();
    send({ type: "ref", ref: decodeURIComponent(a.href.slice(base.length)) });
  }, true);

  window.parent.postMessage({ bible: 1, type: "ready" }, "*"); // carries nothing; the reader answers from a trusted origin
}
