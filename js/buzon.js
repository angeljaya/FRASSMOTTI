/* Buzón de pedidos v1. Cifra el pedido en el navegador (AES-GCM + llave pública RSA-OAEP de TV.PEDIDOS_PUBKEY) y lo guarda en /api/pedido.
   En el chat de WhatsApp solo viaja un código (ej. K7F2-9QXA). La llave privada vive solo en el admin (IndexedDB de tu dispositivo).
   Se usa en personalizar.html (envío del cliente) y en admin.html (abrir pedidos). Si TV.BUZON es false o falta la llave pública, todo sigue como antes. */
(function(){'use strict';
const te=new TextEncoder(),td=new TextDecoder(),S=crypto.subtle;
const b64=u=>{let s='';const a=new Uint8Array(u);for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode.apply(null,a.subarray(i,i+8192));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const RSA={name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},ALG={name:'RSA-OAEP',hash:'SHA-256'};
/* cifrar / abrir */
async function seal(pubJwk,obj){const pub=await S.importKey('jwk',pubJwk,ALG,false,['encrypt']),ak=await S.generateKey({name:'AES-GCM',length:256},true,['encrypt']),iv=crypto.getRandomValues(new Uint8Array(12));
 const c=await S.encrypt({name:'AES-GCM',iv},ak,te.encode(JSON.stringify(obj))),k=await S.encrypt({name:'RSA-OAEP'},pub,await S.exportKey('raw',ak));
 return{k:b64(k),i:b64(iv),c:b64(c)}}
async function open(priv,b){const raw=await S.decrypt({name:'RSA-OAEP'},priv,unb64(b.k)),ak=await S.importKey('raw',raw,'AES-GCM',false,['decrypt']);
 return JSON.parse(td.decode(await S.decrypt({name:'AES-GCM',iv:unb64(b.i)},ak,unb64(b.c))))}
/* llaves (admin): se crean una vez; la privada se muestra UNA vez para respaldarla y luego se guarda NO extraíble en IndexedDB */
async function genPair(){const p=await S.generateKey(RSA,true,['encrypt','decrypt']);return{pub:await S.exportKey('jwk',p.publicKey),priv:await S.exportKey('jwk',p.privateKey)}}
const privFrom=j=>S.importKey('jwk',j,ALG,false,['decrypt']);
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('frass_buzon',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const kget=async()=>{const d=await idb();return new Promise((ok,no)=>{const q=d.transaction('k').objectStore('k').get('priv');q.onsuccess=()=>ok(q.result||null);q.onerror=()=>no(q.error)})};
const kset=async k=>{const d=await idb();return new Promise((ok,no)=>{const t=d.transaction('k','readwrite');t.objectStore('k').put(k,'priv');t.oncomplete=()=>ok();t.onerror=()=>no(t.error)})};
window.BZ={seal,open,genPair,privFrom,kget,kset};

/* ---------- Cliente (solo en personalizar.html: existe pago.js con enviarPedido) ---------- */
if(typeof TV==='undefined'||!TV.BUZON||!TV.PEDIDOS_PUBKEY||typeof window.enviarPedido!=='function'||!document.getElementById('send'))return;
const g=id=>document.getElementById(id),tst=m=>{try{toast(m)}catch(e){}};
const prevSin=window.sinComprobante;let P=null;   /* P = {code,tok} del pedido ya enviado (para "Cambiar algo" en esta misma visita) */
const rnd=()=>b64(crypto.getRandomValues(new Uint8Array(18))).replace(/\+/g,'-').replace(/\//g,'_');
const toDataUrl=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)});
/* Interfaz extra, creada desde aquí para no tocar el HTML */
g('send').insertAdjacentHTML('afterend','<p class="text-xs text-gray-600 mt-3 leading-snug">🔒 Tu mensaje no se envía por chat: viaja cifrado y queda guardado de forma segura. Solo lo reviso yo para armar tu tarjeta y no lo comparto con nadie. Revisamos los pedidos para evitar contenido ofensivo o peligroso.</p>');
const sub=document.querySelector('#okEnvio .ok-sub'),btns=document.querySelector('#okEnvio .ok-btns');
if(sub)sub.insertAdjacentHTML('afterend','<p id="okCode" class="hidden" style="margin:.6rem 0;font-weight:700;letter-spacing:.08em"></p>');
if(btns)btns.insertAdjacentHTML('afterbegin','<button type="button" id="okEdit" class="btn ok-home hidden">Cambiar algo de mi tarjeta</button>');
if(g('okEdit'))g('okEdit').onclick=()=>{g('okEnvio').classList.remove('open');tst('Haz tus cambios y vuelve a enviar: reemplazamos tu pedido con el mismo código.')};
/* Turnstile opcional (TV.TURNSTILE_SITEKEY) */
const turn=()=>!TV.TURNSTILE_SITEKEY?Promise.resolve(''):new Promise(ok=>{let done=false;const fin=t=>{if(!done){done=true;ok(t||'')}};setTimeout(fin,15000);
 const go=()=>{const d=document.createElement('div');d.style.cssText='position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:400';document.body.append(d);
  window.turnstile.render(d,{sitekey:TV.TURNSTILE_SITEKEY,appearance:'interaction-only',callback:t=>{fin(t);setTimeout(()=>d.remove(),600)},'error-callback':()=>{fin('');d.remove()}})};
 if(window.turnstile)go();else{const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.onload=go;s.onerror=()=>fin('');document.head.append(s)}});
window.sinComprobante=()=>{if(P&&!(g('comp').files[0]))return false;return prevSin?prevSin():false};   /* al "Cambiar algo" no pide otra captura */
window.enviarPedido=async text=>{
 const f=g('comp').files[0],fo=g('formato'),id=(fo&&fo.value)||'digital',o=fo&&fo.selectedOptions[0],fmt=o?o.dataset.n:'Tarjeta virtual',monto=TV.precio(id)||TV.PRECIO,
  oc=((g('ocasion')||{}).selectedOptions||[{}])[0].textContent||'';
 window.__waBlocked=false;
 let ph=null;try{const x=window.fotoParaEnviar?await window.fotoParaEnviar():null;if(x)ph=await toDataUrl(x)}catch(e){}
 let sealed;try{sealed=await BZ.seal(TV.PEDIDOS_PUBKEY,{v:1,t:text,p:ph})}catch(e){tst('Tu navegador no puede cifrar el pedido. Actualízalo o escríbenos por WhatsApp.');return false}
 const post=async(code,tok)=>{const r=await fetch('/api/pedido',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({b:sealed,m:{oc,fmt,monto},tok,code,ts:await turn()})});return{r,d:await r.json().catch(()=>({}))}};
 let tok=P?P.tok:rnd(),q,upd=!!P;
 try{q=await post(P&&P.code,tok);if(q.r.status===404&&P){P=null;upd=false;tok=rnd();q=await post(undefined,tok)}}catch(e){tst('Sin conexión. Revisa tu internet e inténtalo otra vez.');return false}
 if(!q.r.ok||!q.d.code){tst(q.d.error||'No se pudo guardar tu pedido. Inténtalo otra vez.');return false}
 P={code:q.d.code,tok};
 const msg='Pedido '+P.code+' · '+oc+' · '+fmt+' · Bs '+monto+(upd?' (actualizado)':'');
 if(g('okCode')){g('okCode').textContent='Tu código: '+P.code;g('okCode').classList.remove('hidden')}if(g('okEdit'))g('okEdit').classList.remove('hidden');
 window.__waUrl=TV.wa(msg);
 if(f){try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:msg});tst('Elige WhatsApp y el contacto FRASSMOTTI (+591 '+TV.WHATSAPP.slice(3)+')');return true}}
  catch(e){window.__waBlocked=true;return true}}   /* canceló el menú Compartir: el pedido ya está guardado, se ofrece el botón de WhatsApp */
 const w=window.open(window.__waUrl,'_blank');window.__waBlocked=!w;tst(f?'Adjunta la captura de tu comprobante en el chat':'Listo: avisamos por WhatsApp que cambiaste tu pedido');return true};
})();
