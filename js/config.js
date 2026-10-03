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

/* ===== 3. PLANTILLAS ESPECIALES (activo:false = ocultas; cámbialo a true y vuelve a subir) =====
   Para añadir una: copia un bloque, cambia id y datos, y pon sus 3 imágenes en assets/plantillas/<id>-1.jpg, -2.jpg, -3.jpg */
const _esp=o=>Object.assign({tag:'Especial',activo:false},o,{imgs:[1,2,3].map(n=>`assets/plantillas/${o.id}-${n}.jpg`)});
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
const _cat={'cumple-divertido':'cumple',amor:'amor',gracias:'amistad',aniversario:'amor',mama:'amor'};
TV.TODAS.forEach(t=>{t.cat=t.cat||_cat[t.id]||'amor'});
TV.T=TV.TODAS.filter(t=>t.activo!==false||DEV);   // lista que ve el cliente

/* ===== 4. REDACTOR LOCAL: agrega categorías o frases aquí (máx. 70 caracteres por frase) ===== */
TV.FRASES={
 amor:{n:'Amor',frases:['Eres mi lugar favorito del mundo','Contigo todo es mejor, siempre','Mi corazón te eligió y no se arrepiente','Gracias por ser mi casa y mi aventura'],poemas:['Si pudiera elegir un lugar,\nelegiría tus brazos;\ny si pudiera pedir un deseo,\nsería tenerte siempre a mi lado.']},
 amistad:{n:'Amistad',frases:['Gracias por estar en las buenas y en las malas','Contigo hasta las risas tienen más sentido','Los amigos como tú son un regalo de la vida','Eres la familia que yo elegí'],poemas:['Amigo es quien te escucha sin juzgar,\nquien te abraza sin preguntar,\nquien celebra tus logros\ncomo si fueran suyos.']},
 cumple:{n:'Cumpleaños',frases:['Que este año te traiga todo lo que sueñas','Un año más de sonrisas, un año más de ti','Hoy el mundo brilla porque naciste tú','Feliz vuelta al sol, que sea increíble'],poemas:['Cada año que cumples\nes una página más\nde una historia hermosa;\nque la próxima sea aún mejor.']},
 mujer:{n:'Día de la Mujer Boliviana',frases:['Tu fuerza inspira a todo un país','Valiente, sabia y siempre de pie','Gracias por sostenernos con tu amor','Mujer boliviana: raíz, voz y coraje'],poemas:['Naciste de la tierra y la montaña,\ncaminas con la frente en alto;\ntu voz es fuerza,\ntu amor, nuestro hogar.']},
 halloween:{n:'Halloween',frases:['Dulce o truco: hoy te toca sonreír','Que tu noche sea de dulces y sustos suaves','Esta noche hasta los fantasmas te saludan','Que no falten caramelos ni risas'],poemas:['Luna llena, noche oscura,\ncalabazas con sonrisa;\nque tus sustos sean dulces\ny tus sueños, una fiesta.']},
 difuntos:{n:'Todos los Santos y Difuntos',frases:['Tu recuerdo vive en nuestro corazón','Siempre presente, nunca olvidado','Gracias por todo lo que nos dejaste','Hoy te recordamos con mucho amor'],poemas:['Las flores no alcanzan\npara decir cuánto te extrañamos;\npero el amor que sembraste\nsigue floreciendo en nosotros.']},
 navidad:{n:'Navidad',frases:['Que la magia de hoy te acompañe siempre','Feliz Navidad, que reine la paz en tu hogar','Que no falten abrazos en esta Navidad','Mi mejor regalo es tenerte cerca'],poemas:['Una estrella en el cielo,\nuna mesa llena de amor;\nque esta Navidad te abrace\ncon paz y mucha ilusión.']}
};
// Utilidad: quita < > y limita longitud (la salida siempre va con textContent)
const clean=(s,max=80)=>(s||'').toString().replace(/[<>]/g,'').slice(0,max);
