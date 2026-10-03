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
   const sc=new T.Scene(),cam=new T.PerspectiveCamera(35,1,.1,50);cam.position.z=7;
   sc.add(new T.AmbientLight(0xffffff,.75));const L=new T.DirectionalLight(0xffffff,1.2);L.position.set(3,4,5);sc.add(L);const pl=new T.PointLight(0xff4d5a,2.2,14);pl.position.set(-3,-1,3);sc.add(pl);
   /* textura de la cara de la tarjeta (canvas 2D) */
   const cv=document.createElement('canvas');cv.width=768;cv.height=1024;const x=cv.getContext('2d'),tex=new T.CanvasTexture(cv);tex.anisotropy=8;
   const draw=()=>{x.clearRect(0,0,768,1024);x.save();x.beginPath();x.roundRect(0,0,768,1024,76);x.clip();const g=x.createLinearGradient(0,0,768,1024);g.addColorStop(0,'#FF4D5A');g.addColorStop(1,'#FF9A6B');x.fillStyle=g;x.fillRect(0,0,768,1024);
    x.fillStyle='rgba(255,255,255,.14)';x.beginPath();x.arc(700,120,260,0,7);x.fill();x.beginPath();x.arc(60,980,220,0,7);x.fill();
    x.fillStyle='#fff';x.beginPath();x.arc(384,380,150,0,7);x.fill();x.fillStyle='#FF4D5A';x.textAlign='center';x.font='700 96px Outfit,sans-serif';x.fillText('PUM',384,412);
    x.fillStyle='#fff';x.font='120px "Instrument Serif",serif';x.fillText('Para Carla',384,690);x.font='500 36px Outfit,sans-serif';x.fillText('FRASSMOTTI',384,900);x.restore();tex.needsUpdate=true};draw();document.fonts&&document.fonts.ready.then(draw);
   /* cuerpo con bordes redondeados + barniz */
   const w=2.1,h=2.8,q=.2,s=new T.Shape();s.moveTo(-w/2+q,-h/2);s.lineTo(w/2-q,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+q);s.lineTo(w/2,h/2-q);s.quadraticCurveTo(w/2,h/2,w/2-q,h/2);s.lineTo(-w/2+q,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-q);s.lineTo(-w/2,-h/2+q);s.quadraticCurveTo(-w/2,-h/2,-w/2+q,-h/2);
   const geo=new T.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:3});geo.translate(0,0,-.04);
   const body=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:0xffffff,roughness:.25,metalness:.1,clearcoat:1,clearcoatRoughness:.08}));
   const face=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,transparent:true,roughness:.32}));face.position.z=.062;
   const card=new T.Group();card.add(body,face);sc.add(card);
   /* confeti 3D instanciado */
   const N=70,im=new T.InstancedMesh(new T.BoxGeometry(.07,.14,.012),new T.MeshStandardMaterial({roughness:.4}),N),d=new T.Object3D(),P=[],pal=['#FF4D5A','#F59E0B','#111827','#ffffff','#FF9A6B'];
   for(let i=0;i<N;i++){P.push({x:(Math.random()-.5)*7,y:(Math.random()-.5)*6.4,z:(Math.random()-.5)*3-.6,s:.25+Math.random()*.5,r:Math.random()*6,v:.5+Math.random()*2});im.setColorAt(i,new T.Color(pal[i%5]))}sc.add(im);
   let mx=0,my=0,tx=0,ty=0,vis=true;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
   const fit=()=>{const b=canvas.getBoundingClientRect();r.setSize(b.width,b.height,false);cam.aspect=b.width/b.height;cam.position.z=b.width/b.height<.9?8.6:7;cam.updateProjectionMatrix()};fit();new ResizeObserver(fit).observe(canvas);
   new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(canvas);let last=performance.now();
   (function loop(now){requestAnimationFrame(loop);if(!vis)return;const dt=Math.min((now-last)/1000,.05),t=now/1000;last=now;tx+=(mx-tx)*.06;ty+=(my-ty)*.06;
    card.rotation.y=tx*1.1+Math.sin(t*.6)*.18;card.rotation.x=ty*.7+Math.cos(t*.5)*.06;card.position.y=Math.sin(t*1.1)*.12;pl.position.x=-3+tx*6;
    P.forEach((p,i)=>{p.y-=p.s*dt;if(p.y<-3.3)p.y=3.3;d.position.set(p.x,p.y,p.z);d.rotation.set(t*p.v+p.r,t*p.v*.7,p.r);d.updateMatrix();im.setMatrixAt(i,d.matrix)});im.instanceMatrix.needsUpdate=true;r.render(sc,cam)})(last);
   return true}catch(e){return false}}
};
