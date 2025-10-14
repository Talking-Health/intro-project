/**
 * SQLite Database initialization and management
 * Uses better-sqlite3 for fast, synchronous SQLite operations
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database file path (relative to project root)
const DB_PATH = path.join(__dirname, '..', 'data', 'app.db');

let db = null;

/**
 * Initialize the database connection and create tables if they don't exist
 * @returns {import('better-sqlite3').Database} The database instance
 */
function initDatabase() {
  if (db) {
    return db;
  }

  // Create data directory if it doesn't exist
  const fs = require('fs');
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create database connection
  // Enable verbose logging only in development
  const options = process.env.NODE_ENV === 'development' ? { verbose: console.log } : {};
  db = new Database(DB_PATH, options);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create tables
  createTables();

  // Seed initial data if tables are empty
  seedInitialData();

  return db;
}

/**
 * Create database tables
 */
function createTables() {
  // Create people table
  db.exec(`
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
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_people_name ON people(name)
  `);

  // Add schedule column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE people ADD COLUMN schedule DATETIME`);
    console.log('Added schedule column to people table');
  } catch (error) {
    // Column already exists, ignore error
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  // Create rooms table
  db.exec(`
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

  console.log('Database tables created successfully');
}

/**
 * Seed initial data if the people table is empty
 */
function seedInitialData() {
  const peopleCount = db.prepare('SELECT COUNT(*) as count FROM people').get();

  if (peopleCount.count === 0) {
    console.log('Seeding initial people data...');

    const insert = db.prepare(`
      INSERT INTO people (name, email, notes)
      VALUES (@name, @email, @notes)
    `);

    const insertMany = db.transaction((people) => {
      for (const person of people) {
        insert.run(person);
      }
    });

    insertMany([
      { name: 'Kermit Frog', email: 'kermit@muppets.com', notes: 'Leader' },
      { name: 'Miss Piggy', email: 'piggy@muppets.com', notes: 'Diva' },
      { name: 'Fozzie Bear', email: 'fozzie@muppets.com', notes: 'Comedian' }
    ]);

    console.log('Initial people data seeded successfully');
  }

  // Seed rooms data
  const roomsCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get();

  if (roomsCount.count === 0) {
    console.log('Seeding initial rooms data...');

    const insertRoom = db.prepare(`
      INSERT INTO rooms (property_name, address, room_type, price, available_from, status, landlord_contact, notes)
      VALUES (@property_name, @address, @room_type, @price, @available_from, @status, @landlord_contact, @notes)
    `);

    const insertManyRooms = db.transaction((rooms) => {
      for (const room of rooms) {
        insertRoom.run(room);
      }
    });

    insertManyRooms([
      {
        property_name: 'Sunny Studio',
        address: '123 Main St, London',
        room_type: 'Studio',
        price: 800,
        available_from: '2025-11-01',
        status: 'Available',
        landlord_contact: 'john@landlord.com',
        notes: 'Near tube, bills included'
      },
      {
        property_name: 'Garden Flat',
        address: '45 Oak Ave, Manchester',
        room_type: '1BR',
        price: 1200,
        available_from: '2025-11-15',
        status: 'Available',
        landlord_contact: 'mary@properties.com',
        notes: 'Private garden, pets OK'
      },
      {
        property_name: 'City Centre Apt',
        address: '78 High St, Birmingham',
        room_type: '2BR',
        price: 1500,
        available_from: '2025-12-01',
        status: 'Pending',
        landlord_contact: 'bob@rentals.com',
        notes: 'Newly renovated'
      }
    ]);

    console.log('Initial rooms data seeded successfully');
  }
}

/**
 * Get the database instance
 * @returns {import('better-sqlite3').Database} The database instance
 */
function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

// Handle graceful shutdown
process.on('exit', () => closeDatabase());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase
};

