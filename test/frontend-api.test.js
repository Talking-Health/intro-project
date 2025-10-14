/**
 * Tests for public/js/api.js
 * @jest-environment jsdom
 */

// Mock fetch globally
global.fetch = jest.fn();

const { getdata, putdata, deletedata } = require('./helpers/api-wrapper.js');

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

describe('API Module', () => {
  describe('getdata()', () => {
    test('should fetch data successfully', async () => {
      const mockData = [
        { id: 1, name: 'Test Person', email: 'test@test.com' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await getdata('people');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/people');
      expect(result).toEqual(mockData);
    });

    test('should construct correct URL with rooturl', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await getdata('test-endpoint');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test-endpoint');
    });

    test('should handle fetch errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await getdata('people');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching data:',
        'Request failed with status: 404'
      );
      expect(result).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });

    test('should handle network errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getdata('people');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching data:',
        'Network error'
      );
      expect(result).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });

    test('should handle different response statuses', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await getdata('people');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching data:',
        'Request failed with status: 500'
      );

      consoleErrorSpy.mockRestore();
    });

    test('should parse JSON response correctly', async () => {
      const mockData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        notes: 'Test notes'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await getdata('people');

      expect(result).toEqual(mockData);
      expect(result.name).toBe('John Doe');
    });
  });

  describe('putdata()', () => {
    test('should send PUT request with correct data', async () => {
      const testData = {
        name: 'New Person',
        email: 'new@test.com',
        notes: 'Test notes'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true
      });

      await putdata('people', testData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/people',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testData)
        }
      );
    });

    test('should construct correct URL', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true
      });

      await putdata('test-endpoint', { data: 'test' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test-endpoint',
        expect.any(Object)
      );
    });

    test('should stringify data correctly', async () => {
      const testData = {
        id: 1,
        name: 'Updated Person',
        email: 'updated@test.com',
        notes: 'Updated notes'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true
      });

      await putdata('people', testData);

      const callArgs = global.fetch.mock.calls[0][1];
      expect(callArgs.body).toBe(JSON.stringify(testData));
    });

    test('should set correct headers', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true
      });

      await putdata('people', { name: 'Test' });

      const callArgs = global.fetch.mock.calls[0][1];
      expect(callArgs.headers['Content-Type']).toBe('application/json');
    });

    test('should handle empty data object', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true
      });

      await putdata('people', {});

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/people',
        expect.objectContaining({
          body: '{}'
        })
      );
    });

    test('should not throw error on failed request', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(putdata('people', { name: 'Test' })).rejects.toThrow('Network error');
    });
  });

  describe('deletedata()', () => {
    test('should send DELETE request with correct data', async () => {
      const deleteData = { id: 1 };
      const mockResponse = { success: true, id: 1, deleted: 1 };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await deletedata('people', deleteData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/people',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(deleteData)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle delete errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(deletedata('people', { id: 1 })).rejects.toThrow(
        'Delete request failed with status: 404'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting data:',
        'Delete request failed with status: 404'
      );

      consoleErrorSpy.mockRestore();
    });

    test('should handle network errors during delete', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(deletedata('people', { id: 1 })).rejects.toThrow('Network error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting data:',
        'Network error'
      );

      consoleErrorSpy.mockRestore();
    });

    test('should parse JSON response correctly', async () => {
      const mockResponse = { success: true, id: 5, deleted: 1 };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await deletedata('people', { id: 5 });

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.id).toBe(5);
    });
  });
});

