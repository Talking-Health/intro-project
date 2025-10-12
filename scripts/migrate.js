#!/usr/bin/env node

/**
 * Database migration script
 * Creates database and tables if they don't exist
 */

const Database = require('../lib/database');
const path = require('path');

async function migrate() {
  console.log('Starting database migration...');

  try {
    const db = new Database();
    await db.init();
    console.log('Database migration completed successfully');
    await db.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
