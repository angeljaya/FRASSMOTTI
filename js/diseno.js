/* v14 · Motor de diseño de la tarjeta (compartido por personalizar, tarjeta final y hero).
   Aplica: flores/stickers según género + ocasión, marco de la foto, decoración temática,
   fondo con degradado (que también cambia con el color elegido) y tipografía. */
const TD=(function(){
'use strict';
const A='var(--card-accent)',G='var(--gold-primary)',D='var(--wd)';
const star='M50 5 L61 35 L95 35 L68 55 L78 88 L50 68 L22 88 L32 55 L5 35 L39 35 Z';
const heart='M50 86 C8 56 4 28 24 17 C38 10 50 22 50 31 C50 22 62 10 76 17 C96 28 92 56 50 86Z';
const rot=(n,f)=>Array.from({length:n},(_,i)=>f(i)).join('');
const tulip=(x,y,s)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M0 0 C-17 -6 -18 -36 -10 -48 L0 -31 L10 -48 C18 -36 17 -6 0 0Z" style="fill:${A};stroke:rgba(0,0,0,.28)" stroke-width="1.2"/><path d="M0 0 C-6 -10 -5 -28 0 -35 C5 -28 6 -10 0 0Z" style="fill:#fff;opacity:.3"/></g>`;
const leafPts=(p0,p1,p2,n)=>Array.from({length:n},(_,i)=>{const t=(i+1)/(n+1),u=1-t,x=u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],y=u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1],
 dx=2*u*(p1[0]-p0[0])+2*t*(p2[0]-p1[0]),dy=2*u*(p1[1]-p0[1])+2*t*(p2[1]-p1[1]),a=Math.atan2(dy,dx)*180/Math.PI;return{x,y,a}});

/* Sticker grande (viewBox 150x150) por tipo de flor/tema */
const FLOR={
 rosas:`<path d="M70 140 Q80 100 60 70 M75 140 Q90 100 110 80" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/><path d="M70 130 Q50 100 70 100 Q80 120 70 130 Z" fill="#d4af37"/>
 <g transform="translate(55,65) scale(0.8) rotate(-10)"><path d="M0 0 Q20 -30 40 0 Q20 30 0 0 Z M0 0 Q-20 -30 -40 0 Q-20 30 0 0 Z M0 0 Q30 20 0 40 Q-30 20 0 0 Z M0 0 Q30 -20 0 -40 Q-30 -20 0 0 Z" fill="#ff4d4d" stroke="#b31010" stroke-width="1"/><circle cx="0" cy="0" r="10" fill="#800000"/><circle cx="0" cy="0" r="5" fill="#330000"/></g>
 <g transform="translate(105,75) scale(0.6) rotate(15)"><path d="M0 0 Q20 -30 40 0 Q20 30 0 0 Z M0 0 Q-20 -30 -40 0 Q-20 30 0 0 Z M0 0 Q30 20 0 40 Q-30 20 0 0 Z M0 0 Q30 -20 0 -40 Q-30 -20 0 0 Z" fill="#ff6666" stroke="#b31010" stroke-width="1"/><circle cx="0" cy="0" r="10" fill="#800000"/><circle cx="0" cy="0" r="5" fill="#330000"/></g>`,
 tulipanes:`<g fill="none" stroke-linecap="round" stroke-width="5" stroke="#4f9a56"><path d="M75 146 Q60 112 55 80"/><path d="M80 146 Q94 118 100 92"/><path d="M78 146 Q79 106 78 64"/></g>
 <path d="M76 142 Q40 126 36 100 Q66 112 76 142Z" fill="#5aa862"/><path d="M80 142 Q112 130 118 106 Q90 114 80 142Z" fill="#4f9a56"/>${tulip(55,80,1)}${tulip(100,92,.85)}${tulip(78,64,.8)}`,
 girasol:`<path d="M75 146 Q72 110 75 80" fill="none" stroke="#4f9a56" stroke-width="6" stroke-linecap="round"/><path d="M74 128 Q46 122 40 100 Q66 104 74 128Z" fill="#5aa862"/>
 <g transform="translate(75,60)">${rot(14,i=>`<ellipse cx="0" cy="-27" rx="8" ry="16" transform="rotate(${i*360/14})" fill="#f8c400" stroke="#c28a00" stroke-width="1"/>`)}<circle r="17" fill="#5b3a1a" stroke="#3a2410" stroke-width="1.5"/><circle r="9" fill="#7a4e24"/>${rot(8,i=>`<circle cx="${(Math.cos(i)*5).toFixed(1)}" cy="${(Math.sin(i)*5).toFixed(1)}" r="1.1" fill="#d9a066"/>`)}</g>`,
 cantuta:`<defs><linearGradient id="kgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd23f"/><stop offset=".45" stop-color="#e8362b"/><stop offset="1" stop-color="#b3001b"/></linearGradient></defs>
 <path d="M75 146 Q70 112 76 82" fill="none" stroke="#2f7d3a" stroke-width="5" stroke-linecap="round"/><path d="M74 130 Q46 124 40 102 Q66 106 74 130Z" fill="#3d9148"/><path d="M78 132 Q106 124 112 104 Q86 108 78 132Z" fill="#2f7d3a"/>
 <g transform="translate(76,70) scale(.9)">${rot(5,i=>`<path d="M0 0 C-15 -12 -13 -42 0 -60 C13 -42 15 -12 0 0Z" transform="rotate(${i*72-20})" fill="url(#kgr)" stroke="#8a0016" stroke-width="1"/>`)}<circle r="8" fill="#ffd23f" stroke="#c28a00"/><circle r="3.5" fill="#2f7d3a"/></g>`,
 corazones:`<path d="${heart}" transform="translate(8,62) scale(.62)" style="fill:${A};stroke:rgba(0,0,0,.25)" stroke-width="2"/><path d="${heart}" transform="translate(62,34) scale(.72)" style="fill:${A};opacity:.82;stroke:rgba(0,0,0,.2)" stroke-width="2"/><path d="${heart}" transform="translate(40,10) scale(.42)" style="fill:${G};stroke:rgba(0,0,0,.2)" stroke-width="2.5"/><path d="${heart}" transform="translate(96,96) scale(.36)" style="fill:${G};stroke:rgba(0,0,0,.2)" stroke-width="3"/>`,
 hojas:`<path d="M26 142 Q46 72 112 26" fill="none" style="stroke:${G}" stroke-width="4" stroke-linecap="round"/>${leafPts([26,142],[46,72],[112,26],7).map((p,i)=>[-1,1].map(s=>`<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="5.5" ry="${(15-i*.6).toFixed(1)}" transform="rotate(${(p.a+90+s*38).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}) translate(0,${s*-7})" style="fill:${G};stroke:${D}" stroke-width=".8"/>`).join('')).join('')}`,
 estrellas:`<defs><linearGradient id="sg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#b0b0b0"/><stop offset="1" stop-color="#505050"/></linearGradient></defs>
 <path d="${star}" transform="translate(44,28) scale(.9) rotate(-12 50 50)" fill="url(#sg2)" stroke="#fff" stroke-width="2"/><path d="${star}" transform="translate(8,76) scale(.55) rotate(14 50 50)" fill="url(#sg2)" stroke="#fff" stroke-width="3"/><path d="${star}" transform="translate(88,90) scale(.5) rotate(-6 50 50)" fill="url(#sg2)" stroke="#fff" stroke-width="3"/>`,
 calabaza:`<ellipse cx="52" cy="96" rx="28" ry="34" fill="#f07a14" stroke="#9a4a00" stroke-width="2"/><ellipse cx="98" cy="96" rx="28" ry="34" fill="#f07a14" stroke="#9a4a00" stroke-width="2"/><ellipse cx="75" cy="96" rx="30" ry="37" fill="#ff9a2e" stroke="#9a4a00" stroke-width="2"/>
 <path d="M72 60 Q70 44 80 36 L86 40 Q80 48 82 60Z" fill="#4f7a2a" stroke="#2f4f14" stroke-width="1.5"/><path d="M82 46 Q100 38 106 50" fill="none" stroke="#4f7a2a" stroke-width="3" stroke-linecap="round"/>
 <path d="M58 86 L70 86 L64 74Z M80 86 L92 86 L86 74Z" fill="#2b1700"/><path d="M58 106 Q64 118 75 112 Q86 118 92 106 L86 108 L82 114 L75 108 L68 114 L64 108Z" fill="#2b1700"/>`,
 copo:`<g transform="translate(58,60)" stroke="#6fb4e8" stroke-width="4" stroke-linecap="round" fill="none">${rot(6,i=>`<g transform="rotate(${i*60})"><path d="M0 0 L0 -40"/><path d="M0 -26 L-9 -35 M0 -26 L9 -35"/><path d="M0 -14 L-6 -20 M0 -14 L6 -20"/></g>`)}<circle r="4" fill="#fff" stroke="#6fb4e8" stroke-width="2"/></g>
 <path d="M96 128 Q116 104 142 122 Q122 146 96 128Z" fill="#2f7d3a" stroke="#1d5326" stroke-width="1.5"/><path d="M96 128 Q100 100 126 98 Q126 124 96 128Z" fill="#3d9148" stroke="#1d5326" stroke-width="1.5"/><circle cx="104" cy="122" r="5.5" fill="#d62828"/><circle cx="113" cy="126" r="5.5" fill="#d62828"/><circle cx="109" cy="116" r="5.5" fill="#d62828"/>`,
 cempasuchil:`<path d="M75 146 Q70 116 76 92" fill="none" stroke="#3d7a36" stroke-width="5" stroke-linecap="round"/><path d="M74 132 Q46 126 40 106 Q66 108 74 132Z" fill="#4a8f42"/>
 <g transform="translate(76,66)">${rot(16,i=>`<ellipse cx="0" cy="-30" rx="9" ry="16" transform="rotate(${i*22.5})" fill="#e08a00" stroke="#a65f00" stroke-width="1"/>`)}${rot(12,i=>`<ellipse cx="0" cy="-20" rx="7.5" ry="13" transform="rotate(${i*30+15})" fill="#f6a81a" stroke="#b46e00" stroke-width=".8"/>`)}${rot(8,i=>`<ellipse cx="0" cy="-11" rx="6" ry="9" transform="rotate(${i*45})" fill="#ffc93c"/>`)}<circle r="5" fill="#8a4b00"/></g>`
};
/* Sticker chico (viewBox 100x100): estrella plateada, corazón o estrella dorada */
const MINI={
 star:`<defs><linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#b0b0b0"/><stop offset="100%" stop-color="#505050"/></linearGradient></defs><path d="${star}" fill="url(#silver)" stroke="#fff" stroke-width="2"/>`,
 heart:`<path d="${heart}" style="fill:${A};stroke:#fff" stroke-width="3"/>`,
 gold:`<path d="${star}" style="fill:${G};stroke:#fff" stroke-width="3"/>`
};
const MINI_DE={corazones:'heart',hojas:'gold',cempasuchil:'gold',copo:'gold',calabaza:'gold',tulipanes:'star',girasol:'gold',cantuta:'gold'};

/* ---- API ---- */
const css=(k,v)=>document.documentElement.style.setProperty(k,v);
function theme(t,colKey,fuId){
 const p=colKey&&TV.PALETA[colKey],acc=p?p.ac:t.K.ac;
 TV.applyTheme(t,acc);
 css('--card-bg',TV.fondo(t,colKey||null));
 if(p){css('--wl',p.sw==='#facc15'?'#e0a800':p.sw);css('--wd',`color-mix(in srgb,${p.ac} 55%,#000)`)}   /* el sello también toma el color elegido */
 const f=TV.fuente(fuId);css('--f-title',f.t);css('--f-msg',f.m);css('--f-ts',f.ts+'px');css('--f-ms',f.ms+'px');
 return acc;
}
function decorate(root,t,d){
 const key=d.id+'|'+t.id;if(root._dk===key)return;root._dk=key;
 const fl=root.querySelector('.sticker-flowers'),s1=root.querySelector('.sticker-star-1'),s2=root.querySelector('.sticker-star-2'),fr=root.querySelector('.photo-frame'),bg=root.querySelector('.carta-bg');
 if(fl){fl.setAttribute('viewBox','0 0 150 150');fl.innerHTML=FLOR[d.flor]||FLOR.estrellas}
 const mi=MINI[MINI_DE[d.flor]||'star'];
 [s1,s2].forEach((s,i)=>{if(!s)return;s.setAttribute('viewBox','0 0 100 100');s.innerHTML=i===0?mi:mi.replace(/<defs>.*?<\/defs>/,'').replace('url(#silver)','url(#silver)')});
 if(fr)fr.className='photo-frame mk-'+d.marco;
 if(bg){let l=bg.querySelector('.deco-layer');if(l)l.remove();const e=TV.DECO[t.id]||['✨','✨','✨'];
  l=document.createElement('div');l.className='deco-layer';l.setAttribute('aria-hidden','true');
  l.innerHTML=[[4,3,-14,30],[78,5,12,34],[2,40,10,26],[84,44,-8,28],[6,84,-10,32],[80,86,14,30]].map((p,i)=>`<span style="left:${p[0]}%;top:${p[1]}%;transform:rotate(${p[2]}deg);font-size:${p[3]}px">${e[i%e.length]}</span>`).join('');
  bg.prepend(l)}
}
/* v15 · Plantilla de fondo integrada: la imagen de la ocasión NO es una foto, es la textura de la tarjeta.
   Capas (de abajo hacia arriba): imagen con máscara degradada + tinte del color elegido + velo central para que el texto siempre se lea. */
function tplHTML(t,i){const p=TV.tpl(t,i);if(!p)return '';
 return `<span class="tpl-img" style="--tpl:url('${encodeURI(p.src)}');--tpl-op:${p.op};--tpl-y:${p.y}%"></span><span class="tpl-tint"></span><span class="tpl-veil"></span>`}
function template(root,t,i){
 const bg=root.querySelector('.carta-bg');if(!bg)return;const key=t.id+'|'+(+i||0);if(bg._tk===key)return;bg._tk=key;
 let l=bg.querySelector(':scope>.tpl-layer');if(l)l.remove();
 const h=tplHTML(t,i);bg.classList.toggle('con-plantilla',!!h);if(!h)return;
 l=document.createElement('div');l.className='tpl-layer';l.setAttribute('aria-hidden','true');l.innerHTML=h;bg.prepend(l)}
/* Aplica todo de una vez. o = {t, g, dis, col, fu, v} (v = número de plantilla de fondo 0-2) */
function apply(root,o){const d=TV.diseno(o.dis,o.g||'m',o.t.id);theme(o.t,o.col,o.fu);decorate(root,o.t,d);template(root,o.t,o.v);return d}

/* El título editable se encoge solo si es largo, para que la tipografía nunca se desarme */
function titleFit(el,text){const base=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--f-ts'))||62;el.style.fontSize=Math.round(base*Math.min(1,9.5/Math.max((text||'').length,1)))+'px'}
return{FLOR,MINI,MINI_DE,theme,decorate,template,tplHTML,apply,titleFit};
})();
