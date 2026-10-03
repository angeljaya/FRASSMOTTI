// POST /api/sign  {link, pin} -> {link firmado}. Solo el administrador (ADMIN_PIN) puede firmar.
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const mac=async(k,d)=>{const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(k),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(d)))].map(b=>b.toString(16).padStart(2,'0')).join('')};
export async function onRequestPost({request,env}){
 const {link,pin}=await request.json().catch(()=>({}));
 if(!env.ADMIN_PIN||!env.SIGNING_SECRET)return J({error:'Faltan las variables ADMIN_PIN y SIGNING_SECRET en Cloudflare'},500);
 if(!pin||pin!==env.ADMIN_PIN)return J({error:'PIN incorrecto'},401);
 let u;try{u=new URL(link)}catch(e){return J({error:'Link inválido'},400)}
 u.searchParams.delete('sig');
 const sig=await mac(env.SIGNING_SECRET,u.searchParams.toString()+'#'+u.hash.slice(1));
 u.searchParams.set('sig',sig);return J({link:u.toString()});
}
