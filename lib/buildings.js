/**
 * @typedef { Object } room
 * @property { number } id
 * @property { string } name - The name/identifier of the room.
 * @property { string } type - The type of room (bedroom, bathroom, kitchen, etc.).
 * @property { number } [ size ] - Size of the room in square feet (optional).
 * @property { string } [ notes ] - Additional notes about the room (optional).
 */

/**
 * @typedef { Object } building
 * @property { number } id
 * @property { string } name - The name of the building.
 * @property { string } address - The address of the building.
 * @property { number } landlordId - The ID of the landlord who owns this building.
 * @property { string } [ type ] - Type of building (residential, commercial, etc.) (optional).
 * @property { number } [ yearBuilt ] - Year the building was constructed (optional).
 * @property { string } [ notes ] - Additional notes about the building (optional).
 * @property { Array< room > } [ rooms ] - Array of rooms in this building (optional).
 */

/**
 * @type { Array< building > }
 */
const buildings = [
  {
    id: 1,
    name: "Maple Street Apartments",
    address: "123 Maple Street, Springfield, IL 62701",
    landlordId: 1,
    type: "Residential",
    yearBuilt: 1985,
    notes: "3-story apartment building with 12 units",
    rooms: [
      { id: 1, name: "Unit 101 - Living Room", type: "living room", size: 300, notes: "Large windows, hardwood floors" },
      { id: 2, name: "Unit 101 - Bedroom", type: "bedroom", size: 150, notes: "Master bedroom with walk-in closet" },
      { id: 3, name: "Unit 101 - Kitchen", type: "kitchen", size: 120, notes: "Updated appliances" },
      { id: 4, name: "Unit 101 - Bathroom", type: "bathroom", size: 60, notes: "Recently renovated" }
    ]
  },
  {
    id: 2,
    name: "Oak Plaza",
    address: "456 Oak Avenue, Springfield, IL 62702",
    landlordId: 1,
    type: "Commercial",
    yearBuilt: 1998,
    notes: "Office building with retail on ground floor",
    rooms: [
      { id: 5, name: "Suite 200", type: "office", size: 800, notes: "Corner office with city view" },
      { id: 6, name: "Suite 201", type: "office", size: 600, notes: "Open floor plan" },
      { id: 7, name: "Retail Space A", type: "retail", size: 1200, notes: "Street-facing storefront" }
    ]
  },
  {
    id: 3,
    name: "Pine Tower",
    address: "789 Pine Boulevard, Springfield, IL 62703",
    landlordId: 2,
    type: "Mixed Use",
    yearBuilt: 2010,
    notes: "Modern high-rise with residential and commercial units",
    rooms: [
      { id: 8, name: "Penthouse - Living Area", type: "living room", size: 600, notes: "Floor-to-ceiling windows" },
      { id: 9, name: "Penthouse - Master Bedroom", type: "bedroom", size: 400, notes: "Private balcony" },
      { id: 10, name: "Ground Floor Lobby", type: "lobby", size: 1000, notes: "Marble floors, 24/7 security" }
    ]
  }
]

/**
 * Demo function to return an array of building objects
 * @returns { Promise< Array< building > > }
 */
async function get() {
  return buildings
}

/**
 * Demo function adding or updating a building
 * @param { string } parsedurl
 * @param { string } method
 * @param { building } building
 * @return { Promise < object > }
 */
async function add( parsedurl, method, building ) {
  if( undefined !== building.id ) {
    // Update existing building
    buildings.some( element => {
      if( element.id === building.id ) {
        element.name = building.name
        element.address = building.address
        element.landlordId = building.landlordId
        element.type = building.type
        element.yearBuilt = building.yearBuilt
        element.notes = building.notes
        if( building.rooms ) {
          element.rooms = building.rooms
        }
        return true
      }
      return false
    } )
    return building
  }

  // Add new building
  building.id =
    buildings.reduce( ( maxid, obj ) => {
      return Math.max( maxid, obj.id )
    }, -Infinity ) + 1

  // Initialize rooms array if not provided
  if( !building.rooms ) {
    building.rooms = []
  }

  buildings.push( building )

  return building
}

/**
 * Get a specific building by ID
 * @param { number } buildingId
 * @return { Promise < building | null > }
 */
async function getById( buildingId ) {
  const building = buildings.find( b => b.id === buildingId )
  return building || null
}

/**
 * Get buildings owned by a specific landlord
 * @param { number } landlordId
 * @return { Promise< Array< building > > }
 */
async function getByLandlordId( landlordId ) {
  return buildings.filter( b => b.landlordId === landlordId )
}

/**
 * Add a room to a building
 * @param { number } buildingId
 * @param { room } room
 * @return { Promise < object > }
 */
async function addRoom( buildingId, room ) {
  const building = buildings.find( b => b.id === buildingId )
  if( building ) {
    if( !building.rooms ) {
      building.rooms = []
    }

    // Generate new room ID
    const maxRoomId = building.rooms.reduce( ( maxid, obj ) => {
      return Math.max( maxid, obj.id )
    }, 0 )

    room.id = maxRoomId + 1
    building.rooms.push( room )

    return building
  }
  throw new Error( "Building not found" )
}

/**
 * Update a room in a building
 * @param { number } buildingId
 * @param { room } room
 * @return { Promise < object > }
 */
async function updateRoom( buildingId, room ) {
  const building = buildings.find( b => b.id === buildingId )
  if( building && building.rooms ) {
    const roomIndex = building.rooms.findIndex( r => r.id === room.id )
    if( -1 !== roomIndex ) {
      building.rooms[roomIndex] = { ...building.rooms[roomIndex], ...room }
      return building
    }
    throw new Error( "Room not found" )
  }
  throw new Error( "Building not found" )
}

/**
 * Remove a room from a building
 * @param { number } buildingId
 * @param { number } roomId
 * @return { Promise < object > }
 */
async function removeRoom( buildingId, roomId ) {
  const building = buildings.find( b => b.id === buildingId )
  if( building && building.rooms ) {
    building.rooms = building.rooms.filter( r => r.id !== roomId )
    return building
  }
  throw new Error( "Building not found" )
}

module.exports = {
  get,
  add,
  getById,
  getByLandlordId,
  addRoom,
  updateRoom,
  removeRoom,
}