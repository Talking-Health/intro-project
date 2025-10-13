# Test Suite

This directory contains the Jest test suite for the intro-project application.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run tests with verbose output
npm test -- --verbose

# Run a specific test file
npm test -- test/people.test.js

# Run tests and update snapshots
npm test -- -u
```

## Test Coverage

Jest is configured to collect code coverage automatically. After running tests, you can view the coverage report:

- **Terminal output**: Coverage summary is displayed after test execution
- **HTML report**: Open `coverage/lcov-report/index.html` in a browser for detailed coverage

Current coverage:
- **api.js**: 100% coverage
- **people.js**: 98.43% coverage

## Test Files

### `people.test.js`
Tests for the `lib/people.js` module:
- **get()**: Tests retrieving the people array
- **add()**: Tests adding new people and updating existing ones
  - Auto-generated IDs for new people
  - Sequential ID generation
  - Updating existing people by ID
  - Handling edge cases (empty strings)

### `api.test.js`
Tests for the `lib/api.js` module:
- **handleapi()**: Tests API request routing and handling
  - GET requests to `/api/people`
  - PUT requests to `/api/people`
  - 404 responses for invalid paths
  - 404 responses for unsupported HTTP methods
  - Uses mocking to isolate API logic from people module

## Testing Approach

### Unit Testing
- Each module is tested in isolation
- Mock dependencies where appropriate (e.g., `api.test.js` mocks `people.js`)
- Test both success and error cases

### Mocking
The test suite uses Jest's built-in mocking capabilities:
- `jest.mock()` to mock entire modules
- `jest.fn()` to create mock functions
- `jest.spyOn()` to spy on console methods

### Assertions
Common Jest matchers used:
- `toBe()` - strict equality
- `toEqual()` - deep equality
- `toHaveProperty()` - object property checks
- `toContain()` - array/string contains
- `toBeGreaterThan()` - numeric comparisons
- `toHaveBeenCalled()` - mock function calls
- `toHaveBeenCalledWith()` - mock function arguments

## Adding New Tests

When adding new functionality:

1. Create a test file in the `test/` directory with `.test.js` extension
2. Import the module you want to test
3. Use `describe()` blocks to group related tests
4. Use `test()` or `it()` for individual test cases
5. Use `beforeEach()` / `afterEach()` for setup/teardown
6. Run tests to ensure they pass

Example:
```javascript
const myModule = require('../lib/myModule');

describe('My Module', () => {
  test('should do something', () => {
    const result = myModule.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

## Configuration

Jest configuration is in `jest.config.js` at the project root:
- **Test environment**: Node.js
- **Coverage provider**: v8
- **Coverage directory**: `coverage/`
- **Clear mocks**: Automatically before each test
- **Collect coverage**: Enabled by default

## Future Improvements

Potential areas for expansion:
- Add tests for frontend JavaScript files in `public/js/`
- Add integration tests for the full HTTP server
- Add tests for edge cases and error handling
- Increase coverage to 100%
- Add performance/benchmark tests

