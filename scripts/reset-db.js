#!/usr/bin/env node

/**
 * Database reset script
 * Removes database file and recreates it
 */

const fs = require('fs');
const path = require('path');
const Database = require('../lib/database');

async function resetDatabase() {
  console.log('Resetting database...');

  try {
    const dbPath = 'data/app.db';

    // Remove existing database file if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Removed existing database file');
    }

    // Create new database
    const db = new Database();
    await db.init();
    console.log('Database reset completed successfully');
    await db.close();
  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  }
}

// Run reset if called directly
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;
