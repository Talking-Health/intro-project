const db = require("./database");
/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

/**
 * Demo function to return an array of people objects
 * @param { URL } parsedurl
 * @returns { Promise< Array< person > > }
 */
async function get(parsedurl) {
  const people = db.prepare("SELECT * FROM people").all();
  return people;
}

/**
 * Demo function adding a person
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add(parsedurl, method, person) {
  if (undefined !== person.id) {
    const update = db.prepare(`
      UPDATE people 
      SET name = ?, email = ?, notes = ? 
      WHERE id = ?
    `);
    update.run(person.name, person.email, person.notes, person.id);
    return person;
  }

  const insert = db.prepare(`
    INSERT INTO people (name, email, notes) 
    VALUES (?, ?, ?)
  `);
  const result = insert.run(person.name, person.email, person.notes);
  person.id = result.lastInsertRowid;
  return person;
}

module.exports = {
  get,
  add,
};
