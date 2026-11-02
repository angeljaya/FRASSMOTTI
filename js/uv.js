/* Tinta invisible con linterna UV (v36): el mensaje de la tarjeta solo se lee donde pasa la luz.
   Dos formas de activarla: (1) el creador pone ?uv=1 en el link y arranca sola; (2) quien recibe la tarjeta la
   activa desde el panel "Interacciones" (window.__uv.start / stop / active). Sin ninguna de las dos, no hace nada.
   Si falla o se borra, la tarjeta sigue igual. Se carga DESPUÉS del script de la tarjeta. */
(function(){
'use strict';
const QS=new URLSearchParams(window.__CARD?window.__CARD.qs:location.search);

/* ====== Ajustes que puedes tocar ====== */
const R=78;          // radio de la luz en píxeles de pantalla
const NEED=.55;      // fracción del mensaje iluminada para que se revele solo
const GX=10,GY=5;    // cuadrícula con la que se mide lo iluminado

const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const buzz=p=>{try{navigator.vibrate&&!reduce&&navigator.vibrate(p)}catch(e){}};
const note=()=>{try{document.dispatchEvent(new CustomEvent('fxstate'))}catch(e){}};   /* avisa al panel para que repinte */
const MASK='radial-gradient(circle var(--ur) at var(--ux) var(--uy),#000 35%,transparent 100%)';
const soporta=()=>!!(window.CSS&&CSS.supports&&(CSS.supports('mask-image','radial-gradient(#000,transparent)')||CSS.supports('-webkit-mask-image','radial-gradient(#000,transparent)')));
let S=null,estilo=false;   /* S = efecto activo (o null) */

function addStyle(){
 if(estilo)return;estilo=true;
 const st=document.createElement('style');
 st.textContent='.uv-ink{--ux:-999px;--uy:-999px;--ur:'+R+'px;touch-action:none;min-height:4.5em;-webkit-mask-image:'+MASK+';mask-image:'+MASK+';text-shadow:0 0 10px rgba(150,100,255,.85),0 0 22px rgba(124,77,255,.55)}'+
  '.uv-light{position:fixed;left:0;top:0;width:'+R*2+'px;height:'+R*2+'px;pointer-events:none;z-index:60;border-radius:50%;background:radial-gradient(circle,rgba(170,120,255,.5) 0,rgba(140,90,255,.22) 45%,rgba(140,90,255,0) 72%);opacity:0;transition:opacity .35s;will-change:transform}'+
  '.uv-chip{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:61;display:none;align-items:center;gap:12px;max-width:calc(100% - 24px);padding:8px 14px;border-radius:999px;background:rgba(24,16,48,.84);color:#fff;font:600 13px Outfit,Arial,sans-serif;backdrop-filter:blur(6px)}'+
  '.uv-chip button{border:0;background:none;color:#cdb8ff;font:inherit;text-decoration:underline;cursor:pointer;min-height:32px;padding:0 4px}';
 document.head.append(st)}

function start(){
 if(S)return true;
 const msg=document.getElementById('fraseTxt'),content=document.querySelector('.carta-content');
 if(!msg||!content||!soporta())return false;
 addStyle();
 msg.classList.add('uv-ink');

 const light=document.createElement('div');light.className='uv-light';light.setAttribute('aria-hidden','true');
 const chip=document.createElement('div');chip.className='uv-chip';chip.setAttribute('data-nodt','');
 const chipTxt=document.createElement('span');chipTxt.textContent='🔦 Pasa la luz UV por la tarjeta';
 const chipBtn=document.createElement('button');chipBtn.type='button';chipBtn.textContent='Mostrar sin linterna';
 chip.append(chipTxt,chipBtn);document.body.append(light,chip);

 let done=false,moved=false,down=false,hideT=0,iv=0;
 const lit=new Set();

 function hide(){light.style.opacity='0';msg.style.setProperty('--ux','-999px');msg.style.setProperty('--uy','-999px')}
 function move(e){
  const r=msg.getBoundingClientRect();if(!r.width)return;
  const s=r.width/(msg.offsetWidth||r.width)||1,px=e.clientX-r.left,py=e.clientY-r.top;
  msg.style.setProperty('--ux',(px/s).toFixed(1)+'px');msg.style.setProperty('--uy',(py/s).toFixed(1)+'px');msg.style.setProperty('--ur',(R/s).toFixed(1)+'px');
  light.style.transform='translate('+(e.clientX-R)+'px,'+(e.clientY-R)+'px)';light.style.opacity='1';
  if(!moved){moved=true;chipTxt.style.display='none'}
  const cw=r.width/GX,ch=r.height/GY;
  for(let i=0;i<GX;i++)for(let j=0;j<GY;j++)if(Math.hypot((i+.5)*cw-px,(j+.5)*ch-py)<=R*.9)lit.add(i*GY+j);
  if(lit.size/(GX*GY)>=NEED)reveal()}

 const skip=t=>t&&t.closest&&t.closest('button,a,input,textarea,select,[data-nodt]');
 const onDown=e=>{
  if(done||(e.pointerType==='mouse'&&e.button!==0)||!content.contains(e.target)||skip(e.target))return;
  down=true;clearTimeout(hideT);move(e)};
 const onMove=e=>{
  if(done)return;
  if(e.pointerType==='mouse'){if(!content.contains(e.target)||skip(e.target)){hide();return}}else if(!down)return;
  clearTimeout(hideT);move(e)};
 const onUp=e=>{down=false;if(done||e.pointerType==='mouse')return;clearTimeout(hideT);hideT=setTimeout(hide,700)};
 /* Mientras se ilumina con el dedo, la tarjeta no se inclina (el parallax de carta.js escucha en window) */
 const onTouch=e=>{if(down)e.stopPropagation()};
 document.addEventListener('pointerdown',onDown);
 document.addEventListener('pointermove',onMove,{passive:true});
 document.addEventListener('pointerup',onUp);document.addEventListener('pointercancel',onUp);
 content.addEventListener('touchmove',onTouch,{passive:true});
 function quitaListeners(){
  document.removeEventListener('pointerdown',onDown);document.removeEventListener('pointermove',onMove);
  document.removeEventListener('pointerup',onUp);document.removeEventListener('pointercancel',onUp);
  content.removeEventListener('touchmove',onTouch)}
 const limpia=()=>{msg.classList.remove('uv-ink');['--ux','--uy','--ur','min-height'].forEach(k=>msg.style.removeProperty(k))};

 function reveal(){
  if(done)return;done=true;clearInterval(iv);clearTimeout(hideT);quitaListeners();chip.remove();light.style.opacity='0';setTimeout(()=>light.remove(),400);
  const fin=()=>{limpia();if(S&&S.msg===msg){S=null;note()}};
  if(reduce)fin();
  else{msg.style.setProperty('--ux',msg.offsetWidth/2+'px');msg.style.setProperty('--uy',msg.offsetHeight/2+'px');
   const maxR=Math.hypot(msg.offsetWidth,msg.offsetHeight)*.75+30;let rr=parseFloat(msg.style.getPropertyValue('--ur'))||R;
   (function g(){rr+=rr*.16+6;msg.style.setProperty('--ur',rr+'px');rr<maxR?requestAnimationFrame(g):fin()})()}
  try{boom()}catch(e){}try{playChimeSound()}catch(e){}buzz([30,40,60]);
  try{document.dispatchEvent(new CustomEvent('uvrevelado'))}catch(e){}}
 chipBtn.addEventListener('click',reveal);

 /* La ayuda aparece cuando la tarjeta ya está abierta */
 iv=setInterval(()=>{let open=true;try{open=typeof estado==='undefined'||estado==='abierto'}catch(e){}
  if(open&&!done)chip.style.display='flex'},400);

 S={msg,isDone:()=>done,stop(){done=true;clearInterval(iv);clearTimeout(hideT);quitaListeners();chip.remove();light.remove();limpia()}};
 note();return true}

function stop(){if(!S)return;const s=S;S=null;s.stop();note()}

window.__uv={start,stop,active:()=>!!S&&!S.isDone()};
if(QS.get('uv')==='1')start();   /* el creador lo dejó activado en el link */
})();
