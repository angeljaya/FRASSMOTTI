/* Funciones nuevas v12 (cada una se enciende en js/config.js > TV.FUNCIONES). Se carga al final de personalizar.html y r/tarjeta.html */
(function(){'use strict';
const g=id=>document.getElementById(id),main=document.querySelector('main'),fire=()=>main&&main.dispatchEvent(new Event('input',{bubbles:true}));
const base=location.href.replace(/[^\/?#]*([?#].*)?$/,'');

/* ---------- PERSONALIZAR ---------- */
if(g('pay')&&g('frase')){
 /* 1) Redactor local: frases y poemas prearmados por categoría */
 if(TV.on('redactor')){const FR=TV.FRASES,w=document.createElement('div'),last={};w.className='flex gap-2 flex-wrap items-center mt-2';
  w.innerHTML='<select id="fcat" class="input !w-auto !py-2 text-sm" aria-label="Categoría">'+Object.keys(FR).map(k=>`<option value="${k}">${FR[k].n}</option>`).join('')+'</select><button type="button" id="fgen" class="btn btn-ghost !py-2 text-sm">Sugerir frase</button><button type="button" id="fpoem" class="btn btn-ghost !py-2 text-sm">Poema para el secreto</button>';
  g('frase').insertAdjacentElement('afterend',w);
  const pick=(a,k)=>{let x;do{x=a[Math.floor(Math.random()*a.length)]}while(a.length>1&&x===last[k]);return last[k]=x},sel=()=>{if(FR[T.cat])g('fcat').value=T.cat};sel();g('ocasion').addEventListener('change',sel);
  g('fgen').onclick=()=>{g('frase').value=pick(FR[g('fcat').value].frases,'f');fire()};
  g('fpoem').onclick=()=>{g('secreto').value=pick(FR[g('fcat').value].poemas,'p');fire()}}
 /* 2) Motivos: 3 imágenes por fecha especial */
 {const box=document.createElement('div');box.className='hidden';box.innerHTML='<span class="label">Motivo (elige una imagen)</span><div class="grid grid-cols-3 gap-3" id="mvG"></div>';g('frase').closest('div').insertAdjacentElement('afterend',box);window.MOTIVO=0;
  const build=()=>{box.classList.toggle('hidden',!T.imgs);if(T.imgs)g('mvG').innerHTML=T.imgs.map((s,i)=>`<button type="button" class="pick p-1" data-mv="${i}" aria-pressed="${i===MOTIVO}"><img src="${s}" alt="Motivo ${i+1}" class="w-full aspect-[4/3] object-cover rounded-[16px]" onerror="this.parentNode.style.opacity=.35"></button>`).join('')};
  box.addEventListener('click',e=>{const b=e.target.closest('[data-mv]');if(b){window.MOTIVO=+b.dataset.mv;build();fire()}});g('ocasion').addEventListener('change',()=>{window.MOTIVO=0;build();fire()});
  g('pvAv').onerror=function(){this.onerror=null;this.src=TV.avatar(1,'Amigo')};build()}
 /* 3) Nota de voz real (micrófono, 10 s, baja tasa para que el link no sea enorme) */
 if(TV.on('voz')){const b=document.createElement('div');b.className='card p-6 space-y-3';
  b.innerHTML='<h3 class="serif text-2xl">Nota de voz</h3><p class="text-sm text-gray-600">Graba hasta 10 segundos. Sonará al abrir el sobre secreto.</p><div class="flex gap-2"><button type="button" id="vRec" class="btn btn-dark text-sm">Grabar</button><button type="button" id="vStop" class="btn btn-ghost text-sm" disabled>Detener</button></div><audio id="vAud" controls class="hidden w-full"></audio><a id="vDl" class="hidden text-sm underline text-gray-700">Descargar audio para enviarlo por WhatsApp</a><p id="vMsg" class="text-sm text-gray-600"></p>';
  g('pay').insertAdjacentElement('beforebegin',b);let mr,ch,tm;
  g('vRec').onclick=async()=>{try{const st=await navigator.mediaDevices.getUserMedia({audio:true}),mt=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t));
   mr=new MediaRecorder(st,Object.assign({audioBitsPerSecond:12000},mt?{mimeType:mt}:{}));ch=[];mr.ondataavailable=e=>ch.push(e.data);
   mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());clearTimeout(tm);const u=URL.createObjectURL(new Blob(ch,{type:mr.mimeType}));g('vAud').src=u;g('vAud').classList.remove('hidden');g('vDl').href=u;
    g('vDl').download='voz.'+(/mp4/.test(mr.mimeType)?'m4a':/ogg/.test(mr.mimeType)?'ogg':'webm');g('vDl').classList.remove('hidden');g('vStop').disabled=true;g('vRec').disabled=false;window.VOZ=true;g('vMsg').textContent='Listo. Envíanos este audio por WhatsApp junto a tu pedido.'};
   mr.start();g('vRec').disabled=true;g('vStop').disabled=false;g('vMsg').textContent='Grabando...';tm=setTimeout(()=>mr.state==='recording'&&mr.stop(),10000)}
   catch(e){g('vMsg').textContent='No se pudo usar el micrófono (revisa permisos; el sitio debe usar HTTPS).'}};
  g('vStop').onclick=()=>mr&&mr.state==='recording'&&mr.stop()}
 /* 4) Grupo: casilla + link de invitación */
 if(TV.on('grupo')){const l=document.createElement('label');l.className='flex gap-3 text-sm text-gray-700';l.innerHTML='<input id="grupoOn" type="checkbox" class="w-5 h-5 mt-0.5"><span><b>Tarjeta de grupo:</b> tus amigos podrán sumar su foto y frase. Te damos un link para invitarlos.</span>';g('pay').insertAdjacentElement('beforebegin',l)}
 /* Líneas extra del pedido de WhatsApp (las lee personalizar.js) */
 window.extraLines=()=>{const L=[];if(T.imgs)L.push('Motivo: '+((window.MOTIVO||0)+1));
  if(g('grupoOn')&&g('grupoOn').checked){const n=clean(g('nombre').value,24),c=(n.toLowerCase().replace(/[^a-z0-9]/g,'')||'grupo')+'-'+Math.floor(100+Math.random()*900),url=base+'grupo.html?c='+c+'&para='+encodeURIComponent(n);L.push('Grupo: '+c);
   let b=g('invBox');if(!b){b=document.createElement('div');b.id='invBox';b.className='card p-5 space-y-2';g('pay').insertAdjacentElement('afterend',b)}
   b.innerHTML='<p class="font-semibold text-gray-900">Link para invitar a tus amigos</p><input class="input" readonly value="'+url+'"><button type="button" class="btn btn-dark text-sm">Copiar link</button>';b.querySelector('button').onclick=e=>{navigator.clipboard.writeText(url);e.target.textContent='Copiado'}}
  if(window.VOZ)L.push('Nota de voz: La envío por este chat');return L}
}

/* ---------- TARJETA: mensajes del grupo ---------- */
if(typeof PL!=='undefined'&&Array.isArray(PL.g)&&PL.g.length&&g('dock')){
 const b=document.createElement('button'),m=document.createElement('div');b.className='pill';b.innerHTML='<i data-lucide="users"></i>Grupo ('+PL.g.length+')';g('dock').prepend(b);
 m.className='modal';m.innerHTML='<div class="card p-6 w-full max-w-sm relative max-h-[85vh] overflow-y-auto"><button data-x class="absolute top-4 right-4 text-gray-600 text-xl" aria-label="Cerrar">&times;</button><h3 class="serif text-3xl mb-4">Mensajes del grupo</h3><div id="gL" class="space-y-4"></div></div>';document.body.append(m);
 m.onclick=e=>{if(e.target===m||e.target.closest('[data-x]'))m.classList.remove('open')};
 PL.g.forEach(x=>{const r=document.createElement('div'),i=document.createElement('img'),d=document.createElement('div'),n=document.createElement('p'),f=document.createElement('p');r.className='flex gap-3 items-start';i.className='w-14 h-14 rounded-full object-cover bg-gray-100 flex-none';
  i.src=(x.p&&String(x.p).startsWith('data:image/'))?x.p:TV.avatar(1,x.n||'Amigo');n.className='font-semibold';n.textContent=clean(x.n,24);f.className='text-gray-700';f.textContent=clean(x.f,120);d.append(n,f);r.append(i,d);g('gL').append(r)});
 b.onclick=()=>{if(typeof PAID!=='undefined'&&!PAID){toast(LOCK);return}m.classList.add('open')};try{lucide.createIcons()}catch(e){}}
})();
