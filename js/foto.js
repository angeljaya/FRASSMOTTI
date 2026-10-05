/* v14 · Foto de la tarjeta: opcional, a color o blanco y negro, con recorte fácil.
   El cliente arrastra y hace zoom dentro de un marco con la MISMA proporción del espacio de la tarjeta.
   Todo ocurre en el navegador (no se sube a ningún servidor). */
const FOTO=(function(){
'use strict';
const st={src:null,img:null,name:'',z:1,cx:.5,cy:.5};
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* Rectángulo de origen (en píxeles de la foto) para una proporción dada */
function rect(aspect){
 const iw=st.img.naturalWidth,ih=st.img.naturalHeight;let sw,sh;
 if(iw/ih>aspect){sh=ih;sw=ih*aspect}else{sw=iw;sh=iw/aspect}
 sw/=st.z;sh/=st.z;
 const sx=clamp(st.cx*iw-sw/2,0,iw-sw),sy=clamp(st.cy*ih-sh/2,0,ih-sh);
 st.cx=(sx+sw/2)/iw;st.cy=(sy+sh/2)/ih;
 return{sx,sy,sw,sh,iw,ih};
}
/* Foto recortada lista para la tarjeta (siempre a color; el blanco y negro se aplica al mostrarla) */
function render(aspect,w){
 if(!st.img)return null;w=w||240;const r=rect(aspect),c=document.createElement('canvas');c.width=w;c.height=Math.round(w/aspect);
 c.getContext('2d').drawImage(st.img,r.sx,r.sy,r.sw,r.sh,0,0,c.width,c.height);
 return c.toDataURL('image/jpeg',.6);
}
function load(file){
 return new Promise((ok,no)=>{
  if(!file||!file.type.startsWith('image/')||file.size>10*1048576){no(new Error('Elige una imagen de hasta 10 MB'));return}
  const fr=new FileReader();
  fr.onload=()=>{const i=new Image();i.onload=()=>{st.src=fr.result;st.img=i;st.name=file.name;st.z=1;st.cx=.5;st.cy=.5;ok(st)};i.onerror=()=>no(new Error('No se pudo leer la imagen'));i.src=fr.result};
  fr.onerror=()=>no(new Error('No se pudo leer la imagen'));fr.readAsDataURL(file)});
}
function clear(){st.src=st.img=null;st.name='';st.z=1;st.cx=st.cy=.5}

/* Editor en ventana: aspect = ancho/alto del espacio de la foto; opts.bw() y opts.setBW(v) sincronizan el modo */
function edit(aspect,opts){
 const area=$('cropArea'),zoom=$('cropZoom'),im=area.querySelector('img'),m=$('mCrop');
 im.src=st.src;area.style.aspectRatio=String(aspect);zoom.value=st.z;
 const paint=()=>{const w=area.clientWidth||280,r=rect(aspect),s=w/r.sw;
  im.style.transform=`translate(${-r.sx*s}px,${-r.sy*s}px) scale(${s})`;im.style.width=r.iw+'px';im.style.height=r.ih+'px';zoom.value=st.z;
  area.classList.toggle('bw',opts.bw())};
 const setZ=z=>{st.z=clamp(z,1,4);paint()};
 /* arrastrar con un dedo / mouse, pellizcar con dos dedos */
 const P=new Map();let d0=0,z0=1;
 area.onpointerdown=e=>{area.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size===2){const [a,b]=[...P.values()];d0=Math.hypot(a[0]-b[0],a[1]-b[1]);z0=st.z}};
 area.onpointermove=e=>{if(!P.has(e.pointerId))return;const p=P.get(e.pointerId);
  if(P.size===1){const w=area.clientWidth,r=rect(aspect),s=w/r.sw;st.cx-=(e.clientX-p[0])/(s*r.iw);st.cy-=(e.clientY-p[1])/(s*r.ih)}
  P.set(e.pointerId,[e.clientX,e.clientY]);
  if(P.size===2){const [a,b]=[...P.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d0)st.z=clamp(z0*d/d0,1,4)}
  paint()};
 const up=e=>{P.delete(e.pointerId);d0=0};area.onpointerup=area.onpointercancel=up;
 area.onwheel=e=>{e.preventDefault();setZ(st.z*(e.deltaY<0?1.08:.93))};
 zoom.oninput=()=>setZ(+zoom.value);
 $('cropBW').onclick=()=>{opts.setBW(!opts.bw());paint();$('cropBW').textContent=opts.bw()?'Blanco y negro':'A color'};
 $('cropBW').textContent=opts.bw()?'Blanco y negro':'A color';
 $('cropReset').onclick=()=>{st.z=1;st.cx=st.cy=.5;paint()};
 $('cropOk').onclick=()=>{m.classList.remove('open');opts.done&&opts.done()};
 m.classList.add('open');requestAnimationFrame(paint);im.onload=paint;
}
return{st,load,render,clear,edit,rect};
})();
