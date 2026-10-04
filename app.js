"use strict";
// Interactive Bible: a reading panel and a context panel. Static site, data in data/ (see tools/build_data.py).

const $ = (id) => document.getElementById(id);
const XREF_FIRST = 12; // cross-references shown before "Show all"
const NT_START = 39; // index of Matthew in books.json

const state = {
  books: [], byId: {},
  book: "Gen", chapter: 1, verse: null, to: null,
  tab: "xref",
  person: null, // the person open in the People tab (a person number), kept while moving between verses
  tour: null, // {tr, i}: the open tour and step
  year: null, // the year of what is being read, marked on the timeline
  size: 19,
  version: "kjv", // "kjv", "cuv", or two of them for side by side ("kjv+cuv"); the first sets the interface language
  lang: "en",
};

// --- Interface language ---------------------------------------------------------

const L = {
  en: {
    xref: "Cross-references", people: "People", places: "Places", links: "Links", tours: "Tours", books: "Books",
    ot: "Old Testament", nt: "New Testament", version: "Translation",
    tapVerse: "Tap a verse", tapHint: "Its cross-references, people, places and links show up here.", orTour: "Or take a tour",
    prevCh: "Previous chapter (←)", nextCh: "Next chapter (→)", smaller: "Smaller text", larger: "Larger text",
    close: "Close", backBooks: "Back to books", endTour: "End tour",
    back: "‹ Back", next: "Next ›", finish: "Finish", map: "Map ↗", mapTitle: "Follow this step on the atlas map",
    stepOf: (i, n) => `${i} of ${n}`, steps: (n) => `${n} steps`,
    noXref: "No cross-references for this verse.", votes: "Votes on OpenBible.info: how many readers found this link helpful",
    showAll: (n) => `Show all ${n}`,
    noPlaces: (r) => `No places are named in ${r}.`, named: "Named in this verse",
    noPeople: (r) => `No one is named in ${r}.`, peopleIn: (r) => `No one is named in this verse. People in ${r}:`,
    rel: { father: "Father", mother: "Mother", partners: "Married to", children: "Children", siblings: "Brothers and sisters" },
    childOf: (g, n) => `${g === "F" ? "Daughter" : "Son"} of ${n}`, partnerOf: (g, n) => `${g === "F" ? "Wife" : "Husband"} of ${n}`,
    firstIn: (r) => `First named in ${r}`, allPeople: "‹ People in this verse", bioSrc: "Easton’s Bible Dictionary",
    family: "Family", namedIn: "Named in",
    inChapter: (r) => `No places named in this verse. Places in ${r}:`, partOf: "Part of",
    error: "Could not load this chapter. Check your connection and reload.", site: "Bible", atlas: "Atlas map",
    year: (y) => (y < 0 ? `${-y} BC` : `AD ${y}`),
    search: "Search (/)", searchPh: "Search the Bible",
    searchHint: "A reference, a word, a place, an event or a tour. Try “John 3:16”, “Bethlehem” or “shepherd”.",
    goTo: "Go to", events: "Events", verses: "Verses", nVerses: (n) => `${n.toLocaleString("en")} ${n === 1 ? "verse" : "verses"}`,
    more: (n) => `${n.toLocaleString("en")} more verses not shown. Add a word to narrow it down.`, none: "Nothing found.",
    searching: "Searching the text…",
    beginnings: "Before Abraham", beginningsShort: "Beginnings", beginningsTiny: "Beg", beforeYear: (y) => `Before ${y}`,
    beginningsSummary: "Creation, the fall, the flood and the nations: Genesis 1–11. The years are the traditional reckoning from the ages in Genesis.",
    youAreHere: "You are here", hereIn: (y) => `You are here, ${y}`, noYear: "This chapter has no date", readThis: "Chapters set in this time",
    eraMapTitle: "This time on the atlas map", timeline: "Timeline",
    mine: "My reading", plan: "Plan", marks: "Highlights", readingPlan: "Reading plan",
    planStart: "Read the Bible in a year", planPitch: "A few chapters a day, Genesis to Revelation in 365 days. Your progress stays in this browser.",
    planStartToday: "Start today", today: "Today", dayOf: (d, n) => `Day ${d} of ${n}`,
    chaptersRead: (a, n) => `${a.toLocaleString("en")} of ${n.toLocaleString("en")} chapters read`,
    catchUp: (n) => `Catch up · ${n} ${n === 1 ? "day" : "days"} behind`, allDays: (n) => `All ${n} days`, markRead: "Read",
    planReset: "Stop this plan", planResetAsk: "Stop the plan and clear which chapters you have read?",
    noMarks: "No highlights or notes yet. Tap a verse, then pick a colour or add a note.",
    nMarks: (n) => `${n} ${n === 1 ? "verse" : "verses"} highlighted or noted, kept in this browser.`,
    export: "Export", import: "Import", importFailed: "Could not import that file.",
    hl: { y: "Yellow", g: "Green", b: "Blue", p: "Pink" }, addNote: "+ Note", editNote: "Note", notePh: "Your note, kept in this browser",
    offline: "Offline", offlineNote: "Chapters you open stay available offline. Save the rest of the Bible to read anywhere, and add this site to your home screen to use it like an app.",
    saveOffline: (v, mb) => `Save ${v} for offline (about ${mb} MB)`, saving: (p) => `Saving… ${p}%`,
    saved: (v) => `${v} saved for offline ✓`, savedSome: (n) => `${n} files did not save. Try again.`,
    credit: `King James Version and 和合本 (Chinese Union Version), public domain. Cross-references from
      <a href="https://www.openbible.info/labs/cross-references/" target="_blank" rel="noopener">OpenBible.info</a> (CC BY).
      People, places and events from <a href="https://github.com/robertrouse/theographic-bible-metadata" target="_blank" rel="noopener">Theographic</a>
      (CC BY-SA), with biographies from Easton’s Bible Dictionary. Map from <a href="https://atlas.daiyip.com" target="_blank" rel="noopener">Atlas</a> and Natural Earth.`,
  },
  zh: {
    xref: "串珠", people: "人物", places: "地点", links: "链接", tours: "导览", books: "书卷",
    ot: "旧约", nt: "新约", version: "译本",
    tapVerse: "点选一节经文", tapHint: "它的串珠、人物、地点和链接会显示在这里。", orTour: "或者跟随导览",
    prevCh: "上一章 (←)", nextCh: "下一章 (→)", smaller: "缩小字体", larger: "放大字体",
    close: "关闭", backBooks: "返回书卷", endTour: "结束导览",
    back: "‹ 上一步", next: "下一步 ›", finish: "完成", map: "地图 ↗", mapTitle: "在历代地图上查看这一步",
    stepOf: (i, n) => `${i} / ${n}`, steps: (n) => `${n} 站`,
    noXref: "这节经文没有串珠。", votes: "OpenBible.info 上认为这条串珠有帮助的读者人数",
    showAll: (n) => `显示全部 ${n} 条`,
    noPlaces: (r) => `${r} 没有提到地名。`, named: "本节提到的地点",
    noPeople: (r) => `${r} 没有提到人名。`, peopleIn: (r) => `本节没有提到人名。${r} 中的人物：`,
    rel: { father: "父亲", mother: "母亲", partners: "配偶", children: "儿女", siblings: "兄弟姐妹" },
    childOf: (g, n) => `${n}的${g === "F" ? "女儿" : "儿子"}`, partnerOf: (g, n) => `${n}的${g === "F" ? "妻子" : "丈夫"}`,
    firstIn: (r) => `首次出现于${r}`, allPeople: "‹ 本节的人物", bioSrc: "Easton 圣经辞典（英文）",
    family: "家人", namedIn: "出现的经文",
    inChapter: (r) => `本节没有提到地名。${r} 中的地点：`, partOf: "所属事件",
    error: "无法载入这一章。请检查网络后重新载入。", site: "圣经", atlas: "地图",
    year: (y) => (y < 0 ? `公元前${-y}年` : `公元${y}年`),
    search: "搜索 (/)", searchPh: "搜索圣经",
    searchHint: "经文出处、字词、地点、事件或导览。试试“约翰福音 3:16”“伯利恒”或“牧人”。",
    goTo: "前往", events: "事件", verses: "经文", nVerses: (n) => `${n} 节`,
    more: (n) => `还有 ${n} 节没有列出。再加一个词可以缩小范围。`, none: "没有找到。",
    searching: "正在搜索经文…",
    beginnings: "亚伯拉罕以前", beginningsShort: "太初", beginningsTiny: "太初", beforeYear: (y) => `${y}以前`,
    beginningsSummary: "创造、堕落、洪水与列国：创世记 1–11 章。年代按创世记所载年岁的传统推算。",
    youAreHere: "当前位置", hereIn: (y) => `当前位置：${y}`, noYear: "这一章没有年代", readThis: "发生在这一时期的章节",
    eraMapTitle: "在历代地图上查看这一时期", timeline: "时间线",
    mine: "我的读经", plan: "计划", marks: "标记", readingPlan: "读经计划",
    planStart: "一年读完圣经", planPitch: "每天几章，365 天从创世记读到启示录。进度保存在这个浏览器里。",
    planStartToday: "今天开始", today: "今天", dayOf: (d, n) => `第 ${d} 天，共 ${n} 天`,
    chaptersRead: (a, n) => `已读 ${a} / ${n} 章`,
    catchUp: (n) => `补读 · 落后 ${n} 天`, allDays: (n) => `全部 ${n} 天`, markRead: "已读",
    planReset: "停止这个计划", planResetAsk: "停止计划并清除已读记录吗？",
    noMarks: "还没有标记或笔记。点选一节经文，再选一种颜色或写笔记。",
    nMarks: (n) => `已标记 ${n} 节经文，保存在这个浏览器里。`,
    export: "导出", import: "导入", importFailed: "无法导入这个文件。",
    hl: { y: "黄色", g: "绿色", b: "蓝色", p: "粉色" }, addNote: "+ 笔记", editNote: "笔记", notePh: "你的笔记，保存在这个浏览器里",
    offline: "离线阅读", offlineNote: "打开过的章节离线也能读。保存整本圣经即可随处阅读；把本站添加到主屏幕，就能像应用一样使用。",
    saveOffline: (v, mb) => `保存${v}供离线阅读（约 ${mb} MB）`, saving: (p) => `正在保存… ${p}%`,
    saved: (v) => `${v}已可离线阅读 ✓`, savedSome: (n) => `有 ${n} 个文件没有保存，请重试。`,
    credit: `和合本与英王钦定本（KJV）均为公有领域。串珠来自
      <a href="https://www.openbible.info/labs/cross-references/" target="_blank" rel="noopener">OpenBible.info</a>（CC BY）。
      人物、地点与事件来自 <a href="https://github.com/robertrouse/theographic-bible-metadata" target="_blank" rel="noopener">Theographic</a>
      （CC BY-SA），人物简介来自 Easton 圣经辞典。地图来自<a href="https://atlas.daiyip.com" target="_blank" rel="noopener">历代地图</a>与 Natural Earth。`,
  },
};
const KINDS_ZH = { City: "城", Island: "岛", Landmark: "地标", Mountain: "山", Path: "道路", Region: "地区", Valley: "谷", Water: "水域" };
const t = (k, ...a) => { const v = L[state.lang][k] ?? L.en[k]; return typeof v === "function" ? v(...a) : v; };
const zh = () => state.lang === "zh";
const bname = (b) => (zh() ? b.name_zh : b.name);
const tx = (o, k) => (zh() && o[k + "_zh"]) || o[k]; // a field in the interface language
const fmtYear = (y) => t("year", y);

function applyLang() {
  const [first] = state.version.split("+");
  state.lang = first === "cuv" ? "zh" : "en";
  document.documentElement.lang = zh() ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
    if (el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.title);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = el.ariaLabel = t(el.dataset.i18nPh)));
  $("credit").innerHTML = t("credit");
  $("version").value = state.version;
}
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
const versions = () => state.version.split("+");
const bookText = (id, tr = versions()[0]) => loadJSON(`data/text/${tr}/${id}.json`);
const bookXref = (id) => loadJSON(`data/xref/${id}.json`).catch(() => ({}));
const bookContext = (id) => loadJSON(`data/vctx/${id}.json`).catch(() => ({ places: {}, people: {}, events: {}, years: {} }));

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
// "Prov.8.22-Prov.8.30" → "Proverbs 8:22–30" (or "箴言 8:22–30")
function refLabel(s) {
  const [a, z] = s.split("-").map((x) => x.split("."));
  let out = `${bname(state.byId[a[0]])} ${a[1]}:${a[2]}`;
  if (z) out += z[0] !== a[0] ? `–${bname(state.byId[z[0]])} ${z[1]}:${z[2]}` : z[1] !== a[1] ? `–${z[1]}:${z[2]}` : `–${z[2]}`;
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
  return out.join(zh() ? "" : " ");
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
  const key = `${b.id}.${state.chapter}.${state.version}`;
  $("ref-title").textContent = `${bname(b)} ${state.chapter}`;
  document.title = `${bname(b)} ${state.chapter} · ${t("site")}`;
  if (rendered !== key) {
    const vs = versions();
    const texts = await Promise.all(vs.map((tr) => bookText(b.id, tr)));
    if (`${state.book}.${state.chapter}.${state.version}` !== key) return; // navigated away meanwhile
    const art = $("chapter");
    art.innerHTML = "";
    art.classList.toggle("both", vs.length > 1);
    art.lang = vs[0] === "cuv" ? "zh-CN" : "en";
    const h = document.createElement("h1");
    h.innerHTML = `<small>${t(state.books.indexOf(b) >= NT_START ? "nt" : "ot")}</small>`;
    h.append(`${bname(b)} ${state.chapter}`);
    const p = document.createElement("p");
    texts[0][state.chapter - 1].forEach((verse, i) => {
      const s = document.createElement("span");
      s.className = "v";
      s.dataset.v = i + 1;
      s.innerHTML = `<sup>${i + 1}</sup>`;
      s.append(verse + (vs[0] === "cuv" ? "" : " "));
      if (vs[1]) s.append(secondLine(texts[1][state.chapter - 1][i], vs[1]));
      p.append(s);
    });
    art.append(h, p);
    rendered = key;
    for (const [id, dir] of [["prev2", -1], ["next2", 1]]) {
      const n = neighbour(dir);
      $(id).hidden = !n;
      if (n) $(id).querySelector("span").textContent = `${bname(state.byId[n.book])} ${n.chapter}`;
    }
    $("prev").disabled = !neighbour(-1);
    $("next").disabled = !neighbour(1);
    if (!state.verse) $("reader").scrollTo({ top: 0, behavior: "instant" });
    paintMarks();
    requestAnimationFrame(checkChapterEnd);
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

// The second translation of a verse, side by side.
function secondLine(text, tr) {
  const el = document.createElement("span");
  el.className = "v2";
  el.lang = tr === "cuv" ? "zh-CN" : "en";
  el.textContent = text || "";
  return el;
}

// --- Context panel ----------------------------------------------------------

const TABS = ["xref", "people", "places", "links"];

async function renderContext() {
  const open = state.verse != null;
  $("ctx-empty").hidden = open;
  $("ctx-body").hidden = !open;
  $("context").classList.toggle("open", open);
  document.body.classList.toggle("sheet-open", open);
  if (!open) return;
  const b = state.byId[state.book], v = state.verse, key = `${b.id}.${state.chapter}.${v}`;
  $("ctx-ref").textContent = `${bname(b)} ${state.chapter}:${v}`;
  const vs = versions(), texts = await Promise.all(vs.map((tr) => bookText(b.id, tr)));
  $("ctx-text").lang = vs[0] === "cuv" ? "zh-CN" : "en";
  $("ctx-text").replaceChildren(texts[0][state.chapter - 1][v - 1], ...(vs[1] ? [secondLine(texts[1][state.chapter - 1][v - 1], vs[1])] : []));
  renderMarkTools(key);
  document.querySelectorAll(".tabs button").forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === state.tab));
  for (const t of TABS) $("tab-" + t).hidden = t !== state.tab;
  renderLinks(b, state.chapter, v);
  renderPeople(b, state.chapter, v, key).catch((e) => console.error(e));
  renderPlaces(b, state.chapter, v, key).catch((e) => console.error(e));
  const refs = (await bookXref(b.id))[`${state.chapter}.${v}`] || [];
  if (`${state.book}.${state.chapter}.${state.verse}` !== key) return;
  $("xref-count").textContent = refs.length || "";
  renderXref(refs, XREF_FIRST);
}

function renderXref(refs, limit) {
  const pane = $("tab-xref");
  pane.innerHTML = "";
  if (!refs.length) { pane.innerHTML = `<p class="note">${t("noXref")}</p>`; return; }
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
    vt.title = t("votes");
    vt.textContent = `${votes} ▲`;
    const xt = document.createElement("div");
    xt.className = "xt loading";
    xt.lang = versions()[0] === "cuv" ? "zh-CN" : "en";
    xt.textContent = "…";
    refText(ref).then((t) => { xt.textContent = t; xt.classList.remove("loading"); }).catch(() => (xt.textContent = ""));
    li.append(vt, a, xt);
    ul.append(li);
  }
  pane.append(ul);
  if (refs.length > limit) {
    const more = document.createElement("button");
    more.className = "pill more";
    more.textContent = t("showAll", refs.length);
    more.onclick = () => renderXref(refs, refs.length);
    pane.append(more);
  }
}

function renderLinks(b, c, v) {
  const q = encodeURIComponent(`${b.name} ${c}:${v}`);
  const links = zh() ? [
    [`https://www.biblegateway.com/passage/?search=${q}&version=CUVS`, "在 Bible Gateway 读和合本", "和合本（简体）"],
    [`https://www.biblegateway.com/passage/?search=${q}&version=NKJV`, "读英文 NKJV", "新钦定本（New King James Version）"],
    [`https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(b.name_zh)}`, `关于${b.name_zh}`, "维基百科"],
  ] : [
    [`https://www.biblegateway.com/passage/?search=${q}&version=NKJV`, "Read in NKJV", "Bible Gateway, New King James Version"],
    [`https://www.biblegateway.com/verse/en/${q}`, "Compare translations", "This verse in every English version on Bible Gateway"],
    [`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(`${b.name} book of the Bible`)}`, `About ${b.name}`, "Wikipedia"],
  ];
  $("tab-links").innerHTML = `<ul class="links">${links.map(([href, t, d]) =>
    `<li><a href="${href}" target="_blank" rel="noopener">${t} ↗</a><span>${d}</span></li>`).join("")}</ul>`;
}

// Places named in the verse (or, if none, in the chapter) on the atlas map, and the events the verse belongs to.
// Until the atlas has loaded (or if it can't), a small SVG map stands in for it.
async function renderPlaces(b, c, v, key) {
  const [places, { places: vp, events: ve, years = {} }, base] = await Promise.all([
    loadJSON("data/places.json"), bookContext(b.id), loadJSON("data/basemap.json")]);
  if (`${state.book}.${state.chapter}.${state.verse}` !== key) return;
  const here = vp[`${c}.${v}`] || [];
  let ids = here, scope = "verse";
  if (!ids.length) {
    ids = [...new Set(Object.entries(vp).filter(([k]) => k.startsWith(c + ".")).flatMap(([, l]) => l))];
    scope = "chapter";
  }
  // Places as [id, name, lon, lat, kind], with the name in the interface language where there is one.
  const pts = ids.map((i) => places[i]).map(([id, name, lon, lat, kind, nameZh]) => [id, (zh() && nameZh) || name, lon, lat, kind]);
  const evs = ve[`${c}.${v}`] || [];
  $("places-count").textContent = here.length || "";
  $("places-note").textContent = !ids.length ? t("noPlaces", `${bname(b)} ${c}`)
    : scope === "verse" ? t("named") : t("inChapter", `${bname(b)} ${c}`);
  $("map-fallback").replaceChildren(...(pts.length ? [drawMap(pts, base)] : []));
  $("map-box").hidden = !pts.length && !atlas.ready && !state.tour;
  // The map's year: the verse's first dated event, else the year Theographic gives the verse (or its chapter).
  syncAtlas(pts, evs.find((e) => e[1] != null)?.[1] ?? years[`${c}.${v}`] ?? years[c] ?? null);

  const pane = $("places-body");
  pane.innerHTML = "";
  if (ids.length) {
    const ul = document.createElement("ul");
    ul.className = "places";
    for (const [, name, lon, lat, kind] of pts) {
      const li = document.createElement("li");
      li.innerHTML = `<b></b> <span></span>`;
      li.firstChild.textContent = name;
      li.lastChild.textContent = [(zh() && KINDS_ZH[kind]) || kind, `${Math.abs(lat).toFixed(2)}°${lat < 0 ? "S" : "N"} ${Math.abs(lon).toFixed(2)}°${lon < 0 ? "W" : "E"}`].filter(Boolean).join(" · ");
      ul.append(li);
    }
    pane.append(ul);
  }
  if (evs.length) {
    const h = document.createElement("h3");
    h.textContent = t("partOf");
    const ul = document.createElement("ul");
    ul.className = "events";
    for (const [title, year, titleZh] of evs) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="yr"></span> `;
      li.firstChild.textContent = year == null ? "" : fmtYear(year);
      li.append((zh() && titleZh) || title);
      ul.append(li);
    }
    pane.append(h, ul);
  }
}

// --- People ---------------------------------------------------------------------

// data/people.json: [[name, name_zh, gender, father, mother, [partners], [children], [siblings], verse count, first verse,
//                     other names]]
// data/people/<n>.json: [[biography, [verses]]] for persons n*256 .. n*256+255 (see tools/build_data.py).
const P = { NAME: 0, ZH: 1, G: 2, FATHER: 3, MOTHER: 4, PARTNERS: 5, CHILDREN: 6, SIBLINGS: 7, COUNT: 8, FIRST: 9, ALIAS: 10 };
const loadPeople = () => loadJSON("data/people.json");
const personMore = (i) => loadJSON(`data/people/${i >> 8}.json`).then((c) => c[i & 255]);
const pname = (p) => (zh() && p[P.ZH]) || p[P.NAME];

// "Son of Jesse", or the first sentence of the biography.
function personLine(people, p, bio) {
  const short = (i) => pname(people[i]).replace(/\s*[（(].*[)）]$/, ""); // "Jacob (Israel)" → "Jacob"
  if (p[P.FATHER] != null || p[P.MOTHER] != null) return t("childOf", p[P.G], short(p[P.FATHER] ?? p[P.MOTHER]));
  if (p[P.PARTNERS].length) return t("partnerOf", p[P.G], short(p[P.PARTNERS][0]));
  if (zh() || !bio) return "";
  let first = bio.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s*\([^)]*\)/g, "").replace(/^[\s,;:]+/, "").split(/(?<=\w{4}[.;:])\s/)[0];
  if (!first) return "";
  first = first[0].toUpperCase() + first.slice(1);
  return first.length > 110 ? first.slice(0, 108).replace(/\s+\S*$/, "") + " …" : first;
}

// Escaped biography text, with its verse links ([Ex. 6:20](#Exod.6.20)) as reader links.
const bioHTML = (s) => esc(s).replace(/\[([^\]]+)\]\((#[1-3]?[A-Za-z]+\.\d+(?:\.\d+)?)\)/g, '<a href="$2">$1</a>');

async function renderPeople(b, c, v, key) {
  const [people, ctx] = await Promise.all([loadPeople(), bookContext(b.id)]);
  if (`${state.book}.${state.chapter}.${state.verse}` !== key) return;
  const vp = ctx.people || {}, here = vp[`${c}.${v}`] || [];
  $("people-count").textContent = here.length || "";
  if (state.person != null) return renderPerson(people, state.person, key);
  let ids = here, note = "";
  if (!ids.length) {
    ids = [...new Set(Object.entries(vp).filter(([k]) => k.startsWith(c + ".")).flatMap(([, l]) => l))];
    note = ids.length ? t("peopleIn", `${bname(b)} ${c}`) : t("noPeople", `${bname(b)} ${c}`);
  }
  const more = await Promise.all(ids.map(personMore));
  if (`${state.book}.${state.chapter}.${state.verse}` !== key || state.person != null) return;
  const pane = $("tab-people");
  pane.replaceChildren();
  if (note) pane.append(Object.assign(document.createElement("p"), { className: "note small", textContent: note }));
  const ul = document.createElement("ul");
  ul.className = "people";
  ids.forEach((i, k) => {
    const p = people[i], li = document.createElement("li"), btn = document.createElement("button");
    btn.innerHTML = `<b></b><span class="n"></span><span class="line"></span>`;
    btn.children[0].textContent = pname(p);
    btn.children[1].textContent = t("nVerses", p[P.COUNT]);
    btn.children[2].textContent = personLine(people, p, more[k][0]);
    btn.onclick = () => { state.person = i; renderPeople(b, c, v, key); $("context").scrollTop = 0; };
    li.append(btn);
    ul.append(li);
  });
  pane.append(ul);
}

// One person: biography, family and every verse that names them. It stays open while moving between those verses.
async function renderPerson(people, i, key) {
  const p = people[i], [bio, refs] = await personMore(i);
  if (`${state.book}.${state.chapter}.${state.verse}` !== key || state.person !== i) return;
  const pane = $("tab-people"), el = (tag, cls, text) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, text != null ? { textContent: text } : {});
  const back = el("button", "pill back", t("allPeople"));
  back.onclick = () => { state.person = null; renderContext(); };
  const head = el("div", "person-head");
  const other = zh() ? p[P.NAME] : p[P.ZH];
  head.append(el("h3", "", pname(p)), ...(other ? [el("span", "other", other)] : []));
  const line = personLine(people, p, "");
  const card = [back, head];
  if (line) card.push(el("p", "person-line", line));
  if (bio) {
    const q = el("p", "bio");
    q.lang = "en";
    q.innerHTML = bioHTML(bio);
    card.push(q, el("p", "note small src", "— " + t("bioSrc")));
  }
  // Family: each one opens that person (at the first verse that names them).
  const fam = el("dl", "family");
  for (const [k, list] of [["father", [p[P.FATHER]]], ["mother", [p[P.MOTHER]]], ["partners", p[P.PARTNERS]],
                           ["children", p[P.CHILDREN]], ["siblings", p[P.SIBLINGS]]]) {
    const ids = list.filter((x) => x != null);
    if (!ids.length) continue;
    const dd = el("dd");
    for (const j of ids) {
      const a = el("button", "chip", pname(people[j]));
      a.onclick = () => openPerson(j, people[j][P.FIRST]);
      dd.append(a);
    }
    fam.append(el("dt", "", t("rel")[k]), dd);
  }
  if (fam.children.length) card.push(el("h4", "", t("family")), fam);
  // Verses, by book; the open one is marked.
  card.push(el("h4", "", `${t("namedIn")} · ${t("nVerses", refs.length)}`));
  const vl = el("div", "person-verses"), here = `${state.book}.${state.chapter}.${state.verse}`;
  let book = null, row = null;
  for (const r of refs) {
    const [bk, c, v] = r.split(".");
    if (bk !== book) {
      book = bk;
      row = el("p");
      row.append(el("b", "", bname(state.byId[bk]) + " "));
      vl.append(row);
    }
    const a = el("a", r === here ? "on" : "", `${c}:${v}`);
    a.href = hashFor(bk, c, v);
    row.append(a, " ");
  }
  card.push(vl);
  pane.replaceChildren(...card);
}

// Open a person's card at a verse (from family links and search).
function openPerson(i, ref) {
  state.person = i;
  state.tab = "people";
  store.set("bible-tab", "people");
  const [b, c, v] = ref.split(".");
  if (`${state.book}.${state.chapter}.${state.verse}` === ref) renderContext();
  else go(b, c, v);
}

// --- The atlas map ------------------------------------------------------------

// The atlas runs in an iframe (?embed=1) with this site's pack. The pack's bridge plugin (atlas/plugins/bridge.js)
// takes the messages below and reports tour steps and verse links back. ?atlas=<url> points at another atlas build.
const ATLAS = new URLSearchParams(location.search).get("atlas") || "https://atlas.daiyip.com/";
const atlas = { frame: null, ready: false, want: null, last: null };

// Show the open tour step if the reader is on it, else this verse's places.
function syncAtlas(pts, year) {
  const t = state.tour, step = t && parseRef(t.tr.steps[t.i].ref);
  const onStep = step && step.book === state.book && step.chapter === state.chapter && step.verse === state.verse;
  atlasSend(onStep ? { type: "tour", id: t.tr.id, step: t.i }
    : { type: "places", places: pts.map(([, name, lon, lat]) => [name, lon, lat]), year });
}
function atlasSend(msg) {
  atlas.want = msg;
  if (atlas.frame && atlas.lang !== state.lang) { // the atlas takes its language at load: start it again
    atlas.frame.remove();
    Object.assign(atlas, { frame: null, ready: false, last: null });
    $("map-box").classList.remove("live");
  }
  if (!atlas.frame && (state.tab === "places" || state.tour)) openAtlas();
  const key = JSON.stringify(msg);
  if (!atlas.ready || key === atlas.last) return;
  atlas.last = key;
  atlas.frame.contentWindow.postMessage({ bible: 1, ...msg }, new URL(ATLAS).origin);
}
function openAtlas() {
  const pack = new URL("atlas/manifest.json", location.href).href;
  const f = document.createElement("iframe");
  f.title = t("atlas");
  f.src = `${ATLAS}?pack=${encodeURIComponent(pack)}&packonly=1&embed=1&lang=${state.lang}`;
  atlas.lang = state.lang;
  f.allow = "fullscreen";
  atlas.frame = f;
  $("map-box").append(f);
}
addEventListener("message", (e) => {
  const m = e.data;
  if (!atlas.frame || e.source !== atlas.frame.contentWindow || e.origin !== new URL(ATLAS).origin || m?.bible !== 1) return;
  if (m.type === "ready") {
    atlas.ready = true;
    atlas.last = null;
    $("map-box").classList.add("live");
    $("map-box").hidden = false;
    if (atlas.want) atlasSend(atlas.want);
  } else if (m.type === "tour-step") {
    // A step taken on the map: follow it, without sending it back.
    atlas.last = JSON.stringify({ type: "tour", id: m.id, step: m.index });
    if (!state.tour || state.tour.tr.id !== m.id || state.tour.i !== m.index) startTour(m.id, m.index);
  } else if (m.type === "ref" && typeof m.ref === "string" && parseRef(m.ref)) {
    location.hash = m.ref;
  }
});

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
const PACK = "https://bible.daiyip.com/atlas/manifest.json";
const loadTours = () => loadJSON("atlas/tours.json");

async function fillTourList(list) {
  const tours = await loadTours();
  list.replaceChildren(...tours.map((tr) => {
    const btn = document.createElement("button");
    btn.className = "tour-item";
    const [b, span, small] = ["b", "span", "small"].map((t) => document.createElement(t));
    b.textContent = tx(tr, "title");
    span.textContent = `${fmtYear(tr.start)}${tr.end !== tr.start ? "–" + fmtYear(tr.end) : ""} · ${t("steps", tr.steps.length)}`;
    small.textContent = tx(tr, "summary");
    btn.append(b, span, small);
    btn.onclick = () => startTour(tr.id, 0);
    return btn;
  }));
}
function showTours() {
  $("picker-title").textContent = t("tours");
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
  if (!state.tour) state.tab = "places"; // a tour starts on the map
  state.tour = { tr, i };
  store.set("bible-tour", [id, i]);
  if ($("picker").open) $("picker").close();
  if ($("mine").open) $("mine").close();
  const ref = tr.steps[i].ref;
  if (decodeURIComponent(location.hash.slice(1)) === ref) { renderTour(); renderContext(); }
  else location.hash = ref;
}
function endTour() {
  state.tour = null;
  store.set("bible-tour", null);
  renderTour();
}
function renderTour() {
  const tour = state.tour;
  $("tour").hidden = !tour;
  if (!tour) return;
  const { tr, i } = tour, s = tr.steps[i], last = i === tr.steps.length - 1;
  $("tour-title").textContent = tx(tr, "title");
  $("tour-count").textContent = t("stepOf", i + 1, tr.steps.length);
  $("tour-year").textContent = fmtYear(s.year);
  $("tour-text").textContent = tx(s, "text");
  $("tour-prev").disabled = i === 0;
  $("tour-next").textContent = t(last ? "finish" : "next");
  $("tour-map").href = `${ATLAS}?pack=${encodeURIComponent(PACK)}&lang=${state.lang}#tour=${tr.id}&s=${i + 1}`;
}

// --- Book and chapter picker -------------------------------------------------

function showBooks() {
  $("picker-title").textContent = t("books");
  $("picker-back").hidden = true;
  const body = $("picker-body");
  body.innerHTML = "";
  for (const [label, list] of [[t("ot"), state.books.slice(0, NT_START)], [t("nt"), state.books.slice(NT_START)]]) {
    const h = document.createElement("div");
    h.className = "testament";
    h.textContent = label;
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const b of list) {
      const btn = document.createElement("button");
      btn.textContent = bname(b);
      if (b.id === state.book) btn.classList.add("cur");
      btn.onclick = () => (b.chapters.length === 1 ? go(b.id, 1) : showChapters(b));
      grid.append(btn);
    }
    body.append(h, grid);
  }
}
function showChapters(b) {
  $("picker-title").textContent = bname(b);
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
  if ($("picker").open) $("picker").close();
  location.hash = hashFor(book, chapter, verse);
}

// --- Search -------------------------------------------------------------------

// One box for references ("John 3:16", "约翰福音 3"), books, tours, events, places, and words in the text of the
// translation being read. The whole text loads on the first word search (66 files, cached after).
let searchSeq = 0, searchTimer = 0;
// Lower case, without accents, hyphens or the KJV's dashes ("Beth–lehem" is found as "bethlehem").
const SKIP = /[\u0300-\u036f\-–—‧·]/;
const norm = (s) => s.normalize("NFD").toLowerCase().split("").filter((c) => !SKIP.test(c)).join("");
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function openSearch() {
  $("search").showModal();
  $("search-q").select();
  runSearch();
}
// "John 3:16", "1 cor 13", "约翰福音 3:16" → {book, chapter, verse}
function queryRef(q) {
  const m = /^(.+?)\s*(\d+)(?:\s*[:：.]\s*(\d+))?$/.exec(q.trim());
  if (!m) return null;
  const name = norm(m[1]).replace(/\s+/g, "");
  if (!name) return null;
  const books = state.books.filter((b) => [b.name, b.name_zh, b.id].some((n) => norm(n).replace(/\s+/g, "").startsWith(name)));
  const b = books.find((b) => [b.name, b.name_zh, b.id].some((n) => norm(n).replace(/\s+/g, "") === name)) || books[0];
  if (!b || +m[2] < 1 || +m[2] > b.chapters.length) return null;
  const v = m[3] && +m[3] >= 1 && +m[3] <= b.chapters[+m[2] - 1] ? +m[3] : null;
  return { book: b.id, chapter: +m[2], verse: v };
}
// Text with the first match of the query in <mark>, mapped back through norm().
function marked(text, q) {
  const t0 = text.normalize("NFD"), at = [];
  let n = "";
  for (let i = 0; i < t0.length; i++) if (!SKIP.test(t0[i])) { n += t0[i].toLowerCase(); at.push(i); }
  const i = n.indexOf(norm(q));
  if (i < 0) return esc(t0);
  const a = at[i], z = at[i + norm(q).length - 1] + 1;
  return esc(t0.slice(0, a)) + "<mark>" + esc(t0.slice(a, z)) + "</mark>" + esc(t0.slice(z));
}
async function runSearch() {
  const q = $("search-q").value.trim(), seq = ++searchSeq, out = $("search-results");
  if (!q) { out.innerHTML = `<p class="note">${t("searchHint")}</p>`; return; }
  const nq = norm(q), groups = [];
  const has = (...xs) => xs.some((x) => x && norm(x).includes(nq));
  const item = (title, sub, act, html) => ({ title, sub, act, html });
  const add = (label, items) => items.length && groups.push([label, items]);
  const ref = queryRef(q);
  if (ref) {
    const b = state.byId[ref.book];
    add(t("goTo"), [item(`${bname(b)} ${ref.chapter}${ref.verse ? ":" + ref.verse : ""}`, "", () => go(ref.book, ref.chapter, ref.verse))]);
  }
  add(t("books"), state.books.filter((b) => has(b.name, b.name_zh)).map((b) => item(bname(b), "", () => go(b.id, 1))));
  const [tours, idx] = await Promise.all([loadTours(), loadJSON("data/search.json")]);
  if (seq !== searchSeq) return;
  const label = (en, zhName) => (zh() && zhName) || en;
  add(t("events"), idx.events.filter(([title, titleZh]) => has(title, titleZh)).slice(0, 30)
    .map(([title, titleZh, year, first]) => item(label(title, titleZh), [year != null && fmtYear(year), refLabel(first)].filter(Boolean).join(" · "), () => go(...first.split("."))))); 
  // People and places: names that start with the query first.
  const people = await loadPeople();
  if (seq !== searchSeq) return;
  const starts = (p) => norm(pname(p)).startsWith(nq);
  add(t("people"), people.map((p, i) => [p, i]).filter(([p]) => has(p[P.NAME], p[P.ZH], ...p[P.ALIAS].split(",")))
    .sort(([a], [b]) => (starts(b) - starts(a)) || b[P.COUNT] - a[P.COUNT]).slice(0, 30)
    .map(([p, i]) => item(pname(p), [personLine(people, p, ""), t("nVerses", p[P.COUNT])].filter(Boolean).join(" · "),
      () => openPerson(i, p[P.FIRST]))));
  const places = idx.places.filter(([name, nameZh, , first]) => first && has(name, nameZh))
    .sort((a, b) => (norm(label(b[0], b[1])).startsWith(nq) - norm(label(a[0], a[1])).startsWith(nq)) || b[4] - a[4]).slice(0, 30);
  add(t("places"), places.map(([name, nameZh, kind, first, n]) =>
    item(label(name, nameZh), [(zh() && KINDS_ZH[kind]) || kind, t("nVerses", n)].filter(Boolean).join(" · "), () => go(...first.split(".")))));
  add(t("tours"), tours.filter((tr) => has(tr.title, tr.title_zh, tx(tr, "summary")))
    .map((tr) => item(tx(tr, "title"), tx(tr, "summary"), () => { $("search").close(); startTour(tr.id, 0); })));
  draw(out, groups, t("searching"));

  // Words in the text: needs at least two letters (or one Chinese character).
  if (q.length < (/[\u3400-\u9fff]/.test(q) ? 1 : 2) || ref) return draw(out, groups, groups.length ? "" : t("none"));
  const tr = versions()[0], hits = [];
  const texts = await Promise.all(state.books.map((b) => bookText(b.id, tr)));
  if (seq !== searchSeq) return;
  let total = 0;
  texts.forEach((chapters, bi) => chapters.forEach((verses, ci) => verses.forEach((text, vi) => {
    if (!norm(text).includes(nq)) return;
    if (++total <= 100) hits.push([state.books[bi], ci + 1, vi + 1, text]);
  })));
  add(`${t("verses")} · ${t("nVerses", total)}`, hits.map(([b, c, v, text]) =>
    item(`${bname(b)} ${c}:${v}`, "", () => go(b.id, c, v), marked(text, q))));
  draw(out, groups, total > 100 ? t("more", total - 100) : groups.length ? "" : t("none"));
}
function draw(out, groups, note) {
  out.replaceChildren();
  for (const [label, items] of groups) {
    const h = document.createElement("div");
    h.className = "testament";
    h.textContent = label;
    const ul = document.createElement("ul");
    ul.className = "results";
    for (const it of items) {
      const li = document.createElement("li"), btn = document.createElement("button");
      btn.innerHTML = `<b></b>${it.sub ? "<span></span>" : ""}${it.html ? "<small></small>" : ""}`;
      btn.querySelector("b").textContent = it.title;
      if (it.sub) btn.querySelector("span").textContent = it.sub;
      if (it.html) btn.querySelector("small").innerHTML = it.html;
      btn.onclick = () => { if ($("search").open) $("search").close(); it.act(); };
      li.append(btn);
      ul.append(li);
    }
    out.append(h, ul);
  }
  if (note) {
    const p = document.createElement("p");
    p.className = "note";
    p.textContent = note;
    out.append(p);
  }
}

// --- Timeline -------------------------------------------------------------------------------------------
// A strip under the top bar with the eras of the atlas pack, from the beginnings to the early church, and a mark for
// the year of what is being read. Each era is the same width, so the short ones (the Exodus, Jesus) can be tapped;
// the mark sits in proportion within its era. An era opens a card with its chapters (data/timeline.json) and events.

const BEFORE = { id: "before", start: -4004, glyph: "太初" }; // Genesis 1–11, before the first era
const loadEras = () => Promise.all([loadJSON("atlas/eras.json"), loadJSON("data/timeline.json")])
  .then(([{ eras }, chapters]) => {
    const all = [{ ...BEFORE, end: eras[0].start - 1 }, ...eras];
    const runs = Object.fromEntries(chapters);
    return all.map((e) => ({ ...e, runs: runs[e.id] || [] }));
  });
const eraName = (e) => (e.id === "before" ? t("beginnings") : tx(e, "name"));
const eraFor = (eras, y) => (y == null ? -1 : y < eras[1].start ? 0 : eras.findIndex((e) => e.start <= y && y <= e.end));
const eraYears = (e) => (e.id === "before" ? t("beforeYear", fmtYear(e.end + 1)) : `${fmtYear(e.start)}–${fmtYear(e.end)}`);

async function renderTimeline() {
  const eras = await loadEras(), bar = $("timeline");
  if (!bar.children.length || bar.dataset.lang !== state.lang) {
    bar.dataset.lang = state.lang;
    bar.replaceChildren(...eras.map((e, i) => {
      const b = el("button", "era");
      b.dataset.i = i;
      b.title = `${eraName(e)} · ${eraYears(e)}`;
      b.ariaLabel = b.title;
      const label = e.id === "before" ? [t("beginningsShort"), t("beginningsTiny")] : [e.short, e.tiny];
      b.append(el("span", "full", zh() ? e.glyph : label[0]), el("span", "tiny", zh() ? e.glyph : label[1]));
      b.onclick = () => showEra(i);
      return b;
    }), el("i", "here"));
  }
  const { years = {} } = await bookContext(state.book);
  const y = (state.verse && years[`${state.chapter}.${state.verse}`]) ?? years[state.chapter] ?? null;
  const i = eraFor(eras, y), here = bar.querySelector(".here");
  bar.querySelectorAll(".era").forEach((b) => b.classList.toggle("cur", +b.dataset.i === i));
  here.hidden = i < 0;
  state.year = i < 0 ? null : y;
  if (i < 0) { bar.title = t("noYear"); return; }
  const e = eras[i], seg = bar.children[i];
  const f = e.id === "before" ? 0.5 : (y - e.start + 0.5) / (e.end - e.start + 1); // Genesis 1–11: no scale before Abraham
  here.style.left = `${seg.offsetLeft + f * seg.offsetWidth}px`;
  bar.title = "";
  here.title = `${t("youAreHere")} · ${fmtYear(y)}`;
}

async function showEra(i) {
  const eras = await loadEras(), e = eras[i];
  $("picker-title").textContent = eraName(e);
  $("picker-back").hidden = true;
  const body = $("picker-body");
  body.replaceChildren();
  const head = el("p", "era-years", eraYears(e));
  if (eraFor(eras, state.year) === i) head.append(el("span", "era-here", ` · ${t("hereIn", fmtYear(state.year))}`));
  body.append(head);
  body.append(el("p", "era-summary", e.id === "before" ? t("beginningsSummary") : tx(e, "summary")));
  // Previous and next era, and the era on the atlas map.
  const nav = el("div", "era-nav");
  for (const [j, label] of [[i - 1, "‹ "], [i + 1, ""]]) {
    if (!eras[j]) continue;
    const b = el("button", "pill", j < i ? label + eraName(eras[j]) : eraName(eras[j]) + " ›");
    b.onclick = () => showEra(j);
    nav.append(b);
  }
  if (e.id !== "before") {
    const map = el("a", "pill", t("map"));
    map.href = `${ATLAS}?pack=${encodeURIComponent(PACK)}&lang=${state.lang}#y=${e.start}`;
    map.target = "_blank";
    map.rel = "noopener";
    map.title = t("eraMapTitle");
    nav.append(map);
  }
  body.append(nav);
  // The chapters set in this era, book by book: "Psalms 2–9, 11–12, …".
  if (e.runs.length) {
    body.append(el("h4", "", t("readThis")));
    const ul = el("ul", "era-books");
    let li = null, book = null;
    for (const [b, c1, c2] of e.runs) {
      if (b !== book) {
        book = b;
        li = el("li");
        li.append(el("b", "", bname(state.byId[b]) + " "));
        ul.append(li);
      } else li.append(", ");
      const a = el("a", "", c1 === c2 ? `${c1}` : `${c1}–${c2}`);
      a.href = hashFor(b, c1);
      a.onclick = () => $("picker").close();
      li.append(a);
    }
    body.append(ul);
  }
  // Its events, in order.
  const events = (await loadJSON("atlas/events.json")).filter((v) => (e.id === "before" ? v.year < e.end + 1 : e.start <= v.year && v.year <= e.end));
  if (events.length) {
    body.append(el("h4", "", `${t("events")} · ${events.length}`));
    const ul = el("ul", "results era-events");
    for (const v of events.sort((a, b) => a.year - b.year)) {
      const btn = el("button");
      const [rb, rc, rv] = v.refs[0].split("-")[0].split("."); // "1Sam.31.3-13"
      btn.append(el("b", "", tx(v, "title")), el("span", "", `${fmtYear(v.year)}${v.place ? " · " + tx(v, "place") : ""} · ${bname(state.byId[rb])} ${rc}:${rv}`));
      btn.onclick = () => { $("picker").close(); location.hash = v.refs[0]; };
      const li = el("li");
      li.append(btn);
      ul.append(li);
    }
    body.append(ul);
  }
  if (!$("picker").open) $("picker").showModal();
  body.scrollTop = 0;
  $("picker").scrollTop = 0;
}

// --- My reading: a Bible-in-a-year plan, highlights and notes -----------------------------------------
// Kept in this browser only (localStorage): "bible-plan" {start: "YYYY-MM-DD"}, "bible-read" ["Gen.1", ...],
// "bible-marks" {"John.3.16": {c: colour, n: note, t: time}}. Export and import move them to another browser.

const PLAN_DAYS = 365;
const COLORS = ["y", "g", "b", "p"]; // highlight colours: yellow, green, blue, pink
const mine = {
  plan: store.get("bible-plan"),
  read: new Set(store.get("bible-read") || []),
  marks: store.get("bible-marks") || {},
  tab: "plan",
};
const saveRead = () => store.set("bible-read", [...mine.read]);
const saveMarks = () => store.set("bible-marks", mine.marks);

// The whole Bible in 365 days of whole chapters, each day about the same number of verses.
let planDays = null;
function readingPlan() {
  if (planDays) return planDays;
  const chapters = state.books.flatMap((b) => b.chapters.map((n, i) => [`${b.id}.${i + 1}`, n]));
  const total = chapters.reduce((s, [, n]) => s + n, 0);
  planDays = Array.from({ length: PLAN_DAYS }, () => []);
  let sum = 0;
  for (const [ch, n] of chapters) {
    // A chapter goes to the day its middle verse falls in.
    planDays[Math.min(PLAN_DAYS - 1, Math.floor(((sum + n / 2) / total) * PLAN_DAYS))].push(ch);
    sum += n;
  }
  return planDays;
}
// ["Gen.1", "Gen.2", "Gen.3"] → "Genesis 1–3"; across books, "Genesis 50 – Exodus 2".
function chaptersLabel(chs) {
  if (!chs.length) return "";
  const [a, z] = [chs[0], chs[chs.length - 1]].map((c) => c.split("."));
  const name = (id) => bname(state.byId[id]);
  if (chs.length === 1) return `${name(a[0])} ${a[1]}`;
  return a[0] === z[0] ? `${name(a[0])} ${a[1]}–${z[1]}` : `${name(a[0])} ${a[1]} – ${name(z[0])} ${z[1]}`;
}
const today = () => new Date().toLocaleDateString("sv"); // YYYY-MM-DD, local time
const dayNumber = () => {
  const days = Math.round((new Date(today()) - new Date(mine.plan.start)) / 864e5);
  return Math.max(0, Math.min(PLAN_DAYS - 1, days));
};
const dayDone = (d) => readingPlan()[d].every((c) => mine.read.has(c));

// With a plan running, a chapter counts as read once its end (the footer under it) has been on screen.
function checkChapterEnd() {
  if (!mine.plan || !rendered) return;
  const ch = `${state.book}.${state.chapter}`;
  if (mine.read.has(ch)) return;
  const foot = document.querySelector(".chapter-foot").getBoundingClientRect(), box = $("reader").getBoundingClientRect();
  if (foot.top < box.bottom && foot.bottom > box.top) { mine.read.add(ch); saveRead(); renderTodayHint(); }
}

// The empty context panel: today's reading, or an invitation to start.
function renderTodayHint() {
  const box = $("ctx-today");
  box.replaceChildren();
  const btn = document.createElement("button");
  btn.className = "tour-item today";
  if (!mine.plan) {
    btn.innerHTML = "<b></b><small></small>";
    btn.children[0].textContent = t("planStart");
    btn.children[1].textContent = t("planPitch");
    btn.onclick = () => openMine("plan");
  } else {
    const d = dayNumber(), chs = readingPlan()[d];
    btn.innerHTML = "<b></b><span></span>";
    btn.children[0].textContent = chaptersLabel(chs);
    btn.children[1].textContent = `${t("today")} · ${t("dayOf", d + 1, PLAN_DAYS)}${dayDone(d) ? " · ✓" : ""}`;
    const next = chs.find((c) => !mine.read.has(c)) || chs[0];
    btn.onclick = () => go(...next.split("."));
  }
  box.append(btn);
}

function openMine(tab) {
  if (tab) mine.tab = tab;
  renderMine();
  $("mine").showModal();
}
function renderMine() {
  document.querySelectorAll("#mine .seg button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mine === mine.tab));
  const body = $("mine-body");
  body.replaceChildren();
  if (mine.tab === "tours") { // on narrow phones, where the bar has no room for a Tours button
    const list = el("div", "tour-list");
    body.append(list);
    fillTourList(list).catch(showError);
    return;
  }
  (mine.tab === "plan" ? renderPlan : renderMarks)(body);
  renderOffline(body);
}
const el = (tag, cls, text) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, text != null ? { textContent: text } : {});
function chapterLink(ch) {
  const [b, c] = ch.split("."), a = el("a", "", `${bname(state.byId[b])} ${c}`);
  a.href = hashFor(b, c);
  a.onclick = () => $("mine").close();
  return a;
}
function check(ch) {
  const box = el("input");
  box.type = "checkbox";
  box.checked = mine.read.has(ch);
  box.ariaLabel = t("markRead");
  box.onchange = () => { box.checked ? mine.read.add(ch) : mine.read.delete(ch); saveRead(); renderMine(); renderTodayHint(); };
  return box;
}

function renderPlan(body) {
  if (!mine.plan) {
    const start = el("button", "pill primary", t("planStartToday"));
    start.onclick = () => { mine.plan = { start: today() }; store.set("bible-plan", mine.plan); renderMine(); renderTodayHint(); };
    body.append(el("p", "plan-day", t("planStart")), el("p", "", t("planPitch")), start);
    return;
  }
  const days = readingPlan(), d = dayNumber();
  const all = days.flat(), done = all.filter((c) => mine.read.has(c)).length;
  const bar = el("div", "progress");
  bar.append(el("i"));
  bar.firstChild.style.width = `${(100 * done) / all.length}%`;
  body.append(el("p", "plan-day", t("dayOf", d + 1, PLAN_DAYS)), bar,
    el("p", "note small", t("chaptersRead", done, all.length)));
  // Today, and the earliest day not finished if that is earlier.
  const behind = days.findIndex((_, i) => !dayDone(i));
  for (const [label, i] of [[t("today"), d], ...(behind >= 0 && behind < d ? [[t("catchUp", d - behind), behind]] : [])]) {
    body.append(el("h4", "", `${label} · ${t("dayOf", i + 1, PLAN_DAYS)}`));
    const ul = el("ul", "plan-chapters");
    for (const ch of days[i]) {
      const li = el("li");
      const lab = el("label");
      lab.append(check(ch));
      li.append(lab, chapterLink(ch));
      ul.append(li);
    }
    body.append(ul);
  }
  // Every day, folded away.
  const det = el("details", "plan-all");
  det.append(el("summary", "", t("allDays", PLAN_DAYS)));
  const ol = el("ol", "plan-days");
  days.forEach((chs, i) => {
    const li = el("li", (i === d ? "on " : "") + (dayDone(i) ? "done" : ""));
    const a = el("a", "", chaptersLabel(chs));
    a.href = hashFor(...chs[0].split("."));
    a.onclick = () => $("mine").close();
    li.append(el("span", "n", String(i + 1)), a, el("span", "tick", dayDone(i) ? "✓" : ""));
    ol.append(li);
  });
  det.append(ol);
  const stop = el("button", "pill", t("planReset"));
  stop.onclick = () => {
    if (!confirm(t("planResetAsk"))) return;
    mine.plan = null; mine.read.clear();
    store.set("bible-plan", null); saveRead(); renderMine(); renderTodayHint();
  };
  body.append(det, stop);
}

// Highlights and notes, in Bible order.
function renderMarks(body) {
  const refs = Object.keys(mine.marks).sort((a, b) => {
    const [x, y] = [a, b].map((r) => r.split("."));
    return state.books.indexOf(state.byId[x[0]]) - state.books.indexOf(state.byId[y[0]]) || x[1] - y[1] || x[2] - y[2];
  });
  const tools = el("div", "mark-tools");
  const exp = el("button", "pill", t("export")), imp = el("button", "pill", t("import"));
  exp.onclick = exportMine;
  imp.onclick = importMine;
  tools.append(exp, imp);
  if (!refs.length) { body.append(el("p", "note", t("noMarks")), tools); return; }
  const ul = el("ul", "marks");
  body.append(el("p", "note small", t("nMarks", refs.length)), ul, tools);
  for (const ref of refs) {
    const m = mine.marks[ref], [b, c, v] = ref.split(".");
    const li = el("li", m.c ? "hl-" + m.c : "");
    const a = el("a", "", `${bname(state.byId[b])} ${c}:${v}`);
    a.href = hashFor(b, c, v);
    a.onclick = () => $("mine").close();
    const xt = el("div", "xt", "…");
    xt.lang = versions()[0] === "cuv" ? "zh-CN" : "en";
    bookText(b).then((tx) => (xt.textContent = tx[c - 1][v - 1])).catch(() => (xt.textContent = ""));
    li.append(a, xt);
    if (m.n) li.append(el("p", "mark-note", m.n));
    ul.append(li);
  }
}
function exportMine() {
  const data = { app: "bible.daiyip.com", version: 1, plan: mine.plan, read: [...mine.read], marks: mine.marks };
  const a = el("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
  a.download = `bible-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importMine() {
  const f = el("input");
  f.type = "file";
  f.accept = "application/json,.json";
  f.onchange = async () => {
    try {
      const data = JSON.parse(await f.files[0].text());
      if (data.app !== "bible.daiyip.com") throw new Error("not a backup from this site");
      // Merge: the backup adds to what is here; a verse in both keeps the backup's highlight and note.
      Object.assign(mine.marks, data.marks || {});
      for (const c of data.read || []) mine.read.add(c);
      if (data.plan && !mine.plan) mine.plan = data.plan;
      saveMarks(); saveRead(); store.set("bible-plan", mine.plan);
      rendered = ""; route(); renderMine(); renderTodayHint();
    } catch (e) { alert(t("importFailed") + " " + e.message); }
  };
  f.click();
}

// The verse's highlight and note, under its text in the context panel.
function renderMarkTools(key) {
  const box = $("ctx-mark"), m = mine.marks[key] || {};
  box.replaceChildren();
  const row = el("div", "swatches");
  for (const c of COLORS) {
    const s = el("button", "swatch hl-" + c);
    s.title = s.ariaLabel = t("hl")[c];
    s.setAttribute("aria-pressed", m.c === c);
    s.onclick = () => setMark(key, { c: m.c === c ? null : c });
    row.append(s);
  }
  const note = el("button", "pill small-pill", m.n ? t("editNote") : t("addNote"));
  row.append(note);
  box.append(row);
  const area = el("textarea", "note-box");
  area.placeholder = t("notePh");
  area.value = m.n || "";
  area.hidden = !m.n;
  area.oninput = () => setMark(key, { n: area.value }, false);
  note.onclick = () => { area.hidden = false; area.focus(); };
  box.append(area);
}
function setMark(key, change, redraw = true) {
  const m = { ...mine.marks[key], ...change, t: Date.now() };
  if (!m.c) delete m.c;
  if (!m.n?.trim()) delete m.n;
  if (m.c || m.n) mine.marks[key] = m; else delete mine.marks[key];
  saveMarks();
  paintMarks();
  if (redraw) renderMarkTools(key);
}
// Highlight colours and note dots on the open chapter.
function paintMarks() {
  document.querySelectorAll("#chapter .v").forEach((v) => {
    const m = mine.marks[`${state.book}.${state.chapter}.${v.dataset.v}`];
    v.classList.remove(...COLORS.map((c) => "hl-" + c), "noted");
    if (m?.c) v.classList.add("hl-" + m.c);
    if (m?.n) v.classList.add("noted");
  });
}

// --- Offline ----------------------------------------------------------------------------------------
// sw.js keeps every file the app has loaded. This loads the rest, so the whole Bible reads offline.

const OFFLINE_CACHE = "bible-data"; // shared with sw.js
function renderOffline(body) {
  if (!("serviceWorker" in navigator) || !window.caches) return;
  const vs = versions(), names = vs.map((v) => (v === "cuv" ? "和合本" : "KJV")).join(" + ");
  const box = el("div", "offline"), note = el("p", "note small", t("offlineNote"));
  const btn = el("button", "pill", t("saveOffline", names, Math.round(3.8 * vs.length + 9)));
  if ((store.get("bible-offline") || []).includes(state.version)) { btn.textContent = t("saved", names); btn.disabled = true; }
  btn.onclick = async () => {
    btn.disabled = true;
    const files = ["data/books.json", "data/places.json", "data/search.json", "data/people.json", "data/basemap.json", "data/timeline.json",
      "atlas/tours.json", "atlas/eras.json", "atlas/events.json",
      ...Array.from({ length: 12 }, (_, i) => `data/people/${i}.json`),
      ...state.books.flatMap((b) => [...vs.map((v) => `data/text/${v}/${b.id}.json`), `data/xref/${b.id}.json`, `data/vctx/${b.id}.json`])];
    let failed = 0;
    try {
      const cache = await caches.open(OFFLINE_CACHE);
      for (let i = 0; i < files.length; i += 8) {
        await Promise.all(files.slice(i, i + 8).map(async (f) => {
          if (!(await cache.match(f))) await cache.add(f).catch(() => failed++);
        }));
        btn.textContent = t("saving", Math.round((100 * Math.min(files.length, i + 8)) / files.length));
      }
    } catch { failed++; }
    if (failed) { btn.textContent = t("savedSome", failed); btn.disabled = false; return; }
    btn.textContent = t("saved", names);
    store.set("bible-offline", [...new Set([...(store.get("bible-offline") || []), state.version])]);
  };
  box.append(el("h4", "", t("offline")), note, btn);
  body.append(box);
}

// --- Routing and setup ---------------------------------------------------------

function route() {
  const r = parseRef(decodeURIComponent(location.hash.slice(1))) || parseRef(store.get("bible-pos")) || { book: "Gen", chapter: 1, verse: null, to: null };
  Object.assign(state, r);
  store.set("bible-pos", [r.book, r.chapter, r.verse].filter((x) => x != null).join("."));
  renderTour();
  renderChapter().then(renderContext).catch(showError);
  renderTimeline().catch((e) => console.error(e));
}
function showError(e) {
  console.error(e);
  $("chapter").innerHTML = `<p class="note">${t("error")}</p>`;
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
  // The translation: remembered, or 和合本 for a browser set to Chinese.
  const v = store.get("bible-version");
  state.version = ["kjv", "cuv", "kjv+cuv", "cuv+kjv"].includes(v) ? v : /^zh\b/i.test(navigator.language) ? "cuv" : "kjv";
  applyLang();
  $("version").onchange = () => {
    state.version = $("version").value;
    store.set("bible-version", state.version);
    applyLang();
    fillTourList($("ctx-tours")).catch((e) => console.error(e));
    renderTodayHint();
    if ($("mine").open) renderMine();
    route();
  };
  if (TABS.includes(store.get("bible-tab"))) state.tab = store.get("bible-tab");

  $("chapter").addEventListener("click", (e) => {
    const el = e.target.closest(".v");
    if (!el) return;
    const v = +el.dataset.v;
    location.hash = hashFor(state.book, state.chapter, v === state.verse ? null : v);
  });
  document.querySelector(".tabs").addEventListener("click", (e) => {
    const t = e.target.closest("button")?.dataset.tab;
    if (!t) return;
    if (t === "people" && state.tab === "people") state.person = null; // the tab again goes back to the verse's people
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
    if ($("picker").open || $("search").open || $("mine").open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return; // typing a note or picking a translation
    if (e.key === "/") { e.preventDefault(); openSearch(); return; }
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Escape" && state.verse) location.hash = hashFor(state.book, state.chapter);
  });
  $("tours-btn").onclick = () => { showTours(); $("picker").showModal(); };
  $("mine-btn").onclick = () => openMine();
  $("mine-x").onclick = () => $("mine").close();
  $("mine").addEventListener("click", (e) => { if (e.target === $("mine")) $("mine").close(); });
  document.querySelectorAll("#mine .seg button").forEach((b) => (b.onclick = () => { mine.tab = b.dataset.mine; renderMine(); }));
  let endCheck = 0;
  $("reader").addEventListener("scroll", () => { cancelAnimationFrame(endCheck); endCheck = requestAnimationFrame(checkChapterEnd); }, { passive: true });
  renderTodayHint();
  $("search-btn").onclick = openSearch;
  $("search-x").onclick = () => $("search").close();
  $("search").addEventListener("click", (e) => { if (e.target === $("search")) $("search").close(); });
  $("search-q").addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 200); });
  $("search-q").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); $("search-results").querySelector("button")?.click(); }
  });
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
  // Works offline once loaded (sw.js), and can be installed from the browser's menu.
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch((e) => console.error(e));
}

init().catch(showError);
