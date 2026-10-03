/* Personalizar v3: docking, foto real, minijuego del secreto y pago Yape + WhatsApp */
const Q=new URLSearchParams(location.search),$=id=>document.getElementById(id);
const S={col:null,photo:null,tries:0};
let T=TV.pick(Q.get('plantilla'));
document.querySelectorAll('.price').forEach(e=>e.textContent=TV.PRECIO);
$('ocasion').innerHTML=TV.T.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');$('ocasion').value=T.id;$('frase').value=T.frase;
$('cols').innerHTML=Object.entries(TV.COLORS).map(([k,v])=>`<button type="button" class="pick w-12 h-12" data-col="${k}" aria-label="${k}" aria-pressed="false"><span class="block w-full h-full rounded-[16px]" style="background:${v}"></span></button>`).join('');

/* Modales */
const open=id=>$(id).classList.add('open'),shut=id=>$(id).classList.remove('open');
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-close]'))m.classList.remove('open')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'))});

/* Preview en vivo */
function render(){
 const n=clean($('nombre').value,24)||'Carla',acc=S.col?TV.COLORS[S.col]:T.K.ac,de=clean($('deParte').value,24);
 TV.applyTheme(T,acc);$('ejLink').href='r/tarjeta.html?nombre=Carla&t='+T.id+'&ej=1';
 $('pvTit').textContent=T.ti;TV.letters($('pvLet'),T.pa);$('pvPat').innerHTML=Array(12).fill('<span>'+T.ti.toUpperCase()+' '+T.pa+'</span>').join('');
 $('pvCap').textContent=n+(de?' · de '+de:'');$('pvMsg').textContent=clean($('frase').value,70)||T.frase;$('pvAv').src=S.photo||(T.imgs&&TV.asset(T.imgs[window.MOTIVO||0]))||TV.avatar(1,n);$('pvAv').classList.toggle('color',!S.photo);
 document.querySelectorAll('[data-col]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.col===S.col));
}
document.querySelector('main').addEventListener('input',render);
$('ocasion').onchange=()=>{T=TV.find($('ocasion').value);$('frase').value=T.frase;render()};
document.addEventListener('click',e=>{const c=e.target.closest('[data-col]');if(c){S.col=S.col===c.dataset.col?null:c.dataset.col;render()}});

/* Foto real con FileReader (local, no se sube a ningún servidor) */
$('foto').onchange=e=>{const f=e.target.files[0];if(!f)return;
 if(!f.type.startsWith('image/')||f.size>8*1024*1024){$('fotoTxt').textContent='Elige una imagen de hasta 8 MB';return}
 const r=new FileReader();r.onload=()=>{S.photo=r.result;thumb(r.result);$('fotoTxt').textContent=f.name;$('fotoDel').classList.remove('hidden');render()};r.readAsDataURL(f)};
$('fotoDel').onclick=()=>{S.photo=null;S.thumb=null;$('foto').value='';$('fotoTxt').textContent='Subir foto desde tu dispositivo';$('fotoDel').classList.add('hidden');render()};

/* Confeti + nota de éxito suave (WebAudio, sin archivos) */
const boom=()=>confetti({particleCount:140,spread:80,origin:{y:.6},colors:[(S.col?TV.COLORS[S.col]:T.K.ac),'#111827','#fff'],disableForReducedMotion:true});
function chime(){try{const a=new(window.AudioContext||window.webkitAudioContext)();[523.25,659.25,783.99].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*.12;
 o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.9);o.connect(g).connect(a.destination);o.start(t);o.stop(t+1)})}catch(e){}}
$('pvCel').onclick=boom;

/* Minijuego: adivina el secreto */
const key=()=>clean($('clave').value,20).trim().toLowerCase();
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

/* Miniatura 96px de la foto: viaja dentro del link para que la tarjeta final muestre la foto real */
function thumb(src){const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=c.height=160,m=Math.min(i.width,i.height);c.getContext('2d').drawImage(i,(i.width-m)/2,(i.height-m)/2,m,m,0,0,160,160);S.thumb=c.toDataURL('image/jpeg',.55)};i.src=src}
const toast=m=>{$('toast').textContent=m;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2800)};
/* Pago -> WhatsApp */
$('pay').onclick=()=>{if(!clean($('nombre').value,24)){toast('Escribe el nombre de quien recibe la tarjetita');$('nombre').focus();$('nombre').scrollIntoView({block:'center'});return}
 if(!!clean($('qLock').value,80).trim()!==!!clean($('aLock').value,30).trim()){toast('La cerradura necesita pregunta y respuesta');$('qLock').scrollIntoView({block:'center'});return}
 if($('abre').value&&!(Date.parse($('abre').value)>Date.now())&&!confirm('La fecha de la cápsula ya pasó, así que no habrá bloqueo. ¿Continuar?'))return;
 if(clean($('secreto').value,240)&&!clean($('clave').value,20).trim()&&!confirm('Sin palabra clave el mensaje se verá sin candado. ¿Continuar?'))return;open('mPay')};
$('send').onclick=()=>{if(window.sinComprobante&&sinComprobante())return;const v=id=>clean($(id).value,240).trim(),n=v('nombre');
 const L=['*NUEVO PEDIDO - FRASSMOTTI*','---------------------',`Ocasión: ${T.name}`,`Plantilla: ${T.id}`,`Para: ${n}`,`De parte de: ${v('deParte')||'-'}`,`Frase: "${v('frase')||T.frase}"`,`Color: ${S.col||'según plantilla'}`,`Mensaje secreto: "${v('secreto')||'-'}"`,`Palabra clave: "${v('clave')||'(sin candado)'}"`,`Pista: "${v('pista')||'-'}"`,`Pregunta cerradura: "${v('qLock')||'-'}"`,`Respuesta cerradura: "${v('aLock')||'-'}"`,`Abre el: ${$('abre').value||'-'}`,`Modo oficina: ${$('ofi').checked?'sí':'no'}`,`Foto: ${S.photo?'La envío por este chat':'Sin foto'}`,'---------------------',`Mi WhatsApp: ${v('tel')||'-'}`,`Monto: ${TV.PRECIO} Bs por Yape`,'Adjunto mi comprobante de pago.',...(window.extraLines?extraLines():[])];
 shut('mPay');toast(S.photo?'Adjunta también tu foto y el comprobante en WhatsApp':'Adjunta tu comprobante en WhatsApp');(window.enviarPedido||(t=>window.open(TV.wa(t),'_blank')))(L.join('\n'))};
/* Borrador automático (localStorage) */
const FIELDS=['ocasion','nombre','deParte','frase','secreto','clave','pista','tel','qLock','aLock','abre'];
try{const d=JSON.parse(localStorage.getItem('tv_draft')||'{}');FIELDS.forEach(f=>{if(d[f]&&!(f==='ocasion'&&Q.get('plantilla')))$(f).value=d[f]});if(d.col)S.col=d.col;T=TV.find($('ocasion').value)}catch(e){}
document.querySelector('main').addEventListener('input',()=>{try{localStorage.setItem('tv_draft',JSON.stringify({...Object.fromEntries(FIELDS.map(f=>[f,$(f).value])),col:S.col}))}catch(e){}});
try{$('ofi').checked=localStorage.getItem('tv_ofi')==='1'}catch(e){}$('ofi').addEventListener('change',()=>{try{localStorage.setItem('tv_ofi',$('ofi').checked?'1':'0')}catch(e){}});
render();lucide.createIcons();
