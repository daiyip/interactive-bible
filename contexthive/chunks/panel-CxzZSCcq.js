import{s as e}from"./body-Cg308vaD.js";import{a as t,i as n,n as r,r as i,t as a}from"./dom-BM5Au_xS.js";import{t as o}from"./parts-CXDuB2ge.js";import{t as s}from"./focus-CrN1AF0B.js";const c={title:`Notes`,close:`Close notes`,onPage:`On this page`,detached:`Detached`,detachedHint:`The text these notes were on is no longer on the page.`,empty:`No notes on this page yet.`,anonymous:`Someone`,me:`Me`,deleted:`This note was deleted.`,approximate:`approximate`,pending:`finding text…`,replies:e=>e===1?`1 reply`:`${e} replies`,thisPage:`This page`,allMine:`All my notes`,mineEmpty:`You have no notes yet.`,mineLoading:`Loading your notes…`,mineFailed:`Your notes could not be loaded.`,retry:`Try again`,more:`Show more`},l=140,u=2e3,d=120;function f(e){return e.target.selector?.find(e=>e.type===`TextQuoteSelector`)?.exact??``}function p(e,t=560){return e.slice(0,t).replace(/^ {0,3}(```|~~~).*$/gm,``).replace(/!?\[([^\]\n]{0,500})\]\((?:[^()\n]|\([^()\n]*\)){0,2000}\)/g,`$1`).replace(/^ {0,3}(#{1,6}[ \t]+|>[ \t]?|[-*+][ \t]+(\[[ xX]\][ \t]+)?)/gm,``).replace(/\*\*|__|~~|`/g,``).replace(/(^|[\s(])[*_](?=\S)|(\S)[*_](?=[\s).,;:!?]|$)/gm,`$1$2`)}function m(t,n=!1){for(let r of t.body??[]){if(r.type===`TextualBody`&&typeof r.value==`string`){if(r.purpose!==void 0&&r.purpose!==`commenting`)continue;return e(r)?p(r.value,n?u*4:560):r.value}if(r.type===`ContextualBody`&&typeof r.summary==`string`)return r.summary}return``}function h(e){return typeof e?.cloneRange==`function`}function g(e){if(e===void 0)return null;let t=h(e)?e.getClientRects():e.nodeType===Node.ELEMENT_NODE?[e.getBoundingClientRect()]:e.getClientRects(),n=Array.from(t).find(e=>e.width>0||e.height>0);return n===void 0?null:{top:n.top,left:n.left}}function _(e,t){return Math.round(e.top)-Math.round(t.top)||e.left-t.left}function v(e){let t=(e,t)=>e.annotation.created<t.annotation.created?-1:e.annotation.created>t.annotation.created?1:e.id<t.id?-1:+(e.id>t.id),n=[],r=[],i=[];for(let t of new Map([...e].map(e=>[e.id,e])).values()){if(t.state===`orphaned`){i.push(t);continue}let e=t.state===`pending`?null:g(t.target);e===null?r.push(t):n.push([t,e])}return n.sort(([e,n],[r,i])=>_(n,i)||t(e,r)),{onPage:[...n.map(([e])=>e),...r.sort(t)],detached:i.sort(t)}}function y(e){let{layer:l}=e,d=l.ownerDocument,p={...c,...e.labels},h=s(l.getRootNode())??s(d),g=new Map,_=[],y=!1,b=null,x=`ctx-panel-title-${Math.random().toString(36).slice(2)}`,S=r(d,`button`,{type:`button`,class:`ctx-panel-close`,"aria-label":p.close},`×`),C=r(d,`div`,{class:`ctx-panel-body`}),{mine:w}=e,T=`page`,E=(e,t)=>r(d,`button`,{type:`button`,role:`tab`,class:`ctx-panel-tab`,"data-view":e},t),D=w?r(d,`div`,{class:`ctx-panel-tabs`,role:`tablist`},E(`page`,p.thisPage),E(`mine`,p.allMine)):null,O=r(d,`aside`,{class:`ctx-panel`,part:o.panel,role:`complementary`,"aria-labelledby":x,"data-side":e.side??`right`,tabindex:`-1`},t(d,`
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
.ctx-panel-item[aria-expanded="true"] { background: color-mix(in srgb, var(--_accent) 8%, transparent); }
.ctx-panel-actions { display: flex; flex-wrap: wrap; gap: 6px; padding: 2px 6px 8px; }
.ctx-panel-action { all: unset; padding: 3px 10px; border: 1px solid var(--_border); border-radius: var(--_radius); color: var(--_foreground); font-size: 0.86em; cursor: pointer; }
.ctx-panel-action:hover { border-color: var(--_accent); }
.ctx-panel-action:focus-visible { outline: 2px solid var(--_accent); }
.ctx-panel-more { all: unset; display: block; margin: 8px 14px; color: var(--_accent); font-size: 0.86em; font-weight: 600; cursor: pointer; }
.ctx-panel-more:focus-visible { outline: 2px solid var(--_accent); }
`),r(d,`div`,{class:`ctx-panel-header`},r(d,`h2`,{id:x},p.title),S),D,C),k=null,A=new Map,j=new WeakMap;function M(t){let i=t.annotation,a=e.actions!==void 0&&t.id===k,o=n(t.quote??f(i),120),s=i.ext.deleted?p.deleted:n(m(i,a),a?u:140),c=[i.ext.deleted?p.anonymous:e.viewerId!==void 0&&i.creator?.id===e.viewerId?p.me:i.creator?.name?.trim()||p.anonymous];t.replyCount&&c.push(p.replies(t.replyCount)),t.state===`approximate`&&c.push(p.approximate),t.state===`pending`&&c.push(p.pending);let l=A.get(t.id);l===void 0&&(l=r(d,`li`,{},r(d,`button`,{type:`button`,class:`ctx-panel-item`,"data-id":t.id})),A.set(t.id,l));let h=l.firstElementChild,g=a?e.actions(t):[],_=[t.state,i.ext.rev,o,s,...c,...g.map(e=>e.label)].join(`\0`);if(j.get(l)===_)return l;if(j.set(l,_),h.setAttribute(`data-state`,t.state),e.actions&&h.setAttribute(`aria-expanded`,String(a)),l.replaceChildren(h),g.length>0){let e=r(d,`div`,{class:`ctx-panel-actions`});for(let t of g){let n=r(d,`button`,{type:`button`,class:`ctx-panel-action`},t.label);n.addEventListener(`click`,e=>{e.stopPropagation(),t.run(l)}),e.append(n)}l.append(e)}return h.replaceChildren(...[o&&r(d,`q`,{class:`ctx-quote`},o),s&&r(d,`span`,{class:`ctx-excerpt`},s),r(d,`span`,{class:`ctx-panel-meta`},c.join(` · `))].filter(e=>e!==``)),l}function N(){return[...C.querySelectorAll(`.ctx-panel-item`)]}function P(){let e=O.getRootNode().activeElement;return e instanceof HTMLElement&&C.contains(e)?e.getAttribute(`data-id`):null}function F(e){let t=P(),n=_;g=new Map([...e].map(e=>[e.id,e]));for(let e of[...A.keys()])g.has(e)||A.delete(e);k!==null&&!g.has(k)&&(k=null);let{onPage:i,detached:a}=v(g.values());if(_=[...i,...a].map(e=>e.id),T===`mine`)return;let o=[];(i.length>0||a.length===0)&&(o.push(r(d,`h3`,{},p.onPage)),i.length===0?o.push(r(d,`p`,{class:`ctx-panel-empty`},p.empty)):o.push(r(d,`ul`,{class:`ctx-panel-list`},...i.map(M)))),a.length>0&&o.push(r(d,`h3`,{},p.detached),r(d,`p`,{class:`ctx-panel-hint`},p.detachedHint),r(d,`ul`,{class:`ctx-panel-detached`},...a.map(M))),C.replaceChildren(...o),(b===null||!g.has(b))&&(b=_[0]??null);for(let e of N())e.tabIndex=e.getAttribute(`data-id`)===b?0:-1;if(t!==null&&!U(t,{preventScroll:!0})){let e=n.indexOf(t),r=new Set(_),i=n.slice(e+1).find(e=>r.has(e))??[...n.slice(0,Math.max(e,0))].reverse().find(e=>r.has(e));(i===void 0||!U(i,{preventScroll:!0}))&&O.focus({preventScroll:!0})}}let I=[],L=null,R=`idle`;function z(e){let t=e.annotation,i=n(f(t),120),a=n(m(t),140),o=new Date(t.created),s=[e.page,isNaN(o.getTime())?``:o.toLocaleDateString()];return r(d,`li`,{},r(d,`button`,{type:`button`,class:`ctx-panel-item`,"data-id":e.id,"aria-disabled":e.openable?void 0:`true`},i&&r(d,`q`,{class:`ctx-quote`},i),a&&r(d,`span`,{class:`ctx-excerpt`},a),r(d,`span`,{class:`ctx-panel-meta`},s.filter(Boolean).join(` · `))))}function B(){let e=[];I.length>0?e.push(r(d,`ul`,{class:`ctx-panel-mine`},...I.map(z))):R===`done`&&e.push(r(d,`p`,{class:`ctx-panel-empty`},p.mineEmpty)),R===`loading`?e.push(r(d,`p`,{class:`ctx-panel-empty`,role:`status`},p.mineLoading)):R===`failed`?e.push(r(d,`p`,{class:`ctx-panel-empty`,role:`alert`},p.mineFailed),r(d,`button`,{type:`button`,class:`ctx-panel-more`},p.retry)):R===`idle`&&I.length>0&&e.push(r(d,`button`,{type:`button`,class:`ctx-panel-more`},p.more)),C.replaceChildren(...e),N().forEach((e,t)=>e.tabIndex=t===0?0:-1)}async function V(){if(!w||R===`loading`||R===`done`)return;let e=C.contains(a(C));R=`loading`,T===`mine`&&B();try{let t=await w.load(L??void 0);if(y)return;let n=new Set(I.map(e=>e.id)),r=t.items.filter(e=>!n.has(e.id));if(I=[...I,...r],R=t.cursor&&t.cursor!==L?`idle`:`done`,L=t.cursor,T!==`mine`)return;B(),e&&!U(r[0]?.id)&&!U()&&O.focus({preventScroll:!0})}catch{if(y||(R=`failed`,T!==`mine`))return;B(),e&&C.querySelector(`.ctx-panel-more`)?.focus()}}function H(e){if(T!==e){T=e;for(let e of D?.children??[]){let t=e.getAttribute(`data-view`)===T;e.setAttribute(`aria-selected`,String(t)),e.tabIndex=t?0:-1}T===`page`?F(g.values()):R===`idle`&&I.length===0?V():B()}}function U(e,t){let n=N().find(t=>e===void 0||t.getAttribute(`data-id`)===e);return n?.focus(t),n!==void 0}if(C.addEventListener(`click`,t=>{let n=t.target;if(n.closest?.(`.ctx-panel-more`)){V();return}let r=n.closest?.(`.ctx-panel-item`)?.getAttribute(`data-id`);if(T===`mine`){let e=I.find(e=>e.id===r);e?.openable&&w?.onSelect(e);return}let i=r==null?void 0:g.get(r);i&&(e.actions&&(k=k===i.id?null:i.id,F(g.values()),k===null)||e.onSelect?.(i.id,i))}),C.addEventListener(`focusin`,e=>{let t=e.target.closest?.(`.ctx-panel-item`),n=t?.getAttribute(`data-id`);if(t!=null&&n!=null){if(T===`mine`){for(let e of N())e.tabIndex=e===t?0:-1;return}if(n!==b){for(let e of N())e.tabIndex=e===t?0:-1;b=n}}}),O.addEventListener(`keydown`,e=>{if(!e.defaultPrevented){if(e.key===`Escape`&&!e.isComposing){e.preventDefault(),W();return}e.target.closest?.(`.ctx-panel-item`)&&i(e,N())}}),D){let e=[...D.children];D.addEventListener(`click`,e=>{let t=e.target.closest?.(`[data-view]`)?.getAttribute(`data-view`);(t===`page`||t===`mine`)&&H(t)}),D.addEventListener(`keydown`,t=>{if(i(t,e)){let e=a(D)?.getAttribute(`data-view`);(e===`page`||e===`mine`)&&H(e)}}),e.forEach((e,t)=>{e.setAttribute(`aria-selected`,String(t===0)),e.tabIndex=t===0?0:-1})}S.addEventListener(`click`,()=>W()),F(e.items),l.append(O),e.focus!==!1&&!U()&&O.focus();function W(){if(y)return;y=!0;let t=O.getRootNode(),n=t.activeElement!==null&&O.contains(t.activeElement);O.remove(),e.onClose?.(),n&&h instanceof HTMLElement&&h.isConnected&&h.focus()}return{element:O,get closed(){return y},update(e){y||F(e)},focus:U,ids:()=>[..._],close:W}}export{c as DEFAULT_PANEL_LABELS,u as OPEN_EXCERPT_CHARS,l as PANEL_EXCERPT_CHARS,d as PANEL_QUOTE_CHARS,p as markdownExcerpt,y as openPanel,v as orderPanelItems};