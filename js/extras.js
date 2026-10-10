/* Extras v11 (tarjeta): marca de agua viral, cápsula del tiempo,
   modo oficina (Excel) y efectos de agitar / soplar. Se carga DESPUÉS del script de la tarjeta
   y solo envuelve funciones existentes: si este archivo falla o se borra, la tarjeta sigue igual. */
(function(){
'use strict';
if(typeof PL==='undefined'||typeof TV==='undefined')return;

/* ====== Ajustes que puedes tocar ====== */
const BLOW={low:140,ratio:2,ms:350};      // Soplar: volumen mínimo en graves, proporción graves/agudos y duración (ms)
const SHAKE={force:30,hits:2,cool:1500};  // Agitar: fuerza del sacudón, sacudidas seguidas y pausa entre efectos (ms)
const EMO={'cumple-divertido':['🎉','🎂','🎈'],amor:['❤️','💖','🌹'],gracias:['🌻','🙏','✨'],aniversario:['💍','🥂','💫'],mama:['🌷','💐','💜'],papa:['⭐','🏆','💙'],'mujer-boliviana':['🌸','🌺','💜'],halloween:['🎃','🦇','👻'],difuntos:['🌼','🕯️','🧡'],navidad:['🎄','❄️','⭐']};

const el=id=>document.getElementById(id),QS=new URLSearchParams(window.__CARD?window.__CARD.qs:location.search);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const icons=()=>{try{window.lucide&&lucide.createIcons()}catch(e){}};
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

/* Modal reutilizando .modal / .card del proyecto */
function modal(id,html){const m=document.createElement('div');m.id=id;m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
 m.innerHTML='<div class="card p-7 w-full max-w-sm text-center relative"><button type="button" class="absolute top-4 right-4 text-gray-500 xclose" aria-label="Cerrar">✕</button>'+html+'</div>';
 document.body.append(m);return m}
const show=m=>m.classList.add('open'),hide=m=>m.classList.remove('open');
const shakeEl=m=>{const c=m.firstElementChild;c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake')};

/* ============ 1) MARCA DE AGUA VIRAL (#11) ============ */
if(TV.WATERMARK!==false){const host=document.querySelector('.carta-content');
 if(host){const a=document.createElement('a');a.className='wm';a.href='../index.html?ref=tarjeta';a.target='_blank';a.rel='noopener';
  a.innerHTML='<span aria-hidden="true">✨</span><span>Hecha con <b>FRASSMOTTI</b> · Crea la tuya</span>';host.append(a)}}

/* ============ 2) CÁPSULA DEL TIEMPO (#12) ============ */
/* ?abre=2026-12-24T00:00 (hora local de quien la abre). Con REQUIRE_PAYMENT la fecha va dentro de la firma. */
const abreRaw=(QS.get('abre')||'').trim();let abreTs=0;
if(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(abreRaw))abreTs=new Date(abreRaw.length===10?abreRaw+'T00:00':abreRaw).getTime()||0;
/* Hora del servidor (cabecera Date) para que cambiar el reloj del celular no sirva de truco; si falla, usa el reloj local */
let skew=0;
async function syncClock(){try{const r=await fetch(location.pathname,{method:'HEAD',cache:'no-store'}),d=Date.parse(r.headers.get('Date')||'');if(d)skew=d-Date.now()}catch(e){}}
const now=()=>Date.now()+skew;
const clockReady=Promise.race([syncClock(),sleep(2500)]);

function capsule(){return new Promise(res=>{
 const m=modal('mCap','<div class="text-4xl" aria-hidden="true">⏳</div><h3 class="serif text-3xl mt-2">Cápsula del tiempo</h3><p class="text-sm mt-2" data-k="t" style="color:#475569"></p><p class="serif text-2xl mt-3" data-k="d"></p><div class="cap-grid" data-k="g"></div><button type="button" class="btn btn-dark w-full mt-5" data-k="b" disabled>Aún no se puede abrir</button>');
 const f=k=>m.querySelector('[data-k="'+k+'"]'),btn=f('b'),d=new Date(abreTs),conHora=d.getHours()||d.getMinutes();
 f('t').textContent='Esta tarjeta para '+nombre+' está sellada hasta:';
 f('d').textContent=d.toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+(conHora?' · '+d.toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'}):'');
 const boxes=['días','horas','min','seg'].map(l=>{const b=document.createElement('div');b.className='cap-box';b.innerHTML='<b>00</b><span>'+l+'</span>';f('g').append(b);return b.firstChild});
 let done=false,iv=0;
 const tick=()=>{const ms=Math.max(0,abreTs-now()),v=[Math.floor(ms/864e5),Math.floor(ms/36e5)%24,Math.floor(ms/6e4)%60,Math.floor(ms/1e3)%60];
  boxes.forEach((b,i)=>b.textContent=String(v[i]).padStart(2,'0'));
  if(ms<=0&&!done){done=true;clearInterval(iv);f('t').textContent='¡Ya llegó el momento!';btn.disabled=false;btn.textContent='Abrir cápsula';TVS.chime();boom();buzz([40,40,40])}};
 const end=ok=>{clearInterval(iv);hide(m);setTimeout(()=>m.remove(),300);res(ok)};
 iv=setInterval(tick,1000);tick();
 btn.onclick=()=>end(true);m.querySelector('.xclose').onclick=()=>end(false);m.addEventListener('click',e=>{if(e.target===m)end(false)});
 show(m)})}

/* Envuelve abrirCarta(): solo si hay cápsula del tiempo activa, muestra la cuenta regresiva antes de abrir. Sin cápsula, el sobre abre libre. */
const sello=el('selloWrap'),hint=el('hint'),origAbrir=window.abrirCarta,sellada=abreTs&&abreTs>Date.now();
if(typeof origAbrir==='function'&&sellada){
 sello&&sello.classList.add('cand');
 if(hint&&hint.lastChild&&hint.lastChild.nodeType===3)hint.lastChild.textContent=' Cápsula del tiempo: toca el sello';
 let passed=false,busy=false;
 window.abrirCarta=async function(){
  if(busy||estado==='abierto')return;
  try{initAudio();audioCtx&&audioCtx.resume&&audioCtx.resume()}catch(e){}   // desbloquea el audio en iOS con este toque
  if(passed)return origAbrir();
  busy=true;
  try{await clockReady;
   if(abreTs&&now()<abreTs&&!(await capsule()))return;
   passed=true;sello&&sello.classList.remove('cand');
  }finally{busy=false}
  origAbrir();
 };
}

/* ============ 4) MODO DISCRETO / OFICINA con hoja de Excel (#18) ============ */
const COLS='ABCDEFGHIJ'.split('');
const DATA=[['Presupuesto Q4 2026'],['Concepto','Octubre','Noviembre','Diciembre','Total','Estado'],['Marketing','4,200','3,800','5,100','13,100','OK'],['Logística','2,950','3,100','3,400','9,450','OK'],['Software','1,200','1,200','1,350','3,750','Revisar'],['Capacitación','800','0','1,500','2,300','OK'],['Viáticos','1,640','1,980','2,210','5,830','OK'],['Varios','320','410','560','1,290','OK'],['TOTAL','11,110','10,490','14,120','35,720','']];
function tabla(){let h='<table><thead><tr><th></th>'+COLS.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>';
 for(let r=0;r<30;r++){h+='<tr><th>'+(r+1)+'</th>';
  for(let c=0;c<10;c++){const v=(DATA[r]&&DATA[r][c])||'',k=[];
   if(r===1)k.push('h');else if(r===0||r===8)k.push('t');
   if(c>=1&&c<=4&&r>=2&&r<=8)k.push('n');if(r>=2&&r<=7&&c===5&&v==='Revisar')k.push('w');
   h+='<td'+(k.length?' class="'+k.join(' ')+'"':'')+'>'+v+'</td>'}
  h+='</tr>'}
 return h+'</tbody></table>'}
const xl=document.createElement('div');xl.id='xl';xl.setAttribute('aria-hidden','true');
xl.innerHTML='<div class="xl-title"><span class="xl-logo">X</span><span>Presupuesto_Q4_2026.xlsx - Excel</span></div>'+
 '<div class="xl-tabs"><span>Archivo</span><span class="on">Inicio</span><span>Insertar</span><span>Diseño de página</span><span>Fórmulas</span><span>Datos</span><span>Revisar</span><span>Vista</span></div>'+
 '<div class="xl-ribbon"><b>Pegar</b><i></i><b>Calibri 11</b><b>N</b><b>K</b><b>S</b><i></i><b>Σ Autosuma</b><i></i><b>Ordenar y filtrar</b></div>'+
 '<div class="xl-fx"><span class="xl-nb">E9</span><span class="xl-f">fx</span><span class="xl-fv">=SUMA(E3:E8)</span></div>'+
 '<div class="xl-grid">'+tabla()+'</div>'+
 '<div class="xl-sheets"><span class="on">Presupuesto</span><button type="button" id="xlBack">Hoja2</button><span>+</span><span class="xl-st" id="xlSt">Listo</span></div>';
document.body.append(xl);
let xlOn=false,prev=null,stTimer=0;
const favicon=()=>document.querySelector('link[rel="icon"]');
const XL_ICON='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="5" fill="#1d6f42"/><text x="16" y="23" font-size="20" font-weight="700" text-anchor="middle" fill="#fff" font-family="Arial">X</text></svg>');
function openOffice(){if(xlOn)return;xlOn=true;
 prev={title:document.title,icon:favicon()&&favicon().href,snd:soundEnabled,mus:!!(window.__mus&&!window.__mus.paused)};
 soundEnabled=false;window.__mus&&window.__mus.pause();
 document.title='Presupuesto_Q4_2026.xlsx - Excel';if(favicon())favicon().href=XL_ICON;
 xl.classList.add('on');xl.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
 el('xlSt').textContent='Toca «Hoja2» para volver a tu tarjeta 💌';clearTimeout(stTimer);stTimer=setTimeout(()=>el('xlSt').textContent='Listo',5000)}
function closeOffice(){if(!xlOn)return;xlOn=false;
 xl.classList.remove('on');xl.setAttribute('aria-hidden','true');document.body.style.overflow='';
 document.title=prev.title;if(favicon()&&prev.icon)favicon().href=prev.icon;
 soundEnabled=prev.snd;if(prev.mus&&window.__mus)window.__mus.play().catch(()=>{})}
el('xlBack').onclick=closeOffice;
/* Botón "Oficina" junto al de Sonido (barra superior, visible siempre) */
const snd=el('btnSound');
if(snd){const grp=document.createElement('div');grp.style.cssText='display:flex;gap:8px';snd.replaceWith(grp);
 const b=document.createElement('button');b.type='button';b.className='pill';b.id='btnOfi';b.setAttribute('aria-label','Modo oficina');b.innerHTML='<i data-lucide="table"></i><span>Oficina</span>';
 b.onclick=openOffice;grp.append(snd,b)}
/* Tecla jefe: Esc dos veces seguidas alterna entre la tarjeta y el Excel */
let lastEsc=0;addEventListener('keydown',e=>{if(e.key!=='Escape')return;const t=Date.now();if(t-lastEsc<600){lastEsc=0;xlOn?closeOffice():openOffice()}else lastEsc=t});
if(QS.get('of')==='1')openOffice();

/* ============ 5) AGITAR O SOPLAR (#6) ============ */
const lluvia=()=>{let shapes;try{shapes=(EMO[T.id]||['✨']).map(text=>confetti.shapeFromText({text,scalar:2}))}catch(e){}
 const fin=Date.now()+1500;(function f(){confetti({particleCount:4,angle:90,spread:75,startVelocity:12,origin:{x:Math.random(),y:-.1},gravity:.9,ticks:280,scalar:2,shapes,flat:!!shapes,disableForReducedMotion:true});if(Date.now()<fin)requestAnimationFrame(f)})()};
const anim=(cls,ms)=>{const c=document.querySelector('.carta-content');if(!c)return;c.classList.remove(cls);void c.offsetWidth;c.classList.add(cls);setTimeout(()=>c.classList.remove(cls),ms)};
const pillState=()=>{const b=el('bFx');b&&b.classList.toggle('on',!!(shakeH||blowOn))};

/* --- Agitar --- */
let shakeH=null;
async function toggleShake(){
 if(shakeH){removeEventListener('devicemotion',shakeH);shakeH=null;toast('Agitar desactivado');pillState();return}
 if(typeof DeviceMotionEvent==='undefined'||!navigator.maxTouchPoints){toast('Agitar funciona en celulares con sensor de movimiento');return}
 if(typeof DeviceMotionEvent.requestPermission==='function'){let s='denied';try{s=await DeviceMotionEvent.requestPermission()}catch(e){}if(s!=='granted'){toast('Permiso de movimiento denegado');return}}
 let l=null,hits=[],cool=0;
 shakeH=e=>{const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;const t=Date.now();
  if(l){const d=Math.abs(a.x-l.x)+Math.abs(a.y-l.y)+Math.abs(a.z-l.z);
   if(d>SHAKE.force&&t-cool>SHAKE.cool){hits=hits.filter(h=>t-h<700);hits.push(t);if(hits.length>=SHAKE.hits){cool=t;hits=[];shakeFx()}}}
  l={x:a.x,y:a.y,z:a.z}};
 addEventListener('devicemotion',shakeH);toast('¡Listo! Agita tu celular');pillState()}
function shakeFx(){anim('fx-wobble',700);lluvia();boom();buzz([40,30,40]);try{playChimeSound()}catch(e){}}

/* --- Soplar (micrófono solo para medir volumen; no graba ni envía nada) --- */
let blowOn=false,blowCtx=null,blowStream=null,blowRaf=0;
function stopMic(){cancelAnimationFrame(blowRaf);blowStream&&blowStream.getTracks().forEach(t=>t.stop());blowCtx&&blowCtx.close().catch(()=>{});blowStream=blowCtx=null}
function candle(){let v=el('vela');if(v)return v;v=document.createElement('div');v.id='vela';
 v.innerHTML='<div class="vela-fw" role="button" aria-label="Apagar la velita"><div class="vela-flame"></div></div><div class="vela-smoke"></div><div class="vela-wick"></div><div class="vela-body"></div><p>Sopla al micrófono 🌬️ o toca la llama</p>';
 document.body.append(v);v.querySelector('.vela-fw').onclick=snuff;return v}
function removeCandle(){stopMic();blowOn=false;const v=el('vela');v&&v.remove();pillState()}
function snuff(){const v=el('vela');if(!v||v.classList.contains('off'))return;v.classList.add('off');stopMic();blowOn=false;pillState();
 anim('fx-wind',1600);boom();buzz([60,40,60]);try{playChimeSound()}catch(e){}toast('¡Pide un deseo! ✨');setTimeout(()=>{const x=el('vela');x&&x.remove()},2800)}
async function toggleBlow(){
 if(blowOn||(el('vela')&&!el('vela').classList.contains('off'))){removeCandle();return}
 blowOn=true;candle();pillState();
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!AC){toast('Sin micrófono: toca la llama para apagarla');return}
 try{blowStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}
 catch(e){toast('Sin permiso de micrófono: toca la llama para apagarla');return}
 if(!blowOn){stopMic();return}
 blowCtx=new AC();const an=blowCtx.createAnalyser();an.fftSize=1024;an.smoothingTimeConstant=.3;blowCtx.createMediaStreamSource(blowStream).connect(an);
 const buf=new Uint8Array(an.frequencyBinCount),bw=blowCtx.sampleRate/an.fftSize,lo=Math.max(1,Math.round(400/bw)),h1=Math.round(1500/bw),h2=Math.round(5000/bw);
 const avg=(a,b)=>{let s=0;for(let i=a;i<=b;i++)s+=buf[i];return s/(b-a+1)};let since=0;
 const loop=()=>{an.getByteFrequencyData(buf);const L=avg(1,lo),H=avg(h1,h2),fuerte=L>BLOW.low&&L>H*BLOW.ratio,t=performance.now();
  const v=el('vela');if(v)v.style.setProperty('--lean',Math.min(1,L/220).toFixed(2));
  if(fuerte){if(!since)since=t;if(t-since>BLOW.ms){snuff();return}}else since=0;
  blowRaf=requestAnimationFrame(loop)};
 blowRaf=requestAnimationFrame(loop);toast('Sopla fuerte hacia el micrófono')}

/* --- Botón y panel de efectos (en la barra inferior de la tarjeta) --- */
const dock=el('dock'),cr=el('cr');
if(dock){const b=document.createElement('button');b.type='button';b.className='pill';b.id='bFx';b.innerHTML='<i data-lucide="wind"></i>Agitar / Soplar';dock.insertBefore(b,cr||null);
 const mf=modal('mFx','<h3 class="serif text-3xl">Efectos mágicos</h3><p class="text-sm mt-2" style="color:#475569">Activa uno y sorpréndete.</p><div class="grid gap-3 mt-5"><button type="button" class="pick" data-fx="shake"><b>📱 Agitar el celular</b><br><small>Lluvia de emojis al sacudirlo</small></button><button type="button" class="pick" data-fx="blow"><b>🌬️ Soplar la velita</b><br><small>Sopla al micrófono para apagarla y pedir un deseo</small></button></div><p class="text-xs mt-4" style="color:#64748b">El micrófono solo mide el volumen: no graba ni envía nada.</p>');
 mf.querySelector('.xclose').onclick=()=>hide(mf);mf.addEventListener('click',e=>{if(e.target===mf)hide(mf)});
 mf.querySelectorAll('[data-fx]').forEach(o=>o.onclick=()=>{hide(mf);o.dataset.fx==='shake'?toggleShake():toggleBlow()});
 b.onclick=()=>show(mf)}
icons();
})();
