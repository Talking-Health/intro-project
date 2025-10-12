const Database = require('./database');

/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

// Initialize database connection
const db = new Database();

/**
 * Initialize database connection
 * @returns {Promise<void>}
 */
async function initDatabase() {
  try {
    await db.init();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get all people from database
 * @param { URL } parsedurl
 * @returns { Promise< Array< person > > }
 */
async function get(parsedurl) {
  try {
    return await db.getPeople();
  } catch (error) {
    console.error('Error fetching people:', error);
    throw error;
  }
}

/**
 * Add or update a person
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add(parsedurl, method, person) {
  try {
    if (undefined !== person.id) {
      // Update existing person
      return await db.updatePerson(person);
    } else {
      // Add new person
      return await db.addPerson(person);
    }
  } catch (error) {
    console.error('Error adding/updating person:', error);
    throw error;
  }
}

/**
 * Delete a person by ID
 * @param { number } id
 * @returns { Promise< boolean > }
 */
async function deletePerson(id) {
  try {
    return await db.deletePerson(id);
  } catch (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
}

/**
 * Get a person by ID
 * @param { number } id
 * @returns { Promise< person > }
 */
async function getPersonById(id) {
  try {
    return await db.getPersonById(id);
  } catch (error) {
    console.error('Error fetching person:', error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  get,
  add,
  deletePerson,
  getPersonById,
};
