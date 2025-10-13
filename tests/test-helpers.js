const sqlite3 = require( "sqlite3" ).verbose()
const path = require( "path" )
const fs = require( "fs" )

/**
 * Create a test database with a unique name
 * @returns {Promise<sqlite3.Database>}
 */
function createTestDatabase() {
  return new Promise( ( resolve, reject ) => {
    const dbPath = path.join( __dirname, "..", `test-${Date.now()}-${Math.random().toString( 36 ).substr( 2, 9 )}.db` )

    const db = new sqlite3.Database( dbPath, ( err ) => {
      if( err ) {
        reject( err )
        return
      }

      // Store the path on the db object for cleanup
      db.testDbPath = dbPath
      resolve( db )
    } )
  } )
}

/**
 * Create all necessary tables for testing
 * @param {sqlite3.Database} db
 * @returns {Promise<void>}
 */
function createTestTables( db ) {
  return new Promise( ( resolve, reject ) => {
    db.serialize( () => {
      // People table
      db.run( `
        CREATE TABLE IF NOT EXISTS people (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          notes TEXT,
          schedule TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, ( err ) => {
        if( err ) {
          reject( err )
        }
      } )

      // Landlords table
      db.run( `
        CREATE TABLE IF NOT EXISTS landlords (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, ( err ) => {
        if( err ) {
          reject( err )
        }
      } )

      // Buildings table
      db.run( `
        CREATE TABLE IF NOT EXISTS buildings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          landlord_id INTEGER,
          type TEXT,
          year_built INTEGER,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (landlord_id) REFERENCES landlords (id)
        )
      `, ( err ) => {
        if( err ) {
          reject( err )
        }
      } )

      // Rooms table
      db.run( `
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          building_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          size INTEGER,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE
        )
      `, ( err ) => {
        if( err ) {
          reject( err )
          return
        }
        resolve()
      } )
    } )
  } )
}

/**
 * Clean up test database
 * @param {sqlite3.Database} db
 * @returns {Promise<void>}
 */
function cleanupTestDatabase( db ) {
  return new Promise( ( resolve ) => {
    if( !db || !db.testDbPath ) {
      resolve()
      return
    }

    db.close( ( err ) => {
      if( err ) {
        console.error( "Error closing test database:", err )
      }

      // Remove the test database file
      if( fs.existsSync( db.testDbPath ) ) {
        try {
          fs.unlinkSync( db.testDbPath )
        } catch ( error ) {
          console.error( "Error removing test database file:", error )
        }
      }

      resolve()
    } )
  } )
}

/**
 * Create and setup a complete test database
 * @returns {Promise<sqlite3.Database>}
 */
async function setupTestDatabase() {
  const db = await createTestDatabase()
  await createTestTables( db )
  return db
}

/**
 * Database helper functions for tests
 */
function createDatabaseHelpers( db ) {
  return {
    all: ( sql, params = [] ) => {
      return new Promise( ( resolve, reject ) => {
        db.all( sql, params, ( err, rows ) => {
          if( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
        } )
      } )
    },

    get: ( sql, params = [] ) => {
      return new Promise( ( resolve, reject ) => {
        db.get( sql, params, ( err, row ) => {
          if( err ) {
            reject( err )
          } else {
            resolve( row )
          }
        } )
      } )
    },

    run: ( sql, params = [] ) => {
      return new Promise( ( resolve, reject ) => {
        db.run( sql, params, function( err ) {
          if( err ) {
            reject( err )
          } else {
            resolve( { lastID: this.lastID, changes: this.changes } )
          }
        } )
      } )
    }
  }
}

module.exports = {
  createTestDatabase,
  createTestTables,
  cleanupTestDatabase,
  setupTestDatabase,
  createDatabaseHelpers
}