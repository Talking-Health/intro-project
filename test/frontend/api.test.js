const { expect } = require('chai');
const { JSDOM } = require('jsdom');

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

global.window = dom.window;
global.document = dom.window.document;
global.fetch = require('node-fetch');

// Mock fetch for testing
const originalFetch = global.fetch;
global.fetch = (url, options) => {
  // Mock successful response
  if (url.includes('/api/people')) {
    const mockData = [
      {
        id: 1,
        name: 'Test Person',
        email: 'test@example.com',
        notes: 'Test notes',
      },
    ];

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });
  }

  // Mock error response
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Not found' }),
  });
};

// Import the API module after setting up the environment
const { getdata, putdata } = require('../../public/js/api.js');

describe('API Module', () => {
  after(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('getdata()', () => {
    it('should fetch data from API endpoint', async () => {
      const result = await getdata('people');

      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(0);
      expect(result[0]).to.have.property('id');
      expect(result[0]).to.have.property('name');
      expect(result[0]).to.have.property('email');
      expect(result[0]).to.have.property('notes');
    });

    it('should handle API errors gracefully', async () => {
      // Mock fetch to return error
      global.fetch = () =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' }),
        });

      const result = await getdata('invalid');
      expect(result).to.be.undefined;
    });

    it('should construct correct URL', async () => {
      let capturedUrl;
      global.fetch = (url) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        });
      };

      await getdata('people');
      expect(capturedUrl).to.include('/api/people');
    });
  });

  describe('putdata()', () => {
    it('should send PUT request with correct headers', async () => {
      let capturedOptions;
      global.fetch = (url, options) => {
        capturedOptions = options;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        });
      };

      const testData = { name: 'Test', email: 'test@example.com' };
      await putdata('people', testData);

      expect(capturedOptions.method).to.equal('PUT');
      expect(capturedOptions.headers['Content-Type']).to.equal(
        'application/json'
      );
      expect(JSON.parse(capturedOptions.body)).to.deep.equal(testData);
    });

    it('should handle PUT request errors', async () => {
      global.fetch = () =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Bad request' }),
        });

      // Should not throw error
      await putdata('people', { name: 'Test' });
    });
  });
});
