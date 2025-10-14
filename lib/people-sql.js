// lib/people-sql.js
const db = require("./db")

function get() {
 
  return db.prepare("SELECT id, name, email, notes FROM people ORDER BY id ASC").all()
}


function add(_url, _method, person) {
  if (person.id != null) {
    db.prepare("UPDATE people SET name=?, email=?, notes=? WHERE id=?")
      .run(person.name, person.email || "", person.notes || "", person.id)
    return { id: person.id, name: person.name, email: person.email || "", notes: person.notes || "" }
  }

  const info = db.prepare("INSERT INTO people (name, email, notes) VALUES (?, ?, ?)")
    .run(person.name, person.email || "", person.notes || "")

  return { id: info.lastInsertRowid, name: person.name, email: person.email || "", notes: person.notes || "" }
}

module.exports = { get, add }
