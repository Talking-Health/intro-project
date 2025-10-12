const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database connection and initialization
 */
class Database {
  constructor(dbPath = 'data/app.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Initialize database connection and create tables
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      // Ensure data directory exists
      const fs = require('fs');
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  /**
   * Create database tables
   * @returns {Promise<void>}
   */
  async createTables() {
    return new Promise((resolve, reject) => {
      const createPeopleTable = `
        CREATE TABLE IF NOT EXISTS people (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createPeopleTable, (err) => {
        if (err) {
          console.error('Error creating people table:', err.message);
          reject(err);
        } else {
          console.log('People table created or already exists');
          this.seedData()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  /**
   * Seed initial data if table is empty
   * @returns {Promise<void>}
   */
  async seedData() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM people', (err, row) => {
        if (err) {
          reject(err);
        } else if (row.count === 0) {
          // Insert initial data
          const insertPeople = `
            INSERT INTO people (name, email, notes) VALUES 
            ('Kermit Frog', '', ''),
            ('Miss Piggy', '', '')
          `;

          this.db.run(insertPeople, (err) => {
            if (err) {
              console.error('Error seeding data:', err.message);
              reject(err);
            } else {
              console.log('Initial data seeded');
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get all people from database
   * @returns {Promise<Array>}
   */
  async getPeople() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM people ORDER BY id', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get a person by ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getPersonById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM people WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Add a new person to database
   * @param {Object} person
   * @returns {Promise<Object>}
   */
  async addPerson(person) {
    return new Promise((resolve, reject) => {
      const { name, email, notes } = person;
      const sql = 'INSERT INTO people (name, email, notes) VALUES (?, ?, ?)';

      this.db.run(sql, [name, email, notes], function (err) {
        if (err) {
          reject(err);
        } else {
          // Return the person with the new ID
          resolve({
            id: this.lastID,
            name,
            email,
            notes,
          });
        }
      });
    });
  }

  /**
   * Update an existing person
   * @param {Object} person
   * @returns {Promise<Object>}
   */
  async updatePerson(person) {
    return new Promise((resolve, reject) => {
      const { id, name, email, notes } = person;
      const sql =
        'UPDATE people SET name = ?, email = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

      this.db.run(sql, [name, email, notes, id], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Person not found'));
        } else {
          resolve({ id, name, email, notes });
        }
      });
    });
  }

  /**
   * Delete a person by ID
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deletePerson(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM people WHERE id = ?', [id], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Person not found'));
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = Database;
