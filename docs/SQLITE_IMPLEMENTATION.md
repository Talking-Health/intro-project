# SQLite Database Implementation

## Overview

The backend has been successfully converted from in-memory storage to a persistent SQLite database using the **better-sqlite3** library. This provides non-volatile data storage while maintaining excellent performance.

## Why better-sqlite3?

After researching the latest SQLite libraries for Node.js (October 2025), **better-sqlite3** was chosen because:

- ✅ **Fastest** - Synchronous API is faster than async alternatives
- ✅ **Simplest** - Zero configuration, works out of the box
- ✅ **Full transaction support** - ACID compliant with proper transaction handling
- ✅ **High performance** - Uses native C++ bindings
- ✅ **Easy to use** - Synchronous API is more intuitive than callbacks/promises
- ✅ **Well maintained** - Active development and excellent documentation
- ✅ **Trust Score**: 6.8-9.8 across various packages

## Database Structure

### People Table

```sql
CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Indexes:**
- `idx_people_name` - Index on `name` column for faster lookups

### Database File Location

- **Production**: `data/app.db`
- **Test**: In-memory database (`:memory:`)
- **WAL files**: `data/app.db-wal` and `data/app.db-shm` (Write-Ahead Logging)

All database files are excluded from git via `.gitignore`.

## Implementation Details

### Database Module (`lib/database.js`)

The database module provides:

1. **`initDatabase()`** - Initializes the database connection and creates tables
2. **`getDatabase()`** - Returns the database instance (singleton pattern)
3. **`closeDatabase()`** - Closes the database connection gracefully

**Features:**
- Automatic table creation on first run
- Initial data seeding (Kermit Frog and Miss Piggy)
- WAL mode enabled for better performance
- Graceful shutdown handling (SIGTERM, SIGINT, SIGHUP)
- Verbose logging in development mode only

### People Module (`lib/people.js`)

Updated to use SQLite instead of in-memory array:

**`get(parsedurl)`**
- Retrieves all people from the database
- Returns array of person objects with timestamps
- Ordered by ID

**`add(parsedurl, method, person)`**
- **Insert**: Creates new person with auto-generated ID
- **Update**: Updates existing person by ID
- Returns the created/updated person object
- Automatically updates `updated_at` timestamp on updates

### Changes from In-Memory Implementation

| Feature | In-Memory | SQLite |
|---------|-----------|--------|
| **Data Persistence** | Lost on restart | Persisted to disk |
| **ID Generation** | Manual calculation | AUTO_INCREMENT |
| **Timestamps** | Not tracked | `created_at`, `updated_at` |
| **Concurrency** | Single process only | Multi-process safe |
| **Performance** | Very fast | Fast (with WAL mode) |
| **Data Integrity** | No guarantees | ACID compliant |

## Performance Optimizations

### WAL Mode (Write-Ahead Logging)

```javascript
db.pragma('journal_mode = WAL');
```

**Benefits:**
- Concurrent reads while writing
- Faster write operations
- Better crash recovery
- Recommended for web applications

### Prepared Statements

All queries use prepared statements for:
- **Security**: Protection against SQL injection
- **Performance**: Query plan caching
- **Type safety**: Proper parameter binding

### Transactions

Batch operations use transactions for:
- **Atomicity**: All-or-nothing execution
- **Performance**: Reduced disk I/O
- **Consistency**: Data integrity

## Testing

### Test Database (`test/helpers/test-database.js`)

Tests use an in-memory SQLite database:

- **Isolation**: Each test suite gets a fresh database
- **Speed**: In-memory is faster than disk
- **Reset**: Database is reset before each test
- **Same schema**: Identical to production database

### Test Coverage

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
lib/database.js     |   93.07 |       90 |      80 |   93.07
lib/people.js       |   97.59 |       70 |     100 |   97.59
test-database.js    |   94.73 |      100 |      75 |   94.73
```

All 67 tests passing ✅

## Usage Examples

### Starting the Server

```bash
# Production mode (no verbose logging)
node index.js

# Development mode (with SQL logging)
NODE_ENV=development node index.js
```

### Accessing the Database

The database is automatically initialized when the server starts. The `data/` directory is created if it doesn't exist.

### API Endpoints

**GET /api/people**
- Returns all people from the database
- Response includes `created_at` and `updated_at` timestamps

**PUT /api/people**
- Create new person (without `id`)
- Update existing person (with `id`)
- Returns the created/updated person

### Example API Calls

**Create a new person:**
```javascript
fetch('http://localhost:3000/api/people', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Fozzie Bear',
    email: 'fozzie@muppets.com',
    notes: 'Comedian'
  })
});
```

**Update an existing person:**
```javascript
fetch('http://localhost:3000/api/people', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 1,
    name: 'Kermit the Frog',
    email: 'kermit@muppets.com',
    notes: 'Updated information'
  })
});
```

## Database Maintenance

### Backup

```javascript
const { getDatabase } = require('./lib/database');
const db = getDatabase();

db.backup(`backup-${Date.now()}.db`)
  .then(() => console.log('Backup complete!'))
  .catch(err => console.error('Backup failed:', err));
```

### Viewing Data

```bash
# Install sqlite3 CLI if not already installed
# macOS: brew install sqlite3
# Ubuntu: sudo apt-get install sqlite3

# Open the database
sqlite3 data/app.db

# View all people
SELECT * FROM people;

# Exit
.quit
```

### Database Size

The database file will grow as data is added. WAL mode creates additional files:
- `app.db` - Main database file
- `app.db-wal` - Write-ahead log
- `app.db-shm` - Shared memory file

## Migration from In-Memory

The migration was seamless:

1. ✅ All existing tests pass without modification (except test setup)
2. ✅ API interface remains unchanged
3. ✅ Frontend code requires no changes
4. ✅ Data is now persistent across server restarts
5. ✅ Performance is excellent with WAL mode

## Future Enhancements

Potential improvements for the database layer:

1. **Additional Tables**: Landlords, Buildings, Rooms (as mentioned in readme.md)
2. **Relationships**: Foreign keys between tables
3. **Migrations**: Schema versioning and migration system
4. **Soft Deletes**: Add `deleted_at` column instead of hard deletes
5. **Full-Text Search**: SQLite FTS5 for searching people by name
6. **Pagination**: Limit/offset for large datasets
7. **Validation**: Database-level constraints
8. **Audit Log**: Track all changes to data

## Dependencies

```json
{
  "dependencies": {
    "better-sqlite3": "^11.7.0"
  }
}
```

## Files Modified/Created

### Created:
- `lib/database.js` - Database initialization and management
- `test/helpers/test-database.js` - Test database helper
- `data/` - Database directory (gitignored)
- `docs/SQLITE_IMPLEMENTATION.md` - This documentation

### Modified:
- `lib/people.js` - Updated to use SQLite
- `index.js` - Initialize database on startup
- `test/people.test.js` - Use test database
- `.gitignore` - Exclude database files
- `package.json` - Add better-sqlite3 dependency

## Troubleshooting

### Database Locked Error

If you see "database is locked" errors:
- Ensure only one server instance is running
- Check for zombie processes: `ps aux | grep node`
- WAL mode reduces locking issues

### Permission Errors

If the database file can't be created:
- Ensure the `data/` directory is writable
- Check file permissions: `ls -la data/`

### Test Failures

If tests fail:
- Ensure better-sqlite3 is installed: `npm install`
- Check that test database is being reset properly
- Run tests with verbose output: `npm test -- --verbose`

## Conclusion

The SQLite implementation provides a robust, performant, and persistent data storage solution while maintaining the simplicity of the original in-memory implementation. All tests pass, and the API remains unchanged, making this a successful migration.

