// Links cortos con Cloudflare KV.
//   POST /api/card {qs, h, pin} -> {id}        guarda la tarjeta (solo el administrador: ADMIN_PIN)
//   GET  /api/card?id=XXXXXXXX  -> {qs, h}     la lee tarjeta.html para pintar la tarjeta
// qs = lo que antes iba después del "?" del link; h = el payload (#hash: foto, secreto, pistas, audio...). Se guardan tal cual.
const ID_LEN=8;                                   // 8 caracteres = 218 billones de combinaciones (puedes bajarlo a 6 si quieres un QR aún más simple)
const AL='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const J=(o,s=200,c='no-store')=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json','Cache-Control':c}});
const same=(a,b)=>{const x=new TextEncoder().encode(String(a)),y=new TextEncoder().encode(String(b));let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0};
const newId=()=>{let s='';while(s.length<ID_LEN){for(const x of crypto.getRandomValues(new Uint8Array(16)))if(x<248&&s.length<ID_LEN)s+=AL[x%62]}return s};   // x<248: sin sesgo al repartir entre 62 caracteres

export async function onRequestPost({request,env}){
 if(!env.CARDS)return J({error:'Falta el KV: crea el namespace y enlázalo con el nombre CARDS (ver wrangler.toml)'},500);
 if(!env.ADMIN_PIN)return J({error:'Falta la variable ADMIN_PIN en Cloudflare'},500);
 const {qs,h,pin}=await request.json().catch(()=>({}));
 if(typeof pin!=='string'||!pin||!same(pin,env.ADMIN_PIN)){await new Promise(r=>setTimeout(r,700));return J({error:'PIN incorrecto'},401)}
 if(typeof qs!=='string'||qs.length>4000||(h!==undefined&&(typeof h!=='string'||h.length>1500000||!/^[A-Za-z0-9_-]*$/.test(h))))return J({error:'Datos inválidos'},400);
 let id;for(let i=0;i<5;i++){const c=newId();if(!(await env.CARDS.get(c))){id=c;break}}
 if(!id)return J({error:'No se pudo generar un id libre'},500);
 await env.CARDS.put(id,JSON.stringify({qs,h:h||'',t:Date.now()}));
 return J({id});
}
export async function onRequestGet({request,env}){
 if(!env.CARDS)return J({error:'Falta el KV CARDS'},500);
 const id=new URL(request.url).searchParams.get('id')||'';
 if(!/^[A-Za-z0-9]{6,12}$/.test(id))return J({error:'Id inválido'},400);
 const raw=await env.CARDS.get(id);
 if(!raw)return J({error:'No existe'},404);
 const d=JSON.parse(raw);return J({qs:d.qs,h:d.h},200,'public, max-age=300');   // la tarjeta guardada nunca cambia, por eso se puede cachear
}
