const { setupTestDatabase, cleanupTestDatabase, createDatabaseHelpers } = require( "./test-helpers" )

describe( "Database Module", () => {
  let testDb
  let helpers

  beforeEach( async () => {
    testDb = await setupTestDatabase()
    helpers = createDatabaseHelpers( testDb )
  } )

  afterEach( async () => {
    if( testDb ) {
      await cleanupTestDatabase( testDb )
    }
  } )

  describe( "Database Helper Functions", () => {
    test( "should execute SELECT query with all()", async () => {
      // Insert test data
      await helpers.run( "INSERT INTO people (name, email) VALUES (?, ?)", ["Test User", "test@example.com"] )

      // Test all() function
      const results = await helpers.all( "SELECT * FROM people" )

      expect( results ).toHaveLength( 1 )
      expect( results[0].name ).toBe( "Test User" )
      expect( results[0].email ).toBe( "test@example.com" )
    } )

    test( "should execute SELECT query with get() for single record", async () => {
      // Insert test data
      const insertResult = await helpers.run( "INSERT INTO people (name, email) VALUES (?, ?)", ["Test User", "test@example.com"] )

      // Test get() function
      const result = await helpers.get( "SELECT * FROM people WHERE id = ?", [insertResult.lastID] )

      expect( result ).toBeDefined()
      expect( result.name ).toBe( "Test User" )
      expect( result.email ).toBe( "test@example.com" )
      expect( result.id ).toBe( insertResult.lastID )
    } )

    test( "should return null when get() finds no record", async () => {
      const result = await helpers.get( "SELECT * FROM people WHERE id = ?", [999] )

      expect( result ).toBeUndefined()
    } )

    test( "should execute INSERT query with run()", async () => {
      const result = await helpers.run( "INSERT INTO people (name, email) VALUES (?, ?)", ["Test User", "test@example.com"] )

      expect( result.lastID ).toBeGreaterThan( 0 )
      expect( result.changes ).toBe( 1 )

      // Verify the record was inserted
      const inserted = await helpers.get( "SELECT * FROM people WHERE id = ?", [result.lastID] )
      expect( inserted.name ).toBe( "Test User" )
    } )

    test( "should execute UPDATE query with run()", async () => {
      // Insert test data
      const insertResult = await helpers.run( "INSERT INTO people (name, email) VALUES (?, ?)", ["Test User", "test@example.com"] )

      // Update the record
      const updateResult = await helpers.run( "UPDATE people SET name = ? WHERE id = ?", ["Updated User", insertResult.lastID] )

      expect( updateResult.changes ).toBe( 1 )

      // Verify the record was updated
      const updated = await helpers.get( "SELECT * FROM people WHERE id = ?", [insertResult.lastID] )
      expect( updated.name ).toBe( "Updated User" )
    } )

    test( "should execute DELETE query with run()", async () => {
      // Insert test data
      const insertResult = await helpers.run( "INSERT INTO people (name, email) VALUES (?, ?)", ["Test User", "test@example.com"] )

      // Delete the record
      const deleteResult = await helpers.run( "DELETE FROM people WHERE id = ?", [insertResult.lastID] )

      expect( deleteResult.changes ).toBe( 1 )

      // Verify the record was deleted
      const deleted = await helpers.get( "SELECT * FROM people WHERE id = ?", [insertResult.lastID] )
      expect( deleted ).toBeUndefined()
    } )

    test( "should handle parameters correctly", async () => {
      // Test with multiple parameters
      await helpers.run( "INSERT INTO people (name, email, notes) VALUES (?, ?, ?)", ["Test User", "test@example.com", "Test notes"] )

      const result = await helpers.get( "SELECT * FROM people WHERE name = ? AND email = ?", ["Test User", "test@example.com"] )

      expect( result.notes ).toBe( "Test notes" )
    } )

    test( "should handle queries with no parameters", async () => {
      await helpers.run( "INSERT INTO people (name, email) VALUES (?, ?)", ["Test User", "test@example.com"] )

      const results = await helpers.all( "SELECT COUNT(*) as count FROM people" )

      expect( results[0].count ).toBe( 1 )
    } )

    test( "should handle empty result sets", async () => {
      const results = await helpers.all( "SELECT * FROM people WHERE name = ?", ["Nonexistent"] )

      expect( results ).toHaveLength( 0 )
    } )
  } )

  describe( "Database Schema", () => {
    test( "should have all required tables", async () => {
      const tables = await helpers.all( "SELECT name FROM sqlite_master WHERE type='table'" )
      const tableNames = tables.map( table => table.name )

      expect( tableNames ).toContain( "people" )
      expect( tableNames ).toContain( "landlords" )
      expect( tableNames ).toContain( "buildings" )
      expect( tableNames ).toContain( "rooms" )
    } )

    test( "people table should have correct columns", async () => {
      const columns = await helpers.all( "PRAGMA table_info(people)" )
      const columnNames = columns.map( col => col.name )

      expect( columnNames ).toContain( "id" )
      expect( columnNames ).toContain( "name" )
      expect( columnNames ).toContain( "email" )
      expect( columnNames ).toContain( "notes" )
      expect( columnNames ).toContain( "schedule" )
      expect( columnNames ).toContain( "created_at" )
      expect( columnNames ).toContain( "updated_at" )
    } )

    test( "landlords table should have correct columns", async () => {
      const columns = await helpers.all( "PRAGMA table_info(landlords)" )
      const columnNames = columns.map( col => col.name )

      expect( columnNames ).toContain( "id" )
      expect( columnNames ).toContain( "name" )
      expect( columnNames ).toContain( "email" )
      expect( columnNames ).toContain( "phone" )
      expect( columnNames ).toContain( "notes" )
      expect( columnNames ).toContain( "created_at" )
      expect( columnNames ).toContain( "updated_at" )
    } )

    test( "buildings table should have correct columns and foreign key", async () => {
      const columns = await helpers.all( "PRAGMA table_info(buildings)" )
      const columnNames = columns.map( col => col.name )

      expect( columnNames ).toContain( "id" )
      expect( columnNames ).toContain( "name" )
      expect( columnNames ).toContain( "address" )
      expect( columnNames ).toContain( "landlord_id" )
      expect( columnNames ).toContain( "type" )
      expect( columnNames ).toContain( "year_built" )
      expect( columnNames ).toContain( "notes" )

      // Check foreign key constraint
      const foreignKeys = await helpers.all( "PRAGMA foreign_key_list(buildings)" )
      expect( foreignKeys ).toHaveLength( 1 )
      expect( foreignKeys[0].table ).toBe( "landlords" )
      expect( foreignKeys[0].from ).toBe( "landlord_id" )
    } )

    test( "rooms table should have correct columns and foreign key", async () => {
      const columns = await helpers.all( "PRAGMA table_info(rooms)" )
      const columnNames = columns.map( col => col.name )

      expect( columnNames ).toContain( "id" )
      expect( columnNames ).toContain( "building_id" )
      expect( columnNames ).toContain( "name" )
      expect( columnNames ).toContain( "type" )
      expect( columnNames ).toContain( "size" )
      expect( columnNames ).toContain( "notes" )

      // Check foreign key constraint
      const foreignKeys = await helpers.all( "PRAGMA foreign_key_list(rooms)" )
      expect( foreignKeys ).toHaveLength( 1 )
      expect( foreignKeys[0].table ).toBe( "buildings" )
      expect( foreignKeys[0].from ).toBe( "building_id" )
    } )
  } )

  describe( "Error Handling", () => {
    test( "should handle SQL syntax errors", async () => {
      await expect( helpers.all( "INVALID SQL SYNTAX" ) ).rejects.toThrow()
    } )

    test( "should handle constraint violations", async () => {
      // Enable foreign key constraints for this test
      await helpers.run( "PRAGMA foreign_keys = ON" )

      // Try to insert into rooms without a valid building_id
      await expect( helpers.run( "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)", [999, "Test Room", "bedroom"] ) )
        .rejects.toThrow()
    } )

    test( "should handle missing required fields", async () => {
      // Try to insert into people without required name field
      await expect( helpers.run( "INSERT INTO people (email) VALUES (?)", ["test@example.com"] ) )
        .rejects.toThrow()
    } )
  } )
} )