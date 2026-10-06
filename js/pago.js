/* Pago: QR descargable, comprobante adjunto, formato (digital/físico) y envío a WhatsApp.
   WhatsApp no permite adjuntar archivos por link: en celular se usa el menú "Compartir" (texto + captura juntos);
   si el equipo no lo soporta, se abre el chat con el texto y el cliente adjunta la captura. */
(function(){'use strict';
const g=id=>document.getElementById(id),box=g('qrBox'),dl=g('qrDl'),im=box&&box.querySelector('img');
const fail=()=>{box.innerHTML='<p class="text-sm text-gray-700 p-3">El QR no está disponible por ahora.</p><a class="underline text-sm font-medium" target="_blank">Pedir el QR por WhatsApp</a>';box.querySelector('a').href=TV.wa('Hola! Necesito el QR de pago de FRASSMOTTI.');dl&&dl.classList.add('hidden')};
if(!TV.QR_IMAGE||!im){dl&&dl.classList.add('hidden')}else{dl.href=TV.QR_IMAGE;im.addEventListener('error',fail);if(im.complete&&!im.naturalWidth)fail()}
/* Formato: link digital o accesorio físico */
const fo=g('formato');if(fo)fo.innerHTML='<option>Solo link digital</option>'+(TV.FISICOS||[]).filter(f=>f.activo!==false).map(f=>`<option>${f.name}</option>`).join('');
const prev=window.extraLines;window.extraLines=()=>[...(prev?prev():[]),'Formato: '+(fo?fo.value:'Solo link digital')+(fo&&fo.selectedIndex>0?' (precio a confirmar)':'')];
/* Comprobante */
const cp=g('comp'),info=g('compInfo');
cp.addEventListener('change',()=>{const f=cp.files[0];info.textContent='';if(!f)return;if(!f.type.startsWith('image/')||f.size>10*1048576){cp.value='';info.textContent='Sube una imagen (captura) de hasta 10 MB.';return}info.textContent='Adjunto: '+f.name});
window.sinComprobante=()=>{if(cp.files[0])return false;toast('Adjunta la captura de tu comprobante de Yape');cp.focus();return true};
/* Abre WhatsApp y recuerda si el navegador bloqueó la ventana (para ofrecer un botón en el aviso de éxito) */
const waAbrir=u=>{const w=window.open(u,'_blank');window.__waUrl=u;window.__waBlocked=!w};
window.enviarPedido=async t=>{window.__waBlocked=false;const f=cp.files[0],full=t+'\nComprobante: '+f.name;
 /* v14: devuelve true si el pedido salió (menú Compartir o chat abierto) y false si el cliente canceló */
 let ph=null;try{ph=window.fotoParaEnviar?await window.fotoParaEnviar():null}catch(e){}
 const sets=ph?[[f,ph],[f]]:[[f]];
 for(const files of sets){try{if(navigator.canShare&&navigator.canShare({files})){await navigator.share({files,text:full});toast('Elige WhatsApp y el contacto FRASSMOTTI (+591 '+TV.WHATSAPP.slice(3)+')');return true}}catch(e){if(e&&e.name==='AbortError')return false}}
 /* Sin menú Compartir: abre el chat con el texto; si el pedido es muy largo, se copia para pegarlo */
 if(TV.wa(full).length>7000){try{await navigator.clipboard.writeText(full)}catch(e){}waAbrir(TV.wa('Hola! Mi pedido FRASSMOTTI es largo: lo pego en el siguiente mensaje.'));toast('Copiamos tu pedido completo: pégalo en el chat y adjunta tu comprobante'+(ph?' y tu foto':''));return true}
 waAbrir(TV.wa(full));toast('Adjunta la captura de tu comprobante'+(ph?' y tu foto':'')+' en el chat');return true};
})();
