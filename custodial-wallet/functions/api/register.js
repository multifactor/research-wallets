const validateEmail = (email) => {
  return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email").trim().toLowerCase();

    if (request.method !== "POST") {
      return new Response("Expected POST", { status: 400 });
    } else if (typeof email !== "string" || email.length === 0) {
      return new Response("Expected email", { status: 400 });
    } else if (!validateEmail(email)) {
      return new Response("Invalid email", { status: 400 });
    } else {
      const key = "user#" + email.toLowerCase();
      const user = await env.DB.get(key);
      if (user === null) {
        await env.DB.put(key, await request.text(), {
          metadata: {
            ip: request.headers.get('CF-Connecting-IP'),
            ua: request.headers.get('User-Agent')
          }
        });
        return new Response("User created", { status: 200 });
      } else {
        return new Response("User already exists", { status: 400 });
      }
    }
  } catch (err) {
    return new Response("Internal error: " + err.name + ": " + err.message, { status: 500 });
  }
}
