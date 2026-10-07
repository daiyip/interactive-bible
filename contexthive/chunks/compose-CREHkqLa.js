import{i as e}from"./dom-dSB8PCI5.js";import{r as t,t as n}from"./shortcuts-y2x4hED6.js";import{t as r}from"./parts-CEciOg9h.js";const i=new WeakMap,a={accent:`--ctx-accent`,accentContrast:`--ctx-accent-contrast`,background:`--ctx-background`,foreground:`--ctx-foreground`,muted:`--ctx-muted`,border:`--ctx-border`,highlight:`--ctx-highlight`,font:`--ctx-font`,fontSize:`--ctx-font-size`,radius:`--ctx-radius`,shadow:`--ctx-shadow`,zIndex:`--ctx-z-index`};function o(e,t){for(let[n,r]of Object.entries(t)){let t=a[n];t!==void 0&&(r===void 0||r===``?e.style.removeProperty(t):e.style.setProperty(t,String(r)))}}const s=`
  --_accent: var(--ctx-accent, #818cf8) !important;
  --_accent-contrast: var(--ctx-accent-contrast, #111827) !important;
  --_background: var(--ctx-background, #1f2125) !important;
  --_foreground: var(--ctx-foreground, #e6edf3) !important;
  --_muted: var(--ctx-muted, #9198a1) !important;
  --_border: var(--ctx-border, #3d444d) !important;
  --_highlight: var(--ctx-highlight, rgb(250 204 21 / 0.28)) !important;
  --_shadow: var(--ctx-shadow, 0 4px 16px rgb(0 0 0 / 0.5), 0 1px 3px rgb(0 0 0 / 0.4)) !important;
`,c=`
  .layer {
    
  --_accent: var(--ctx-accent, #4f46e5) !important;
  --_accent-contrast: var(--ctx-accent-contrast, #ffffff) !important;
  --_background: var(--ctx-background, #ffffff) !important;
  --_foreground: var(--ctx-foreground, #1f2328) !important;
  --_muted: var(--ctx-muted, #656d76) !important;
  --_border: var(--ctx-border, #d0d7de) !important;
  --_highlight: var(--ctx-highlight, rgb(250 204 21 / 0.4)) !important;
  --_shadow: var(
    --ctx-shadow,
    0 4px 16px rgb(0 0 0 / 0.12),
    0 1px 3px rgb(0 0 0 / 0.08)
  ) !important;

    --_font: var(
      --ctx-font,
      system-ui,
      -apple-system,
      "Segoe UI",
      Roboto,
      "Helvetica Neue",
      Arial,
      sans-serif
    ) !important;
    --_font-size: var(--ctx-font-size, 14px) !important;
    --_radius: var(--ctx-radius, 8px) !important;
    --_scheme: light !important;
  }

  @media (prefers-color-scheme: dark) {
    :host(:not([color-scheme="light"])) .layer {
      ${s}
      --_scheme: dark !important;
    }
  }

  :host([color-scheme="dark"]) .layer {
    ${s}
    --_scheme: dark !important;
  }
`,l=`contexthive-root`,u=[[`all`,`initial`],[`display`,`block`],[`position`,`absolute`],[`top`,`0`],[`left`,`0`],[`width`,`0`],[`height`,`0`],[`overflow`,`visible`],[`z-index`,`var(${a.zIndex}, 2147483000)`]],d=[`keydown`,`keyup`,`keypress`,`beforeinput`,`input`],f=new WeakMap;var p=class extends HTMLElement{static shadowRootOptions={mode:`closed`};shortcuts;#e=()=>{};updateComplete=new Promise(e=>{this.#e=()=>e(!0)});#t=[];constructor(e={}){super(),this.shortcuts=n({overrides:e.shortcuts??{}})}get colorScheme(){return this.getAttribute(`color-scheme`)??`auto`}set colorScheme(e){this.setAttribute(`color-scheme`,e)}#n(){let n=this.ownerDocument,i=this.attachShadow(this.constructor.shadowRootOptions);f.set(this,i);for(let e of d)i.addEventListener(e,e=>{t(e.composedPath()[0])&&e.stopPropagation()});let a=n.createElement(`div`);return a.className=`layer`,a.setAttribute(`part`,r.layer),i.append(e(n,c+`
  .layer {
    all: initial;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    overflow: visible;
    color-scheme: var(--_scheme);
    color: var(--_foreground);
    font-family: var(--_font);
    font-size: var(--_font-size);
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
  }
`),a),i}connectedCallback(){for(let[e,t]of u)this.style.setProperty(e,t,`important`);if(Object.hasOwn(this,`colorScheme`)){let e=this.colorScheme;delete this.colorScheme,this.colorScheme=e}this.hasAttribute(`color-scheme`)||(this.colorScheme=`auto`);let e=f.get(this)??this.#n();this.#e(),this.shortcuts.attach(e,this.ownerDocument)}disconnectedCallback(){this.shortcuts.detach()}setTheme(e){o(this,e)}addDisposer(e){this.#t.push(e)}destroy(){let e=this.#t.splice(0).reverse();this.remove(),this.shortcuts.dispose();for(let t of e)t()}};function m(){let e=customElements.get(l);if(e!==p){if(e!==void 0)throw Error(`<${l}> is already defined by another copy of contexthive-ui; load only one per page.`);customElements.define(l,p)}}function h(e={}){m();let t=new p({...e.shortcuts!==void 0&&{shortcuts:e.shortcuts}});return t.colorScheme=e.colorScheme??`auto`,e.theme&&t.setTheme(e.theme),e.zIndex!==void 0&&t.setTheme({zIndex:e.zIndex}),(e.parent??document.documentElement).append(t),t}function g(e){let t=f.get(e);if(t===void 0)throw Error(`<${l}> has not rendered yet`);return t}async function _(e){await e.updateComplete;let t=g(e).querySelector(`.layer`);if(t===null)throw Error(`<${l}> has no layer`);return t}function v(e){let t,n,r=()=>(t??=Promise.resolve().then(e).then(e=>n=e,e=>{throw t=void 0,e}),t);return{load:r,preload(){r().catch(()=>{})},get value(){return n}}}function y(e){let n=e.document??document,r=e.delay??150,i=!1,a,o=null,s=()=>{a=void 0;let t=c();(t===null?o===null:o!==null&&b(t,o))||(o=t===null?null:t.cloneRange(),e.onChange(t===null?null:t.cloneRange()))},c=()=>{let r=n.getSelection();if(!r||r.rangeCount===0||r.isCollapsed)return null;let i=r.getRangeAt(0),a=e.root??n.body,o=i.commonAncestorContainer;if(!a||!a.contains(o))return null;let s=o.nodeType===1?o:o.parentElement;return!s||s.closest(`contexthive-root`)||t(s)||t(n.activeElement??void 0)?null:i},l=e=>{clearTimeout(a),a=setTimeout(s,e)},u=()=>{if(i)return;let e=n.getSelection();l(e&&!e.isCollapsed?r:0)},d=e=>{e.button===0&&(i=!0)},f=()=>{i&&(i=!1,l(0))};return n.addEventListener(`selectionchange`,u),n.addEventListener(`pointerdown`,d,!0),n.addEventListener(`pointerup`,f,!0),n.addEventListener(`pointercancel`,f,!0),()=>{clearTimeout(a),n.removeEventListener(`selectionchange`,u),n.removeEventListener(`pointerdown`,d,!0),n.removeEventListener(`pointerup`,f,!0),n.removeEventListener(`pointercancel`,f,!0)}}function b(e,t){return e.startContainer===t.startContainer&&e.startOffset===t.startOffset&&e.endContainer===t.endContainer&&e.endOffset===t.endOffset}const x=new Set([`commenting`,`replying`]);function S(e){return x.has(e.motivation)}function C(e){let{ctx:t}=e,n=null,r=null,a=!1,o=null,s=!1,c=i.get(t)?.onLoad(()=>{s=!0,o=null}),l=t.on(`document:change`,()=>{s=!1}),u=v(e.load??(()=>import(`./compose-CLB70Jsl.js`))),d=async()=>{try{return await e.currentUser()}catch{return null}},f=()=>(r??=import(`./compose-impl-DouAOApO.js`).then(t=>a?null:(n=t.createComposeUi(e,u,()=>s),n),e=>(r=null,console.error(`ContextHive: loading the selection toolbar failed`,e),null)),r),p=e.selectionToolbar===!1?()=>{}:y({root:e.root,document:e.layer.ownerDocument,onChange:e=>{if(n){n.select(e);return}o=e,e!==null&&(async()=>{if(!await d()||o!==e)return;u.preload();let t=await f(),n=o;o=null,t&&n&&t.select(n)})()}});return{get toolbar(){return n?.toolbar??null},get composer(){return n?.composer??null},async edit(e,t,n,r){return(await f())?.edit(e,t,n,r)??null},async reply(e,t,n){return(await f())?.reply(e,t,n)??null},destroy(){a||(a=!0,p(),c?.(),l(),n?.destroy())}}}export{_ as a,v as i,S as n,h as o,C as r,i as s,x as t};