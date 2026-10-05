/* v14 · Mensaje de la tarjeta en 3 tamaños:
   1 = Postal (texto corto que se ajusta solo), 2 = Deslizante (diapositivas que se deslizan),
   3 = Tipo libro (páginas que se pasan). Se usa en la vista previa y en la tarjeta final. */
const TM=(function(){
'use strict';
const W=s=>s.trim().split(/\s+/).filter(Boolean);
const PER={2:30,3:40};   /* palabras por diapositiva / página */

/* Parte el texto respetando párrafos y oraciones */
function paginate(text,per){
 const pages=[];let cur='',n=0;
 const push=()=>{if(cur){pages.push(cur);cur='';n=0}};
 const add=(s,newPara)=>{const w=W(s).length;if(n&&n+w>per)push();cur+=(cur?(newPara?'\n':' '):'')+s;n+=w};
 String(text||'').replace(/\r/g,'').split(/\n+/).map(s=>s.trim()).filter(Boolean).forEach(p=>{
  let first=true;
  p.split(/(?<=[.!?…])\s+/).filter(Boolean).forEach(s=>{
   if(W(s).length>per){const ws=W(s);for(let i=0;i<ws.length;i+=per){add(ws.slice(i,i+per).join(' '),first);first=false}}
   else{add(s,first);first=false}})});
 push();return pages.length?pages:[''];
}
/* Postal: el tamaño de la letra baja según la cantidad de palabras para que todo quepa */
function fit(host,text){
 const w=W(text||'').length,base=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--f-ms'))||30;
 host.style.fontSize=Math.round(base*(w<=12?1:w<=24?.8:w<=36?.68:.6))+'px';
}
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* Monta el mensaje en la carta. host = <p class="handwritten-msg"> */
function mount(host,text,tam,opt){
 opt=opt||{};tam=+tam||1;
 const card=host.closest('.carta-content');if(!card)return{};
 card.classList.remove('tam-1','tam-2','tam-3');card.classList.add('tam-'+tam);
 const old=card.querySelector('.msg-box'),keep=old?old._i||0:0;if(old)old.remove();
 if(tam===1){host.style.display='';if(!opt.keepText)host.textContent=text;fit(host,text);return{pages:1}}
 host.style.display='none';
 const pages=paginate(text,PER[tam]),box=el('div','msg-box tam-'+tam),nav=el('div','msg-nav'),prev=el('button','msg-btn','‹'),next=el('button','msg-btn','›'),mid=el('span','msg-mid');
 prev.type=next.type='button';prev.setAttribute('aria-label','Anterior');next.setAttribute('aria-label','Siguiente');
 nav.append(prev,mid,next);
 let go;
 if(tam===2){
  const sl=el('div','msg-slides');pages.forEach(p=>sl.append(el('div','msg-slide','<p>'+esc(p)+'</p>')));
  const dots=pages.map(()=>el('i'));dots.forEach(d=>mid.append(d));
  const cur=()=>Math.round(sl.scrollLeft/Math.max(1,sl.clientWidth));
  const paint=()=>{const c=cur();dots.forEach((d,i)=>d.classList.toggle('on',i===c));prev.disabled=c<=0;next.disabled=c>=pages.length-1;box._i=c};
  go=i=>{sl.scrollTo({left:Math.max(0,Math.min(pages.length-1,i))*sl.clientWidth,behavior:opt.instant?'auto':'smooth'})};
  sl.addEventListener('scroll',()=>requestAnimationFrame(paint),{passive:true});
  prev.onclick=()=>go(cur()-1);next.onclick=()=>go(cur()+1);
  box.append(sl,nav);card.querySelector('.card-actions').before(box);
  requestAnimationFrame(()=>{if(keep)sl.scrollLeft=keep*sl.clientWidth;paint()});
  if(pages.length>1)box.append(el('p','msg-hint','Desliza para seguir leyendo'));
 }else{
  const bk=el('div','book'),pg=pages.map((p,i)=>{const e=el('div','bk-pg','<div class="bk-in"><p>'+esc(p)+'</p><span class="bk-num">'+(i+1)+'</span></div>');e.style.zIndex=pages.length-i;bk.append(e);return e});
  let i=Math.min(keep,pages.length-1);
  const paint=()=>{pg.forEach((e,k)=>e.classList.toggle('flip',k<i));mid.textContent=(i+1)+' / '+pages.length;prev.disabled=i<=0;next.disabled=i>=pages.length-1;box._i=i};
  go=k=>{i=Math.max(0,Math.min(pages.length-1,k));paint()};
  prev.onclick=()=>go(i-1);next.onclick=()=>go(i+1);
  let x0=null;bk.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
  bk.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>34)go(i+(dx<0?1:-1))});
  bk.addEventListener('click',e=>{const r=bk.getBoundingClientRect();if(e.clientX-r.left>r.width/2)go(i+1);else go(i-1)});
  box.append(bk,nav);card.querySelector('.card-actions').before(box);paint();
  if(pages.length>1)box.append(el('p','msg-hint','Toca los lados o desliza para pasar la página'));
 }
 return{pages:pages.length,go};
}
return{paginate,fit,mount,count:s=>W(s||'').length,PER};
})();
