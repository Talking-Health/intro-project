const db = require("../db/connection");
/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

/**
 * Get all people from the database.
 * @returns { Promise< Array<person> > }
 */
function get() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM people", (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Add a new person or update an existing person.
 * @param { person } person
 * @returns { Promise<person> }
 */
function add(person) {
  return new Promise((resolve, reject) => {
    if (person.id !== undefined) {
      const sql = `UPDATE people SET name = ?, email = ?, notes = ? WHERE id = ?`;
      const params = [person.name, person.email, person.notes || "", person.id];
      db.run(sql, params, function (err) {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(person);
      });
    } else {
      const sql = `INSERT INTO people (name, email, notes) VALUES (?, ?, ?)`;
      const params = [person.name, person.email, person.notes || ""];
      db.run(sql, params, function (err) {
        if (err) return reject(err);

        person.id = this.lastID;
        resolve(person);
      });
    }
  });
}

function patch(id, updates) {
  return new Promise((resolve, reject) => {
    const fields = [];
    const params = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      params.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push("email = ?");
      params.push(updates.email);
    }
    if (updates.notes !== undefined) {
      fields.push("notes = ?");
      params.push(updates.notes);
    }

    if (fields.length === 0) {
      return reject(new Error("No fields to update"));
    }

    params.push(id);

    const sql = `UPDATE people SET ${fields.join(", ")} WHERE id = ?`;

    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ id, ...updates });
    });
  });
}

module.exports = {
  get,
  add,
  patch,
};
