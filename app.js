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
  chapterCtx: false, // the panel shows the chapter's context while no verse is selected (chosen by the reader)
  scope: "sel", // with verses selected, the panel shows them ("sel") or the whole chapter ("chapter")
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
    prevCh: "Previous chapter (←)", nextCh: "Next chapter (→)", textSize: "Text size", sizes: ["Smallest", "Small", "Normal", "Large", "Larger", "Largest"],
    close: "Close", sheetHandle: "Drag or tap to resize", backBooks: "Back to books", endTour: "End tour",
    back: "‹ Back", next: "Next ›", finish: "Finish", map: "Map ↗", mapTitle: "Follow this step on the atlas map",
    stepOf: (i, n) => `${i} of ${n}`, steps: (n) => `${n} steps`,
    noXref: "No cross-references for this verse.", votes: "Votes on OpenBible.info: how many readers found this link helpful",
    showAll: (n) => `Show all ${n}`,
    noPlaces: (r) => `No places are named in ${r}.`, named: (m) => m ? "Named in these verses" : "Named in this verse",
    noPeople: (r) => `No one is named in ${r}.`,
    chapterBtn: "Context", chapterTitle: "Cross-references, people and places of the whole chapter",
    showChapter: (r) => `See all of ${r}`, scopeSel: (m) => m ? "These verses" : "This verse", scopeChapter: "Whole chapter",
    chapterNote: "Everything in this chapter. Tap a verse to see just that verse.",
    aboutBook: (n) => `About ${n}`, introAuthor: "Author", introDate: "Written", introKey: "Key verse", introOutline: "Outline",
    introRange: (a, z, one) => (one ? (a === z ? "v. " : "vv. ") : "Ch. ") + (a === z ? a : `${a}–${z}`),
    introNote: "Authors and dates follow traditional views; scholars differ on some.",
    topics: "Topics", topicRefs: (n) => `${n.toLocaleString("en")} references`, topicSee: "See", topicHere: "Cites this verse",
    topicSrc: "From Nave's Topical Bible (1896).", popularTopics: "Popular topics",
    parallels: "Parallel accounts", harmony: "Gospel harmony", allSections: "All sections", compare: "Compare",
    harmonyNote: "Sections follow the order of the classic harmonies; where the Gospels tell an event at different points, it sits where most place it.",
    onlyIn: (g) => `Only in ${g}`, noXrefCh: "No cross-references for this chapter.",
    noPeopleSel: (m) => `No one is named in ${m ? "these verses" : "this verse"}.`,
    noPlacesSel: (m) => `No places are named in ${m ? "these verses" : "this verse"}.`, placesIn: (r) => `Named in ${r}`,
    rel: { father: "Father", mother: "Mother", partners: "Married to", children: "Children", siblings: "Brothers and sisters" },
    childOf: (g, n) => `${g === "F" ? "Daughter" : "Son"} of ${n}`, partnerOf: (g, n) => `${g === "F" ? "Wife" : "Husband"} of ${n}`,
    firstIn: (r) => `First named in ${r}`, allPeople: "‹ People in this verse", bioSrc: "Easton’s Bible Dictionary",
    family: "Family", namedIn: "Named in", tree: "Family tree", treeTitle: (n) => `Family tree · ${n}`, installTitle: (d) => `Install Bible on your ${{ ipad: "iPad", mac: "Mac" }[d] || "iPhone"}`,
    installWhyMac: "It opens in its own window from the Dock and Launchpad, like an app, and keeps working offline.",
    installMacSafari: "In the menu bar choose File › Add to Dock… (or click Share in the toolbar, then Add to Dock).",
    installMacChrome: "Click the install icon at the right end of the address bar (or ⋮ › Cast, save and share › Install page as app).",
    installMacEdge: "Click the app icon at the right end of the address bar (or … › Apps › Install this site as an app).",
    installMacDone: "Click Add or Install. Bible is now in your Dock and Launchpad.", installNow: "Install",
    installWhy: "It opens full screen from your Home Screen, like an app, and keeps working offline.",
    installInApp: "First open this page in Safari: tap ⋯ (or the share menu) and choose Open in Safari.",
    installShare: (where) => `Tap Share ${where}.`, installWhereIphone: "at the bottom of the screen (or under ⋯)",
    installWhereIpad: "at the top right, beside the address", installWhereOther: "in the address bar or the menu",
    installAdd: "Scroll down and tap Add to Home Screen.", installDone: "Tap Add. Bible is now on your Home Screen.",
    installLater: "Not now", installNever: "Don't show it again", installBtn: (d) => `Install on ${{ ipad: "iPad", mac: "Mac" }[d] || "iPhone"}`,
    share: "Share this view", copied: "Link copied", shareTitle: (r) => `${r} · Interactive Bible`,
    kingsTitle: "Kings of Israel and Judah", kingsBtn: "Kings of Israel and Judah ›", kingsShort: "Kings chart", israel: "Israel (north)", judah: "Judah (south)",
    united: "the united kingdom", kingOf: (k) => `King of ${k}`, prophetTo: (k) => `Prophet to ${k}`, nYears: (n) => `${n} ${n === 1 ? "year" : "years"}`,
    kingGood: "Did right", kingEvil: "Did evil", kingNone: "No verdict", prophets: "Prophets", readRef: (r) => `Read ${r}`,
    verdictGood: "“He did that which was right in the sight of the LORD.”", verdictEvil: "“He did evil in the sight of the LORD.”",
    verdictNone: "Kings gives no verdict on this reign.",
    kingsNote: "Years BC, after Thiele. A reign that overlaps the one before (a co-regency or a rival) starts where it ends. Tap a king or prophet.",
    landTitle: "Land of Canaan", landBtn: "Land of Canaan ›", nPlaces: (n) => `${n} places`, landmarks: "Borders and landmarks",
    alsoCalled: (n) => `Also called ${n}`, landNote: "How Joshua divided the land (Joshua 13–21). Tap a tribe to pin its places on the map, a place to label it, and a verse number to read it.",
    treeLine: "Line:", treeWed: (n) => `m. ${n}`,
    treeNote: "Tap a name to see the tree around them.", nKids: (n) => `${n} ${n === 1 ? "child" : "children"}`, showPerson: (n) => `Open ${n}`,
    partOf: "Part of",
    error: "Could not load this chapter. Check your connection and reload.", site: "Bible", atlas: "Atlas map",
    year: (y) => (y < 0 ? `${-y} BC` : `AD ${y}`), yearSpan: (a, z) => `${-a}–${-z} BC`,
    search: "Search (/)", searchPh: "Search the Bible",
    searchHint: "A reference, a word, a place, an event or a tour. Try “John 3:16”, “Bethlehem” or “shepherd”.",
    goTo: "Go to", events: "Events", verses: "Verses", nVerses: (n) => `${n.toLocaleString("en")} ${n === 1 ? "verse" : "verses"}`,
    more: (n) => `${n.toLocaleString("en")} more verses not shown. Add a word to narrow it down.`, none: "Nothing found.",
    searching: "Searching the text…",
    beginnings: "Before Abraham", beginningsShort: "Beginnings", beginningsTiny: "Beg", beforeYear: (y) => `Before ${y}`,
    beginningsSummary: "Creation, the fall, the flood and the nations: Genesis 1–11. The years are the traditional reckoning from the ages in Genesis.",
    youAreHere: "You are here", hereIn: (y) => `You are here, ${y}`, noYear: "This chapter has no date", readThis: "Chapters set in this time",
    eraMapTitle: "This time on the atlas map", timeline: "Timeline", timelineTitle: "Where this is in Bible history",
    tapWord: "Tap a word to see everywhere it is used", wordSum: (n, b) => `${n.toLocaleString("en")} ${n === 1 ? "verse" : "verses"} in ${b} ${b === 1 ? "book" : "books"}`,
    mostIn: (s) => `Most in ${s}.`, allBooks: "All books",
    origWords: (h) => h ? "Hebrew words" : "Greek words", origAll: (n) => `Every verse with this word (${n.toLocaleString("en")})`,
    origSeeAll: "Every verse with this word", rendered: "The KJV translates it as", origOf: (w) => `The word behind “${w}”`,
    origNote: "Strong’s numbers and definitions from Strong’s Concordance; KJV tagging from MetaV.", allRenderings: "All",
    xrefList: "List", xrefWeb: "Web", webLabel: "This verse and its strongest cross-references",
    webNote: (n) => `The ${n} strongest cross-references, in Bible order from the top (grey for the Old Testament, blue for the New); bigger means more votes. Faint lines join ones that cross-reference each other. Tap one to move there.`,
    listen: "Listen", listenTitle: "Read this chapter aloud", listenPause: "Pause", listenGo: "Play", listenStop: "Stop reading",
    listenPrev: "Previous verse", listenNext: "Next verse", listenRate: "Reading speed", listenVoice: "Voice",
    voiceMore: "More voices can be added in your device's settings (Accessibility › Spoken Content on iPhone and Mac).",
    play: "▶ Play", pause: "❚❚ Pause", playTitle: "Play the tour: steps move on by themselves and the map traces the route",
    card: "Card", cardTip: "A picture of this verse over a map of its places, to share", cardTitle: "Verse card",
    light: "Light", dark: "Dark", share: "Share…", download: "Download",
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
      (CC BY-SA), with biographies from Easton’s Bible Dictionary. Hebrew and Greek words from Strong’s Concordance,
      tagged to the KJV by <a href="https://github.com/theonize/KJV-bible-database-with-metadata-MetaV-" target="_blank" rel="noopener">MetaV</a> (CC BY-SA). Map from <a href="https://atlas.daiyip.com" target="_blank" rel="noopener">Atlas</a> and Natural Earth.`,
  },
  zh: {
    xref: "串珠", people: "人物", places: "地点", links: "链接", tours: "导览", books: "书卷",
    ot: "旧约", nt: "新约", version: "译本",
    tapVerse: "点选一节经文", tapHint: "它的串珠、人物、地点和链接会显示在这里。", orTour: "或者跟随导览",
    prevCh: "上一章 (←)", nextCh: "下一章 (→)", textSize: "字体大小", sizes: ["最小", "小", "标准", "大", "较大", "最大"],
    close: "关闭", sheetHandle: "拖动或轻点以调整大小", backBooks: "返回书卷", endTour: "结束导览",
    back: "‹ 上一步", next: "下一步 ›", finish: "完成", map: "地图 ↗", mapTitle: "在历代地图上查看这一步",
    stepOf: (i, n) => `${i} / ${n}`, steps: (n) => `${n} 站`,
    noXref: "这节经文没有串珠。", votes: "OpenBible.info 上认为这条串珠有帮助的读者人数",
    showAll: (n) => `显示全部 ${n} 条`,
    noPlaces: (r) => `${r} 没有提到地名。`, named: (m) => m ? "这几节提到的地点" : "本节提到的地点",
    noPeople: (r) => `${r} 没有提到人名。`,
    chapterBtn: "背景", chapterTitle: "整章的串珠、人物和地点",
    showChapter: (r) => `查看${r}全章`, scopeSel: (m) => m ? "所选经文" : "本节", scopeChapter: "整章",
    chapterNote: "这一章的全部内容。点选一节经文，只看那一节。",
    aboutBook: (n) => `关于${n}`, introAuthor: "作者", introDate: "年代", introKey: "钥节", introOutline: "大纲",
    introRange: (a, z, one) => (a === z ? `第${a}` : `${a}–${z}`) + (one ? "节" : "章"),
    introNote: "作者与年代采用传统看法，学者对其中一些看法不一。",
    topics: "主题", topicRefs: (n) => `${n} 处经文`, topicSee: "参见", topicHere: "引用了这节经文",
    topicSrc: "取自 Nave's Topical Bible（1896 年）。分项说明为英文原文，部分主题暂无中文名称。", popularTopics: "常见主题",
    parallels: "平行记载", harmony: "四福音合参", allSections: "全部段落", compare: "对照",
    harmonyNote: "段落按传统合参的次序排列；各福音书记载次序不同的事件，按多数福音书的位置排列。",
    onlyIn: (g) => `只记于${g}`, noXrefCh: "这一章没有串珠。",
    noPeopleSel: (m) => `${m ? "这几节" : "本节"}没有提到人名。`,
    noPlacesSel: (m) => `${m ? "这几节" : "本节"}没有提到地名。`, placesIn: (r) => `${r} 提到的地点`,
    rel: { father: "父亲", mother: "母亲", partners: "配偶", children: "儿女", siblings: "兄弟姐妹" },
    childOf: (g, n) => `${n}的${g === "F" ? "女儿" : "儿子"}`, partnerOf: (g, n) => `${n}的${g === "F" ? "妻子" : "丈夫"}`,
    firstIn: (r) => `首次出现于${r}`, allPeople: "‹ 本节的人物", bioSrc: "Easton 圣经辞典（英文）",
    family: "家人", namedIn: "出现的经文", tree: "家谱", treeTitle: (n) => `家谱 · ${n}`, installTitle: (d) => `把圣经安装到 ${{ ipad: "iPad", mac: "Mac" }[d] || "iPhone"}`,
    installWhyMac: "从程序坞和启动台打开，在独立窗口中像应用一样使用，离线也能用。",
    installMacSafari: "在菜单栏选择“文件 › 添加到程序坞…”（或点工具栏的“分享”，再选“添加到程序坞”）。",
    installMacChrome: "点地址栏右端的安装图标（或 ⋮ › 投放、保存和分享 › 将网页作为应用安装）。",
    installMacEdge: "点地址栏右端的应用图标（或 … › 应用 › 将此站点作为应用安装）。",
    installMacDone: "点“添加”或“安装”，圣经就在程序坞和启动台里了。", installNow: "安装",
    installWhy: "从主屏幕打开，像应用一样全屏显示，离线也能用。",
    installInApp: "请先用 Safari 打开本页：轻点 ⋯（或分享菜单），选择“在 Safari 中打开”。",
    installShare: (where) => `轻点“分享”按钮${where}。`, installWhereIphone: "（在屏幕底部，或在 ⋯ 里）",
    installWhereIpad: "（在右上角，地址栏旁）", installWhereOther: "（在地址栏或菜单里）",
    installAdd: "向下滚动，轻点“添加到主屏幕”。", installDone: "轻点“添加”，圣经就在主屏幕上了。",
    installLater: "以后再说", installNever: "不再显示", installBtn: (d) => `安装到 ${{ ipad: "iPad", mac: "Mac" }[d] || "iPhone"}`,
    share: "分享当前视图", copied: "链接已复制", shareTitle: (r) => `${r} · 互动圣经`,
    kingsTitle: "以色列和犹大的君王", kingsBtn: "以色列和犹大的君王 ›", kingsShort: "君王图", israel: "以色列（北国）", judah: "犹大（南国）",
    united: "统一王国", kingOf: (k) => `${k}的王`, prophetTo: (k) => `向${k}说话的先知`, nYears: (n) => `${n} 年`,
    kingGood: "行耶和华眼中看为正的事", kingEvil: "行耶和华眼中看为恶的事", kingNone: "未作评价", prophets: "先知", readRef: (r) => `阅读${r}`,
    verdictGood: "“他行耶和华眼中看为正的事。”", verdictEvil: "“他行耶和华眼中看为恶的事。”", verdictNone: "列王纪未对这位君王作出评价。",
    kingsNote: "公元前年份，依泰利（Thiele）年表。与前一位重叠的在位（共治或对立）从前一位结束处开始画。轻点君王或先知。",
    landTitle: "迦南地", landBtn: "迦南地 ›", nPlaces: (n) => `${n} 处`, landmarks: "边界与地标",
    alsoCalled: (n) => `又名${n}`, landNote: "约书亚分地（书 13–21）。轻点支派，在地图上标出其地方；轻点地名，在地图上显示名称；轻点节数，阅读经文。",
    treeLine: "世系：", treeWed: (n) => `配偶：${n}`,
    treeNote: "轻点名字，查看以其为中心的家谱。", nKids: (n) => `${n} 个儿女`, showPerson: (n) => `查看${n}`,
    partOf: "所属事件",
    error: "无法载入这一章。请检查网络后重新载入。", site: "圣经", atlas: "地图",
    year: (y) => (y < 0 ? `公元前${-y}年` : `公元${y}年`), yearSpan: (a, z) => `公元前${-a}–${-z}年`,
    search: "搜索 (/)", searchPh: "搜索圣经",
    searchHint: "经文出处、字词、地点、事件或导览。试试“约翰福音 3:16”“伯利恒”或“牧人”。",
    goTo: "前往", events: "事件", verses: "经文", nVerses: (n) => `${n} 节`,
    more: (n) => `还有 ${n} 节没有列出。再加一个词可以缩小范围。`, none: "没有找到。",
    searching: "正在搜索经文…",
    beginnings: "亚伯拉罕以前", beginningsShort: "太初", beginningsTiny: "太初", beforeYear: (y) => `${y}以前`,
    beginningsSummary: "创造、堕落、洪水与列国：创世记 1–11 章。年代按创世记所载年岁的传统推算。",
    youAreHere: "当前位置", hereIn: (y) => `当前位置：${y}`, noYear: "这一章没有年代", readThis: "发生在这一时期的章节",
    eraMapTitle: "在历代地图上查看这一时期", timeline: "时间线", timelineTitle: "这段经文在圣经历史中的位置",
    tapWord: "点选一个词，查看它在全本圣经中出现的地方", wordSum: (n, b) => `${b} 卷书中共 ${n} 节`,
    mostIn: (s) => `出现最多：${s}。`, allBooks: "全部书卷",
    origWords: (h) => h ? "希伯来原文" : "希腊原文", origAll: (n) => `用到这个原文词的全部经文（${n} 节）`,
    origSeeAll: "用到这个原文词的全部经文", rendered: "钦定本（KJV）的译法", origOf: (w) => `“${w}”的原文`,
    origNote: "斯特朗编号和释义（英文）出自 Strong’s Concordance；钦定本标注出自 MetaV。", allRenderings: "全部",
    xrefList: "列表", xrefWeb: "关系图", webLabel: "本节与它最主要的串珠",
    webNote: (n) => `最主要的 ${n} 条串珠，从顶部起按圣经顺序排列（灰色为旧约，蓝色为新约）；圆点越大，票数越多。淡线连接彼此互为串珠的经文。点选即可前往。`,
    listen: "朗读", listenTitle: "朗读本章", listenPause: "暂停", listenGo: "播放", listenStop: "停止朗读",
    listenPrev: "上一节", listenNext: "下一节", listenRate: "语速", listenVoice: "声音",
    voiceMore: "可在设备设置中添加更多声音（iPhone 与 Mac：辅助功能 › 朗读内容）。",
    play: "▶ 播放", pause: "❚❚ 暂停", playTitle: "自动播放导览：逐站前进，地图描绘路线",
    card: "卡片", cardTip: "把这节经文配上地图做成图片分享", cardTitle: "经文卡片",
    light: "浅色", dark: "深色", share: "分享…", download: "下载",
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
      （CC BY-SA），人物简介来自 Easton 圣经辞典。希伯来文与希腊文原文来自 Strong’s Concordance，钦定本标注来自
      <a href="https://github.com/theonize/KJV-bible-database-with-metadata-MetaV-" target="_blank" rel="noopener">MetaV</a>（CC BY-SA）。地图来自<a href="https://atlas.daiyip.com" target="_blank" rel="noopener">历代地图</a>与 Natural Earth。`,
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
// Hebrew and Greek: per book, "c.v" -> [[word index, Strong's number or numbers]] (see tools/build_strongs.py), and
// Strong's entries in files of a hundred ("H72" holds H7200-H7299).
const bookStrongs = (id) => loadJSON(`data/strongs/${id}.json`).catch(() => ({}));
const lexEntry = async (sid) => (await loadJSON(`data/lexicon/${sid[0]}${Math.floor(+sid.slice(1) / 100)}.json`).catch(() => ({})))[+sid.slice(1)];
const strongIds = (bookId, n) => [].concat(n).map((x) => (state.books.indexOf(state.byId[bookId]) >= NT_START ? "G" : "H") + x);
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
const hashFor = (b, c, v, to) => "#" + [b, c, v].filter((x) => x != null).join(".") + (v != null && to > v ? "-" + to : "");
// The selection: one verse, or a run of verses in the chapter ("Gen.45.1-3").
const selVerses = () => state.verse == null ? [] : Array.from({ length: (state.to || state.verse) - state.verse + 1 }, (_, i) => state.verse + i);
// What the context panel shows: the selected verses, the whole chapter, or nothing (null).
const ctxScope = () => state.verse != null ? state.scope : state.chapterCtx ? "chapter" : null;
const selKey = () => `${state.book}.${state.chapter}.${state.verse}${state.to ? "-" + state.to : ""}:${ctxScope()}`;

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
    // On a phone the sheet covers the lower part of the text. Growing a selection leaves the text where it is.
    const fresh = freshSelection();
    const bottom = phone() ? box.top + box.height * 0.4 : box.bottom;
    if (fresh && (r.top < box.top + top + 40 || r.top > bottom - 40)) {
      $("reader").scrollTo({ top: $("reader").scrollTop + r.top - box.top - top - 80, behavior: "smooth" });
    }
  }
  lightVerses();
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

// On a phone the panel is a sheet over the bottom of the text, in three sizes: "peek" (a strip with the reference,
// leaving the text above it free to tap), "half" and "full". Its handle drags or taps between them; scrolling the
// text lowers it to a peek, and tapping the peek raises it again.
const SHEET_PEEK = 112;
const sheet = { size: "half", sel: null };
// A selection is new when it shares no verse with the one before (growing or trimming a selection is not).
const freshSelection = () => {
  const p = sheet.sel;
  return !p || p.bc !== `${state.book}.${state.chapter}` || (state.to || state.verse) < p.a || state.verse > p.z;
};
const phone = () => matchMedia("(max-width: 800px)").matches;
function setSheet(size) {
  sheet.size = size;
  $("context").dataset.size = size;
  if (size === "peek") $("context").scrollTop = 0;
}
function sheetControls() {
  const ctx = $("context"), handle = $("sheet-handle");
  const heights = () => ({ peek: SHEET_PEEK, half: innerHeight * 0.55, full: innerHeight - 60 });
  let drag = null;
  handle.addEventListener("pointerdown", (e) => {
    drag = { y: e.clientY, h: ctx.offsetHeight, moved: false };
    handle.setPointerCapture(e.pointerId);
    ctx.classList.add("dragging");
  });
  handle.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dy = drag.y - e.clientY;
    if (Math.abs(dy) > 4) drag.moved = true;
    if (drag.moved) ctx.style.height = Math.max(40, Math.min(innerHeight - 60, drag.h + dy)) + "px";
  });
  const end = () => {
    if (!drag) return;
    const h = ctx.offsetHeight, moved = drag.moved;
    drag = null;
    ctx.classList.remove("dragging");
    ctx.style.height = "";
    if (!moved) return setSheet(sheet.size === "half" ? "full" : "half");
    if (h < SHEET_PEEK * 0.6) return closeCtx(); // dragged away
    const hs = heights();
    setSheet(Object.keys(hs).reduce((a, z) => (Math.abs(hs[z] - h) < Math.abs(hs[a] - h) ? z : a)));
  };
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
  // Tapping the peek raises the sheet (and the tap does nothing else).
  ctx.addEventListener("click", (e) => {
    if (!phone() || sheet.size !== "peek" || e.target.closest("#sheet-x")) return;
    e.stopPropagation();
    e.preventDefault();
    setSheet("half");
  }, true);
  // Scrolling the text lowers the sheet, so the verses behind it can be read and tapped.
  let y0 = null;
  const lower = () => { if (phone() && ctxScope() && sheet.size !== "peek") setSheet("peek"); };
  $("reader").addEventListener("touchstart", (e) => { y0 = e.touches[0].clientY; }, { passive: true });
  $("reader").addEventListener("touchmove", (e) => { if (y0 != null && Math.abs(e.touches[0].clientY - y0) > 12) lower(); }, { passive: true });
  $("reader").addEventListener("wheel", lower, { passive: true });
  $("sheet-x").onclick = closeCtx;
}

// Chapter context: opened from the dock (or the panel's hint) with no verse selected, and closed with its ×.
function setChapterCtx(on) {
  state.chapterCtx = on;
  if (!phone()) store.set("bible-ctx-chapter", on); // remembered on a computer, where the panel has room
  renderContext();
}
const closeCtx = () => state.verse != null ? (location.hash = hashFor(state.book, state.chapter)) : setChapterCtx(false);

async function renderContext() {
  const scope = ctxScope(), open = scope != null, chapter = scope === "chapter";
  $("ctx-empty").hidden = open;
  $("ctx-body").hidden = !open;
  $("context").classList.toggle("open", open);
  document.body.classList.toggle("sheet-open", open);
  $("chapter-btn").setAttribute("aria-pressed", chapter);
  const b = state.byId[state.book], c = state.chapter;
  $("ctx-chapter").textContent = t("showChapter", `${bname(b)} ${c}`);
  if (!open) { sheet.sel = null; return; }
  const key = selKey();
  // A new selection opens the sheet half way, on its own verses; growing or trimming one keeps the sheet as it is.
  if (state.verse != null && freshSelection()) {
    setSheet("half");
    if (!sheet.keepScope) state.scope = "sel";
    sheet.keepScope = false;
  }
  else if (!sheet.sel) setSheet("half");
  const v = state.verse, picked = selVerses();
  sheet.sel = { bc: `${b.id}.${c}`, a: v ?? 0, z: picked.at(-1) ?? 0 }; // 0: no verse, so any selection is new
  // The verses whose context shows: the selection, or every verse of the chapter.
  const texts = await Promise.all(versions().map((tr) => bookText(b.id, tr)));
  if (selKey() !== key) return;
  const sel = chapter ? texts[0][c - 1].map((_, i) => i + 1) : picked;
  const span = picked.length > 1 ? `${v}–${picked.at(-1)}` : `${v}`;
  $("ctx-ref").textContent = chapter ? `${bname(b)} ${c}` : `${bname(b)} ${c}:${span}`;
  // With verses selected, a switch between them and their chapter.
  const seg = $("ctx-scope");
  seg.hidden = v == null;
  seg.replaceChildren(...[["sel", t("scopeSel", picked.length > 1)], ["chapter", t("scopeChapter")]].map(([k, label]) => {
    const btn = make("button", "", label);
    btn.setAttribute("aria-pressed", k === state.scope);
    btn.onclick = () => { state.scope = k; renderContext(); };
    return btn;
  }));
  const vs = versions(), orig = chapter ? {} : await bookStrongs(b.id);
  if (selKey() !== key) return;
  $("ctx-text").lang = vs[0] === "cuv" ? "zh-CN" : "en";
  if (chapter) {
    const intro = await introCard(b, c);
    if (selKey() !== key) return;
    $("ctx-text").replaceChildren(...(intro ? [intro] : []), make("span", "note small", t("chapterNote")));
    $("ctx-text").title = "";
    $("ctx-mark").replaceChildren();
    markKeys = [];
  } else {
    // Each word opens a word study (see openWord). A run of verses shows each with its number.
    const words = (tr, text) => {
      const frag = document.createDocumentFragment();
      for (const n of sel) {
        if (sel.length > 1) frag.append(el("sup", "vn", n));
        frag.append(wordSpans(text[c - 1][n - 1] || "", tr, tr === "kjv" ? (orig[`${c}.${n}`] || []).map(([i, x]) => [i, strongIds(b.id, x)]) : null), " ");
      }
      return frag;
    };
    const line2 = vs[1] ? secondLine("", vs[1]) : null;
    if (line2) line2.append(words(vs[1], texts[1]));
    $("ctx-text").replaceChildren(words(vs[0], texts[0]), ...(line2 ? [line2] : []));
    $("ctx-text").title = t("tapWord");
    renderMarkTools(sel.map((n) => `${b.id}.${c}.${n}`));
  }
  renderOrig(b, c, chapter ? [] : sel, orig, texts[vs.indexOf("kjv")] || await bookText(b.id, "kjv"), key);
  renderParallels(b, c, sel, chapter, key).catch((e) => console.error(e));
  renderTopics(b, c, sel, chapter, key).catch((e) => console.error(e));
  $("ctx-text").classList.toggle("chapter", chapter);
  document.querySelectorAll(".tabs button").forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === state.tab));
  for (const t of TABS) $("tab-" + t).hidden = t !== state.tab;
  renderLinks(b, c, chapter ? null : span.replace("–", "-"));
  renderPeople(b, c, sel, key).catch((e) => console.error(e));
  renderPlaces(b, c, sel, key).catch((e) => console.error(e));
  // Cross-references of every verse shown, each kept once with its best vote count (and, for a chapter, its verse).
  const all = await bookXref(b.id), best = new Map();
  for (const n of sel) for (const [r, votes] of all[`${c}.${n}`] || []) {
    if (!best.has(r) || best.get(r)[1] < votes) best.set(r, [r, votes, chapter ? `${c}:${n}` : null]);
  }
  const refs = [...best.values()].sort((x, z) => z[1] - x[1]);
  if (selKey() !== key) return;
  $("xref-count").textContent = refs.length || "";
  renderXref(refs, XREF_FIRST);
}

// A book's introduction, at the top of a chapter's context: what the book is about, its author and date, a key verse
// and an outline whose sections open their first chapter, with the open chapter's section marked. Folds away, and
// stays as the reader left it. (A one-chapter book's outline is in verses.)
const bookIntros = () => loadJSON("data/intros.json").catch(() => ({}));
async function introCard(b, c) {
  const e = (await bookIntros())[b.id];
  if (!e) return null;
  const k = zh() ? 1 : 0, one = b.chapters.length === 1, [kc, kv] = e.key.split(".").map(Number);
  const box = make("details", "intro");
  box.open = store.get("bible-intro-open") !== false;
  box.ontoggle = () => store.set("bible-intro-open", box.open);
  box.append(make("summary", "", t("aboutBook", bname(b))), make("p", "intro-about", e.about[k]));
  const facts = make("dl", "intro-facts"), keyLink = make("a", "", refLabel(`${b.id}.${kc}.${kv}`));
  keyLink.href = hashFor(b.id, kc, kv);
  const keyText = make("span", "intro-key");
  refText(`${b.id}.${kc}.${kv}`).then((x) => (keyText.textContent = x));
  facts.append(make("dt", "", t("introAuthor")), make("dd", "", e.author[k]), make("dt", "", t("introDate")), make("dd", "", e.date[k]),
    make("dt", "", t("introKey")), make("dd"));
  facts.lastChild.append(keyLink, " ", keyText);
  const list = make("ol", "intro-outline"), last = one ? b.chapters[0] : b.chapters.length;
  e.outline.forEach(([from, en, zhName], i) => {
    const to = (e.outline[i + 1]?.[0] ?? last + 1) - 1, a = make("a");
    a.href = one ? hashFor(b.id, 1, from) : hashFor(b.id, from);
    a.append(make("span", "", k ? zhName : en), make("small", "", t("introRange", from, to, one)));
    const li = make("li");
    if (!one && c >= from && c <= to) { li.className = "here"; a.setAttribute("aria-current", "true"); }
    li.append(a);
    list.append(li);
  });
  box.append(facts, make("h4", "", t("introOutline")), list, make("p", "note small", t("introNote")));
  return box;
}

// The Hebrew or Greek words of the selected verses, folded under their text: each with the KJV word it stands behind,
// opening every verse that uses it.
async function renderOrig(b, c, sel, orig, kjv, key) {
  const box = $("ctx-orig"), list = sel.flatMap((n) => {
    const words = wordsOf(kjv[c - 1][n - 1] || "");
    return (orig[`${c}.${n}`] || []).flatMap(([i, x]) => strongIds(b.id, x).map((sid) => [sid, words[i] || ""]));
  });
  box.hidden = !list.length;
  if (!list.length) return;
  const heb = list[0][0][0] === "H", summary = el("summary", "", t("origWords", heb));
  box.replaceChildren(summary);
  box.open = store.get("bible-orig-open") === true;
  box.ontoggle = () => { store.set("bible-orig-open", box.open); if (box.open) fill(); };
  const fill = async () => {
    if (box.querySelector(".orig-words")) return;
    const entries = await Promise.all(list.map(([sid]) => lexEntry(sid)));
    if (selKey() !== key) return;
    const row = el("div", "orig-words");
    list.forEach(([sid, en], k) => {
      if (!entries[k]) return;
      const chip = el("button", "orig-chip"), w = el("span", "orig-lemma", entries[k][0]);
      w.lang = heb ? "he" : "grc";
      chip.append(w, el("small", "", en));
      chip.title = `${sid} · ${entries[k][1]}`;
      chip.onclick = () => openStrong(sid);
      row.append(chip);
    });
    box.append(row);
  };
  if (box.open) fill();
}

// --- Topics ---------------------------------------------------------------------------------------------------
// Nave's Topical Bible: some 5,000 topics, each a list of headings with the verses on them. A verse's topics show
// under its text (a chapter's, most cited first); a topic opens in the picker, and the search box finds them.

const topicIndex = () => loadJSON("data/topics/index.json");
const verseTopics = (book) => loadJSON(`data/topics/v/${book}.json`).catch(() => ({}));
const topicName = (x) => (zh() && x[1]) || x[0];
const TOPIC_CHIPS = 12;

async function renderTopics(b, c, sel, chapter, key) {
  const box = $("ctx-topics"), [idx, vt] = await Promise.all([topicIndex().catch(() => null), verseTopics(b.id)]);
  if (selKey() !== key) return;
  // By how many of the verses each cites (a reference to the whole chapter counts for all of a chapter), then the
  // broadest first: Faith before Condescension of God.
  const score = new Map();
  for (const n of sel) for (const i of vt[`${c}.${n}`] || []) score.set(i, (score.get(i) || 0) + 1);
  if (chapter) for (const i of vt[`${c}`] || []) score.set(i, (score.get(i) || 0) + sel.length);
  const list = [...score].sort((x, z) => z[1] - x[1] || idx[z[0]][2] - idx[x[0]][2]).map(([i]) => i);
  box.hidden = !idx || !list.length;
  if (box.hidden) return;
  const summary = el("summary", "", t("topics"));
  summary.append(" ", el("span", "count", list.length));
  box.replaceChildren(summary);
  box.open = store.get("bible-topics-open") !== false;
  box.ontoggle = () => store.set("bible-topics-open", box.open);
  const row = el("div", "topic-chips"), from = chapter ? null : `${b.id}.${c}.${sel[0]}`;
  const chips = list.map((i) => {
    const chip = el("button", "chip", topicName(idx[i]));
    chip.onclick = () => openTopic(i, from);
    return chip;
  });
  row.append(...chips.slice(0, TOPIC_CHIPS));
  if (chips.length > TOPIC_CHIPS) {
    const more = el("button", "chip more", `+${chips.length - TOPIC_CHIPS}`);
    more.onclick = () => more.replaceWith(...chips.slice(TOPIC_CHIPS));
    row.append(more);
  }
  box.append(row);
}

// A reference as Nave's gives it ("Exod.6.16-20", or "Num.17" for a chapter): does it take in verse "Exod.6.18"?
const refHas = (ref, at) => {
  if (!at) return false;
  const [b, c, v] = ref.split("."), [ab, ac, av] = at.split(".");
  if (b !== ab || c !== ac) return false;
  if (v == null) return true;
  const [lo, hi = lo] = v.split("-").map(Number);
  return +av >= lo && +av <= hi;
};
function refShort(ref) {
  const [b, c, v] = ref.split(".");
  return shortRef(b, c, v ?? "").replace(/:$/, "").replace(/-(\d+)$/, "–$1");
}

// A topic: its headings, indented as Nave's has them, each with its references (the ones that take in the verse it
// was opened from marked). "See" headings open those topics; tapping a reference goes there.
async function openTopic(i, from = null, back = null) {
  view.dialog = null; // not shareable
  const idx = await topicIndex(), x = idx[i], body = $("picker-body");
  $("picker-title").textContent = topicName(x);
  view.back = back;
  $("picker-back").hidden = !back;
  if (!$("picker").open) { body.replaceChildren(el("p", "note", t("searching"))); $("picker").showModal(); }
  const entries = (await loadJSON(`data/topics/${x[3]}.json`))[i % 100];
  const head = el("p", "note small", [zh() && x[1] ? x[0] : null, t("topicRefs", x[2])].filter(Boolean).join(" · "));
  const list = el("div", "topic");
  for (const [depth, label, refs, see] of entries) {
    const row = el("div", "topic-entry" + (refs.length || see != null ? "" : " topic-head"));
    row.style.setProperty("--depth", depth);
    if (see != null) {
      const link = el("button", "link", topicName(idx[see]));
      link.onclick = () => openTopic(see, from, () => openTopic(i, from, back));
      row.append(el("span", "topic-label", t("topicSee") + " "), link);
    } else {
      if (label) row.append(el("span", "topic-label", label));
      for (const ref of refs) {
        const a = el("a", "topic-ref" + (refHas(ref, from) ? " here" : ""), refShort(ref));
        const [b, c, v] = ref.split("."), [lo, hi] = (v || "").split("-").map(Number);
        a.href = hashFor(b, +c, lo || undefined, hi);
        if (refHas(ref, from)) a.title = t("topicHere");
        a.onclick = () => $("picker").close();
        row.append(" ", a);
      }
    }
    list.append(row);
  }
  body.replaceChildren(head, list, el("p", "note small", t("topicSrc")));
  body.querySelector(".topic-ref.here")?.scrollIntoView({ block: "center" });
}

// --- Gospel harmony -----------------------------------------------------------------------------------------
// The life of Jesus in 164 sections, each with the passages in Matthew, Mark, Luke and John that tell it
// (data/harmony.json, built by tools/build_harmony.py). A Gospel verse lists its sections under its text; a section
// opens with the accounts side by side, the verse it was opened from marked, and steps to the sections either side.

const GOSPELS = ["Matt", "Mark", "Luke", "John"];
const loadHarmony = () => loadJSON("data/harmony.json");
// "Matt.5.1-Matt.7.29", "Matt.3.13-17" or "Matt.3.13" → [book, c, v, c2, v2]
function refSpan(ref) {
  const [a, z] = ref.split("-"), [b, c, v] = a.split(".").map((x, i) => (i ? +x : x));
  if (!z) return [b, c, v, c, v];
  const zz = z.split(".");
  return zz.length === 1 ? [b, c, v, c, +zz[0]] : [b, c, v, +zz[1], +zz[2]];
}
const spanHas = ([b, c, v, c2, v2], book, ch, vs) => b === book && (ch > c || (ch === c && vs >= v)) && (ch < c2 || (ch === c2 && vs <= v2));
const spanInChapter = ([b, c, , c2], book, ch) => b === book && ch >= c && ch <= c2;

async function renderParallels(b, c, sel, chapter, key) {
  const box = $("ctx-harmony");
  if (!GOSPELS.includes(b.id)) { box.hidden = true; return; }
  const h = await loadHarmony().catch(() => null);
  if (selKey() !== key) return;
  const hits = (h?.sections || []).map((s, i) => [s, i]).filter(([s]) => s[3 + GOSPELS.indexOf(b.id)].some((ref) =>
    chapter ? spanInChapter(refSpan(ref), b.id, c) : sel.some((n) => spanHas(refSpan(ref), b.id, c, n))));
  box.hidden = !hits.length;
  if (box.hidden) return;
  const summary = el("summary", "", t("parallels"));
  summary.append(" ", el("span", "count", hits.length));
  box.replaceChildren(summary);
  box.open = store.get("bible-harmony-open") !== false;
  box.ontoggle = () => store.set("bible-harmony-open", box.open);
  const from = chapter ? null : `${b.id}.${c}.${sel[0]}`, list = el("div", "harmony-list");
  for (const [s, i] of hits) {
    const btn = el("button", "harmony-item");
    btn.append(el("b", "", zh() ? s[2] : s[1]));
    const others = GOSPELS.map((g, k) => g !== b.id && s[3 + k].length ? s[3 + k].map(refShortSpan).join(", ") : null).filter(Boolean);
    btn.append(el("small", "", others.length ? others.join(" · ") : t("onlyIn", bname(b))));
    btn.onclick = () => openHarmony(i, from);
    list.append(btn);
  }
  const all = el("button", "link", t("allSections"));
  all.onclick = () => openHarmonyIndex();
  box.append(list, all);
}
const spanNums = ([, c, v, c2, v2]) => `${c}:${v}` + (c2 !== c ? `–${c2}:${v2}` : v2 !== v ? `–${v2}` : "");
const refShortSpan = (ref) => shortRef(ref.split(".")[0], "", "").replace(/:$/, "") + spanNums(refSpan(ref));
const GOSPEL_TAGS = { en: ["Mt", "Mk", "Lk", "Jn"], zh: ["太", "可", "路", "约"] };

// One section, the accounts side by side (on a phone, swiped across).
async function openHarmony(i, from = null) {
  view.dialog = null; // not shareable
  const h = await loadHarmony(), s = h.sections[i], body = $("picker-body");
  $("picker-title").textContent = zh() ? s[2] : s[1];
  view.back = () => openHarmonyIndex(i, from);
  $("picker-back").hidden = false;
  if (!$("picker").open) { body.replaceChildren(el("p", "note", t("searching"))); $("picker").showModal(); }
  const tr = versions()[0], cols = GOSPELS.map((g, k) => [g, s[3 + k]]).filter(([, refs]) => refs.length);
  const texts = await Promise.all(cols.map(([g]) => bookText(g, tr)));
  const [fb, fc, fv] = from ? from.split(".") : [];
  const grid = el("div", "harmony harmony-" + cols.length);
  cols.forEach(([g, refs], k) => {
    const col = el("section", "harmony-col"), book = state.byId[g];
    const head = el("h3", "", bname(book));
    head.append(" ", el("small", "", refs.map((r) => spanNums(refSpan(r))).join(", ")));
    col.append(head);
    const text = el("div", "harmony-text");
    text.lang = tr === "cuv" ? "zh-CN" : "en";
    for (const ref of refs) {
      const [, c, v, c2, v2] = refSpan(ref), p = el("p");
      for (let ch = c; ch <= c2; ch++) {
        const verses = texts[k][ch - 1] || [];
        for (let n = ch === c ? v : 1; n <= (ch === c2 ? v2 : verses.length); n++) {
          const span = el("span", "hv" + (g === fb && ch === +fc && n === +fv ? " here" : ""));
          span.append(el("sup", "vn", ch !== c || c2 !== c ? `${ch}:${n}` : n), verses[n - 1] || "");
          span.onclick = () => { $("picker").close(); go(g, ch, n); };
          p.append(span, " ");
        }
      }
      text.append(p);
    }
    col.append(text);
    grid.append(col);
  });
  // Previous and next sections, and where this one sits.
  const nav = el("div", "harmony-nav"), part = h.parts[s[0]];
  const step = (d, label) => {
    const btn = el("button", "pill", label);
    btn.disabled = !h.sections[i + d];
    btn.onclick = () => openHarmony(i + d, null);
    return btn;
  };
  nav.append(step(-1, "‹"), el("span", "note small", `${zh() ? part[1] : part[0]} · ${i + 1} / ${h.sections.length}`), step(1, "›"));
  // On a phone, where one account shows at a time: a tab for each, kept in step with the swiping.
  const tabs = el("div", "seg harmony-tabs");
  const tabBtns = cols.map(([g], k) => {
    const btn = el("button", "", bname(state.byId[g]));
    btn.onclick = () => grid.children[k].scrollIntoView({ inline: "start", block: "nearest", behavior: "smooth" });
    return btn;
  });
  tabs.append(...tabBtns);
  const mark = () => {
    const k = Math.round(grid.scrollLeft / (grid.children[1]?.offsetLeft - grid.children[0].offsetLeft || 1));
    tabBtns.forEach((btn, j) => btn.setAttribute("aria-pressed", j === Math.min(k, cols.length - 1)));
  };
  grid.addEventListener("scroll", mark, { passive: true });
  body.replaceChildren(nav, ...(cols.length > 1 ? [tabs] : []), grid);
  body.scrollTop = 0;
  body.querySelector(".hv.here")?.scrollIntoView({ block: "center" });
  mark();
}

// Every section, by part, each with the Gospels that tell it.
async function openHarmonyIndex(at = null, from = null) {
  view.dialog = null;
  const h = await loadHarmony(), body = $("picker-body");
  $("picker-title").textContent = t("harmony");
  view.back = at != null ? () => openHarmony(at, from) : null;
  $("picker-back").hidden = at == null;
  if (!$("picker").open) $("picker").showModal();
  const out = [el("p", "note small", t("harmonyNote"))];
  h.parts.forEach((part, pi) => {
    out.push(el("div", "testament", zh() ? part[1] : part[0]));
    const ul = el("ul", "results");
    h.sections.forEach((s, i) => {
      if (s[0] !== pi) return;
      const li = el("li"), btn = el("button", i === at ? "on" : "");
      btn.append(el("b", "", zh() ? s[2] : s[1]));
      const tags = el("span", "harmony-tags");
      GOSPELS.forEach((g, k) => tags.append(el("i", s[3 + k].length ? "on" : "", GOSPEL_TAGS[state.lang][k])));
      btn.append(tags);
      btn.onclick = () => openHarmony(i);
      li.append(btn);
      ul.append(li);
    });
    out.push(ul);
  });
  body.replaceChildren(...out);
  body.querySelector("button.on")?.scrollIntoView({ block: "center" });
}

// --- Cross-reference web ------------------------------------------------------------------------------------
// The verse in the middle and its strongest cross-references around it, in Bible order clockwise from the top, each
// as big as its votes. A faint line joins two of them when one cross-references the other. Tapping one opens it, and
// the web redraws around it.

const WEB_SIZE = 12;
const ABBR_ZH = ("创 出 利 民 申 书 士 得 撒上 撒下 王上 王下 代上 代下 拉 尼 斯 伯 诗 箴 传 歌 赛 耶 哀 结 但 何 珥 摩 俄 拿 弥 鸿 哈 番 该 亚 玛 "
  + "太 可 路 约 徒 罗 林前 林后 加 弗 腓 西 帖前 帖后 提前 提后 多 门 来 雅 彼前 彼后 约一 约二 约三 犹 启").split(" ");
const shortRef = (b, c, v) => `${zh() ? ABBR_ZH[state.books.indexOf(state.byId[b])] : b.replace(/^(\d)/, "$1 ")} ${c}:${v}`;
const SVGNS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

async function drawWeb(box, refs, key) {
  const top = refs.slice(0, WEB_SIZE), order = (r) => { const [b, c, v] = r.split("."); return state.books.indexOf(state.byId[b]) * 1e6 + c * 1e3 + +v; };
  const nodes = top.map(([ref, votes]) => ({ ref, start: ref.split("-")[0], votes })).sort((a, z) => order(a.start) - order(z.start));
  const W = 360, H = 300, cx = W / 2, cy = H / 2, R = 108, maxV = Math.max(...nodes.map((n) => n.votes));
  const chapter = ctxScope() === "chapter";
  nodes.forEach((n, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / nodes.length;
    Object.assign(n, { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), a, r: 4 + 6 * Math.sqrt(n.votes / maxV) });
  });
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "web", role: "img", "aria-label": t("webLabel") });
  const links = svgEl("g", { class: "links" }), spokes = svgEl("g", { class: "spokes" }), dots = svgEl("g", {});
  for (const n of nodes) spokes.append(svgEl("line", { x1: cx, y1: cy, x2: n.x, y2: n.y, "stroke-width": 0.6 + 2.6 * (n.votes / maxV) }));
  svg.append(links, spokes, dots);
  // The middle: this verse, or this chapter.
  const mid = svgEl("g", { class: "node here" });
  mid.append(svgEl("circle", { cx, cy, r: 11 }));
  const ml = svgEl("text", { x: cx, y: cy + 26, "text-anchor": "middle" });
  ml.textContent = chapter ? shortRef(state.book, state.chapter, "").replace(/:$/, "") : shortRef(state.book, state.chapter, state.verse);
  mid.append(ml);
  dots.append(mid);
  for (const n of nodes) {
    const [b, c, v] = n.start.split(".");
    const g = svgEl("g", { class: "node" + (state.books.indexOf(state.byId[b]) >= NT_START ? " nt" : ""), tabindex: 0, role: "link" });
    const title = svgEl("title", {});
    title.textContent = `${refLabel(n.ref)} · ${n.votes} ▲`;
    g.append(title, svgEl("circle", { cx: n.x, cy: n.y, r: n.r }));
    const out = 12 + n.r, tx = n.x + Math.cos(n.a) * out, ty = n.y + Math.sin(n.a) * out + 4;
    const label = svgEl("text", { x: tx, y: ty, "text-anchor": Math.abs(Math.cos(n.a)) < 0.3 ? "middle" : Math.cos(n.a) > 0 ? "start" : "end" });
    label.textContent = shortRef(b, c, v);
    g.append(label);
    const open = () => (location.hash = hashFor(b, c, v));
    g.addEventListener("click", open);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    dots.append(g);
  }
  box.replaceChildren(svg);
  // Links among the ring: does one cross-reference another? (loads those books' cross-references, cached after)
  const byStart = new Map(nodes.map((n) => [n.start, n]));
  const seen = new Set();
  await Promise.all(nodes.map(async (n) => {
    const [b, c, v] = n.start.split(".");
    const theirs = (await bookXref(b))[`${c}.${v}`] || [];
    if (selKey() !== key) return;
    for (const [r] of theirs) {
      const m = byStart.get(r.split("-")[0]);
      if (!m || m === n) continue;
      const id = [n.start, m.start].sort().join("|");
      if (seen.has(id)) continue;
      seen.add(id);
      // Bowed halfway from the chord toward the middle, so the lines stay clear of the centre.
      const qx = (n.x + m.x) / 4 + cx / 2, qy = (n.y + m.y) / 4 + cy / 2;
      links.append(svgEl("path", { d: `M${n.x},${n.y} Q${qx},${qy} ${m.x},${m.y}` }));
    }
  }));
}

function renderXref(refs, limit) {
  const pane = $("tab-xref");
  pane.innerHTML = "";
  if (!refs.length) { pane.innerHTML = `<p class="note">${t(ctxScope() === "chapter" ? "noXrefCh" : "noXref")}</p>`; return; }
  // List or web, remembered.
  const view = store.get("bible-xref-view") === "web" ? "web" : "list";
  const seg = el("div", "seg xref-view");
  for (const k of ["list", "web"]) {
    const b = el("button", "", t(k === "list" ? "xrefList" : "xrefWeb"));
    b.setAttribute("aria-pressed", k === view);
    b.onclick = () => { store.set("bible-xref-view", k); renderXref(refs, limit); };
    seg.append(b);
  }
  pane.append(seg);
  if (view === "web") {
    const box = el("div", "web-box");
    pane.append(box, el("p", "note small", t("webNote", Math.min(WEB_SIZE, refs.length))));
    drawWeb(box, refs, selKey()).catch((e) => console.error(e));
    return;
  }
  const ul = document.createElement("ul");
  ul.className = "xref";
  for (const [ref, votes, from] of refs.slice(0, limit)) {
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
    // For a chapter, the verse each one comes from.
    if (from) li.append(make("span", "from", from + " →"));
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

// Links for the verses, or (v null) for the chapter.
function renderLinks(b, c, v) {
  const q = encodeURIComponent(`${b.name} ${c}${v ? ":" + v : ""}`);
  const links = zh() ? [
    [`https://www.biblegateway.com/passage/?search=${q}&version=CUVS`, "在 Bible Gateway 读和合本", "和合本（简体）"],
    [`https://www.biblegateway.com/passage/?search=${q}&version=NKJV`, "读英文 NKJV", "新钦定本（New King James Version）"],
    [`https://zh.wikipedia.org/w/index.php?search=${encodeURIComponent(b.name_zh)}`, `关于${b.name_zh}`, "维基百科"],
  ] : [
    [`https://www.biblegateway.com/passage/?search=${q}&version=NKJV`, "Read in NKJV", "Bible Gateway, New King James Version"],
    ...(v ? [[`https://www.biblegateway.com/verse/en/${q}`, "Compare translations", "This verse in every English version on Bible Gateway"]] : []),
    [`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(`${b.name} book of the Bible`)}`, `About ${b.name}`, "Wikipedia"],
  ];
  $("tab-links").innerHTML = `<ul class="links">${links.map(([href, t, d]) =>
    `<li><a href="${href}" target="_blank" rel="noopener">${t} ↗</a><span>${d}</span></li>`).join("")}</ul>`;
}

// Places named in the verses shown on the atlas map, and the events they belong to.
// Until the atlas has loaded (or if it can't), a small SVG map stands in for it.
async function renderPlaces(b, c, sel, key) {
  const [places, { places: vp, events: ve, years = {} }, base] = await Promise.all([
    loadJSON("data/places.json"), bookContext(b.id), loadJSON("data/basemap.json")]);
  if (selKey() !== key) return;
  const v = sel[0], ids = [...new Set(sel.flatMap((n) => vp[`${c}.${n}`] || []))], chapter = ctxScope() === "chapter";
  // Places as [id, name, lon, lat, kind], with the name in the interface language where there is one.
  const pts = ids.map((i) => places[i]).map(([id, name, lon, lat, kind, nameZh]) => [id, (zh() && nameZh) || name, lon, lat, kind]);
  const evs = [...new Map(sel.flatMap((n) => ve[`${c}.${n}`] || []).map((e) => [e[0], e])).values()];
  $("places-count").textContent = ids.length || "";
  $("places-note").textContent = chapter ? t(ids.length ? "placesIn" : "noPlaces", `${bname(b)} ${c}`)
    : t(ids.length ? "named" : "noPlacesSel", sel.length > 1);
  $("map-fallback").replaceChildren(...(pts.length ? [drawMap(pts, base)] : []));
  $("map-box").hidden = !pts.length && !atlas.ready && !state.tour;
  // The map's year: the verse's first dated event, else the year Theographic gives the verse (or its chapter).
  syncAtlas(pts, evs.find((e) => e[1] != null)?.[1] ?? (chapter ? null : years[`${c}.${v}`]) ?? years[c] ?? null);

  const pane = $("places-body"), names = await loadNames();
  if (selKey() !== key) return;
  pane.innerHTML = "";
  const landBtn = make("button", "pill small-pill land-btn", t("landBtn"));
  landBtn.onclick = async () => showLand(await landAt(b.id, c, v));
  if (ids.length) {
    const ul = document.createElement("ul");
    ul.className = "places";
    const shownNames = new Set();
    pts.forEach(([, name, lon, lat, kind], k) => {
      const li = document.createElement("li");
      li.innerHTML = `<b></b> <span></span>`;
      li.firstChild.textContent = name;
      li.lastChild.textContent = [(zh() && KINDS_ZH[kind]) || kind, `${Math.abs(lat).toFixed(2)}°${lat < 0 ? "S" : "N"} ${Math.abs(lon).toFixed(2)}°${lon < 0 ? "W" : "E"}`].filter(Boolean).join(" · ");
      // Other names the Bible gives this place, each opening the verse that uses it.
      const entry = names.get(ids[k]), also = shownNames.has(entry) ? [] : otherNames(entry, name);
      shownNames.add(entry);
      if (also.length) {
        const p = make("p", "also", t("alsoCalled", ""));
        for (const [n, z, ref] of also) {
          const a = make("a", "", (zh() && z) || n);
          a.href = "#" + ref;
          a.title = refLabel(`${ref}`);
          p.append(a, " ");
        }
        li.append(p);
      }
      ul.append(li);
    });
    pane.append(ul);
  }
  if (!ids.length && !chapter) pane.append(seeChapter(b, c));
  pane.append(landBtn);
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

async function renderPeople(b, c, sel, key) {
  const [people, ctx] = await Promise.all([loadPeople(), bookContext(b.id)]);
  if (selKey() !== key) return;
  const vp = ctx.people || {}, ids = [...new Set(sel.flatMap((n) => vp[`${c}.${n}`] || []))];
  $("people-count").textContent = ids.length || "";
  if (state.person != null) return renderPerson(people, state.person, key);
  const chapter = ctxScope() === "chapter";
  const note = ids.length ? "" : chapter ? t("noPeople", `${bname(b)} ${c}`) : t("noPeopleSel", sel.length > 1);
  const more = await Promise.all(ids.map(personMore));
  if (selKey() !== key || state.person != null) return;
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
    btn.onclick = () => { state.person = i; renderPeople(b, c, sel, key); $("context").scrollTop = 0; };
    li.append(btn);
    ul.append(li);
  });
  pane.append(ul);
  if (!ids.length && !chapter) pane.append(seeChapter(b, c));
}

// With nothing in the selected verses, a way to the chapter's.
function seeChapter(b, c) {
  const btn = make("button", "pill small-pill", t("showChapter", `${bname(b)} ${c}`));
  btn.onclick = () => { state.scope = "chapter"; renderContext(); };
  return btn;
}

// One person: biography, family and every verse that names them. It stays open while moving between those verses.
async function renderPerson(people, i, key) {
  const p = people[i], [[bio, refs], { kings, prophets }] = await Promise.all([personMore(i), loadKings()]);
  if (selKey() !== key || state.person !== i) return;
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
  if (fam.children.length) {
    const h = el("h4", "family-h", t("family")), tree = el("button", "pill small-pill", t("tree"));
    tree.onclick = () => showTree(i);
    h.append(tree);
    // Kings and the prophets of their time also open the chart of the two kingdoms at them.
    const row = kings.find((k) => k.at(-1) === i) || prophets.find((q) => q.at(-1) === i);
    if (row) {
      const k = el("button", "pill small-pill", t("kingsShort"));
      k.onclick = () => showKings(row[0] + row[1]);
      h.append(k);
    }
    card.push(h, fam);
  }
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

const make = (tag, cls, text) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, text != null ? { textContent: text } : {});

// One row of an outline tree (the family tree, the land of Canaan): a fold button when there is anything under it, the
// label, anything after it, and the children, built the first time they are opened.
function treeItem(label, kids, open, title, extra = []) {
  const li = make("li"), row = make("div", "trow");
  if (!kids) {
    row.append(make("span", "ttog leaf"), label, ...extra);
    li.append(row);
    return li;
  }
  const tog = make("button", "ttog"), ul = make("ul");
  let built = false;
  const set = (o) => {
    if (o && !built) { ul.append(...kids()); built = true; }
    ul.hidden = !o;
    tog.setAttribute("aria-expanded", o);
  };
  tog.title = title;
  tog.onclick = () => set(ul.hidden);
  row.append(tog, label, ...extra);
  li.append(row, ul);
  set(open);
  return li;
}

// A family tree around one person, drawn as an indented outline so it fits a phone: from their grandparents down to
// their grandchildren, with the line through them opened out and other branches folded (▸ opens one in place).
// Above it, their whole line back as far as the data goes. Tapping a name redraws the tree around that person.
const TREE_UP = 2;
async function showTree(i) {
  const people = await loadPeople(), p = people[i];
  view.dialog = `tree:${i}`;
  const el = make, parent = (j) => people[j][P.FATHER] ?? people[j][P.MOTHER];
  $("picker-title").textContent = t("treeTitle", pname(p));
  $("picker-back").hidden = true;
  // The line back: father (or mother) after father, to the first person the data has.
  const line = [];
  for (let j = i, n = 0; j != null && n < 200; j = parent(j), n++) line.unshift(j);
  const lineBox = el("div", "tree-line");
  lineBox.append(el("b", "", t("treeLine")));
  line.forEach((j, k) => {
    const b = el("button", "chip" + (j === i ? " on" : ""), pname(people[j]));
    b.onclick = () => showTree(j);
    lineBox.append(...(k ? [el("span", "sep", "›")] : []), b);
  });
  // The tree: opened along the path to this person and two generations below them.
  const path = new Set(line.slice(-1 - TREE_UP));
  const node = (j, depth) => {
    const q = people[j], kids = q[P.CHILDREN];
    const name = el("button", "tname" + (j === i ? " me" : path.has(j) ? " path" : ""));
    name.append(el("b", "", pname(q)));
    if (kids.length) name.append(el("span", "kids", kids.length));
    if (q[P.PARTNERS].length) name.append(el("span", "partners", t("treeWed", q[P.PARTNERS].map((k) => pname(people[k])).join(", "))));
    name.onclick = () => showTree(j);
    return treeItem(name, kids.length && (() => kids.map((k) => node(k, j === i ? 1 : path.has(j) ? 0 : depth - 1))),
      path.has(j) || depth > 0, t("nKids", kids.length));
  };
  const tree = el("ul", "tree");
  tree.append(node(line[Math.max(0, line.length - 1 - TREE_UP)], 0));
  const open = el("button", "pill", t("showPerson", pname(p)));
  open.onclick = () => { $("picker").close(); openPerson(i, p[P.FIRST]); };
  const box = el("div", "tree-box");
  box.append(lineBox, el("p", "note small", t("treeNote")), tree, open);
  $("picker-body").replaceChildren(box);
  if (!$("picker").open) $("picker").showModal();
  lineBox.scrollLeft = lineBox.scrollWidth;
  const me = tree.querySelector(".me");
  me.scrollIntoView({ block: "center" });
  me.focus({ preventScroll: true });
}

// --- The land of Canaan ---------------------------------------------------------------

// data/lands.json (tools/build_lands.py): the land as Joshua 13–21 divides it, as regions > tribes (> districts) > places,
// each place as [index into data/places.json, "chapter.verse" in Joshua].
// data/names.json (tools/build_names.py): places with other names, as [[place indices], [[name, name_zh, verse], ...]].
const loadNames = () => loadJSON("data/names.json").then((list) => new Map(list.flatMap((e) => e[0].map((i) => [i, e]))));
// The names a place also goes by, leaving out the one shown.
const nameKey = (s) => s.split(" (")[0].toLowerCase().replace(/[-–\s]/g, "");
const otherNames = (entry, shown) => entry ? entry[1].filter(([n, z]) => nameKey((zh() && z) || n) !== nameKey(shown)) : [];
const nameOf = ([n, z]) => (zh() && z) || n;

// The group a verse of Joshua belongs to, so the tree opens at the passage being read.
async function landAt(book, c, v) {
  if (book !== "Josh") return "canaan";
  const land = await loadJSON("data/lands.json");
  const hit = (n) => {
    for (const k of n.kids || []) { const f = hit(k); if (f) return f; }
    if (!n.ref) return null;
    const [, a, z] = n.ref.match(/^Josh\.(\d+\.\d+)-Josh\.(\d+\.\d+)$/), [ac, av] = a.split(".").map(Number), [, zv] = z.split(".").map(Number);
    return c === ac && (v == null || (v >= av && v <= zv)) ? n.id : null;
  };
  return hit(land) || "canaan";
}

// The land as an outline beside a map: the focused tribe's places are pinned, the rest of the land faint behind them.
// Tapping a group focuses it, tapping a place labels it on the map, and a verse number opens that verse.
async function showLand(focus = "canaan", pick = null) {
  const [land, places, names, base] = await Promise.all([
    loadJSON("data/lands.json"), loadJSON("data/places.json"), loadNames(), loadJSON("data/basemap.json")]);
  view.dialog = `land:${focus}${pick != null ? ":" + pick : ""}`;
  const nm = (n) => (zh() && n.zh) || n.name, pn = (i) => (zh() && places[i][5]) || places[i][1];
  const pt = (i) => { const [id, , lon, lat, kind] = places[i]; return [id, pn(i), lon, lat, kind]; };
  const byId = new Map(), up = new Map();
  (function walk(n) { byId.set(n.id, n); for (const k of n.kids || []) { up.set(k.id, n); walk(k); } })(land);
  const f = byId.get(focus) || land, path = new Set();
  for (let n = f; n; n = up.get(n.id)) path.add(n.id);
  const placesIn = (n) => [...new Set(n.towns ? n.towns.map((x) => x[0]) : n.kids.flatMap(placesIn))];
  const isTown = (i) => !places[i][4] || places[i][4] === "City";
  const read = (ref) => { const [, c, a, , , z] = ref.split(/[.-]/); $("picker").close(); location.hash = hashFor("Josh", +c, +a, +z); };
  $("picker-title").textContent = t("landTitle");
  $("picker-back").hidden = true;

  // The map: all the land's towns frame it; the focused group's places are pinned, and the picked one is labelled.
  const everywhere = placesIn(land).filter(isTown), mine = placesIn(f).filter((i) => i !== pick);
  // Framed on the bulk of the land, so a few far-off border points (the river of Egypt, Damascus) don't shrink it.
  const span = (k) => { const v = everywhere.map((i) => places[i][k]).sort((a, b) => a - b); return [v[Math.floor(v.length * 0.03)], v[Math.ceil(v.length * 0.97) - 1]]; };
  const [[lon0, lon1], [lat0, lat1]] = [span(2), span(3)];
  const map = drawMap(mine.map(pt), base, { frame: [[, , lon0, lat0], [, , lon1, lat1]], faint: everywhere.filter((i) => !mine.includes(i)).map(pt),
    labels: false, picked: pick == null ? null : pt(pick) });

  const refBtn = (ref, text) => { const b = make("button", "tref", text); b.onclick = () => read(ref); return b; };
  const town = ([i, cv]) => {
    const kind = places[i][4], also = otherNames(names.get(i), pn(i));
    const name = make("button", "tname" + (i === pick ? " me" : ""));
    name.append(make("b", "", pn(i)));
    const sub = [kind && kind !== "City" ? (zh() && KINDS_ZH[kind]) || kind : "", also.length ? t("alsoCalled", also.map(nameOf).join(", ")) : ""].filter(Boolean);
    if (sub.length) name.append(make("span", "partners", sub.join(" · ")));
    name.onclick = () => showLand(f.id, i);
    return treeItem(name, null, false, "", [refBtn(`Josh.${cv}-Josh.${cv}`, cv.replace(".", ":"))]);
  };
  const group = (n) => {
    const count = placesIn(n).length, name = make("button", "tname" + (n === f && pick == null ? " me" : path.has(n.id) ? " path" : ""));
    name.append(make("b", "", nm(n)), make("span", "kids", count));
    name.onclick = () => showLand(n.id);
    const kids = () => {
      if (n.kids) return n.kids.map(group);
      const towns = n.towns.filter(([i]) => isTown(i)), other = n.towns.filter(([i]) => !isTown(i));
      const out = towns.map(town);
      if (other.length) {
        const label = make("span", "tname tgroup");
        label.append(make("b", "", t("landmarks")), make("span", "kids", other.length));
        out.push(treeItem(label, () => other.map(town), !towns.length, t("landmarks")));
      }
      return out;
    };
    const ref = n.ref ? [refBtn(n.ref, refLabel(n.ref).replace(/^\S+ /, ""))] : [];
    // Open along the path to the focus, and one level of groups below it.
    return treeItem(name, kids, path.has(n.id) || (n.kids && up.get(n.id) === f), t("nPlaces", count), ref);
  };
  const tree = make("ul", "tree");
  tree.append(group(land));
  const box = make("div", "tree-box land");
  box.append(make("div", "land-map"), make("p", "note small", t("landNote")), tree);
  box.firstChild.append(map);
  $("picker-body").replaceChildren(box);
  if (!$("picker").open) $("picker").showModal();
  box.style.setProperty("--head", $("picker").querySelector(".picker-head").offsetHeight + "px");
  const me = tree.querySelector(".me");
  if (me && f !== land) me.scrollIntoView({ block: "nearest" });
  else $("picker-body").scrollTop = 0;
}

// --- Kings of Israel and Judah ---------------------------------------------------------

// data/kings.json (tools/build_kings.py): kings as [kingdom U/I/J, name, name_zh, from, to (negative = BC), verdict g/e/null,
// account, account in Chronicles, person], prophets as [kingdom, name, name_zh, from, to, verse, person], and the turning
// points as [year, title, title_zh, verse].
// Scale and the shortest block: a reign of a few months still shows its name; its years show from about 7 years up.
const KING_PX = 4.5, KING_MIN = 22;
const loadKings = () => loadJSON("data/kings.json");
const kname = (k) => (zh() && k[2]) || k[1];
// The king whose account a verse is in ("1Kgs.15.12" is Asa's).
const refIn = (range, b, c, v) => {
  const [a, z] = range.split("-").map((x) => x.split(".")), order = (x) => state.books.findIndex((bk) => bk.id === x[0]) * 1e6 + +x[1] * 1e3 + +(x[2] ?? 0);
  const here = order([b, c, v ?? 0]);
  return here >= order(a) && here <= order(z);
};

// Both kingdoms side by side, time running down: each king a block as long as his reign (at least tall enough to read),
// coloured by the verdict of Kings, with the prophets of the time beside them and the turning points across.
async function showKings(pickName = null) {
  const { kings, prophets, events } = await loadKings();
  const top = Math.min(...kings.map((k) => k[3]), ...prophets.map((p) => p[3])), Y = (y) => (y - top) * KING_PX;
  $("picker-title").textContent = t("kingsTitle");
  $("picker-back").hidden = true;
  const here = kings.find((k) => [k[6], k[7]].some((r) => r && refIn(r, state.book, state.chapter, state.verse)));
  const pick = pickName ? kings.find((k) => k[0] + k[1] === pickName) || prophets.find((p) => p[0] + p[1] === pickName) : here;

  const chart = make("div", "kings");
  const head = make("div", "kings-head");
  head.append(make("span"), make("span"), make("b", "", t("israel")), make("b", "", t("judah")), make("span"));
  const body = make("div", "kings-body");
  const lanes = { axis: make("div", "k-axis"), pi: make("div", "k-lane"), I: make("div", "k-col"), J: make("div", "k-col"), pj: make("div", "k-lane") };
  body.append(...Object.values(lanes));
  let height = 0;
  const card = make("div", "king-card");
  view.dialog = "kings";
  const select = (row, btn) => {
    view.dialog = `kings:${row[0]}${row[1]}`;
    chart.querySelectorAll(".me").forEach((x) => x.classList.remove("me"));
    btn.classList.add("me");
    fillKingCard(card, row, row.length === 9);
  };
  // Kings: each block starts at its first year or where the one before ends, whichever is later.
  const bottom = { I: 0, J: 0, U: 0 };
  for (const k of kings) {
    const col = k[0] === "U" ? "U" : k[0], y = Math.max(Y(k[3]), bottom[col] + 2, k[0] !== "U" ? bottom.U + 2 : 0);
    const h = Math.max(Y(k[4] + 1) - y, KING_MIN);
    const b = make("button", "king " + (k[5] === "g" ? "good" : k[5] === "e" ? "evil" : "none") + (k[0] === "U" ? " united" : ""));
    b.style.top = y + "px";
    b.style.height = h + "px";
    if (h < 32) b.classList.add("short");
    b.append(make("b", "", kname(k)), make("span", "", k[3] === k[4] ? fmtYear(k[3]) : `${-k[3]}–${-k[4]}`));
    b.onclick = () => select(k, b);
    if (k === pick) b.classList.add("me");
    (k[0] === "U" ? body : lanes[col]).append(b);
    if (k[0] === "U") bottom.U = bottom.I = bottom.J = y + h;
    else bottom[col] = y + h;
    height = Math.max(height, y + h);
  }
  // Prophets: a thin bar for their years with the name beside it, in the lane next to the kingdom they spoke to.
  // Prophets whose years overlap in one lane take side-by-side slots.
  const slots = new Map([[lanes.pi, []], [lanes.pj, []]]);
  for (const p of prophets) {
    const lane = p[0] === "J" ? lanes.pj : lanes.pi, ends = slots.get(lane);
    let slot = ends.findIndex((end) => end < p[3]);
    if (slot < 0) slot = ends.length;
    ends[slot] = p[4];
    const b = make("button", "prophet");
    b.style.setProperty("--slot", slot);
    b.style.top = Y(p[3]) + "px";
    b.style.height = Math.max(Y(p[4] + 1) - Y(p[3]), 14) + "px";
    b.append(make("span", "", (zh() && p[2]) || p[1]));
    b.onclick = () => select(p, b);
    if (p === pick) b.classList.add("me");
    lane.append(b);
  }
  // The axis every 50 years, and the turning points across both kingdoms.
  for (let y = Math.ceil(top / 50) * 50; Y(y) < height && y < 0; y += 50) {
    const tk = make("span", "tick", `${-y}`);
    tk.style.top = Y(y) + "px";
    lanes.axis.append(tk);
  }
  // Labels sit below the line, where Israel's column has ended (722, 586); the division's sits above, on Solomon.
  for (const [y, en, zhName, ref] of events) {
    const line = make("div", "k-event" + (y === events[0][0] ? " up" : "")), label = make("a", "", `${-y} · ${(zh() && zhName) || en}`);
    label.href = "#" + ref;
    label.onclick = () => $("picker").close();
    line.append(label);
    line.style.top = Y(y) + "px";
    body.append(line);
  }
  body.style.height = height + 24 + "px";
  // Legend.
  const legend = make("p", "kings-legend");
  for (const [cls, k] of [["good", "kingGood"], ["evil", "kingEvil"], ["none", "kingNone"], ["lg-prophet", "prophets"]]) {
    const s = make("span", "lg " + cls);
    s.append(make("i"), t(k));
    legend.append(s);
  }
  chart.append(legend, make("p", "note small", t("kingsNote")), head, body);
  card.hidden = true;
  $("picker-body").replaceChildren(chart, card);
  if (!$("picker").open) $("picker").showModal();
  chart.style.setProperty("--head", $("picker").querySelector(".picker-head").offsetHeight + "px");
  const me = chart.querySelector(".me");
  if (me) { me.scrollIntoView({ block: "center" }); select(pick, me); }
  else $("picker").scrollTop = 0;
}

// The card under the chart for the king or prophet picked: years, verdict, and links to read and to their family.
function fillKingCard(card, r, isKing) {
  const [k, , , a, z] = r, person = r.at(-1), n = z - a;
  const kingdom = t(k === "U" ? "united" : k === "I" ? "israel" : "judah");
  const years = a === z ? fmtYear(a) : t("yearSpan", a, z);
  const sub = isKing ? `${t("kingOf", kingdom)} · ${years}${n > 0 ? " · " + t("nYears", n) : ""}` : `${t("prophetTo", kingdom)} · ${years}`;
  const acts = make("div", "card-acts");
  for (const ref of isKing ? [r[6], r[7]].filter(Boolean) : [`${r[5]}-${r[5]}`]) {
    const [first] = ref.split("-"), [b, c, v] = first.split(".");
    const b2 = make("button", "pill", t("readRef", ref.split("-")[0] === ref.split("-")[1] ? `${bname(state.byId[b])} ${c}:${v}` : refLabel(ref)));
    b2.onclick = () => { $("picker").close(); location.hash = "#" + first; };
    acts.append(b2);
  }
  if (person != null) {
    const fam = make("button", "pill", t("tree"));
    fam.onclick = () => showTree(person);
    acts.append(fam);
  }
  const out = [make("h3", "", (zh() && r[2]) || r[1]), make("p", "king-sub", sub)];
  if (isKing) out.push(make("p", "verdict " + (r[5] === "g" ? "good" : r[5] === "e" ? "evil" : "none"), t(r[5] === "g" ? "verdictGood" : r[5] === "e" ? "verdictEvil" : "verdictNone")));
  card.replaceChildren(...out, acts);
  card.hidden = false;
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

const LANDMARKS_ZH = { Jerusalem: "耶路撒冷", Damascus: "大马士革", Babylon: "巴比伦", Nineveh: "尼尼微", Memphis: "挪弗",
  Antioch: "安提阿", Athens: "雅典", Rome: "罗马", Ephesus: "以弗所", Tyre: "推罗" };
const LANDMARKS = [["Jerusalem", 35.234, 31.777], ["Damascus", 36.309, 33.512], ["Babylon", 44.421, 32.536],
  ["Nineveh", 43.161, 36.348], ["Memphis", 31.255, 29.845], ["Antioch", 36.165, 36.201], ["Athens", 23.727, 37.972],
  ["Rome", 12.484, 41.893], ["Ephesus", 27.340, 37.942], ["Tyre", 35.209, 33.268]];

// An SVG map of the Bible lands framed on the given places: [[id, name, lon, lat, kind], ...]
// Options: frame (points to fit instead of pts), faint (points drawn small and grey), labels: false (pins only),
// picked (one point drawn larger, with its label).
function drawMap(pts, base, o = {}) {
  const NS = "http://www.w3.org/2000/svg";
  const fit = o.frame || pts, lons = fit.map((p) => p[2]), lats = fit.map((p) => p[3]);
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
  for (const [, , lon, lat] of o.faint || []) el("circle", { cx: X(lon), cy: Y(lat), r: r * 0.55, class: "dot" });
  // Places within a few pixels of each other share one label.
  const groups = [];
  for (const [, name, lon, lat] of pts) {
    const x = X(lon), y = Y(lat);
    const g = groups.find((g) => Math.hypot(g.x - x, g.y - y) < fs * 1.2);
    if (g) g.names.push(name); else groups.push({ x, y, names: [name] });
    el("circle", { cx: x, cy: y, r, class: "pin" });
  }
  if (o.labels !== false) for (const g of groups) label(g.x, g.y, g.names.join(", "), "pin-label");
  if (o.picked) {
    const [, name, lon, lat] = o.picked;
    el("circle", { cx: X(lon), cy: Y(lat), r: r * 1.6, class: "pin picked" });
    label(X(lon), Y(lat), name, "pin-label");
  }
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
  view.dialog = null; // not shareable
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
  setPlaying(false);
  state.tour = null;
  store.set("bible-tour", null);
  renderTour();
}
function renderTour() {
  const tour = state.tour;
  $("tour").hidden = !tour;
  document.body.classList.toggle("touring", !!tour);
  if (!tour) return;
  const { tr, i } = tour, s = tr.steps[i], last = i === tr.steps.length - 1;
  $("tour-title").textContent = tx(tr, "title");
  $("tour-count").textContent = t("stepOf", i + 1, tr.steps.length);
  $("tour-year").textContent = fmtYear(s.year);
  $("tour-text").textContent = tx(s, "text");
  $("tour-prev").disabled = i === 0;
  $("tour-next").textContent = t(last ? "finish" : "next");
  $("tour-map").href = `${ATLAS}?pack=${encodeURIComponent(PACK)}&lang=${state.lang}#tour=${tr.id}&s=${i + 1}`;
  if (play.on && play.step !== `${tr.id}.${i}`) setPlaying(true);
  play.step = `${tr.id}.${i}`;
}

// Playback: the tour moves on by itself, each step staying long enough to read its note, while its verses light up
// one after another and the map traces the leg from the last stop (the pack's journey plugin, atlas/plugins/journey.js).
const play = { on: false, timer: 0 };
const stepTime = (s) => Math.min(15000, Math.max(7000, 3500 + 45 * tx(s, "text").length));
function setPlaying(on) {
  play.on = on && !!state.tour;
  clearTimeout(play.timer);
  $("tour-play").setAttribute("aria-pressed", play.on);
  $("tour-play").textContent = play.on ? t("pause") : t("play");
  document.body.classList.toggle("playing", play.on);
  const bar = $("tour-progress");
  bar.style.transition = "none";
  bar.style.width = "0";
  if (!play.on) return;
  const { tr, i } = state.tour, ms = stepTime(tr.steps[i]);
  void bar.offsetWidth; // start the bar from empty
  bar.style.transition = `width ${ms}ms linear`;
  bar.style.width = "100%";
  play.timer = setTimeout(() => {
    if (!state.tour) return;
    if (state.tour.i === tr.steps.length - 1) return setPlaying(false); // stays on the last step
    startTour(tr.id, state.tour.i + 1);
  }, ms);
}
// The step's verses glow in turn, as if read aloud.
function lightVerses() {
  if (!play.on) return;
  document.querySelectorAll(".v.lit").forEach((v) => v.classList.remove("lit"));
  const vs = [...document.querySelectorAll(".v.sel, .v.rng")];
  void document.body.offsetWidth;
  vs.forEach((v, i) => { v.style.animationDelay = `${Math.min(i * 0.6, 6)}s`; v.classList.add("lit"); });
}

// --- Read aloud ---------------------------------------------------------------------------------------------
// Turned on from the dock, the device's own voice reads the chapter one verse at a time (the first translation shown), lighting the verse it
// reads and keeping it in view, then carries on into the next chapter. Moving to another chapter by hand stops it.

const ICON_PLAY = '<path d="M5 3.2v9.6L12.6 8Z" fill="currentColor"/>';
const ICON_PAUSE = '<path d="M5 3.5h2v9H5zM9 3.5h2v9H9z" fill="currentColor"/>';
const svgIcon = (paths) => {
  const span = document.createElement("span");
  span.className = "ico";
  span.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${paths}</svg>`;
  return span;
};
const RATES = [0.8, 1, 1.25, 1.5];
const listen = { on: false, paused: false, v: 1, at: null, next: false, utter: null };
const speechLang = () => (versions()[0] === "cuv" ? "zh" : "en");
// The voices for the language, the best first: a remembered choice, then ones marked as higher quality, then the
// browser's default for that language.
function listenVoices() {
  const lang = speechLang(), all = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(lang));
  const score = (v) => (/premium|enhanced|natural|neural|google/i.test(v.name) ? 2 : 0) + (v.default ? 1 : 0)
    + (lang === "zh" && /cn|hans/i.test(v.lang) ? 1 : 0) + (lang === "en" && /us|gb/i.test(v.lang) ? 0.5 : 0);
  const saved = store.get("bible-voice-" + lang);
  return all.sort((a, z) => (z.name === saved) - (a.name === saved) || score(z) - score(a));
}
async function speakVerse() {
  const b = state.byId[state.book], c = state.chapter, tr = versions()[0], text = (await bookText(b.id, tr))[c - 1];
  if (!listen.on) return;
  if (listen.v > text.length) { // the end of the chapter: on to the next, or stop at the end of the Bible
    const n = neighbour(1);
    if (!n) return stopListen();
    listen.next = true;
    listen.v = 1;
    location.hash = hashFor(n.book, n.chapter);
    return;
  }
  listen.at = `${b.id}.${c}`;
  document.querySelectorAll(".v.reading").forEach((e) => e.classList.remove("reading"));
  const span = document.querySelector(`.v[data-v="${listen.v}"]`);
  if (span) {
    span.classList.add("reading");
    const r = span.getBoundingClientRect(), top = $("reader").getBoundingClientRect().top + 60;
    if (r.top < top || r.bottom > innerHeight - 120) span.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  renderListenBar();
  const u = new SpeechSynthesisUtterance(text[listen.v - 1] || "");
  const voice = listenVoices()[0];
  u.lang = voice?.lang || (speechLang() === "zh" ? "zh-CN" : "en-US");
  if (voice) u.voice = voice;
  u.rate = store.get("bible-rate") || 1;
  u.onend = () => {
    if (listen.utter !== u || !listen.on || listen.paused) return;
    listen.v++;
    speakVerse();
  };
  u.onerror = (e) => { if (listen.utter === u && !/interrupted|canceled/.test(e.error)) stopListen(); };
  listen.utter = u;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function startListen(v) {
  if (!window.speechSynthesis) return;
  Object.assign(listen, { on: true, paused: false, v, next: false });
  document.body.classList.add("listening");
  speakVerse();
}
function stopListen() {
  if (!listen.on) return;
  showVoiceMenu(false);
  Object.assign(listen, { on: false, paused: false, utter: null, at: null });
  speechSynthesis.cancel();
  document.body.classList.remove("listening");
  document.querySelectorAll(".v.reading").forEach((e) => e.classList.remove("reading"));
  renderListenBar();
}
function pauseListen(on) {
  listen.paused = on;
  if (on) { listen.utter = null; speechSynthesis.cancel(); renderListenBar(); }
  else speakVerse(); // from the start of the verse: resume() is unreliable across browsers
}
function skipListen(d) {
  listen.v = Math.max(1, listen.v + d);
  listen.paused = false;
  speakVerse();
}
// After the hash changes: carry on in the next chapter if reading moved there, else stop.
function listenAfterRoute() {
  if (!listen.on) return;
  if (listen.next) { listen.next = false; return speakVerse(); }
  if (listen.at !== `${state.book}.${state.chapter}`) stopListen();
}
function renderListenBar() {
  const bar = $("listen-bar");
  bar.hidden = !listen.on;
  $("listen-btn").setAttribute("aria-pressed", listen.on);
  if (!listen.on) return;
  const b = state.byId[state.book];
  $("listen-ref").textContent = `${bname(b)} ${state.chapter}:${listen.v}`;
  const pp = $("listen-pp");
  pp.replaceChildren(svgIcon(listen.paused ? ICON_PLAY : ICON_PAUSE));
  pp.title = pp.ariaLabel = t(listen.paused ? "listenGo" : "listenPause");
  $("listen-rate").textContent = `${store.get("bible-rate") || 1}×`;
  const voices = listenVoices();
  $("listen-voice").hidden = voices.length < 2;
  $("listen-voice-name").textContent = voices[0] ? voiceName(voices[0]) : "";
  if (!$("voice-menu").hidden) renderVoiceMenu();
}
// A voice's name without the browser's notes ("Google 普通话（中国大陆）" stays, "Daniel (Enhanced)" becomes "Daniel").
const voiceName = (v) => v.name.replace(/\s*\((enhanced|premium|compact)\)$/i, "").replace(/^Microsoft\s+|\s+Online.*$/g, "");
// The device's voices for the language, each with where it is from; the one in use is ticked. Picking one reads the
// current verse again in it.
function renderVoiceMenu() {
  const menu = $("voice-menu"), voices = listenVoices(), now = voices[0]?.name;
  const region = (lang) => { try { return new Intl.DisplayNames([state.lang === "zh" ? "zh" : "en"], { type: "region" }).of(lang.split(/[-_]/)[1]?.toUpperCase()); } catch { return ""; } };
  menu.replaceChildren(el("p", "voice-head", t("listenVoice")), ...voices.map((v) => {
    const b = el("button");
    b.setAttribute("role", "menuitemradio");
    b.setAttribute("aria-checked", v.name === now);
    b.append(el("span", "", voiceName(v)), el("small", "", [region(v.lang), /enhanced|premium|natural|neural/i.test(v.name) && "HD"].filter(Boolean).join(" · ")));
    b.onclick = () => {
      store.set("bible-voice-" + speechLang(), v.name);
      showVoiceMenu(false);
      if (listen.paused) pauseListen(false); else speakVerse();
    };
    return b;
  }), el("p", "note small", t("voiceMore")));
}
function showVoiceMenu(on) {
  $("voice-menu").hidden = !on;
  $("listen-voice").setAttribute("aria-expanded", on);
  if (on) { renderVoiceMenu(); $("voice-menu").querySelector("[aria-checked=true]")?.focus(); }
}
function listenControls() {
  if (!window.speechSynthesis) return;
  // The dock's Listen switch: on reads from the selected verse (or the first) and shows the player; off stops.
  $("listen-btn").hidden = false;
  $("listen-btn").onclick = () => (listen.on ? stopListen() : startListen(state.verse || 1));
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener?.("voiceschanged", renderListenBar);
  $("listen-pp").onclick = () => pauseListen(!listen.paused);
  $("listen-prev").onclick = () => skipListen(-1);
  $("listen-next").onclick = () => skipListen(1);
  $("listen-x").onclick = stopListen;
  $("listen-rate").onclick = () => {
    const r = store.get("bible-rate") || 1;
    store.set("bible-rate", RATES[(RATES.indexOf(r) + 1) % RATES.length]);
    if (listen.paused) renderListenBar(); else speakVerse(); // the new speed from this verse
  };
  $("listen-voice").onclick = () => showVoiceMenu($("voice-menu").hidden);
  document.addEventListener("click", (e) => { if (!e.target.closest("#voice-menu, #listen-voice")) showVoiceMenu(false); });
  $("voice-menu").addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); showVoiceMenu(false); $("listen-voice").focus(); } });
  // Leaving the page stops the voice (some browsers keep talking).
  addEventListener("pagehide", stopListen);
}

// --- Book and chapter picker -------------------------------------------------

function showBooks() {
  view.dialog = null; // not shareable
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
  view.dialog = null; // not shareable
  view.back = null;
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
  if (!q) {
    out.innerHTML = `<p class="note">${t("searchHint")}</p>`;
    // With nothing typed, the most cited topics, as a way in.
    topicIndex().then((idx) => {
      if (seq !== searchSeq) return;
      const row = el("div", "topic-chips");
      for (const [x, i] of idx.map((x, i) => [x, i]).filter(([x]) => !zh() || x[1]).sort(([a], [z]) => z[2] - a[2]).slice(0, 40)) {
        const chip = el("button", "chip", topicName(x));
        chip.onclick = () => { $("search").close(); openTopic(i); };
        row.append(chip);
      }
      out.append(el("div", "testament", t("popularTopics")), row);
    }).catch(() => {});
    return;
  }
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
  const harmony = await loadHarmony().catch(() => ({ sections: [] }));
  if (seq !== searchSeq) return;
  add(t("harmony"), harmony.sections.map((s, i) => [s, i]).filter(([s]) => has(s[1], s[2])).slice(0, 12)
    .map(([s, i]) => item(zh() ? s[2] : s[1], GOSPELS.flatMap((g, k) => s[3 + k].slice(0, 1).map(refShortSpan)).join(" · "), () => openHarmony(i))));
  const topics = await topicIndex().catch(() => []);
  if (seq !== searchSeq) return;
  add(t("topics"), topics.map((x, i) => [x, i]).filter(([x]) => has(x[0], x[1]))
    .sort(([a], [z]) => (norm(topicName(z)).startsWith(nq) - norm(topicName(a)).startsWith(nq)) || z[2] - a[2]).slice(0, 20)
    .map(([x, i]) => item(topicName(x), t("topicRefs", x[2]), () => openTopic(i))));
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

// --- Word study -----------------------------------------------------------------------------------------
// Every word of the open verse (in the context panel) can be tapped: it opens every verse in the same translation
// that uses it, with a count for each book drawn as a bar, and a tap on a bar keeps that book's verses only.
// English matches the whole word, ignoring case ("love" finds "Love" but not "loved"); 和合本 matches the word
// anywhere, as Chinese has no spaces (the browser splits a verse into words with Intl.Segmenter).

const WORD_LIST = 200; // verses listed before "Show more"
// Text as [piece, is a word], words as the browser splits them (the Hebrew and Greek data counts words the same way).
const segmenters = {};
function segments(text, tr) {
  const lang = tr === "cuv" ? "zh" : "en";
  if (!window.Intl?.Segmenter) return text.split(/(\p{L}+(?:['’]\p{L}+)*)/u).map((s, i) => [s, i % 2 === 1]);
  segmenters[lang] ||= new Intl.Segmenter(lang, { granularity: "word" });
  return [...segmenters[lang].segment(text)].map((s) => [s.segment, s.isWordLike]);
}
const wordsOf = (text, tr = "kjv") => segments(text, tr).filter(([, w]) => w).map(([s]) => s);
// Each word opens a word study; with tags ([[word index, Strong's ids]]), also the Hebrew or Greek behind it.
function wordSpans(text, tr, tags = null) {
  const frag = document.createDocumentFragment(), orig = new Map(tags || []);
  let i = 0;
  for (const [s, word] of segments(text, tr)) {
    if (!word) { frag.append(s); continue; }
    const w = el("span", "w", s), ids = orig.get(i++);
    w.onclick = () => { state.wordFrom = s; openWord(s, tr, null, WORD_LIST, ids); };
    frag.append(w);
  }
  return frag;
}
const wordTest = (word, tr) => {
  if (tr === "cuv") return (text) => text.includes(word);
  const re = new RegExp(`(^|[^\\p{L}])${norm(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^\\p{L}])`, "u");
  return (text) => re.test(norm(text));
};
async function openWord(word, tr, book = null, limit = WORD_LIST, orig = null) {
  view.dialog = null; // not shareable
  view.back = null;
  $("picker-title").textContent = `${tr === "cuv" ? "“" + word + "”" : "“" + word.toLowerCase() + "”"} · ${tr === "cuv" ? "和合本" : "KJV"}`;
  $("picker-back").hidden = true;
  const body = $("picker-body");
  if (!$("picker").open) { body.replaceChildren(el("p", "note", t("searching"))); $("picker").showModal(); }
  const texts = await Promise.all(state.books.map((b) => bookText(b.id, tr)));
  const test = wordTest(word, tr), hits = [], perBook = state.books.map(() => 0);
  texts.forEach((chapters, bi) => chapters.forEach((verses, ci) => verses.forEach((text, vi) => {
    if (!text || !test(text)) return;
    perBook[bi]++;
    hits.push([bi, ci + 1, vi + 1, text]);
  })));
  const total = hits.length, books = perBook.filter(Boolean).length;
  body.replaceChildren(el("p", "word-sum", t("wordSum", total, books)));
  // The Hebrew or Greek word behind this one, in the verse it was tapped in.
  if (orig) {
    const entries = await Promise.all(orig.map(lexEntry));
    body.prepend(...orig.map((sid, k) => entries[k] && origCard(sid, entries[k], word, () => openStrong(sid, null, WORD_LIST, null, [word, tr, orig]))).filter(Boolean));
  }
  // Chinese words run together, and the browser's split is a guess: offer the shorter words inside this one.
  const seg = (state.wordFrom || "").includes(word) ? state.wordFrom : word;
  if (tr === "cuv" && seg.length > 1) {
    const parts = [seg, ...Array.from({ length: seg.length - 1 }, (_, i) => seg.slice(i, i + 2)), ...seg];
    const row = el("div", "word-parts");
    for (const w of [...new Set(parts)]) {
      const c = el("button", "chip" + (w === word ? " on" : ""), w);
      c.onclick = () => openWord(w, tr);
      row.append(c);
    }
    body.append(row);
  }
  // One bar per book, Genesis to Revelation, as tall as its count.
  const max = Math.max(1, ...perBook), chart = el("div", "word-chart");
  perBook.forEach((n, bi) => {
    const b = el("button", (n ? "" : "none ") + (book === bi ? "on" : ""));
    b.style.setProperty("--h", n ? Math.max(6, (100 * n) / max) + "%" : "2px");
    b.title = b.ariaLabel = `${bname(state.books[bi])} · ${t("nVerses", n)}`;
    b.disabled = !n;
    b.onclick = () => openWord(word, tr, book === bi ? null : bi, WORD_LIST, orig);
    if (bi === NT_START) b.classList.add("nt");
    chart.append(b);
  });
  const axis = el("div", "word-axis");
  axis.append(el("span", "", t("ot")), el("span", "", t("nt")));
  axis.style.setProperty("--nt", `${(100 * NT_START) / state.books.length}%`);
  body.append(chart, axis);
  // Most uses: the top books, as a line.
  const top = perBook.map((n, bi) => [n, bi]).filter(([n]) => n).sort((a, z) => z[0] - a[0]).slice(0, 5);
  if (top.length > 1) body.append(el("p", "note small", t("mostIn", top.map(([n, bi]) => `${bname(state.books[bi])} ${n}`).join(zh() ? "、" : ", "))));
  // The verses, or one book's.
  const list = book == null ? hits : hits.filter((h) => h[0] === book);
  const head = el("div", "testament", book == null ? t("verses") : `${bname(state.books[book])} · ${t("nVerses", list.length)}`);
  if (book != null) {
    const all = el("button", "pill small-pill", t("allBooks"));
    all.onclick = () => openWord(word, tr, null, WORD_LIST, orig);
    head.append(" ", all);
  }
  const ul = el("ul", "results");
  for (const [bi, c, v, text] of list.slice(0, limit)) {
    const li = el("li"), btn = el("button");
    btn.append(el("b", "", `${bname(state.books[bi])} ${c}:${v}`));
    const small = el("small");
    small.lang = tr === "cuv" ? "zh-CN" : "en";
    small.innerHTML = markWord(text, word, tr);
    btn.append(small);
    btn.onclick = () => { $("picker").close(); go(state.books[bi].id, c, v); };
    li.append(btn);
    ul.append(li);
  }
  body.append(head, ul);
  if (list.length > limit) {
    const more = el("button", "pill more", t("showAll", list.length));
    more.onclick = () => openWord(word, tr, book, Infinity, orig);
    body.append(more);
  }
}
// The verse with each use of the word in <mark>.
function markWord(text, word, tr, escaped = false) {
  const h = escaped ? text : esc(text);
  if (tr === "cuv") return h.split(esc(word)).join(`<mark>${esc(word)}</mark>`);
  const w = esc(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return h.replace(new RegExp(`(^|[^\\p{L}])(${w})(?=$|[^\\p{L}])`, "giu"), "$1<mark>$2</mark>");
}

// --- Hebrew and Greek ---------------------------------------------------------------------------------------
// A Strong's entry as a card: the word, how it sounds, its part of speech and definition. "from" names the English word
// it was reached from; "open" (if given) is a button to every verse that uses it.
function origCard(sid, [lemma, xlit, pron, def, pos], from, open) {
  const card = el("div", "orig-card"), head = el("div", "orig-head");
  const w = el("span", "orig-lemma", lemma);
  w.lang = sid[0] === "H" ? "he" : "grc";
  if (sid[0] === "H") w.dir = "rtl";
  head.append(w, el("span", "orig-xlit", [xlit, pron && `(${pron})`].filter(Boolean).join(" ")), el("span", "orig-id", sid));
  if (from) card.append(el("p", "note small orig-from", t("origOf", from)));
  card.append(head);
  if (pos) card.append(el("p", "orig-pos", pos));
  const d = el("p", "orig-def", def);
  d.lang = "en";
  card.append(d);
  if (open) {
    const btn = el("button", "pill small-pill", t("origSeeAll"));
    btn.onclick = open;
    card.append(btn);
  }
  return card;
}

// Every verse that uses a Hebrew or Greek word, how the KJV translates it (tap one to see only those verses), and the
// books it is in. "from" ([word, translation, ids]) is the word study it was opened from, for the back button.
async function openStrong(sid, book = null, limit = WORD_LIST, rendering = null, from = null) {
  view.dialog = null; // not shareable
  const body = $("picker-body"), entry = await lexEntry(sid);
  $("picker-title").textContent = `${entry ? entry[0] : sid} · ${sid}`;
  view.back = from ? () => openWord(from[0], from[1], null, WORD_LIST, from[2]) : null;
  $("picker-back").hidden = !from;
  if (!$("picker").open) { body.replaceChildren(el("p", "note", t("searching"))); $("picker").showModal(); }
  const n = +sid.slice(1), heb = sid[0] === "H", tr = versions()[0];
  const range = heb ? state.books.slice(0, NT_START) : state.books.slice(NT_START);
  const [tags, kjv, texts] = await Promise.all([Promise.all(range.map((b) => bookStrongs(b.id))),
    Promise.all(range.map((b) => bookText(b.id, "kjv"))), Promise.all(range.map((b) => bookText(b.id, tr)))]);
  const hits = [], counts = new Map(), perBook = state.books.map(() => 0);
  range.forEach((b, k) => {
    const bi = state.books.indexOf(b);
    for (const [cv, list] of Object.entries(tags[k])) {
      const at = list.filter(([, x]) => [].concat(x).includes(n)).map(([i]) => i);
      if (!at.length) continue;
      const [c, v] = cv.split(".").map(Number), words = wordsOf(kjv[k][c - 1][v - 1] || "");
      const used = [...new Set(at.map((i) => (words[i] || "").toLowerCase()))];
      for (const u of used) counts.set(u, (counts.get(u) || 0) + 1);
      if (rendering && !used.includes(rendering)) continue;
      perBook[bi]++;
      hits.push([bi, c, v, tr === "kjv" ? kjv[k][c - 1][v - 1] : texts[k][c - 1][v - 1], used]);
    }
  });
  hits.sort((a, z) => a[0] - z[0] || a[1] - z[1] || a[2] - z[2]);
  body.replaceChildren();
  if (entry) body.append(origCard(sid, entry));
  // How the KJV translates it, most often first.
  const ways = [...counts].sort((a, z) => z[1] - a[1]), row = el("div", "word-parts renderings");
  const chips = [[null, null], ...ways].map(([w, k]) => {
    const c = el("button", "chip" + (w === rendering ? " on" : ""), w == null ? t("allRenderings") : `${w} ${k}`);
    c.onclick = () => openStrong(sid, null, WORD_LIST, w, from);
    return c;
  });
  // The rarer ones fold behind a "+n" chip (unless one of them is picked).
  const keep = Math.max(13, chips.findIndex((c) => c.classList.contains("on")) + 1);
  row.append(...chips.slice(0, keep));
  if (chips.length > keep) {
    const more = el("button", "chip", `+${chips.length - keep}`);
    more.onclick = () => more.replaceWith(...chips.slice(keep));
    row.append(more);
  }
  body.append(el("p", "word-sum", t("rendered")), row);
  body.append(el("p", "note small", t("origAll", rendering ? counts.get(rendering) : hits.length)));
  // One bar per book, as in the word study.
  const max = Math.max(1, ...perBook), chart = el("div", "word-chart"), list = book == null ? hits : hits.filter((h) => h[0] === book);
  range.forEach((b) => {
    const bi = state.books.indexOf(b), k = perBook[bi], bar = el("button", (k ? "" : "none ") + (book === bi ? "on" : ""));
    bar.style.setProperty("--h", k ? Math.max(6, (100 * k) / max) + "%" : "2px");
    bar.title = bar.ariaLabel = `${bname(b)} · ${t("nVerses", k)}`;
    bar.disabled = !k;
    bar.onclick = () => openStrong(sid, book === bi ? null : bi, WORD_LIST, rendering, from);
    chart.append(bar);
  });
  const axis = el("div", "word-axis");
  axis.append(el("span", "", t(heb ? "ot" : "nt")));
  body.append(chart, axis);
  const head = el("div", "testament", book == null ? t("verses") : `${bname(state.books[book])} · ${t("nVerses", list.length)}`);
  if (book != null) {
    const all = el("button", "pill small-pill", t("allBooks"));
    all.onclick = () => openStrong(sid, null, WORD_LIST, rendering, from);
    head.append(" ", all);
  }
  const ul = el("ul", "results");
  for (const [bi, c, v, text, used] of list.slice(0, limit)) {
    const li = el("li"), btn = el("button");
    btn.append(el("b", "", `${bname(state.books[bi])} ${c}:${v}`));
    if (tr !== "kjv") btn.append(" ", el("span", "rendered", used.join(", ")));
    const small = el("small");
    small.lang = tr === "cuv" ? "zh-CN" : "en";
    small.innerHTML = tr === "kjv" ? used.reduce((h, u) => markWord(h, u, "kjv", true), esc(text || "")) : esc(text || "");
    btn.append(small);
    btn.onclick = () => { $("picker").close(); go(state.books[bi].id, c, v); };
    li.append(btn);
    ul.append(li);
  }
  body.append(head, ul);
  if (list.length > limit) {
    const more = el("button", "pill more", t("showAll", list.length));
    more.onclick = () => openStrong(sid, book, Infinity, rendering, from);
    body.append(more);
  }
  body.append(el("p", "note small src", t("origNote")));
}

// --- Verse card -----------------------------------------------------------------------------------------
// A picture to share: the verse over a map of the places it names (or its chapter's, or the Holy Land), 1080×1350
// for phones and social posts, drawn on a canvas from the same base map as the Places tab. Light or dark.

const CARD = { w: 1080, h: 1350 };
const CARD_THEMES = {
  light: { sea: "#d9e2ec", land: "#efe9dc", coast: "#b9b3a5", water: "#7d9cc4", ink: "#1f2024", muted: "#5e6066", fade: "254,254,252", pin: "#b8432f", logo: "img/logo.svg" },
  dark: { sea: "#16202d", land: "#2a2925", coast: "#4a4740", water: "#4f6f99", ink: "#ece9e2", muted: "#a3a19b", fade: "24,25,29", pin: "#e07a5f", logo: "img/logo-white.svg" },
};
const loadImage = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

async function drawCard(theme) {
  const T = CARD_THEMES[theme], b = state.byId[state.book], c = state.chapter, v = state.verse;
  const vs = versions();
  const [texts, places, ctx, base, logo] = await Promise.all([Promise.all(vs.map((tr) => bookText(b.id, tr))),
    loadJSON("data/places.json"), bookContext(b.id), loadJSON("data/basemap.json"), loadImage(T.logo)]);
  await Promise.all(['600 40px "Source Serif 4"', '400 40px "Source Serif 4"', '400 40px "Noto Serif SC"', '600 30px "IBM Plex Sans"']
    .map((f) => document.fonts?.load(f).catch(() => {})));
  // The places: this verse's, else the chapter's.
  let ids = ctx.places[`${c}.${v}`] || [];
  if (!ids.length) ids = [...new Set(Object.entries(ctx.places).filter(([k]) => k.startsWith(c + ".")).flatMap(([, l]) => l))];
  const pts = ids.map((i) => places[i]).map(([, name, lon, lat, , nameZh]) => [(zh() && nameZh) || name, lon, lat]).slice(0, 12);
  const cv = Object.assign(document.createElement("canvas"), { width: CARD.w, height: CARD.h }), g = cv.getContext("2d");

  // Map: the places framed in the top part of the card, the land carrying on under the text.
  const lons = pts.length ? pts.map((p) => p[1]) : [34.2, 36.2], lats = pts.length ? pts.map((p) => p[2]) : [30.8, 33.2];
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2, k = Math.cos((midLat * Math.PI) / 180);
  const box = { x0: 120, x1: CARD.w - 120, y0: 150, y1: 600 };
  const spanX = Math.max((Math.max(...lons) - Math.min(...lons)) * k, 4), spanY = Math.max(Math.max(...lats) - Math.min(...lats), 3);
  const s = Math.min((box.x1 - box.x0) / spanX, (box.y1 - box.y0) / spanY);
  const cxl = (Math.min(...lons) + Math.max(...lons)) / 2, cyl = (Math.min(...lats) + Math.max(...lats)) / 2;
  const X = (lon) => (box.x0 + box.x1) / 2 + (lon - cxl) * k * s, Y = (lat) => (box.y0 + box.y1) / 2 - (lat - cyl) * s;
  g.fillStyle = T.sea;
  g.fillRect(0, 0, CARD.w, CARD.h);
  const rings = (list, close) => { g.beginPath(); for (const r of list) r.forEach(([lon, lat], i) => (i ? g.lineTo : g.moveTo).call(g, X(lon), Y(lat))); if (close) g.closePath(); };
  g.lineJoin = "round";
  rings(base.land, true); g.fillStyle = T.land; g.fill("evenodd"); g.strokeStyle = T.coast; g.lineWidth = 1.5; g.stroke();
  rings(base.lakes, true); g.fillStyle = T.sea; g.fill(); g.strokeStyle = T.water; g.lineWidth = 1.2; g.stroke();
  rings(base.rivers, false); g.strokeStyle = T.water; g.lineWidth = 2; g.stroke();
  // A name beside a point, on whichever side has room, with a halo; cut short if it still runs off the card.
  const label = (x, y, text, font, color) => {
    g.font = font;
    const roomR = CARD.w - 40 - (x + 22), roomL = x - 22 - 40;
    const right = g.measureText(text).width <= roomR || roomR >= roomL, room = right ? roomR : roomL;
    let s = text;
    while (g.measureText(s).width > room && s.length > 2) s = s.slice(0, -2).trimEnd() + "…";
    const tx = right ? x + 22 : x - 22;
    g.textAlign = right ? "left" : "right";
    g.lineWidth = 8; g.strokeStyle = T.land; g.strokeText(s, tx, y + 10);
    g.fillStyle = color; g.fillText(s, tx, y + 10);
  };
  // Landmarks for orientation, in frame and not near a place.
  for (const [name, lon, lat] of LANDMARKS) {
    const x = X(lon), y = Y(lat);
    if (x < 60 || x > CARD.w - 60 || y < 60 || y > 640) continue;
    if (pts.some((p) => Math.hypot(X(p[1]) - x, Y(p[2]) - y) < 90)) continue;
    g.beginPath(); g.arc(x, y, 6, 0, 2 * Math.PI); g.fillStyle = T.muted; g.fill();
    label(x, y - 2, zh() ? LANDMARKS_ZH[name] || name : name, '500 24px "IBM Plex Sans", system-ui, sans-serif', T.muted);
  }
  // Pins and names (places a few pixels apart share a name).
  const groups = [];
  for (const [name, lon, lat] of pts) {
    const x = X(lon), y = Y(lat), gr = groups.find((q) => Math.hypot(q.x - x, q.y - y) < 36);
    if (gr) gr.names.push(name); else groups.push({ x, y, names: [name] });
  }
  for (const { x, y, names } of groups) {
    g.beginPath(); g.arc(x, y, 11, 0, 2 * Math.PI); g.fillStyle = T.pin; g.fill(); g.lineWidth = 4; g.strokeStyle = T.land; g.stroke();
    label(x, y, names.join(zh() ? "、" : ", "), '600 30px "IBM Plex Sans", system-ui, sans-serif', T.ink);
  }
  // A fade into a plain panel for the words.
  const fade = g.createLinearGradient(0, 560, 0, 760);
  fade.addColorStop(0, `rgba(${T.fade},0)`); fade.addColorStop(1, `rgba(${T.fade},0.94)`);
  g.fillStyle = fade; g.fillRect(0, 560, CARD.w, 200);
  g.fillStyle = `rgba(${T.fade},0.94)`; g.fillRect(0, 760, CARD.w, CARD.h - 760);

  // The words, as large as fit between the fade and the footer.
  const lines = vs.map((tr, i) => ({ tr, text: texts[i][c - 1][v - 1] || "", second: i > 0 }));
  const top = 690, bottom = CARD.h - 190, width = CARD.w - 160;
  const fontFor = (l, size) => `${l.second ? 400 : 400} ${l.second ? Math.round(size * 0.78) : size}px ${l.tr === "cuv" ? '"Noto Serif SC", "Source Serif 4", serif' : '"Source Serif 4", Georgia, serif'}`;
  const wrap = (l, size) => {
    g.font = fontFor(l, size);
    const words = l.tr === "cuv" ? [...l.text] : l.text.split(/(?<= )/), out = [];
    let line = "";
    for (const w of words) {
      // Chinese punctuation that may not start a line stays at the end of the one before.
      if (line && g.measureText(line + w).width > width && !(l.tr === "cuv" && /^[，。、；：！？）」』”’]/.test(w))) {
        out.push(line.trimEnd()); line = w.trimStart();
      } else line += w;
    }
    if (line) out.push(line.trimEnd());
    return out;
  };
  let size = 60, laid;
  for (; size >= 26; size -= 2) {
    laid = lines.map((l) => ({ l, rows: wrap(l, size), lh: (l.second ? 0.78 : 1) * size * (l.tr === "cuv" ? 1.6 : 1.42) }));
    const hgt = laid.reduce((sum, x) => sum + x.rows.length * x.lh, 0) + (laid.length - 1) * size * 0.6;
    if (hgt <= bottom - top) break;
  }
  const total = laid.reduce((sum, x) => sum + x.rows.length * x.lh, 0) + (laid.length - 1) * size * 0.6;
  let y = top + Math.max(0, (bottom - top - total) / 2);
  g.textAlign = "left";
  for (const { l, rows, lh } of laid) {
    g.font = fontFor(l, size);
    g.fillStyle = l.second ? T.muted : T.ink;
    for (const r of rows) { g.fillText(r, 80, y + lh * 0.78); y += lh; }
    y += size * 0.6;
  }
  // Reference, and the site with its logo.
  g.fillStyle = T.ink;
  g.font = '600 38px "IBM Plex Sans", system-ui, sans-serif';
  g.fillText(`${bname(b)} ${c}:${v}`, 80, CARD.h - 112);
  g.fillStyle = T.muted;
  g.font = '500 26px "IBM Plex Sans", system-ui, sans-serif';
  g.textAlign = "right";
  g.fillText("bible.daiyip.com", CARD.w - 80, CARD.h - 112);
  g.drawImage(logo, CARD.w - 80 - g.measureText("bible.daiyip.com").width - 52, CARD.h - 146, 40, 40);
  g.fillText(vs.map((tr) => (tr === "cuv" ? "和合本" : "KJV")).join(" · "), CARD.w - 80, CARD.h - 70);
  return cv;
}

async function openCard(theme = store.get("bible-card-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) {
  const b = state.byId[state.book], ref = `${bname(b)} ${state.chapter}:${state.verse}`;
  view.dialog = null; // not shareable
  $("picker-title").textContent = t("cardTitle");
  $("picker-back").hidden = true;
  const body = $("picker-body");
  if (!$("picker").open) { body.replaceChildren(el("p", "note", "…")); $("picker").showModal(); }
  const cv = await drawCard(theme);
  const blob = await new Promise((ok) => cv.toBlob(ok, "image/png"));
  const name = `${b.id}-${state.chapter}-${state.verse}.png`, file = new File([blob], name, { type: "image/png" });
  const img = el("img", "card-preview");
  img.src = URL.createObjectURL(blob);
  img.alt = ref;
  const seg = el("div", "seg");
  for (const k of ["light", "dark"]) {
    const btn = el("button", "", t(k));
    btn.setAttribute("aria-pressed", k === theme);
    btn.onclick = () => { store.set("bible-card-theme", k); openCard(k); };
    seg.append(btn);
  }
  const acts = el("div", "card-acts");
  acts.append(seg);
  if (navigator.canShare?.({ files: [file] })) {
    const share = el("button", "pill primary", t("share"));
    share.onclick = () => navigator.share({ files: [file], title: ref, text: `${ref} · bible.daiyip.com` }).catch(() => {});
    acts.append(share);
  }
  const save = el("a", "pill" + (navigator.canShare?.({ files: [file] }) ? "" : " primary"), t("download"));
  save.href = img.src;
  save.download = name;
  acts.append(save);
  body.replaceChildren(img, acts);
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
  if ($("timeline-card").hidden) return; // drawn when shown
  const { years = {} } = await bookContext(state.book);
  const y = (state.verse && years[`${state.chapter}.${state.verse}`]) ?? years[state.chapter] ?? null;
  const i = eraFor(eras, y), here = bar.querySelector(".here");
  bar.querySelectorAll(".era").forEach((b) => b.classList.toggle("cur", +b.dataset.i === i));
  here.hidden = i < 0;
  state.year = i < 0 ? null : y;
  $("tl-era").textContent = i < 0 ? t("noYear") : eraName(eras[i]);
  $("tl-year").textContent = i < 0 ? "" : fmtYear(y);
  $("tl-now").disabled = i < 0;
  $("tl-now").onclick = () => showEra(i);
  if (i < 0) return;
  const e = eras[i], seg = bar.children[i];
  const f = e.id === "before" ? 0.5 : (y - e.start + 0.5) / (e.end - e.start + 1); // Genesis 1–11: no scale before Abraham
  here.style.left = `${seg.offsetLeft + f * seg.offsetWidth}px`;
  here.title = `${t("youAreHere")} · ${fmtYear(y)}`;
}

async function showEra(i) {
  const eras = await loadEras(), e = eras[i];
  view.dialog = `era:${i}`;
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
  if (e.start <= -586 && e.end >= -1050) {
    const k = el("button", "pill", t("kingsBtn"));
    k.onclick = () => showKings();
    nav.append(k);
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
// Highlight colours apply to every selected verse; the note belongs to the first.
let markKeys = [];
function renderMarkTools(keys = markKeys) {
  markKeys = keys;
  const key = keys[0], box = $("ctx-mark"), m = mine.marks[key] || {};
  box.replaceChildren();
  const row = el("div", "swatches");
  for (const c of COLORS) {
    const s = el("button", "swatch hl-" + c), on = keys.every((k) => mine.marks[k]?.c === c);
    s.title = s.ariaLabel = t("hl")[c];
    s.setAttribute("aria-pressed", on);
    s.onclick = () => { for (const k of keys) setMark(k, { c: on ? null : c }, false); renderMarkTools(); };
    row.append(s);
  }
  const note = el("button", "pill small-pill", m.n ? t("editNote") : t("addNote"));
  const card = el("button", "pill small-pill", t("card"));
  card.title = t("cardTip");
  card.onclick = () => openCard().catch(showError);
  row.append(note, card);
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
  if (redraw) renderMarkTools();
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
  const btn = el("button", "pill", t("saveOffline", names, Math.round(3.8 * vs.length + 14)));
  if ((store.get("bible-offline") || []).includes(state.version)) { btn.textContent = t("saved", names); btn.disabled = true; }
  btn.onclick = async () => {
    btn.disabled = true;
    const files = ["data/books.json", "data/places.json", "data/search.json", "data/people.json", "data/basemap.json", "data/timeline.json", "data/lands.json", "data/names.json", "data/kings.json", "data/intros.json", "data/topics/index.json", "data/harmony.json",
      "atlas/tours.json", "atlas/eras.json", "atlas/events.json",
      ...Array.from({ length: 12 }, (_, i) => `data/people/${i}.json`),
      ...state.books.flatMap((b) => [...vs.map((v) => `data/text/${v}/${b.id}.json`), `data/xref/${b.id}.json`, `data/vctx/${b.id}.json`, `data/strongs/${b.id}.json`]),
      ...Array.from({ length: 54 }, (_, i) => `data/topics/${i}.json`), ...state.books.map((b) => `data/topics/v/${b.id}.json`),
      ...Array.from({ length: 87 }, (_, i) => `data/lexicon/H${i}.json`), ...Array.from({ length: 57 }, (_, i) => `data/lexicon/G${i}.json`)];
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
  // On an iPhone or iPad in the browser, the install guide again (even after "Don't show it again").
  if (canInstall()) {
    const inst = el("button", "pill", t("installBtn", installDevice()));
    inst.onclick = () => { $("mine").close(); showInstall(); };
    box.append(" ", inst);
  }
  body.append(box);
}

// --- Install guide (iPhone, iPad and Mac) --------------------------------------------
// Safari has no install prompt, so this shows how to add the app to the Home Screen (iPhone, iPad) or the Dock (Mac,
// Safari 17 and later); Chrome and Edge on a Mac get their own Install button when the browser offers one. Shown only
// when the page is not already running as the installed app, and not again once dismissed for good
// ("bible-install-hide"); "Not now" hides it until the next visit.

const UA = navigator.userAgent;
const installDevice = () => /iPhone|iPod/.test(UA) ? "iphone"
  : /iPad/.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ? "ipad"
  : /Macintosh/.test(UA) ? "mac" : null;
// On a Mac: "safari" (17 and later can Add to Dock), "chromium" (Chrome, Edge, Brave… can install), or null (Firefox,
// older Safari: no way to install).
const macBrowser = () => /Edg\/|Chrome\//.test(UA) ? "chromium"
  : /Firefox\//.test(UA) ? null
  : +(/Version\/(\d+)/.exec(UA)?.[1] || 0) >= 17 ? "safari" : null;
const runningAsApp = () => navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
// Browsers inside other apps (WeChat, Facebook, Instagram, LINE…) can't add to the Home Screen; Safari can.
const inAppBrowser = () => /MicroMessenger|FBAN|FBAV|Instagram|Line\/|WhatsApp|Weibo|QQ\//i.test(UA);
const canInstall = () => { const d = installDevice(); return !!d && !runningAsApp() && (d !== "mac" || !!macBrowser()); };
const ICON_SHARE = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 10V2.2M5 5l3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 7.5H3.8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8.4a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const ICON_ADD = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const ICON_DOCK = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="1.5" y="10" width="13" height="4.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="4" y="11.6" width="2" height="1.4" rx=".4" fill="currentColor"/><rect x="7" y="11.6" width="2" height="1.4" rx=".4" fill="currentColor"/><rect x="10" y="11.6" width="2" height="1.4" rx=".4" fill="currentColor"/><path d="M8 1.5v6M5.5 5 8 7.5 10.5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_INSTALL = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.5v4.5M6 7l2 2 2-2M5 14h6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Chrome and Edge offer installing through this event; kept so the card's Install button can use it.
let installPrompt = null;
addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
  if ($("install")) showInstall(); // gains its Install button
});
addEventListener("appinstalled", () => { installPrompt = null; $("install")?.remove(); });

function maybeShowInstall() {
  if (!canInstall() || store.get("bible-install-hide")) return;
  try { if (sessionStorage.getItem("bible-install-later")) return; } catch {}
  setTimeout(() => !runningAsApp() && showInstall(), 2500);
}

function showInstall() {
  const device = installDevice() || "iphone", mac = device === "mac", browser = mac ? macBrowser() : null;
  $("install")?.remove();
  const card = make("section", "install");
  card.id = "install";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-labelledby", "install-h");
  const head = make("div", "install-head");
  const logo = make("img");
  logo.src = "img/icon-180.png";
  logo.alt = "";
  const h = make("h2", "", t("installTitle", device));
  h.id = "install-h";
  const x = make("button", "icon", "×");
  x.setAttribute("aria-label", t("close"));
  head.append(logo, h, x);
  const steps = make("ol", "install-steps");
  const step = (html, text) => { const li = make("li"); const i = make("span", "ico"); i.innerHTML = html; li.append(i, make("span", "", text)); steps.append(li); };
  if (mac && browser === "safari") {
    step(ICON_DOCK, t("installMacSafari"));
    step("✓", t("installMacDone"));
  } else if (mac) {
    step(ICON_INSTALL, t(/Edg\//.test(UA) ? "installMacEdge" : "installMacChrome"));
    step("✓", t("installMacDone"));
  } else {
    const safari = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(UA);
    const where = !safari ? t("installWhereOther") : device === "ipad" ? t("installWhereIpad") : t("installWhereIphone");
    if (inAppBrowser()) step("⋯", t("installInApp"));
    step(ICON_SHARE, t("installShare", where));
    step(ICON_ADD, t("installAdd"));
    step("✓", t("installDone"));
  }
  const acts = make("div", "install-acts");
  const later = make("button", "pill", t("installLater")), never = make("button", "pill quiet", t("installNever"));
  const close = () => { card.classList.add("leaving"); setTimeout(() => card.remove(), 200); };
  later.onclick = x.onclick = () => { try { sessionStorage.setItem("bible-install-later", "1"); } catch {} close(); };
  never.onclick = () => { store.set("bible-install-hide", true); close(); };
  acts.append(never, later);
  // Chrome and Edge: install in one click instead of following the steps.
  if (installPrompt) {
    const go = make("button", "pill", t("installNow"));
    go.onclick = async () => {
      const p = installPrompt;
      installPrompt = null;
      p.prompt();
      if ((await p.userChoice).outcome === "accepted") close();
      else showInstall();
    };
    acts.append(go);
  }
  card.append(head, make("p", "install-why", t(mac ? "installWhyMac" : "installWhy")), steps, acts);
  document.body.append(card);
}

// --- Routing and setup ---------------------------------------------------------

function route() {
  const r = parseRef(decodeURIComponent(location.hash.slice(1))) || parseRef(store.get("bible-pos")) || { book: "Gen", chapter: 1, verse: null, to: null };
  Object.assign(state, r);
  store.set("bible-pos", [r.book, r.chapter, r.verse].filter((x) => x != null).join("."));
  renderTour();
  renderTimeline().catch((e) => console.error(e));
  return renderChapter().then(() => { listenAfterRoute(); return renderContext(); }).catch(showError);
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
// Text size: one menu of named sizes, each shown at its own size.
const SIZES = [15, 17, 19, 22, 25, 28];
function nearestSize(px) {
  return SIZES.reduce((a, z) => (Math.abs(z - px) < Math.abs(a - px) ? z : a));
}
function renderSizeMenu() {
  const menu = $("size-menu");
  menu.replaceChildren();
  const now = nearestSize(state.size);
  SIZES.forEach((px, i) => {
    const b = el("button", null);
    b.setAttribute("role", "menuitemradio");
    b.setAttribute("aria-checked", px === now);
    const a = el("span", "aa", "Aa");
    a.style.fontSize = px + "px";
    b.append(a, el("span", null, t("sizes")[i]));
    b.onclick = () => { setSize(px); showSizeMenu(false); };
    menu.append(b);
  });
}
function showSizeMenu(on) {
  $("size-menu").hidden = !on;
  $("size-btn").setAttribute("aria-expanded", on);
  if (on) {
    renderSizeMenu();
    $("size-menu").querySelector("[aria-checked=true]").focus();
  }
}
function step(dir) {
  const n = neighbour(dir);
  if (n) location.hash = hashFor(n.book, n.chapter);
}

// --- Sharing ------------------------------------------------------------------------

// The open dialog, for share links: "tree:57", "land:judah:123", "kings:JAsa", "era:4". Set by the dialogs that can be
// shared, and cleared when the dialog closes.
const view = { dialog: null, back: null }; // back: where the dialog's back button goes, if not to the books

// A link to what is on screen: the passage in the hash as always, and the rest in the query: v translation, tab,
// p person, s sheet size (phones), tour "id.step", d dialog. Opening it restores all of that once, then drops the query.
function shareURL() {
  const q = new URLSearchParams({ v: state.version });
  if (ctxScope() || state.tour) q.set("tab", state.tab);
  if (ctxScope() === "chapter") q.set("ctx", "chapter");
  if (state.tab === "people" && state.person != null) q.set("p", state.person);
  if (phone() && ctxScope() && sheet.size !== "half") q.set("s", sheet.size);
  if (state.tour) q.set("tour", `${state.tour.tr.id}.${state.tour.i}`);
  if (view.dialog && $("picker").open) q.set("d", view.dialog);
  return `${location.origin}${location.pathname}?${q}${hashFor(state.book, state.chapter, state.verse, state.to)}`;
}

async function share() {
  const url = shareURL(), b = state.byId[state.book];
  const title = t("shareTitle", `${bname(b)} ${state.chapter}${state.verse ? ":" + state.verse + (state.to ? "–" + state.to : "") : ""}`);
  if (navigator.share && phone()) return navigator.share({ title, url }).catch(() => {});
  try { await navigator.clipboard.writeText(url); } catch { prompt(t("share"), url); return; }
  toast(t("copied"));
}

function toast(text) {
  const el = make("div", "toast", text);
  document.body.append(el);
  if ($("picker").open) $("picker").append(el); // above the modal dialog
  setTimeout(() => el.remove(), 1800);
}

// What a share link asks for, read before the first render (translation, tab, person, tour) and after it (sheet, dialog).
function sharedView() {
  const q = new URLSearchParams(location.search);
  if (!q.has("v")) return null;
  history.replaceState(null, "", location.pathname + location.hash);
  return {
    v: q.get("v"), tab: q.get("tab"), p: q.has("p") ? +q.get("p") : null, s: q.get("s"), tour: q.get("tour"), d: q.get("d"),
    ctx: q.get("ctx"),
  };
}

async function openShared(d) {
  const [kind, a, b] = (d || "").split(":");
  if (kind === "tree" && a) return showTree(+a);
  if (kind === "land") return showLand(a || "canaan", b ? +b : null);
  if (kind === "kings") return showKings(a || null);
  if (kind === "era" && a) return showEra(+a);
}

async function init() {
  // iOS Safari ignores user-scalable=no in the viewport tag; its own gesture events still let a page refuse pinch zoom.
  for (const g of ["gesturestart", "gesturechange"]) document.addEventListener(g, (e) => e.preventDefault(), { passive: false });
  state.books = await loadJSON("data/books.json");
  for (const b of state.books) state.byId[b.id] = b;
  setSize(store.get("bible-size") || 19);
  // The translation: remembered, or 和合本 for a browser set to Chinese.
  const v = store.get("bible-version");
  state.version = ["kjv", "cuv", "kjv+cuv", "cuv+kjv"].includes(v) ? v : /^zh\b/i.test(navigator.language) ? "cuv" : "kjv";
  const shared = sharedView();
  if (shared && ["kjv", "cuv", "kjv+cuv", "cuv+kjv"].includes(shared.v)) state.version = shared.v; // for this visit only
  applyLang();
  $("version").onchange = () => {
    state.version = $("version").value;
    store.set("bible-version", state.version);
    applyLang();
    fillTourList($("ctx-tours")).catch((e) => console.error(e));
    renderTodayHint();
    if ($("mine").open) renderMine();
    $("tour-play").textContent = play.on ? t("pause") : t("play");
    route();
  };
  if (TABS.includes(store.get("bible-tab"))) state.tab = store.get("bible-tab");
  if (TABS.includes(shared?.tab)) state.tab = shared.tab;
  // Chapter context: remembered on a computer, and opened by a link to it.
  state.chapterCtx = !phone() && store.get("bible-ctx-chapter") === true;
  if (shared?.ctx === "chapter") {
    Object.assign(state, { chapterCtx: true, scope: "chapter" });
    sheet.keepScope = true;
  }
  $("chapter-btn").onclick = () => {
    if (state.verse != null) { state.chapterCtx = true; state.scope = state.scope === "chapter" ? "sel" : "chapter"; return renderContext(); }
    setChapterCtx(!state.chapterCtx);
  };
  $("ctx-chapter").onclick = () => setChapterCtx(true);
  if (shared?.p != null) state.person = shared.p;

  $("chapter").addEventListener("click", (e) => {
    const el = e.target.closest(".v");
    if (!el) return;
    // Tapping a verse selects it; tapping another grows the selection to reach it. Tapping a selected verse lets go of
    // it: the first or last drops off the end, one in the middle drops with the verses after it (a selection has no
    // gaps), and the only one clears the selection.
    const v = +el.dataset.v, a = state.verse, z = state.to || a, pick = (x, y) => hashFor(state.book, state.chapter, x, y);
    location.hash = a == null ? pick(v)
      : v < a || v > z ? pick(Math.min(a, v), Math.max(z, v))
      : a === z ? pick(null)
      : v === a ? pick(a + 1, z)
      : pick(a, v - 1);
  });
  document.querySelector(".tabs").addEventListener("click", (e) => {
    const t = e.target.closest("button")?.dataset.tab;
    if (!t) return;
    if (t === "people" && state.tab === "people") state.person = null; // the tab again goes back to the verse's people
    state.tab = t;
    store.set("bible-tab", t);
    if (phone() && sheet.size !== "full") setSheet("full"); // room for the map and lists
    renderContext();
  });
  sheetControls();
  $("prev").onclick = $("prev2").onclick = () => step(-1);
  $("next").onclick = $("next2").onclick = () => step(1);
  $("size-btn").onclick = () => showSizeMenu($("size-menu").hidden);
  document.addEventListener("click", (e) => { if (!e.target.closest(".size-wrap")) showSizeMenu(false); });
  $("size-menu").addEventListener("keydown", (e) => {
    const items = [...$("size-menu").children], i = items.indexOf(document.activeElement);
    if (e.key === "Escape") { e.stopPropagation(); showSizeMenu(false); $("size-btn").focus(); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); e.stopPropagation();
      items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus();
    }
  });
  $("picker-btn").onclick = () => { showBooks(); $("picker").showModal(); };
  $("picker-x").onclick = () => $("picker").close();
  $("picker-back").onclick = () => (view.back || showBooks)();
  $("picker").addEventListener("click", (e) => { if (e.target === $("picker")) $("picker").close(); });
  addEventListener("keydown", (e) => {
    if ($("picker").open || $("search").open || $("mine").open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return; // typing a note or picking a translation
    if (e.key === "/") { e.preventDefault(); openSearch(); return; }
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Escape" && ctxScope()) closeCtx();
  });
  $("tours-btn").onclick = () => { showTours(); $("picker").showModal(); };
  listenControls();
  $("mine-btn").onclick = () => openMine();
  const showTimeline = (on) => {
    $("timeline-card").hidden = !on;
    $("timeline-btn").setAttribute("aria-pressed", on);
    store.set("bible-timeline", on);
    if (on) renderTimeline().catch((e) => console.error(e));
  };
  $("timeline-btn").onclick = () => showTimeline($("timeline-card").hidden);
  showTimeline(!!store.get("bible-timeline"));
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
  $("tour-play").onclick = () => {
    if (!play.on && state.tour.i === state.tour.tr.steps.length - 1) { setPlaying(true); return startTour(state.tour.tr.id, 0); } // play again
    setPlaying(!play.on);
    lightVerses();
  };
  // Picking a verse by hand stops the playback.
  $("chapter").addEventListener("click", () => setPlaying(false), true);
  fillTourList($("ctx-tours")).catch((e) => console.error(e));
  const saved = store.get("bible-tour");
  if (Array.isArray(saved)) {
    const tr = (await loadTours().catch(() => [])).find((t) => t.id === saved[0]);
    if (tr && tr.steps[saved[1]]) state.tour = { tr, i: saved[1] };
  }
  addEventListener("hashchange", route);
  $("share-btn").onclick = $("picker-share").onclick = share;
  $("picker").addEventListener("close", () => (view.dialog = null));
  if (shared?.tour) {
    const [id, i] = shared.tour.split("."), tr = (await loadTours().catch(() => [])).find((x) => x.id === id);
    if (tr && tr.steps[+i]) return startTour(id, +i);
  }
  await route();
  if (shared?.s && phone() && ctxScope()) setSheet(shared.s);
  if (shared?.d) openShared(shared.d).catch((e) => console.error(e));
  else maybeShowInstall();
  // Works offline once loaded (sw.js), and can be installed from the browser's menu.
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch((e) => console.error(e));
}

init().catch(showError);
