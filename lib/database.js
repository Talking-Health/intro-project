const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "people.db");
const db = new Database(dbPath);

db.exec(`CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    notes TEXT)`);

const count = db.prepare("SELECT COUNT(*) as count FROM people").get();
if (count.count === 0) {
  const insert = db.prepare(
    "INSERT INTO people(name,email,notes) VALUES (?,?,?)"
  );
  insert.run("Kermit Frog", "", "");
  insert.run("Miss Piggy", "", "");
  console.log("Database initialised");
}
module.exports = db;
