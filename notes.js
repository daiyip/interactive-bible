// Notes on the text, kept on ContextHive Cloud (https://contexthive.dev): select words in a chapter to
// comment on them or highlight them, and open the notes button for the chapter's notes. Signing in
// goes through the ContextHive hub in a popup; signed out, only the chapter's public notes are read.
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
  en: { signIn: "Sign in to write notes (ContextHive)", signOut: "Notes: signed in with ContextHive. Sign out" },
  zh: { signIn: "登录以写笔记（ContextHive）", signOut: "笔记：已用 ContextHive 登录。退出登录" },
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
    // From the click itself, or the browser blocks the popup.
    if (auth.user()) auth.signOut().catch((e) => console.error(e));
    else auth.signIn().catch((e) => e?.code === "closed" || e?.code === "cancelled" || console.error(e));
  };
  auth.onChange(render);
  document.getElementById("share-btn").before(btn);
  render();
  return render;
}

async function start() {
  const render = mountAccount();
  let documentId = chapterId();
  const ctx = await ContextHive.init(
    {
      adapter,
      scope: `app:${APP_ID}`,
      user: () => auth.user(),
      root: document.getElementById("chapter"),
      documentId: () => documentId,
    },
    { ui: builtInUi },
  );
  // A sign-in or sign-out changes whose notes show: load the chapter again with the new token.
  auth.onChange(() => {
    adapter.resetToken();
    ctx.setDocument(documentId).catch((e) => console.error(e));
  });
  // app.js renders a chapter, then says so; the hash also changes for a verse picked in the chapter.
  document.addEventListener("chapterrendered", () => {
    render();
    if (chapterId() === documentId) return;
    documentId = chapterId();
    ctx.setDocument(documentId).catch((e) => console.error(e));
  });
  window.contexthive = ctx;
}

// After app.js has shown the first chapter (`rendered` is app.js's key of the chapter on screen).
const go = () => start().catch((e) => console.error("ContextHive did not start", e));
if (typeof rendered === "string" && rendered) go();
else document.addEventListener("chapterrendered", go, { once: true });
