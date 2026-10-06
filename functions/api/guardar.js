export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    // Generar ID aleatorio de 6 caracteres
    const id = Math.random().toString(36).substring(2, 8);
    
    // Guardar en Cloudflare KV
    await env.TARJETAS_KV.put(id, JSON.stringify(body));

    return new Response(JSON.stringify({ success: true, id: id }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}