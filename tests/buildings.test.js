const { setupTestDatabase, cleanupTestDatabase, createDatabaseHelpers } = require( "./test-helpers" )

// Mock the database module to use our test database
let testDb
let helpers
jest.mock( "../lib/database", () => ( {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn()
} ) )

const buildings = require( "../lib/buildings" )
const { all, get, run } = require( "../lib/database" )

describe( "Buildings Module", () => {
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
    test( "should return all buildings with their rooms", async () => {
      // Insert landlord first
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      // Insert buildings
      const building1Result = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id, type, year_built, notes) VALUES (?, ?, ?, ?, ?, ?)",
        ["Building 1", "123 Main St", landlordResult.lastID, "Residential", 1990, "Test building 1"]
      )
      const building2Result = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 2", "456 Oak Ave", landlordResult.lastID]
      )

      // Insert rooms for building 1
      await helpers.run(
        "INSERT INTO rooms (building_id, name, type, size, notes) VALUES (?, ?, ?, ?, ?)",
        [building1Result.lastID, "Living Room", "living room", 300, "Large living room"]
      )
      await helpers.run(
        "INSERT INTO rooms (building_id, name, type, size) VALUES (?, ?, ?, ?)",
        [building1Result.lastID, "Bedroom", "bedroom", 150]
      )

      const result = await buildings.get()

      expect( result ).toHaveLength( 2 )

      // First building
      expect( result[0].id ).toBe( building1Result.lastID )
      expect( result[0].name ).toBe( "Building 1" )
      expect( result[0].address ).toBe( "123 Main St" )
      expect( result[0].landlordId ).toBe( landlordResult.lastID )
      expect( result[0].type ).toBe( "Residential" )
      expect( result[0].yearBuilt ).toBe( 1990 )
      expect( result[0].notes ).toBe( "Test building 1" )
      expect( result[0].rooms ).toHaveLength( 2 )

      // Second building
      expect( result[1].id ).toBe( building2Result.lastID )
      expect( result[1].name ).toBe( "Building 2" )
      expect( result[1].rooms ).toHaveLength( 0 )
    } )

    test( "should return empty array when no buildings exist", async () => {
      const result = await buildings.get()

      expect( result ).toHaveLength( 0 )
    } )
  } )

  describe( "add()", () => {
    test( "should add new building without rooms", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingData = {
        name: "New Building",
        address: "789 Pine St",
        landlordId: landlordResult.lastID,
        type: "Commercial",
        yearBuilt: 2020,
        notes: "Modern office building"
      }

      const result = await buildings.add( "", "", buildingData )

      expect( result ).toMatchObject( buildingData )
      expect( result.id ).toBeGreaterThan( 0 )
      expect( result.rooms ).toEqual( [] )

      // Verify in database
      const dbBuilding = await helpers.get( "SELECT * FROM buildings WHERE id = ?", [result.id] )
      expect( dbBuilding.name ).toBe( buildingData.name )
      expect( dbBuilding.address ).toBe( buildingData.address )
      expect( dbBuilding.landlord_id ).toBe( buildingData.landlordId )
    } )

    test( "should add new building with rooms", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingData = {
        name: "Building with Rooms",
        address: "101 Test Ave",
        landlordId: landlordResult.lastID,
        type: "Residential",
        rooms: [
          { name: "Living Room", type: "living room", size: 300, notes: "Spacious" },
          { name: "Bedroom", type: "bedroom", size: 150 },
          { name: "Kitchen", type: "kitchen", size: 100, notes: "Modern appliances" }
        ]
      }

      const result = await buildings.add( "", "", buildingData )

      expect( result.name ).toBe( buildingData.name )
      expect( result.id ).toBeGreaterThan( 0 )
      expect( result.rooms ).toHaveLength( 3 )

      // Verify rooms in database
      const dbRooms = await helpers.all( "SELECT * FROM rooms WHERE building_id = ?", [result.id] )
      expect( dbRooms ).toHaveLength( 3 )
      expect( dbRooms[0].name ).toBe( "Living Room" )
      expect( dbRooms[0].type ).toBe( "living room" )
      expect( dbRooms[0].size ).toBe( 300 )
    } )

    test( "should update existing building", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      // Insert building
      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Original Name", "123 Original St", landlordResult.lastID]
      )

      // Add some rooms
      await helpers.run(
        "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)",
        [buildingResult.lastID, "Old Room", "bedroom"]
      )

      const updatedBuildingData = {
        id: buildingResult.lastID,
        name: "Updated Name",
        address: "456 Updated Ave",
        landlordId: landlordResult.lastID,
        type: "Mixed Use",
        yearBuilt: 2021,
        notes: "Recently renovated",
        rooms: [
          { name: "New Living Room", type: "living room", size: 400 },
          { name: "New Bedroom", type: "bedroom", size: 200 }
        ]
      }

      const result = await buildings.add( "", "", updatedBuildingData )

      expect( result.id ).toBe( buildingResult.lastID )
      expect( result.name ).toBe( "Updated Name" )
      expect( result.address ).toBe( "456 Updated Ave" )
      expect( result.type ).toBe( "Mixed Use" )
      expect( result.rooms ).toHaveLength( 2 )
      expect( result.rooms[0].name ).toBe( "New Living Room" )

      // Verify old rooms are deleted
      const oldRooms = await helpers.all( "SELECT * FROM rooms WHERE building_id = ? AND name = ?",
        [buildingResult.lastID, "Old Room"] )
      expect( oldRooms ).toHaveLength( 0 )
    } )

    test( "should handle building with minimal data", async () => {
      const buildingData = {
        name: "Minimal Building",
        address: "999 Minimal St",
        landlordId: 1
      }

      const result = await buildings.add( "", "", buildingData )

      expect( result.name ).toBe( buildingData.name )
      expect( result.address ).toBe( buildingData.address )
      expect( result.id ).toBeGreaterThan( 0 )
    } )
  } )

  describe( "getById()", () => {
    test( "should return building with rooms when found", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id, type) VALUES (?, ?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID, "Residential"]
      )

      // Add rooms
      await helpers.run(
        "INSERT INTO rooms (building_id, name, type, size) VALUES (?, ?, ?, ?)",
        [buildingResult.lastID, "Living Room", "living room", 300]
      )
      await helpers.run(
        "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)",
        [buildingResult.lastID, "Bedroom", "bedroom"]
      )

      const result = await buildings.getById( buildingResult.lastID )

      expect( result.id ).toBe( buildingResult.lastID )
      expect( result.name ).toBe( "Test Building" )
      expect( result.address ).toBe( "123 Test St" )
      expect( result.landlordId ).toBe( landlordResult.lastID )
      expect( result.type ).toBe( "Residential" )
      expect( result.rooms ).toHaveLength( 2 )
    } )

    test( "should return null when building not found", async () => {
      const result = await buildings.getById( 999 )

      expect( result ).toBeNull()
    } )

    test( "should return building with empty rooms array when no rooms", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["No Rooms Building", "456 No Rooms St", landlordResult.lastID]
      )

      const result = await buildings.getById( buildingResult.lastID )

      expect( result.id ).toBe( buildingResult.lastID )
      expect( result.rooms ).toHaveLength( 0 )
    } )
  } )

  describe( "getByLandlordId()", () => {
    test( "should return buildings owned by specific landlord", async () => {
      const landlord1Result = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Landlord 1", "landlord1@example.com"]
      )
      const landlord2Result = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Landlord 2", "landlord2@example.com"]
      )

      // Buildings for landlord 1
      await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 1", "123 Test St", landlord1Result.lastID]
      )
      await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 2", "456 Test Ave", landlord1Result.lastID]
      )

      // Building for landlord 2
      await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Building 3", "789 Other St", landlord2Result.lastID]
      )

      const result = await buildings.getByLandlordId( landlord1Result.lastID )

      expect( result ).toHaveLength( 2 )
      expect( result[0].name ).toBe( "Building 1" )
      expect( result[1].name ).toBe( "Building 2" )
      expect( result.every( b => b.landlordId === landlord1Result.lastID ) ).toBe( true )
    } )

    test( "should return empty array when landlord has no buildings", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["No Buildings Landlord", "nobuildings@example.com"]
      )

      const result = await buildings.getByLandlordId( landlordResult.lastID )

      expect( result ).toHaveLength( 0 )
    } )
  } )

  describe( "addRoom()", () => {
    test( "should add room to building successfully", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      const roomData = {
        name: "New Room",
        type: "office",
        size: 200,
        notes: "Corner office with windows"
      }

      const result = await buildings.addRoom( buildingResult.lastID, roomData )

      expect( result.id ).toBe( buildingResult.lastID )
      expect( result.rooms ).toHaveLength( 1 )
      expect( result.rooms[0].name ).toBe( "New Room" )
      expect( result.rooms[0].type ).toBe( "office" )
      expect( result.rooms[0].size ).toBe( 200 )
      expect( result.rooms[0].notes ).toBe( "Corner office with windows" )
    } )

    test( "should throw error when building not found", async () => {
      const roomData = {
        name: "Test Room",
        type: "bedroom"
      }

      await expect( buildings.addRoom( 999, roomData ) ).rejects.toThrow( "Building not found" )
    } )

    test( "should add room to building with existing rooms", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      // Add existing room
      await helpers.run(
        "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)",
        [buildingResult.lastID, "Existing Room", "bedroom"]
      )

      const roomData = {
        name: "Additional Room",
        type: "bathroom"
      }

      const result = await buildings.addRoom( buildingResult.lastID, roomData )

      expect( result.rooms ).toHaveLength( 2 )
      expect( result.rooms.some( r => "Existing Room" === r.name ) ).toBe( true )
      expect( result.rooms.some( r => "Additional Room" === r.name ) ).toBe( true )
    } )
  } )

  describe( "updateRoom()", () => {
    test( "should update room successfully", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      const roomResult = await helpers.run(
        "INSERT INTO rooms (building_id, name, type, size) VALUES (?, ?, ?, ?)",
        [buildingResult.lastID, "Original Room", "bedroom", 150]
      )

      const updatedRoomData = {
        id: roomResult.lastID,
        name: "Updated Room",
        type: "office",
        size: 200,
        notes: "Now used as home office"
      }

      const result = await buildings.updateRoom( buildingResult.lastID, updatedRoomData )

      expect( result.id ).toBe( buildingResult.lastID )
      expect( result.rooms ).toHaveLength( 1 )
      expect( result.rooms[0].id ).toBe( roomResult.lastID )
      expect( result.rooms[0].name ).toBe( "Updated Room" )
      expect( result.rooms[0].type ).toBe( "office" )
      expect( result.rooms[0].size ).toBe( 200 )
      expect( result.rooms[0].notes ).toBe( "Now used as home office" )
    } )

    test( "should throw error when building not found", async () => {
      const roomData = {
        id: 1,
        name: "Test Room",
        type: "bedroom"
      }

      await expect( buildings.updateRoom( 999, roomData ) ).rejects.toThrow( "Building not found" )
    } )

    test( "should throw error when room not found", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      const roomData = {
        id: 999,
        name: "Nonexistent Room",
        type: "bedroom"
      }

      await expect( buildings.updateRoom( buildingResult.lastID, roomData ) ).rejects.toThrow( "Room not found" )
    } )

    test( "should not affect other rooms in the building", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      const room1Result = await helpers.run(
        "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)",
        [buildingResult.lastID, "Room 1", "bedroom"]
      )
      const room2Result = await helpers.run(
        "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)",
        [buildingResult.lastID, "Room 2", "bathroom"]
      )

      const updatedRoomData = {
        id: room1Result.lastID,
        name: "Updated Room 1",
        type: "office"
      }

      const result = await buildings.updateRoom( buildingResult.lastID, updatedRoomData )

      expect( result.rooms ).toHaveLength( 2 )
      const updatedRoom = result.rooms.find( r => r.id === room1Result.lastID )
      const unchangedRoom = result.rooms.find( r => r.id === room2Result.lastID )

      expect( updatedRoom.name ).toBe( "Updated Room 1" )
      expect( unchangedRoom.name ).toBe( "Room 2" )
    } )
  } )

  describe( "removeRoom()", () => {
    test( "should remove room successfully", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      const room1Result = await helpers.run(
        "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)",
        [buildingResult.lastID, "Room 1", "bedroom"]
      )
      const room2Result = await helpers.run(
        "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)",
        [buildingResult.lastID, "Room 2", "bathroom"]
      )

      const result = await buildings.removeRoom( buildingResult.lastID, room1Result.lastID )

      expect( result.id ).toBe( buildingResult.lastID )
      expect( result.rooms ).toHaveLength( 1 )
      expect( result.rooms[0].id ).toBe( room2Result.lastID )
      expect( result.rooms[0].name ).toBe( "Room 2" )
    } )

    test( "should throw error when building not found", async () => {
      await expect( buildings.removeRoom( 999, 1 ) ).rejects.toThrow( "Building not found" )
    } )

    test( "should throw error when room not found", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      await expect( buildings.removeRoom( buildingResult.lastID, 999 ) ).rejects.toThrow( "Room not found" )
    } )

    test( "should handle removing all rooms from building", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      const roomResult = await helpers.run(
        "INSERT INTO rooms (building_id, name, type) VALUES (?, ?, ?)",
        [buildingResult.lastID, "Only Room", "bedroom"]
      )

      const result = await buildings.removeRoom( buildingResult.lastID, roomResult.lastID )

      expect( result.rooms ).toHaveLength( 0 )
    } )
  } )

  describe( "Input Validation", () => {
    test( "should handle missing required fields in building", async () => {
      const buildingData = {
        address: "123 Test St"
        // missing name
      }

      await expect( buildings.add( "", "", buildingData ) ).rejects.toThrow()
    } )

    test( "should handle missing required fields in room", async () => {
      const landlordResult = await helpers.run(
        "INSERT INTO landlords (name, email) VALUES (?, ?)",
        ["Test Landlord", "test@example.com"]
      )

      const buildingResult = await helpers.run(
        "INSERT INTO buildings (name, address, landlord_id) VALUES (?, ?, ?)",
        ["Test Building", "123 Test St", landlordResult.lastID]
      )

      const roomData = {
        name: "Test Room"
        // missing type
      }

      await expect( buildings.addRoom( buildingResult.lastID, roomData ) ).rejects.toThrow()
    } )

    test( "should handle null values gracefully in building", async () => {
      const buildingData = {
        name: "Test Building",
        address: "123 Test St",
        landlordId: 1,
        type: null,
        yearBuilt: null,
        notes: null
      }

      const result = await buildings.add( "", "", buildingData )

      expect( result.name ).toBe( "Test Building" )
      expect( result.address ).toBe( "123 Test St" )
      expect( result.type ).toBeNull()
      expect( result.yearBuilt ).toBeNull()
      expect( result.notes ).toBeNull()
    } )
  } )
} )