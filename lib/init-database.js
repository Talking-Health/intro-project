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
      ('Miss Piggy', 'piggy@muppets.com', 'Fabulous and fierce', '["Busy","Available","Available","Busy","Available","Available","Off"]'),
      ('Fozzie Bear', 'fozzie@comedy.com', 'Stand-up comedian, loves telling jokes', '["Available","Busy","Available","Available","Busy","Available","Off"]'),
      ('Gonzo Great', 'gonzo@stunts.com', 'Daredevil performer and stuntman', '["Busy","Busy","Available","Off","Available","Available","Available"]'),
      ('Scooter Assistant', 'scooter@theater.com', 'Theater manager and assistant', '["Available","Available","Available","Available","Available","Busy","Off"]'),
      ('Dr. Bunsen Honeydew', 'bunsen@labs.com', 'Chief scientist at Muppet Labs', '["Available","Available","Available","Available","Available","Available","Busy"]'),
      ('Beaker Meep', 'beaker@labs.com', 'Laboratory assistant, speaks only in meeps', '["Available","Available","Available","Available","Available","Available","Busy"]'),
      ('Swedish Chef', 'chef@kitchen.com', 'Head chef, speaks Swedish', '["Busy","Busy","Busy","Available","Busy","Off","Off"]')
    ` )

    // Insert sample landlords
    await run( `
      INSERT INTO landlords (name, email, phone, notes) VALUES 
      ('John Smith', 'john.smith@property.com', '+1-555-0123', 'Reliable and responsive landlord'),
      ('Sarah Johnson', 'sarah.j@realestate.com', '+1-555-0456', 'Specializes in commercial properties'),
      ('Michael Rodriguez', 'michael.r@cityproperties.com', '+1-555-0789', 'Downtown commercial specialist, 15 years experience'),
      ('Emily Chen', 'emily.chen@residentialplus.com', '+1-555-0321', 'Family-owned business, focuses on residential properties'),
      ('David Thompson', 'david.t@luxuryestates.com', '+1-555-0654', 'High-end luxury properties and penthouses'),
      ('Lisa Martinez', 'lisa.m@greenproperties.com', '+1-555-0987', 'Eco-friendly buildings and sustainable development')
    ` )

    // Insert sample buildings
    await run( `
      INSERT INTO buildings (name, address, landlord_id, type, year_built, notes) VALUES 
      ('Maple Street Apartments', '123 Maple Street, Springfield, IL 62701', 1, 'Residential', 1985, '3-story apartment building with 12 units'),
      ('Oak Plaza', '456 Oak Avenue, Springfield, IL 62702', 1, 'Commercial', 1998, 'Office building with retail on ground floor'),
      ('Pine Tower', '789 Pine Boulevard, Springfield, IL 62703', 2, 'Mixed Use', 2010, 'Modern high-rise with residential and commercial units'),
      ('Downtown Business Center', '321 Main Street, Springfield, IL 62704', 3, 'Commercial', 2005, '10-story office building with parking garage'),
      ('Riverside Condos', '654 River Road, Springfield, IL 62705', 4, 'Residential', 2015, 'Luxury condominiums with river views'),
      ('Family Gardens Complex', '987 Garden Lane, Springfield, IL 62706', 4, 'Residential', 1992, 'Family-friendly apartment complex with playground'),
      ('Sunset Manor', '147 Sunset Drive, Springfield, IL 62707', 5, 'Residential', 2018, 'Luxury apartment building with concierge service'),
      ('Green Valley Office Park', '258 Valley Road, Springfield, IL 62708', 6, 'Commercial', 2012, 'LEED certified office complex with solar panels'),
      ('Heritage Shopping Mall', '369 Heritage Boulevard, Springfield, IL 62709', 3, 'Commercial', 1989, 'Shopping center with 50+ retail spaces'),
      ('University Heights', '741 College Avenue, Springfield, IL 62710', 6, 'Mixed Use', 2020, 'Student housing with ground-floor commercial space')
    ` )

    // Insert sample rooms
    await run( `
      INSERT INTO rooms (building_id, name, type, size, notes) VALUES 
      -- Maple Street Apartments (Building 1)
      (1, 'Unit 101 - Living Room', 'living room', 300, 'Large windows, hardwood floors'),
      (1, 'Unit 101 - Bedroom', 'bedroom', 150, 'Master bedroom with walk-in closet'),
      (1, 'Unit 101 - Kitchen', 'kitchen', 120, 'Updated appliances'),
      (1, 'Unit 101 - Bathroom', 'bathroom', 60, 'Recently renovated'),
      (1, 'Unit 102 - Living Room', 'living room', 280, 'Open concept layout'),
      (1, 'Unit 102 - Bedroom', 'bedroom', 140, 'Two bedrooms with shared bathroom'),
      (1, 'Unit 102 - Kitchen', 'kitchen', 100, 'Galley style kitchen'),
      (1, 'Unit 201 - Studio', 'living room', 400, 'Large studio apartment'),
      
      -- Oak Plaza (Building 2)
      (2, 'Suite 200', 'office', 800, 'Corner office with city view'),
      (2, 'Suite 201', 'office', 600, 'Open floor plan'),
      (2, 'Suite 202', 'office', 450, 'Private offices and meeting room'),
      (2, 'Retail Space A', 'retail', 1200, 'Street-facing storefront'),
      (2, 'Retail Space B', 'retail', 800, 'Corner retail space'),
      
      -- Pine Tower (Building 3)
      (3, 'Penthouse - Living Area', 'living room', 600, 'Floor-to-ceiling windows'),
      (3, 'Penthouse - Master Bedroom', 'bedroom', 400, 'Private balcony'),
      (3, 'Ground Floor Lobby', 'lobby', 1000, 'Marble floors, 24/7 security'),
      (3, 'Unit 5A - Living Room', 'living room', 350, 'City skyline view'),
      (3, 'Unit 5A - Bedroom', 'bedroom', 200, 'Master suite with ensuite'),
      
      -- Downtown Business Center (Building 4)
      (4, 'Executive Suite 1001', 'office', 1200, 'Corner executive office with conference room'),
      (4, 'Open Office Floor 5', 'office', 2500, 'Large open office space for 50+ employees'),
      (4, 'Meeting Room Alpha', 'office', 300, 'Board room with video conferencing'),
      (4, 'Reception Lobby', 'lobby', 800, 'Grand entrance with security desk'),
      
      -- Riverside Condos (Building 5)
      (5, 'Condo 3A - Living Room', 'living room', 450, 'River view with balcony'),
      (5, 'Condo 3A - Master Bedroom', 'bedroom', 250, 'Walk-in closet and ensuite'),
      (5, 'Condo 3A - Kitchen', 'kitchen', 180, 'Gourmet kitchen with island'),
      (5, 'Condo 7B - Penthouse Living', 'living room', 800, 'Luxury penthouse with panoramic views'),
      
      -- Family Gardens Complex (Building 6)
      (6, 'Unit A1 - Living Room', 'living room', 320, 'Family-friendly layout'),
      (6, 'Unit A1 - Kids Bedroom', 'bedroom', 120, 'Bunk bed ready room'),
      (6, 'Unit A1 - Parents Bedroom', 'bedroom', 180, 'Quiet master bedroom'),
      (6, 'Community Room', 'other', 600, 'Shared community space with kitchen'),
      
      -- Sunset Manor (Building 7)
      (7, 'Luxury Suite 12A', 'living room', 500, 'High-end finishes throughout'),
      (7, 'Luxury Suite 12A - Bedroom', 'bedroom', 300, 'King suite with sitting area'),
      (7, 'Concierge Lobby', 'lobby', 400, '24/7 concierge service'),
      
      -- Green Valley Office Park (Building 8)
      (8, 'Eco Office Suite 100', 'office', 900, 'Solar-powered office with green roof access'),
      (8, 'Conference Center', 'office', 1500, 'Multi-purpose conference and event space'),
      (8, 'Innovation Lab', 'office', 700, 'Modern workspace with collaboration areas'),
      
      -- Heritage Shopping Mall (Building 9)
      (9, 'Anchor Store East', 'retail', 5000, 'Large department store space'),
      (9, 'Food Court', 'retail', 2000, 'Central dining area with multiple vendors'),
      (9, 'Boutique Space 15', 'retail', 400, 'Small retail space perfect for specialty shops'),
      (9, 'Electronics Store', 'retail', 1800, 'Tech retail space with storage'),
      
      -- University Heights (Building 10)
      (10, 'Student Apartment 401', 'bedroom', 200, 'Furnished student housing'),
      (10, 'Study Lounge', 'other', 300, 'Quiet study space with WiFi'),
      (10, 'Campus Cafe', 'retail', 600, 'Coffee shop and light meals'),
      (10, 'Fitness Center', 'other', 800, 'Student gym with modern equipment')
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