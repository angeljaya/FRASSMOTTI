export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) return new Response("Falta el id", { status: 400 });

    const data = await env.TARJETAS_KV.get(id);
    if (!data) return new Response("No encontrado", { status: 404 });

    return new Response(data, {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
