// test/people.test.mjs
// ESM tests compatible with Chai v5 (ESM-only) + your CommonJS lib/people.js

import { expect } from "chai"
import path from "path"
import { fileURLToPath } from "url"

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Dynamically import lib/people.js FRESH each time (bust module cache)
async function loadPeopleFresh() {
  const abs = path.resolve(__dirname, "../lib/people.js")
  // add a query param to force a fresh import
  const mod = await import(abs + `?t=${Date.now()}&r=${Math.random()}`)
  // CommonJS modules show up as `default`
  return mod.default ?? mod
}

describe("people data layer", () => {
  it("list() should return seeded people", async () => {
    const people = await loadPeopleFresh()
    const all = people.list()
    expect(all).to.be.an("array")
    expect(all.length).to.be.greaterThan(0)
    expect(all[0]).to.have.property("id")
    expect(all[0]).to.have.property("name")
  })

  it("create() should add a new person with auto id", async () => {
    const people = await loadPeopleFresh()
    const before = people.list().length
    const created = people.create({ name: "Gonzo", email: "gonzo@example.com" })
    const after = people.list().length

    expect(created).to.include({ name: "Gonzo", email: "gonzo@example.com" })
    expect(created).to.have.property("id")
    expect(after).to.equal(before + 1)
  })

  it("create() should reject missing name", async () => {
    const people = await loadPeopleFresh()
    expect(() => people.create({ name: "   " })).to.throw("name is required")
  })

  it("update() should modify an existing person", async () => {
    const people = await loadPeopleFresh()
    const one = people.list()[0]
    const updated = people.update(one.id, { name: one.name + " Updated" })
    expect(updated).to.have.property("id", one.id)
    expect(updated.name).to.equal(one.name + " Updated")
  })

  it("update() should return null for unknown id", async () => {
    const people = await loadPeopleFresh()
    const out = people.update(999999, { name: "Nobody" })
    expect(out).to.equal(null)
  })

  it("remove() should delete an existing person", async () => {
    const people = await loadPeopleFresh()
    const all = people.list()
    const targetId = all[0].id
    const ok = people.remove(targetId)
    expect(ok).to.equal(true)

    const ids = people.list().map(p => p.id)
    expect(ids).to.not.include(targetId)
  })

  // Back-compat wrapper tests (your original API)
  it("get() should return the same list as list()", async () => {
    const people = await loadPeopleFresh()
    const legacy = await people.get(new URL("http://localhost/api/people"))
    const modern = people.list()
    expect(legacy).to.deep.equal(modern)
  })

  it("add() should upsert when id provided (legacy)", async () => {
    const people = await loadPeopleFresh()
    const first = people.list()[0]
    const result = await people.add("/api/people", "PUT", { id: first.id, name: "New Name" })
    expect(result).to.have.property("id", first.id)
    expect(result.name).to.equal("New Name")
  })

  it("add() should create when id missing (legacy)", async () => {
    const people = await loadPeopleFresh()
    const before = people.list().length
    const result = await people.add("/api/people", "PUT", { name: "Brand New" })
    const after = people.list().length
    expect(result).to.have.property("id")
    expect(result.name).to.equal("Brand New")
    expect(after).to.equal(before + 1)
  })
})
