export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Falta el ID" }), { status: 400 });
    }
    
    // Busca los datos en KV usando el ID
    const datos = await context.env.TARJETAS_KV.get(id);
    
    if (!datos) {
      return new Response(JSON.stringify({ error: "Tarjeta no encontrada" }), { status: 404 });
    }
    
    return new Response(datos, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
