const sqlite3 = require( "sqlite3" ).verbose()
const path = require( "path" )

let db = null

/**
 * Initialize the database connection and create tables if they don't exist
 * @returns { Promise< object > }
 */
function initDatabase() {
  return new Promise( ( resolve, reject ) => {
    if( db ) {
      return resolve( db )
    }

    const dbPath = path.join( __dirname, "..", "data.db" )
    db = new sqlite3.Database( dbPath, ( err ) => {
      if( err ) {
        console.error( "Error opening database:", err.message )
        return reject( err )
      }
      console.log( "Connected to SQLite database" )

      // Create tables
      createTables()
        .then( () => resolve( db ) )
        .catch( reject )
    } )
  } )
}

/**
 * Create all necessary tables
 * @returns { Promise< void > }
 */
function createTables() {
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
          console.error( "Error creating people table:", err.message )
          return reject( err )
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
          console.error( "Error creating landlords table:", err.message )
          return reject( err )
        }
      } )

      // Buildings table
      db.run( `
        CREATE TABLE IF NOT EXISTS buildings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          landlord_id INTEGER NOT NULL,
          type TEXT,
          year_built INTEGER,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (landlord_id) REFERENCES landlords (id) ON DELETE CASCADE
        )
      `, ( err ) => {
        if( err ) {
          console.error( "Error creating buildings table:", err.message )
          return reject( err )
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
          console.error( "Error creating rooms table:", err.message )
          return reject( err )
        }
        console.log( "All database tables created successfully" )
        resolve()
      } )
    } )
  } )
}

/**
 * Get the database instance
 * @returns { object }
 */
function getDatabase() {
  if( !db ) {
    throw new Error( "Database not initialized. Call initDatabase() first." )
  }
  return db
}

/**
 * Run a SQL query that returns multiple rows
 * @param { string } sql - SQL query string
 * @param { Array } params - Query parameters
 * @returns { Promise< Array > }
 */
function all( sql, params = [] ) {
  return new Promise( ( resolve, reject ) => {
    db.all( sql, params, ( err, rows ) => {
      if( err ) {
        reject( err )
      } else {
        resolve( rows )
      }
    } )
  } )
}

/**
 * Run a SQL query that returns a single row
 * @param { string } sql - SQL query string
 * @param { Array } params - Query parameters
 * @returns { Promise< object | null > }
 */
function get( sql, params = [] ) {
  return new Promise( ( resolve, reject ) => {
    db.get( sql, params, ( err, row ) => {
      if( err ) {
        reject( err )
      } else {
        resolve( row || null )
      }
    } )
  } )
}

/**
 * Run a SQL query that modifies data (INSERT, UPDATE, DELETE)
 * @param { string } sql - SQL query string
 * @param { Array } params - Query parameters
 * @returns { Promise< object > } - Returns object with lastID and changes
 */
function run( sql, params = [] ) {
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

/**
 * Close the database connection
 */
function close() {
  if( db ) {
    db.close( ( err ) => {
      if( err ) {
        console.error( "Error closing database:", err.message )
      } else {
        console.log( "Database connection closed" )
      }
    } )
    db = null
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  all,
  get,
  run,
  close,
}