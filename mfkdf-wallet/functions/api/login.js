export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email").trim().toLowerCase();

    if (request.method !== "POST") {
      return new Response("Expected POST", { status: 400 });
    } else if (typeof email !== "string" || email.length === 0) {
      return new Response("Expected email", { status: 400 });
    } else {
      const user = await env.DB.get("user#" + email);
      if (user === null) {
        return new Response("User not found", { status: 400 });
      } else {
        return new Response(user, { status: 200 });
      }
    }
  } catch (err) {
    return new Response("Internal error: " + err.name + ": " + err.message, { status: 500 });
  }
}
