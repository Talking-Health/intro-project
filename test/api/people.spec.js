// test/api/people.spec.js
const { expect } = require("chai")
const supertest = require("supertest")

let server, request

before(() => {
  // Mocha hook: runs once before all tests in this file
  server = require("../../index.js")      // get the server instance
  request = supertest(server)             // supertest wraps it
})

after(() => {
  // runs once after all tests in this file
  if (server && server.close) server.close()
})

describe("People API", () => {
  it("GET /api/people returns a list", async () => {
    const res = await request.get("/api/people").expect(200)
    expect(res.body).to.be.an("array")
    // If there are rows, assert shape
    if (res.body.length) {
      expect(res.body[0]).to.have.keys(["id", "name", "email", "notes"])
    }
  })

  it("PUT /api/people creates a person", async () => {
    const payload = { name: "Mo Tester", email: "mo@test.io", notes: "hello" }
    const res = await request.put("/api/people").send(payload).expect(200)
    expect(res.body).to.include(payload)  // the response echoes our data
    expect(res.body).to.have.property("id")
  })

  it("PUT /api/people updates when id is present", async () => {
    const all = await request.get("/api/people").expect(200)
    const first = all.body[0]
    const updated = { id: first.id, name: "Updated Name", email: "u@x.y", notes: "" }

    await request.put("/api/people").send(updated).expect(200)

    const after = await request.get("/api/people").expect(200)
    const row = after.body.find(p => p.id === first.id)
    expect(row.name).to.equal("Updated Name")
  })
})
