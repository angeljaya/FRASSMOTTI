/* Tutorial interactivo v18: "Tu regalo, paso a paso" (de la tarjeta digital al accesorio en tu casa).
   Slider deslizable (scroll-snap) con 8 pasos, ilustraciones SVG animadas y textos cercanos.
   Es un módulo independiente: llena <section id="tutorial"> de index.html. Si borras este archivo, el sitio queda igual.
   Todo lo editable está arriba: TV.TUTORIAL en js/config.js (activo, entrega) y los textos en la lista PASOS. */
(function(){
'use strict';
const host=document.getElementById('tutorial');
if(!host||typeof TV==='undefined')return;
const CFG=Object.assign({activo:true,entrega:''},TV.TUTORIAL||{});
if(CFG.activo===false){host.remove();return}

const e=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ====== Accesorios (se leen de TV.FISICOS; si falta, usa estos) ====== */
const BASE=[{id:'llavero',name:'Llavero acrílico'},{id:'collar',name:'Collar con QR'},{id:'manilla',name:'Manilla con QR'}];
const FIS=((TV.FISICOS||[]).filter(f=>f.activo!==false).length?TV.FISICOS.filter(f=>f.activo!==false):BASE).map(f=>({id:f.id,name:f.name}));
/* Frase emocional por accesorio (psicología: lo tangible se queda y se vuelve recuerdo) */
const EMO={
 llavero:{corto:'Va a todas partes con esa persona.',largo:'Un llavero acompaña cada día: en las llaves, en la mochila, en la rutina. Cada vez que lo vea, te recordará.'},
 collar:{corto:'Cerca del corazón, justo donde importa.',largo:'Un collar se lleva pegado al pecho, cerca del corazón. Es un mensaje que abraza sin hacer ruido.'},
 manilla:{corto:'En la muñeca, siempre a la vista.',largo:'Una manilla se queda en la muñeca, siempre a la vista. Un detalle pequeño que se vuelve parte de esa persona.'}
};
const emo=id=>EMO[id]||{corto:'Un recuerdo que se puede tocar.',largo:'Un accesorio que se toca, se lleva y se guarda: un recuerdo que se queda cuando tú no estás.'};
let sel=0;

/* ====== Ilustraciones SVG (viewBox 320x240) ====== */
const QR=(x,y,s,n,seed)=>{const c=s/n,F=(a,b)=>(a<3&&b<3)||(a>n-4&&b<3)||(a<3&&b>n-4);let r=seed,h='';
 for(let b=0;b<n;b++)for(let a=0;a<n;a++){r=(r*9301+49297)%233280;if(F(a,b)||r%100<46)h+=`<rect x="${(x+a*c).toFixed(1)}" y="${(y+b*c).toFixed(1)}" width="${(c+.25).toFixed(2)}" height="${(c+.25).toFixed(2)}"/>`}
 return `<g fill="#111827">${h}</g>`};
const ACC={ /* cada uno se dibuja en una caja de 100 de ancho; h = alto */
 llavero:{h:122,svg:q=>`<circle cx="50" cy="13" r="12" fill="none" stroke="#a8a29e" stroke-width="3"/><path d="M50 25v11" stroke="#a8a29e" stroke-width="3"/><rect x="16" y="36" width="68" height="84" rx="13" fill="rgba(255,255,255,.13)" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/><rect x="27" y="54" width="46" height="46" rx="4" fill="#fff"/>${QR(30,57,40,9,q)}`},
 collar:{h:112,svg:q=>`<path d="M6 4Q50 104 94 4" fill="none" stroke="#d4af37" stroke-width="2.6" stroke-linecap="round"/><circle cx="50" cy="55" r="4" fill="none" stroke="#d4af37" stroke-width="2.2"/><rect x="25" y="59" width="50" height="50" rx="9" fill="#fff" stroke="#d4af37" stroke-width="3"/>${QR(32,66,36,9,q)}`},
 manilla:{h:90,svg:q=>`<rect x="4" y="12" width="92" height="64" rx="32" fill="none" stroke="#2a3142" stroke-width="14"/><rect x="4" y="12" width="92" height="64" rx="32" fill="none" stroke="rgba(212,175,55,.5)" stroke-width="1.2"/><rect x="28" y="22" width="44" height="44" rx="6" fill="#fff" stroke="#d4af37" stroke-width="3"/>${QR(33,27,34,9,q)}`}
};
const acc=(id,cx,cy,s,seed,cls)=>{const a=ACC[id]||ACC.llavero;return `<g class="${cls||''}"><g transform="translate(${(cx-50*s).toFixed(1)} ${(cy-a.h/2*s).toFixed(1)}) scale(${s})">${a.svg(seed)}</g></g>`};
const star=(x,y,s,d)=>`<path class="t-tw" style="animation-delay:${d}s" transform="translate(${x} ${y}) scale(${s})" d="M0-10C1.5-3 3-1.5 10 0 3 1.5 1.5 3 0 10-1.5 3-3 1.5-10 0-3-1.5-1.5-3 0-10Z" fill="#ffe29f"/>`;
const heart=(x,y,s,c)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 6C-9-1-9-9-3-9 0-9 0-6 0-5 0-6 0-9 3-9 9-9 9-1 0 6Z" fill="${c||'#FF4D5A'}"/>`;
const phone=(x,y,w,h,screen)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#0b0f18" stroke="#2a3142" stroke-width="3"/><rect x="${x+7}" y="${y+10}" width="${w-14}" height="${h-20}" rx="11" fill="${screen||'#f5f4f0'}"/><rect x="${x+w/2-14}" y="${y+4}" width="28" height="3.5" rx="2" fill="#2a3142"/>`;
const ART={
 /* 1 · la persona: sobre con sello y corazón */
 1:()=>`<ellipse cx="160" cy="214" rx="96" ry="9" fill="rgba(0,0,0,.4)"/>
  <rect x="70" y="100" width="180" height="108" rx="10" fill="#1d2433" stroke="rgba(255,255,255,.16)"/>
  <g class="t-fl"><rect x="96" y="62" width="128" height="86" rx="6" fill="#f5f4f0" transform="rotate(-3 160 105)"/><rect x="112" y="80" width="62" height="6" rx="3" fill="#cfcfc9" transform="rotate(-3 160 105)"/><rect x="112" y="94" width="96" height="5" rx="2.5" fill="#dcdcd6" transform="rotate(-3 160 105)"/><rect x="112" y="106" width="80" height="5" rx="2.5" fill="#dcdcd6" transform="rotate(-3 160 105)"/>${heart(196,128,1.1)}</g>
  <path d="M70 208L140 150M250 208L180 150" stroke="rgba(255,255,255,.12)" stroke-width="2"/><path d="M70 104L160 166 250 104" fill="#263047" stroke="rgba(255,255,255,.16)" stroke-linejoin="round"/>
  <g class="t-pop"><circle cx="160" cy="166" r="19" fill="url(#tgw)"/><circle cx="160" cy="166" r="13" fill="none" stroke="#d4af37" stroke-width="1.3" stroke-dasharray="3 2.6"/>${heart(160,168,1.2,'#ffe29f')}</g>
  ${star(58,64,.9,0)}${star(262,56,1.1,.7)}${star(246,176,.7,1.3)}${star(40,150,.6,.4)}${heart(160,38,1.5)}`,
 /* 2 · personalizar: teléfono con la tarjeta */
 2:()=>`${phone(104,12,112,216)}
  <text x="160" y="55" text-anchor="middle" font-family="Kalam,cursive" font-weight="700" font-size="19" fill="#b31010">Feliz</text>
  ${[0,1,2,3,4].map(i=>`<circle cx="${130+i*15}" cy="71" r="7.3" fill="#fff" stroke="#e5e5e0"/><rect x="${127.5+i*15}" y="68.5" width="5" height="5" rx="1" fill="#555"/>`).join('')}
  <rect x="126" y="86" width="68" height="74" fill="#fff" stroke="#e5e5e0" transform="rotate(2 160 123)"/><rect x="131" y="91" width="58" height="52" fill="#9ca3af" transform="rotate(2 160 123)"/><circle cx="160" cy="111" r="10" fill="#e5e7eb" transform="rotate(2 160 123)"/><path d="M138 143c3-14 11-18 22-18s19 4 22 18z" fill="#e5e7eb" transform="rotate(2 160 123)"/>
  <rect class="t-ty" x="130" y="172" width="60" height="5" rx="2.5" fill="#444"/><rect class="t-ty" style="animation-delay:.6s" x="136" y="184" width="48" height="5" rx="2.5" fill="#666"/>
  <g class="t-pop"><circle cx="196" cy="198" r="12" fill="#d4af37"/><rect x="190.5" y="197" width="11" height="8" rx="1.8" fill="#1a1205"/><path d="M192.5 197v-3a3.5 3.5 0 017 0v3" fill="none" stroke="#1a1205" stroke-width="1.6"/></g>
  <g class="t-wr"><rect x="238" y="64" width="12" height="70" rx="3" fill="#ffe29f" transform="rotate(32 244 99)"/><path d="M213 148l8-18 8 5z" fill="#f5d6a0" transform="translate(32 -11) rotate(32 244 99)"/></g>
  <g class="t-fl"><rect x="36" y="86" width="44" height="40" rx="9" fill="#1d2433" stroke="rgba(255,255,255,.2)"/><circle cx="50" cy="100" r="4.5" fill="#ffe29f"/><path d="M42 118l10-10 7 7 6-5 8 8z" fill="#7a86a0"/></g>
  ${star(268,190,.9,.2)}${star(48,176,.7,.9)}`,
 /* 3 · elegir accesorio */
 3:()=>{const pos=[60,160,260];return FIS.slice(0,3).map((f,i)=>{const on=i===sel,x=FIS.length===3?pos[i]:(FIS.length===2?[100,220][i]:160);
  return `<g class="t-it${on?' on':''}">${on?`<circle cx="${x}" cy="108" r="64" fill="url(#tgg)" class="t-pop"/>`:''}${acc(f.id,x,108,on?1.12:.82,7+i*6,on?'t-fl':'')}<text x="${x}" y="206" text-anchor="middle" font-family="Outfit,sans-serif" font-size="12.5" font-weight="${on?600:400}" fill="${on?'#ffe29f':'rgba(255,255,255,.55)'}">${e(f.name.split(' ')[0])}</text></g>`}).join('')+star(160,24,1,0)+star(40,40,.7,.8)+star(290,34,.8,1.4)},
 /* 4 · pagar con Yape */
 4:()=>`${phone(104,12,112,216,'#f3f0ff')}
  <rect x="116" y="30" width="88" height="22" rx="8" fill="#6b2fb3"/><text x="160" y="45" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="600" font-size="11" fill="#fff">Pago por QR</text>
  <rect x="124" y="64" width="72" height="72" rx="8" fill="#fff" stroke="#ddd6fe"/>${QR(130,70,60,13,31)}
  <rect x="124" y="150" width="72" height="26" rx="13" fill="#6b2fb3"/><text x="160" y="167" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="600" font-size="11" fill="#fff">Pagar</text>
  <g class="t-pop" style="animation-delay:.5s"><circle cx="206" cy="196" r="17" fill="#22a06b" stroke="#0b0f18" stroke-width="3"/><path d="M198 196l6 6 11-12" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>
  <g class="t-sl"><rect x="232" y="64" width="62" height="96" rx="7" fill="#fff"/><rect x="241" y="76" width="30" height="5" rx="2.5" fill="#d1d5db"/><rect x="241" y="88" width="44" height="4" rx="2" fill="#e5e7eb"/><rect x="241" y="98" width="38" height="4" rx="2" fill="#e5e7eb"/><rect x="241" y="108" width="44" height="4" rx="2" fill="#e5e7eb"/><circle cx="263" cy="136" r="10" fill="#22a06b"/><path d="M258 136l4 4 7-8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>
  <g class="t-fl"><circle cx="52" cy="104" r="22" fill="url(#tgw2)"/><circle cx="52" cy="104" r="16" fill="none" stroke="rgba(120,80,0,.5)"/><text x="52" y="109" text-anchor="middle" font-family="Outfit,sans-serif" font-weight="700" font-size="13" fill="#5a3b00">Bs</text></g>${star(60,176,.7,.5)}${star(278,40,.8,1)}`,
 /* 5 · WhatsApp */
 5:()=>`<rect x="38" y="18" width="244" height="204" rx="18" fill="#0f1a17" stroke="rgba(255,255,255,.14)"/><rect x="38" y="18" width="244" height="34" rx="18" fill="#12261f"/><rect x="38" y="36" width="244" height="16" fill="#12261f"/><circle cx="62" cy="35" r="8.5" fill="#25D366"/><rect x="78" y="31" width="70" height="7" rx="3.5" fill="rgba(255,255,255,.4)"/>
  <g class="t-in" style="animation-delay:.1s"><rect x="104" y="66" width="164" height="40" rx="12" fill="#1f6f4a"/><text x="116" y="83" font-family="Outfit,sans-serif" font-size="11.5" fill="#fff">Mi pedido y mi</text><text x="116" y="97" font-family="Outfit,sans-serif" font-size="11.5" fill="#fff">comprobante</text><path d="M244 98l4 4 7-8M251 98l4 4 7-8" fill="none" stroke="#7dd3fc" stroke-width="1.7" stroke-linecap="round"/></g>
  <g class="t-in" style="animation-delay:.9s"><rect x="52" y="118" width="178" height="40" rx="12" fill="#263047"/><text x="64" y="135" font-family="Outfit,sans-serif" font-size="11.5" fill="#fff">Pago confirmado. Aquí</text><text x="64" y="149" font-family="Outfit,sans-serif" font-size="11.5" fill="#fff">está tu link mágico</text></g>
  <g class="t-in" style="animation-delay:1.7s"><rect x="52" y="168" width="130" height="34" rx="12" fill="#3a2a10" stroke="#d4af37"/>${star(70,185,.8,0)}<rect x="84" y="178" width="84" height="6" rx="3" fill="#ffe29f"/><rect x="84" y="189" width="56" height="5" rx="2.5" fill="rgba(255,226,159,.55)"/></g>
`,
 /* 6 · grabado del accesorio (dinámico) */
 6:()=>`<ellipse cx="160" cy="218" rx="80" ry="8" fill="rgba(0,0,0,.4)"/>${acc(FIS[sel]?FIS[sel].id:'llavero',160,122,1.55,13)}
  <polygon class="t-bm" points="160,14 108,196 212,196" fill="url(#tgb)"/><rect x="146" y="4" width="28" height="14" rx="4" fill="#2a3142" stroke="rgba(255,255,255,.25)"/><circle cx="160" cy="18" r="3.4" fill="#FF4D5A"/>
  <g class="t-sw"><rect x="86" y="0" width="148" height="3" rx="1.5" fill="#FF4D5A"/><rect x="86" y="-4" width="148" height="11" rx="5" fill="#FF4D5A" opacity=".25"/></g>
  <circle class="t-sp" cx="104" cy="120" r="2.4" fill="#ffe29f"/><circle class="t-sp" style="animation-delay:.3s" cx="222" cy="90" r="2" fill="#ffe29f"/><circle class="t-sp" style="animation-delay:.6s" cx="214" cy="170" r="2.6" fill="#ffe29f"/><circle class="t-sp" style="animation-delay:.9s" cx="110" cy="168" r="2" fill="#ffe29f"/>`,
 /* 7 · llega a casa (dinámico) */
 7:()=>`<line x1="20" y1="206" x2="300" y2="206" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
  <path d="M30 70C90 20 150 60 150 150" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2" stroke-dasharray="5 6" class="t-ds"/><circle r="5" fill="#FF4D5A"><animateMotion dur="3.4s" repeatCount="indefinite" path="M30 70C90 20 150 60 150 150"/></circle>
  <g><polygon points="212,128 250,98 288,128" fill="#8b1a2b"/><rect x="218" y="128" width="64" height="78" fill="#1d2433" stroke="rgba(255,255,255,.14)"/><rect x="242" y="164" width="16" height="42" rx="2" fill="#0b0f18"/><rect x="226" y="140" width="14" height="14" rx="2" fill="#ffe29f" opacity=".9"/><rect x="260" y="140" width="14" height="14" rx="2" fill="#ffe29f" opacity=".9"/>${heart(250,118,1.1,'#ffe29f')}</g>
  <g class="t-bo"><rect x="104" y="158" width="64" height="48" rx="4" fill="#c79a5b"/><rect x="104" y="158" width="64" height="12" rx="3" fill="#ddb274"/><rect x="132" y="158" width="8" height="48" fill="#d4af37"/><path d="M136 158c-14-14-24-2-14 4M136 158c14-14 24-2 14 4" fill="none" stroke="#d4af37" stroke-width="3.4" stroke-linecap="round"/></g>
  ${acc(FIS[sel]?FIS[sel].id:'llavero',136,124,.5,19,'t-fl')}${star(190,60,.9,.3)}${star(62,150,.7,1)}${star(300,60,.7,.6)}`,
 /* 8 · la sorpresa: escanear (dinámico) */
 8:()=>`${Array.from({length:14},(_,i)=>`<rect class="t-cf" style="animation-delay:${(i*.23).toFixed(2)}s" x="${14+i*22}" y="-6" width="6" height="10" rx="1.5" fill="${['#FF4D5A','#ffe29f','#7dd3fc','#a7f3d0','#fff'][i%5]}"/>`).join('')}
  ${acc(FIS[sel]?FIS[sel].id:'llavero',78,134,.95,23,'t-fl')}
  <g class="t-ar"><path d="M128 100a42 42 0 010 68" fill="none" stroke="#ffe29f" stroke-width="3" stroke-linecap="round"/></g><g class="t-ar" style="animation-delay:.25s"><path d="M142 88a60 60 0 010 92" fill="none" stroke="#ffe29f" stroke-width="3" stroke-linecap="round"/></g><g class="t-ar" style="animation-delay:.5s"><path d="M156 76a78 78 0 010 116" fill="none" stroke="#ffe29f" stroke-width="3" stroke-linecap="round"/></g>
  ${phone(196,38,92,170,'#1d2433')}<g class="t-pop"><rect x="214" y="102" width="56" height="40" rx="5" fill="#f5f4f0"/>${heart(242,124,1.7)}<path d="M210 96L242 80 274 96" fill="#263047" stroke="rgba(255,255,255,.2)"/><circle cx="242" cy="96" r="7" fill="url(#tgw)"/></g>
  <rect x="216" y="168" width="52" height="5" rx="2.5" fill="rgba(255,255,255,.3)"/><rect x="222" y="180" width="40" height="5" rx="2.5" fill="rgba(255,255,255,.18)"/>${star(44,40,.8,.5)}`
};
const DEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
 <radialGradient id="tgw" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#c8283a"/><stop offset=".7" stop-color="#6e000a"/><stop offset="1" stop-color="#2a0003"/></radialGradient>
 <radialGradient id="tgw2" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff1c1"/><stop offset=".6" stop-color="#d4af37"/><stop offset="1" stop-color="#7a560c"/></radialGradient>
 <radialGradient id="tgg"><stop offset="0" stop-color="rgba(212,175,55,.34)"/><stop offset="1" stop-color="rgba(212,175,55,0)"/></radialGradient>
 <linearGradient id="tgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,77,90,.55)"/><stop offset="1" stop-color="rgba(255,77,90,0)"/></linearGradient></defs></svg>`;

/* ====== Textos de los 8 pasos (cercanía + psicología: calma, anticipación, lo tangible, acompañamiento) ====== */
const A=()=>FIS[sel]||FIS[0]||BASE[0];
const nom=()=>A().name.split(' ')[0].toLowerCase();   /* 'Collar con QR' -> 'collar' */
const PASOS=[
 {k:'Paso 1 · Empieza por la persona',t:'Piensa en su cara cuando lo abra',feel:'Ese instante ya es tuyo.',
  p:()=>'Antes de tocar nada, cierra los ojos un segundo e imagina su sonrisa. Esa imagen es tu brújula. Elige el momento que mejor la represente: un cumpleaños, un "te quiero" que llevas tiempo guardando, un gracias que nunca encontró su día. No existe una opción equivocada; lo único que importa es que salga de ti.',
  tip:()=>'No necesitas escribir bonito ni entender de tecnología. Nosotros ponemos la magia; tú pones el corazón.'},
 {k:'Paso 2 · Hazla tuya',t:'Ponle tu voz',feel:'Las palabras sencillas son las que más se recuerdan.',
  p:()=>'Escribe su nombre, una frase que suene a ti y, si quieres, sube una foto que les saque una sonrisa a los dos. ¿Te late un toque de misterio? Esconde un mensaje con candado que solo abre quien adivine la clave, o programa una cápsula del tiempo para que se abra justo en su día. Mientras escribes, ves tu tarjeta cobrar vida, así que nada te sorprende después.',
  tip:()=>'Si te bloqueas, imagina que se lo dices en voz baja, mirándole a los ojos. Escríbelo tal cual.'},
 {k:'Paso 3 · Elige cómo llega',t:'Un link emociona. Lo que se toca, se queda.',feel:()=>emo(A().id).corto,
  p:()=>`Puedes compartir tu tarjeta solo por link, o llevarla grabada con un QR en un accesorio. ${emo(A().id).largo} Elige arriba el que más se parezca a esa persona y mira cómo el recorrido se ajusta a ti.`,
  note:()=>'El precio del accesorio te lo confirmamos por WhatsApp; ahí también resolvemos cualquier duda.',
  tip:()=>'Pregúntate dónde le gustaría tenerte cerca. Esa respuesta casi siempre elige el accesorio por ti.'},
 {k:'Paso 4 · Un pago sencillo',t:'Paga por Yape, sin complicaciones',feel:'Un paso corto y tranquilo.',
  p:()=>'Escaneas el QR de Yape, guardas la captura de tu comprobante y la adjuntas a tu pedido. No necesitas crear una cuenta ni recordar contraseñas. Lo hicimos corto a propósito, para que tu energía se quede en lo que de verdad importa: el mensaje.',
  tip:()=>'Puedes descargar el QR de pago desde el mismo cuadro del pedido, por si prefieres pagar desde otro celular.'},
 {k:'Paso 5 · Te acompañamos',t:'Tu pedido llega a WhatsApp, y ahí nos vemos',feel:'Aquí no eres un número.',
  p:()=>'Al tocar "Ya pagué, enviar pedido" se abre WhatsApp con tus datos ya escritos. Una persona del equipo revisa tu comprobante y, cuando todo está en orden, te envía tu link mágico por el mismo chat. Si algo falta, te lo decimos con cariño y lo resolvemos juntos.',
  tip:()=>'Si subiste una foto, mándala en el mismo chat. Así todo queda en un solo lugar y nada se pierde.'},
 {k:'Paso 6 · Lo preparamos para ti',t:()=>`Tu QR toma forma en tu ${nom()}`,feel:'Cada QR es único: el tuyo guarda tu mensaje.',
  p:()=>`Con tu tarjeta lista, preparamos tu ${nom()} con el QR grabado. Te avisamos por WhatsApp apenas esté listo, para que no tengas que adivinar ni esperar a ciegas.`,
  tip:()=>'Mientras esperas, guarda el secreto. La anticipación también es parte del regalo: se disfruta desde ahora.'},
 {k:'Paso 7 · Llega a tu casa',t:'Lo recibes sin sobresaltos',feel:'Tú decides el momento; nosotros cuidamos el camino.',
  p:()=>`Coordinamos contigo por WhatsApp la entrega en tu casa, para que lo recibas con calma y a tu ritmo. Cuando llegue, ábrelo con cuidado: tu ${nom()} ya trae todo lo que escribiste.`,
  eta:()=>CFG.entrega?'Tiempo estimado: '+CFG.entrega:'',
  tip:()=>'Antes de regalarlo, escanea tú el QR. Ver la magia primero te da la tranquilidad de saber que todo funciona.'},
 {k:'Paso 8 · El momento',t:'Entrégalo y mira lo que pasa',feel:'Esto es lo que de verdad estás regalando.',
  p:()=>'Dáselo en mano, en una cena, en su cumpleaños o cuando menos lo espere. Al escanear el QR se abrirá el sobre, sonará el sello y aparecerá tu mensaje. Quizá se rían, quizá se les humedezcan los ojos. No regalas un objeto: regalas la certeza de que alguien pensó en esa persona.',
  cta:true}
];
const val=v=>typeof v==='function'?v():v;

/* ====== Construcción ====== */
const N=PASOS.length;let cur=0,lock=0,track,dots,fill,count,prev,next,live;
const slide=(s,i)=>{const eta=s.eta?val(s.eta):'',note=s.note?val(s.note):'';
 return `<article class="tut-slide${i===cur?' on':''}" role="group" aria-roledescription="paso" aria-label="Paso ${i+1} de ${N}" data-i="${i}">
  <div class="tut-stage"><svg viewBox="0 0 320 240" role="img" aria-label="Ilustración del paso ${i+1}">${ART[i+1]()}</svg><span class="tut-num" aria-hidden="true">${i+1}</span></div>
  <div class="tut-body"><p class="tut-k">${e(s.k)}</p><h3 class="tut-t">${e(val(s.t))}</h3><p class="tut-feel">${e(val(s.feel))}</p><p class="tut-p">${e(val(s.p))}</p>
  ${note?`<p class="tut-note">${e(note)}</p>`:''}${eta?`<p class="tut-eta">${e(eta)}</p>`:''}
  ${s.tip?`<div class="tut-tip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.6-9.2-9.1C1.4 8.8 3 5.5 6.2 5.5c2 0 3.2 1.1 3.8 2.2.6-1.1 1.8-2.2 3.8-2.2 3.2 0 4.8 3.3 3.4 6.4C19 16.4 12 21 12 21z" fill="currentColor"/></svg><p><b>Un consejo de corazón:</b> ${e(val(s.tip))}</p></div>`:''}
  ${s.cta?`<div class="tut-cta"><a href="#productos" class="btn btn-accent">Crear mi tarjetita</a><a class="btn btn-ghost" data-tut-wa target="_blank" rel="noopener">Tengo una duda</a></div>`:''}</div></article>`};

function build(){
 const picker=FIS.length?`<div class="tut-pick" role="group" aria-label="Elige tu accesorio"><span class="tut-pl">Tu accesorio:</span>${FIS.map((f,i)=>`<button type="button" class="tut-chip" data-a="${i}" aria-pressed="${i===sel}">${e(f.name)}</button>`).join('')}</div>`:'';
 host.innerHTML=DEFS+`<div class="tut-wrap"><header class="tut-head"><span class="tut-eyebrow">Paso a paso</span><h2 id="tutH" class="serif">Tu regalo, de tu idea a sus manos</h2>
  <p>Si es la primera vez que regalas algo así, respira: es más fácil de lo que parece. Desliza y mira cómo una idea tuya se convierte en algo que se puede tocar, guardar y escanear.</p>${picker}</header>
  <div class="tut-card" role="region" aria-roledescription="carrusel" aria-labelledby="tutH">
   <div class="tut-track" tabindex="0" aria-label="Pasos del tutorial. Usa las flechas del teclado o desliza.">${PASOS.map(slide).join('')}</div>
   <div class="tut-bar"><div class="tut-fill"></div></div>
   <div class="tut-ctrl"><button type="button" class="tut-nav" data-d="-1" aria-label="Paso anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <div class="tut-mid"><div class="tut-dots">${PASOS.map((s,i)=>`<button type="button" class="tut-dot" data-i="${i}" aria-label="Ir al paso ${i+1}: ${e(val(s.t))}"></button>`).join('')}</div><p class="tut-count"></p></div>
    <button type="button" class="tut-nav" data-d="1" aria-label="Paso siguiente"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>
  <p class="tut-hint">Desliza hacia el lado, toca los puntos o usa las flechas. <a data-tut-wa target="_blank" rel="noopener">¿Prefieres que te lo expliquemos por WhatsApp?</a></p><p class="tut-sr" aria-live="polite"></p></div>`;
 host.hidden=false;
 track=host.querySelector('.tut-track');fill=host.querySelector('.tut-fill');count=host.querySelector('.tut-count');live=host.querySelector('.tut-sr');
 prev=host.querySelector('[data-d="-1"]');next=host.querySelector('[data-d="1"]');dots=[...host.querySelectorAll('.tut-dot')];
 host.querySelectorAll('[data-tut-wa]').forEach(a=>a.href=TV.wa('Hola! Vi el paso a paso de FRASSMOTTI y tengo una duda.'));
 wire();sync(false);
}
/* La altura del carrusel sigue al paso visible (así no sobran espacios en blanco) */
function fit(){const s=track.querySelector('.tut-slide.on');if(s)track.style.height=s.offsetHeight+'px'}
function sync(say){
 host.querySelectorAll('.tut-slide').forEach((s,i)=>{s.classList.toggle('on',i===cur);s.setAttribute('aria-hidden',i===cur?'false':'true');s.toggleAttribute('inert',i!==cur)});
 dots.forEach((d,i)=>{d.classList.toggle('on',i===cur);i===cur?d.setAttribute('aria-current','step'):d.removeAttribute('aria-current')});
 fill.style.width=((cur+1)/N*100)+'%';count.textContent='Paso '+(cur+1)+' de '+N;
 prev.disabled=cur===0;next.disabled=cur===N-1;
 fit();
 if(say)live.textContent='Paso '+(cur+1)+' de '+N+': '+val(PASOS[cur].t);
}
function go(i,smooth){i=Math.max(0,Math.min(N-1,i));cur=i;lock=Date.now()+(smooth===false||reduce()?60:750);track.scrollTo({left:i*track.clientWidth,behavior:smooth===false||reduce()?'auto':'smooth'});sync(true)}
function wire(){
 let raf=0;
 track.addEventListener('scroll',()=>{if(Date.now()<lock)return;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{if(Date.now()<lock)return;const i=Math.round(track.scrollLeft/Math.max(1,track.clientWidth));if(i!==cur&&i>=0&&i<N){cur=i;sync(true)}})},{passive:true});
 host.querySelectorAll('.tut-nav').forEach(b=>b.addEventListener('click',()=>go(cur+(+b.dataset.d))));
 dots.forEach(d=>d.addEventListener('click',()=>go(+d.dataset.i)));
 track.addEventListener('keydown',ev=>{if(ev.key==='ArrowRight'){ev.preventDefault();go(cur+1)}else if(ev.key==='ArrowLeft'){ev.preventDefault();go(cur-1)}else if(ev.key==='Home'){ev.preventDefault();go(0)}else if(ev.key==='End'){ev.preventDefault();go(N-1)}});
 host.querySelectorAll('.tut-chip').forEach(c=>c.addEventListener('click',()=>{sel=+c.dataset.a;
  host.querySelectorAll('.tut-chip').forEach(x=>x.setAttribute('aria-pressed',x===c));
  track.innerHTML=PASOS.map(slide).join('');track.scrollLeft=cur*track.clientWidth;
  host.querySelectorAll('[data-tut-wa]').forEach(a=>a.href=TV.wa('Hola! Vi el paso a paso de FRASSMOTTI y tengo una duda.'));
  sync(false)}));
 /* Si cambia el ancho (girar el celular), mantiene el paso actual */
 let w=track.clientWidth;addEventListener('resize',()=>{if(track.clientWidth!==w){w=track.clientWidth;track.scrollTo({left:cur*w,behavior:'auto'})}fit()});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);addEventListener('load',fit);
}
build();
/* Mientras el tutorial está en pantalla, el botón flotante de WhatsApp se compacta para no tapar los controles */
if('IntersectionObserver'in window)new IntersectionObserver(es=>document.body.classList.toggle('tut-vis',es[0].isIntersecting)).observe(host.querySelector('.tut-card'));
})();
