const { all, get: getFromDb, run } = require( "./database" )

/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 * @property { Array< string > } [ schedule ] - Weekly schedule array (7 days, optional).
 */

/**
 * Get all people from the database
 * @returns { Promise< Array< person > > }
 */
async function get() {
  const rows = await all( "SELECT * FROM people ORDER BY id" )
  return rows.map( row => ( {
    id: row.id,
    name: row.name,
    email: row.email,
    notes: row.notes,
    schedule: row.schedule ? JSON.parse( row.schedule ) : null
  } ) )
}

/**
 * Add or update a person in the database
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add( parsedurl, method, person ) {
  const scheduleJson = person.schedule ? JSON.stringify( person.schedule ) : null

  if( undefined !== person.id ) {
    // Update existing person
    await run(
      "UPDATE people SET name = ?, email = ?, notes = ?, schedule = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [person.name, person.email, person.notes, scheduleJson, person.id]
    )
    return person
  }

  // Add new person
  const result = await run(
    "INSERT INTO people (name, email, notes, schedule) VALUES (?, ?, ?, ?)",
    [person.name, person.email, person.notes, scheduleJson]
  )

  const updatedPerson = { ...person, id: result.lastID }
  return updatedPerson
}

/**
 * Update a person's schedule
 * @param { number } personId
 * @param { Array< string > } schedule
 * @return { Promise < object > }
 */
async function updateSchedule( personId, schedule ) {
  const scheduleJson = JSON.stringify( schedule )

  const result = await run(
    "UPDATE people SET schedule = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [scheduleJson, personId]
  )

  if( 0 === result.changes ) {
    throw new Error( "Person not found" )
  }

  // Return the updated person
  const person = await getFromDb( "SELECT * FROM people WHERE id = ?", [personId] )
  return {
    id: person.id,
    name: person.name,
    email: person.email,
    notes: person.notes,
    schedule: person.schedule ? JSON.parse( person.schedule ) : null
  }
}

/**
 * Delete a person from the database
 * @param { number } personId
 * @return { Promise < object > }
 */
async function deletePerson( personId ) {
  // First check if person exists
  const person = await getFromDb( "SELECT * FROM people WHERE id = ?", [personId] )
  if( !person ) {
    throw new Error( "Person not found" )
  }

  const result = await run( "DELETE FROM people WHERE id = ?", [personId] )

  if( 0 === result.changes ) {
    throw new Error( "Failed to delete person" )
  }

  return { success: true, deletedId: personId }
}

module.exports = {
  get,
  add,
  updateSchedule,
  deletePerson,
}
