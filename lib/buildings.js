const { all, get: getFromDb, run } = require( "./database" )

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
 * Get all buildings from the database with their rooms
 * @returns { Promise< Array< building > > }
 */
async function get() {
  const buildings = await all( `
    SELECT id, name, address, landlord_id as landlordId, type, year_built as yearBuilt, notes 
    FROM buildings 
    ORDER BY id
  ` )

  // For each building, get its rooms
  for( const building of buildings ) {
    const rooms = await all( "SELECT * FROM rooms WHERE building_id = ? ORDER BY id", [building.id] )
    building.rooms = rooms
  }

  return buildings
}

/**
 * Add or update a building in the database
 * @param { string } parsedurl
 * @param { string } method
 * @param { building } building
 * @return { Promise < object > }
 */
async function add( parsedurl, method, building ) {
  if( undefined !== building.id ) {
    // Update existing building
    await run( `
      UPDATE buildings 
      SET name = ?, address = ?, landlord_id = ?, type = ?, year_built = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [building.name, building.address, building.landlordId, building.type, building.yearBuilt, building.notes, building.id] )

    // Handle rooms if provided
    if( building.rooms ) {
      // Delete existing rooms for this building
      await run( "DELETE FROM rooms WHERE building_id = ?", [building.id] )

      // Add new rooms
      for( const room of building.rooms ) {
        await run(
          "INSERT INTO rooms (building_id, name, type, size, notes) VALUES (?, ?, ?, ?, ?)",
          [building.id, room.name, room.type, room.size, room.notes]
        )
      }
    }

    // Return updated building with rooms
    const updatedBuilding = await getById( building.id )
    return updatedBuilding
  }

  // Add new building
  const result = await run( `
    INSERT INTO buildings (name, address, landlord_id, type, year_built, notes) 
    VALUES (?, ?, ?, ?, ?, ?)
  `, [building.name, building.address, building.landlordId, building.type, building.yearBuilt, building.notes] )

  const buildingId = result.lastID

  // Add rooms if provided
  if( building.rooms && 0 < building.rooms.length ) {
    for( const room of building.rooms ) {
      await run(
        "INSERT INTO rooms (building_id, name, type, size, notes) VALUES (?, ?, ?, ?, ?)",
        [buildingId, room.name, room.type, room.size, room.notes]
      )
    }
  }

  // Return the building with the assigned ID and rooms
  const updatedBuilding = { ...building, id: buildingId, rooms: building.rooms || [] }
  return updatedBuilding
}

/**
 * Get a specific building by ID
 * @param { number } buildingId
 * @return { Promise < building | null > }
 */
async function getById( buildingId ) {
  const building = await getFromDb( `
    SELECT id, name, address, landlord_id as landlordId, type, year_built as yearBuilt, notes 
    FROM buildings WHERE id = ?
  `, [buildingId] )

  if( !building ) {
    return null
  }

  // Get rooms for this building
  const rooms = await all( "SELECT * FROM rooms WHERE building_id = ? ORDER BY id", [buildingId] )
  building.rooms = rooms

  return building
}

/**
 * Get buildings owned by a specific landlord
 * @param { number } landlordId
 * @return { Promise< Array< building > > }
 */
async function getByLandlordId( landlordId ) {
  const buildings = await all( `
    SELECT id, name, address, landlord_id as landlordId, type, year_built as yearBuilt, notes 
    FROM buildings WHERE landlord_id = ? ORDER BY id
  `, [landlordId] )

  // For each building, get its rooms
  for( const building of buildings ) {
    const rooms = await all( "SELECT * FROM rooms WHERE building_id = ? ORDER BY id", [building.id] )
    building.rooms = rooms
  }

  return buildings
}

/**
 * Add a room to a building
 * @param { number } buildingId
 * @param { room } room
 * @return { Promise < object > }
 */
async function addRoom( buildingId, room ) {
  // First check if building exists
  const building = await getFromDb( "SELECT id FROM buildings WHERE id = ?", [buildingId] )
  if( !building ) {
    throw new Error( "Building not found" )
  }

  // Add room to database
  await run(
    "INSERT INTO rooms (building_id, name, type, size, notes) VALUES (?, ?, ?, ?, ?)",
    [buildingId, room.name, room.type, room.size, room.notes]
  )

  // Return the updated building with all rooms
  return await getById( buildingId )
}

/**
 * Update a room in a building
 * @param { number } buildingId
 * @param { room } room
 * @return { Promise < object > }
 */
async function updateRoom( buildingId, room ) {
  // First check if building exists
  const building = await getFromDb( "SELECT id FROM buildings WHERE id = ?", [buildingId] )
  if( !building ) {
    throw new Error( "Building not found" )
  }

  // Update the room
  const result = await run( `
    UPDATE rooms 
    SET name = ?, type = ?, size = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND building_id = ?
  `, [room.name, room.type, room.size, room.notes, room.id, buildingId] )

  if( 0 === result.changes ) {
    throw new Error( "Room not found" )
  }

  // Return the updated building with all rooms
  return await getById( buildingId )
}

/**
 * Remove a room from a building
 * @param { number } buildingId
 * @param { number } roomId
 * @return { Promise < object > }
 */
async function removeRoom( buildingId, roomId ) {
  // First check if building exists
  const building = await getFromDb( "SELECT id FROM buildings WHERE id = ?", [buildingId] )
  if( !building ) {
    throw new Error( "Building not found" )
  }

  // Remove the room
  const result = await run( "DELETE FROM rooms WHERE id = ? AND building_id = ?", [roomId, buildingId] )

  if( 0 === result.changes ) {
    throw new Error( "Room not found" )
  }

  // Return the updated building with remaining rooms
  return await getById( buildingId )
}

/**
 * Delete a building from the database
 * @param { number } buildingId
 * @return { Promise < object > }
 */
async function deleteBuilding( buildingId ) {
  // First check if building exists
  const building = await getFromDb( "SELECT * FROM buildings WHERE id = ?", [buildingId] )
  if( !building ) {
    throw new Error( "Building not found" )
  }

  // Delete all rooms first (cascade delete)
  await run( "DELETE FROM rooms WHERE building_id = ?", [buildingId] )

  // Then delete the building
  const result = await run( "DELETE FROM buildings WHERE id = ?", [buildingId] )

  if( 0 === result.changes ) {
    throw new Error( "Failed to delete building" )
  }

  return { success: true, deletedId: buildingId }
}

module.exports = {
  get,
  add,
  getById,
  getByLandlordId,
  addRoom,
  updateRoom,
  removeRoom,
  deleteBuilding,
}