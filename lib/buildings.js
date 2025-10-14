// lib/buildings.js
const db = require("./db")

const stmtListAll   = db.prepare(`
  SELECT b.id,b.name,b.address,b.landlord_id,l.name AS landlord_name
  FROM building b
  JOIN landlord l ON l.id=b.landlord_id
  ORDER BY b.id
`)
const stmtListByL   = db.prepare(`
  SELECT id,name,address,landlord_id
  FROM building WHERE landlord_id=? ORDER BY id
`)
const stmtGet       = db.prepare("SELECT id,name,address,landlord_id FROM building WHERE id=?")
const stmtInsert    = db.prepare("INSERT INTO building (landlord_id,name,address) VALUES (?,?,?)")
const stmtUpdate    = db.prepare("UPDATE building SET landlord_id=?, name=?, address=? WHERE id=?")
const stmtDelete    = db.prepare("DELETE FROM building WHERE id=?")

function list(landlordId) {
  if (undefined === landlordId || landlordId === null || landlordId === "") {
    return stmtListAll.all()
  }
  return stmtListByL.all(Number(landlordId))
}
function getone(id) {
  id = Number(id)
  return stmtGet.get(id) || null
}
function create(obj) {
  if (!obj || !obj.name || !String(obj.name).trim()) throw new Error("name is required")
  if (!obj.landlord_id) throw new Error("landlord_id is required")
  const landlord_id = Number(obj.landlord_id)
  const name = String(obj.name).trim()
  const address = obj.address || ""
  const info = stmtInsert.run(landlord_id, name, address)
  return { id: Number(info.lastInsertRowid), landlord_id, name, address }
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
  next.address = next.address || ""
  const landlord_id = Number(next.landlord_id)
  stmtUpdate.run(landlord_id, next.name, next.address, id)
  return getone(id)
}
function remove(id) {
  id = Number(id)
  const info = stmtDelete.run(id)
  return info.changes > 0
}

module.exports = { list, getone, create, update, remove }
