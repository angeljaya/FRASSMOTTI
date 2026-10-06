export async function onRequestPost(context) {
  try {
    const datos = await context.request.json();
    
    // Genera un ID corto de 6 letras/números (ej. A5F9K2)
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Guarda los datos en tu base de datos KV
    await context.env.TARJETAS_KV.put(id, JSON.stringify(datos));
    
    return new Response(JSON.stringify({ success: true, id: id }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
