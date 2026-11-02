/* Barra de navegación inferior del index (solo < 1024 px, ver css/inicio.css).
   No tiene lógica propia: cada botón "pulsa" el botón que ya existe (#btn-ocasiones, #btn-tutorial) o abre WhatsApp con el mismo mensaje de wa.js.
   Si este archivo falla o se borra, el index queda como antes (las reglas de css/inicio.css solo ocultan los botones viejos mientras la barra existe). */
(function(){'use strict';
const $=id=>document.getElementById(id),bOc=$('btn-ocasiones'),bTu=$('btn-tutorial');
if(!bOc&&!bTu)return;
const IC={
 home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
 bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
 chat:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'};
const svg=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const wa=()=>{try{return TV.wa('Hola! Quiero información sobre FRASSMOTTI.')}catch(e){return null}};
const L=[{id:'home',t:'Inicio',ic:'home',run:()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'})}];
if(bOc)L.push({id:'oc',t:'Ocasiones',ic:'grid',run:()=>bOc.click()});
if(bTu)L.push({id:'tu',t:'Cómo funciona',ic:'bulb',run:()=>bTu.click()});
const w=wa();if(w)L.push({id:'wa',t:'WhatsApp',ic:'chat',href:w});
const nav=document.createElement('nav');nav.className='bnav';nav.setAttribute('aria-label','Navegación principal');
const ul=document.createElement('ul');
L.forEach(i=>{const li=document.createElement('li'),el=document.createElement(i.href?'a':'button');
 el.className='bnav-i';el.setAttribute('data-id',i.id);
 if(i.href){el.href=i.href;el.target='_blank';el.rel='noopener'}else{el.type='button';el.addEventListener('click',i.run)}
 el.innerHTML=svg(i.ic)+'<span>'+i.t+'</span>';li.append(el);ul.append(li)});
nav.append(ul);document.body.append(nav);
/* "Inicio" queda marcado mientras estás arriba de la página */
const home=nav.querySelector('[data-id="home"]');let tick=0;
const mark=()=>{tick=0;if(scrollY<160)home.setAttribute('aria-current','page');else home.removeAttribute('aria-current')};
addEventListener('scroll',()=>{if(!tick)tick=requestAnimationFrame(mark)},{passive:true});mark();
})();
