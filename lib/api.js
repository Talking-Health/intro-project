const people = require("./people")
const landlords = require("./landlords")
const buildings = require("./buildings")
const rooms = require("./rooms")

/**
 * Check for a valid API url call and handle.
 * @param { URL } parsedurl 
 * @param { object } res
 * @param { object } req
 * @param { object } receivedobj
 */
async function handleapi(parsedurl, res, req, receivedobj) {
  const pathname = parsedurl.pathname

  /**
   * Back-compat map (keeps original behavior):
   * - GET /api/people -> list via people.get(...)
   * - PUT /api/people -> upsert via people.add(...) (update when body.id exists, else create)
   */
  const legacyCalls = {
    "/api/people": { "GET": people.get, "PUT": people.add }
  }

  // ----------------------------
  // People modern routes
  // ----------------------------
  if ("POST" == req.method && "/api/person" == pathname) {
    try {
      const created = await people.create(receivedobj || {})
      res.writeHead(201, { "Content-Type": "application/json" })
      return res.end(JSON.stringify(created))
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: e.message }))
    }
  }

  if ("PUT" == req.method && /^\/api\/person\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop())
    try {
      const updated = await people.update(id, receivedobj || {})
      if (null == updated) {
        res.writeHead(404, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: "person not found" }))
      }
      res.writeHead(200, { "Content-Type": "application/json" })
      return res.end(JSON.stringify(updated))
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: e.message }))
    }
  }

  if ("DELETE" == req.method && /^\/api\/person\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop())
    const ok = await people.remove(id)
    if (!ok) {
      res.writeHead(404, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: "person not found" }))
    }
    res.writeHead(204)
    return res.end()
  }

  // ----------------------------
  // Landlords
  // ----------------------------
  if ("GET" == req.method && "/api/landlords" == pathname) {
    res.writeHead(200, { "Content-Type": "application/json" })
    return res.end(JSON.stringify(landlords.list()))
  }
  if ("POST" == req.method && "/api/landlord" == pathname) {
    try {
      const out = landlords.create(receivedobj || {})
      res.writeHead(201, { "Content-Type": "application/json" })
      return res.end(JSON.stringify(out))
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: e.message }))
    }
  }
  if ("PUT" == req.method && /^\/api\/landlord\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop())
    try {
      const out = landlords.update(id, receivedobj || {})
      if (!out) {
        res.writeHead(404, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: "landlord not found" }))
      }
      res.writeHead(200, { "Content-Type": "application/json" })
      return res.end(JSON.stringify(out))
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: e.message }))
    }
  }
  if ("DELETE" == req.method && /^\/api\/landlord\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop())
    const ok = landlords.remove(id)
    if (!ok) {
      res.writeHead(404, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: "landlord not found" }))
    }
    res.writeHead(204)
    return res.end()
  }

  // ----------------------------
  // Buildings (optional filter: ?landlordId=)
  // ----------------------------
  if ("GET" == req.method && "/api/buildings" == pathname) {
    const landlordId = parsedurl.searchParams.get("landlordId")
    res.writeHead(200, { "Content-Type": "application/json" })
    return res.end(JSON.stringify(buildings.list(landlordId)))
  }
  if ("POST" == req.method && "/api/building" == pathname) {
    try {
      const out = buildings.create(receivedobj || {})
      res.writeHead(201, { "Content-Type": "application/json" })
      return res.end(JSON.stringify(out))
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: e.message }))
    }
  }
  if ("PUT" == req.method && /^\/api\/building\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop())
    try {
      const out = buildings.update(id, receivedobj || {})
      if (!out) {
        res.writeHead(404, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: "building not found" }))
      }
      res.writeHead(200, { "Content-Type": "application/json" })
      return res.end(JSON.stringify(out))
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: e.message }))
    }
  }
  if ("DELETE" == req.method && /^\/api\/building\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop())
    const ok = buildings.remove(id)
    if (!ok) {
      res.writeHead(404, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: "building not found" }))
    }
    res.writeHead(204)
    return res.end()
  }

  // ----------------------------
  // Rooms (optional filter: ?buildingId=)
  // ----------------------------
  if ("GET" == req.method && "/api/rooms" == pathname) {
    const buildingId = parsedurl.searchParams.get("buildingId")
    res.writeHead(200, { "Content-Type": "application/json" })
    return res.end(JSON.stringify(rooms.list(buildingId)))
  }
  if ("POST" == req.method && "/api/room" == pathname) {
    try {
      const out = rooms.create(receivedobj || {})
      res.writeHead(201, { "Content-Type": "application/json" })
      return res.end(JSON.stringify(out))
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: e.message }))
    }
  }
  if ("PUT" == req.method && /^\/api\/room\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop())
    try {
      const out = rooms.update(id, receivedobj || {})
      if (!out) {
        res.writeHead(404, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: "room not found" }))
      }
      res.writeHead(200, { "Content-Type": "application/json" })
      return res.end(JSON.stringify(out))
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: e.message }))
    }
  }
  if ("DELETE" == req.method && /^\/api\/room\/\d+$/.test(pathname)) {
    const id = Number(pathname.split("/").pop())
    const ok = rooms.remove(id)
    if (!ok) {
      res.writeHead(404, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: "room not found" }))
    }
    res.writeHead(204)
    return res.end()
  }

  // ----------------------------
  // Legacy exact-path fallback (/api/people)
  // ----------------------------
  if (!(pathname in legacyCalls) || !(req.method in legacyCalls[pathname])) {
    console.error("404 file not found: ", pathname)
    res.writeHead(404, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: "Not found" }))
  }

  const handler = legacyCalls[pathname][req.method]
  if ("function" != typeof handler) {
    res.writeHead(405, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: "Method not allowed" }))
  }

  const data = await handler(parsedurl, req.method, receivedobj)
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}

module.exports = { handleapi }
