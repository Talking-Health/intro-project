/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

const Database = require( "better-sqlite3" )

const DB_FILE = process.env.DB_FILE || "database.db"
const db = new Database( DB_FILE )
db.pragma( "journal_mode = WAL" )
db.pragma( "synchronous = NORMAL" )

// People schema (safe if already created elsewhere)
db.prepare(`
  CREATE TABLE IF NOT EXISTS person (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL,
    email TEXT    DEFAULT '',
    notes TEXT    DEFAULT ''
  )
`).run()

// --- Seed People (only if empty) ---
const peopleCount = db.prepare( "SELECT COUNT(*) AS c FROM person" ).get().c
if ( 0 === peopleCount ) {
  const seedPeople = [
    { name: "Kermit Frog",    email: "kermit@example.com",  notes: "Team lead; mornings preferred" },
    { name: "Miss Piggy",     email: "piggy@example.com",   notes: "Part-time; afternoons only" },
    { name: "Gonzo",          email: "gonzo@example.com",   notes: "Likes complex tasks" },
    { name: "Fozzie Bear",    email: "fozzie@example.com",  notes: "Stand-up on Mondays" },
    { name: "Scooter",        email: "scooter@example.com", notes: "Ops contact; great at logistics" },
    { name: "Rowlf",          email: "rowlf@example.com",   notes: "Prefers remote; quiet rooms" },
    { name: "Rizzo",          email: "rizzo@example.com",   notes: "Early bird; arrives 8am sharp" },
    { name: "Pepe",           email: "pepe@example.com",    notes: "Flexible; seats near window" },
    { name: "Dr. Teeth",      email: "teeth@example.com",   notes: "Needs access to instrument storage" },
    { name: "Animal",         email: "animal@example.com",  notes: "Sound-isolated room recommended" }
  ]
  const ins = db.prepare( "INSERT INTO person (name, email, notes) VALUES (?,?,?)" )
  const tx = db.transaction( (rows) => rows.forEach( r => ins.run( r.name, r.email, r.notes ) ) )
  tx( seedPeople )
}

// Prepared statements
const stmtList   = db.prepare( "SELECT id, name, email, notes FROM person ORDER BY id" )
const stmtGetOne = db.prepare( "SELECT id, name, email, notes FROM person WHERE id = ?" )
const stmtInsert = db.prepare( "INSERT INTO person (name, email, notes) VALUES (?, ?, ?)" )
const stmtUpdate = db.prepare( "UPDATE person SET name = ?, email = ?, notes = ? WHERE id = ?" )
const stmtDelete = db.prepare( "DELETE FROM person WHERE id = ?" )

/** List all people. */
function list() { return stmtList.all() }
/** Get one person by id. */
function getone( id ) { return stmtGetOne.get( Number( id ) ) || null }
/** Create person. */
function create( person ) {
  if ( !person || !person.name || !String( person.name ).trim() ) throw new Error( "name is required" )
  const name  = String( person.name ).trim()
  const email = person.email || ""
  const notes = person.notes || ""
  const info = stmtInsert.run( name, email, notes )
  return { id: Number( info.lastInsertRowid ), name, email, notes }
}
/** Update person (partial). */
function update( id, patch ) {
  id = Number( id )
  const current = getone( id )
  if ( !current ) return null
  const next = { ...current, ...( patch || {} ) }
  if ( next.name && !String( next.name ).trim() ) throw new Error( "name cannot be empty" )
  next.name  = String( next.name ).trim()
  next.email = next.email || ""
  next.notes = next.notes || ""
  stmtUpdate.run( next.name, next.email, next.notes, id )
  return getone( id )
}
/** Delete person. */
function remove( id ) { return stmtDelete.run( Number( id ) ).changes > 0 }

/** Legacy wrappers for back-compat with /api/people map. */
async function get() { return list() }
async function add( _parsedurl, _method, person ) {
  if ( undefined !== person?.id ) {
    const updated = update( person.id, person )
    return updated ?? create( person )
  }
  return create( person )
}

module.exports = { list, getone, create, update, remove, get, add }
