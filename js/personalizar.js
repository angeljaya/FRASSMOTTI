/* Personalizar v14: género + ocasión + diseño automático, 3 tamaños de tarjeta, foto recortable (color o B/N),
   colores/tipografías/sello, secreto con hasta 3 pistas (opcional), cápsula opcional, pago Yape y aviso de éxito. */
const Q=new URLSearchParams(location.search),$=id=>document.getElementById(id);
const S={g:Q.get('g')==='h'?'h':Q.get('g')==='m'?'m':null,dis:null,tam:1,col:null,fu:'scrap',bw:true,photo:null,tries:0,shown:1};
let T=TV.pick(Q.get('plantilla'));
const PH={1:200,2:150,3:112},IMG_W=235,asp=()=>IMG_W/PH[S.tam];   /* proporción del espacio de la foto según el tamaño */
document.querySelectorAll('.price').forEach(e=>e.textContent=TV.PRECIO);
/* Si la ocasión es solo para un género (Mamá, Papá, Día de la Mujer), ajusta el género */
const G=()=>S.g||'m';   /* género para filtrar/mostrar mientras el cliente no elige */
if(TV.SOLO[T.id]&&S.g&&!TV.SOLO[T.id].includes(S.g))S.g=TV.SOLO[T.id][0];
if(!S.g&&TV.SOLO[T.id]&&TV.SOLO[T.id].length===1)S.g=TV.SOLO[T.id][0];

/* Modales */
const open=id=>$(id).classList.add('open'),shut=id=>$(id).classList.remove('open');
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-close]'))m.classList.remove('open')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'))});
const toast=m=>{$('toast').textContent=m;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2800)};

/* Lectura de campos (los extras solo cuentan si su interruptor está activo) */
const on=id=>$(id).checked,v=(id,n)=>clean($(id).value,n||240).trim();
const secMsg=()=>v('secreto',240),clave=()=>v('clave',20),pistas=()=>[v('pista',60)].filter(Boolean);
const qL=()=>v('qLock',80),aL=()=>v('aLock',30),abre=()=>$('abre').value;
const titulo=()=>v('titulo',14)||T.ti,palabra=()=>(v('palabra',9)||T.pa).toUpperCase().slice(0,9);
const mensaje=()=>clean($('frase').value,2600).trim()||T.frase;
const sello=()=>(v('sello',1)||v('nombre',24)||'C').charAt(0).toUpperCase();

/* ---------- Construcción de los selectores ---------- */
const HOLD={1:'Escribe algo tierno, corto y directo al corazón.',2:'Saluda, cuenta un recuerdo bonito y despídete con buenos deseos.',3:'Explayate: anécdotas, lo que sientes, lo que nunca dijiste. Se leerá página por página.'};
function buildOcasiones(){const l=S.g?TV.ocasiones(S.g):TV.T;if(!l.some(t=>t.id===T.id))T=l[0];$('ocasion').innerHTML=l.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');$('ocasion').value=T.id}
function buildDisenos(){const l=TV.disenos(G(),T.id);if(!l.some(d=>d.id===S.dis))S.dis=l[0].id;
 $('disenos').innerHTML=l.map(d=>`<button type="button" class="dchip" data-d="${d.id}" aria-pressed="${d.id===S.dis}">${d.n}</button>`).join('')}
$('gen').querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.g===S.g));
$('tams').innerHTML=TV.TAMANOS.map(t=>`<button type="button" class="opt" data-t="${t.id}" aria-pressed="false"><span class="tag">${t.n} · ${t.sub}</span><b>${t.w}</b><small>${t.d}</small></button>`).join('');
$('cols').innerHTML=Object.entries(TV.PALETA).map(([k,p])=>`<button type="button" class="sw" data-col="${k}" aria-label="${p.n}" title="${p.n}" aria-pressed="false" style="background:${p.sw}"></button>`).join('');
$('fonts').innerHTML=TV.FUENTES.map(f=>`<button type="button" class="fchip" data-f="${f.id}" aria-pressed="false"><span style="font-family:${f.t}">Aa</span><small>${f.n}</small></button>`).join('');
let lastDefault='';

/* ---------- Foto ---------- */
function refreshPhoto(){S.photo=FOTO.st.img?FOTO.render(asp(),280):null;
 $('fotoBox').classList.toggle('hidden',!S.photo);if(S.photo)$('fotoThumb').src=S.photo;$('fotoThumb').style.filter=S.bw?'grayscale(1) contrast(1.1)':'none';
 $('fotoMode').querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.m==='bn')===S.bw))}
$('foto').onchange=async e=>{const f=e.target.files[0];if(!f)return;
 try{await FOTO.load(f);$('fotoTxt').textContent=f.name;refreshPhoto();render();FOTO.edit(asp(),{bw:()=>S.bw,setBW:x=>{S.bw=x},done:()=>{refreshPhoto();render()}})}
 catch(err){$('fotoTxt').textContent=err.message;$('foto').value=''}};
$('fotoEdit').onclick=()=>FOTO.edit(asp(),{bw:()=>S.bw,setBW:x=>{S.bw=x},done:()=>{refreshPhoto();render()}});
$('mCrop').addEventListener('click',e=>{if(e.target.id==='mCrop'||e.target.closest('[data-close]')){refreshPhoto();render()}});
$('fotoDel').onclick=()=>{FOTO.clear();S.photo=null;$('foto').value='';$('fotoTxt').textContent='Subir foto desde tu dispositivo';refreshPhoto();render()};
$('fotoMode').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;S.bw=b.dataset.m==='bn';refreshPhoto();render();draft()};

/* ---------- Vista previa en vivo ---------- */
function render(){
 const n=v('nombre',24)||'Carla',de=v('deParte',24);
 const acc=TD.apply(document,{t:T,g:G(),dis:S.dis,col:S.col,fu:S.fu,v:window.MOTIVO||0});
 $('ejLink').href='r/tarjeta.html?nombre=Carla&t='+T.id+'&g='+G()+'&d='+TV.diseno(S.dis,G(),T.id).id+(S.col?'&color='+S.col:'')+'&fu='+S.fu+'&tam='+S.tam+'&ej=1';
 const tit=titulo(),pal=palabra();
 $('pvTit').textContent=tit;TD.titleFit($('pvTit'),tit);TV.letters($('pvLet'),pal);$('pvPat').innerHTML=Array(12).fill('<span>'+(tit+' '+pal).toUpperCase()+'</span>').join('');
 $('pvCap').textContent=n+(de?' · de '+de:'');
 $('pvAv').src=S.photo||TV.avatar(1,n);$('pvAv').classList.toggle('color',!S.photo||!S.bw);
 TM.mount($('pvMsg'),mensaje(),S.tam);
  $('pvSealL').textContent=sello();$('titulo').placeholder=T.ti;$('palabra').placeholder=T.pa;$('sello').placeholder=(v('nombre',24)||'C').charAt(0).toUpperCase();
 /* contador de palabras y estado de botones */
 const w=TM.count($('frase').value),tm=TV.tam(S.tam);$('wc').textContent=`${w} ${w===1?'palabra':'palabras'} · ${tm.n} (${tm.w})`;$('wc').classList.toggle('over',w>tm.max);
 document.querySelectorAll('[data-col]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.col===S.col));
 document.querySelectorAll('[data-f]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===S.fu));
 document.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.t===S.tam));
 $('gen').querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.g===S.g));
 $('genErr').textContent='';
 $('frase').placeholder=HOLD[S.tam];
}
document.querySelector('main').addEventListener('input',()=>{render();draft()});

/* Cambios de género / ocasión / diseño / tamaño / color / tipografía */
function applyDefaultText(prev){const f=$('frase');if(!f.value.trim()||f.value===prev)f.value=T.frase;lastDefault=T.frase}
$('gen').onclick=e=>{const b=e.target.closest('[data-g]');if(!b||b.dataset.g===S.g)return;S.g=b.dataset.g;const prev=T.frase;buildOcasiones();applyDefaultText(prev);S.dis=null;buildDisenos();render();draft()};
$('ocasion').onchange=()=>{const prev=T.frase;T=TV.find($('ocasion').value);window.MOTIVO=0;if(TV.SOLO[T.id]&&TV.SOLO[T.id].length===1)S.g=TV.SOLO[T.id][0];applyDefaultText(prev);S.dis=null;buildDisenos();render();draft()};
$('disenos').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;S.dis=b.dataset.d;buildDisenos();render();draft()};
$('tams').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;S.tam=+b.dataset.t;refreshPhoto();render();draft()};
$('fonts').onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;S.fu=b.dataset.f;render();draft()};
document.addEventListener('click',e=>{const c=e.target.closest('[data-col]');if(c){S.col=S.col===c.dataset.col?null:c.dataset.col;render();draft()}});

/* Confeti + nota de éxito suave (WebAudio, sin archivos) */
const boom=()=>confetti({particleCount:140,spread:80,origin:{y:.6},colors:[(S.col?TV.COLORS[S.col]:T.K.ac),'#111827','#fff'],disableForReducedMotion:true});
const chime=()=>TVS.chime();
$('pvCel').onclick=boom;

/* Minijuego: adivina el secreto */
const key=()=>clave().toLowerCase();
function reveal(){$('sLock').classList.add('hidden');$('sOpen').classList.remove('hidden');$('sMsg').textContent=clean($('secreto').value,240)||'Aquí aparecerá tu mensaje secreto.';boom();chime()}
$('pvGift').onclick=()=>{S.tries=0;$('sGuess').value='';$('sErr').textContent='';
 $('sHint').textContent=clean($('pista').value,60)?'Pista: '+clean($('pista').value,60):'Pista: tú ya sabes cuál es...';
 $('sOpen').classList.add('hidden');open('mSecret');
 if(!key()){reveal();return}$('sLock').classList.remove('hidden');setTimeout(()=>$('sGuess').focus(),150)};
function guess(){const g=$('sGuess').value.trim().toLowerCase();if(g&&g===key()){reveal();return}
 S.tries++;const k=clean($('clave').value,20).trim();
 $('sErr').textContent=S.tries>=2?`Pista extra: empieza con "${k[0].toUpperCase()}" y tiene ${k.length} letras`:'Esa no es la clave. Intenta otra vez.';
 const c=$('sCard');c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');$('sGuess').value='';$('sGuess').focus()}
$('sTry').onclick=guess;$('sGuess').addEventListener('keydown',e=>{if(e.key==='Enter')guess()});

/* Docking: reduce el celular con scale y lo deja fijo (sticky) arriba. Histéresis evita parpadeo */
let docked=false,tick=false;
function dock(){tick=false;const y=scrollY;
 if(!docked&&y>120){docked=true;$('dockBox').style.height='230px';$('phone').style.transform='scale(.38)';$('dock').classList.add('docked')}
 else if(docked&&y<40){docked=false;$('dockBox').style.height='610px';$('phone').style.transform='scale(1)';$('dock').classList.remove('docked')}}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(dock)}},{passive:true});

/* QR de pago: imagen real (TV.QR_IMAGE) o placeholder CSS de prueba */
(function(){const b=$('qrBox');if(TV.QR_IMAGE){b.innerHTML=`<img src="${TV.QR_IMAGE}" alt="QR Yape" class="w-[168px] rounded-2xl border">`;return}
 let h='',r=7;const F=[[0,0],[14,0],[0,14]],inF=(x,y)=>F.find(([a,c])=>x>=a&&x<a+7&&y>=c&&y<c+7);
 for(let y=0;y<21;y++)for(let x=0;x<21;x++){const p=inF(x,y);if(p){const dx=x-p[0],dy=y-p[1];h+=(dx%6===0||dy%6===0||(dx>1&&dx<5&&dy>1&&dy<5))?'<i></i>':'<b></b>'}else{r=(r*9301+49297)%233280;h+=r%100<48?'<i></i>':'<b></b>'}}
 b.innerHTML=`<div class="qr" role="img" aria-label="QR de prueba">${h}</div>`})();

/* ---------- Pago -> WhatsApp ---------- */
$('pay').onclick=()=>{if(!S.g){toast('Elige primero: ¿la tarjeta es para una mujer o un hombre?');$('gen').scrollIntoView({block:'center'});$('genErr').textContent='Elige una opción para continuar';$('gen').classList.remove('shake');void $('gen').offsetWidth;$('gen').classList.add('shake');return}
 if(!v('nombre',24)){toast('Escribe el nombre de quien recibe la tarjetita');$('nombre').focus();$('nombre').scrollIntoView({block:'center'});return}
 const tm=TV.tam(S.tam),w=TM.count($('frase').value);
 if(w>tm.max){toast(`Tu mensaje tiene ${w} palabras: elige un tamaño más grande o acórtalo (máx. ${tm.max})`);$('frase').scrollIntoView({block:'center'});return}
 if(!!qL()!==!!aL()){toast('La cerradura necesita pregunta y respuesta');$('qLock').scrollIntoView({block:'center'});return}
 if(abre()&&!(Date.parse(abre())>Date.now())&&!confirm('La fecha de la cápsula ya pasó, así que no habrá bloqueo. ¿Continuar?'))return;
 if(secMsg()&&!clave()&&!confirm('Sin palabra secreta el mensaje se verá sin candado. ¿Continuar?'))return;open('mPay')};

function pedidoTexto(){const n=v('nombre',24),msg=mensaje(),r=FOTO.st.img?FOTO.rect(asp()):null,dis=TV.diseno(S.dis,G(),T.id);
 const enc=r?`modo=${S.bw?'bn':'color'}; zoom=${FOTO.st.z.toFixed(2)}; cx=${FOTO.st.cx.toFixed(3)}; cy=${FOTO.st.cy.toFixed(3)}`:'';
 return['*NUEVO PEDIDO - FRASSMOTTI*','---------------------',`Ocasión: ${T.name}`,`Plantilla: ${T.id}`,`Género: ${S.g==='h'?'Hombre':'Mujer'}`,`Diseño: ${dis.id}`,`Tamaño: ${S.tam}`,
  `Para: ${n}`,`De parte de: ${v('deParte',24)||'-'}`,`Título: ${titulo()}`,`Palabra: ${palabra()}`,`Frase: "${msg.replace(/\s+/g,' ').slice(0,70)}"`,`Mensaje (${TM.count(msg)} palabras): "${msg.replace(/\n+/g,' ¶ ')}"`,
  `Color: ${S.col||'según plantilla'}`,`Tipografía: ${S.fu}`,`Inicial del sello: ${sello()}`,
  `Mensaje secreto: "${secMsg()||'-'}"`,`Palabra clave: "${clave()||'(sin candado)'}"`,`Pista: "${pistas()[0]||'-'}"`,
  `Pregunta cerradura: "${qL()||'-'}"`,`Respuesta cerradura: "${aL()||'-'}"`,`Abre el: ${abre()||'-'}`,`Modo oficina: ${on('ofi')?'sí':'no'}`,
  `Foto: ${S.photo?'La envío por este chat (recortada)':'Sin foto'}`,...(S.photo?[`Encuadre foto: ${enc}`]:[]),'---------------------',
  `Mi WhatsApp: ${v('tel',20)||'-'}`,`Monto: ${TV.PRECIO} Bs por Yape`,'Adjunto mi comprobante de pago.',...(window.extraLines?extraLines():[])].join('\n')}

$('send').onclick=async()=>{if(window.sinComprobante&&sinComprobante())return;
 $('send').disabled=true;
 try{const ok=await (window.enviarPedido||(async t=>{window.open(TV.wa(t),'_blank');return true}))(pedidoTexto());if(ok!==false)shut('mPay')}
 finally{$('send').disabled=false}};
window.fotoParaEnviar=async()=>{if(!FOTO.st.img)return null;const u=FOTO.render(asp(),900),b=await (await fetch(u)).blob();return new File([b],'foto-recortada.jpg',{type:'image/jpeg'})};

/* ---------- Borrador automático (localStorage) ---------- */
const FIELDS=['ocasion','nombre','deParte','frase','secreto','clave','pista','tel','qLock','aLock','abre','titulo','palabra','sello'],TOGS=['ofi'];
function draft(){try{localStorage.setItem('tv_draft',JSON.stringify({...Object.fromEntries(FIELDS.map(f=>[f,$(f).value])),col:S.col,g:S.g||'',dis:S.dis,tam:S.tam,fu:S.fu,bw:S.bw,tog:Object.fromEntries(TOGS.map(t=>[t,on(t)]))}))}catch(e){}}
try{const d=JSON.parse(localStorage.getItem('tv_draft')||'{}');
 if(!Q.get('g')&&(d.g==='h'||d.g==='m'))S.g=d.g;
 if(Q.get('plantilla')){/* la plantilla de la URL manda */}else if(d.ocasion&&TV.T.some(t=>t.id===d.ocasion))T=TV.find(d.ocasion);
 if(TV.SOLO[T.id]&&S.g&&!TV.SOLO[T.id].includes(S.g))S.g=TV.SOLO[T.id][0];
 if(!S.g&&TV.SOLO[T.id]&&TV.SOLO[T.id].length===1)S.g=TV.SOLO[T.id][0];
 buildOcasiones();
 FIELDS.forEach(f=>{if(d[f]&&f!=='ocasion')$(f).value=d[f]});
 if(d.col&&TV.PALETA[d.col])S.col=d.col;if(d.dis)S.dis=d.dis;if(d.tam)S.tam=TV.tam(d.tam).id;if(d.fu)S.fu=TV.fuente(d.fu).id;if(d.bw===false)S.bw=false;
 if(d.tog)TOGS.forEach(t=>{$(t).checked=!!d.tog[t]});
}catch(e){buildOcasiones()}
if(!$('ocasion').options.length)buildOcasiones();
if(!$('frase').value.trim())$('frase').value=T.frase;lastDefault=T.frase;
buildDisenos();render();lucide.createIcons();
