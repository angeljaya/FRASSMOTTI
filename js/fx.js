/* FX v6: inclinación 3D con brillo, revelado al scroll, giroscopio y escena Three.js del hero */
const FX={
 tilt(){if(!matchMedia('(pointer:fine)').matches)return;
  document.querySelectorAll('[data-tilt]:not([data-t])').forEach(el=>{el.dataset.t=1;
   el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    el.style.transform=`perspective(900px) rotateX(${(.5-y)*9}deg) rotateY(${(x-.5)*11}deg) translateY(-6px)`;el.style.setProperty('--mx',x*100+'%');el.style.setProperty('--my',y*100+'%')});
   el.addEventListener('pointerleave',()=>el.style.transform='')})},
 reveal(sel){const els=document.querySelectorAll(sel);if(!('IntersectionObserver'in window))return;document.documentElement.classList.add('js');
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
  els.forEach((el,i)=>{el.classList.add('rv');el.style.transitionDelay=(i%3)*90+'ms';io.observe(el)})},
 gyro(el){const on=e=>{if(e.beta==null)return;const cl=(v,m)=>Math.max(-m,Math.min(m,v));el.style.transform=`perspective(900px) rotateX(${-cl((e.beta-45)/4,10)}deg) rotateY(${cl(e.gamma/3,10)}deg)`},go=()=>addEventListener('deviceorientation',on);
  if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)DeviceOrientationEvent.requestPermission().then(s=>s==='granted'&&go()).catch(()=>{});else if(matchMedia('(pointer:coarse)').matches)go()},
 hero(canvas){if(!window.THREE||matchMedia('(prefers-reduced-motion:reduce)').matches)return false;
  try{const T=THREE,r=new T.WebGLRenderer({canvas,alpha:true,antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,2));
   const sc=new T.Scene(),cam=new T.PerspectiveCamera(35,1,.1,50);cam.position.z=7.4;
   sc.add(new T.AmbientLight(0xffffff,.8));const L=new T.DirectionalLight(0xfff1d6,1.15);L.position.set(3,4,5);sc.add(L);const pl=new T.PointLight(0xd4af37,2.4,14);pl.position.set(-3,-1,3);sc.add(pl);
   /* v23 · fondo: mesa de piedra húmeda (assets/fondo-naturaleza.jpg) con desenfoque sutil + tinte oscuro, iluminada por los costados.
      Otra ruta: <canvas data-fondo="/assets/otra.jpg">. Si la imagen no carga, el hero queda exactamente como antes. */
   const brillo=new T.PointLight(0xffffff,1.6,12);brillo.position.set(1.8,2.8,4.6);sc.add(brillo);   /* destello sobre el barniz al inclinar */
   const FONDO=canvas.dataset.fondo||'assets/fondo-naturaleza.jpg';
   const lados=[0xffe2b0,0xcfe0ff].map((col,i)=>{const l=new T.PointLight(col,2.2,13);l.position.set(i?5.2:-5.2,.6,-1.2);return l});
   /* fundido de bordes: el alphaMap (verde=opacidad) lleva el fondo a 0 antes del borde del encuadre, sin cortes secos; se ve el negro de la página */
   const am=document.createElement('canvas');am.width=am.height=256;const ag=am.getContext('2d');ag.fillStyle='#000';ag.fillRect(0,0,256,256);
   const agr=ag.createRadialGradient(128,128,0,128,128,128);for(let i=0;i<=24;i++){const r=i/24,u=Math.max(0,Math.min(1,(r-.36)/.48)),a=1-u*u*(3-2*u),v=Math.round(255*a);agr.addColorStop(r,'rgb('+v+','+v+','+v+')')}
   ag.fillStyle=agr;ag.fillRect(0,0,256,256);
   const bgM=new T.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:0,transparent:true,opacity:0,alphaMap:new T.CanvasTexture(am)});
   const bg=new T.Mesh(new T.PlaneGeometry(1,1),bgM);bg.position.z=-3;bg.renderOrder=-2;bg.visible=false;sc.add(bg);let bgAsp=1;
   /* viñeta radial oscura: centro despejado para tarjeta y confeti, bordes profundos */
   const vc=document.createElement('canvas');vc.width=vc.height=256;const vg=vc.getContext('2d'),rg=vg.createRadialGradient(128,128,0,128,128,128);
   [[0,.06],[.5,.30],[.68,.46],[.8,.2],[.88,0],[1,0]].forEach(([o,a])=>rg.addColorStop(o,'rgba(2,3,6,'+a+')'));   /* oscurece el anillo medio y vuelve a 0 antes del borde: sin rectángulo oscuro */vg.fillStyle=rg;vg.fillRect(0,0,256,256);
   const vigM=new T.MeshBasicMaterial({map:new T.CanvasTexture(vc),transparent:true,opacity:0,depthWrite:false}),vig=new T.Mesh(new T.PlaneGeometry(1,1),vigM);
   vig.position.z=-2.9;vig.renderOrder=-1;vig.visible=false;sc.add(vig);
   const layoutBg=()=>{const dd=cam.position.z-bg.position.z,hh=2*Math.tan(cam.fov*Math.PI/360)*dd*1.1,ww=hh*cam.aspect;bg.scale.set(ww,hh,1);vig.scale.set(ww,hh,1);
    const m=bgM.map;if(m){const pa=ww/hh;if(pa>bgAsp){m.repeat.set(1,bgAsp/pa);m.offset.set(0,(1-bgAsp/pa)/2)}else{m.repeat.set(pa/bgAsp,1);m.offset.set((1-pa/bgAsp)/2,0)}}};
   const img=new Image();img.crossOrigin='anonymous';
   img.onload=()=>{try{const iw=img.naturalWidth,ih=img.naturalHeight,W=1024,H=Math.round(W*ih/iw),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingQuality='high';
     if('filter'in g){g.filter='blur(5px)';g.drawImage(img,-14,-14,W+28,H+28);g.filter='none'}
     else{const sm=document.createElement('canvas');sm.width=Math.round(W/5);sm.height=Math.round(H/5);sm.getContext('2d').drawImage(img,0,0,sm.width,sm.height);g.drawImage(sm,0,0,W,H)}
     g.fillStyle='rgba(6,9,14,.40)';g.fillRect(0,0,W,H);                       /* tinte oscuro base */
     const bt=new T.CanvasTexture(c);bt.anisotropy=4;if(T.SRGBColorSpace)bt.colorSpace=T.SRGBColorSpace;else if(T.sRGBEncoding)bt.encoding=T.sRGBEncoding;
     bgAsp=W/H;bgM.map=bt;bgM.needsUpdate=true;lados.forEach(l=>sc.add(l));bg.visible=true;vig.visible=true;layoutBg()}catch(e){bg.visible=false}};
   img.onerror=()=>{bg.visible=false};img.src=FONDO;
   /* v25 · LLAVERO REDONDO de acrílico premium: QR grabado + candado secreto. Lienzo cuadrado 1024²; el acrílico lo pone el cuerpo 3D. */
   const CW=1024,CH=1024,cv=document.createElement('canvas');cv.width=CW;cv.height=CH;const x=cv.getContext('2d'),tex=new T.CanvasTexture(cv);tex.anisotropy=8;
   const RK=1.3,HYK=RK-.3;   /* radio del llavero y centro del agujero (unidades 3D); la geometría de abajo usa los mismos valores */
   const rnd=(a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(20261011);
   /* matriz QR de ejemplo (versión 2, 25×25): 3 buscadores, sincronía, alineación y datos pseudoaleatorios fijos (decorativa, no escanea) */
   const QN=25,QR=Array.from({length:QN},()=>Array(QN).fill(0)),QL=Array.from({length:QN},()=>Array(QN).fill(false));
   (()=>{const fin=(r0,c0)=>{for(let r=-1;r<=7;r++)for(let c=-1;c<=7;c++){const rr=r0+r,cc=c0+c;if(rr<0||cc<0||rr>=QN||cc>=QN)continue;QL[rr][cc]=true;
     QR[rr][cc]=(r>=0&&r<=6&&c>=0&&c<=6&&(r==0||r==6||c==0||c==6||(r>=2&&r<=4&&c>=2&&c<=4)))?1:0}};
    fin(0,0);fin(0,QN-7);fin(QN-7,0);
    for(let i=8;i<QN-8;i++){QL[6][i]=QL[i][6]=true;QR[6][i]=QR[i][6]=i%2?0:1}
    for(let r=-2;r<=2;r++)for(let c=-2;c<=2;c++){QL[18+r][18+c]=true;QR[18+r][18+c]=Math.max(Math.abs(r),Math.abs(c))!=1?1:0}
    for(let i=0;i<9;i++){if(i!=6)QL[8][i]=QL[i][8]=true;if(i<8)QL[8][QN-1-i]=QL[QN-1-i][8]=true}
    QR[QN-8][8]=1;QL[QN-8][8]=true;
    for(let r=0;r<QN;r++)for(let c=0;c<QN;c++)if(!QL[r][c])QR[r][c]=rnd()<.5?1:0})();
   const draw=()=>{x.clearRect(0,0,CW,CH);x.save();x.beginPath();x.arc(CW/2,CH/2,CW/2,0,7);x.clip();const mx0=CW/2,my0=CH/2,ls=(v)=>{if('letterSpacing'in x)x.letterSpacing=v};
    /* canto pulido circular */
    x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=4;x.beginPath();x.arc(mx0,my0,505,0,7);x.stroke();
    x.strokeStyle='rgba(15,23,42,.12)';x.lineWidth=2;x.beginPath();x.arc(mx0,my0,496,0,7);x.stroke();
    /* ojal dorado en el borde superior (el agujero real está cortado en la malla 3D en el mismo punto) */
    const hcy=my0*(1-HYK/RK),hr=.09*(my0/RK);
    const rim=x.createLinearGradient(mx0-hr-8,hcy-hr-8,mx0+hr+8,hcy+hr+8);rim.addColorStop(0,'#ffe29f');rim.addColorStop(.5,'#b98a24');rim.addColorStop(1,'#f1d58a');
    x.strokeStyle=rim;x.lineWidth=7;x.beginPath();x.arc(mx0,hcy,hr+3.5,0,7);x.stroke();
    /* marca */
    x.textAlign='center';x.textBaseline='alphabetic';x.fillStyle='#0f172a';x.font='900 52px Cinzel,serif';ls('7px');x.fillText('FRASSMOTTI',mx0+3.5,240);
    const dv=x.createLinearGradient(mx0-170,0,mx0+170,0);dv.addColorStop(0,'rgba(185,138,36,0)');dv.addColorStop(.5,'#b98a24');dv.addColorStop(1,'rgba(185,138,36,0)');x.fillStyle=dv;x.fillRect(mx0-170,262,340,3);
    x.fillStyle='#475569';x.font='600 21px Outfit,sans-serif';ls('4px');x.fillText('LLAVERO DE ACRÍLICO PREMIUM',mx0+2,298);ls('0px');
    /* placa esmerilada + código QR (módulos de 12 px sobre enteros: bordes nítidos) */
    const P=348,M=12,px=mx0-P/2,py=332,qx=px+(P-QN*M)/2,qy=py+(P-QN*M)/2;
    x.save();x.shadowColor='rgba(15,23,42,.35)';x.shadowBlur=24;x.shadowOffsetY=10;x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.roundRect(px,py,P,P,24);x.fill();x.restore();
    x.fillStyle='#0f172a';for(let r=0;r<QN;r++)for(let c=0;c<QN;c++)if(QR[r][c])x.fillRect(qx+c*M,qy+r*M,M,M);
    /* candado metálico clásico, cerrado */
    const cy0=738,sr=30,bx=mx0-48,by=760,bw=96,bh=84;
    const sg=x.createLinearGradient(mx0-38,0,mx0+38,0);sg.addColorStop(0,'#6b7280');sg.addColorStop(.3,'#e5e7eb');sg.addColorStop(.45,'#f9fafb');sg.addColorStop(.7,'#9ca3af');sg.addColorStop(1,'#4b5563');
    x.save();x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=9;x.shadowOffsetY=5;x.strokeStyle=sg;x.lineWidth=13;x.lineCap='butt';x.beginPath();x.moveTo(mx0-sr,cy0+34);x.lineTo(mx0-sr,cy0);x.arc(mx0,cy0,sr,Math.PI,0);x.lineTo(mx0+sr,cy0+34);x.stroke();x.restore();
    const bg2=x.createLinearGradient(bx,by,bx+bw,by+bh);[[0,'#f1d58a'],[.24,'#cf9f3d'],[.52,'#8f5f16'],[.76,'#d8aa4a'],[1,'#7b5012']].forEach(([o,c])=>bg2.addColorStop(o,c));
    x.save();x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=16;x.shadowOffsetY=9;x.fillStyle=bg2;x.beginPath();x.roundRect(bx,by,bw,bh,14);x.fill();x.restore();
    x.save();x.beginPath();x.roundRect(bx,by,bw,bh,14);x.clip();
    const sh=x.createLinearGradient(bx,0,bx+bw,0);sh.addColorStop(.1,'rgba(255,255,255,0)');sh.addColorStop(.3,'rgba(255,255,255,.5)');sh.addColorStop(.45,'rgba(255,255,255,0)');x.fillStyle=sh;x.fillRect(bx,by,bw,bh);
    x.strokeStyle='rgba(255,255,255,.65)';x.lineWidth=2;x.beginPath();x.moveTo(bx+12,by+2);x.lineTo(bx+bw-12,by+2);x.stroke();
    x.fillStyle='rgba(60,35,5,.35)';x.fillRect(bx,by+bh-7,bw,7);x.restore();
    x.strokeStyle='rgba(70,40,5,.6)';x.lineWidth=2;x.beginPath();x.roundRect(bx,by,bw,bh,14);x.stroke();
    x.fillStyle='#0b0703';x.beginPath();x.arc(mx0,by+36,9,0,7);x.fill();x.beginPath();x.roundRect(mx0-3.5,by+36,7,24,3);x.fill();
    x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1.5;x.beginPath();x.arc(mx0,by+36,10,.2,Math.PI-.2);x.stroke();
    x.fillStyle='#0f172a';x.font='700 52px Caveat,cursive';x.fillText('Un secreto te espera',mx0,922);
    /* destellos de acrílico pulido */
    const gl=x.createLinearGradient(0,0,CW,CH);[[0,.28],[.2,.06],[.21,0],[.58,0],[.64,.12],[.68,0]].forEach(([o,a])=>gl.addColorStop(o,'rgba(255,255,255,'+a+')'));x.fillStyle=gl;x.fillRect(0,0,CW,CH);
    x.restore();tex.needsUpdate=true};
   draw();
   document.fonts&&Promise.all(['700 40px Kalam','700 40px Caveat','900 40px Cinzel','900 40px Outfit'].map(f=>document.fonts.load(f,'Aa'))).then(draw).catch(()=>{});
   /* cuerpo de papel con bordes redondeados + barniz suave */
   const s=new T.Shape();s.absarc(0,0,RK,0,Math.PI*2,false);   /* llavero redondo: círculo perfecto */
   const hy=HYK,ho=new T.Path();ho.absarc(0,hy,.09,0,Math.PI*2,true);s.holes.push(ho);   /* agujero del llavero */
   const geo=new T.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:3,curveSegments:96});geo.translate(0,0,-.04);
   const body=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:0x86b0cd,roughness:.18,metalness:0,transparent:true,opacity:.8,clearcoat:1.2,clearcoatRoughness:.16}));
   const face=new T.Mesh(new T.CircleGeometry(RK,96),new T.MeshPhysicalMaterial({map:tex,transparent:true,roughness:.3,metalness:0,clearcoat:1.2,clearcoatRoughness:.16}));face.position.z=.062;
   const ring=new T.Mesh(new T.TorusGeometry(.22,.02,16,48),new T.MeshStandardMaterial({color:0xd4af37,metalness:.85,roughness:.28}));ring.rotation.y=Math.PI/2;ring.position.set(0,hy-.04+.22,0);   /* argolla dorada */
   const card=new T.Group();card.add(body,face,ring);sc.add(card);
   /* confeti 3D dorado/rojo/plata */
   const N=90,im=new T.InstancedMesh(new T.BoxGeometry(.08,.16,.012),new T.MeshStandardMaterial({roughness:.35,metalness:.3}),N),d=new T.Object3D(),P=[],pal=['#d4af37','#b31010','#f5f4f0','#ffe29f','#FF4D5A','#c0c0c0'];
   for(let i=0;i<N;i++){P.push({x:(Math.random()-.5)*7,y:(Math.random()-.5)*6.6,z:(Math.random()-.5)*3-.6,s:.25+Math.random()*.5,r:Math.random()*6,v:.5+Math.random()*2});im.setColorAt(i,new T.Color(pal[i%6]))}sc.add(im);
   let mx=0,my=0,tx=0,ty=0,vis=true;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
   const fit=()=>{const b=canvas.getBoundingClientRect();r.setSize(b.width,b.height,false);cam.aspect=b.width/b.height;cam.position.z=b.width/b.height<.9?9.2:7.4;cam.updateProjectionMatrix();layoutBg()};fit();new ResizeObserver(fit).observe(canvas);
   new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(canvas);let last=performance.now();const t0=last+350;
   (function loop(now){requestAnimationFrame(loop);if(!vis)return;const dt=Math.min((now-last)/1000,.05),t=now/1000;last=now;tx+=(mx-tx)*.06;ty+=(my-ty)*.06;
    /* caída de entrada con rebote suave (easeOutBack) y luego flotación */
    const k=Math.max(0,Math.min((now-t0)/1600,1)),e=1+2.4*Math.pow(k-1,3)+1.4*Math.pow(k-1,2);
    card.position.y=(1-e)*5.2+Math.sin(t*1.1)*.12*k;card.rotation.z=(1-e)*.5;
    card.rotation.y=tx*1.1+Math.sin(t*.6)*.18;card.rotation.x=ty*.7+Math.cos(t*.5)*.06;pl.position.x=-3+tx*6;brillo.position.set(1.8-tx*3.2,2.8-ty*2.2,4.6);
    if(bg.visible){if(bgM.opacity<1)bgM.opacity=Math.min(1,bgM.opacity+dt*1.4);vigM.opacity=bgM.opacity;bg.position.x=-tx*.5;bg.position.y=ty*.3;lados[0].intensity=2.2+Math.sin(t*.7)*.28;lados[1].intensity=2.2+Math.sin(t*.7+2.1)*.28}
    const m=1+5*(1-k);P.forEach((p,i)=>{p.y-=p.s*dt*m;if(p.y<-3.5)p.y=3.5;d.position.set(p.x,p.y,p.z);d.rotation.set(t*p.v+p.r,t*p.v*.7,p.r);d.updateMatrix();im.setMatrixAt(i,d.matrix)});im.instanceMatrix.needsUpdate=true;r.render(sc,cam)})(last);
   return true}catch(e){return false}}
};
