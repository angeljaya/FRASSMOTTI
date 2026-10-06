/* v16 · EXPORTAR TARJETA TERMINADA (SOLO ADMINISTRADOR)
   Se carga ÚNICAMENTE en admin.html. La tienda, personalizar.html y r/tarjeta.html no incluyen este archivo ni sus botones.
   Dibuja la tarjeta completa (fondo + plantilla fundida + título + letras en círculos + foto con marco + flores + mensaje entero)
   en un canvas de alta resolución y la entrega como PNG, JPG o PDF (JPEG incrustado, página a 300 DPI). Sin librerías externas.
   El desbloqueo exige el PIN de administrador, verificado en el servidor (functions/api/admin.js). */
const EXP=(function(){
'use strict';
const $=id=>document.getElementById(id),CW=300+40;            /* ancho lógico de la tarjeta (px CSS), igual que .carta-3d */

/* ---------- utilidades de color y degradados (equivalen a los de css/v14.css) ---------- */
const hex=h=>{h=String(h).replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');return[0,2,4].map(i=>parseInt(h.substr(i,2),16))};
const mix=(a,b,p)=>{const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(v*p+B[i]*(1-p)).toString(16).padStart(2,'0')).join('')};   /* p = peso de a */
const rgba=(h,a)=>{const c=hex(h);return `rgba(${c[0]},${c[1]},${c[2]},${a})`};
const WH=a=>`rgba(255,255,255,${a})`;
/* degradado lineal con ángulo CSS (0deg = hacia arriba, sentido horario) */
function lin(x,W,H,deg,stops){const a=deg*Math.PI/180,sx=Math.sin(a),cy=-Math.cos(a),L=Math.abs(W*sx)+Math.abs(H*cy),mx=W/2,my=H/2,
 g=x.createLinearGradient(mx-sx*L/2,my-cy*L/2,mx+sx*L/2,my+cy*L/2);stops.forEach(s=>g.addColorStop(s[0],s[1]));return g}
/* relleno con degradado radial elíptico (rx, ry en px) centrado en (cx,cy) */
function ell(x,W,H,cx,cy,rx,ry,stops){x.save();x.translate(cx,cy);x.scale(1,ry/rx);const g=x.createRadialGradient(0,0,0,0,0,rx);stops.forEach(s=>g.addColorStop(s[0],s[1]));
 x.fillStyle=g;x.fillRect(-cx,-cy*rx/ry,W,H*rx/ry);x.restore()}
function rr(x,a,b,w,h,r){r=Math.min(r,w/2,h/2);x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
const mk=(W,H,S)=>{const c=document.createElement('canvas');c.width=Math.round(W*S);c.height=Math.round(H*S);const x=c.getContext('2d');x.scale(S,S);return{c,x}};
const img=src=>new Promise(ok=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=src});
const svgImg=(inner,vb)=>img('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" width="${vb*4}" height="${vb*4}">${inner}</svg>`));
/* envuelve el texto en líneas que caben en maxW (respeta saltos de línea) */
function wrap(x,text,maxW){const out=[];String(text||'').replace(/\r/g,'').split('\n').forEach(par=>{
 const ws=par.split(/\s+/).filter(Boolean);if(!ws.length){out.push('');return}let ln='';
 ws.forEach(w=>{const t=ln?ln+' '+w:w;if(ln&&x.measureText(t).width>maxW){out.push(ln);ln=w}else ln=t});out.push(ln)});return out}
/* cabe en una línea: reduce el tamaño de fuente hasta que el texto entra en maxW */
function fitFont(x,text,weight,size,fam,maxW){let s=size;do{x.font=`${weight} ${s}px ${fam}`;if(x.measureText(text).width<=maxW)break;s-=1}while(s>10);return s}

/* ---------- colores del tema (misma lógica que TD.theme) ---------- */
function tema(t,colKey){const p=colKey&&TV.PALETA[colKey],ac=p?p.ac:t.K.ac;
 return{ac,gold:t.K.g,wd:p?mix(ac,'#000000',.55):t.K.wd,fondo:(p&&p.fondo)||TV.FONDOS[t.id]||[t.K.paper,t.K.paper,t.K.paper]}}

/* ---------- fondo: degradado + plantilla fundida (imagen con máscara, tinte y velo) + emojis ---------- */
async function fondo(x,W,H,S,t,th,v){
 const f=th.fondo;
 x.fillStyle=lin(x,W,H,165,[[0,f[0]],[.58,f[1]],[1,f[2]]]);x.fillRect(0,0,W,H);
 ell(x,W,H,W,H,.9*W,.6*H,[[0,rgba(f[2],.667)],[.7,rgba(f[2],0)]]);
 ell(x,W,H,.14*W,0,1.2*W,.7*H,[[0,WH(.85)],[.6,WH(0)]]);
 const tp=TV.tpl(t,v);
 if(tp){const im=await img(tp.src);
  if(im){const T=mk(W,H,S),tx=T.x,k=Math.max(W/im.width,H/im.height),w=im.width*k,h=im.height*k;
   if('filter' in tx)tx.filter='saturate(.85) contrast(.95)';
   tx.drawImage(im,(W-w)*tp.y/100,(H-h)*.5,w,h);tx.filter='none';
   tx.globalCompositeOperation='destination-in';                                    /* máscara vertical: fuerte arriba/abajo, suave al centro */
   tx.fillStyle=lin(tx,W,H,180,[[0,'rgba(0,0,0,1)'],[.16,'rgba(0,0,0,.78)'],[.42,'rgba(0,0,0,.32)'],[.6,'rgba(0,0,0,.22)'],[.86,'rgba(0,0,0,.7)'],[1,'rgba(0,0,0,1)']]);tx.fillRect(0,0,W,H);
   x.save();x.globalAlpha=tp.op;x.globalCompositeOperation='multiply';x.drawImage(T.c,0,0,W,H);x.restore()}
  x.save();x.globalAlpha=.16;x.globalCompositeOperation='soft-light';x.fillStyle=lin(x,W,H,160,[[0,th.ac],[.75,rgba(th.ac,0)]]);x.fillRect(0,0,W,H);x.restore();   /* tinte del color elegido */
  ell(x,W,H,.5*W,.54*H,.82*W,.5*H,[[0,WH(.66)],[.62,WH(.18)],[.8,WH(0)]]);                                                                                      /* velo central */
  x.fillStyle=lin(x,W,H,180,[[0,WH(.14)],[.24,WH(0)],[.78,WH(0)],[1,WH(.2)]]);x.fillRect(0,0,W,H)}
 /* emojis temáticos de las esquinas */
 const e=TV.DECO[t.id]||['✨','✨','✨'];x.save();x.globalAlpha=tp?0.12:0.2;x.textBaseline='top';x.textAlign='left';
 [[4,3,-14,30],[78,5,12,34],[2,40,10,26],[84,44,-8,28],[6,84,-10,32],[80,86,14,30]].forEach((p,i)=>{x.save();x.translate(p[0]/100*W,p[1]/100*H);x.rotate(p[2]*Math.PI/180);
  x.font=`${p[3]}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;x.fillText(e[i%e.length],0,0);x.restore()});x.restore()}

/* ---------- stickers (flores y estrellas) con los colores del tema ---------- */
const sub=(s,th)=>s.replaceAll('var(--card-accent)',th.ac).replaceAll('var(--gold-primary)',th.gold).replaceAll('var(--wd)',th.wd);
function flores(d,th){let s=sub(TD.FLOR[d.flor]||TD.FLOR.estrellas,th);
 return s.replaceAll('fill="#ff4d4d"',`fill="${th.ac}"`).replaceAll('fill="#ff6666"',`fill="${mix(th.ac,'#ffffff',.65)}"`).replaceAll('fill="#d4af37"',`fill="${th.gold}"`).replaceAll('stroke="#d4af37"',`stroke="${th.gold}"`).replaceAll('fill="#800000"',`fill="${th.wd}"`)}
const mini=(d,th)=>sub(TD.MINI[TD.MINI_DE[d.flor]||'star'],th);
function sticker(x,im,a,b,w,deg){if(!im)return;x.save();x.translate(a+w/2,b+w/2);x.rotate(deg*Math.PI/180);x.shadowColor='rgba(0,0,0,.3)';x.shadowBlur=5*x.__S;x.shadowOffsetX=2*x.__S;x.shadowOffsetY=4*x.__S;x.drawImage(im,-w/2,-w/2,w,w);x.restore()}

/* ---------- foto: recorte "cover" y filtro blanco y negro (manual, funciona en cualquier navegador) ---------- */
function fotoCanvas(im,w,h,S,bw){const c=mk(w,h,S),k=Math.max(w/im.width,h/im.height),iw=im.width*k,ih=im.height*k;c.x.drawImage(im,(w-iw)/2,(h-ih)/2,iw,ih);
 if(bw){const d=c.x.getImageData(0,0,c.c.width,c.c.height),p=d.data;for(let i=0;i<p.length;i+=4){let g=.299*p[i]+.587*p[i+1]+.114*p[i+2];g=((g-128)*1.15+128)*1.05;g=g<0?0:g>255?255:g;p[i]=p[i+1]=p[i+2]=g}c.x.putImageData(d,0,0)}
 return c.c}
function silueta(w,h,S){const c=mk(w,h,S),x=c.x;x.fillStyle='#d6d3d1';x.fillRect(0,0,w,h);x.fillStyle='#a8a29e';x.beginPath();x.arc(w/2,h*.38,h*.17,0,7);x.fill();x.beginPath();x.ellipse(w/2,h*1.02,w*.3,h*.38,0,Math.PI,0);x.fill();return c.c}

/* ---------- render principal ----------
   o = {t (plantilla), g ('m'|'h'), dis, col, fu, v (0-2), nombre, de, titulo, palabra, tam (1-3), msg, bw (bool), foto (Image|null), marca (bool)}
   Devuelve {canvas, escala} */
async function render(o,S){
 const t=o.t,th=tema(t,o.col),d=TV.diseno(o.dis,o.g||'m',t.id),fu=TV.fuente(o.fu),tam=TV.tam(o.tam).id,pal=(o.palabra||t.pa).toUpperCase().slice(0,9),tit=o.titulo||t.ti;
 try{await Promise.race([Promise.all([`700 40px ${fu.t}`,`700 30px ${fu.m}`,'900 24px Outfit','700 20px Caveat'].map(f=>document.fonts.load(f,'AaÁá'))),new Promise(r=>setTimeout(r,5000))])}catch(e){}
 const mx=document.createElement('canvas').getContext('2d');   /* para medir textos antes de dimensionar */

 /* ---- medidas (equivalentes a carta.css + v14.css) ---- */
 const tsBase=fu.ts*Math.min(1,9.5/Math.max(tit.length,1)),ts=fitFont(mx,tit,700,tsBase,fu.t,.98*300),tH=ts*1.08;
 const n=pal.length,z=Math.min(42,Math.floor((300-(n-1)*5)/n)),imgH={1:200,2:150,3:112}[tam];
 const mar=d.marco,bw0={dorado:3,sobrio:1,festivo:2}[mar]||0,pad=mar==='sobrio'?{t:8,r:8,b:tam>1?26:28,l:8}:{t:10,r:10,b:tam>1?26:30,l:10},
  Fw=.85*300,Fh=bw0*2+pad.t+imgH+pad.b,imgW=Fw-pad.l-pad.r-bw0*2;
 const w0=TM_count(o.msg),big=tam===1,msz=big?fu.ms*(w0<=12?1:w0<=24?.8:w0<=36?.68:.6):Math.max(tam===2?15:14,fu.ms*(tam===2?.68:.62)),lh=big?1.18:1.22;
 const Bw=.94*300,tw=Bw-28;mx.font=`700 ${msz}px ${fu.m}`;const L=wrap(mx,o.msg,tw),Bh=Math.max(big?132:0,L.length*msz*lh+20);
 const yT=25+10,yL=yT+tH-15,yF=yL+z-20,fm=tam===1?20:12,yB=yF+Fh+fm,mark=o.marca?40:0,H=Math.max(520,Math.ceil(yB+Bh+30+mark));
 /* limita la memoria del canvas (iOS ~16 millones de píxeles) */
 let k=S;while(CW*k*H*k>15e6&&k>1)k-=.5;
 const C=mk(CW,H,k),x=C.x;x.__S=k;x.textBaseline='alphabetic';

 await fondo(x,CW,H,k,t,th,o.v);

 /* ---- título (girado -6°, con sombra blanca y gris como el CSS) ---- */
 x.save();x.translate(CW/2,yT+tH/2);x.rotate(-6*Math.PI/180);x.textAlign='center';x.textBaseline='middle';x.font=`700 ${ts}px ${fu.t}`;
 x.fillStyle='rgba(0,0,0,.14)';x.fillText(tit,3,3);x.fillStyle='#fff';x.fillText(tit,2,2);x.fillStyle=th.ac;x.fillText(tit,0,0);x.restore();

 /* ---- marco de la foto + foto + leyenda + flores ---- */
 const stk=[await svgImg(mini(d,th),100),await svgImg(flores(d,th),150),await svgImg(mini(d,th),100)];
 const ph=o.foto?fotoCanvas(o.foto,imgW,imgH,k,o.bw):await (async()=>{const av=await img(TV.avatar(1,o.nombre||'Amigo'));return av?fotoCanvas(av,imgW,imgH,k,false):silueta(imgW,imgH,k)})();
 x.save();x.translate(CW/2,yF+Fh/2);x.rotate((mar==='festivo'?-1.5:mar==='sobrio'?0:2)*Math.PI/180);const a=-Fw/2,b=-Fh/2;
 const sh=(ox,oy,bl,c)=>{x.shadowColor=c;x.shadowOffsetX=ox*k;x.shadowOffsetY=oy*k;x.shadowBlur=bl*k},noSh=()=>{x.shadowColor='transparent';x.shadowBlur=x.shadowOffsetX=x.shadowOffsetY=0};
 const rad=mar==='floral'?16:mar==='festivo'?10:0;
 if(mar==='dorado'){x.fillStyle=rgba(th.gold,.28);rr(x,a-5,b-5,Fw+10,Fh+10,0);x.fill()}
 if(mar==='festivo'){x.fillStyle=th.ac;rr(x,a-7,b-7,Fw+14,Fh+14,rad+7);x.fill();x.fillStyle='#fff';rr(x,a-5,b-5,Fw+10,Fh+10,rad+5);x.fill()}
 x.fillStyle='#fff';sh(0,mar==='festivo'?10:8,mar==='festivo'?22:20,'rgba(0,0,0,.2)');rr(x,a,b,Fw,Fh,rad);x.fill();noSh();
 if(mar==='dorado'){x.strokeStyle=th.gold;x.lineWidth=3;x.strokeRect(a+1.5,b+1.5,Fw-3,Fh-3)}
 if(mar==='sobrio'){x.strokeStyle='#1f2937';x.lineWidth=1;x.strokeRect(a+.5,b+.5,Fw-1,Fh-1)}
 if(mar==='festivo'){x.strokeStyle=th.ac;x.lineWidth=2;x.setLineDash([6,3]);rr(x,a+1,b+1,Fw-2,Fh-2,rad-1);x.stroke();x.setLineDash([])}
 if(mar==='floral'){x.strokeStyle=th.ac;x.lineWidth=2;x.setLineDash([6,3]);rr(x,a+7,b+7,Fw-14,Fh-14,9);x.stroke();x.setLineDash([])}
 const ix=a+bw0+pad.l,iy=b+bw0+pad.t;
 x.save();if(mar==='floral'){rr(x,ix,iy,imgW,imgH,10);x.clip()}x.drawImage(ph,ix,iy,imgW,imgH);x.restore();x.strokeStyle='#eee';x.lineWidth=1;x.strokeRect(ix+.5,iy+.5,imgW-1,imgH-1);
 if(mar==='cinta'){x.save();x.translate(0,b-13+12.5);x.rotate(-3*Math.PI/180);x.globalAlpha=.82;x.fillStyle=mix(th.ac,'#ffffff',.4);sh(0,2,4,'rgba(0,0,0,.18)');x.fillRect(-43,-12.5,86,25);x.restore()}
 const cap=(o.nombre||'')+(o.de?' · de '+o.de:'');x.textAlign='center';x.textBaseline='alphabetic';x.fillStyle='#111';
 const cs=fitFont(x,cap,700,fu.ms*.86,fu.m,Fw-24);x.font=`700 ${cs}px ${fu.m}`;x.fillText(cap,0,b+Fh-3-cs*.2);
 sticker(x,stk[0],a-20,b-15,45,-15);sticker(x,stk[1],a+Fw+25-120,b+Fh+50-120,120,5);sticker(x,stk[2],a+Fw-10-40,b+Fh+20-40,40,25);
 x.restore();

 /* ---- mensaje completo (en la tarjeta 2 y 3 se muestra entero, sin paginar) ---- */
 x.save();x.translate(CW/2,yB+Bh/2);if(big)x.rotate(-3*Math.PI/180);
 x.fillStyle=WH(big?.8:.84);rr(x,-Bw/2,-Bh/2,Bw,Bh,big?8:10);x.fill();
 x.fillStyle='#000';x.font=`700 ${msz}px ${fu.m}`;x.textAlign='center';x.textBaseline='middle';
 const ty=-(L.length*msz*lh)/2+msz*lh/2;L.forEach((s,i)=>x.fillText(s,0,ty+i*msz*lh));x.restore();

 /* ---- letras en círculos (van encima del marco, como en la tarjeta) ---- */
 const tot=n*z+(n-1)*6;let lx=(CW-tot)/2;
 [...pal].forEach((ch,i)=>{const cx=lx+z/2,cy=yL+z/2+(i%2?8:0);x.save();x.translate(cx,cy);x.rotate((((i*37)%20)-10)*Math.PI/180);
  x.shadowColor='rgba(0,0,0,.25)';x.shadowOffsetX=-2*k;x.shadowOffsetY=4*k;x.shadowBlur=6*k;x.fillStyle='#fff';x.beginPath();x.arc(0,0,z/2,0,7);x.fill();
  x.shadowColor='transparent';x.shadowBlur=x.shadowOffsetX=x.shadowOffsetY=0;x.fillStyle=(i===0||i===Math.floor(n/1.5))?th.ac:'#111';
  x.font=`900 ${Math.round(z*.57)}px Outfit,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(ch,0,1);x.restore();lx+=z+6});

 /* ---- marca opcional (apagada por defecto: para fabricar el accesorio no se imprime) ---- */
 if(o.marca){x.textAlign='center';x.textBaseline='middle';x.fillStyle='#374151';x.font='600 11px Outfit,sans-serif';x.fillText('Hecha con FRASSMOTTI',CW/2,H-22)}
 return{canvas:C.c,escala:k,w:CW,h:H}}
const TM_count=s=>(s||'').trim().split(/\s+/).filter(Boolean).length;

/* ---------- salida: PNG / JPG / PDF ---------- */
const blob=(c,type,q)=>new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('El navegador no pudo generar el archivo (prueba una calidad menor)')),type,q));
/* PDF mínimo: una página con el JPEG incrustado. dpi = 300 -> tamaño físico real de impresión */
async function pdf(c,dpi){const jpg=new Uint8Array(await (await blob(c,'image/jpeg',.95)).arrayBuffer()),wp=(c.width*72/dpi).toFixed(2),hp=(c.height*72/dpi).toFixed(2),enc=new TextEncoder(),P=[],off=[];let len=0;
 const add=u=>{P.push(u);len+=u.length},str=s=>add(enc.encode(s)),obj=(n,body)=>{off[n]=len;str(`${n} 0 obj\n${body}\nendobj\n`)};
 str('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wp} ${hp}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
 off[4]=len;str(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);add(jpg);str('\nendstream\nendobj\n');
 const cs=`q ${wp} 0 0 ${hp} 0 0 cm /Im0 Do Q`;obj(5,`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
 const xr=len;let t=`xref\n0 6\n0000000000 65535 f \n`;for(let i=1;i<=5;i++)t+=String(off[i]).padStart(10,'0')+' 00000 n \n';
 str(t+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);
 return new Blob(P,{type:'application/pdf'})}
function guardar(b,nombre){const a=document.createElement('a'),u=URL.createObjectURL(b);a.href=u;a.download=nombre;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),8000)}

/* ---------- lectura del formulario del panel (ids de admin.html) ---------- */
let FOTO_IMG=null;
const val=id=>($(id)&&$(id).value||'').trim();
async function leer(){
 const t=TV.find(val('plantilla')),tam=+val('tam')||1,fr=clean(val('frase'),70)||t.frase,m=clean(val('mensaje'),2600).trim(),msg=(m&&(tam>1||m.length>70))?m:fr;
 return{t,g:val('gen')==='h'?'h':'m',dis:val('dis'),col:val('color')||null,fu:val('fu'),v:+val('motivo')||0,nombre:clean(val('nombre'),24)||'Alguien especial',de:clean(val('de'),24),
  titulo:clean(val('titulo'),14)||t.ti,palabra:clean(val('palabra'),9)||t.pa,tam,msg,bw:val('fo')!=='c',foto:FOTO_IMG,marca:!!($('xMarca')&&$('xMarca').checked)}}
const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'cliente';

/* ---------- desbloqueo por PIN (verificado en el servidor) ---------- */
const LOCAL=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);   /* pruebas en tu computadora */
async function verificar(pin){
 if(LOCAL)return{ok:true,local:true};
 if(!pin)return{ok:false,msg:'Escribe tu PIN de administrador.'};
 try{const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})});
  if(r.status===401)return{ok:false,msg:'PIN incorrecto.'};
  if(r.status===404||r.status===405)return{ok:false,msg:'Falta la función /api/admin: despliega con Functions (ver README).'};
  const d=await r.json().catch(()=>({}));if(r.ok&&d.ok===true)return{ok:true};
  return{ok:false,msg:d.error||'No se pudo verificar el PIN.'}}
 catch(e){return{ok:false,msg:'No se pudo contactar /api/admin. Desplegaste con Functions? (ver README)'}}}

function init(){
 if(!$('xCard'))return;
 const msg=(s,err)=>{$('xMsg').textContent=s||'';$('xMsg').className='text-sm min-h-[1.25rem] '+(err?'text-red-700 font-medium':'text-gray-600')};
 const ver=(el,on)=>{el.hidden=!on;el.style.display=on?'':'none'};      /* oculta de verdad aunque Tailwind no cargue */
 let AUTH=false;                                                          /* sin sesión verificada no se genera nada */
 const abrir=local=>{AUTH=true;ver($('xLock'),false);ver($('xPanel'),true);$('xModo').textContent=local?'Modo local (sin PIN)':'Sesión de administrador'};
 const cerrar=()=>{AUTH=false;sessionStorage.removeItem('tv_pin');ver($('xPanel'),false);ver($('xLock'),true);$('xPin').value='';ver($('xPrev'),false);msg('')};
 const intentar=async(pin,silent)=>{$('xLockMsg').textContent=silent?'':'Verificando...';const r=await verificar(pin);
  if(r.ok){if(!r.local)sessionStorage.setItem('tv_pin',pin);if($('pin')&&!$('pin').value)$('pin').value=pin;$('xLockMsg').textContent='';abrir(r.local)}
  else $('xLockMsg').textContent=silent?'':r.msg};
 $('xUnlock').onclick=()=>intentar($('xPin').value.trim());$('xPin').addEventListener('keydown',e=>{if(e.key==='Enter')intentar($('xPin').value.trim())});$('xCerrar').onclick=cerrar;
 intentar(sessionStorage.getItem('tv_pin')||'',true);
 /* foto original del cliente en alta resolución (el link usa una miniatura; el archivo descargable usa esta) */
 if($('foto'))$('foto').addEventListener('change',e=>{FOTO_IMG=null;const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{FOTO_IMG=i};i.src=r.result};r.readAsDataURL(f)});
 const trabajar=async fn=>{const bs=document.querySelectorAll('[data-x]');bs.forEach(b=>b.disabled=true);
  try{if(!AUTH){msg('Desbloquea con tu PIN de administrador.',true);return}if(!val('nombre')){msg('Falta el nombre de quien recibe (Paso 2).',true);return}fn&&await fn()}catch(e){msg(e.message||'No se pudo generar la tarjeta.',true)}finally{bs.forEach(b=>b.disabled=false)}};
 const S=()=>+$('xQ').value||4;
 const base=o=>'frassmotti-'+o.t.id+'-'+slug(o.nombre);
 const nota=(r,S0)=>r.escala<S0?` (calidad ajustada a x${r.escala} por el tamaño de la tarjeta)`:'';
 $('xPng').onclick=()=>trabajar(async()=>{msg('Generando PNG...');const o=await leer(),r=await render(o,S());guardar(await blob(r.canvas,'image/png'),base(o)+'.png');msg(`Listo: PNG de ${r.canvas.width} x ${r.canvas.height} px`+nota(r,S()))});
 $('xJpg').onclick=()=>trabajar(async()=>{msg('Generando JPG...');const o=await leer(),r=await render(o,S());guardar(await blob(r.canvas,'image/jpeg',.95),base(o)+'.jpg');msg(`Listo: JPG de ${r.canvas.width} x ${r.canvas.height} px`+nota(r,S()))});
 $('xPdf').onclick=()=>trabajar(async()=>{msg('Generando PDF...');const o=await leer(),r=await render(o,S());guardar(await pdf(r.canvas,300),base(o)+'.pdf');msg(`Listo: PDF a 300 DPI (${(r.canvas.width/300*25.4).toFixed(0)} x ${(r.canvas.height/300*25.4).toFixed(0)} mm)`+nota(r,S()))});
 $('xVer').onclick=()=>trabajar(async()=>{msg('Generando vista previa...');const o=await leer(),r=await render(o,2),u=URL.createObjectURL(await blob(r.canvas,'image/jpeg',.85));$('xPrev').src=u;ver($('xPrev'),true);msg('Vista previa (la descarga sale en la calidad elegida).')});
}
return{render,pdf,leer,verificar,init};
})();
document.addEventListener('DOMContentLoaded',EXP.init);
