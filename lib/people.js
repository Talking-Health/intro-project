


const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../data.db");
const db = new sqlite3.Database(dbPath);

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      notes TEXT
    )
  `);
});



/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

/**
 * @type { Array< person > }
 */
const people = [
  { id: 1, name: "Kermit Frog", email: "", notes:"" },
  { id: 2, name: "Miss Piggy", email: "", notes:"" },
]

/**
 * Demo function to return an array of people objects
 * @param { URL } parsedurl 
 * @returns { Promise< Array< person > > }
 */
async function get(parsedurl) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM people", (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Demo function adding a person
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add(parsedurl, method, person) {
  return new Promise((resolve, reject) => {
    if (person.id) {
      const { id, name, email, notes } = person;
      db.run(
        "UPDATE people SET name = ?, email = ?, notes = ? WHERE id = ?",
        [name, email, notes, id],
        function (err) {
          if (err) return reject(err);
          resolve(person);
        }
      );
    } else {
      const { name, email, notes } = person;
      db.run(
        "INSERT INTO people (name, email, notes) VALUES (?, ?, ?)",
        [name, email, notes],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, name, email, notes });
        }
      );
    }
  });
}


module.exports = {
  get,
  add
}