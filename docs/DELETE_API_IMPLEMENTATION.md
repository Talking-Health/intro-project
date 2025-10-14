# Delete API Implementation

## Overview
This document describes the implementation of the DELETE API endpoint for removing people from the SQLite database and updating the DOM table.

## Implementation Date
October 14, 2025

## Features Implemented

### 1. Backend API (lib/people.js)
Added a `remove()` function that:
- Accepts a person ID to delete
- Validates that the ID is provided
- Deletes the person from the SQLite database
- Returns success status and deletion count
- Throws errors for invalid IDs or missing persons

**Function Signature:**
```javascript
async function remove( parsedurl, method, data )
```

**Parameters:**
- `parsedurl` - URL object (not used in current implementation)
- `method` - HTTP method (should be "DELETE")
- `data` - Object containing `{ id: number }`

**Returns:**
```javascript
{
  success: true,
  id: number,
  deleted: number  // Number of rows deleted (should be 1)
}
```

**Error Handling:**
- Throws `Error('Person id is required for deletion')` if ID is missing
- Throws `Error('Person with id {id} not found')` if person doesn't exist

### 2. API Router (lib/api.js)
Updated the API routes to include DELETE method:
```javascript
const calls = {
  "/api/people": { 
    "GET": people.get, 
    "PUT": people.add, 
    "DELETE": people.remove 
  }
}
```

### 3. Frontend API Client (public/js/api.js)
Added `deletedata()` function that:
- Sends DELETE requests to the API
- Includes proper headers and JSON body
- Returns the parsed JSON response
- Handles errors with try/catch
- Logs errors to console

**Function Signature:**
```javascript
export async function deletedata( api, data )
```

**Usage Example:**
```javascript
await deletedata('people', { id: 5 });
```

### 4. Frontend People Module (public/js/people.js)
Updated `deleteperson()` function to:
- Get the person object from the table row
- Show a confirmation dialog before deletion
- Call the DELETE API endpoint
- Refresh the table after successful deletion
- Display error alerts if deletion fails

**User Experience:**
1. User clicks "Delete" button
2. Confirmation dialog appears: "Are you sure you want to delete {name}?"
3. If confirmed, API call is made
4. Table refreshes to show updated data
5. If error occurs, alert is shown

### 5. Test Coverage
Added comprehensive tests for all layers:

#### Backend Tests (test/people.test.js)
- ✅ Delete a person by ID
- ✅ Throw error for non-existent person
- ✅ Throw error when ID is not provided

#### API Tests (test/api.test.js)
- ✅ Handle DELETE request to /api/people
- ✅ Call people.remove with correct parameters
- ✅ Return proper JSON response

#### Frontend API Tests (test/frontend-api.test.js)
- ✅ Send DELETE request with correct data
- ✅ Handle delete errors (404, 500, etc.)
- ✅ Handle network errors
- ✅ Parse JSON response correctly

## Test Results
```
Test Suites: 6 passed, 6 total
Tests:       75 passed, 75 total (8 new tests added)
Code Coverage: 93.81% statements, 91.25% branches
```

## Files Modified

### Backend
1. **lib/people.js** - Added `remove()` function
2. **lib/api.js** - Added DELETE route

### Frontend
3. **public/js/api.js** - Added `deletedata()` function
4. **public/js/people.js** - Implemented `deleteperson()` handler

### Tests
5. **test/people.test.js** - Added 3 delete tests
6. **test/api.test.js** - Added 1 API route test
7. **test/frontend-api.test.js** - Added 4 frontend API tests
8. **test/helpers/api-wrapper.js** - Added `deletedata()` wrapper

## API Endpoint

### DELETE /api/people

**Request:**
```http
DELETE /api/people HTTP/1.1
Content-Type: application/json

{
  "id": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "id": 5,
  "deleted": 1
}
```

**Error Response (404):**
```json
{
  "error": "Person with id 5 not found"
}
```

## Database Changes
The delete operation executes the following SQL:
```sql
DELETE FROM people WHERE id = ?
```

This permanently removes the person record from the SQLite database.

## Security Considerations
1. **SQL Injection Protection**: Uses prepared statements with parameter binding
2. **Validation**: Checks that ID is provided before attempting deletion
3. **Confirmation**: User must confirm deletion before API call is made
4. **Error Handling**: Proper error messages without exposing sensitive data

## Usage

### From Frontend
```javascript
// Delete a person by ID
await deletedata('people', { id: 5 });
```

### From Backend
```javascript
const result = await people.remove(null, 'DELETE', { id: 5 });
// Returns: { success: true, id: 5, deleted: 1 }
```

## Future Enhancements
Potential improvements for future iterations:

1. **Soft Delete**: Add a `deleted_at` timestamp instead of hard delete
2. **Cascade Delete**: Delete related records (schedules, workflows, etc.)
3. **Undo Functionality**: Allow users to restore recently deleted people
4. **Bulk Delete**: Support deleting multiple people at once
5. **Audit Trail**: Log who deleted what and when
6. **Permissions**: Add role-based access control for delete operations

## Related Documentation
- [SQLite Implementation](./SQLITE_IMPLEMENTATION.md)
- [Testing Setup](../TESTING_SETUP.md)
- [API Documentation](../readme.md)

