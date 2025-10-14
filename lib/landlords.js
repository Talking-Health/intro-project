// lib/landlords.js
const db = require("./db")

const stmtList    = db.prepare("SELECT id,name,email,notes FROM landlord ORDER BY id")
const stmtGet     = db.prepare("SELECT id,name,email,notes FROM landlord WHERE id=?")
const stmtInsert  = db.prepare("INSERT INTO landlord (name,email,notes) VALUES (?,?,?)")
const stmtUpdate  = db.prepare("UPDATE landlord SET name=?, email=?, notes=? WHERE id=?")
const stmtDelete  = db.prepare("DELETE FROM landlord WHERE id=?")

function list() {
  return stmtList.all()
}
function getone(id) {
  id = Number(id)
  return stmtGet.get(id) || null
}
function create(obj) {
  if (!obj || !obj.name || !String(obj.name).trim()) throw new Error("name is required")
  const name = String(obj.name).trim()
  const email = obj.email || ""
  const notes = obj.notes || ""
  const info = stmtInsert.run(name, email, notes)
  return { id: Number(info.lastInsertRowid), name, email, notes }
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
  next.email = next.email || ""
  next.notes = next.notes || ""
  stmtUpdate.run(next.name, next.email, next.notes, id)
  return getone(id)
}
function remove(id) {
  id = Number(id)
  const info = stmtDelete.run(id)
  return info.changes > 0
}

module.exports = { list, getone, create, update, remove }
