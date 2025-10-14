// test/people.test.mjs
// ESM tests compatible with Chai v5 (ESM-only) + your CommonJS lib/people.js
// Verifies both :memory: (unit) and file-backed (persistence) SQLite modes.

import { expect } from "chai"
import path from "path"
import fs from "fs"
import os from "os"
import { fileURLToPath } from "url"

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Dynamically import lib/people.js FRESH each time.
 * You can pass a dbFile to control persistence (':memory:' or a filepath).
 */
async function loadPeopleFresh(dbFile = ":memory:") {
  // Must set DB_FILE *before* importing the module so better-sqlite3 opens the right DB.
  process.env.DB_FILE = dbFile

  const abs = path.resolve(__dirname, "../lib/people.js")
  // add a query param to force a fresh import instance
  const mod = await import(abs + `?t=${Date.now()}&r=${Math.random()}`)
  // CommonJS modules surface under `default` when imported from ESM
  return mod.default ?? mod
}

/* ----------------------------------------------------------
 * Suite 1: Unit-style tests against :memory: SQLite
 * --------------------------------------------------------*/
describe("people data layer (:memory: sqlite)", () => {
  it("list() should return seeded people", async () => {
    const people = await loadPeopleFresh(":memory:")
    const all = people.list()
    expect(all).to.be.an("array")
    expect(all.length).to.be.greaterThan(0)
    expect(all[0]).to.have.property("id")
    expect(all[0]).to.have.property("name")
  })

  it("create() should add a new person with auto id", async () => {
    const people = await loadPeopleFresh(":memory:")
    const before = people.list().length
    const created = people.create({ name: "Gonzo", email: "gonzo@example.com" })
    const after = people.list().length

    expect(created).to.include({ name: "Gonzo", email: "gonzo@example.com" })
    expect(created).to.have.property("id")
    expect(after).to.equal(before + 1)
  })

  it("create() should reject missing name", async () => {
    const people = await loadPeopleFresh(":memory:")
    expect(() => people.create({ name: "   " })).to.throw("name is required")
  })

  it("update() should modify an existing person", async () => {
    const people = await loadPeopleFresh(":memory:")
    const one = people.list()[0]
    const updated = people.update(one.id, { name: one.name + " Updated" })
    expect(updated).to.have.property("id", one.id)
    expect(updated.name).to.equal(one.name + " Updated")
  })

  it("update() should return null for unknown id", async () => {
    const people = await loadPeopleFresh(":memory:")
    const out = people.update(999999, { name: "Nobody" })
    expect(out).to.equal(null)
  })

  it("remove() should delete an existing person", async () => {
    const people = await loadPeopleFresh(":memory:")
    const all = people.list()
    const targetId = all[0].id
    const ok = people.remove(targetId)
    expect(ok).to.equal(true)

    const ids = people.list().map(p => p.id)
    expect(ids).to.not.include(targetId)
  })

  // Back-compat wrapper tests (your original API)
  it("get() should return the same list as list()", async () => {
    const people = await loadPeopleFresh(":memory:")
    const legacy = await people.get(new URL("http://localhost/api/people"))
    const modern = people.list()
    expect(legacy).to.deep.equal(modern)
  })

  it("add() should upsert when id provided (legacy)", async () => {
    const people = await loadPeopleFresh(":memory:")
    const first = people.list()[0]
    const result = await people.add("/api/people", "PUT", { id: first.id, name: "New Name" })
    expect(result).to.have.property("id", first.id)
    expect(result.name).to.equal("New Name")
  })

  it("add() should create when id missing (legacy)", async () => {
    const people = await loadPeopleFresh(":memory:")
    const before = people.list().length
    const result = await people.add("/api/people", "PUT", { name: "Brand New" })
    const after = people.list().length
    expect(result).to.have.property("id")
    expect(result.name).to.equal("Brand New")
    expect(after).to.equal(before + 1)
  })
})

/* ----------------------------------------------------------
 * Suite 2: Persistence test with file-backed SQLite
 * --------------------------------------------------------*/
describe("people data layer (file-backed sqlite persistence)", () => {
  // Use a unique temporary DB file
  const tmpDb = path.join(os.tmpdir(), `people-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)

  it("should persist data across module reloads when using a file DB", async () => {
    // First import: create one record
    let people = await loadPeopleFresh(tmpDb)
    const created = people.create({ name: "Persist Me", email: "persist@example.com", notes: "hello" })
    expect(created).to.have.property("id")

    // "Restart" app by re-importing the module fresh (new connection to SAME file)
    people = await loadPeopleFresh(tmpDb)
    const all = people.list()
    const found = all.find(p => p.id === created.id)
    expect(found).to.include({ id: created.id, name: "Persist Me" })
  })

  // Cleanup note:
  // We don't delete the temp DB here because better-sqlite3 keeps an open handle
  // for the lifetime of the imported module instance. In real CI you'd export a
  // close() from the data layer or run tests in a child process that exits.
})
