#!/usr/bin/env node

/**
 * Database seeding script
 * Adds sample data to the database
 */

const Database = require('../lib/database');

async function seedDatabase() {
  console.log('Seeding database with sample data...');

  try {
    const db = new Database();
    await db.init();

    // Check if data already exists
    const existingPeople = await db.getPeople();
    if (existingPeople.length > 0) {
      console.log('Database already contains data. Skipping seed.');
      await db.close();
      return;
    }

    // Add sample people
    const samplePeople = [
      { name: 'John Doe', email: 'john@example.com', notes: 'Sample person 1' },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        notes: 'Sample person 2',
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        notes: 'Sample person 3',
      },
    ];

    for (const person of samplePeople) {
      await db.addPerson(person);
      console.log(`Added: ${person.name}`);
    }

    console.log('Database seeding completed successfully');
    await db.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
