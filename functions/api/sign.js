// POST /api/sign  {link, pin} -> {link firmado}. Solo el administrador (ADMIN_PIN) puede firmar.
// v2: comparación del PIN en tiempo constante, espera al fallar y bloqueo temporal por IP tras varios intentos fallidos.
const J=(o,s=200,h={})=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...h}});
const mac=async(k,d)=>{const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(k),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(d)))].map(b=>b.toString(16).padStart(2,'0')).join('')};
const same=(a,b)=>{const x=new TextEncoder().encode(String(a)),y=new TextEncoder().encode(String(b));let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0};
/* Bloqueo por IP: 5 fallos => 15 minutos. Usa el KV CARDS (claves "rl:IP"); si no hay KV, no bloquea pero sigue esperando 700 ms. */
const MAX_FAILS=5,LOCK_SECS=900;
const rlKey=r=>'rl:'+(r.headers.get('CF-Connecting-IP')||'sin-ip');
const fails=async(env,k)=>{try{return env.CARDS?parseInt(await env.CARDS.get(k)||'0',10)||0:0}catch(e){return 0}};
const addFail=async(env,k,n)=>{try{if(env.CARDS)await env.CARDS.put(k,String(n+1),{expirationTtl:LOCK_SECS})}catch(e){}};
const clear=async(env,k)=>{try{if(env.CARDS)await env.CARDS.delete(k)}catch(e){}};
export async function onRequestPost({request,env}){
 if(!env.ADMIN_PIN||!env.SIGNING_SECRET)return J({error:'Faltan las variables ADMIN_PIN y SIGNING_SECRET en Cloudflare'},500);
 const k=rlKey(request),n=await fails(env,k);
 if(n>=MAX_FAILS)return J({error:'Demasiados intentos. Espera 15 minutos.'},429,{'Retry-After':String(LOCK_SECS)});
 const {link,pin}=await request.json().catch(()=>({}));
 if(typeof pin!=='string'||!pin||!same(pin,env.ADMIN_PIN)){await addFail(env,k,n);await new Promise(r=>setTimeout(r,700));return J({error:'PIN incorrecto'},401)}
 if(n>0)await clear(env,k);
 if(typeof link!=='string'||link.length>1700000)return J({error:'Link inválido'},400);
 let u;try{u=new URL(link)}catch(e){return J({error:'Link inválido'},400)}
 if(u.protocol!=='https:'&&u.protocol!=='http:')return J({error:'Link inválido'},400);
 u.searchParams.delete('sig');
 const sig=await mac(env.SIGNING_SECRET,u.searchParams.toString()+'#'+u.hash.slice(1));
 u.searchParams.set('sig',sig);return J({link:u.toString()});
}
