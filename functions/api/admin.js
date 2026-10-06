// POST /api/admin  {pin} -> {ok:true}. Solo confirma que el PIN es el de administrador (variable ADMIN_PIN en Cloudflare).
// Lo usa admin.html para habilitar la descarga de la tarjeta terminada (js/exportar.js). El cliente final nunca llama a esta ruta.
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const same=(a,b)=>{const x=new TextEncoder().encode(String(a)),y=new TextEncoder().encode(String(b));let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0};   // comparación en tiempo constante
export async function onRequestPost({request,env}){
 const {pin}=await request.json().catch(()=>({}));
 if(!env.ADMIN_PIN)return J({error:'Falta la variable ADMIN_PIN en Cloudflare (Settings > Variables and Secrets)'},500);
 if(typeof pin!=='string'||!pin||!same(pin,env.ADMIN_PIN)){await new Promise(r=>setTimeout(r,700));return J({ok:false,error:'PIN incorrecto'},401)}   // la espera frena los intentos a fuerza bruta
 return J({ok:true});
}
