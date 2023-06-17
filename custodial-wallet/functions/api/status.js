export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page").trim().toLowerCase().replaceAll('/', '');
    const key = "log#" + Date.now();
    const data = {
      time: Date.now(),
      page,
      ip: request.headers.get('CF-Connecting-IP'),
      ua: request.headers.get('User-Agent')
    }
    await env.DB.put(key, JSON.stringify(data), {
      metadata: data
    });
    return new Response("Log stored", { status: 200 });
  } catch (err) {
    return new Response("Internal error: " + err.name + ": " + err.message, { status: 500 });
  }
}
