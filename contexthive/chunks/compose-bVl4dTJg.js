import{i as e}from"./media-BkmSXBXx.js";import{n as t}from"./describe-D3Mb4fJk.js";import"./body-Cg308vaD.js";import{n}from"./shortcuts-y2x4hED6.js";import{t as r}from"./parts-CXDuB2ge.js";import{r as i,t as a}from"./focus-CrN1AF0B.js";import{t as o}from"./clock-DXWY9K3R.js";function s(e,t,n,r={}){let i=e.ownerDocument.defaultView??window,a=0,o=!1,s=()=>{if(a=0,!e.isConnected)return;let s=n.getBoundingClientRect();(n instanceof Element&&!n.isConnected||s.width===0&&s.height===0)&&o||(o=!0,c(e,t,s,r,i))},l=()=>{a===0&&(a=i.requestAnimationFrame(s))};s(),i.addEventListener(`scroll`,l,{capture:!0,passive:!0}),i.addEventListener(`resize`,l,{passive:!0});let u=typeof ResizeObserver>`u`?null:new ResizeObserver(l);return u?.observe(e),{update:s,stop(){a!==0&&i.cancelAnimationFrame(a),i.removeEventListener(`scroll`,l,{capture:!0}),i.removeEventListener(`resize`,l),u?.disconnect()}}}function c(e,t,n,r,i){let a=r.gap??8,o=e.offsetWidth,s=e.offsetHeight,c=i.document.documentElement.clientWidth||i.innerWidth,l=i.innerHeight,u=n.top-a-s,d=n.bottom+a,f=u>=8,p=d+s<=l-8,m;m=(r.side??`below`)===`above`?f||!p?u:d:p||!f?d:u;let h=r.center?n.left+n.width/2-o/2:n.left;h=Math.min(h,c-8-o),h=Math.max(h,8);let g=t.getBoundingClientRect();e.style.left=`${Math.round(h-g.left)}px`,e.style.top=`${Math.round(m-g.top)}px`}const l={toolbar:`Add a note`,comment:`Comment`,highlight:`Highlight`,noteOnRegion:`Note on this region`,noteOnMoment:`Note on this moment`,noteOnPage:`Note on this page`},u={"selection.comment":`mod+alt+m`,"selection.highlight":`mod+alt+h`,"selection.toolbar":`alt+f10`},d={comment:`commenting`,note:`commenting`,highlight:`highlighting`};function f(n){let i=n.range.cloneRange(),o=n.layer.ownerDocument,c=n.root??i.startContainer.ownerDocument??o,f=(n.describe??t)(i,c);if(!f)return null;let h=e(f)?.time,g=p(f,c,i);if(!g)return null;let _=h&&`nodeType`in g?{element:g,time:h}:g,v=new Set(n.motivations??[`commenting`,`highlighting`]),y={...l,...n.labels},b=f.level,x=(b===`text`?[[`comment`,y.comment],[`highlight`,y.highlight]]:[[`note`,b===`page`?y.noteOnPage:h?y.noteOnMoment:y.noteOnRegion]]).filter(([e])=>v.has(d[e]));if(x.length===0)return null;let S=o.createElement(`div`);S.className=`ctx-toolbar`,S.setAttribute(`role`,`toolbar`),S.setAttribute(`aria-label`,y.toolbar),S.setAttribute(`part`,r.selectionToolbar),S.dataset.level=b;let C=o.createElement(`style`);C.textContent=`
.ctx-toolbar {
  position: absolute;
  /* Above the panel and the pins, like the card. */
  z-index: 2;
  top: 0;
  left: 0;
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--_background);
  color: var(--_foreground);
  border: 1px solid var(--_border);
  border-radius: var(--_radius);
  box-shadow: var(--_shadow);
  white-space: nowrap;
}
.ctx-toolbar button {
  all: unset;
  padding: 4px 10px;
  border-radius: calc(var(--_radius) - 3px);
  font: inherit;
  cursor: pointer;
}
.ctx-toolbar button:hover { background: color-mix(in srgb, var(--_accent) 12%, transparent); }
.ctx-toolbar button:focus-visible { outline: 2px solid var(--_accent); outline-offset: -2px; }
`,S.append(C);let w=b===`text`?i.toString():``,T=x.map(([e,t],n)=>{let r=o.createElement(`button`);return r.type=`button`,r.textContent=t,r.dataset.action=e,r.tabIndex=n===0?0:-1,r.addEventListener(`pointerdown`,e=>e.preventDefault()),r.addEventListener(`mousedown`,e=>e.preventDefault()),r.addEventListener(`click`,()=>A(e)),S.append(r),r}),E=!1,D=null,O=[],k=()=>{if(!E){E=!0;for(let e of O.splice(0).reverse())e();S.remove(),n.onClose?.()}},A=e=>{if(E)return;let t=j()?D:null;k(),n.onChoose({action:e,level:b,target:_,range:i.cloneRange(),quote:w,...h&&{time:{...h}},...t&&{returnFocusTo:t}})},j=()=>{let e=S.getRootNode().activeElement;return e!==null&&S.contains(e)},M=()=>{if(!E){if(!j()){let e=a(S.getRootNode())??a(o);D=e instanceof HTMLElement&&e!==o.body?e:null}(T.find(e=>e.tabIndex===0)??T[0])?.focus()}};S.addEventListener(`focusin`,e=>{let t=e.relatedTarget;t instanceof HTMLElement&&!S.contains(t)&&t!==o.body&&(D=t)}),S.addEventListener(`keydown`,e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.isComposing)return;let t=T.findIndex(e=>e===e.getRootNode().activeElement),n;switch(e.key){case`Escape`:{e.preventDefault();let t=D;k(),t?.isConnected&&t.focus();return}case`ArrowRight`:case`ArrowDown`:n=(t+1)%T.length;break;case`ArrowLeft`:case`ArrowUp`:n=(t-1+T.length)%T.length;break;case`Home`:n=0;break;case`End`:n=T.length-1;break;default:return}e.preventDefault();for(let[e,t]of T.entries())t.tabIndex=e===n?0:-1;T[n].focus()}),n.layer.append(S);let N=s(S,n.layer,i,{side:`above`,center:!0});O.push(N.stop);let{shortcuts:P}=n;if(P){let e=(e,t)=>O.push(P.register(e,u[e],t)),t=e=>x.some(([t])=>t===e),n=t(`comment`)?`comment`:t(`note`)?`note`:null;n&&e(`selection.comment`,()=>A(n)),t(`highlight`)&&e(`selection.highlight`,()=>A(`highlight`)),e(`selection.toolbar`,M);let r=P.comboFor(`selection.toolbar`);r&&S.setAttribute(`aria-keyshortcuts`,m(r))}return{element:S,level:b,get closed(){return E},focus:M,close:k}}function p(e,t,n){if(e.level===`text`)return n;if(e.level===`page`)return{page:!0};let r=e.selector.find(e=>e.type===`CssSelector`),i=t.nodeType===9?t:t.getRootNode();return(r?i.querySelector(r.value):null)||(e.ext.anchorKey===null?null:{anchorKey:e.ext.anchorKey})}function m(e){let t={mod:n()?`Meta`:`Control`,ctrl:`Control`,control:`Control`,cmd:`Meta`,option:`Alt`};return e.split(`+`).map(e=>t[e]??e.charAt(0).toUpperCase()+e.slice(1)).join(`+`)}const h={dialog:{new:`New note`,reply:`Reply`,edit:`Edit note`},submit:{new:`Comment`,reply:`Reply`,edit:`Save`},cancel:`Cancel`,write:`Write`,preview:`Preview`,textarea:`Note text (Markdown)`,placeholder:`Write a note… Markdown works.`,emptyPreview:`Nothing to preview.`,replyingTo:e=>`Replying to ${e}`,level:{region:`Note on this region`,element:`Note on this region`,page:`Note on this page`},moment:e=>e.end===void 0?`Note on this moment (${o(e.start)})`:`Note on ${o(e.start)} to ${o(e.end)}`,reactions:`React`,react:e=>`React with ${e}`,tooLong:e=>`Notes are limited to ${e.toLocaleString()} characters.`,failed:`Could not save. Try again.`,submitHint:e=>`${C(e)} to save`},g={"composer.submit":`mod+enter`,"composer.cancel":`escape`,"composer.preview":`mod+alt+p`},_=[`👍`,`❤️`,`😄`,`🎉`,`🤔`,`👀`];let v=0;function y(e){let t=e.layer.ownerDocument,a=e.mode??`new`,o={...h,...e.labels},c=e.maxLength??9987,l=`ctx-composer-${++v}`,u=(e,n)=>{let r=t.createElement(e);return n&&(r.className=n),r},d=u(`section`,`ctx-composer`);d.setAttribute(`role`,`dialog`),d.setAttribute(`aria-label`,o.dialog[a]),d.setAttribute(`part`,r.composer),d.dataset.mode=a;let f=u(`style`);if(f.textContent=`
.ctx-composer {
  position: absolute;
  /* Above the panel and the pins, like the card. */
  z-index: 2;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: min(380px, calc(100vw - 16px));
  padding: 10px 12px 12px;
  background: var(--_background);
  color: var(--_foreground);
  border: 1px solid var(--_border);
  border-radius: var(--_radius);
  box-shadow: var(--_shadow);
  font: inherit;
  text-align: start;
}
.ctx-composer:focus { outline: none; }
.ctx-context { margin: 0 0 8px; color: var(--_muted); font-size: 0.86em; }
.ctx-quote {
  margin: 0 0 8px;
  padding: 0 0 0 8px;
  border-left: 3px solid var(--_highlight);
  color: var(--_muted);
  font-size: 0.92em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.ctx-badge {
  display: inline-block;
  margin: 0 0 8px;
  padding: 1px 6px;
  border: 1px solid var(--_border);
  border-radius: 999px;
  color: var(--_muted);
  font-size: 0.8em;
}
.ctx-tabs { display: flex; gap: 4px; margin: 0 0 6px; }
.ctx-tabs button, .ctx-actions button, .ctx-reactions button {
  all: unset;
  padding: 3px 10px;
  border-radius: calc(var(--_radius) - 3px);
  font: inherit;
  cursor: pointer;
}
.ctx-tabs button[aria-selected="true"] { background: color-mix(in srgb, var(--_accent) 14%, transparent); }
.ctx-composer button:focus-visible, .ctx-composer textarea:focus-visible {
  outline: 2px solid var(--_accent);
  outline-offset: 1px;
}
.ctx-composer textarea {
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-height: 96px;
  max-height: 40vh;
  resize: vertical;
  padding: 6px 8px;
  background: var(--_background);
  color: var(--_foreground);
  border: 1px solid var(--_border);
  border-radius: calc(var(--_radius) - 3px);
  font: inherit;
  line-height: 1.45;
}
.ctx-preview {
  min-height: 96px;
  max-height: 40vh;
  overflow: auto;
  padding: 6px 8px;
  border: 1px dashed var(--_border);
  border-radius: calc(var(--_radius) - 3px);
  overflow-wrap: anywhere;
}
.ctx-preview p, .ctx-preview ul, .ctx-preview ol, .ctx-preview pre, .ctx-preview blockquote { margin: 0 0 6px; }
.ctx-preview a { color: var(--_accent); }
.ctx-preview .ctx-align-left { text-align: left; }
.ctx-preview .ctx-align-center { text-align: center; }
.ctx-preview .ctx-align-right { text-align: right; }
.ctx-preview .ctx-empty { color: var(--_muted); }
.ctx-reactions { display: flex; flex-wrap: wrap; gap: 2px; margin: 8px 0 0; }
.ctx-reactions button { padding: 2px 6px; font-size: 1.1em; }
.ctx-reactions button:hover { background: color-mix(in srgb, var(--_accent) 12%, transparent); }
.ctx-option { display: flex; gap: 6px; align-items: baseline; margin: 8px 0 0; font-size: 0.9em; }
.ctx-option input { margin: 0; accent-color: var(--_accent); }
.ctx-option-hint { display: block; color: var(--_muted); font-size: 0.9em; }
.ctx-choices { margin: 8px 0 0; padding: 0; border: 0; min-width: 0; }
.ctx-choices legend { padding: 0; color: var(--_muted); font-size: 0.86em; }
.ctx-choices .ctx-option { margin: 4px 0 0; }
.ctx-error { margin: 8px 0 0; color: #c62828; font-size: 0.86em; }
.ctx-error:empty { display: none; }
.ctx-footer { display: flex; align-items: center; gap: 8px; margin: 10px 0 0; }
.ctx-hint { flex: 1; color: var(--_muted); font-size: 0.8em; }
.ctx-actions { display: flex; gap: 6px; }
.ctx-actions .ctx-submit { background: var(--_accent); color: var(--_accent-contrast); }
.ctx-actions button[aria-disabled="true"] { opacity: 0.5; cursor: default; }
`,d.append(f),a===`reply`&&e.replyingTo!==void 0){let t=u(`p`,`ctx-context`);t.textContent=o.replyingTo(e.replyingTo),d.append(t)}let p=a===`new`?e.time?o.moment(e.time):e.level&&o.level[e.level]:void 0;if(p){let e=u(`span`,`ctx-badge`);e.textContent=p,d.append(e)}if(a===`new`&&e.quote?.trim()){let t=u(`blockquote`,`ctx-quote`);t.textContent=e.quote.replace(/\s+/g,` `).trim(),d.append(t)}let m=u(`div`,`ctx-tabs`);m.setAttribute(`role`,`tablist`);let y=u(`button`),C=u(`button`),w=u(`textarea`),T=u(`div`,`ctx-write`);T.append(w);let E=u(`div`,`ctx-preview`);for(let[e,t,n,r]of[[y,T,o.write,`write`],[C,E,o.preview,`preview`]])e.type=`button`,e.textContent=n,e.id=`${l}-${r}-tab`,e.setAttribute(`role`,`tab`),e.setAttribute(`aria-controls`,`${l}-${r}`),t.id=`${l}-${r}`,m.append(e);if(E.setAttribute(`role`,`tabpanel`),E.setAttribute(`aria-labelledby`,C.id),E.tabIndex=0,T.setAttribute(`role`,`tabpanel`),T.setAttribute(`aria-labelledby`,y.id),w.setAttribute(`aria-label`,o.textarea),w.placeholder=o.placeholder,w.value=e.initial??``,d.append(m,T,E),e.onReact){let t=u(`div`,`ctx-reactions`);t.setAttribute(`role`,`group`),t.setAttribute(`aria-label`,o.reactions);for(let n of e.reactions??_){let e=u(`button`);e.type=`button`,e.textContent=n,e.setAttribute(`aria-label`,o.react(n)),e.addEventListener(`click`,()=>void ee(n)),t.append(e)}d.append(t)}let D;if(e.option){let t=u(`label`,`ctx-option`);D=u(`input`),D.type=`checkbox`,D.checked=e.option.checked===!0,D.disabled=e.option.locked===!0;let n=u(`span`);if(n.textContent=e.option.label,e.option.hint){let t=u(`span`,`ctx-option-hint`);t.textContent=e.option.hint,n.append(t)}t.append(D,n),d.append(t)}let O=()=>A()?.submitLabel??(D?.checked&&e.option?.submitLabel||o.submit[a]),k=[];if(e.choice){let t=e.choice,n=`ctx-choice-${v}`,r=t.choices.some(e=>e.value===t.value)?t.value:t.choices[0]?.value,i=u(`fieldset`,`ctx-choices`),a=u(`legend`);a.textContent=t.label,i.append(a),k=t.choices.map(e=>{let t=u(`label`,`ctx-option`),a=u(`input`);a.type=`radio`,a.name=n,a.value=e.value,a.checked=e.value===r;let o=u(`span`);if(o.textContent=e.label,e.hint){let t=u(`span`,`ctx-option-hint`);t.textContent=e.hint,o.append(t)}return t.append(a,o),i.append(t),a}),d.append(i)}let A=()=>{let t=k.find(e=>e.checked)?.value;return e.choice?.choices.find(e=>e.value===t)},j=u(`p`,`ctx-error`);j.setAttribute(`role`,`alert`);let M=u(`div`,`ctx-footer`),N=u(`span`,`ctx-hint`),P=u(`div`,`ctx-actions`),F=u(`button`);F.type=`button`,F.textContent=o.cancel,F.addEventListener(`click`,()=>Y());let I=u(`button`,`ctx-submit`);I.type=`button`,I.textContent=O(),I.addEventListener(`click`,()=>void Z());for(let e of[...D?[D]:[],...k])e.addEventListener(`change`,()=>{I.textContent=O()});P.append(F,I),M.append(N,P),d.append(j,M);let L=!1,R=!1,z=!1,B=0,V=[],H=()=>w.value,U=()=>b(H())>c?o.tooLong(c):null,W=()=>{let e=R||H().trim()===``||U()!==null;I.setAttribute(`aria-disabled`,String(e)),F.setAttribute(`aria-disabled`,String(R));let t=U()??``;!R&&j.textContent!==t&&(j.textContent=t)};w.addEventListener(`input`,W);let G=e=>{z=e,y.setAttribute(`aria-selected`,String(!e)),C.setAttribute(`aria-selected`,String(e)),y.tabIndex=e?-1:0,C.tabIndex=e?0:-1,T.hidden=e,E.hidden=!e,e&&K()},K=async()=>{let n=++B,r=H();if(r.trim()===``){let e=u(`p`,`ctx-empty`);e.textContent=o.emptyPreview,E.replaceChildren(e);return}try{let i=await(e.renderPreview??(e=>x(e,t)))(r);n===B&&!L&&E.replaceChildren(i)}catch(e){console.error(`ContextHive: the preview failed`,e),n===B&&!L&&(E.textContent=r)}};y.addEventListener(`click`,()=>{G(!1),w.focus()}),C.addEventListener(`click`,()=>G(!0)),m.addEventListener(`keydown`,e=>{(e.key===`ArrowLeft`||e.key===`ArrowRight`)&&(e.preventDefault(),G(!z),(z?C:y).focus())});let q=()=>{G(!z),z?E.focus():w.focus()},J=()=>{if(!L){L=!0,B++;for(let e of V.splice(0).reverse())e();d.remove(),e.onClose?.()}},Y=()=>{L||R||(J(),e.onCancel?.())},X=async t=>{R=!0,W(),d.setAttribute(`aria-busy`,`true`);try{await t()}catch(t){if(R=!1,d.removeAttribute(`aria-busy`),W(),L)return console.error(`ContextHive: saving the note failed`,t),!1;let n=t instanceof Error&&e.showErrors?.includes(t.name);return j.textContent=n?t.message:o.failed,n||console.error(`ContextHive: saving the note failed`,t),!1}return R=!1,J(),!0},Z=async()=>{if(L||R)return!1;let t=H();if(t.trim()===``||U()!==null)return W(),z||w.focus(),!1;let n={mode:a,markdown:t};D&&(n.option=D.checked);let r=A();return r&&(n.choice=r.value),X(()=>e.onSubmit(n))},ee=t=>{if(L||R||!e.onReact)return Promise.resolve(!1);let n=e.onReact;return X(()=>n(t))};e.layer.append(d);let te=s(d,e.layer,e.anchor,{side:`below`});V.push(te.stop),G(!1),W(),w.setSelectionRange(w.value.length,w.value.length);let ne=i(d,{initialFocus:w,...e.returnFocusTo&&{returnFocusTo:e.returnFocusTo}});V.push(ne);let Q={"composer.submit":()=>void Z(),"composer.cancel":Y,"composer.preview":q},{shortcuts:$}=e;if($){for(let[e,n]of Object.entries(Q))V.push($.register(e,g[e],n,{allowInEditable:!0,when:()=>S(d,t)}));let e=$.comboFor(`composer.submit`);N.textContent=e?o.submitHint(e):``}else d.addEventListener(`keydown`,e=>{if(e.isComposing||e.defaultPrevented)return;let t=n()?e.metaKey:e.ctrlKey,r=e.key.toLowerCase(),i=null;r===`escape`&&!t&&!e.shiftKey&&!e.altKey?i=`composer.cancel`:r===`enter`&&t&&!e.shiftKey&&!e.altKey?i=`composer.submit`:(r===`p`||e.code===`KeyP`)&&t&&e.altKey&&!e.shiftKey&&(i=`composer.preview`),i&&(e.preventDefault(),Q[i]())}),N.textContent=o.submitHint(g[`composer.submit`]);return{element:d,get closed(){return L},get value(){return H()},get busy(){return R},submit:Z,close:J}}function b(e){return Array.from(e).length}async function x(e,t){let{markdownFragment:n}=await import(`./render-DUr569fR.js`),r=t.createElement(`div`);return r.append(n(e,t)),r}function S(e,t){let n=e.getRootNode(),r=n===t?t.activeElement:n.activeElement;return r!==null&&e.contains(r)}function C(e){let t=n();return e.split(`+`).map(e=>{switch(e){case`mod`:return t?`⌘`:`Ctrl`;case`meta`:case`cmd`:return`⌘`;case`alt`:case`option`:return t?`⌥`:`Alt`;case`shift`:return t?`⇧`:`Shift`;case`ctrl`:case`control`:return`Ctrl`;case`enter`:return t?`↩`:`Enter`;default:return e.length===1?e.toUpperCase():e[0].toUpperCase()+e.slice(1)}}).join(t?``:`+`)}export{g as COMPOSER_SHORTCUTS,h as DEFAULT_COMPOSER_LABELS,_ as DEFAULT_REACTIONS,l as DEFAULT_TOOLBAR_LABELS,u as TOOLBAR_SHORTCUTS,y as openComposer,f as openSelectionToolbar};