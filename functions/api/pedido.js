// Buzón de pedidos con Cloudflare KV (namespace PEDIDOS). El servidor NUNCA puede leer el contenido: llega cifrado desde el navegador del cliente.
//   POST /api/pedido {b:{k,i,c}, m:{oc,fmt,monto}, tok, code?, ts?} -> {code}   PÚBLICO: guarda un pedido cifrado. Con code (lo propone el cliente) es idempotente: mismo code+tok = mismo pedido (reintentos y botón "Cambiar algo").
//   POST /api/pedido {action:'list'|'get'|'del', pin, code?}                    SOLO ADMINISTRADOR (ADMIN_PIN): lista, descarga o borra pedidos.
// Variables/enlaces en Cloudflare: KV PEDIDOS (obligatorio), ADMIN_PIN, KV CARDS (opcional: comparte el bloqueo de PIN), TURNSTILE_SECRET (opcional: anti-bots).
const TTL=30*86400,MAX_BODY=900000,MAX_FAILS=5,LOCK_SECS=900,IP_MAX=40;   /* v2: IP_MAX era 10. Las operadoras de Bolivia comparten UNA misma IP entre muchísimos celulares, así que 10 por hora dejaba fuera a clientes reales */
const log=(...a)=>{try{console.log('[pedido]',...a)}catch(e){}};   /* se ve en Cloudflare > tu proyecto > Functions > Real-time logs */
const J=(o,s=200,h={})=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...h}});
const same=(a,b)=>{const x=new TextEncoder().encode(String(a)),y=new TextEncoder().encode(String(b));let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0};
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const AL='23456789ABCDEFGHJKMNPQRSTUVWXYZ';   // sin 0/O/1/I/L para que el código se lea bien
const newCode=()=>{let s='';while(s.length<8){for(const x of crypto.getRandomValues(new Uint8Array(16)))if(x<248&&s.length<8)s+=AL[x%31]}return s.slice(0,4)+'-'+s.slice(4)};   // 248 = 31*8: sin sesgo
const B64=/^[A-Za-z0-9+\/=_-]+$/,CODE=/^[A-Z2-9]{4}-[A-Z2-9]{4}$/,str=(x,n)=>String(x==null?'':x).replace(/[\u0000-\u001f]/g,' ').slice(0,n);
const ip=r=>r.headers.get('CF-Connecting-IP')||'sin-ip';
/* bloqueo del PIN (igual que sign.js/card.js: mismas claves "rl:IP" y mismo contador si existe el KV CARDS) */
const rlKv=env=>env.CARDS||env.PEDIDOS;
const fails=async(env,k)=>{try{return parseInt(await rlKv(env).get(k)||'0',10)||0}catch(e){return 0}};
const addFail=async(env,k,n)=>{try{await rlKv(env).put(k,String(n+1),{expirationTtl:LOCK_SECS})}catch(e){}};

async function admin(env,request,b){
 if(!env.ADMIN_PIN)return J({error:'Falta la variable ADMIN_PIN en Cloudflare'},500);
 const k='rl:'+ip(request),n=await fails(env,k);
 if(n>=MAX_FAILS)return J({error:'Demasiados intentos. Espera 15 minutos.'},429,{'Retry-After':String(LOCK_SECS)});
 if(typeof b.pin!=='string'||!b.pin||!same(b.pin,env.ADMIN_PIN)){await addFail(env,k,n);await new Promise(r=>setTimeout(r,700));return J({error:'PIN incorrecto'},401)}
 if(n>0){try{await rlKv(env).delete(k)}catch(e){}}
 if(b.action==='list'){
  const out=[];let cursor;
  for(let i=0;i<5;i++){const r=await env.PEDIDOS.list({prefix:'p:',cursor});for(const x of r.keys){const m=x.metadata||{};out.push({code:x.name.slice(2),t:m.t||0,oc:m.oc||'',fmt:m.fmt||'',monto:m.monto||''})}if(r.list_complete)break;cursor=r.cursor}
  return J({items:out.sort((a,c)=>c.t-a.t)})}
 const code=String(b.code||'').toUpperCase();
 if(!CODE.test(code))return J({error:'Código inválido'},400);
 if(b.action==='get'){const raw=await env.PEDIDOS.get('p:'+code);if(!raw)return J({error:'No existe o ya caducó'},404);const d=JSON.parse(raw);return J({b:d.b,t:d.t})}
 if(b.action==='del'){await env.PEDIDOS.delete('p:'+code);return J({ok:true})}
 return J({error:'Acción inválida'},400);
}

export async function onRequestPost({request,env}){
 if(!env.PEDIDOS)return J({error:'Falta el KV: crea el namespace y enlázalo con el nombre PEDIDOS'},500);
 const raw=await request.text();
 if(raw.length>MAX_BODY){log('rechazado 413',raw.length);return J({error:'El pedido es demasiado grande (reduce la foto).'},413)}
 let b;try{b=JSON.parse(raw)}catch(e){return J({error:'Datos inválidos'},400)}
 if(!b||typeof b!=='object')return J({error:'Datos inválidos'},400);
 if(b.action)return admin(env,request,b);

 /* ----- público: guardar un pedido cifrado ----- */
 const e=b.b||{};
 if(typeof e.k!=='string'||typeof e.i!=='string'||typeof e.c!=='string'||e.k.length>1000||e.i.length>40||e.c.length>MAX_BODY-2000||!B64.test(e.k)||!B64.test(e.i)||!B64.test(e.c))return J({error:'Datos inválidos'},400);
 if(typeof b.tok!=='string'||!/^[A-Za-z0-9_-]{16,64}$/.test(b.tok))return J({error:'Datos inválidos'},400);
 /* freno a bots: Turnstile (si configuraste TURNSTILE_SECRET) + máximo de pedidos por hora y por IP */
 if(env.TURNSTILE_SECRET){
  let ok=false;try{const f=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:str(b.ts,2048),remoteip:ip(request)});
   const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:f});ok=!!(await r.json()).success}catch(x){}
  if(!ok){log('rechazado 403 turnstile');return J({error:'No pudimos verificar que eres una persona. Recarga la página e inténtalo de nuevo.'},403)}}
 const ik='ip:'+ip(request)+':'+Math.floor(Date.now()/3600000);let c=0;
 try{c=parseInt(await env.PEDIDOS.get(ik)||'0',10)||0}catch(x){}
 if(c>=IP_MAX){log('rechazado 429 ip',ip(request),c);return J({error:'Demasiados pedidos desde esta conexión. Inténtalo más tarde o escríbenos por WhatsApp.'},429)}
 try{await env.PEDIDOS.put(ik,String(c+1),{expirationTtl:3700})}catch(x){}

 const th=await sha(b.tok),m=b.m||{},now=Date.now();
 const meta={t:now,oc:str(m.oc,40),fmt:str(m.fmt,30),monto:str(m.monto,8)};
 let code=typeof b.code==='string'?b.code.toUpperCase():'';
 if(code){   /* el cliente propone su código (así un reintento por mala señal NO duplica el pedido): si está libre se crea; si existe, solo se reemplaza con el mismo token */
  if(!CODE.test(code))return J({error:'Código inválido'},400);
  const old=await env.PEDIDOS.get('p:'+code);
  if(old){let d={};try{d=JSON.parse(old)}catch(x){}
   if(!d.th||!same(d.th,th)){log('rechazado 409 código en uso',code);return J({error:'Código en uso'},409)}
   meta.t=d.t||now}}
 else{for(let i=0;i<6;i++){const k=newCode();if(!(await env.PEDIDOS.get('p:'+k))){code=k;break}}
  if(!code)return J({error:'No se pudo generar un código libre'},500)}
 await env.PEDIDOS.put('p:'+code,JSON.stringify({b:{k:e.k,i:e.i,c:e.c},th,t:meta.t}),{expirationTtl:TTL,metadata:meta});
 return J({code});
}
