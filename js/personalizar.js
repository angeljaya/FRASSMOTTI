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
/* v17 · Secreto y cápsula son opcionales: solo cuentan si su interruptor (secOn / capOn) está encendido */
const secOn=()=>$('secOn').checked,capOn=()=>$('capOn').checked;
const secMsg=()=>secOn()?v('secreto',240):'',clave=()=>secOn()?v('clave',20):'',pistas=()=>secOn()?['pista','pista2','pista3'].map(id=>v(id,60)).filter(Boolean).slice(0,TV.PISTAS_MAX||3):[];
const qL=()=>secOn()?v('qLock',80):'',aL=()=>secOn()?v('aLock',30):'',abre=()=>capOn()?$('abre').value:'';
const titulo=()=>v('titulo',14)||T.ti,palabra=()=>(v('palabra',9)||T.pa).toUpperCase().slice(0,9);
const mensaje=()=>clean($('frase').value,2600).trim()||T.frase;
const sello=()=>(v('sello',1)||v('nombre',24)||'C').charAt(0).toUpperCase();

/* ---------- Construcción de los selectores ---------- */
const HOLD={1:'Escribe algo tierno, corto y directo al corazón.',2:'Saluda, cuenta un recuerdo bonito y despídete con buenos deseos.',3:'Explayate: anécdotas, lo que sientes, lo que nunca dijiste. Se leerá página por página.'};
function buildOcasiones(){const l=S.g?TV.ocasiones(S.g):TV.T;if(!l.some(t=>t.id===T.id))T=l[0];$('ocasion').innerHTML=l.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');$('ocasion').value=T.id}
function buildDisenos(){const l=TV.disenos(G(),T.id);if(!l.some(d=>d.id===S.dis))S.dis=l[0].id;
 $('disenos').innerHTML=l.map(d=>`<button type="button" class="dchip" data-d="${d.id}" aria-pressed="${d.id===S.dis}">${d.n}</button>`).join('')}
$('gen').querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.g===S.g));$('tams').innerHTML=TV.TAMANOS.map(t=>`<button type="button" class="opt" data-t="${t.id}" aria-pressed="false"><span class="tag">${t.n} · ${t.sub}</span><b>${t.w}</b><small>${t.d}</small></button>`).join('');
$('cols').innerHTML=Object.entries(TV.PALETA).map(([k,p])=>`<button type="button" class="sw" data-col="${k}" aria-label="${p.n}" title="${p.n}" aria-pressed="false" style="background:${p.sw}"></button>`).join('');
$('fonts').innerHTML=TV.FUENTES.map(f=>`<button type="button" class="fchip" data-f="${f.id}" aria-pressed="false"><span style="font-family:${f.t}">Aa</span><small>${f.n}</small></button>`).join('');
let lastDefault='';

/* ---------- Foto ---------- */
function refreshPhoto(){S.photo=FOTO.st.img?FOTO.render(asp(),280):null;
 $('fotoBox').classList.toggle('hidden',!S.photo);if(S.photo)$('fotoThumb').src=S.photo;$('fotoThumb').style.filter=S.bw?'grayscale(1) contrast(1.1)':'none';
 $('fotoMode').querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.m==='bn')===S.bw))}$('foto').onchange=async e=>{const f=e.target.files[0];if(!f)return;
 try{await FOTO.load(f);$('fotoTxt').textContent=f.name;refreshPhoto();render();FOTO.edit(asp(),{bw:()=>S.bw,setBW:x=>{S.bw=x},done:()=>{refreshPhoto();render()}})}
 catch(err){$('fotoTxt').textContent=err.message;$('foto').value=''}};
$('fotoEdit').onclick=()=>FOTO.edit(asp(),{bw:()=>S.bw,setBW:x=>{S.bw=x},done:()=>{refreshPhoto();render()}});$('mCrop').addEventListener('click',e=>{if(e.target.id==='mCrop'||e.target.closest('[data-close]')){refreshPhoto();render()}});
$('fotoDel').onclick=()=>{FOTO.clear();S.photo=null;$('foto').value='';$('fotoTxt').textContent='Subir foto desde tu dispositivo';refreshPhoto();render()};$('fotoMode').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;S.bw=b.dataset.m==='bn';refreshPhoto();render();draft()};

/* ---------- Vista previa en vivo ---------- */
function render(){
 const n=v('nombre',24)||'Carla',de=v('deParte',24);
 const acc=TD.apply(document,{t:T,g:G(),dis:S.dis,col:S.col,fu:S.fu,v:window.MOTIVO||0});
 $('ejLink').href='r/tarjeta.html?nombre=Carla&t='+T.id+'&g='+G()+'&d='+TV.diseno(S.dis,G(),T.id).id+(S.col?'&color='+S.col:'')+'&fu='+S.fu+'&tam='+S.tam+'&ej=1';
 const tit=titulo(),pal=palabra();
 $('pvTit').textContent=tit;TD.titleFit($('pvTit'),tit);TV.letters($('pvLet'),pal);$('pvPat').innerHTML=Array(12).fill('<span>'+(tit+' '+pal).toUpperCase()+'</span>').join('');$('pvCap').textContent=n+(de?' · de '+de:'');
 $('pvAv').src=S.photo\vert{}\vert{}TV.avatar(1,n);$('pvAv').classList.toggle('color',!S.photo||!S.bw);
 TM.mount($('pvMsg'),mensaje(),S.tam);$('pvGift').style.display=(secOn()&&secMsg())?'':'none';
  $('pvSealL').textContent=sello();$('titulo').placeholder=T.ti;$('palabra').placeholder=T.pa;$('sello').placeholder=(v('nombre',24)||'C').charAt(0).toUpperCase();
 /* contador de palabras y estado de botones */
 const w=TM.count($('frase').value),tm=TV.tam(S.tam);$('wc').textContent=`${w} ${w===1?'palabra':'palabras'} · ${tm.n} (${tm.w})`;$('wc').classList.toggle('over',w>tm.max);
 document.querySelectorAll('[data-col]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.col===S.col));
 document.querySelectorAll('[data-f]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===S.fu));
 document.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.t===S.tam));
 $('gen').querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.g===S.g));
 $('genErr').textContent='';$('frase').placeholder=HOLD[S.tam];
}
document.querySelector('main').addEventListener('input',()=>{render();draft()});

/* Cambios de género / ocasión / diseño / tamaño / color / tipografía */
function applyDefaultText(prev){const f=$('frase');if(!f.value.trim()||f.value===prev)f.value=T.frase;lastDefault=T.frase}
$('gen').onclick=e=>{const b=e.target.closest('[data-g]');if(!b\vert{}\vert{}b.dataset.g===S.g)return;S.g=b.dataset.g;const prev=T.frase;buildOcasiones();applyDefaultText(prev);S.dis=null;buildDisenos();render();draft()};$('ocasion').onchange=()=>{const prev=T.frase;T=TV.find($('ocasion').value);window.MOTIVO=0;if(TV.SOLO[T.id]&&TV.SOLO[T.id].length===1)S.g=TV.SOLO[T.id][0];applyDefaultText(prev);S.dis=null;buildDisenos();render();draft()};$('disenos').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;S.dis=b.dataset.d;buildDisenos();render();draft()};
$('tams').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;S.tam=+b.dataset.t;refreshPhoto();render();draft()};$('fonts').onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;S.fu=b.dataset.f;render();draft()};
document.addEventListener('click',e=>{const c=e.target.closest('[data-col]');if(c){S.col=S.col===c.dataset.col?null:c.dataset.col;render();draft()}});

/* Confeti + nota de éxito suave (WebAudio, sin archivos) */
const boom=()=>confetti({particleCount:140,spread:80,origin:{y:.6},colors:[(S.col?TV.COLORS[S.col]:T.K.ac),'#111827','#fff'],disableForReducedMotion:true});
const chime=()=>TVS.chime();
$('pvCel').onclick=boom;

/* Minijuego: adivina el secreto */
const key=()=>clave().toLowerCase();
function reveal(){$('sLock').classList.add('hidden');$('sOpen').classList.remove('hidden');$('sMsg').textContent=secMsg()||'Aquí aparecerá tu mensaje secreto.';boom();chime()}
function paintHints(){const H=pistas();$('sHint').textContent=H.length?H.slice(0,S.shown).map((h,i)=>(H.length>1?'Pista '+(i+1)+': ':'Pista: ')+h).join('\n'):'Pista: tú ya sabes cuál es...';$('sMore').hidden=S.shown>=H.length}$('sMore').onclick=()=>{S.shown++;paintHints()};
$('pvGift').onclick=()=>{S.tries=0;S.shown=1;$('sGuess').value='';$('sErr').textContent='';paintHints();$('sOpen').classList.add('hidden');open('mSecret');
 if(!key()){reveal();return}$('sLock').classList.remove('hidden');setTimeout(()=>$('sGuess').focus(),150)};
function guess(){const g=$('sGuess').value.trim().toLowerCase();if(g&&g===key()){reveal();return}
 S.tries++;const k=clave().trim(),more=S.shown<pistas().length;if(more){S.shown++;paintHints()}
 $('sErr').textContent=S.tries>=3&&k?`Pista extra: empieza con "${k[0].toUpperCase()}" y tiene ${k.length} letras`:'Esa no es la clave. Intenta otra vez.'+(more?' Te damos otra pista.':'');
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
 if(secOn()&&!secMsg()){toast('Escribe el mensaje secreto o apaga "Adivina el secreto"');$('secreto').scrollIntoView({block:'center'});$('secreto').focus();return}
 if(!!qL()!==!!aL()){toast('El candado del sobre necesita pregunta y respuesta');$('qLock').scrollIntoView({block:'center'});return}
 if(capOn()&&!abre()){toast('Elige la fecha de entrega o apaga la cápsula del tiempo');$('abre').scrollIntoView({block:'center'});$('abre').focus();return}
 if(abre()&&!(Date.parse(abre())>Date.now())&&!confirm('La fecha de la cápsula ya pasó, así que no habrá bloqueo. ¿Continuar?'))return;
 if(secMsg()&&!clave()&&!confirm('Sin palabra secreta el mensaje se verá sin candado. ¿Continuar?'))return;open('mPay')};

function pedidoTexto(){const n=v('nombre',24),msg=mensaje(),r=FOTO.st.img?FOTO.rect(asp()):null,dis=TV.diseno(S.dis,G(),T.id);
 const enc=r?`modo=${S.bw?'bn':'color'}; zoom=${FOTO.st.z.toFixed(2)}; cx=${FOTO.st.cx.toFixed(3)}; cy=${FOTO.st.cy.toFixed(3)}`:'';
 return['*NUEVO PEDIDO - FRASSMOTTI*','---------------------',`Ocasión: ${T.name}`,`Plantilla: ${T.id}`,`Género: ${S.g==='h'?'Hombre':'Mujer'}`,`Diseño: ${dis.id}`,`Tamaño: ${S.tam}`,
  `Para: ${n}`,`De parte de: ${v('deParte',24)||'-'}`,`Título: ${titulo()}`,`Palabra: ${palabra()}`,`Frase: "${msg.replace(/\s+/g,' ').slice(0,70)}"`,`Mensaje (${TM.count(msg)} palabras): "${msg.replace(/\n+/g,' ¶ ')}"`,
  `Color: ${S.col||'según plantilla'}`,`Tipografía: ${S.fu}`,`Inicial del sello: ${sello()}`,
  `Mensaje secreto: "${secMsg()||'-'}"`,`Palabra clave: "${clave()||'(sin candado)'}"`,`Pista: "${pistas()[0]||'-'}"`,`Pista 2: "${pistas()[1]||'-'}"`,`Pista 3: "${pistas()[2]||'-'}"`,
  `Pregunta cerradura: "${qL()||'-'}"`,`Respuesta cerradura: "${aL()||'-'}"`,`Abre el: ${abre()||'-'}`,`Modo oficina: ${on('ofi')?'sí':'no'}`,
  `Foto: ${S.photo?'La envío por este chat (recortada)':'Sin foto'}`,...(S.photo?[`Encuadre foto: ${enc}`]:[]),'---------------------',
  `Mi WhatsApp: ${v('tel',20)||'-'}`,`Monto: ${TV.PRECIO} Bs por Yape`,'Adjunto mi comprobante de pago.',...(window.extraLines?extraLines():[])].join('\n')}

/* ----- AQUÍ COMIENZA LA MAGIA DE CLOUDFLARE Y EL LINK CORTO ----- */
$('send').onclick=async()=>{
  if(window.sinComprobante&&sinComprobante())return;
  
  $('send').disabled=true;
  const textoBotonOriginal = $('send').textContent;
  $('send').textContent = 'Generando link web...';
  
  try {
    // 1. Recopilar todos los datos de la tarjeta visual
    const datosTarjeta = {
      plantilla: T.id,
      genero: S.g,
      diseno: S.dis,
      tamano: S.tam,
      color: S.col,
      fuente: S.fu,
      nombre: v('nombre', 24),
      deParte: v('deParte', 24),
      titulo: titulo(),
      palabra: palabra(),
      frase: mensaje(),
      sello: sello(),
      secreto: secOn() ? secMsg() : '',
      clave: secOn() ? clave() : '',
      pistas: secOn() ? pistas() : [],
      qLock: secOn() ? qL() : '',
      aLock: secOn() ? aL() : '',
      abre: capOn() ? abre() : '',
      foto: FOTO.st.img ? FOTO.render(asp(), 900) : null,
      bw: S.bw
    };

    // 2. Enviar datos al Cloudflare Worker (cambia la URL a la tuya)
    const respuesta = await fetch("https://frassmotti.angelyujra97-7.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosTarjeta)
    });

    const resultado = await respuesta.json();

    if (resultado.success) {
      // 3. Crear el link corto usando el ID de KV
      const urlCorta = `${window.location.origin}/r/tarjeta.html?id=${resultado.id}`;
      
      // 4. Armar el mensaje final de WhatsApp (Texto original + URL)
      const textoFinal = pedidoTexto() + '\n\n💌 *Link de la tarjeta web:*\n' + urlCorta;
      
      // 5. Ejecutar la función original que abre WhatsApp y pasa el comprobante
      const ok = await (window.enviarPedido || (async t => { window.open(TV.wa(t), '_blank'); return true }))(textoFinal);
      
      if (ok !== false) shut('mPay');
    } else {
      toast("Error al guardar en el servidor. Intenta de nuevo.");
    }
  } catch (error) {
    console.error(error);
    toast("Error de red al generar la tarjeta.");
  } finally {
    $('send').disabled=false;
    $('send').textContent = textoBotonOriginal;
  }
};
/* ----------------------------------------------------------------- */

window.fotoParaEnviar=async()=>{if(!FOTO.st.img)return null;const u=FOTO.render(asp(),900),b=await (await fetch(u)).blob();return new File([b],'foto-recortada.jpg',{type:'image/jpeg'})};

/* ---------- Borrador automático (localStorage) ---------- */
const FIELDS=['ocasion','nombre','deParte','frase','secreto','clave','pista','pista2','pista3','tel','qLock','aLock','abre','titulo','palabra','sello'],TOGS=['ofi','secOn','capOn'];
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
 if(!d.tog||d.tog.secOn===undefined){if(d.secreto||d.clave||d.qLock)$('secOn').checked=true}   /* borradores anteriores a v17 */
 if(!d.tog||d.tog.capOn===undefined){if(d.abre)$('capOn').checked=true}
}catch(e){buildOcasiones()}
if(!$('ocasion').options.length)buildOcasiones();
if(!$('frase').value.trim())$('frase').value=T.frase;lastDefault=T.frase;

/* ---------- v17 · Secreto y cápsula opcionales: mostrar/ocultar sus campos, fechas rápidas y vista de la fecha ---------- */
const MESES={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11};
const pad2=n=>String(n).padStart(2,'0'),loc=d=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
function fechaOcasion(){const m=(T.fecha||'').match(/(\d+)(?:\s*y\s*\d+)?\s+de\s+([a-záéíóú]+)/i);if(!m||MESES[m[2].toLowerCase()]==null)return null;
 const n=new Date(),d=new Date(n.getFullYear(),MESES[m[2].toLowerCase()],+m[1],0,0);if(d<=n)d.setFullYear(d.getFullYear()+1);return d}
function syncExtras(){
 $('secBox').hidden=!secOn();$('capBox').hidden=!capOn();$('abre').min=loc(new Date());
 const q=[['Mañana 8:00',()=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(8,0,0,0);return d}],['En 1 semana',()=>{const d=new Date();d.setDate(d.getDate()+7);d.setHours(8,0,0,0);return d}]],fo=fechaOcasion();
 if(fo)q.push(['El '+T.fecha.replace(/\s*y\s*\d+/,''),()=>fo]);
 $('capQuick').innerHTML=q.map((x,i)=>`<button type="button" class="dchip" data-q="${i}">${x[0]}</button>`).join('');$('capQuick')._q=q;
 const v0=$('abre').value,t=v0?Date.parse(v0):NaN;
 $('capTxt').textContent=!capOn()?'':isNaN(t)?'Elige una fecha y hora para sellar la tarjeta.':t>Date.now()?'Se podrá abrir el '+new Date(t).toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' a las '+new Date(t).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'})+'.':'Esa fecha ya pasó: la tarjeta se abrirá de inmediato.'}
$('capQuick').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;$('abre').value=loc($('capQuick')._q[+b.dataset.q][1]());syncExtras();render();draft()});
['secOn','capOn'].forEach(id=>$(id).addEventListener('change',()=>{syncExtras();render();draft();if(id==='secOn'&&secOn())setTimeout(()=>$('secreto').focus(),50)}));
$('abre').addEventListener('input',syncExtras);$('ocasion').addEventListener('change',syncExtras);
syncExtras();buildDisenos();render();lucide.createIcons();