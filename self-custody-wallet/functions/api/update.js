const validateEmail = (email) => {
  return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

async function sha256(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export async function onRequest(context) {
  try {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email").trim().toLowerCase();
    const key = searchParams.get("key").trim().toLowerCase();

    if (request.method !== "POST") {
      return new Response("Expected POST", { status: 400 });
    } else if (typeof email !== "string" || email.length === 0) {
      return new Response("Expected email", { status: 400 });
    } else if (!validateEmail(email)) {
      return new Response("Invalid email", { status: 400 });
    } else {
      const dkey = "user#" + email.toLowerCase();
      const user = await env.DB.get(dkey);
      if (user !== null) {
        const cs = await sha256(key);
        if (cs === JSON.parse(user).cs) {
          await env.DB.put(dkey, await request.text());
          return new Response("Updated", { status: 200 });
        } else {
          return new Response("Invalid key", { status: 400 });
        }
      } else {
        return new Response("User does not exist", { status: 400 });
      }
    }
  } catch (err) {
    return new Response("Internal error: " + err.name + ": " + err.message, { status: 500 });
  }
}
