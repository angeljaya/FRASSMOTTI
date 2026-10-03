// POST /api/verify {data, sig} -> {ok:true|false}. La tarjeta lo consulta al abrirse.
const J=o=>new Response(JSON.stringify(o),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const mac=async(k,d)=>{const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(k),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(d)))].map(b=>b.toString(16).padStart(2,'0')).join('')};
export async function onRequestPost({request,env}){
 const {data,sig}=await request.json().catch(()=>({}));
 if(!env.SIGNING_SECRET||typeof data!=='string'||typeof sig!=='string')return J({ok:false});
 const good=await mac(env.SIGNING_SECRET,data);let d=good.length^sig.length;
 for(let i=0;i<good.length;i++)d|=good.charCodeAt(i)^(sig.charCodeAt(i)||0);   // comparación en tiempo constante
 return J({ok:d===0});
}
