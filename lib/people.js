const { getDatabase } = require('./database');

/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 * @property { string } [ schedule ] - Scheduled date/time for the person (optional).
 * @property { string } [ created_at ] - Timestamp when the person was created (optional).
 * @property { string } [ updated_at ] - Timestamp when the person was last updated (optional).
 */

/**
 * Get all people from the database
 * @param { URL } parsedurl
 * @returns { Promise< Array< person > > }
 */
async function get( parsedurl ) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT id, name, email, notes, schedule, created_at, updated_at FROM people ORDER BY id');
  /** @type {Array<person>} */
  const people = /** @type {Array<person>} */ (stmt.all());
  return people;
}

/**
 * Add or update a person in the database
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add( parsedurl, method, person ) {
  const db = getDatabase();

  // Update existing person
  if( undefined !== person.id ) {
    const stmt = db.prepare(`
      UPDATE people
      SET name = @name,
          email = @email,
          notes = @notes,
          schedule = @schedule,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    const info = stmt.run({
      id: person.id,
      name: person.name,
      email: person.email || '',
      notes: person.notes || '',
      schedule: person.schedule || null
    });

    if (info.changes === 0) {
      throw new Error(`Person with id ${person.id} not found`);
    }

    // Return the updated person
    const selectStmt = db.prepare('SELECT id, name, email, notes, schedule, created_at, updated_at FROM people WHERE id = ?');
    return selectStmt.get(person.id);
  }

  // Insert new person
  const stmt = db.prepare(`
    INSERT INTO people (name, email, notes, schedule)
    VALUES (@name, @email, @notes, @schedule)
  `);

  const info = stmt.run({
    name: person.name,
    email: person.email || '',
    notes: person.notes || '',
    schedule: person.schedule || null
  });

  // Return the newly created person
  const selectStmt = db.prepare('SELECT id, name, email, notes, schedule, created_at, updated_at FROM people WHERE id = ?');
  return selectStmt.get(info.lastInsertRowid);
}

/**
 * Delete a person from the database
 * @param { string } parsedurl
 * @param { string } method
 * @param { object } data - Object containing the id of the person to delete
 * @return { Promise < object > }
 */
async function remove( parsedurl, method, data ) {
  const db = getDatabase();

  if( undefined === data.id ) {
    throw new Error('Person id is required for deletion');
  }

  const stmt = db.prepare('DELETE FROM people WHERE id = ?');
  const info = stmt.run(data.id);

  if (info.changes === 0) {
    throw new Error(`Person with id ${data.id} not found`);
  }

  return { success: true, id: data.id, deleted: info.changes };
}


module.exports = {
  get,
  add,
  remove
}