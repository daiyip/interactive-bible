import{s as e}from"./body-Cg308vaD.js";import{i as t,n,r,t as i}from"./dom-dSB8PCI5.js";import{t as a}from"./parts-CEciOg9h.js";import{t as o}from"./focus-CrN1AF0B.js";const s={title:`Notes`,close:`Close notes`,onPage:`On this page`,detached:`Detached`,detachedHint:`The text these notes were on is no longer on the page.`,empty:`No notes on this page yet.`,anonymous:`Someone`,deleted:`This note was deleted.`,approximate:`approximate`,pending:`finding text…`,replies:e=>e===1?`1 reply`:`${e} replies`},c=140,l=120;function u(e){return e.target.selector?.find(e=>e.type===`TextQuoteSelector`)?.exact??``}function d(e){return e.slice(0,560).replace(/^ {0,3}(```|~~~).*$/gm,``).replace(/!?\[([^\]\n]{0,500})\]\((?:[^()\n]|\([^()\n]*\)){0,2000}\)/g,`$1`).replace(/^ {0,3}(#{1,6}[ \t]+|>[ \t]?|[-*+][ \t]+(\[[ xX]\][ \t]+)?)/gm,``).replace(/\*\*|__|~~|`/g,``).replace(/(^|[\s(])[*_](?=\S)|(\S)[*_](?=[\s).,;:!?]|$)/gm,`$1$2`)}function f(t){for(let n of t.body??[]){if(n.type===`TextualBody`&&typeof n.value==`string`){if(n.purpose!==void 0&&n.purpose!==`commenting`)continue;return e(n)?d(n.value):n.value}if(n.type===`ContextualBody`&&typeof n.summary==`string`)return n.summary}return``}function p(e){return typeof e?.cloneRange==`function`}function m(e){if(e===void 0)return null;let t=p(e)?e.getClientRects():e.nodeType===Node.ELEMENT_NODE?[e.getBoundingClientRect()]:e.getClientRects(),n=Array.from(t).find(e=>e.width>0||e.height>0);return n===void 0?null:{top:n.top,left:n.left}}function h(e,t){return Math.round(e.top)-Math.round(t.top)||e.left-t.left}function g(e){let t=(e,t)=>e.annotation.created<t.annotation.created?-1:e.annotation.created>t.annotation.created?1:e.id<t.id?-1:+(e.id>t.id),n=[],r=[],i=[];for(let t of new Map([...e].map(e=>[e.id,e])).values()){if(t.state===`orphaned`){i.push(t);continue}let e=t.state===`pending`?null:m(t.target);e===null?r.push(t):n.push([t,e])}return n.sort(([e,n],[r,i])=>h(n,i)||t(e,r)),{onPage:[...n.map(([e])=>e),...r.sort(t)],detached:i.sort(t)}}function _(e){let{layer:c}=e,l=c.ownerDocument,d={...s,...e.labels},p=o(c.getRootNode())??o(l),m=new Map,h=[],_=!1,v=null,y=`ctx-panel-title-${Math.random().toString(36).slice(2)}`,b=i(l,`button`,{type:`button`,class:`ctx-panel-close`,"aria-label":d.close},`×`),x=i(l,`div`,{class:`ctx-panel-body`}),S=i(l,`aside`,{class:`ctx-panel`,part:a.panel,role:`complementary`,"aria-labelledby":y,"data-side":e.side??`right`,tabindex:`-1`},t(l,`
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
`),i(l,`div`,{class:`ctx-panel-header`},i(l,`h2`,{id:y},d.title),b),x),C=new Map,w=new WeakMap;function T(e){let t=e.annotation,n=r(e.quote??u(t),120),a=t.ext.deleted?d.deleted:r(f(t),140),o=[!t.ext.deleted&&t.creator?.name?.trim()||d.anonymous];e.replyCount&&o.push(d.replies(e.replyCount)),e.state===`approximate`&&o.push(d.approximate),e.state===`pending`&&o.push(d.pending);let s=C.get(e.id);s===void 0&&(s=i(l,`li`,{},i(l,`button`,{type:`button`,class:`ctx-panel-item`,"data-id":e.id})),C.set(e.id,s));let c=s.firstElementChild,p=[e.state,n,a,...o].join(`\0`);return w.get(s)===p?s:(w.set(s,p),c.setAttribute(`data-state`,e.state),c.replaceChildren(...[n&&i(l,`q`,{class:`ctx-quote`},n),a&&i(l,`span`,{class:`ctx-excerpt`},a),i(l,`span`,{class:`ctx-panel-meta`},o.join(` · `))].filter(e=>e!==``)),s)}function E(){return[...x.querySelectorAll(`.ctx-panel-item`)]}function D(){let e=S.getRootNode().activeElement;return e instanceof HTMLElement&&x.contains(e)?e.getAttribute(`data-id`):null}function O(e){let t=D(),n=h;m=new Map([...e].map(e=>[e.id,e]));for(let e of[...C.keys()])m.has(e)||C.delete(e);let{onPage:r,detached:a}=g(m.values());h=[...r,...a].map(e=>e.id);let o=[];(r.length>0||a.length===0)&&(o.push(i(l,`h3`,{},d.onPage)),r.length===0?o.push(i(l,`p`,{class:`ctx-panel-empty`},d.empty)):o.push(i(l,`ul`,{class:`ctx-panel-list`},...r.map(T)))),a.length>0&&o.push(i(l,`h3`,{},d.detached),i(l,`p`,{class:`ctx-panel-hint`},d.detachedHint),i(l,`ul`,{class:`ctx-panel-detached`},...a.map(T))),x.replaceChildren(...o),(v===null||!m.has(v))&&(v=h[0]??null);for(let e of E())e.tabIndex=e.getAttribute(`data-id`)===v?0:-1;if(t!==null&&!k(t,{preventScroll:!0})){let e=n.indexOf(t),r=new Set(h),i=n.slice(e+1).find(e=>r.has(e))??[...n.slice(0,Math.max(e,0))].reverse().find(e=>r.has(e));(i===void 0||!k(i,{preventScroll:!0}))&&S.focus({preventScroll:!0})}}function k(e,t){let n=E().find(t=>e===void 0||t.getAttribute(`data-id`)===e);return n?.focus(t),n!==void 0}x.addEventListener(`click`,t=>{let n=t.target.closest?.(`.ctx-panel-item`)?.getAttribute(`data-id`),r=n==null?void 0:m.get(n);r&&e.onSelect?.(r.id,r)}),x.addEventListener(`focusin`,e=>{let t=e.target.closest?.(`.ctx-panel-item`),n=t?.getAttribute(`data-id`);if(t!=null&&n!=null&&n!==v){for(let e of E())e.tabIndex=e===t?0:-1;v=n}}),S.addEventListener(`keydown`,e=>{if(!e.defaultPrevented){if(e.key===`Escape`&&!e.isComposing){e.preventDefault(),A();return}e.target.closest?.(`.ctx-panel-item`)&&n(e,E())}}),b.addEventListener(`click`,()=>A()),O(e.items),c.append(S),e.focus!==!1&&!k()&&S.focus();function A(){if(_)return;_=!0;let t=S.getRootNode(),n=t.activeElement!==null&&S.contains(t.activeElement);S.remove(),e.onClose?.(),n&&p instanceof HTMLElement&&p.isConnected&&p.focus()}return{element:S,get closed(){return _},update(e){_||O(e)},focus:k,ids:()=>[...h],close:A}}export{s as DEFAULT_PANEL_LABELS,c as PANEL_EXCERPT_CHARS,l as PANEL_QUOTE_CHARS,d as markdownExcerpt,_ as openPanel,g as orderPanelItems};