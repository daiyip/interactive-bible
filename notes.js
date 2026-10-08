// Notes on the text, kept on ContextHive Cloud (https://contexthive.dev): select words in a chapter to
// comment on them or highlight them, and open the notes button for the chapter's notes (and, under
// "All my notes", every note you wrote here, each opening its chapter). Signing in
// goes through the ContextHive hub in a popup. Signed out, nothing loads and nothing is sent.
//
// Notes belong to a chapter, whatever the translation: each is kept under the chapter's reference
// ("Gen.1"), and each verse carries its reference as `data-ctx-anchor` (app.js), so a note on a
// verse stays with it in another translation, while the exact words it quotes are marked only in the
// translation it was written in. contexthive/ is the bundled SDK (tools/contexthive/build.mjs).

import { CloudAdapter, CloudSignIn, ContextHive, builtInUi } from "./contexthive/contexthive.js";

const CLOUD = {
  url: "https://bidtxayocibcoodnpyya.supabase.co",
  // The project's publishable key: public, like a Supabase anon key.
  apiKey: "sb_publishable_lwVHAWCN7_ugJTeszv2NuQ_xji_JMUM",
};
const APP_ID = "interactive-bible";

const auth = new CloudSignIn({ url: CLOUD.url, apiKey: CLOUD.apiKey, appId: APP_ID });
const adapter = new CloudAdapter({ ...CLOUD, getToken: auth.getToken });

/** The open chapter's reference, the document its notes are kept under. */
const chapterId = () => `${state.book}.${state.chapter}`;

const strings = {
  en: {
    signIn: "Sign in to write notes (ContextHive)",
    signOut: "Notes: signed in with ContextHive. Sign out",
    blocked: "Allow popups for this site to sign in.",
  },
  zh: {
    signIn: "登录以写笔记（ContextHive）",
    signOut: "笔记：已用 ContextHive 登录。退出登录",
    blocked: "请允许本站弹出窗口以登录。",
  },
};
const say = () => strings[state.lang === "zh" ? "zh" : "en"];

/** The header button: signs in, or out. */
function mountAccount() {
  const btn = document.createElement("button");
  btn.id = "notes-account";
  btn.className = "icon";
  btn.innerHTML =
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="5.5" r="2.8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.8 14c.6-2.7 2.6-4.2 5.2-4.2s4.6 1.5 5.2 4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const render = () => {
    const user = auth.user();
    btn.setAttribute("aria-pressed", String(user !== null));
    btn.title = btn.ariaLabel = user ? say().signOut : say().signIn;
  };
  btn.onclick = () => {
    if (auth.user()) return auth.signOut();
    // From the click itself, or the browser blocks the popup.
    auth.signIn().catch((e) => {
      if (e?.code === "popup_blocked") alert(say().blocked);
      else if (e?.code !== "closed" && e?.code !== "cancelled") console.error(e);
    });
  };
  auth.onChange(render);
  document.addEventListener("chapterrendered", render); // the language follows the translation
  document.getElementById("share-btn").before(btn);
  render();
}

// The notes UI in the reader's look: style.css gives it the theme's colours (on contexthive-root, so
// it follows light, dark and sepia), and this styles its parts. The page's custom properties
// (--panel, --dock, ...) reach inside it.
const NOTES_CSS = `
  [part~="launcher"] {
    background: var(--dock); color: var(--ink); font: 500 14px/1 inherit; padding: 9px 15px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
  }
  [part~="launcher"]:hover { filter: none; color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, var(--dock)); }
  [part~="panel"] { width: min(400px, 100vw); }
  [part~="panel"] h2 { font-size: 16px; }
  .ctx-panel-tabs { gap: 2px; margin: 10px 14px 4px; padding: 2px; width: max-content; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); }
  .ctx-panel-tab { padding: 4px 12px; border: 0; border-radius: 999px; font-weight: 500; }
  .ctx-panel-tab[aria-selected="true"] { background: var(--panel); color: var(--ink); box-shadow: 0 1px 2px rgba(0, 0, 0, .12); }
  .ctx-panel-item:hover { background: var(--accent-soft); }
  .ctx-quote { font-family: "Source Serif 4", "Noto Serif SC", serif; font-size: 14px; border-left-color: color-mix(in srgb, var(--accent) 45%, var(--line)); }
  @media (max-width: 800px) {
    /* Above the dock, which runs along the bottom of the reader on phones */
    [part~="launcher"] { bottom: calc(124px + env(safe-area-inset-bottom)); }
    /* A sheet from the bottom, like the reader's own */
    [part~="panel"] {
      top: auto; width: 100vw; height: min(70vh, 560px); border: 1px solid var(--line); border-bottom: 0;
      border-radius: 16px 16px 0 0;
    }
  }
`;

/** The color scheme the reader shows: the one picked in its settings, or the device's. */
const scheme = () => document.documentElement.dataset.theme ?? "auto";
new MutationObserver(() => document.querySelector("contexthive-root")?.setAttribute("color-scheme", scheme())).observe(
  document.documentElement,
  { attributes: true, attributeFilter: ["data-theme"] },
);

// The SDK runs only while someone is signed in, so a reader who never signs in sends nothing.
let ctx = null;
let starting = null;
async function start() {
  const started = await ContextHive.init(
    {
      adapter,
      scope: `app:${APP_ID}`,
      user: () => auth.user(),
      root: document.getElementById("chapter"),
      // Read live: a hash change is not a navigation to the SDK, so chapterrendered switches.
      documentId: chapterId,
      // A note picked under "All my notes" in the notes panel: go to its chapter, where its card
      // opens once the chapter's notes have loaded.
      ui: { openDocument: (id) => (location.hash = "#" + id), colorScheme: scheme(), css: NOTES_CSS },
    },
    { ui: builtInUi },
  );
  // Signed out, or on another chapter, while it started.
  if (!auth.user()) started.destroy();
  else {
    ctx = started;
    if (ctx.documentId !== chapterId()) await ctx.setDocument(chapterId());
  }
}
function follow() {
  if (auth.user() && !ctx && !starting) {
    starting = start()
      .catch((e) => console.error("ContextHive did not start", e))
      .finally(() => (starting = null));
  } else if (!auth.user() && ctx) {
    ctx.destroy();
    ctx = null;
  }
}
auth.onChange(() => {
  adapter.resetToken();
  follow();
});
// app.js renders a chapter, then says so; the hash also changes for a verse picked in the chapter.
document.addEventListener("chapterrendered", () => {
  if (ctx && ctx.documentId !== chapterId()) ctx.setDocument(chapterId()).catch((e) => console.error(e));
});

// After app.js has shown the first chapter (`rendered` is app.js's key of the chapter on screen).
const go = () => {
  mountAccount();
  follow();
};
if (typeof rendered === "string" && rendered) go();
else document.addEventListener("chapterrendered", go, { once: true });
