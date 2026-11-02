/* Raspar para descubrir (v36): una capa plateada sobre la foto de la tarjeta que se borra con el dedo.
   Dos formas de activarlo: (1) el creador pone ?ras=1 en el link y arranca sola; (2) quien recibe la tarjeta la
   activa desde el panel "Interacciones" (window.__ras.start / stop / active). Sin ninguna de las dos, no hace nada.
   Si falla o se borra, la tarjeta sigue igual. Se carga DESPUÉS del script de la tarjeta. */
(function(){
'use strict';
const QS=new URLSearchParams(window.__CARD?window.__CARD.qs:location.search);

/* ====== Ajustes que puedes tocar ====== */
const BRUSH=22;     // grosor del dedo en píxeles (radio aprox. = BRUSH/2)
const NEED=.5;      // fracción raspada para descubrir todo solo (0.5 = la mitad)

const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const buzz=p=>{try{navigator.vibrate&&!reduce&&navigator.vibrate(p)}catch(e){}};
const note=()=>{try{document.dispatchEvent(new CustomEvent('fxstate'))}catch(e){}};   /* avisa al panel para que repinte */
let S=null;   /* capa activa (o null) */

function start(){
 if(S)return true;
 const frame=document.querySelector('.photo-frame');
 if(!frame||!window.HTMLCanvasElement)return false;
 if(getComputedStyle(frame).position==='static')frame.style.position='relative';

 const cv=document.createElement('canvas');
 cv.setAttribute('aria-hidden','true');cv.setAttribute('data-nodt','');
 cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:6;border-radius:inherit;touch-action:none;cursor:grab;display:block';
 const ctx=cv.getContext('2d');
 const btn=document.createElement('button');
 btn.type='button';btn.textContent='Mostrar sin raspar';btn.setAttribute('data-nodt','');
 btn.style.cssText='position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:7;border:0;border-radius:999px;padding:8px 16px;min-height:36px;background:rgba(20,22,28,.55);color:#fff;font:600 13px Outfit,Arial,sans-serif;cursor:pointer;backdrop-filter:blur(4px)';
 frame.append(cv,btn);

 let touched=false,done=false,last=null,moves=0,ro=null,fadeT=0;
 const k=()=>cv.width/(cv.clientWidth||1);

 function cover(W,H,s){
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#d9dce1');g.addColorStop(.35,'#a9afb7');g.addColorStop(.55,'#e8eaee');g.addColorStop(1,'#9097a0');
  ctx.globalCompositeOperation='source-over';ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let i=0,n=Math.round(W*H/900);i<n;i++){ctx.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'70,75,85')+','+(Math.random()*.25).toFixed(2)+')';ctx.fillRect(Math.random()*W,Math.random()*H,1.5*s,1.5*s)}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(55,60,70,.72)';
  ctx.font='700 '+Math.round(W/9)+'px Outfit,Arial,sans-serif';ctx.fillText('RASPA AQUÍ',W/2,H/2-W/16);
  ctx.font='600 '+Math.round(W/16)+'px Outfit,Arial,sans-serif';ctx.fillText('con el dedo ✨',W/2,H/2+W/14)}

 function fit(){
  const w=frame.clientWidth,h=frame.clientHeight;if(!w||!h||done)return;
  const r=Math.min(window.devicePixelRatio||1,2),W=Math.round(w*r),H=Math.round(h*r);
  if(cv.width===W&&cv.height===H)return;
  let old=null;
  if(touched){old=document.createElement('canvas');old.width=cv.width;old.height=cv.height;old.getContext('2d').drawImage(cv,0,0)}
  cv.width=W;cv.height=H;
  if(old)ctx.drawImage(old,0,0,W,H);else cover(W,H,W/w)}
 fit();
 try{ro=new ResizeObserver(fit);ro.observe(frame)}catch(e){addEventListener('resize',fit)}

 /* ---- Raspar ---- */
 const pos=e=>[e.offsetX*k(),e.offsetY*k()];
 function line(a,b){
  ctx.globalCompositeOperation='destination-out';ctx.lineCap=ctx.lineJoin='round';ctx.lineWidth=BRUSH*k();
  ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
 const probe=document.createElement('canvas');probe.width=probe.height=24;
 const pc=probe.getContext('2d',{willReadFrequently:true});
 function check(){
  if(done)return;pc.clearRect(0,0,24,24);pc.drawImage(cv,0,0,24,24);
  const d=pc.getImageData(0,0,24,24).data;let a=0;for(let i=3;i<d.length;i+=4)a+=d[i];
  if(1-a/(255*576)>=NEED)reveal()}
 function teardown(){
  try{ro&&ro.disconnect()}catch(e){}removeEventListener('resize',fit);clearTimeout(fadeT);cv.remove();btn.remove()}
 function reveal(){
  if(done)return;done=true;cv.style.pointerEvents='none';btn.remove();
  cv.style.transition=reduce?'none':'opacity .7s';cv.style.opacity='0';
  fadeT=setTimeout(()=>{teardown();if(S&&S.cv===cv){S=null;note()}},reduce?0:750);
  try{boom()}catch(e){}try{playChimeSound()}catch(e){}buzz([30,40,60]);
  try{document.dispatchEvent(new CustomEvent('raspado'))}catch(e){}}

 cv.addEventListener('pointerdown',e=>{if(done)return;try{cv.setPointerCapture(e.pointerId)}catch(x){}
  touched=true;cv.style.cursor='grabbing';last=pos(e);line(last,[last[0]+.01,last[1]]);e.preventDefault()});
 cv.addEventListener('pointermove',e=>{if(!last||done)return;const p=pos(e);line(last,p);last=p;if(++moves%10===0)check()});
 const up=()=>{if(!last)return;last=null;cv.style.cursor='grab';check()};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 /* Mientras se raspa, la tarjeta no se inclina (el parallax de carta.js escucha estos eventos en window) */
 const quieto=e=>{if(last)e.stopPropagation()};
 cv.addEventListener('touchmove',quieto,{passive:true});cv.addEventListener('mousemove',quieto);
 btn.addEventListener('click',reveal);

 S={cv,isDone:()=>done,stop(){done=true;teardown()}};
 note();return true}

function stop(){if(!S)return;const s=S;S=null;s.stop();note()}

window.__ras={start,stop,active:()=>!!S&&!S.isDone()};
if(QS.get('ras')==='1')start();   /* el creador lo dejó activado en el link */
})();
