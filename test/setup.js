/**
 * Jest setup file
 * This runs before all tests to configure the test environment
 */

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Mock the database module BEFORE any other modules are loaded
jest.mock('../lib/database', () => {
  const { getTestDatabase, initTestDatabase, closeTestDatabase } = require('./helpers/test-database');
  
  return {
    getDatabase: getTestDatabase,
    initDatabase: initTestDatabase,
    closeDatabase: closeTestDatabase
  };
});

