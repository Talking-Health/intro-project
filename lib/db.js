// lib/db.js
const Database = require("better-sqlite3")

const DB_FILE = process.env.DB_FILE || "database.db"
const db = new Database(DB_FILE)
db.pragma("foreign_keys = ON")
db.pragma("journal_mode = WAL")
db.pragma("synchronous = NORMAL")

// --- Core schema (safe to re-run) ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS landlord (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL,
    email TEXT    DEFAULT '',
    notes TEXT    DEFAULT ''
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS building (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    landlord_id  INTEGER NOT NULL,
    name         TEXT    NOT NULL,
    address      TEXT    DEFAULT '',
    FOREIGN KEY (landlord_id) REFERENCES landlord(id) ON DELETE CASCADE
  )
`).run()

db.prepare(`
  CREATE TABLE IF NOT EXISTS room (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id  INTEGER NOT NULL,
    name         TEXT    NOT NULL,
    capacity     INTEGER DEFAULT 0,
    FOREIGN KEY (building_id) REFERENCES building(id) ON DELETE CASCADE
  )
`).run()

// --- Seed L/B/R only if empty ---
const landlordsCount = db.prepare("SELECT COUNT(*) AS c FROM landlord").get().c
if (0 === landlordsCount) {
  const landlordsSeed = [
    { name: "Acme Estates",   email: "hello@acme.est",   notes: "Portfolio A" },
    { name: "Northbridge Co", email: "info@north.co",    notes: "Mixed commercial" },
    { name: "Riverside LLP",  email: "contact@river.llp",notes: "Waterfront focus" },
    { name: "UrbanHold Ltd",  email: "team@urban.hld",   notes: "City centre" },
    { name: "GreenLeaf Prop", email: "hi@greenleaf.io",  notes: "Eco buildings" }
  ]

  const buildingsByLL = {
    "Acme Estates": [
      { name: "Acme House", address: "1 Example Street" },
      { name: "Central Court", address: "22 Market Road" }
    ],
    "Northbridge Co": [
      { name: "Northbridge Park", address: "5 Bridge Ave" },
      { name: "Mill Offices", address: "17 Old Mill Ln" },
      { name: "Harbor View", address: "3 Dockside Way" }
    ],
    "Riverside LLP": [
      { name: "Riverside One", address: "10 River Walk" }
    ],
    "UrbanHold Ltd": [
      { name: "Urban Hub", address: "88 Main Street" },
      { name: "Tech Square", address: "45 Innovation Dr" }
    ],
    "GreenLeaf Prop": [
      { name: "Green Tower", address: "12 Forest Blvd" }
    ]
  }

  // for each building, a few rooms
  function roomsFor(buildingName) {
    const base = [
      { name: "Room 101", capacity: 2 },
      { name: "Room 102", capacity: 4 },
      { name: "Room 201", capacity: 6 }
    ]
    // add a little variety
    if (/Hub|Tower|Tech/i.test(buildingName)) base.push({ name: "Studio A", capacity: 1 })
    return base
  }

  const insL = db.prepare("INSERT INTO landlord (name,email,notes) VALUES (?,?,?)")
  const insB = db.prepare("INSERT INTO building (landlord_id,name,address) VALUES (?,?,?)")
  const insR = db.prepare("INSERT INTO room (building_id,name,capacity) VALUES (?,?,?)")

  const tx = db.transaction(() => {
    for (const L of landlordsSeed) {
      const lInfo = insL.run(L.name, L.email, L.notes)
      const lId = Number(lInfo.lastInsertRowid)
      const bList = buildingsByLL[L.name] || []
      for (const B of bList) {
        const bInfo = insB.run(lId, B.name, B.address)
        const bId = Number(bInfo.lastInsertRowid)
        for (const R of roomsFor(B.name)) {
          insR.run(bId, R.name, R.capacity)
        }
      }
    }
  })
  tx()
}

module.exports = db
