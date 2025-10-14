const people = require("./people");

/**
 * Check for a valid API url call and handle.
 * @param { URL } parsedurl
 * @param { object } res
 * @param { object } req
 * @param { object } receivedobj
 */
async function handleapi(parsedurl, res, req, receivedobj) {
  const pathname = parsedurl.pathname;

  const personIdMatch = pathname.match(/^\/api\/people\/(\d+)$/);

  if (personIdMatch && req.method === "PATCH") {
    const id = parseInt(personIdMatch[1], 10);

    try {
      const updated = await people.patch(id, receivedobj);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(updated));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }

    return;
  }

  const calls = {
    "/api/people": { GET: people.get, PUT: people.add, PATCH: people.patch },
  };

  if (!(pathname in calls) || !(req.method in calls[pathname])) {
    console.error("404 file not found: ", pathname);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Not found");
    return;
  }

  const handler = calls[pathname][req.method];
  console.log(handler);
  try {
    if (req.method === "PUT") {
      console.log(" Received PUT data:", receivedobj);
    }

    const data =
      req.method === "PUT" ? await handler(receivedobj) : await handler();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error("Error in API handler:", err.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

module.exports = {
  handleapi,
};
