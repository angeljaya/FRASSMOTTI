/* Doble toque (v26): al tocar DOS veces la tarjeta brotan palabras de felicitación que suben y se desvanecen.
   Lo usan la tarjeta real (r/tarjeta.html) y la vista previa del celular en personalizar.html.
   Si este archivo falla o se borra, todo lo demás sigue funcionando (el resto del código lo llama con "window.DT&&"). */
const DT=(function(){
'use strict';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ====== Palabras por ocasión (edítalas a tu gusto) ======
   {n} = nombre de quien recibe. Si una plantilla de config.js trae su propia lista en "dt", se usa esa. */
const WORDS={
 'cumple-divertido':['¡Feliz cumple, {n}! 🎉','¡Que cumplas muchos más! 🎂','¡A soplar las velitas! 🕯️','¡Hoy mandas tú! 👑','¡Pide un deseo! ✨','¡Que viva {n}! 🥳','¡Pastel para todos! 🍰','¡A celebrar! 🎈'],
 amor:['Te quiero, {n} 💖','Eres mi razón de sonreír 😊','Contigo todo es mejor ✨','Mi corazón es tuyo 💘','Gracias por existir 🌹','Eres mi lugar favorito 🏡','Pienso en ti siempre 💭','Contigo, siempre 💕'],
 gracias:['¡Gracias, {n}! 🙏','Valoro todo lo que haces 🌻','Eres una bendición ✨','Tu apoyo vale oro 💛','Gracias de corazón 💐','Qué suerte tenerte 🍀'],
 aniversario:['¡Feliz aniversario! 💍','Por muchos años más 🥂','Cada día contigo es especial 💫','Gracias por tanto amor ❤️','Juntos para siempre ♾️','Te elegiría otra vez 💞'],
 mama:['Gracias por todo, mamá 🌷','Te quiero, mamá 💜','Eres mi heroína 🦸‍♀️','Tu amor lo es todo 💐','Feliz día, mami 🌸','Tu abrazo lo cura todo 🤗'],
 papa:['Gracias por todo, papá ⭐','Te quiero, papá 💙','Eres mi héroe 🦸','Mi ejemplo a seguir 🏆','Feliz día, papi 💪','Tu abrazo lo cura todo 🤗'],
 'mujer-boliviana':['¡Feliz día, mujer boliviana! 🌸','Fuerza y valentía 💪','Orgullo de nuestra tierra 🇧🇴','Gracias por tanto, {n} 💜','Eres admirable ✨','Tu fuerza inspira 🌺'],
 halloween:['¡Feliz Halloween! 🎃','¡Dulce o truco! 🍬','¡Qué susto, {n}! 👻','Noche de brujas 🦇','¡Buuu! 👻','Cuidado con los fantasmas 🕸️'],
 difuntos:['Siempre en el corazón 🕯️','Te recordamos con amor 🧡','Descansa en paz 🌼','Tu recuerdo vive en nosotros ✨','Gracias por tanto amor 🌼','Hasta siempre 🕊️'],
 navidad:['¡Feliz Navidad, {n}! 🎄','Paz y alegría ❄️','Que se cumplan tus deseos ⭐','Juntos es mejor 🎁','Con mucho cariño 💝','¡Felices fiestas! ✨'],
 _:['¡Para ti, {n}! 💌','Con mucho cariño ✨','Eres especial 💛','Hoy es tu día 🎉','¡Felicidades! 🥳','Te mando un abrazo 🤗']
};

/* Lista final de frases para una plantilla T. o = {nombre, pal} */
function phrases(T,o){o=o||{};const n=String(o.nombre||'').trim();
 let L=(T&&Array.isArray(T.dt)&&T.dt.length&&T.dt)||(T&&WORDS[T.id])||null;
 if(!L)L=WORDS._.concat(o.pal?['✨ '+o.pal+' ✨']:[]);
 return L.map(s=>(n?s.replace(/\{n\}/g,n):s.replace(/,?\s*\{n\}/g,'').replace(/\s{2,}/g,' ')).trim())}

/* Capa donde viven las palabras: una global a pantalla completa, o una dentro de un contenedor (vista previa) */
let globalLayer=null;
function layerFor(l){if(l)return l;if(globalLayer&&document.body.contains(globalLayer))return globalLayer;
 globalLayer=document.createElement('div');globalLayer.className='dt-layer';globalLayer.setAttribute('aria-hidden','true');document.body.append(globalLayer);return globalLayer}

/* Una palabra: nace en (x,y) de la capa, sube con vaivén suave y se desvanece */
function word(layer,text,x,y){
 const live=layer.querySelectorAll('.dt-word');if(live.length>26)live[0].remove();
 const el=document.createElement('div');el.className='dt-word';el.textContent=text;layer.append(el);
 const lw=layer.offsetWidth||innerWidth,w=el.offsetWidth||120;
 x=Math.max(w/2+8,Math.min(lw-w/2-8,x));el.style.left=x+'px';el.style.top=y+'px';
 const rise=rnd(160,270),drift=rnd(-46,46),rot=rnd(-7,7),dur=rnd(2400,3200),c='translate(-50%,-50%) ';
 const f=(k,s)=>c+`translate(${(drift*k).toFixed(1)}px,${(-rise*k).toFixed(1)}px) scale(${s}) rotate(${rot}deg)`;
 const a=el.animate(reduce?[{transform:f(0,1),opacity:0},{transform:f(.2,1),opacity:1,offset:.25},{transform:f(.2,1),opacity:1,offset:.7},{transform:f(.2,1),opacity:0}]
  :[{transform:f(0,.5),opacity:0},{transform:f(.16,1.12),opacity:1,offset:.14},{transform:f(.55,1),opacity:1,offset:.6},{transform:f(1,.92),opacity:0}],
  {duration:reduce?1400:dur,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});
 a.onfinish=a.oncancel=()=>el.remove()}
/* Anillo de toque (feedback inmediato) */
function ring(layer,x,y){if(reduce)return;const r=document.createElement('div');r.className='dt-ring';r.style.left=x+'px';r.style.top=y+'px';layer.append(r);
 const a=r.animate([{transform:'scale(.3)',opacity:.7},{transform:'scale(1.7)',opacity:0}],{duration:620,easing:'ease-out',fill:'forwards'});a.onfinish=()=>r.remove()}
/* Sonido suave y corto, solo si la tarjeta tiene el sonido encendido */
function pop(){try{if(typeof soundEnabled==='undefined'||!soundEnabled||typeof audioCtx==='undefined'||typeof initAudio!=='function')return;initAudio();
 const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(660,t);o.frequency.exponentialRampToValueAtTime(990,t+.09);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.25)}catch(e){}}

/* Lanza 3 palabras seguidas alrededor del punto (en coordenadas locales de la capa) */
function burst(layer,list,x,y){
 if(!list||!list.length)return;
 ring(layer,x,y);pop();try{navigator.vibrate&&navigator.vibrate(16)}catch(e){}
 const bag=list.slice().sort(()=>Math.random()-.5);
 for(let i=0;i<3;i++)setTimeout(()=>word(layer,bag[i%bag.length],x+rnd(-70,70),y+rnd(-18,18)),i*150)}

/* attach(zona, {layer, phrases:()=>[...], enabled:()=>bool})  ->  {fire(clientX,clientY)}
   Detecta dos toques seguidos (touch, lápiz o ratón) sobre la zona; ignora botones, enlaces y arrastres (el parallax). */
function attach(zone,o){o=o||{};if(!zone)return null;
 zone.classList.add('dt-zone');
 let last=null,down=null,used=false;
 const local=(layer,cx,cy)=>{const r=layer.getBoundingClientRect(),s=(r.width/(layer.offsetWidth||r.width))||1;return[(cx-r.left)/s,(cy-r.top)/s]};
 const fire=(cx,cy)=>{const layer=layerFor(o.layer),p=local(layer,cx,cy);used=true;DT.used=true;
  const h=document.querySelector('.dt-hint');h&&h.remove();burst(layer,(o.phrases?o.phrases():[]),p[0],p[1])};
 zone.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}},{passive:true});
 zone.addEventListener('pointerup',e=>{
  if(o.enabled&&!o.enabled())return;
  if(e.target.closest&&e.target.closest('button,a,input,textarea,select,label,[data-nodt]'))return;
  if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>14){last=null;return}   /* fue un arrastre, no un toque */
  const t=Date.now();
  if(last&&t-last.t<340&&Math.hypot(e.clientX-last.x,e.clientY-last.y)<56){last=null;fire(e.clientX,e.clientY)}
  else last={t,x:e.clientX,y:e.clientY}},{passive:true});
 return{fire,get used(){return used}}}

/* Pista discreta, una sola vez por visita, hasta que la persona ya hizo doble toque */
function hint(text){try{if(DT.used||sessionStorage.getItem('dtHint'))return;sessionStorage.setItem('dtHint','1')}catch(e){}
 setTimeout(()=>{if(DT.used)return;const h=document.createElement('div');h.className='dt-hint';h.textContent=text||'Toca dos veces la tarjeta ✨';h.setAttribute('role','status');document.body.append(h);
  requestAnimationFrame(()=>h.classList.add('on'));setTimeout(()=>{h.classList.remove('on');setTimeout(()=>h.remove(),500)},3600)},1800)}

return{WORDS,phrases,attach,burst,hint,layerFor,used:false};
})();
window.DT=DT;   /* visible también como window.DT */
