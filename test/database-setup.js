const Database = require('../lib/database');
const path = require('path');
const fs = require('fs');

/**
 * Test database setup and teardown utilities
 */
class TestDatabase {
  constructor() {
    this.testDbPath = path.join(__dirname, 'test.db');
    this.db = null;
  }

  /**
   * Initialize test database
   * @returns {Promise<void>}
   */
  async init() {
    // Remove existing test database if it exists
    if (fs.existsSync(this.testDbPath)) {
      fs.unlinkSync(this.testDbPath);
    }

    this.db = new Database(this.testDbPath);
    await this.db.init();
  }

  /**
   * Clean up test database
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.db) {
      await this.db.close();
    }

    // Remove test database file
    if (fs.existsSync(this.testDbPath)) {
      fs.unlinkSync(this.testDbPath);
    }
  }

  /**
   * Get database instance
   * @returns {Database}
   */
  getDb() {
    return this.db;
  }

  /**
   * Clear all data from people table
   * @returns {Promise<void>}
   */
  async clearPeople() {
    return new Promise((resolve, reject) => {
      this.db.db.run('DELETE FROM people', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Insert test data
   * @returns {Promise<void>}
   */
  async seedTestData() {
    const testPeople = [
      {
        name: 'Test Person 1',
        email: 'test1@example.com',
        notes: 'Test notes 1',
      },
      {
        name: 'Test Person 2',
        email: 'test2@example.com',
        notes: 'Test notes 2',
      },
    ];

    for (const person of testPeople) {
      await this.db.addPerson(person);
    }
  }
}

module.exports = TestDatabase;
