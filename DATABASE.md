# Database Documentation

This project now uses SQLite for persistent data storage instead of in-memory arrays.

## Database Schema

### People Table

```sql
CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Database Operations

### Available Scripts

- `npm run db:migrate` - Create database and tables
- `npm run db:reset` - Reset database (delete and recreate)
- `npm run db:seed` - Add sample data to database

### Database Location

- **Production**: `data/app.db`
- **Tests**: `test/test.db`

## API Endpoints

### GET /api/people

Returns all people from the database.

**Response:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "notes": "Sample person",
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00"
  }
]
```

### PUT /api/people

Adds a new person or updates an existing one.

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "notes": "New person"
}
```

**Response:**

```json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "notes": "New person"
}
```

**Update existing person:**

```json
{
  "id": 1,
  "name": "Updated Name",
  "email": "updated@example.com",
  "notes": "Updated notes"
}
```

## Database Module

The `lib/database.js` module provides the following methods:

### Database Class

#### `init()`

Initialize database connection and create tables.

#### `getPeople()`

Get all people from the database.

#### `getPersonById(id)`

Get a specific person by ID.

#### `addPerson(person)`

Add a new person to the database.

#### `updatePerson(person)`

Update an existing person.

#### `deletePerson(id)`

Delete a person by ID.

#### `close()`

Close database connection.

## Testing

The test suite has been updated to work with SQLite:

- Each test uses a separate test database
- Test database is created and cleaned up automatically
- Tests run in isolation with fresh data

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

## Migration from In-Memory Storage

The following changes were made to migrate from in-memory storage:

1. **Added SQLite dependency** to `package.json`
2. **Created database module** (`lib/database.js`) for database operations
3. **Updated people module** (`lib/people.js`) to use SQLite instead of arrays
4. **Updated server initialization** to initialize database on startup
5. **Updated tests** to work with SQLite database
6. **Added database scripts** for migration, reset, and seeding

## Data Persistence

- **Before**: Data was stored in memory and lost on server restart
- **After**: Data is persisted in SQLite database file
- **Location**: `data/app.db` (created automatically)

## Backup and Recovery

To backup your database:

```bash
cp data/app.db backup/app-$(date +%Y%m%d).db
```

To restore from backup:

```bash
cp backup/app-20240101.db data/app.db
```

## Development

### First Time Setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm start
```

### Reset Database

```bash
npm run db:reset
npm run db:seed
```

### View Database

You can use any SQLite client to view the database:

- **Command line**: `sqlite3 data/app.db`
- **GUI tools**: DB Browser for SQLite, SQLiteStudio, etc.

## Production Considerations

1. **Database Location**: Ensure the `data/` directory is writable
2. **Backups**: Implement regular database backups
3. **Performance**: SQLite is suitable for small to medium applications
4. **Concurrency**: SQLite handles concurrent reads well, but writes are serialized
5. **File Permissions**: Ensure proper file permissions for the database file
