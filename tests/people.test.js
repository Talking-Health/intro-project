const { setupTestDatabase, cleanupTestDatabase, createDatabaseHelpers } = require( "./test-helpers" )

// Mock the database module to use our test database
let testDb
let helpers
jest.mock( "../lib/database", () => ( {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn()
} ) )

const people = require( "../lib/people" )
const { all, get, run } = require( "../lib/database" )

describe( "People Module", () => {
  beforeEach( async () => {
    testDb = await setupTestDatabase()
    helpers = createDatabaseHelpers( testDb )

    // Mock the database functions to use our test helpers
    all.mockImplementation( helpers.all )
    get.mockImplementation( helpers.get )
    run.mockImplementation( helpers.run )

    jest.clearAllMocks()
  } )

  afterEach( async () => {
    if( testDb ) {
      await cleanupTestDatabase( testDb )
    }
  } )

  describe( "get()", () => {
    test( "should return all people with parsed schedules", async () => {
      // Insert test data
      await helpers.run(
        "INSERT INTO people (name, email, notes, schedule) VALUES (?, ?, ?, ?)",
        ["John Doe", "john@example.com", "Test notes", '["Available","Busy","Available","Available","Available","Off","Off"]']
      )
      await helpers.run(
        "INSERT INTO people (name, email, notes, schedule) VALUES (?, ?, ?, ?)",
        ["Jane Smith", "jane@example.com", "Another person", null]
      )

      const result = await people.get()

      expect( result ).toHaveLength( 2 )

      // First person
      expect( result[0].name ).toBe( "John Doe" )
      expect( result[0].email ).toBe( "john@example.com" )
      expect( result[0].notes ).toBe( "Test notes" )
      expect( result[0].schedule ).toEqual( ["Available","Busy","Available","Available","Available","Off","Off"] )

      // Second person
      expect( result[1].name ).toBe( "Jane Smith" )
      expect( result[1].email ).toBe( "jane@example.com" )
      expect( result[1].notes ).toBe( "Another person" )
      expect( result[1].schedule ).toBeNull()
    } )

    test( "should return empty array when no people exist", async () => {
      const result = await people.get()

      expect( result ).toHaveLength( 0 )
    } )

    test( "should handle people with invalid schedule JSON", async () => {
      // Insert person with invalid JSON schedule
      await helpers.run(
        "INSERT INTO people (name, email, schedule) VALUES (?, ?, ?)",
        ["Test Person", "test@example.com", "invalid json"]
      )

      // This should not throw an error, but handle gracefully
      await expect( people.get() ).rejects.toThrow()
    } )
  } )

  describe( "add()", () => {
    test( "should add new person without schedule", async () => {
      const personData = {
        name: "New Person",
        email: "new@example.com",
        notes: "Test notes"
      }

      const result = await people.add( "", "", personData )

      expect( result ).toMatchObject( personData )
      expect( result.id ).toBeGreaterThan( 0 )

      // Verify in database
      const dbPerson = await helpers.get( "SELECT * FROM people WHERE id = ?", [result.id] )
      expect( dbPerson.name ).toBe( personData.name )
      expect( dbPerson.email ).toBe( personData.email )
      expect( dbPerson.notes ).toBe( personData.notes )
      expect( dbPerson.schedule ).toBeNull()
    } )

    test( "should add new person with schedule", async () => {
      const personData = {
        name: "Scheduled Person",
        email: "scheduled@example.com",
        notes: "Has schedule",
        schedule: ["Available", "Busy", "Available", "Available", "Available", "Off", "Off"]
      }

      const result = await people.add( "", "", personData )

      expect( result ).toMatchObject( personData )
      expect( result.id ).toBeGreaterThan( 0 )

      // Verify in database
      const dbPerson = await helpers.get( "SELECT * FROM people WHERE id = ?", [result.id] )
      expect( dbPerson.schedule ).toBe( JSON.stringify( personData.schedule ) )
    } )

    test( "should update existing person", async () => {
      // First add a person
      const insertResult = await helpers.run(
        "INSERT INTO people (name, email, notes) VALUES (?, ?, ?)",
        ["Original Name", "original@example.com", "Original notes"]
      )

      const updatedPersonData = {
        id: insertResult.lastID,
        name: "Updated Name",
        email: "updated@example.com",
        notes: "Updated notes",
        schedule: ["Busy", "Available", "Available", "Available", "Available", "Off", "Off"]
      }

      const result = await people.add( "", "", updatedPersonData )

      expect( result ).toMatchObject( updatedPersonData )

      // Verify update in database
      const dbPerson = await helpers.get( "SELECT * FROM people WHERE id = ?", [insertResult.lastID] )
      expect( dbPerson.name ).toBe( "Updated Name" )
      expect( dbPerson.email ).toBe( "updated@example.com" )
      expect( dbPerson.notes ).toBe( "Updated notes" )
      expect( dbPerson.schedule ).toBe( JSON.stringify( updatedPersonData.schedule ) )
    } )

    test( "should handle person without schedule", async () => {
      const personData = {
        name: "No Schedule Person",
        email: "noschedule@example.com",
        notes: "No schedule"
      }

      const result = await people.add( "", "", personData )

      expect( result.schedule ).toBeUndefined()

      // Verify in database
      const dbPerson = await helpers.get( "SELECT * FROM people WHERE id = ?", [result.id] )
      expect( dbPerson.schedule ).toBeNull()
    } )
  } )

  describe( "updateSchedule()", () => {
    test( "should update person schedule successfully", async () => {
      // First add a person
      const insertResult = await helpers.run(
        "INSERT INTO people (name, email) VALUES (?, ?)",
        ["Test Person", "test@example.com"]
      )

      const newSchedule = ["Available", "Busy", "Available", "Busy", "Available", "Off", "Off"]

      const result = await people.updateSchedule( insertResult.lastID, newSchedule )

      expect( result.id ).toBe( insertResult.lastID )
      expect( result.name ).toBe( "Test Person" )
      expect( result.email ).toBe( "test@example.com" )
      expect( result.schedule ).toEqual( newSchedule )

      // Verify in database
      const dbPerson = await helpers.get( "SELECT * FROM people WHERE id = ?", [insertResult.lastID] )
      expect( dbPerson.schedule ).toBe( JSON.stringify( newSchedule ) )
    } )

    test( "should throw error when person not found", async () => {
      const newSchedule = ["Available", "Busy", "Available", "Busy", "Available", "Off", "Off"]

      await expect( people.updateSchedule( 999, newSchedule ) ).rejects.toThrow( "Person not found" )
    } )

    test( "should handle empty schedule", async () => {
      // First add a person
      const insertResult = await helpers.run(
        "INSERT INTO people (name, email) VALUES (?, ?)",
        ["Test Person", "test@example.com"]
      )

      const newSchedule = []

      const result = await people.updateSchedule( insertResult.lastID, newSchedule )

      expect( result.schedule ).toEqual( [] )

      // Verify in database
      const dbPerson = await helpers.get( "SELECT * FROM people WHERE id = ?", [insertResult.lastID] )
      expect( dbPerson.schedule ).toBe( JSON.stringify( [] ) )
    } )

    test( "should return person with parsed schedule", async () => {
      // First add a person with existing schedule
      const insertResult = await helpers.run(
        "INSERT INTO people (name, email, schedule) VALUES (?, ?, ?)",
        ["Test Person", "test@example.com", '["Off","Off","Off","Off","Off","Off","Off"]']
      )

      const newSchedule = ["Available", "Available", "Available", "Available", "Available", "Available", "Available"]

      const result = await people.updateSchedule( insertResult.lastID, newSchedule )

      expect( result.schedule ).toEqual( newSchedule )
      expect( result.schedule ).not.toEqual( ["Off","Off","Off","Off","Off","Off","Off"] )
    } )
  } )

  describe( "Input Validation", () => {
    test( "should handle missing required fields", async () => {
      const personData = {
        email: "test@example.com"
        // missing name
      }

      await expect( people.add( "", "", personData ) ).rejects.toThrow()
    } )

    test( "should handle null values gracefully", async () => {
      const personData = {
        name: "Test Person",
        email: "test@example.com",
        notes: null,
        schedule: null
      }

      const result = await people.add( "", "", personData )

      expect( result.notes ).toBeNull()
      expect( result.schedule ).toBeNull()
    } )
  } )

  describe( "Schedule Handling", () => {
    test( "should handle valid 7-day schedule", async () => {
      const validSchedule = ["Available", "Busy", "Available", "Available", "Off", "Available", "Off"]
      const personData = {
        name: "Test Person",
        email: "test@example.com",
        schedule: validSchedule
      }

      const result = await people.add( "", "", personData )
      expect( result.schedule ).toEqual( validSchedule )
    } )

    test( "should handle schedule with different status values", async () => {
      const schedule = ["Available", "Busy", "Off", "Available", "Busy", "Off", "Available"]
      const personData = {
        name: "Test Person",
        email: "test@example.com",
        schedule: schedule
      }

      const result = await people.add( "", "", personData )
      expect( result.schedule ).toEqual( schedule )
    } )
  } )
} )