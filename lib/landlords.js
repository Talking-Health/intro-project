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
 * @type { Array< landlord > }
 */
const landlords = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@property.com",
    phone: "+1-555-0123",
    notes: "Reliable and responsive landlord",
    buildings: [1, 2]
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@realestate.com",
    phone: "+1-555-0456",
    notes: "Specializes in commercial properties",
    buildings: [3]
  },
]

/**
 * Demo function to return an array of landlord objects
 * @returns { Promise< Array< landlord > > }
 */
async function get() {
  return landlords
}

/**
 * Demo function adding or updating a landlord
 * @param { string } parsedurl
 * @param { string } method
 * @param { landlord } landlord
 * @return { Promise < object > }
 */
async function add( parsedurl, method, landlord ) {
  if( undefined !== landlord.id ) {
    // Update existing landlord
    landlords.some( element => {
      if( element.id === landlord.id ) {
        element.name = landlord.name
        element.email = landlord.email
        element.phone = landlord.phone
        element.notes = landlord.notes
        if( landlord.buildings ) {
          element.buildings = landlord.buildings
        }
        return true
      }
      return false
    } )
    return landlord
  }

  // Add new landlord
  landlord.id =
    landlords.reduce( ( maxid, obj ) => {
      return Math.max( maxid, obj.id )
    }, -Infinity ) + 1

  // Initialize buildings array if not provided
  if( !landlord.buildings ) {
    landlord.buildings = []
  }

  landlords.push( landlord )

  return landlord
}

/**
 * Get a specific landlord by ID
 * @param { number } landlordId
 * @return { Promise < landlord | null > }
 */
async function getById( landlordId ) {
  const landlord = landlords.find( l => l.id === landlordId )
  return landlord || null
}

/**
 * Add a building to a landlord's portfolio
 * @param { number } landlordId
 * @param { number } buildingId
 * @return { Promise < object > }
 */
async function addBuilding( landlordId, buildingId ) {
  const landlord = landlords.find( l => l.id === landlordId )
  if( landlord ) {
    if( !landlord.buildings ) {
      landlord.buildings = []
    }
    if( !landlord.buildings.includes( buildingId ) ) {
      landlord.buildings.push( buildingId )
    }
    return landlord
  }
  throw new Error( "Landlord not found" )
}

/**
 * Remove a building from a landlord's portfolio
 * @param { number } landlordId
 * @param { number } buildingId
 * @return { Promise < object > }
 */
async function removeBuilding( landlordId, buildingId ) {
  const landlord = landlords.find( l => l.id === landlordId )
  if( landlord ) {
    if( landlord.buildings ) {
      landlord.buildings = landlord.buildings.filter( id => id !== buildingId )
    }
    return landlord
  }
  throw new Error( "Landlord not found" )
}

module.exports = {
  get,
  add,
  getById,
  addBuilding,
  removeBuilding,
}