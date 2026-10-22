/* Panel "Interacciones" (v27): un solo botón arriba que abre un panel con las sorpresas de la tarjeta.
   Cada opción explica qué hace. Lo usan la tarjeta real (r/tarjeta.html) y el celular de vista previa
   (personalizar.html). Los botones originales (Secreto, Música, Compartir, Guardar) siguen existiendo:
   el panel solo los activa, así que su lógica no cambia. Íconos: Lucide (licencia ISC). */
const ACC=(function(){
'use strict';
const IC={
 sparkles:'<path d="M12 3l1.8 4.6 4.7 1.8-4.7 1.8L12 16l-1.8-4.8-4.7-1.8 4.7-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 wind:'<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
 phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/><path d="M3 8v8M21 8v8"/>',
 pointer:'<path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
 download:'<path d="M12 3v12M7 11l5 5 5-5M4 20h16"/>',
 vol:'<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M19 5a10 10 0 010 14"/>',
 mute:'<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/>',
 eyeoff:'<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/>'};
const svg=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||'')+'</svg>';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

/* create({host, phone, items:()=>[{id,ic,t,d,hidden,on,pulse,run}], mountBtn}) */
function create(o){
 const host=o.host||document.body,ph=!!o.phone,cls=ph?' in-phone':'';
 const btn=document.createElement('button');btn.type='button';btn.className='acc-btn'+cls+(ph?' show':'');
 btn.setAttribute('aria-haspopup','dialog');btn.setAttribute('aria-expanded','false');
 btn.innerHTML=svg('sparkles')+'<span class="l">Interacciones</span><span class="s">Acciones</span>';
 const back=document.createElement('div');back.className='acc-back'+cls;
 const pan=document.createElement('div');pan.className='acc-panel'+cls;pan.setAttribute('role','dialog');pan.setAttribute('aria-label','Interacciones de la tarjeta');
 pan.innerHTML='<div class="acc-h"><b>Haz que la tarjeta cobre vida</b><button type="button" class="acc-x" aria-label="Cerrar">✕</button></div><div class="acc-grid"></div>';
 if(o.mountBtn)o.mountBtn(btn);else host.append(btn);
 host.append(back,pan);
 const grid=pan.querySelector('.acc-grid');
 const paint=()=>{const L=(o.items?o.items():[]).filter(i=>!i.hidden);
  grid.innerHTML=L.map(i=>'<button type="button" class="acc-t'+(i.on?' on':'')+(i.pulse?' pulse':'')+'" data-id="'+i.id+'"><span class="acc-i">'+svg(i.ic)+'</span><span class="acc-tx"><b>'+esc(i.t)+'</b><small>'+esc(i.d)+'</small></span></button>').join('');
  grid.querySelectorAll('.acc-t').forEach((b,k)=>b.onclick=()=>{const it=L[k];close();setTimeout(()=>{try{it.run&&it.run()}catch(e){}},140)})};
 const isOpen=()=>pan.classList.contains('open');
 function open(){document.querySelectorAll('.dt-hint').forEach(h=>h.remove());paint();pan.classList.add('open');back.classList.add('open');btn.setAttribute('aria-expanded','true');btn.classList.remove('pulse');const f=grid.querySelector('.acc-t');f&&f.focus&&f.focus({preventScroll:true})}
 function close(){pan.classList.remove('open');back.classList.remove('open');btn.setAttribute('aria-expanded','false')}
 btn.onclick=()=>isOpen()?close():open();back.onclick=close;pan.querySelector('.acc-x').onclick=close;
 if(!ph)addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()){close();e.stopImmediatePropagation()}},true);
 return{btn,panel:pan,open,close,isOpen,refresh(){if(isOpen())paint()},
  setVisible(v){btn.classList.toggle('show',!!v);if(!v)close()},
  pulse(){btn.classList.remove('pulse');void btn.offsetWidth;btn.classList.add('pulse')}}}

/* Botón Sonido / Mudo con ícono propio (SVG): o = {get:()=>bool, set:(bool)=>void, phone:bool} */
function soundPill(o){
 const b=document.createElement('button');b.type='button';b.className='pill pill-snd'+(o.phone?' in-phone':'');b.id=o.phone?'pvSnd':'btnSound';
 const paint=()=>{const on=!!o.get();b.classList.toggle('off',!on);b.setAttribute('aria-pressed',String(!on));
  b.setAttribute('aria-label',on?'Silenciar':'Activar sonido');b.title=on?'Silenciar':'Activar sonido';
  b.innerHTML=svg(on?'vol':'mute')+'<span class="snd-t">'+(on?'Sonido':'Mudo')+'</span>'};
 b.onclick=()=>{o.set(!o.get());paint()};paint();return{btn:b,paint}}

/* ----- Tarjeta real (r/tarjeta.html): se activa sola si encuentra la barra y el dock ----- */
function initCard(){
 const $=id=>document.getElementById(id),dock=$('dock'),top=document.querySelector('.topbar');
 if(!dock||!top||typeof estado==='undefined')return null;
 const fx=window.__fx||{shake(){},blow(){},state:()=>({})},click=id=>()=>{const b=$(id);b&&b.click()};
 const items=()=>{const s=fx.state();return[
  {id:'sec',ic:'lock',t:'Secreto',d:'Adivina la clave y descubre un mensaje oculto',hidden:!$('bSec')||$('bSec').hidden,pulse:!!($('bSec')&&$('bSec').classList.contains('demo-pulse')),run:click('bSec')},
  {id:'blow',ic:'wind',t:'Soplar',d:'Sopla al micrófono y apaga la velita',on:!!s.blow,run:()=>fx.blow()},
  {id:'shake',ic:'phone',t:'Agitar',d:'Sacude el celular y llueven emojis',on:!!s.shake,run:()=>fx.shake()},
  {id:'tap',ic:'pointer',t:'Doble toque',d:'Toca 2 veces la tarjeta y brotan deseos',run:()=>{try{DT.used=true;DT.burst(DT.layerFor(),DT.phrases(T,{nombre,pal}),innerWidth/2,innerHeight*.55)}catch(e){}}},
  {id:'mus',ic:'music',t:'Música',d:'Pon o pausa la canción de la tarjeta',hidden:!$('mus')||$('mus').hidden,run:click('mus')},
  {id:'sh',ic:'share',t:'Compartir',d:'Envíala por WhatsApp o copia el link',run:click('sv')},
  {id:'img',ic:'download',t:'Guardar imagen',d:'Descárgala para subirla a tus historias',run:click('img')},
  {id:'ofi',ic:'eyeoff',t:'Modo discreto',d:'¿Se acerca alguien? La tarjeta se disfraza de hoja de Excel. Toca «Hoja2» para volver',hidden:!fx.office,run:()=>fx.office&&fx.office()}]};
 /* Sonido / Mudo: se recuerda la elección; también silencia la canción */
 const saved=(()=>{try{return localStorage.getItem('frass_snd')}catch(e){return null}})();
 if(saved==='0'){soundEnabled=false;window.__mus&&(window.__mus.muted=true)}
 const snd=soundPill({get:()=>soundEnabled,set:v=>{soundEnabled=v;window.__mus&&(window.__mus.muted=!v);try{localStorage.setItem('frass_snd',v?'1':'0')}catch(e){}
  try{typeof toast==='function'&&toast(v?'Sonido activado':'Mudo')}catch(e){}}});
 const ofi=$('btnOfi');top.insertBefore(snd.btn,ofi||null);
 const acc=create({items,mountBtn:b=>top.prepend(b)});
 acc.btn.style.marginRight='auto';
 /* aparece y se esconde junto con el dock original (se abre/cierra el sobre) */
 let was=false;const sync=()=>{const on=dock.classList.contains('show');acc.setVisible(on);if(on&&!was)setTimeout(()=>acc.pulse(),600);was=on};
 new MutationObserver(sync).observe(dock,{attributes:true,attributeFilter:['class']});sync();
 document.addEventListener('fxstate',()=>acc.refresh());
 return acc}

return{create,initCard,svg,soundPill};
})();
window.ACC=ACC;
try{if(document.getElementById('dock')&&document.querySelector('.topbar'))ACC.initCard()}catch(e){}
