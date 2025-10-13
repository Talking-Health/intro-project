const { setupTestDatabase, cleanupTestDatabase, createDatabaseHelpers } = require( "./test-helpers" )

// Mock the database module to use our test database
let testDb
let helpers
jest.mock( "../lib/database", () => ( {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn()
} ) )

const landlords = require( "../lib/landlords" )
const { all, get, run } = require( "../lib/database" )

describe( "Landlords Module", () => {
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
    test( "should return all landlords with their building IDs", async () => {
      // Insert test landlords
      const landlord1Result = await helpers.run(
        "INSERT INTO landlords (name, email, phone, notes) VALUES (?, ?, ?, ?)",
        ["John Smith", "john@property.com", "+1-555-0123", "Reliable landlord"]
      )
      const landlord2Result = await helpers.run(
        "INSERT INTO landlords (name, email, phone, notes) VALUES (?, ?, ?, ?)",
        ["Jane Doe", "jane@realestate.com", "+1-555-0456", "Commercial specialist"]
      )

      // Insert buildings for the landlords
      await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 1", "123 Main St", landlord1Result.lastID]
      )
      await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 2", "456 Oak Ave", landlord1Result.lastID]
      )
      await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 3", "789 Pine St", landlord2Result.lastID]
      )

      const result = await landlords.get()

      expect( result ).toHaveLength( 2 )

      // First landlord
      expect( result[0].name ).toBe( "John Smith" )
      expect( result[0].email ).toBe( "john@property.com" )
      expect( result[0].phone ).toBe( "+1-555-0123" )
      expect( result[0].notes ).toBe( "Reliable landlord" )
      expect( result[0].buildings ).toHaveLength( 2 )

      // Second landlord
      expect( result[1].name ).toBe( "Jane Doe" )
      expect( result[1].email ).toBe( "jane@realestate.com" )
      expect( result[1].phone ).toBe( "+1-555-0456" )
      expect( result[1].notes ).toBe( "Commercial specialist" )
      expect( result[1].buildings ).toHaveLength( 1 )
    } )

    test( "should return empty array when no landlords exist", async () => {
      const result = await landlords.get()

      expect( result ).toHaveLength( 0 )
    } )

    test( "should return landlords with empty buildings array when they have no buildings", async () => {
      await helpers.run(
        "INSERT INTO landlords (name, email, phone) VALUES (?, ?, ?)",
        ["No Buildings Landlord", "nobuildings@example.com", "+1-555-0000"]
      )

      const result = await landlords.get()

      expect( result ).toHaveLength( 1 )
      expect( result[0].name ).toBe( "No Buildings Landlord" )
      expect( result[0].buildings ).toHaveLength( 0 )
    } )
  } )

  describe( "add()", () => {
    test( "should add new landlord", async () => {
      const landlordData = {
        name: "New Landlord",
        email: "new@example.com",
        phone: "+1-555-7777",
        notes: "New property owner"
      }

      const result = await landlords.add( "", "", landlordData )

      expect( result ).toMatchObject( landlordData )
      expect( result.id ).toBeGreaterThan( 0 )
      expect( result.buildings ).toEqual( [] )

      // Verify in database
      const dbLandlord = await helpers.get( "SELECT * FROM landlords WHERE id = ?", [result.id] )
      expect( dbLandlord.name ).toBe( landlordData.name )
      expect( dbLandlord.email ).toBe( landlordData.email )
      expect( dbLandlord.phone ).toBe( landlordData.phone )
      expect( dbLandlord.notes ).toBe( landlordData.notes )
    } )

    test( "should update existing landlord", async () => {
      // First add a landlord
      const insertResult = await helpers.run(
        "INSERT INTO landlords (name, email, phone, notes) VALUES (?, ?, ?, ?)",
        ["Original Name", "original@example.com", "+1-555-0000", "Original notes"]
      )

      const updatedLandlordData = {
        id: insertResult.lastID,
        name: "Updated Name",
        email: "updated@example.com",
        phone: "+1-555-9999",
        notes: "Updated notes"
      }

      const result = await landlords.add( "", "", updatedLandlordData )

      expect( result ).toMatchObject( updatedLandlordData )

      // Verify update in database
      const dbLandlord = await helpers.get( "SELECT * FROM landlords WHERE id = ?", [insertResult.lastID] )
      expect( dbLandlord.name ).toBe( "Updated Name" )
      expect( dbLandlord.email ).toBe( "updated@example.com" )
      expect( dbLandlord.phone ).toBe( "+1-555-9999" )
      expect( dbLandlord.notes ).toBe( "Updated notes" )
    } )

    test( "should handle landlord with minimal data", async () => {
      const landlordData = {
        name: "Minimal Landlord",
        email: "minimal@example.com"
      }

      const result = await landlords.add( "", "", landlordData )

      expect( result.name ).toBe( landlordData.name )
      expect( result.email ).toBe( landlordData.email )
      expect( result.id ).toBeGreaterThan( 0 )
      expect( result.buildings ).toEqual( [] )
    } )
  } )

  describe( "getById()", () => {
    test( "should return landlord with building IDs when found", async () => {
      // Insert landlord
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email, phone, notes) VALUES (?, ?, ?, ?)",
        ["Test Landlord", "test@example.com", "+1-555-1234", "Test notes"]
      )

      // Insert buildings for the landlord
      const building1Result = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 1", "123 Test St", landlordResult.lastID]
      )
      const building2Result = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 2", "456 Test Ave", landlordResult.lastID]
      )

      const result = await landlords.getById( landlordResult.lastID )

      expect( result.id ).toBe( landlordResult.lastID )
      expect( result.name ).toBe( "Test Landlord" )
      expect( result.email ).toBe( "test@example.com" )
      expect( result.phone ).toBe( "+1-555-1234" )
      expect( result.notes ).toBe( "Test notes" )
      expect( result.buildings ).toHaveLength( 2 )
      expect( result.buildings ).toContain( building1Result.lastID )
      expect( result.buildings ).toContain( building2Result.lastID )
    } )

    test( "should return null when landlord not found", async () => {
      const result = await landlords.getById( 999 )

      expect( result ).toBeNull()
    } )

    test( "should return landlord with empty buildings array when no buildings", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["No Buildings", "nobuildings@example.com"]
      )

      const result = await landlords.getById( landlordResult.lastID )

      expect( result.id ).toBe( landlordResult.lastID )
      expect( result.buildings ).toHaveLength( 0 )
    } )
  } )

  describe( "addBuilding()", () => {
    test( "should add building to landlord successfully", async () => {
      // Insert landlord and building
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )
      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address) VALUES (?, ?)",
        ["Test Building", "123 Test St"]
      )

      const result = await landlords.addBuilding( landlordResult.lastID, buildingResult.lastID )

      expect( result.id ).toBe( landlordResult.lastID )
      expect( result.buildings ).toContain( buildingResult.lastID )

      // Verify in database
      const dbBuilding = await helpers.get( "SELECT * FROM buildings WHERE id = ?", [buildingResult.lastID] )
      expect( dbBuilding.landlord_id ).toBe( landlordResult.lastID )
    } )

    test( "should throw error when landlord not found", async () => {
      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address) VALUES (?, ?)",
        ["Test Building", "123 Test St"]
      )

      await expect( landlords.addBuilding( 999, buildingResult.lastID ) ).rejects.toThrow( "Landlord not found" )
    } )

    test( "should throw error when building not found", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      await expect( landlords.addBuilding( landlordResult.lastID, 999 ) ).rejects.toThrow( "Building not found" )
    } )

    test( "should handle multiple buildings for same landlord", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Multi Building Landlord", "multi@example.com"]
      )
      const building1Result = await helpers.run(
        "INSERT INTO buildings (name, address) VALUES (?, ?)",
        ["Building 1", "123 Test St"]
      )
      const building2Result = await helpers.run(
        "INSERT INTO buildings (name, address) VALUES (?, ?)",
        ["Building 2", "456 Test Ave"]
      )

      await landlords.addBuilding( landlordResult.lastID, building1Result.lastID )
      const result = await landlords.addBuilding( landlordResult.lastID, building2Result.lastID )

      expect( result.buildings ).toHaveLength( 2 )
      expect( result.buildings ).toContain( building1Result.lastID )
      expect( result.buildings ).toContain( building2Result.lastID )
    } )
  } )

  describe( "removeBuilding()", () => {
    test( "should remove building from landlord successfully", async () => {
      // Insert landlord and building with association
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )
      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      const result = await landlords.removeBuilding( landlordResult.lastID, buildingResult.lastID )

      expect( result.id ).toBe( landlordResult.lastID )
      expect( result.buildings ).not.toContain( buildingResult.lastID )

      // Verify in database
      const dbBuilding = await helpers.get( "SELECT * FROM buildings WHERE id = ?", [buildingResult.lastID] )
      expect( dbBuilding.landlord_id ).toBeNull()
    } )

    test( "should throw error when landlord not found", async () => {
      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address) VALUES (?, ?)",
        ["Test Building", "123 Test St"]
      )

      await expect( landlords.removeBuilding( 999, buildingResult.lastID ) ).rejects.toThrow( "Landlord not found" )
    } )

    test( "should throw error when building not associated with landlord", async () => {
      const landlord1Result = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Landlord 1", "landlord1@example.com"]
      )
      const landlord2Result = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Landlord 2", "landlord2@example.com"]
      )
      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlord2Result.lastID]
      )

      await expect( landlords.removeBuilding( landlord1Result.lastID, buildingResult.lastID ) )
        .rejects.toThrow( "Building not found or not owned by this landlord" )
    } )

    test( "should handle removing one building while keeping others", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Multi Building Landlord", "multi@example.com"]
      )
      const building1Result = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 1", "123 Test St", landlordResult.lastID]
      )
      const building2Result = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 2", "456 Test Ave", landlordResult.lastID]
      )

      const result = await landlords.removeBuilding( landlordResult.lastID, building1Result.lastID )

      expect( result.buildings ).toHaveLength( 1 )
      expect( result.buildings ).not.toContain( building1Result.lastID )
      expect( result.buildings ).toContain( building2Result.lastID )
    } )
  } )

  describe( "Input Validation", () => {
    test( "should handle missing required fields", async () => {
      const landlordData = {
        email: "test@example.com"
        // missing name
      }

      await expect( landlords.add( "", "", landlordData ) ).rejects.toThrow()
    } )

    test( "should handle null values gracefully", async () => {
      const landlordData = {
        name: "Test Landlord",
        email: "test@example.com",
        phone: null,
        notes: null
      }

      const result = await landlords.add( "", "", landlordData )

      expect( result.name ).toBe( "Test Landlord" )
      expect( result.email ).toBe( "test@example.com" )
      expect( result.phone ).toBeNull()
      expect( result.notes ).toBeNull()
    } )
  } )

  describe( "deleteLandlord()", () => {
    test( "should delete existing landlord successfully", async () => {
      // Add a landlord first
      const addResult = await landlords.add( null, null, {
        name: "Delete Test",
        email: "delete@test.com",
        phone: "+1-555-0000",
        notes: "Will be deleted"
      } )

      // Delete the landlord
      const deleteResult = await landlords.deleteLandlord( addResult.id )

      expect( deleteResult ).toEqual( {
        success: true,
        deletedId: addResult.id
      } )

      // Verify landlord is actually deleted
      const allLandlords = await landlords.get()
      expect( allLandlords.find( l => l.id === addResult.id ) ).toBeUndefined()
    } )

    test( "should throw error when deleting non-existent landlord", async () => {
      await expect( landlords.deleteLandlord( 99999 ) ).rejects.toThrow( "Landlord not found" )
    } )

    test( "should prevent deleting landlord with existing buildings", async () => {
      // Add a landlord first
      const landlordResult = await landlords.add( null, null, {
        name: "Landlord with Buildings",
        email: "withbuildings@test.com",
        phone: "+1-555-0001"
      } )

      // Add a building for this landlord
      await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.id]
      )

      // Attempt to delete the landlord should fail
      await expect( landlords.deleteLandlord( landlordResult.id ) ).rejects.toThrow(
        "Cannot delete landlord with existing buildings. Please delete or reassign buildings first."
      )

      // Verify landlord still exists
      const allLandlords = await landlords.get()
      expect( allLandlords.find( l => l.id === landlordResult.id ) ).toBeDefined()
    } )
  } )
} )