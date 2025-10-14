// lib/rooms.js
const db = require("./db")

const stmtListAll   = db.prepare(`
  SELECT r.id,r.name,r.capacity,r.building_id,b.name AS building_name,b.landlord_id
  FROM room r
  JOIN building b ON b.id=r.building_id
  ORDER BY r.id
`)
const stmtListByB   = db.prepare(`
  SELECT id,name,capacity,building_id FROM room WHERE building_id=? ORDER BY id
`)
const stmtGet       = db.prepare("SELECT id,name,capacity,building_id FROM room WHERE id=?")
const stmtInsert    = db.prepare("INSERT INTO room (building_id,name,capacity) VALUES (?,?,?)")
const stmtUpdate    = db.prepare("UPDATE room SET building_id=?, name=?, capacity=? WHERE id=?")
const stmtDelete    = db.prepare("DELETE FROM room WHERE id=?")

function list(buildingId) {
  if (undefined === buildingId || buildingId === null || buildingId === "") {
    return stmtListAll.all()
  }
  return stmtListByB.all(Number(buildingId))
}
function getone(id) {
  id = Number(id)
  return stmtGet.get(id) || null
}
function create(obj) {
  if (!obj || !obj.name || !String(obj.name).trim()) throw new Error("name is required")
  if (!obj.building_id) throw new Error("building_id is required")
  const building_id = Number(obj.building_id)
  const name = String(obj.name).trim()
  const capacity = Number.isFinite(Number(obj.capacity)) ? Number(obj.capacity) : 0
  const info = stmtInsert.run(building_id, name, capacity)
  return { id: Number(info.lastInsertRowid), building_id, name, capacity }
}
function update(id, patch) {
  id = Number(id)
  const cur = getone(id)
  if (!cur) return null
  const next = {
    ...cur,
    ...(patch || {}),
  }
  if (next.name && !String(next.name).trim()) throw new Error("name cannot be empty")
  next.name = String(next.name).trim()
  const building_id = Number(next.building_id)
  const capacity = Number.isFinite(Number(next.capacity)) ? Number(next.capacity) : 0
  stmtUpdate.run(building_id, next.name, capacity, id)
  return getone(id)
}
function remove(id) {
  id = Number(id)
  const info = stmtDelete.run(id)
  return info.changes > 0
}

module.exports = { list, getone, create, update, remove }
