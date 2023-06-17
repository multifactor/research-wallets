export async function onRequest(context) {
  try {
    const { request, env } = context;

    var logs = [];
    var log = await env.DB.list({prefix: "log#"});
    logs = logs.concat(log.keys)

    while (!log.list_complete) {
      cursor = log.cursor;
      log = await env.DB.list({prefix: "log#", cursor});
      logs = logs.concat(log.keys)
    }

    logs = logs.map(l => l.metadata)

    logs = logs.filter(l => l.time >= 1685602800000)

    logs = logs.sort((a, b) => a.time - b.time)

    return new Response(JSON.stringify(logs), { status: 200 });
  } catch (err) {
    return new Response("Internal error: " + err.name + ": " + err.message, { status: 500 });
  }
}
