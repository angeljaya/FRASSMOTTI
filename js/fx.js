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
   /* textura: réplica de la tarjeta real (papel, título Kalam, letras en círculos, polaroid B/N, mensaje Caveat y sello de cera) */
   const CW=768,CH=1170,cv=document.createElement('canvas');cv.width=CW;cv.height=CH;const x=cv.getContext('2d'),tex=new T.CanvasTexture(cv);tex.anisotropy=8;
   const star=(cx,cy,R)=>{x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?R*.45:R;x[i?'lineTo':'moveTo'](cx+Math.cos(a)*k,cy+Math.sin(a)*k)}x.closePath();const g=x.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,'#fff');g.addColorStop(.5,'#b0b0b0');g.addColorStop(1,'#505050');x.fillStyle=g;x.fill();x.lineWidth=4;x.strokeStyle='#fff';x.stroke()};
   const draw=()=>{x.clearRect(0,0,CW,CH);x.save();x.beginPath();x.roundRect(0,0,CW,CH,14);x.clip();x.fillStyle='#f5f4f0';x.fillRect(0,0,CW,CH);
    for(let i=0;i<2200;i++){x.fillStyle='rgba(0,0,0,'+Math.random()*.05+')';x.fillRect(Math.random()*CW,Math.random()*CH,2,2)}
    x.fillStyle='rgba(0,0,0,.06)';x.font='700 74px Caveat,cursive';x.textAlign='left';for(let i=0;i<14;i++)x.fillText('FELIZ CUMPLE',i%2?-120:-20,70+i*88);
    x.save();x.translate(384,190);x.rotate(-.1);x.textAlign='center';x.font='700 190px Kalam,cursive';x.fillStyle='rgba(0,0,0,.14)';x.fillText('Feliz',9,11);x.fillStyle='#fff';x.fillText('Feliz',5,5);x.fillStyle='#b31010';x.fillText('Feliz',0,0);x.restore();
    const rot=[-.17,.09,-.09,.14,-.2,.26],dy=[0,14,22,18,8,-4];
    [...'CUMPLE'].forEach((c,i)=>{x.save();x.translate(114+i*108,330+dy[i]);x.rotate(rot[i]);x.shadowColor='rgba(0,0,0,.28)';x.shadowBlur=14;x.shadowOffsetX=-4;x.shadowOffsetY=8;x.fillStyle='#fff';x.beginPath();x.arc(0,0,48,0,7);x.fill();x.shadowColor='transparent';x.fillStyle=i==0||i==4?'#b31010':'#111';x.font='900 56px Outfit,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(c,0,3);x.restore()});
    /* polaroid con foto en blanco y negro */
    x.save();x.translate(384,690);x.rotate(.035);x.shadowColor='rgba(0,0,0,.28)';x.shadowBlur=36;x.shadowOffsetY=16;x.fillStyle='#fff';x.fillRect(-290,-260,580,520);x.shadowColor='transparent';
    const pg=x.createLinearGradient(0,-236,0,160);pg.addColorStop(0,'#bdbdbd');pg.addColorStop(1,'#3a3a3a');x.fillStyle=pg;x.fillRect(-266,-236,532,396);
    x.save();x.beginPath();x.rect(-266,-236,532,396);x.clip();
    for(let i=0;i<22;i++){x.fillStyle='rgba(255,255,255,'+(.1+(i%4)*.06)+')';x.beginPath();x.arc(-250+(i*97)%520,-210+(i*53)%170,14+(i%5)*9,0,7);x.fill()}
    x.fillStyle='#161616';x.beginPath();x.arc(-70,-20,62,0,7);x.fill();x.beginPath();x.ellipse(-70,170,130,120,0,Math.PI,0);x.fill();
    x.fillStyle='#0d0d0d';x.beginPath();x.arc(95,0,56,0,7);x.fill();x.beginPath();x.ellipse(95,170,118,110,0,Math.PI,0);x.fill();x.restore();
    x.fillStyle='#111';x.font='700 54px Caveat,cursive';x.textAlign='center';x.textBaseline='alphabetic';x.fillText('Carla',0,226);
    star(-290,-262,46);star(250,250,40);x.restore();
    /* mensaje manuscrito */
    x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.roundRect(52,985,664,130,14);x.fill();
    x.save();x.translate(384,1068);x.rotate(-.05);x.fillStyle='#000';x.font='700 76px Caveat,cursive';x.textAlign='center';x.fillText('Para la más loca',0,0);x.restore();
    /* sello de cera */
    x.save();x.translate(606,930);x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=24;x.shadowOffsetY=12;const wg=x.createRadialGradient(-14,-16,4,0,0,70);wg.addColorStop(0,'#ad1422');wg.addColorStop(.7,'#6e000a');wg.addColorStop(1,'#420005');x.fillStyle=wg;x.beginPath();x.ellipse(0,0,68,64,.2,0,7);x.fill();x.shadowColor='transparent';
    x.strokeStyle='rgba(212,175,55,.65)';x.lineWidth=3;x.setLineDash([7,6]);x.beginPath();x.arc(0,0,46,0,7);x.stroke();x.setLineDash([]);
    const gg=x.createLinearGradient(-20,-24,20,24);gg.addColorStop(0,'#ffe29f');gg.addColorStop(.5,'#d4af37');gg.addColorStop(1,'#8a640f');x.fillStyle=gg;x.font='900 54px Cinzel,serif';x.textAlign='center';x.textBaseline='middle';x.fillText('C',0,4);
    x.fillStyle='rgba(255,255,255,.2)';x.beginPath();x.ellipse(-22,-30,26,11,-.5,0,7);x.fill();x.restore();
    x.restore();tex.needsUpdate=true};
   draw();document.fonts&&Promise.all(['700 40px Kalam','700 40px Caveat','900 40px Cinzel','900 40px Outfit'].map(f=>document.fonts.load(f,'Aa'))).then(draw).catch(()=>{});
   /* cuerpo de papel con bordes redondeados + barniz suave */
   const w=2.1,h=3.2,q=.14,s=new T.Shape();s.moveTo(-w/2+q,-h/2);s.lineTo(w/2-q,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+q);s.lineTo(w/2,h/2-q);s.quadraticCurveTo(w/2,h/2,w/2-q,h/2);s.lineTo(-w/2+q,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-q);s.lineTo(-w/2,-h/2+q);s.quadraticCurveTo(-w/2,-h/2,-w/2+q,-h/2);
   const geo=new T.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:3});geo.translate(0,0,-.04);
   const body=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:0xf5f4f0,roughness:.5,metalness:0,clearcoat:.5,clearcoatRoughness:.2}));
   const face=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,transparent:true,roughness:.55}));face.position.z=.062;
   const card=new T.Group();card.add(body,face);sc.add(card);
   /* confeti 3D dorado/rojo/plata */
   const N=90,im=new T.InstancedMesh(new T.BoxGeometry(.08,.16,.012),new T.MeshStandardMaterial({roughness:.35,metalness:.3}),N),d=new T.Object3D(),P=[],pal=['#d4af37','#b31010','#f5f4f0','#ffe29f','#FF4D5A','#c0c0c0'];
   for(let i=0;i<N;i++){P.push({x:(Math.random()-.5)*7,y:(Math.random()-.5)*6.6,z:(Math.random()-.5)*3-.6,s:.25+Math.random()*.5,r:Math.random()*6,v:.5+Math.random()*2});im.setColorAt(i,new T.Color(pal[i%6]))}sc.add(im);
   let mx=0,my=0,tx=0,ty=0,vis=true;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
   const fit=()=>{const b=canvas.getBoundingClientRect();r.setSize(b.width,b.height,false);cam.aspect=b.width/b.height;cam.position.z=b.width/b.height<.9?9.2:7.4;cam.updateProjectionMatrix()};fit();new ResizeObserver(fit).observe(canvas);
   new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(canvas);let last=performance.now();const t0=last+350;
   (function loop(now){requestAnimationFrame(loop);if(!vis)return;const dt=Math.min((now-last)/1000,.05),t=now/1000;last=now;tx+=(mx-tx)*.06;ty+=(my-ty)*.06;
    /* caída de entrada con rebote suave (easeOutBack) y luego flotación */
    const k=Math.max(0,Math.min((now-t0)/1600,1)),e=1+2.4*Math.pow(k-1,3)+1.4*Math.pow(k-1,2);
    card.position.y=(1-e)*5.2+Math.sin(t*1.1)*.12*k;card.rotation.z=(1-e)*.5;
    card.rotation.y=tx*1.1+Math.sin(t*.6)*.18;card.rotation.x=ty*.7+Math.cos(t*.5)*.06;pl.position.x=-3+tx*6;
    const m=1+5*(1-k);P.forEach((p,i)=>{p.y-=p.s*dt*m;if(p.y<-3.5)p.y=3.5;d.position.set(p.x,p.y,p.z);d.rotation.set(t*p.v+p.r,t*p.v*.7,p.r);d.updateMatrix();im.setMatrixAt(i,d.matrix)});im.instanceMatrix.needsUpdate=true;r.render(sc,cam)})(last);
   return true}catch(e){return false}}
};
