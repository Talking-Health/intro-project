/**
 * Tests for lib/api.js
 */

// Mock the people module BEFORE requiring api
jest.mock('../lib/people', () => ({
  get: jest.fn(),
  add: jest.fn()
}));

const api = require('../lib/api');
const people = require('../lib/people');

describe('API Module', () => {
  describe('handleapi()', () => {
    let mockRes;
    let mockReq;

    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();

      // Create mock response object
      mockRes = {
        writeHead: jest.fn(),
        end: jest.fn()
      };

      // Create mock request object
      mockReq = {
        method: 'GET'
      };
    });

    test('should handle GET request to /api/people', async () => {
      const mockPeople = [
        { id: 1, name: 'Test Person', email: 'test@test.com', notes: '' }
      ];
      
      people.get.mockResolvedValue(mockPeople);

      const parsedUrl = new URL('http://localhost:3000/api/people');
      
      await api.handleapi(parsedUrl, mockRes, mockReq, null);

      expect(people.get).toHaveBeenCalled();
      expect(mockRes.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify(mockPeople));
    });

    test('should handle PUT request to /api/people', async () => {
      const newPerson = {
        name: 'New Person',
        email: 'new@test.com',
        notes: 'Test notes'
      };

      const addedPerson = { id: 3, ...newPerson };
      people.add.mockResolvedValue(addedPerson);

      mockReq.method = 'PUT';
      const parsedUrl = new URL('http://localhost:3000/api/people');
      
      await api.handleapi(parsedUrl, mockRes, mockReq, newPerson);

      expect(people.add).toHaveBeenCalledWith(parsedUrl, 'PUT', newPerson);
      expect(mockRes.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify(addedPerson));
    });

    test('should return 404 for invalid pathname', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const parsedUrl = new URL('http://localhost:3000/api/invalid');
      
      await api.handleapi(parsedUrl, mockRes, mockReq, null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('404 file not found: ', '/api/invalid');
      expect(mockRes.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
      expect(mockRes.end).toHaveBeenCalledWith('404 - Not found');
      
      consoleErrorSpy.mockRestore();
    });

    test('should return 404 for invalid HTTP method', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockReq.method = 'POST'; // POST is not supported for /api/people
      const parsedUrl = new URL('http://localhost:3000/api/people');
      
      await api.handleapi(parsedUrl, mockRes, mockReq, null);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockRes.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
      expect(mockRes.end).toHaveBeenCalledWith('404 - Not found');
      
      consoleErrorSpy.mockRestore();
    });

    test('should not call people methods for invalid requests', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const parsedUrl = new URL('http://localhost:3000/api/invalid');
      
      await api.handleapi(parsedUrl, mockRes, mockReq, null);

      expect(people.get).not.toHaveBeenCalled();
      expect(people.add).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});

