/* ===== CONFIG: 1) negocio  2) interruptores (FUNCIONES)  3) plantillas (TODAS, con activo)  4) frases del redactor  5) motor ===== */
/* Modo prueba: agrega ?dev=1 a la dirección para ver todo lo desactivado (solo tú). */
const DEV=typeof location!=='undefined'&&/[?&]dev=1/.test(location.search);
const TV={
  WHATSAPP:'59165153083',      // Tu número con código de país (sin +)
  PRECIO:50,
  REQUIRE_PAYMENT:false,        // true = la tarjeta solo se activa con link firmado desde admin.html (requiere Functions)
  WATERMARK:true,               // v11: marca de agua viral al pie de la tarjeta (false = sin marca)
  QR_IMAGE:'assets/qr-pago.png',                 // Ej: '/assets/qr-pago.png'. Vacío = QR placeholder CSS
  MUSIC:'',                    // Ej: '/assets/musica.mp3' (mp3 libre de derechos)
  COLORS:{rosa:'#FF4D5A',noche:'#111827',ambar:'#F59E0B'},
  STYLES:['lorelei','micah','notionists'],
  avatar(n,seed){return `https://api.dicebear.com/7.x/${this.STYLES[(n-1)%3]||'lorelei'}/svg?seed=${encodeURIComponent(seed||'Amigo')}&backgroundColor=transparent`},
  wa(m){return 'https://wa.me/'+this.WHATSAPP+'?text='+encodeURIComponent(m||'')},   // Click-to-Chat de WhatsApp
  find(id){return this.TODAS.find(t=>t.id===id)||this.T[0]},          // cualquier plantilla (tarjeta y admin)
  pick(id){return this.T.find(t=>t.id===id)||this.T[0]},              // solo activas (tienda y personalizar)
  on(f){return !!(this.FUNCIONES[f]||DEV)},                          // ¿función encendida?
  asset(p){return (/\/r\/[^\/]*$/.test(location.pathname)?'../':'')+p},  // ruta de imágenes desde cualquier página
  /* Aplica la paleta del escenario (y un acento opcional elegido por el cliente) */
  applyTheme(t,acc){const k=t.K,r=document.documentElement.style,a=acc||k.ac;
   [['--b1',k.b1],['--b2',k.b2],['--e1',k.e1],['--e2',k.e2],['--wl',k.wl],['--wd',k.wd],['--gold-primary',k.g],['--card-bg',k.paper],['--card-accent',a],['--c',a]].forEach(([n,v])=>r.setProperty(n,v))},
  letters(el,pal){el.innerHTML='';[...pal].forEach((ch,i)=>{const d=document.createElement('div'),z=Math.min(42,Math.floor((300-(pal.length-1)*5)/pal.length));
   d.className='circle-letter'+(i===0||i===Math.floor(pal.length/1.5)?' red':'');d.textContent=ch;d.style.cssText=`width:${z}px;height:${z}px;font-size:${Math.round(z*.57)}px;transform:translateY(${i%2?8:0}px) rotate(${(i*37)%20-10}deg)`;el.append(d)})},
  TODAS:[
   {id:'cumple-divertido',name:'Cumple Divertido',tag:'Más vendido',d:'Para celebrar con humor y mucha fiesta.',ti:'Feliz',pa:'CUMPLE',frase:'Para la más loca del grupo',
    K:{b1:'#2a1530',b2:'#0b0610',e1:'#3a1d44',e2:'#241028',wl:'#e0245e',wd:'#7a0f33',g:'#d4af37',paper:'#fbf3e6',ac:'#d81b60'},
    q:'¿Qué tiene {n} que nadie más tiene?',o:['Su risa contagiosa','Su energía infinita','Todo lo anterior'],ok:2},
   {id:'amor',name:'Te Quiero',tag:'Romántica',d:'Una declaración que se abre con sello de cera.',ti:'Te',pa:'QUIERO',frase:'Eres mi lugar favorito',
    K:{b1:'#3a1220',b2:'#10060a',e1:'#4a1a2a',e2:'#2c0f19',wl:'#e63950',wd:'#7d0a22',g:'#f0b4be',paper:'#fff1f2',ac:'#c9184a'},
    q:'¿Qué es lo primero que piensa {n} al despertar?',o:['En café','En mí','En seguir durmiendo'],ok:1},
   {id:'gracias',name:'Gracias Infinitas',tag:'Nueva',d:'Para agradecer a quien siempre está.',ti:'Muchas',pa:'GRACIAS',frase:'Gracias por estar siempre',
    K:{b1:'#12332a',b2:'#050f0b',e1:'#1b4d3e',e2:'#0f2c24',wl:'#2fa36b',wd:'#0d4a2f',g:'#d4af37',paper:'#f3f7ee',ac:'#1b7a4b'},
    q:'¿Quién merece un aplauso hoy?',o:['{n}','{n}, sin duda','Solo {n}'],ok:0},
   {id:'aniversario',name:'Aniversario',tag:'Elegante',d:'Un recuerdo para celebrar el tiempo juntos.',ti:'Juntos',pa:'SIEMPRE',frase:'Contigo todo gira mejor',
    K:{b1:'#16204a',b2:'#070a18',e1:'#233063',e2:'#141c3d',wl:'#5668d8',wd:'#1c2a7a',g:'#cfd6e6',paper:'#f4f5fb',ac:'#3949ab'},
    q:'¿Cuál es el mejor plan para {n}?',o:['Una cena tranquila','Viajar sin rumbo','Cualquiera, contigo'],ok:2},
   {id:'mama',name:'Para Mamá',tag:'Con cariño',d:'El detalle más tierno para ella.',ti:'Para',pa:'MAMÁ',frase:'Gracias por ser mi hogar',
    K:{b1:'#3a1f4d',b2:'#0e0614',e1:'#4b2a63',e2:'#2d1840',wl:'#b04ad1',wd:'#5a1478',g:'#e8c15a',paper:'#fbf2fc',ac:'#8e24aa'},
    q:'¿Quién tiene siempre la razón?',o:['{n}','{n} (otra vez)','Nadie discute con {n}'],ok:0}
  ]
};

/* ===== 2. INTERRUPTORES: true = visible para el cliente ===== */
TV.FUNCIONES={redactor:false,grupo:false,voz:false};

/* ===== EDICIÓN FÍSICA (sección de index.html). activo:false la oculta; precio:123 muestra "Desde 123 Bs" ===== */
TV.FISICOS=[
 {id:'llavero',name:'Llavero acrílico',d:'Acrílico transparente con tu QR grabado. Va contigo a todas partes.',activo:true},
 {id:'collar',name:'Collar con QR',d:'Dije elegante con el código grabado, para llevarlo cerca del corazón.',activo:true},
 {id:'manilla',name:'Manilla con QR',d:'Manilla ajustable con placa grabada. Un detalle que se escanea.',activo:true}
];


/* v14: plantilla para Papá (se inserta después de Mamá) */
TV.TODAS.splice(5,0,{id:'papa',name:'Para Papá',tag:'Con cariño',d:'Un detalle sincero para quien siempre te cuidó.',ti:'Para',pa:'PAPÁ',frase:'Gracias por enseñarme a ser fuerte',
 K:{b1:'#14263a',b2:'#060d14',e1:'#1d3a56',e2:'#10263a',wl:'#2b7fb8',wd:'#0f3a5c',g:'#cdd6e0',paper:'#eef3f8',ac:'#1f5f99'},
 q:'¿Quién tiene siempre la razón?',o:['Papá','Papá (otra vez)','Nadie discute con papá'],ok:0});

/* ===== 3. PLANTILLAS ESPECIALES (v14: todas habilitadas; activo:false = ocultas) =====
   Para añadir una: copia un bloque, cambia id y datos, y pon sus 3 imágenes en assets/<id>-1.jpg, -2.jpg, -3.jpg */
const _esp=o=>Object.assign({tag:'Especial',activo:true},o,{imgs:[1,2,3].map(n=>`assets/${o.id}-${n}.jpg`)});
TV.TODAS.push(
 _esp({id:'mujer-boliviana',name:'Día de la Mujer Boliviana',fecha:'11 de octubre',cat:'mujer',d:'Un homenaje a su fuerza y su cariño.',ti:'Feliz Día',pa:'MUJER',frase:'Tu fuerza inspira a todos',
  K:{b1:'#33103f',b2:'#0c0410',e1:'#4a1d5c',e2:'#2a0f37',wl:'#e91e8c',wd:'#7a0e4a',g:'#f4c542',paper:'#fdf0f8',ac:'#d81b8a'},q:'¿Qué admiramos más de {n}?',o:['Su fortaleza','Su corazón','Todo lo anterior'],ok:2}),
 _esp({id:'halloween',name:'Halloween',fecha:'31 de octubre',cat:'halloween',d:'Dulces, sustos suaves y mucha diversión.',ti:'Feliz',pa:'HALLOWEEN',frase:'Dulce o truco: hoy te toca sonreír',
  K:{b1:'#1f1208',b2:'#060403',e1:'#2b1a0d',e2:'#170d06',wl:'#ff8a1f',wd:'#8a3b00',g:'#ff9a2e',paper:'#f6ecdc',ac:'#e65100'},q:'¿Qué disfraz elegiría {n}?',o:['Fantasma','Vampiro','Bruja'],ok:2}),
 _esp({id:'difuntos',name:'Todos los Santos y Difuntos',fecha:'1 y 2 de noviembre',cat:'difuntos',d:'Un recuerdo lleno de amor y gratitud.',ti:'Con amor',pa:'RECUERDO',frase:'Tu recuerdo vive en nuestro corazón',
  K:{b1:'#1c1a24',b2:'#060509',e1:'#2c2838',e2:'#18151f',wl:'#f2a31b',wd:'#8a5200',g:'#f5b942',paper:'#f5efe6',ac:'#d97706'},q:'¿Qué recordamos siempre de {n}?',o:['Su sonrisa','Sus consejos','Todo lo anterior'],ok:2}),
 _esp({id:'navidad',name:'Navidad',fecha:'25 de diciembre',cat:'navidad',d:'Magia, paz y abrazos para esta fecha.',ti:'Feliz',pa:'NAVIDAD',frase:'Que la magia de hoy te acompañe siempre',
  K:{b1:'#12301f',b2:'#050d08',e1:'#1f4d38',e2:'#10291f',wl:'#d62828',wd:'#7a0f13',g:'#e6c15a',paper:'#fbf5ea',ac:'#c1121f'},q:'¿Qué pediría {n} a Papá Noel?',o:['Paz y salud','Abrazos','Todo lo anterior'],ok:2})
);
const _cat={'cumple-divertido':'cumple',amor:'amor',gracias:'amistad',aniversario:'amor',mama:'amor',papa:'papa'};
TV.TODAS.forEach(t=>{t.cat=t.cat||_cat[t.id]||'amor'});
TV.T=TV.TODAS.filter(t=>t.activo!==false||DEV);   // lista que ve el cliente

/* ===== 4. REDACTOR LOCAL: agrega categorías o frases aquí (máx. 70 caracteres por frase) ===== */
TV.FRASES={
 amor:{n:'Amor',frases:['Eres mi lugar favorito del mundo','Contigo todo es mejor, siempre','Mi corazón te eligió y no se arrepiente','Gracias por ser mi casa y mi aventura'],poemas:['Si pudiera elegir un lugar,\nelegiría tus brazos;\ny si pudiera pedir un deseo,\nsería tenerte siempre a mi lado.']},
 amistad:{n:'Amistad',frases:['Gracias por estar en las buenas y en las malas','Contigo hasta las risas tienen más sentido','Los amigos como tú son un regalo de la vida','Eres la familia que yo elegí'],poemas:['Amigo es quien te escucha sin juzgar,\nquien te abraza sin preguntar,\nquien celebra tus logros\ncomo si fueran suyos.']},
 cumple:{n:'Cumpleaños',frases:['Que este año te traiga todo lo que sueñas','Un año más de sonrisas, un año más de ti','Hoy el mundo brilla porque naciste tú','Feliz vuelta al sol, que sea increíble'],poemas:['Cada año que cumples\nes una página más\nde una historia hermosa;\nque la próxima sea aún mejor.']},
 papa:{n:'Papá',frases:['Gracias por enseñarme a ser fuerte','Mi primer héroe, mi mejor ejemplo','Contigo aprendí que el amor también se demuestra con actos','Eres el abrazo que siempre me sostiene'],poemas:['Tus manos me enseñaron a caminar,\ntu voz, a no rendirme;\ngracias por ser mi ejemplo\ny mi lugar seguro.']},
 mujer:{n:'Día de la Mujer Boliviana',frases:['Tu fuerza inspira a todo un país','Valiente, sabia y siempre de pie','Gracias por sostenernos con tu amor','Mujer boliviana: raíz, voz y coraje'],poemas:['Naciste de la tierra y la montaña,\ncaminas con la frente en alto;\ntu voz es fuerza,\ntu amor, nuestro hogar.']},
 halloween:{n:'Halloween',frases:['Dulce o truco: hoy te toca sonreír','Que tu noche sea de dulces y sustos suaves','Esta noche hasta los fantasmas te saludan','Que no falten caramelos ni risas'],poemas:['Luna llena, noche oscura,\ncalabazas con sonrisa;\nque tus sustos sean dulces\ny tus sueños, una fiesta.']},
 difuntos:{n:'Todos los Santos y Difuntos',frases:['Tu recuerdo vive en nuestro corazón','Siempre presente, nunca olvidado','Gracias por todo lo que nos dejaste','Hoy te recordamos con mucho amor'],poemas:['Las flores no alcanzan\npara decir cuánto te extrañamos;\npero el amor que sembraste\nsigue floreciendo en nosotros.']},
 navidad:{n:'Navidad',frases:['Que la magia de hoy te acompañe siempre','Feliz Navidad, que reine la paz en tu hogar','Que no falten abrazos en esta Navidad','Mi mejor regalo es tenerte cerca'],poemas:['Una estrella en el cielo,\nuna mesa llena de amor;\nque esta Navidad te abrace\ncon paz y mucha ilusión.']}
};

/* =====================================================================
   v14: género, ocasiones, diseños filtrados, paletas, tipografías, tamaños
   ===================================================================== */
TV.GENEROS=[{id:'m',name:'Mujer'},{id:'h',name:'Hombre'}];
/* ¿Para qué género se ofrece cada ocasión? (por defecto, ambos) */
TV.SOLO={mama:['m'],papa:['h'],'mujer-boliviana':['m']};
TV.ocasiones=g=>TV.T.filter(t=>!TV.SOLO[t.id]||TV.SOLO[t.id].includes(g));

/* Colores de acento: el color cambia letras Y fondo de la tarjeta. sw = color del botón; fondo = [claro, medio, intenso] */
TV.PALETA={
 azul:{n:'Azul',sw:'#2563eb',ac:'#1d4ed8',fondo:['#eef5ff','#bcd7ff','#6ea2f5']},
 rojo:{n:'Rojo',sw:'#e11d48',ac:'#c1121f',fondo:['#fff0f0','#ffbfc2','#f06a73']},
 negro:{n:'Negro',sw:'#111827',ac:'#111827',fondo:['#f4f4f5','#c9ccd1','#7b828d']},
 violeta:{n:'Violeta',sw:'#7c3aed',ac:'#6d28d9',fondo:['#f6efff','#d9c2fa','#a77be8']},
 amarillo:{n:'Amarillo',sw:'#facc15',ac:'#b97800',fondo:['#fffbe0','#ffee9c','#ffd23f']}
};
Object.entries(TV.PALETA).forEach(([k,v])=>{TV.COLORS[k]=v.ac});   // los links viejos (rosa/noche/ambar) siguen funcionando
/* Fondo con degradado por ocasión (si el cliente no elige color) */
TV.FONDOS={'cumple-divertido':['#fff4e0','#ffd6e8','#ffb3d1'],amor:['#fff0f3','#ffd0da','#ff9eb5'],gracias:['#f4fbef','#d2efd9','#9fdcb6'],aniversario:['#f3f5ff','#d3dbff','#a5b4f5'],
 mama:['#fbf1ff','#ead1f5','#cf9fe6'],papa:['#eef5fb','#c9dff2','#8fb8dc'],'mujer-boliviana':['#fff0f8','#ffc8e6','#f58cc3'],halloween:['#fff1de','#ffc58a','#ff9442'],
 difuntos:['#fbf3e4','#f4d9a4','#e9b04c'],navidad:['#fff7ee','#f9d9d4','#e48a85']};
TV.fondo=(t,key)=>{const f=(key&&TV.PALETA[key]&&TV.PALETA[key].fondo)||TV.FONDOS[t.id]||[t.K.paper,t.K.paper,t.K.paper];
 return `radial-gradient(120% 70% at 14% 0%,rgba(255,255,255,.85),transparent 60%),radial-gradient(90% 60% at 100% 100%,${f[2]}aa,transparent 70%),linear-gradient(165deg,${f[0]} 0%,${f[1]} 58%,${f[2]} 100%)`};
/* Decoración temática por ocasión (emojis sutiles en las esquinas de la tarjeta) */
TV.DECO={'cumple-divertido':['🎈','🎉','✨'],amor:['💗','💞','✨'],gracias:['🌻','✨','💛'],aniversario:['💍','🥂','✨'],mama:['🌷','💐','✨'],papa:['⭐','🏆','✨'],
 'mujer-boliviana':['🌸','🌺','✨'],halloween:['🎃','🦇','🕸️'],difuntos:['🌼','🕯️','✨'],navidad:['❄️','🎄','⭐']};

/* v15 · Plantillas de fondo integradas: cada imagen se funde con la tarjeta (opacidad + degradados + tinte del color elegido).
   op = opacidad de la textura (las fotos oscuras llevan menos para no ensuciar el texto) · y = encuadre vertical (%) */
TV.TPL={'mujer-boliviana-1':{op:.46,y:30},'mujer-boliviana-2':{op:.34,y:55},'mujer-boliviana-3':{op:.4,y:40},
 'halloween-1':{op:.3,y:50},'halloween-2':{op:.26,y:55},'halloween-3':{op:.3,y:60},
 'navidad-1':{op:.3,y:60},'navidad-2':{op:.3,y:50},'navidad-3':{op:.28,y:55},
 'difuntos-1':{op:.3,y:55},'difuntos-2':{op:.28,y:55},'difuntos-3':{op:.3,y:45}};
TV.tpl=(t,i)=>{const s=t&&t.imgs&&t.imgs[Math.max(0,Math.min(2,+i||0))];if(!s)return null;const k=s.replace(/^.*\//,'').replace('.jpg','');return Object.assign({src:TV.asset(s),op:.32,y:50},TV.TPL[k])};
/* Tipografías: 3 estilos. t = título, m = mensaje; ts/ms = tamaños base (px) */
TV.FUENTES=[
 {id:'scrap',n:'Scrapbook',ej:'Cálida y juguetona',t:"'Kalam',cursive",m:"'Caveat',cursive",ts:62,ms:30},
 {id:'elegante',n:'Elegante',ej:'Fina y romántica',t:"'Great Vibes',cursive",m:"'Cormorant Garamond',serif",ts:68,ms:25},
 {id:'moderna',n:'Moderna',ej:'Limpia y redondeada',t:"'Pacifico',cursive",m:"'Outfit',sans-serif",ts:48,ms:21}
];
TV.fuente=id=>TV.FUENTES.find(f=>f.id===id)||TV.FUENTES[0];

/* Tamaños de tarjeta: w = palabras sugeridas, max = tope de palabras */
TV.TAMANOS=[
 {id:1,n:'Tarjeta 1',sub:'Postal',w:'hasta 50 palabras',max:60,d:'Directo al corazón: un mensaje tierno, corto y rápido.'},
 {id:2,n:'Tarjeta 2',sub:'Deslizante',w:'hasta 150 palabras',max:180,d:'Saluda, cuenta un recuerdo bonito y cierra con buenos deseos. Se desliza.'},
 {id:3,n:'Tarjeta 3',sub:'Tipo libro',w:'200 a 300+ palabras',max:400,d:'Explayate: anécdotas y una carta profunda. Se pasa de página como un libro.'}
];
TV.tam=n=>TV.TAMANOS.find(t=>t.id===+n)||TV.TAMANOS[0];
TV.palabras=s=>(s||'').trim().split(/\s+/).filter(Boolean).length;

/* Diseños (flores + marco + tema). Se filtran solos según género y ocasión. oc:'*' = cualquier ocasión; no:[...] = excepto */
TV.DISENOS=[
 {id:'cantuta',n:'Cantuta boliviana',gen:['m'],oc:['mujer-boliviana'],flor:'cantuta',marco:'floral'},
 {id:'tulipanes',n:'Tulipanes',gen:['m'],oc:['mama','cumple-divertido','gracias','mujer-boliviana'],flor:'tulipanes',marco:'cinta'},
 {id:'girasoles',n:'Girasoles',gen:['m'],oc:['gracias','cumple-divertido','mama'],flor:'girasol',marco:'dorado'},
 {id:'corazones',n:'Corazones',gen:['m','h'],oc:['amor','aniversario'],flor:'corazones',marco:'dorado'},
 {id:'rosas',n:'Rosas clásicas',gen:['m'],oc:'*',no:['halloween','difuntos','navidad'],flor:'rosas',marco:'polaroid'},
 {id:'laurel',n:'Laurel dorado',gen:['h'],oc:'*',no:['halloween','difuntos','navidad'],flor:'hojas',marco:'sobrio'},
 {id:'estrellas',n:'Estrellas plateadas',gen:['h','m'],oc:'*',no:['halloween','difuntos','navidad'],flor:'estrellas',marco:'polaroid'},
 {id:'calabazas',n:'Calabazas',gen:['m','h'],oc:['halloween'],flor:'calabaza',marco:'festivo'},
 {id:'luna',n:'Noche de estrellas',gen:['m','h'],oc:['halloween'],flor:'estrellas',marco:'sobrio'},
 {id:'copos',n:'Copos y acebo',gen:['m','h'],oc:['navidad'],flor:'copo',marco:'festivo'},
 {id:'navidad-dorada',n:'Navidad dorada',gen:['m','h'],oc:['navidad'],flor:'hojas',marco:'dorado'},
 {id:'cempasuchil',n:'Flor de cempasúchil',gen:['m','h'],oc:['difuntos'],flor:'cempasuchil',marco:'dorado'},
 {id:'recuerdo',n:'Hojas de recuerdo',gen:['m','h'],oc:['difuntos'],flor:'hojas',marco:'sobrio'}
];
/* Los diseños que cuadran con género + ocasión; el primero (el más específico) se aplica solo */
TV.disenos=(g,oc)=>{const ok=TV.DISENOS.filter(d=>d.gen.includes(g)&&(d.oc==='*'||d.oc.includes(oc))&&!(d.no&&d.no.includes(oc)));
 return ok.sort((a,b)=>(a.oc==='*')-(b.oc==='*'));};
TV.diseno=(id,g,oc)=>{const l=TV.disenos(g,oc);return l.find(d=>d.id===id)||l[0]||TV.DISENOS.find(d=>d.id==='estrellas')};

/* Pistas del secreto (hasta 3): el cliente elige cuáles dar */
TV.PISTAS_MAX=3;

/* Edición física: fotos reales que subes tú a assets/fisicos/ (si falta una, se ve la silueta de siempre) */
TV.FISICOS.forEach(f=>{f.img='assets/fisicos/'+f.id+'.jpg';f.gal=[1,2,3].map(n=>'assets/fisicos/'+f.id+'-'+n+'.jpg');f.video='assets/fisicos/'+f.id+'.mp4'});
TV.FISICOS[0].d='Acrílico transparente con tu QR grabado. Va contigo a todas partes y cada vez que lo escanean, alguien siente que lo piensas.';
TV.FISICOS[1].d='Un dije elegante con el código grabado, para llevar ese mensaje cerca del corazón, justo donde importa.';
TV.FISICOS[2].d='Manilla ajustable con placa grabada. Un detalle que se escanea y se vuelve el recuerdo favorito de su muñeca.';

// Utilidad: quita < > y limita longitud (la salida siempre va con textContent)
const clean=(s,max=80)=>(s||'').toString().replace(/[<>]/g,'').slice(0,max);
