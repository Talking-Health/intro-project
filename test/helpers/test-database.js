/**
 * Test database helper
 * Creates an in-memory SQLite database for testing
 */

const Database = require('better-sqlite3');

let testDb = null;

/**
 * Initialize a test database in memory
 * @returns {Database} The test database instance
 */
function initTestDatabase() {
  // Create in-memory database
  testDb = new Database(':memory:');

  // Enable WAL mode for better performance
  testDb.pragma('journal_mode = WAL');

  // Create tables
  testDb.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      notes TEXT,
      schedule DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index on name for faster lookups
  testDb.exec(`
    CREATE INDEX IF NOT EXISTS idx_people_name ON people(name)
  `);

  // Create rooms table
  testDb.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_name TEXT NOT NULL,
      address TEXT,
      room_type TEXT,
      price DECIMAL(10,2),
      available_from DATE,
      status TEXT DEFAULT 'Available',
      landlord_contact TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed initial test data
  const insert = testDb.prepare(`
    INSERT INTO people (name, email, notes, schedule)
    VALUES (@name, @email, @notes, @schedule)
  `);

  const insertMany = testDb.transaction((people) => {
    for (const person of people) {
      insert.run(person);
    }
  });

  insertMany([
    { name: 'Kermit Frog', email: 'kermit@muppets.com', notes: 'Leader', schedule: null },
    { name: 'Miss Piggy', email: 'piggy@muppets.com', notes: 'Diva', schedule: null },
    { name: 'Fozzie Bear', email: 'fozzie@muppets.com', notes: 'Comedian', schedule: null }
  ]);

  return testDb;
}

/**
 * Get the test database instance
 * @returns {Database} The test database instance
 */
function getTestDatabase() {
  if (!testDb) {
    return initTestDatabase();
  }
  return testDb;
}

/**
 * Reset the test database (clear all data and reseed)
 */
function resetTestDatabase() {
  if (testDb) {
    // Delete all data
    testDb.exec('DELETE FROM people');
    testDb.exec('DELETE FROM rooms');

    // Reset autoincrement counters
    testDb.exec("DELETE FROM sqlite_sequence WHERE name='people'");
    testDb.exec("DELETE FROM sqlite_sequence WHERE name='rooms'");

    // Reseed initial data
    const insert = testDb.prepare(`
      INSERT INTO people (name, email, notes, schedule)
      VALUES (@name, @email, @notes, @schedule)
    `);

    const insertMany = testDb.transaction((people) => {
      for (const person of people) {
        insert.run(person);
      }
    });

    insertMany([
      { name: 'Kermit Frog', email: 'kermit@muppets.com', notes: 'Leader', schedule: null },
      { name: 'Miss Piggy', email: 'piggy@muppets.com', notes: 'Diva', schedule: null },
      { name: 'Fozzie Bear', email: 'fozzie@muppets.com', notes: 'Comedian', schedule: null }
    ]);
  }
}

/**
 * Close the test database
 */
function closeTestDatabase() {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
}

module.exports = {
  initTestDatabase,
  getTestDatabase,
  resetTestDatabase,
  closeTestDatabase
};

