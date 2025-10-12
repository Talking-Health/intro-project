# Testing Guide

This project uses Mocha for testing both backend and frontend functionality.

## Test Structure

```
test/
├── backend/           # Backend API and module tests
│   ├── api.test.js    # API endpoint tests
│   └── people.test.js # People module tests
├── frontend/          # Frontend JavaScript tests
│   ├── api.test.js    # API client tests
│   ├── dom.test.js    # DOM utility tests
│   ├── form.test.js   # Form handling tests
│   ├── people.test.js # People frontend tests
│   └── test.html      # Test HTML environment
├── setup.js           # Global test setup
└── .mocharc.js        # Mocha configuration
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Backend Tests Only

```bash
npm run test:backend
```

### Run Frontend Tests Only

```bash
npm run test:frontend
```

## Test Coverage

### Backend Tests

- **People Module**: Tests for data manipulation functions

  - `get()` - Retrieving people data
  - `add()` - Adding/updating people
  - Data validation and type checking
  - ID generation and uniqueness

- **API Module**: Tests for HTTP endpoints
  - GET `/api/people` - Retrieving people via HTTP
  - PUT `/api/people` - Adding/updating people via HTTP
  - Error handling for invalid endpoints
  - Response format validation

### Frontend Tests

- **DOM Utilities**: Tests for DOM manipulation functions

  - `findancestorbyclass()` - Finding parent elements by class
  - `findancestorbytype()` - Finding parent elements by tag
  - Edge cases and error handling

- **Form Handling**: Tests for form interaction functions

  - `showform()` - Form display and callback handling
  - `getformfieldvalue()` / `setformfieldvalue()` - Form field manipulation
  - `clearform()` - Form clearing functionality
  - `gettablebody()` / `cleartablerows()` - Table manipulation

- **API Client**: Tests for HTTP client functions

  - `getdata()` - GET request handling
  - `putdata()` - PUT request handling
  - Error handling and response processing
  - URL construction and headers

- **People Frontend**: Tests for people display functions
  - `addpersondom()` - Adding people to DOM
  - Table row creation and data attachment
  - Button creation and event handling

## Test Environment Setup

### Backend Tests

- Use Node.js environment directly
- Mock HTTP requests with supertest
- Test actual module functions

### Frontend Tests

- Use jsdom for DOM simulation
- Mock fetch API for HTTP requests
- Test browser-like environment in Node.js

## Writing New Tests

### Backend Test Example

```javascript
const { expect } = require('chai');
const people = require('../../lib/people');

describe('People Module', () => {
  it('should return an array of people', async () => {
    const result = await people.get();
    expect(result).to.be.an('array');
  });
});
```

### Frontend Test Example

```javascript
const { expect } = require('chai');
const { JSDOM } = require('jsdom');

// Set up DOM environment
const dom = new JSDOM('<html><body></body></html>');
global.document = dom.window.document;

// Import and test your module
const { myFunction } = require('../../public/js/my-module.js');

describe('My Module', () => {
  it('should work correctly', () => {
    const result = myFunction();
    expect(result).to.equal('expected value');
  });
});
```

## Test Dependencies

- **mocha**: Test framework
- **chai**: Assertion library
- **supertest**: HTTP testing for backend
- **jsdom**: DOM simulation for frontend tests
- **jsdom-global**: Global DOM setup
- **node-fetch**: Fetch polyfill for Node.js

## Continuous Integration

The test suite is designed to run in CI environments:

- No external dependencies required
- Tests run in Node.js environment
- Mocked external services
- Deterministic test results
