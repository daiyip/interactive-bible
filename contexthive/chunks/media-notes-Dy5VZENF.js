import{i as e}from"./media-BkmSXBXx.js";import{i as t,n,t as r}from"./dom-dSB8PCI5.js";import{t as i}from"./parts-CEciOg9h.js";import{t as a}from"./clock-DXWY9K3R.js";function o({time:e}){return e.end===void 0?`Note at ${a(e.start)}`:`Note from ${a(e.start)} to ${a(e.end)}`}function s(e){let{layer:a}=e,s=a.ownerDocument,c=s.defaultView,l=e.label??o,u=r(s,`div`,{class:`ctx-media`,part:i.pins});u.append(t(s,`
.ctx-media-strip {
  position: absolute;
  height: 12px;
  box-sizing: border-box;
  border-radius: 3px;
  background: color-mix(in srgb, var(--_accent) 12%, transparent);
}
.ctx-media-strip[hidden] { display: none; }
.ctx-media-marker {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  height: 100%;
  min-width: 8px;
  border-radius: 3px;
  background: var(--_accent);
  cursor: pointer;
}
.ctx-media-marker[hidden] { display: none; }
.ctx-media-marker[data-approximate] {
  background: var(--_background);
  border: 2px dashed var(--_accent);
}
.ctx-media-marker:hover { filter: brightness(1.12); }
.ctx-media-marker:focus-visible { outline: 2px solid var(--_accent); outline-offset: 2px; }
`)),a.append(u);let d=new Map,f=new Map,p=0,m=!1,h=typeof ResizeObserver==`function`?new ResizeObserver(()=>_()):null,g=()=>_();c?.addEventListener(`scroll`,g,{capture:!0,passive:!0}),c?.addEventListener(`resize`,g,{passive:!0});function _(){!m&&p===0&&c&&(p=c.requestAnimationFrame(()=>{p=0,b()}))}function v(e){let t=d.get(e);if(t)return t;let i=r(s,`div`,{class:`ctx-media-strip`,role:`group`});i.setAttribute(`aria-label`,`Notes on this media`),i.addEventListener(`keydown`,e=>{t&&n(e,y(t))}),u.append(i);let a=[`loadedmetadata`,`durationchange`];for(let t of a)e.addEventListener(t,g);return h?.observe(e),t={element:e,box:i,markers:new Map,times:new Map,off:()=>{for(let t of a)e.removeEventListener(t,g);h?.unobserve(e)}},d.set(e,t),t}function y(e){return[...e.markers.entries()].sort(([t],[n])=>e.times.get(t).start-e.times.get(n).start).map(([,e])=>e).filter(e=>!e.hidden)}function b(){let e=a.getBoundingClientRect();for(let t of d.values()){let n=t.element.getBoundingClientRect(),r=t.element.duration,i=t.element.isConnected&&n.width>0&&n.height>0&&Number.isFinite(r)&&r>0;if(t.box.hidden=!i,i){t.box.style.left=`${n.left-e.left}px`,t.box.style.top=`${n.bottom-e.top+2}px`,t.box.style.width=`${n.width}px`;for(let[e,n]of t.markers){let i=t.times.get(e);n.hidden=i.start>r;let a=Math.min(i.start,r)/r,o=Math.min(i.end??i.start,r)/r;n.style.left=`calc(${(a*100).toFixed(3)}% - ${i.end===void 0?4:0}px)`,n.style.width=`${((o-a)*100).toFixed(3)}%`}}}}function x(e){let t=f.get(e);t&&(f.delete(e),t.markers.get(e)?.remove(),t.markers.delete(e),t.times.delete(e),t.markers.size===0&&(t.off(),t.box.remove(),d.delete(t.element)))}return{set(t){if(m)throw Error(`These media strips have been destroyed`);f.get(t.id)?.element!==t.element&&x(t.id);let n=v(t.element),i=n.markers.get(t.id);if(!i){i=r(s,`button`,{type:`button`,class:`ctx-media-marker`}),i.dataset.id=t.id;let a=i;i.addEventListener(`click`,()=>{let r=n.element,i=n.times.get(t.id);if(i)try{r.currentTime=i.start}catch{}e.onActivate?.(t.id,a)}),n.markers.set(t.id,i),n.box.append(i),f.set(t.id,n)}n.times.set(t.id,{...t.time}),i.setAttribute(`aria-label`,l(t)),i.title=l(t),i.toggleAttribute(`data-approximate`,t.approximate===!0),_()},remove(e){x(e),_()},has:e=>f.has(e),markerOf:e=>f.get(e)?.markers.get(e),refresh:b,destroy(){if(!m){m=!0,p!==0&&c?.cancelAnimationFrame(p),c?.removeEventListener(`scroll`,g,{capture:!0}),c?.removeEventListener(`resize`,g);for(let e of d.values())e.off();h?.disconnect(),d.clear(),f.clear(),u.remove()}}}}function c(t,n){let r=s({layer:t,onActivate:n});return{set(t,n,i,a){let o=e(i.target)?.time;o?r.set({id:t,element:n,time:o,approximate:a}):r.remove(t)},remove:e=>r.remove(e),destroy:()=>r.destroy()}}export{c as createMediaNotes};