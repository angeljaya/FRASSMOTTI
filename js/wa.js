/* WhatsApp Click-to-Chat (wa.me): botón flotante + enlaces [data-wa] hacia TV.WHATSAPP (config.js) */
(function(){
 const msg=/personalizar/.test(location.pathname)?'Hola! Tengo una consulta sobre mi pedido de tarjeta FRASSMOTTI.':'Hola! Quiero información sobre FRASSMOTTI.';
 const init=()=>{
  document.querySelectorAll('[data-wa]').forEach(a=>{a.href=TV.wa(a.dataset.wa);a.target='_blank';a.rel='noopener'});
  const b=document.createElement('a');b.href=TV.wa(msg);b.target='_blank';b.rel='noopener';b.className='wa-fab';b.setAttribute('aria-label','Escríbenos por WhatsApp');
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg><span>Escríbenos</span>';
  document.body.append(b);setTimeout(()=>b.classList.add('wide'),3500)};
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init()})();
