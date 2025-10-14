// test/lbr.test.mjs
// ESM tests for Landlords / Buildings / Rooms using the shared SQLite db.
// Verifies CRUD and cascade deletes. Uses :memory: DB so it doesn't touch your real file.

import { expect } from "chai"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// Dynamically import CommonJS modules FRESH each time, pointed at a chosen DB file
async function loadFresh(dbFile = ":memory:") {
  // point all data layers at the desired DB *before* importing
  process.env.DB_FILE = dbFile

  async function imp(relPath) {
    const abs = path.resolve(__dirname, relPath)
    const mod = await import(abs + `?t=${Date.now()}&r=${Math.random()}`)
    return mod.default ?? mod
  }

  // Import order matters: db first (creates schema/seed), then repos
  const db         = await imp("../lib/db.js")
  const landlords  = await imp("../lib/landlords.js")
  const buildings  = await imp("../lib/buildings.js")
  const rooms      = await imp("../lib/rooms.js")
  return { db, landlords, buildings, rooms }
}

describe("Landlords / Buildings / Rooms (SQLite)", () => {
  it("has seed data available", async () => {
    const { landlords, buildings, rooms } = await loadFresh(":memory:")
    const L = landlords.list()
    const B = buildings.list()
    const R = rooms.list()
    expect(L.length).to.be.greaterThan(0)
    expect(B.length).to.be.greaterThan(0)
    expect(R.length).to.be.greaterThan(0)
  })

  it("can create landlord → building → room and read them back", async () => {
    const { landlords, buildings, rooms } = await loadFresh(":memory:")

    // landlord
    const L = landlords.create({ name: "Test LL", email: "ll@test", notes: "ok" })
    expect(L).to.include({ name: "Test LL" })
    const Ls = landlords.list()
    expect(Ls.map(x => x.id)).to.include(L.id)

    // building under landlord
    const B = buildings.create({ landlord_id: L.id, name: "Block A", address: "1 Road" })
    expect(B).to.include({ landlord_id: L.id, name: "Block A" })
    const Bs = buildings.list(L.id)
    expect(Bs.map(x => x.id)).to.include(B.id)

    // room under building
    const R = rooms.create({ building_id: B.id, name: "R-1", capacity: 3 })
    expect(R).to.include({ building_id: B.id, name: "R-1", capacity: 3 })
    const Rs = rooms.list(B.id)
    expect(Rs.map(x => x.id)).to.include(R.id)
  })

  it("can update landlord, building, and room", async () => {
    const { landlords, buildings, rooms } = await loadFresh(":memory:")

    const L = landlords.create({ name: "LL", email: "", notes: "" })
    const L2 = landlords.update(L.id, { name: "LL Updated" })
    expect(L2.name).to.equal("LL Updated")

    const B = buildings.create({ landlord_id: L.id, name: "B1", address: "" })
    const B2 = buildings.update(B.id, { name: "B1+","address":"addr+" })
    expect(B2.name).to.equal("B1+")
    expect(B2.address).to.equal("addr+")

    const R = rooms.create({ building_id: B.id, name: "X", capacity: 1 })
    const R2 = rooms.update(R.id, { name: "X2", capacity: 7 })
    expect(R2.name).to.equal("X2")
    expect(R2.capacity).to.equal(7)
  })

  it("deleting a building cascades to its rooms", async () => {
    const { landlords, buildings, rooms } = await loadFresh(":memory:")

    const L = landlords.create({ name: "LLc", email: "", notes: "" })
    const B = buildings.create({ landlord_id: L.id, name: "Bc", address: "" })
    const R1 = rooms.create({ building_id: B.id, name: "r1", capacity: 1 })
    const R2 = rooms.create({ building_id: B.id, name: "r2", capacity: 2 })
    expect(rooms.list(B.id).length).to.equal(2)

    const ok = buildings.remove(B.id)
    expect(ok).to.equal(true)
    expect(rooms.list(B.id).length).to.equal(0) // cascaded
  })

  it("deleting a landlord cascades to its buildings (and their rooms)", async () => {
    const { landlords, buildings, rooms } = await loadFresh(":memory:")

    const L = landlords.create({ name: "LLZ", email: "", notes: "" })
    const B1 = buildings.create({ landlord_id: L.id, name: "B1z", address: "" })
    const B2 = buildings.create({ landlord_id: L.id, name: "B2z", address: "" })
    rooms.create({ building_id: B1.id, name: "r1", capacity: 1 })
    rooms.create({ building_id: B2.id, name: "r2", capacity: 2 })

    const ok = landlords.remove(L.id)
    expect(ok).to.equal(true)

    // buildings gone
    const Bs = buildings.list(L.id)
    expect(Bs.length).to.equal(0)

    // rooms gone (both buildings)
    expect(rooms.list(B1.id).length).to.equal(0)
    expect(rooms.list(B2.id).length).to.equal(0)
  })
})
