import{s as e}from"./body-Cg308vaD.js";import{a as t,i as n,n as r,r as i,t as a}from"./dom-BM5Au_xS.js";import{t as o}from"./parts-CEciOg9h.js";import{t as s}from"./focus-CrN1AF0B.js";const c={title:`Notes`,close:`Close notes`,onPage:`On this page`,detached:`Detached`,detachedHint:`The text these notes were on is no longer on the page.`,empty:`No notes on this page yet.`,anonymous:`Someone`,deleted:`This note was deleted.`,approximate:`approximate`,pending:`finding text…`,replies:e=>e===1?`1 reply`:`${e} replies`,thisPage:`This page`,allMine:`All my notes`,mineEmpty:`You have no notes yet.`,mineLoading:`Loading your notes…`,mineFailed:`Your notes could not be loaded.`,retry:`Try again`,more:`Show more`},l=140,u=120;function d(e){return e.target.selector?.find(e=>e.type===`TextQuoteSelector`)?.exact??``}function f(e){return e.slice(0,560).replace(/^ {0,3}(```|~~~).*$/gm,``).replace(/!?\[([^\]\n]{0,500})\]\((?:[^()\n]|\([^()\n]*\)){0,2000}\)/g,`$1`).replace(/^ {0,3}(#{1,6}[ \t]+|>[ \t]?|[-*+][ \t]+(\[[ xX]\][ \t]+)?)/gm,``).replace(/\*\*|__|~~|`/g,``).replace(/(^|[\s(])[*_](?=\S)|(\S)[*_](?=[\s).,;:!?]|$)/gm,`$1$2`)}function p(t){for(let n of t.body??[]){if(n.type===`TextualBody`&&typeof n.value==`string`){if(n.purpose!==void 0&&n.purpose!==`commenting`)continue;return e(n)?f(n.value):n.value}if(n.type===`ContextualBody`&&typeof n.summary==`string`)return n.summary}return``}function m(e){return typeof e?.cloneRange==`function`}function h(e){if(e===void 0)return null;let t=m(e)?e.getClientRects():e.nodeType===Node.ELEMENT_NODE?[e.getBoundingClientRect()]:e.getClientRects(),n=Array.from(t).find(e=>e.width>0||e.height>0);return n===void 0?null:{top:n.top,left:n.left}}function g(e,t){return Math.round(e.top)-Math.round(t.top)||e.left-t.left}function _(e){let t=(e,t)=>e.annotation.created<t.annotation.created?-1:e.annotation.created>t.annotation.created?1:e.id<t.id?-1:+(e.id>t.id),n=[],r=[],i=[];for(let t of new Map([...e].map(e=>[e.id,e])).values()){if(t.state===`orphaned`){i.push(t);continue}let e=t.state===`pending`?null:h(t.target);e===null?r.push(t):n.push([t,e])}return n.sort(([e,n],[r,i])=>g(n,i)||t(e,r)),{onPage:[...n.map(([e])=>e),...r.sort(t)],detached:i.sort(t)}}function v(e){let{layer:l}=e,u=l.ownerDocument,f={...c,...e.labels},m=s(l.getRootNode())??s(u),h=new Map,g=[],v=!1,y=null,b=`ctx-panel-title-${Math.random().toString(36).slice(2)}`,x=r(u,`button`,{type:`button`,class:`ctx-panel-close`,"aria-label":f.close},`×`),S=r(u,`div`,{class:`ctx-panel-body`}),{mine:C}=e,w=`page`,T=(e,t)=>r(u,`button`,{type:`button`,role:`tab`,class:`ctx-panel-tab`,"data-view":e},t),E=C?r(u,`div`,{class:`ctx-panel-tabs`,role:`tablist`},T(`page`,f.thisPage),T(`mine`,f.allMine)):null,D=r(u,`aside`,{class:`ctx-panel`,part:o.panel,role:`complementary`,"aria-labelledby":b,"data-side":e.side??`right`,tabindex:`-1`},t(u,`
.ctx-panel {
  position: fixed;
  z-index: 1;
  top: 0;
  bottom: 0;
  right: 0;
  box-sizing: border-box;
  width: min(340px, 100vw);
  display: flex;
  flex-direction: column;
  background: var(--_background);
  color: var(--_foreground);
  border-left: 1px solid var(--_border);
  box-shadow: var(--_shadow);
  font: inherit;
  text-align: start;
}
.ctx-panel[data-side="left"] { right: auto; left: 0; border-left: 0; border-right: 1px solid var(--_border); }
.ctx-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-bottom: 1px solid var(--_border); }
.ctx-panel h2 { margin: 0; font-size: 1.07em; font-weight: 600; }
.ctx-panel h3 { margin: 14px 14px 6px; color: var(--_muted); font-size: 0.79em; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.ctx-panel-body { flex: 1; overflow: auto; padding-bottom: 12px; }
.ctx-panel-close {
  all: unset;
  padding: 2px 6px;
  border-radius: var(--_radius);
  color: var(--_muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
.ctx-panel-close:hover { color: var(--_foreground); }
.ctx-panel-close:focus-visible { outline: 2px solid var(--_accent); }
.ctx-panel ul { list-style: none; margin: 0; padding: 0 8px; }
.ctx-panel-hint, .ctx-panel-empty { margin: 0 14px 6px; color: var(--_muted); font-size: 0.86em; }
.ctx-panel-item {
  all: unset;
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 8px 6px;
  border-radius: var(--_radius);
  cursor: pointer;
}
.ctx-panel-item:hover { background: color-mix(in srgb, var(--_accent) 8%, transparent); }
.ctx-panel-item:focus-visible { outline: 2px solid var(--_accent); outline-offset: -2px; }
.ctx-quote { display: block; padding-left: 8px; border-left: 3px solid var(--_highlight); color: var(--_muted); font-size: 0.86em; }
.ctx-excerpt { display: block; margin-top: 4px; }
.ctx-panel-meta { display: block; margin-top: 4px; color: var(--_muted); font-size: 0.79em; }
.ctx-panel-tabs { display: flex; gap: 4px; padding: 8px 14px 0; border-bottom: 1px solid var(--_border); }
.ctx-panel-tab { all: unset; padding: 6px 8px; border-bottom: 2px solid transparent; color: var(--_muted); font-size: 0.86em; font-weight: 600; cursor: pointer; }
.ctx-panel-tab[aria-selected="true"] { color: var(--_foreground); border-bottom-color: var(--_accent); }
.ctx-panel-tab:focus-visible { outline: 2px solid var(--_accent); outline-offset: -2px; }
.ctx-panel-item[aria-disabled="true"] { cursor: default; }
.ctx-panel-more { all: unset; display: block; margin: 8px 14px; color: var(--_accent); font-size: 0.86em; font-weight: 600; cursor: pointer; }
.ctx-panel-more:focus-visible { outline: 2px solid var(--_accent); }
`),r(u,`div`,{class:`ctx-panel-header`},r(u,`h2`,{id:b},f.title),x),E,S),O=new Map,k=new WeakMap;function A(e){let t=e.annotation,i=n(e.quote??d(t),120),a=t.ext.deleted?f.deleted:n(p(t),140),o=[!t.ext.deleted&&t.creator?.name?.trim()||f.anonymous];e.replyCount&&o.push(f.replies(e.replyCount)),e.state===`approximate`&&o.push(f.approximate),e.state===`pending`&&o.push(f.pending);let s=O.get(e.id);s===void 0&&(s=r(u,`li`,{},r(u,`button`,{type:`button`,class:`ctx-panel-item`,"data-id":e.id})),O.set(e.id,s));let c=s.firstElementChild,l=[e.state,i,a,...o].join(`\0`);return k.get(s)===l?s:(k.set(s,l),c.setAttribute(`data-state`,e.state),c.replaceChildren(...[i&&r(u,`q`,{class:`ctx-quote`},i),a&&r(u,`span`,{class:`ctx-excerpt`},a),r(u,`span`,{class:`ctx-panel-meta`},o.join(` · `))].filter(e=>e!==``)),s)}function j(){return[...S.querySelectorAll(`.ctx-panel-item`)]}function M(){let e=D.getRootNode().activeElement;return e instanceof HTMLElement&&S.contains(e)?e.getAttribute(`data-id`):null}function N(e){let t=M(),n=g;h=new Map([...e].map(e=>[e.id,e]));for(let e of[...O.keys()])h.has(e)||O.delete(e);let{onPage:i,detached:a}=_(h.values());if(g=[...i,...a].map(e=>e.id),w===`mine`)return;let o=[];(i.length>0||a.length===0)&&(o.push(r(u,`h3`,{},f.onPage)),i.length===0?o.push(r(u,`p`,{class:`ctx-panel-empty`},f.empty)):o.push(r(u,`ul`,{class:`ctx-panel-list`},...i.map(A)))),a.length>0&&o.push(r(u,`h3`,{},f.detached),r(u,`p`,{class:`ctx-panel-hint`},f.detachedHint),r(u,`ul`,{class:`ctx-panel-detached`},...a.map(A))),S.replaceChildren(...o),(y===null||!h.has(y))&&(y=g[0]??null);for(let e of j())e.tabIndex=e.getAttribute(`data-id`)===y?0:-1;if(t!==null&&!V(t,{preventScroll:!0})){let e=n.indexOf(t),r=new Set(g),i=n.slice(e+1).find(e=>r.has(e))??[...n.slice(0,Math.max(e,0))].reverse().find(e=>r.has(e));(i===void 0||!V(i,{preventScroll:!0}))&&D.focus({preventScroll:!0})}}let P=[],F=null,I=`idle`;function L(e){let t=e.annotation,i=n(d(t),120),a=n(p(t),140),o=new Date(t.created),s=[e.page,isNaN(o.getTime())?``:o.toLocaleDateString()];return r(u,`li`,{},r(u,`button`,{type:`button`,class:`ctx-panel-item`,"data-id":e.id,"aria-disabled":e.openable?void 0:`true`},i&&r(u,`q`,{class:`ctx-quote`},i),a&&r(u,`span`,{class:`ctx-excerpt`},a),r(u,`span`,{class:`ctx-panel-meta`},s.filter(Boolean).join(` · `))))}function R(){let e=[];P.length>0?e.push(r(u,`ul`,{class:`ctx-panel-mine`},...P.map(L))):I===`done`&&e.push(r(u,`p`,{class:`ctx-panel-empty`},f.mineEmpty)),I===`loading`?e.push(r(u,`p`,{class:`ctx-panel-empty`,role:`status`},f.mineLoading)):I===`failed`?e.push(r(u,`p`,{class:`ctx-panel-empty`,role:`alert`},f.mineFailed),r(u,`button`,{type:`button`,class:`ctx-panel-more`},f.retry)):I===`idle`&&P.length>0&&e.push(r(u,`button`,{type:`button`,class:`ctx-panel-more`},f.more)),S.replaceChildren(...e),j().forEach((e,t)=>e.tabIndex=t===0?0:-1)}async function z(){if(!C||I===`loading`||I===`done`)return;let e=S.contains(a(S));I=`loading`,w===`mine`&&R();try{let t=await C.load(F??void 0);if(v)return;let n=new Set(P.map(e=>e.id)),r=t.items.filter(e=>!n.has(e.id));if(P=[...P,...r],I=t.cursor&&t.cursor!==F?`idle`:`done`,F=t.cursor,w!==`mine`)return;R(),e&&!V(r[0]?.id)&&!V()&&D.focus({preventScroll:!0})}catch{if(v||(I=`failed`,w!==`mine`))return;R(),e&&S.querySelector(`.ctx-panel-more`)?.focus()}}function B(e){if(w!==e){w=e;for(let e of E?.children??[]){let t=e.getAttribute(`data-view`)===w;e.setAttribute(`aria-selected`,String(t)),e.tabIndex=t?0:-1}w===`page`?N(h.values()):I===`idle`&&P.length===0?z():R()}}function V(e,t){let n=j().find(t=>e===void 0||t.getAttribute(`data-id`)===e);return n?.focus(t),n!==void 0}if(S.addEventListener(`click`,t=>{let n=t.target;if(n.closest?.(`.ctx-panel-more`)){z();return}let r=n.closest?.(`.ctx-panel-item`)?.getAttribute(`data-id`);if(w===`mine`){let e=P.find(e=>e.id===r);e?.openable&&C?.onSelect(e);return}let i=r==null?void 0:h.get(r);i&&e.onSelect?.(i.id,i)}),S.addEventListener(`focusin`,e=>{let t=e.target.closest?.(`.ctx-panel-item`),n=t?.getAttribute(`data-id`);if(t!=null&&n!=null){if(w===`mine`){for(let e of j())e.tabIndex=e===t?0:-1;return}if(n!==y){for(let e of j())e.tabIndex=e===t?0:-1;y=n}}}),D.addEventListener(`keydown`,e=>{if(!e.defaultPrevented){if(e.key===`Escape`&&!e.isComposing){e.preventDefault(),H();return}e.target.closest?.(`.ctx-panel-item`)&&i(e,j())}}),E){let e=[...E.children];E.addEventListener(`click`,e=>{let t=e.target.closest?.(`[data-view]`)?.getAttribute(`data-view`);(t===`page`||t===`mine`)&&B(t)}),E.addEventListener(`keydown`,t=>{if(i(t,e)){let e=a(E)?.getAttribute(`data-view`);(e===`page`||e===`mine`)&&B(e)}}),e.forEach((e,t)=>{e.setAttribute(`aria-selected`,String(t===0)),e.tabIndex=t===0?0:-1})}x.addEventListener(`click`,()=>H()),N(e.items),l.append(D),e.focus!==!1&&!V()&&D.focus();function H(){if(v)return;v=!0;let t=D.getRootNode(),n=t.activeElement!==null&&D.contains(t.activeElement);D.remove(),e.onClose?.(),n&&m instanceof HTMLElement&&m.isConnected&&m.focus()}return{element:D,get closed(){return v},update(e){v||N(e)},focus:V,ids:()=>[...g],close:H}}export{c as DEFAULT_PANEL_LABELS,l as PANEL_EXCERPT_CHARS,u as PANEL_QUOTE_CHARS,f as markdownExcerpt,v as openPanel,_ as orderPanelItems};