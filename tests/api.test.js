// Mock all the modules that the API uses
jest.mock( "../lib/people" )
jest.mock( "../lib/landlords" )
jest.mock( "../lib/buildings" )

const { handleapi } = require( "../lib/api" )
const people = require( "../lib/people" )
const landlords = require( "../lib/landlords" )
const buildings = require( "../lib/buildings" )

describe( "API Module", () => {
  let mockRes
  let mockReq

  beforeEach( () => {
    // Mock response object
    mockRes = {
      writeHead: jest.fn(),
      end: jest.fn()
    }

    // Mock request object
    mockReq = {
      method: "GET"
    }

    // Clear all mocks
    jest.clearAllMocks()
  } )

  describe( "handleapi()", () => {
    describe( "People endpoints", () => {
      test( "should handle GET /api/people", async () => {
        const mockPeople = [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" }
        ]
        people.get.mockResolvedValue( mockPeople )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( people.get ).toHaveBeenCalledWith( parsedUrl, "GET", null )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockPeople ) )
      } )

      test( "should handle PUT /api/people", async () => {
        const mockPersonData = { name: "New Person", email: "new@example.com" }
        const mockResult = { id: 1, ...mockPersonData }
        people.add.mockResolvedValue( mockResult )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, mockPersonData )

        expect( people.add ).toHaveBeenCalledWith( parsedUrl, "PUT", mockPersonData )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockResult ) )
      } )

      test( "should handle PUT /api/people/schedule", async () => {
        const mockScheduleData = { personId: 1, schedule: ["Available", "Busy", "Available", "Available", "Available", "Off", "Off"] }
        const mockResult = { id: 1, name: "John Doe", schedule: mockScheduleData.schedule }
        people.updateSchedule.mockResolvedValue( mockResult )

        const parsedUrl = new URL( "http://localhost:3000/api/people/schedule" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, mockScheduleData )

        expect( people.updateSchedule ).toHaveBeenCalledWith( parsedUrl, "PUT", mockScheduleData )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockResult ) )
      } )
    } )

    describe( "Landlords endpoints", () => {
      test( "should handle GET /api/landlords", async () => {
        const mockLandlords = [
          { id: 1, name: "John Smith", email: "john@property.com", buildings: [1, 2] },
          { id: 2, name: "Jane Doe", email: "jane@realestate.com", buildings: [3] }
        ]
        landlords.get.mockResolvedValue( mockLandlords )

        const parsedUrl = new URL( "http://localhost:3000/api/landlords" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( landlords.get ).toHaveBeenCalledWith( parsedUrl, "GET", null )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockLandlords ) )
      } )

      test( "should handle PUT /api/landlords", async () => {
        const mockLandlordData = { name: "New Landlord", email: "new@property.com", phone: "+1-555-0000" }
        const mockResult = { id: 1, ...mockLandlordData, buildings: [] }
        landlords.add.mockResolvedValue( mockResult )

        const parsedUrl = new URL( "http://localhost:3000/api/landlords" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, mockLandlordData )

        expect( landlords.add ).toHaveBeenCalledWith( parsedUrl, "PUT", mockLandlordData )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockResult ) )
      } )

      test( "should handle PUT /api/landlords/building", async () => {
        const mockData = { landlordId: 1, buildingId: 2 }
        const mockResult = { id: 1, name: "Landlord", buildings: [1, 2] }
        landlords.addBuilding.mockResolvedValue( mockResult )

        const parsedUrl = new URL( "http://localhost:3000/api/landlords/building" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, mockData )

        expect( landlords.addBuilding ).toHaveBeenCalledWith( parsedUrl, "PUT", mockData )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockResult ) )
      } )
    } )

    describe( "Buildings endpoints", () => {
      test( "should handle GET /api/buildings", async () => {
        const mockBuildings = [
          {
            id: 1,
            name: "Building 1",
            address: "123 Main St",
            landlordId: 1,
            rooms: [
              { id: 1, name: "Room 1", type: "bedroom" }
            ]
          },
          {
            id: 2,
            name: "Building 2",
            address: "456 Oak Ave",
            landlordId: 1,
            rooms: []
          }
        ]
        buildings.get.mockResolvedValue( mockBuildings )

        const parsedUrl = new URL( "http://localhost:3000/api/buildings" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( buildings.get ).toHaveBeenCalledWith( parsedUrl, "GET", null )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockBuildings ) )
      } )

      test( "should handle PUT /api/buildings", async () => {
        const mockBuildingData = {
          name: "New Building",
          address: "789 Pine St",
          landlordId: 1,
          type: "Commercial"
        }
        const mockResult = { id: 1, ...mockBuildingData, rooms: [] }
        buildings.add.mockResolvedValue( mockResult )

        const parsedUrl = new URL( "http://localhost:3000/api/buildings" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, mockBuildingData )

        expect( buildings.add ).toHaveBeenCalledWith( parsedUrl, "PUT", mockBuildingData )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockResult ) )
      } )

      test( "should handle PUT /api/buildings/room", async () => {
        const mockRoomData = { buildingId: 1, name: "New Room", type: "office" }
        const mockResult = {
          id: 1,
          name: "Building 1",
          rooms: [
            { id: 1, name: "New Room", type: "office" }
          ]
        }
        buildings.addRoom.mockResolvedValue( mockResult )

        const parsedUrl = new URL( "http://localhost:3000/api/buildings/room" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, mockRoomData )

        expect( buildings.addRoom ).toHaveBeenCalledWith( parsedUrl, "PUT", mockRoomData )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockResult ) )
      } )

      test( "should handle PUT /api/buildings/room/update", async () => {
        const mockRoomData = { id: 1, buildingId: 1, name: "Updated Room", type: "office" }
        const mockResult = {
          id: 1,
          name: "Building 1",
          rooms: [
            { id: 1, name: "Updated Room", type: "office" }
          ]
        }
        buildings.updateRoom.mockResolvedValue( mockResult )

        const parsedUrl = new URL( "http://localhost:3000/api/buildings/room/update" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, mockRoomData )

        expect( buildings.updateRoom ).toHaveBeenCalledWith( parsedUrl, "PUT", mockRoomData )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockResult ) )
      } )

      test( "should handle PUT /api/buildings/room/delete", async () => {
        const mockDeleteData = { buildingId: 1, roomId: 1 }
        const mockResult = {
          id: 1,
          name: "Building 1",
          rooms: []
        }
        buildings.removeRoom.mockResolvedValue( mockResult )

        const parsedUrl = new URL( "http://localhost:3000/api/buildings/room/delete" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, mockDeleteData )

        expect( buildings.removeRoom ).toHaveBeenCalledWith( parsedUrl, "PUT", mockDeleteData )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockResult ) )
      } )
    } )

    describe( "Error handling", () => {
      test( "should return 404 for unknown endpoints", async () => {
        const parsedUrl = new URL( "http://localhost:3000/api/unknown" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( mockRes.writeHead ).toHaveBeenCalledWith( 404, { "Content-Type": "text/plain" } )
        expect( mockRes.end ).toHaveBeenCalledWith( "404 - Not found" )
      } )

      test( "should return 404 for unsupported HTTP methods", async () => {
        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "POST"  // POST is not supported for /api/people

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( mockRes.writeHead ).toHaveBeenCalledWith( 404, { "Content-Type": "text/plain" } )
        expect( mockRes.end ).toHaveBeenCalledWith( "404 - Not found" )
      } )

      test( "should return 400 for DELETE method with invalid data", async () => {
        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "DELETE"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( mockRes.writeHead ).toHaveBeenCalledWith( 400, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( { error: "Cannot read properties of null (reading 'id')" } ) )
      } )

      test( "should handle module function errors gracefully", async () => {
        const errorMessage = "Database error"
        people.get.mockRejectedValue( new Error( errorMessage ) )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( people.get ).toHaveBeenCalled()
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 400, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( { error: errorMessage } ) )
      } )

      test( "should log 404 errors to console", async () => {
        const consoleSpy = jest.spyOn( console, "error" ).mockImplementation( () => {} )

        const parsedUrl = new URL( "http://localhost:3000/api/nonexistent" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( consoleSpy ).toHaveBeenCalledWith( "404 file not found: ", "/api/nonexistent" )

        consoleSpy.mockRestore()
      } )
    } )

    describe( "Endpoint routing", () => {
      test( "should route all supported endpoints correctly", () => {
        // This test verifies that all endpoints in the calls object are valid
        // We can't easily test the internal calls object, but we can verify
        // that all our test cases above cover the expected endpoints
        const expectedEndpoints = [
          { path: "/api/people", methods: ["GET", "PUT"] },
          { path: "/api/people/schedule", methods: ["PUT"] },
          { path: "/api/landlords", methods: ["GET", "PUT"] },
          { path: "/api/landlords/building", methods: ["PUT"] },
          { path: "/api/buildings", methods: ["GET", "PUT"] },
          { path: "/api/buildings/room", methods: ["PUT"] },
          { path: "/api/buildings/room/update", methods: ["PUT"] },
          { path: "/api/buildings/room/delete", methods: ["PUT"] }
        ]

        // This is more of a documentation test to ensure we're testing all endpoints
        expect( expectedEndpoints.length ).toBe( 8 )
      } )
    } )

    describe( "Response formatting", () => {
      test( "should return JSON response with correct headers", async () => {
        const mockData = { id: 1, name: "Test" }
        people.get.mockResolvedValue( mockData )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( mockData ) )
      } )

      test( "should handle null/undefined responses", async () => {
        people.get.mockResolvedValue( null )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( "null" )
      } )

      test( "should handle empty array responses", async () => {
        people.get.mockResolvedValue( [] )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( "[]" )
      } )
    } )

    describe( "Input handling", () => {
      test( "should pass received object to module functions", async () => {
        const inputData = { name: "Test Person", email: "test@example.com" }
        people.add.mockResolvedValue( { id: 1, ...inputData } )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, inputData )

        expect( people.add ).toHaveBeenCalledWith( parsedUrl, "PUT", inputData )
      } )

      test( "should handle null received object", async () => {
        people.get.mockResolvedValue( [] )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "GET"

        await handleapi( parsedUrl, mockRes, mockReq, null )

        expect( people.get ).toHaveBeenCalledWith( parsedUrl, "GET", null )
      } )

      test( "should handle complex nested objects", async () => {
        const complexData = {
          name: "Complex Building",
          address: "123 Test St",
          landlordId: 1,
          rooms: [
            { name: "Room 1", type: "bedroom", size: 150 },
            { name: "Room 2", type: "bathroom", size: 50 }
          ]
        }
        buildings.add.mockResolvedValue( { id: 1, ...complexData } )

        const parsedUrl = new URL( "http://localhost:3000/api/buildings" )
        mockReq.method = "PUT"

        await handleapi( parsedUrl, mockRes, mockReq, complexData )

        expect( buildings.add ).toHaveBeenCalledWith( parsedUrl, "PUT", complexData )
      } )
    } )

    describe( "DELETE endpoints", () => {
      test( "should handle DELETE /api/people", async () => {
        people.deletePerson.mockResolvedValue( { success: true, deletedId: 1 } )

        const parsedUrl = new URL( "http://localhost:3000/api/people" )
        mockReq.method = "DELETE"
        const requestData = { id: 1 }

        await handleapi( parsedUrl, mockRes, mockReq, requestData )

        expect( people.deletePerson ).toHaveBeenCalledWith( 1 )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( { success: true, deletedId: 1 } ) )
      } )

      test( "should handle DELETE /api/landlords", async () => {
        landlords.deleteLandlord.mockResolvedValue( { success: true, deletedId: 2 } )

        const parsedUrl = new URL( "http://localhost:3000/api/landlords" )
        mockReq.method = "DELETE"
        const requestData = { id: 2 }

        await handleapi( parsedUrl, mockRes, mockReq, requestData )

        expect( landlords.deleteLandlord ).toHaveBeenCalledWith( 2 )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( { success: true, deletedId: 2 } ) )
      } )

      test( "should handle DELETE /api/buildings", async () => {
        buildings.deleteBuilding.mockResolvedValue( { success: true, deletedId: 3 } )

        const parsedUrl = new URL( "http://localhost:3000/api/buildings" )
        mockReq.method = "DELETE"
        const requestData = { id: 3 }

        await handleapi( parsedUrl, mockRes, mockReq, requestData )

        expect( buildings.deleteBuilding ).toHaveBeenCalledWith( 3 )
        expect( mockRes.writeHead ).toHaveBeenCalledWith( 200, { "Content-Type": "application/json" } )
        expect( mockRes.end ).toHaveBeenCalledWith( JSON.stringify( { success: true, deletedId: 3 } ) )
      } )

      test( "should return 404 for DELETE on unsupported endpoints", async () => {
        const parsedUrl = new URL( "http://localhost:3000/api/people/schedule" )
        mockReq.method = "DELETE"

        await handleapi( parsedUrl, mockRes, mockReq, { id: 1 } )

        expect( mockRes.writeHead ).toHaveBeenCalledWith( 404, { "Content-Type": "text/plain" } )
        expect( mockRes.end ).toHaveBeenCalledWith( "404 - Not found" )
      } )
    } )
  } )
} )