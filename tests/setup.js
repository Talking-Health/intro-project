const fs = require( "fs" )
const path = require( "path" )

// Global test setup
beforeEach( () => {
  // Clear any existing test database files
  const testDbFiles = ["test.db", "test-*.db"]
  testDbFiles.forEach( pattern => {
    if( pattern.includes( "*" ) ) {
      // Handle wildcard patterns if needed
      return
    }
    const dbPath = path.join( __dirname, "..", pattern )
    if( fs.existsSync( dbPath ) ) {
      fs.unlinkSync( dbPath )
    }
  } )
} )

afterEach( () => {
  // Clean up test database files after each test
  const testDbFiles = ["test.db", "test-*.db"]
  testDbFiles.forEach( pattern => {
    if( pattern.includes( "*" ) ) {
      // Handle wildcard patterns if needed
      return
    }
    const dbPath = path.join( __dirname, "..", pattern )
    if( fs.existsSync( dbPath ) ) {
      fs.unlinkSync( dbPath )
    }
  } )
} )

// Increase timeout for database operations
jest.setTimeout( 10000 )