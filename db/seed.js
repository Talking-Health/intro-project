const db = require("./connection");

async function seed(people) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DROP TABLE IF EXISTS people");
      db.run(`
        CREATE TABLE people (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          notes TEXT
        )
      `);

      const stmt = db.prepare(
        "INSERT INTO people (id, name, email, notes) VALUES (?, ?, ?, ?)"
      );
      people.forEach(({ id, name, email, notes }) => {
        stmt.run(id, name, email, notes);
      });
      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = seed;
