const { all, get: getFromDb, run } = require( "./database" )

/**
 * @typedef { Object } landlord
 * @property { number } id
 * @property { string } name - The name of the landlord.
 * @property { string } email - The email address of the landlord.
 * @property { string } phone - The phone number of the landlord.
 * @property { string } [ notes ] - Additional notes about the landlord (optional).
 * @property { Array< number > } [ buildings ] - Array of building IDs owned by this landlord (optional).
 */

/**
 * Get all landlords from the database with their building IDs
 * @returns { Promise< Array< landlord > > }
 */
async function get() {
  const landlords = await all( "SELECT * FROM landlords ORDER BY id" )

  // For each landlord, get their building IDs
  for( const landlord of landlords ) {
    const buildings = await all( "SELECT id FROM buildings WHERE landlord_id = ?", [landlord.id] )
    landlord.buildings = buildings.map( b => b.id )
  }

  return landlords
}

/**
 * Add or update a landlord in the database
 * @param { string } parsedurl
 * @param { string } method
 * @param { landlord } landlord
 * @return { Promise < object > }
 */
async function add( parsedurl, method, landlord ) {
  if( undefined !== landlord.id ) {
    // Update existing landlord
    await run(
      "UPDATE landlords SET name = ?, email = ?, phone = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [landlord.name, landlord.email, landlord.phone, landlord.notes, landlord.id]
    )

    // Get the updated landlord with building IDs
    const buildings = await all( "SELECT id FROM buildings WHERE landlord_id = ?", [landlord.id] )
    const updatedLandlord = { ...landlord, buildings: buildings.map( b => b.id ) }
    return updatedLandlord
  }

  // Add new landlord
  const result = await run(
    "INSERT INTO landlords (name, email, phone, notes) VALUES (?, ?, ?, ?)",
    [landlord.name, landlord.email, landlord.phone, landlord.notes]
  )

  const updatedLandlord = { ...landlord, id: result.lastID, buildings: [] }
  return updatedLandlord
}

/**
 * Get a specific landlord by ID
 * @param { number } landlordId
 * @return { Promise < landlord | null > }
 */
async function getById( landlordId ) {
  const landlord = await getFromDb( "SELECT * FROM landlords WHERE id = ?", [landlordId] )
  if( !landlord ) {
    return null
  }

  // Get building IDs for this landlord
  const buildings = await all( "SELECT id FROM buildings WHERE landlord_id = ?", [landlordId] )
  landlord.buildings = buildings.map( b => b.id )

  return landlord
}

/**
 * Add a building to a landlord's portfolio
 * @param { number } landlordId
 * @param { number } buildingId
 * @return { Promise < object > }
 */
async function addBuilding( landlordId, buildingId ) {
  // First check if landlord exists
  const landlord = await getFromDb( "SELECT * FROM landlords WHERE id = ?", [landlordId] )
  if( !landlord ) {
    throw new Error( "Landlord not found" )
  }

  // Update the building to belong to this landlord
  const result = await run(
    "UPDATE buildings SET landlord_id = ? WHERE id = ?",
    [landlordId, buildingId]
  )

  if( 0 === result.changes ) {
    throw new Error( "Building not found" )
  }

  // Return updated landlord with building IDs
  const buildings = await all( "SELECT id FROM buildings WHERE landlord_id = ?", [landlordId] )
  landlord.buildings = buildings.map( b => b.id )

  return landlord
}

/**
 * Remove a building from a landlord's portfolio
 * @param { number } landlordId
 * @param { number } buildingId
 * @return { Promise < object > }
 */
async function removeBuilding( landlordId, buildingId ) {
  // First check if landlord exists
  const landlord = await getFromDb( "SELECT * FROM landlords WHERE id = ?", [landlordId] )
  if( !landlord ) {
    throw new Error( "Landlord not found" )
  }

  // Set the building's landlord_id to NULL or another value (or delete it entirely)
  // For this example, I'll set it to NULL to remove the association
  const result = await run(
    "UPDATE buildings SET landlord_id = NULL WHERE id = ? AND landlord_id = ?",
    [buildingId, landlordId]
  )

  if( 0 === result.changes ) {
    throw new Error( "Building not found or not owned by this landlord" )
  }

  // Return updated landlord with building IDs
  const buildings = await all( "SELECT id FROM buildings WHERE landlord_id = ?", [landlordId] )
  landlord.buildings = buildings.map( b => b.id )

  return landlord
}

/**
 * Delete a landlord from the database
 * @param { number } landlordId
 * @return { Promise < object > }
 */
async function deleteLandlord( landlordId ) {
  // First check if landlord exists
  const landlord = await getFromDb( "SELECT * FROM landlords WHERE id = ?", [landlordId] )
  if( !landlord ) {
    throw new Error( "Landlord not found" )
  }

  // Get buildings owned by this landlord
  const buildings = await all( "SELECT id FROM buildings WHERE landlord_id = ?", [landlordId] )

  // Delete all buildings and their rooms (cascade delete)
  for( const building of buildings ) {
    // Delete all rooms for this building
    await run( "DELETE FROM rooms WHERE building_id = ?", [building.id] )
    // Delete the building
    await run( "DELETE FROM buildings WHERE id = ?", [building.id] )
  }

  // Now delete the landlord
  const result = await run( "DELETE FROM landlords WHERE id = ?", [landlordId] )

  if( 0 === result.changes ) {
    throw new Error( "Failed to delete landlord" )
  }

  return { success: true, deletedId: landlordId, deletedBuildings: buildings.map( b => b.id ) }
}

module.exports = {
  get,
  add,
  getById,
  addBuilding,
  removeBuilding,
  deleteLandlord,
}