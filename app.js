"use strict";
// Interactive Bible: a reading panel and a context panel. Static site, data in data/ (see tools/build_data.py).

const $ = (id) => document.getElementById(id);
const TRANSLATION = "kjv";
const XREF_FIRST = 12; // cross-references shown before "Show all"
const NT_START = 39; // index of Matthew in books.json

const state = {
  books: [], byId: {},
  book: "Gen", chapter: 1, verse: null, to: null,
  tab: "xref",
  tour: null, // {tr, i}: the open tour and step
  size: 19,
};
const cache = new Map();

function loadJSON(url) {
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then((r) => {
      if (!r.ok) throw new Error(url + ": " + r.status);
      return r.json();
    }).catch((e) => { cache.delete(url); throw e; }));
  }
  return cache.get(url);
}
const bookText = (id) => loadJSON(`data/text/${TRANSLATION}/${id}.json`);
const bookXref = (id) => loadJSON(`data/xref/${id}.json`).catch(() => ({}));
const bookContext = (id) => loadJSON(`data/vctx/${id}.json`).catch(() => ({ places: {}, events: {} }));

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// --- References -----------------------------------------------------------

// "John.3.16" or "John.3" → {book, chapter, verse}; null if it names no real chapter.
function parseRef(s) {
  // A range ("Acts.13.4-5", "Gen.8.22-Gen.9.2") selects its first verse and marks the rest of it in that chapter.
  const m = /^([1-3]?[A-Za-z]+)\.(\d+)(?:\.(\d+)(?:-(?:([1-3]?[A-Za-z]+)\.)?(?:(\d+)\.)?(\d+))?)?$/.exec(s || "");
  if (!m || !state.byId[m[1]]) return null;
  const b = state.byId[m[1]], c = +m[2], v = m[3] ? +m[3] : null;
  if (c < 1 || c > b.chapters.length) return null;
  if (v !== null && (v < 1 || v > b.chapters[c - 1])) return { book: b.id, chapter: c, verse: null, to: null };
  let to = null;
  if (v !== null && m[6]) {
    const same = (!m[4] || m[4] === m[1]) && (!m[5] || +m[5] === c);
    to = same ? Math.min(+m[6], b.chapters[c - 1]) : b.chapters[c - 1];
    if (to <= v) to = null;
  }
  return { book: b.id, chapter: c, verse: v, to };
}
// "Prov.8.22-Prov.8.30" → "Proverbs 8:22–30"
function refLabel(s) {
  const [a, z] = s.split("-").map((x) => x.split("."));
  let out = `${state.byId[a[0]].name} ${a[1]}:${a[2]}`;
  if (z) out += z[0] !== a[0] ? `–${state.byId[z[0]].name} ${z[1]}:${z[2]}` : z[1] !== a[1] ? `–${z[1]}:${z[2]}` : `–${z[2]}`;
  return out;
}
// The text of a reference or range (ranges within one book; longer ones are cut with an ellipsis).
async function refText(s) {
  const [a, z] = s.split("-").map((x) => x.split("."));
  const text = await bookText(a[0]);
  const end = z && z[0] === a[0] ? [+z[1], +z[2]] : [+a[1], +a[2]];
  const out = [];
  for (let c = +a[1], v = +a[2]; c < end[0] || (c === end[0] && v <= end[1]); ) {
    const t = text[c - 1]?.[v - 1];
    if (t === undefined) { c++; v = 1; if (c > text.length) break; continue; }
    out.push(t);
    if (out.length === 4) { out.push("…"); break; }
    v++;
  }
  return out.join(" ");
}
const hashFor = (b, c, v) => "#" + [b, c, v].filter((x) => x != null).join(".");

// --- Reading panel ----------------------------------------------------------

function neighbour(dir) {
  const i = state.books.indexOf(state.byId[state.book]);
  let c = state.chapter + dir, b = state.books[i];
  if (c < 1) { b = state.books[i - 1]; if (!b) return null; c = b.chapters.length; }
  else if (c > b.chapters.length) { b = state.books[i + 1]; if (!b) return null; c = 1; }
  return { book: b.id, chapter: c };
}

let rendered = "";
async function renderChapter() {
  const b = state.byId[state.book];
  const key = `${b.id}.${state.chapter}`;
  $("ref-title").textContent = `${b.name} ${state.chapter}`;
  document.title = `${b.name} ${state.chapter} · Bible`;
  if (rendered !== key) {
    const text = await bookText(b.id);
    if (`${state.book}.${state.chapter}` !== key) return; // navigated away meanwhile
    const art = $("chapter");
    art.innerHTML = "";
    const h = document.createElement("h1");
    h.innerHTML = `<small>${state.books.indexOf(b) >= NT_START ? "New Testament" : "Old Testament"}</small>`;
    h.append(`${b.name} ${state.chapter}`);
    const p = document.createElement("p");
    text[state.chapter - 1].forEach((t, i) => {
      const s = document.createElement("span");
      s.className = "v";
      s.dataset.v = i + 1;
      s.innerHTML = `<sup>${i + 1}</sup>`;
      s.append(t + " ");
      p.append(s);
    });
    art.append(h, p);
    rendered = key;
    for (const [id, dir] of [["prev2", -1], ["next2", 1]]) {
      const n = neighbour(dir);
      $(id).hidden = !n;
      if (n) $(id).querySelector("span").textContent = `${state.byId[n.book].name} ${n.chapter}`;
    }
    $("prev").disabled = !neighbour(-1);
    $("next").disabled = !neighbour(1);
    if (!state.verse) $("reader").scrollTo({ top: 0, behavior: "instant" });
  }
  document.querySelectorAll(".v.sel, .v.rng").forEach((el) => el.classList.remove("sel", "rng"));
  for (let i = state.verse + 1; state.verse && i <= (state.to || 0); i++) document.querySelector(`.v[data-v="${i}"]`)?.classList.add("rng");
  if (state.verse) {
    const el = document.querySelector(`.v[data-v="${state.verse}"]`);
    el.classList.add("sel");
    const r = el.getBoundingClientRect(), box = $("reader").getBoundingClientRect();
    const top = $("tour").hidden ? 0 : $("tour").offsetHeight; // the tour card sits over the top of the text
    if (r.top < box.top + top + 40 || r.bottom > box.bottom - 40 || document.body.classList.contains("sheet-open")) {
      $("reader").scrollTo({ top: $("reader").scrollTop + r.top - box.top - top - 80, behavior: "smooth" });
    }
  }
}

// --- Context panel ----------------------------------------------------------

async function renderContext() {
  const open = state.verse != null;
  $("ctx-empty").hidden = open;
  $("ctx-body").hidden = !open;
  $("context").classList.toggle("open", open);
  document.body.classList.toggle("sheet-open", open);
  if (!open) return;
  const b = state.byId[state.book], v = state.verse, key = `${b.id}.${state.chapter}.${v}`;
  $("ctx-ref").textContent = `${b.name} ${state.chapter}:${v}`;
  $("ctx-text").textContent = (await bookText(b.id))[state.chapter - 1][v - 1];
  document.querySelectorAll(".tabs button").forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === state.tab));
  for (const t of ["xref", "places", "links"]) $("tab-" + t).hidden = t !== state.tab;
  renderLinks(b, state.chapter, v);
  renderPlaces(b, state.chapter, v, key).catch((e) => console.error(e));
  const refs = (await bookXref(b.id))[`${state.chapter}.${v}`] || [];
  if (`${state.book}.${state.chapter}.${state.verse}` !== key) return;
  $("xref-count").textContent = refs.length || "";
  renderXref(refs, XREF_FIRST);
}

function renderXref(refs, limit) {
  const pane = $("tab-xref");
  pane.innerHTML = "";
  if (!refs.length) { pane.innerHTML = `<p class="note">No cross-references for this verse.</p>`; return; }
  const ul = document.createElement("ul");
  ul.className = "xref";
  for (const [ref, votes] of refs.slice(0, limit)) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    const start = ref.split("-")[0].split(".");
    a.href = hashFor(start[0], start[1], start[2]);
    a.textContent = refLabel(ref);
    const vt = document.createElement("span");
    vt.className = "votes";
    vt.title = "Votes on OpenBible.info: how many readers found this link helpful";
    vt.textContent = `${votes} ▲`;
    const xt = document.createElement("div");
    xt.className = "xt loading";
    xt.textContent = "…";
    refText(ref).then((t) => { xt.textContent = t; xt.classList.remove("loading"); }).catch(() => (xt.textContent = ""));
    li.append(vt, a, xt);
    ul.append(li);
  }
  pane.append(ul);
  if (refs.length > limit) {
    const more = document.createElement("button");
    more.className = "pill more";
    more.textContent = `Show all ${refs.length}`;
    more.onclick = () => renderXref(refs, refs.length);
    pane.append(more);
  }
}

function renderLinks(b, c, v) {
  const q = encodeURIComponent(`${b.name} ${c}:${v}`);
  const links = [
    [`https://www.biblegateway.com/passage/?search=${q}&version=NKJV`, "Read in NKJV", "Bible Gateway, New King James Version"],
    [`https://www.biblegateway.com/verse/en/${q}`, "Compare translations", "This verse in every English version on Bible Gateway"],
    [`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(`${b.name} book of the Bible`)}`, `About ${b.name}`, "Wikipedia"],
  ];
  $("tab-links").innerHTML = `<ul class="links">${links.map(([href, t, d]) =>
    `<li><a href="${href}" target="_blank" rel="noopener">${t} ↗</a><span>${d}</span></li>`).join("")}</ul>`;
}

// Places named in the verse (or, if none, in the chapter) on a small map, and the events the verse belongs to.
async function renderPlaces(b, c, v, key) {
  const [places, { places: vp, events: ve }, base] = await Promise.all([
    loadJSON("data/places.json"), bookContext(b.id), loadJSON("data/basemap.json")]);
  if (`${state.book}.${state.chapter}.${state.verse}` !== key) return;
  const here = vp[`${c}.${v}`] || [];
  let ids = here, scope = "verse";
  if (!ids.length) {
    ids = [...new Set(Object.entries(vp).filter(([k]) => k.startsWith(c + ".")).flatMap(([, l]) => l))];
    scope = "chapter";
  }
  $("places-count").textContent = here.length || "";
  const pane = $("tab-places");
  pane.innerHTML = "";
  if (ids.length) {
    const note = document.createElement("p");
    note.className = "note small";
    note.textContent = scope === "verse" ? "Named in this verse" : `No places named in this verse. Places in ${b.name} ${c}:`;
    pane.append(note, drawMap(ids.map((i) => places[i]), base));
    const ul = document.createElement("ul");
    ul.className = "places";
    for (const i of ids) {
      const [, name, lon, lat, kind] = places[i];
      const li = document.createElement("li");
      li.innerHTML = `<b></b> <span></span>`;
      li.firstChild.textContent = name;
      li.lastChild.textContent = [kind, `${Math.abs(lat).toFixed(2)}°${lat < 0 ? "S" : "N"} ${Math.abs(lon).toFixed(2)}°${lon < 0 ? "W" : "E"}`].filter(Boolean).join(" · ");
      ul.append(li);
    }
    pane.append(ul);
  } else {
    pane.innerHTML = `<p class="note">No places are named in ${b.name} ${c}.</p>`;
  }
  const evs = ve[`${c}.${v}`] || [];
  if (evs.length) {
    const h = document.createElement("h3");
    h.textContent = "Part of";
    const ul = document.createElement("ul");
    ul.className = "events";
    for (const [title, year] of evs) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="yr"></span> `;
      li.firstChild.textContent = year == null ? "" : year < 0 ? `${-year} BC` : `AD ${year}`;
      li.append(title);
      ul.append(li);
    }
    pane.append(h, ul);
  }
}

const LANDMARKS = [["Jerusalem", 35.234, 31.777], ["Damascus", 36.309, 33.512], ["Babylon", 44.421, 32.536],
  ["Nineveh", 43.161, 36.348], ["Memphis", 31.255, 29.845], ["Antioch", 36.165, 36.201], ["Athens", 23.727, 37.972],
  ["Rome", 12.484, 41.893], ["Ephesus", 27.340, 37.942], ["Tyre", 35.209, 33.268]];

// An SVG map of the Bible lands framed on the given places: [[id, name, lon, lat, kind], ...]
function drawMap(pts, base) {
  const NS = "http://www.w3.org/2000/svg";
  const lons = pts.map((p) => p[2]), lats = pts.map((p) => p[3]);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const k = Math.cos((midLat * Math.PI) / 180);
  const X = (lon) => lon * k, Y = (lat) => -lat;
  // Frame: the places plus a margin, at least 3° tall, in a 4:3 box.
  let x0 = X(Math.min(...lons)), x1 = X(Math.max(...lons)), y0 = Y(Math.max(...lats)), y1 = Y(Math.min(...lats));
  let w = Math.max((x1 - x0) * 1.5, 4), h = Math.max((y1 - y0) * 1.5, 3);
  if (w / h > 4 / 3) h = (w * 3) / 4; else w = (h * 4) / 3;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `${cx - w / 2} ${cy - h / 2} ${w} ${h}`);
  svg.setAttribute("class", "map");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Map: " + pts.map((p) => p[1]).join(", "));
  const el = (tag, attrs, text) => {
    const e = document.createElementNS(NS, tag);
    for (const [a, b] of Object.entries(attrs)) e.setAttribute(a, b);
    if (text) e.textContent = text;
    svg.append(e);
    return e;
  };
  const path = (rings, cls, close) => el("path", {
    d: rings.map((r) => "M" + r.map(([lon, lat]) => `${X(lon).toFixed(3)},${Y(lat)}`).join("L") + (close ? "Z" : "")).join(""),
    class: cls, "vector-effect": "non-scaling-stroke" });
  el("rect", { x: cx - w / 2, y: cy - h / 2, width: w, height: h, class: "sea" });
  path(base.land, "land", true);
  path(base.lakes, "lake", true);
  path(base.rivers, "river", false);
  const r = h * 0.014, fs = h * 0.045;
  // A label beside a point, flipped to the left near the right edge.
  const label = (x, y, text, cls) => {
    const left = x > cx + w * 0.2;
    el("text", { x: x + (left ? -1.8 : 1.8) * r, y: y + fs * 0.35, "font-size": fs, "text-anchor": left ? "end" : "start", class: cls }, text);
  };
  // Landmarks for orientation, when in frame and not one of the places.
  const names = new Set(pts.map((p) => p[1]));
  for (const [name, lon, lat] of LANDMARKS) {
    const x = X(lon), y = Y(lat);
    if (names.has(name) || Math.abs(x - cx) > w * 0.45 || Math.abs(y - cy) > h * 0.45) continue;
    if (pts.some((p) => Math.abs(X(p[2]) - x) < fs * 4 && Math.abs(Y(p[3]) - y) < fs * 1.3)) continue;
    el("circle", { cx: x, cy: y, r: r * 0.6, class: "mark" });
    label(x, y, name, "mark-label");
  }
  // Places within a few pixels of each other share one label.
  const groups = [];
  for (const [, name, lon, lat] of pts) {
    const x = X(lon), y = Y(lat);
    const g = groups.find((g) => Math.hypot(g.x - x, g.y - y) < fs * 1.2);
    if (g) g.names.push(name); else groups.push({ x, y, names: [name] });
    el("circle", { cx: x, cy: y, r, class: "pin" });
  }
  for (const g of groups) label(g.x, g.y, g.names.join(", "), "pin-label");
  return svg;
}

// --- Tours ------------------------------------------------------------------

// Guided journeys, shared with the atlas pack (atlas/tours.json). Each step opens its verses in the reader.
const ATLAS = "https://atlas.daiyip.com/";
const PACK = "https://bible.daiyip.com/atlas/manifest.json";
const loadTours = () => loadJSON("atlas/tours.json");
const fmtYear = (y) => (y < 0 ? `${-y} BC` : `AD ${y}`);

async function fillTourList(list) {
  const tours = await loadTours();
  list.replaceChildren(...tours.map((tr) => {
    const btn = document.createElement("button");
    btn.className = "tour-item";
    const [b, span, small] = ["b", "span", "small"].map((t) => document.createElement(t));
    b.textContent = tr.title;
    span.textContent = `${fmtYear(tr.start)}${tr.end !== tr.start ? "–" + fmtYear(tr.end) : ""} · ${tr.steps.length} steps`;
    small.textContent = tr.summary;
    btn.append(b, span, small);
    btn.onclick = () => startTour(tr.id, 0);
    return btn;
  }));
}
function showTours() {
  $("picker-title").textContent = "Tours";
  $("picker-back").hidden = true;
  const list = document.createElement("div");
  list.className = "tour-list";
  $("picker-body").replaceChildren(list);
  fillTourList(list).catch(showError);
}
async function startTour(id, i) {
  const tr = (await loadTours()).find((t) => t.id === id);
  if (!tr) return endTour();
  i = Math.max(0, Math.min(tr.steps.length - 1, i));
  state.tour = { tr, i };
  store.set("bible-tour", [id, i]);
  if ($("picker").open) $("picker").close();
  const ref = tr.steps[i].ref;
  if (decodeURIComponent(location.hash.slice(1)) === ref) renderTour();
  else location.hash = ref;
}
function endTour() {
  state.tour = null;
  store.set("bible-tour", null);
  renderTour();
}
function renderTour() {
  const t = state.tour;
  $("tour").hidden = !t;
  if (!t) return;
  const { tr, i } = t, s = tr.steps[i], last = i === tr.steps.length - 1;
  $("tour-title").textContent = tr.title;
  $("tour-count").textContent = `${i + 1} of ${tr.steps.length}`;
  $("tour-year").textContent = fmtYear(s.year);
  $("tour-text").textContent = s.text;
  $("tour-prev").disabled = i === 0;
  $("tour-next").textContent = last ? "Finish" : "Next ›";
  $("tour-map").href = `${ATLAS}?pack=${encodeURIComponent(PACK)}#tour=${tr.id}&s=${i + 1}`;
}

// --- Book and chapter picker -------------------------------------------------

function showBooks() {
  $("picker-title").textContent = "Books";
  $("picker-back").hidden = true;
  const body = $("picker-body");
  body.innerHTML = "";
  for (const [label, list] of [["Old Testament", state.books.slice(0, NT_START)], ["New Testament", state.books.slice(NT_START)]]) {
    const h = document.createElement("div");
    h.className = "testament";
    h.textContent = label;
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const b of list) {
      const btn = document.createElement("button");
      btn.textContent = b.name;
      if (b.id === state.book) btn.classList.add("cur");
      btn.onclick = () => (b.chapters.length === 1 ? go(b.id, 1) : showChapters(b));
      grid.append(btn);
    }
    body.append(h, grid);
  }
}
function showChapters(b) {
  $("picker-title").textContent = b.name;
  $("picker-back").hidden = false;
  const grid = document.createElement("div");
  grid.className = "grid nums";
  b.chapters.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    if (b.id === state.book && i + 1 === state.chapter) btn.classList.add("cur");
    btn.onclick = () => go(b.id, i + 1);
    grid.append(btn);
  });
  $("picker-body").replaceChildren(grid);
}
function go(book, chapter, verse) {
  $("picker").close();
  location.hash = hashFor(book, chapter, verse);
}

// --- Routing and setup ---------------------------------------------------------

function route() {
  const r = parseRef(decodeURIComponent(location.hash.slice(1))) || parseRef(store.get("bible-pos")) || { book: "Gen", chapter: 1, verse: null, to: null };
  Object.assign(state, r);
  store.set("bible-pos", [r.book, r.chapter, r.verse].filter((x) => x != null).join("."));
  renderTour();
  renderChapter().then(renderContext).catch(showError);
}
function showError(e) {
  console.error(e);
  $("chapter").innerHTML = `<p class="note">Could not load this chapter. Check your connection and reload.</p>`;
}
function setSize(px) {
  state.size = Math.max(14, Math.min(28, px));
  document.documentElement.style.setProperty("--read-size", state.size + "px");
  store.set("bible-size", state.size);
}
function step(dir) {
  const n = neighbour(dir);
  if (n) location.hash = hashFor(n.book, n.chapter);
}

async function init() {
  state.books = await loadJSON("data/books.json");
  for (const b of state.books) state.byId[b.id] = b;
  setSize(store.get("bible-size") || 19);
  if (["xref", "places", "links"].includes(store.get("bible-tab"))) state.tab = store.get("bible-tab");

  $("chapter").addEventListener("click", (e) => {
    const el = e.target.closest(".v");
    if (!el) return;
    const v = +el.dataset.v;
    location.hash = hashFor(state.book, state.chapter, v === state.verse ? null : v);
  });
  document.querySelector(".tabs").addEventListener("click", (e) => {
    const t = e.target.closest("button")?.dataset.tab;
    if (!t) return;
    state.tab = t;
    store.set("bible-tab", t);
    renderContext();
  });
  $("sheet-close").onclick = () => (location.hash = hashFor(state.book, state.chapter));
  $("prev").onclick = $("prev2").onclick = () => step(-1);
  $("next").onclick = $("next2").onclick = () => step(1);
  $("smaller").onclick = () => setSize(state.size - 1);
  $("larger").onclick = () => setSize(state.size + 1);
  $("picker-btn").onclick = () => { showBooks(); $("picker").showModal(); };
  $("picker-x").onclick = () => $("picker").close();
  $("picker-back").onclick = showBooks;
  $("picker").addEventListener("click", (e) => { if (e.target === $("picker")) $("picker").close(); });
  addEventListener("keydown", (e) => {
    if ($("picker").open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Escape" && state.verse) location.hash = hashFor(state.book, state.chapter);
  });
  $("tours-btn").onclick = () => { showTours(); $("picker").showModal(); };
  $("tour-prev").onclick = () => startTour(state.tour.tr.id, state.tour.i - 1);
  $("tour-next").onclick = () => (state.tour.i === state.tour.tr.steps.length - 1 ? endTour() : startTour(state.tour.tr.id, state.tour.i + 1));
  $("tour-x").onclick = endTour;
  fillTourList($("ctx-tours")).catch((e) => console.error(e));
  const saved = store.get("bible-tour");
  if (Array.isArray(saved)) {
    const tr = (await loadTours().catch(() => [])).find((t) => t.id === saved[0]);
    if (tr && tr.steps[saved[1]]) state.tour = { tr, i: saved[1] };
  }
  addEventListener("hashchange", route);
  route();
}

init().catch(showError);
