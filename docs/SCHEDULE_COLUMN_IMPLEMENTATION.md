# Schedule Column Implementation

## Overview
This document describes the implementation of the `schedule` column in the people database table to support datetime scheduling functionality.

## Implementation Date
October 14, 2025

## Features Implemented

### 1. Database Schema Update (lib/database.js)

Added `schedule` column to the people table:
```sql
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  schedule DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Migration Support:**
- Added automatic migration for existing databases
- Uses `ALTER TABLE` to add the column if it doesn't exist
- Gracefully handles "duplicate column name" errors
- Ensures backward compatibility with existing data

**Migration Code:**
```javascript
try {
  db.exec(`ALTER TABLE people ADD COLUMN schedule DATETIME`);
  console.log('Added schedule column to people table');
} catch (error) {
  // Column already exists, ignore error
  if (!error.message.includes('duplicate column name')) {
    throw error;
  }
}
```

### 2. Backend API Updates (lib/people.js)

**Updated TypeScript Definition:**
```javascript
/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name
 * @property { string } email
 * @property { string } [ notes ]
 * @property { string } [ schedule ] - Scheduled date/time (NEW)
 * @property { string } [ created_at ]
 * @property { string } [ updated_at ]
 */
```

**Updated GET Query:**
```javascript
SELECT id, name, email, notes, schedule, created_at, updated_at 
FROM people 
ORDER BY id
```

**Updated INSERT Query:**
```javascript
INSERT INTO people (name, email, notes, schedule)
VALUES (@name, @email, @notes, @schedule)
```

**Updated UPDATE Query:**
```javascript
UPDATE people
SET name = @name,
    email = @email,
    notes = @notes,
    schedule = @schedule,
    updated_at = CURRENT_TIMESTAMP
WHERE id = @id
```

**Default Value Handling:**
- Schedule defaults to `null` if not provided
- Allows empty/null values for optional scheduling

### 3. Test Database Updates (test/helpers/test-database.js)

Updated test database schema to match production:
- Added `schedule DATETIME` column to test table
- Updated seed data to include `schedule: null`
- Updated INSERT statements to include schedule parameter

**Test Data:**
```javascript
insertMany([
  { name: 'Kermit Frog', email: '', notes: '', schedule: null },
  { name: 'Miss Piggy', email: '', notes: '', schedule: null }
]);
```

## Frontend Integration

### HTML Input Element
The frontend already has the datetime input element:
```html
<input type="datetime-local" id="personform-schedule">
```

This input will:
- Allow users to select a date and time
- Format the value as ISO 8601 datetime string
- Send the value to the backend via the API

### Expected Data Format
The `datetime-local` input produces values in this format:
```
2025-10-14T15:30
```

SQLite will store this as a DATETIME type and can:
- Parse ISO 8601 datetime strings
- Perform date/time comparisons
- Use datetime functions for queries

## Database Column Details

**Column Name:** `schedule`  
**Data Type:** `DATETIME`  
**Nullable:** Yes (NULL allowed)  
**Default Value:** NULL  
**Index:** None (can be added later if needed for performance)

## Test Results
```
Test Suites: 6 passed, 6 total
Tests:       75 passed, 75 total
Code Coverage: 93.22% statements, 90.24% branches
```

All existing tests pass without modification, confirming backward compatibility.

## Files Modified

### Backend
1. **lib/database.js** - Added schedule column to schema + migration
2. **lib/people.js** - Updated all SQL queries to include schedule

### Tests
3. **test/helpers/test-database.js** - Updated test schema and seed data

## Migration Process

### For New Databases
- The `schedule` column is created automatically when the table is first created
- No migration needed

### For Existing Databases
1. Server detects existing database on startup
2. Runs `ALTER TABLE people ADD COLUMN schedule DATETIME`
3. Existing rows get `NULL` for the schedule column
4. New/updated rows can include schedule values
5. No data loss or downtime

### Migration Log Output
```
Added schedule column to people table
Database tables created successfully
```

## API Examples

### Create Person with Schedule
```javascript
// Request
PUT /api/people
{
  "name": "John Doe",
  "email": "john@example.com",
  "notes": "Important meeting",
  "schedule": "2025-10-15T14:30"
}

// Response
{
  "id": 5,
  "name": "John Doe",
  "email": "john@example.com",
  "notes": "Important meeting",
  "schedule": "2025-10-15T14:30",
  "created_at": "2025-10-14 10:30:00",
  "updated_at": "2025-10-14 10:30:00"
}
```

### Update Person's Schedule
```javascript
// Request
PUT /api/people
{
  "id": 5,
  "name": "John Doe",
  "email": "john@example.com",
  "notes": "Important meeting",
  "schedule": "2025-10-16T09:00"
}

// Response - schedule updated
{
  "id": 5,
  "name": "John Doe",
  "email": "john@example.com",
  "notes": "Important meeting",
  "schedule": "2025-10-16T09:00",
  "created_at": "2025-10-14 10:30:00",
  "updated_at": "2025-10-14 11:45:00"
}
```

### Get All People (includes schedule)
```javascript
// Request
GET /api/people

// Response
[
  {
    "id": 1,
    "name": "Kermit Frog",
    "email": "",
    "notes": "",
    "schedule": null,
    "created_at": "2025-10-14 10:00:00",
    "updated_at": "2025-10-14 10:00:00"
  },
  {
    "id": 2,
    "name": "Miss Piggy",
    "email": "",
    "notes": "",
    "schedule": "2025-10-15T14:30",
    "created_at": "2025-10-14 10:00:00",
    "updated_at": "2025-10-14 10:30:00"
  }
]
```

## Future Enhancements

### Potential Features
1. **Timezone Support**: Store timezone information with schedules
2. **Recurring Schedules**: Add support for recurring events
3. **Schedule Reminders**: Notification system for upcoming schedules
4. **Schedule Conflicts**: Detect and warn about scheduling conflicts
5. **Calendar View**: Display schedules in a calendar interface
6. **Schedule Filtering**: Query people by schedule date ranges
7. **Schedule Sorting**: Sort people by upcoming schedules

### Performance Optimization
If schedule queries become frequent, consider:
```sql
CREATE INDEX idx_people_schedule ON people(schedule);
```

### Validation
Consider adding validation for:
- Schedule must be in the future
- Schedule format validation
- Business hours constraints
- Maximum schedule date range

## Related Documentation
- [SQLite Implementation](./SQLITE_IMPLEMENTATION.md)
- [Delete API Implementation](./DELETE_API_IMPLEMENTATION.md)
- [Testing Setup](../TESTING_SETUP.md)

