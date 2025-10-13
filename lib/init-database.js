const { initDatabase, run, get } = require( "./database" )

/**
 * Initialize database with sample data
 */
async function initSampleData() {
  try {
    // Initialize the database connection and create tables
    await initDatabase()

    // Check if we already have data
    const existingPeople = await get( "SELECT COUNT(*) as count FROM people" )
    if( 0 < existingPeople.count ) {
      console.log( "Database already contains data, skipping initialization" )
      return
    }

    console.log( "Initializing database with sample data..." )

    // Insert sample people
    await run( `
      INSERT INTO people (name, email, notes, schedule) VALUES 
      ('Kermit Frog', 'kermit@muppets.com', 'Great singer and banjo player', '["Available","Available","Busy","Available","Available","Off","Off"]'),
      ('Miss Piggy', 'piggy@muppets.com', 'Fabulous and fierce', '["Busy","Available","Available","Busy","Available","Available","Off"]')
    ` )

    // Insert sample landlords
    await run( `
      INSERT INTO landlords (name, email, phone, notes) VALUES 
      ('John Smith', 'john.smith@property.com', '+1-555-0123', 'Reliable and responsive landlord'),
      ('Sarah Johnson', 'sarah.j@realestate.com', '+1-555-0456', 'Specializes in commercial properties')
    ` )

    // Insert sample buildings
    await run( `
      INSERT INTO buildings (name, address, landlord_id, type, year_built, notes) VALUES 
      ('Maple Street Apartments', '123 Maple Street, Springfield, IL 62701', 1, 'Residential', 1985, '3-story apartment building with 12 units'),
      ('Oak Plaza', '456 Oak Avenue, Springfield, IL 62702', 1, 'Commercial', 1998, 'Office building with retail on ground floor'),
      ('Pine Tower', '789 Pine Boulevard, Springfield, IL 62703', 2, 'Mixed Use', 2010, 'Modern high-rise with residential and commercial units')
    ` )

    // Insert sample rooms
    await run( `
      INSERT INTO rooms (building_id, name, type, size, notes) VALUES 
      (1, 'Unit 101 - Living Room', 'living room', 300, 'Large windows, hardwood floors'),
      (1, 'Unit 101 - Bedroom', 'bedroom', 150, 'Master bedroom with walk-in closet'),
      (1, 'Unit 101 - Kitchen', 'kitchen', 120, 'Updated appliances'),
      (1, 'Unit 101 - Bathroom', 'bathroom', 60, 'Recently renovated'),
      (2, 'Suite 200', 'office', 800, 'Corner office with city view'),
      (2, 'Suite 201', 'office', 600, 'Open floor plan'),
      (2, 'Retail Space A', 'retail', 1200, 'Street-facing storefront'),
      (3, 'Penthouse - Living Area', 'living room', 600, 'Floor-to-ceiling windows'),
      (3, 'Penthouse - Master Bedroom', 'bedroom', 400, 'Private balcony'),
      (3, 'Ground Floor Lobby', 'lobby', 1000, 'Marble floors, 24/7 security')
    ` )

    console.log( "Database initialized successfully with sample data" )
  } catch ( error ) {
    console.error( "Error initializing database:", error.message )
    throw error
  }
}

// Run initialization if this script is executed directly
if( require.main === module ) {
  initSampleData()
    .then( () => {
      console.log( "Database initialization completed" )
      process.exit( 0 )
    } )
    .catch( ( error ) => {
      console.error( "Database initialization failed:", error )
      process.exit( 1 )
    } )
}

module.exports = { initSampleData }