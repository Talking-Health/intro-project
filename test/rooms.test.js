/**
 * Tests for lib/rooms.js
 */

const rooms = require('../lib/rooms');
const { initTestDatabase, resetTestDatabase, closeTestDatabase } = require('./helpers/test-database');

describe('Rooms Module', () => {
  beforeAll(() => {
    // Initialize test database before all tests
    initTestDatabase();
  });

  beforeEach(() => {
    // Reset database before each test to ensure clean state
    resetTestDatabase();
  });

  afterAll(() => {
    // Close database after all tests
    closeTestDatabase();
  });

  describe('get()', () => {
    test('should return an array of rooms', async () => {
      const result = await rooms.get();
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return rooms with correct properties', async () => {
      // Add a test room first
      await rooms.add(null, 'PUT', {
        property_name: 'Test Property',
        address: '123 Test St',
        room_type: 'Studio',
        price: 800,
        available_from: '2025-11-01',
        status: 'Available',
        landlord_contact: 'test@landlord.com',
        notes: 'Test notes'
      });

      const result = await rooms.get();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(room => {
        expect(room).toHaveProperty('id');
        expect(room).toHaveProperty('property_name');
        expect(room).toHaveProperty('address');
        expect(room).toHaveProperty('room_type');
        expect(room).toHaveProperty('price');
        expect(room).toHaveProperty('available_from');
        expect(room).toHaveProperty('status');
        expect(room).toHaveProperty('landlord_contact');
        expect(room).toHaveProperty('notes');
        expect(room).toHaveProperty('created_at');
        expect(room).toHaveProperty('updated_at');
      });
    });

    test('should return rooms ordered by id', async () => {
      // Add multiple rooms
      const room1 = await rooms.add(null, 'PUT', {
        property_name: 'Room 1',
        address: 'Address 1',
        room_type: 'Studio',
        price: 800
      });

      const room2 = await rooms.add(null, 'PUT', {
        property_name: 'Room 2',
        address: 'Address 2',
        room_type: '1BR',
        price: 1000
      });

      const result = await rooms.get();
      
      // Find our test rooms
      const foundRoom1 = result.find(r => r.id === room1.id);
      const foundRoom2 = result.find(r => r.id === room2.id);
      
      expect(foundRoom1).toBeDefined();
      expect(foundRoom2).toBeDefined();
      expect(result.indexOf(foundRoom1)).toBeLessThan(result.indexOf(foundRoom2));
    });
  });

  describe('add()', () => {
    test('should add a new room with auto-generated id', async () => {
      const newRoom = {
        property_name: 'Sunny Studio',
        address: '123 Main St, London',
        room_type: 'Studio',
        price: 800,
        available_from: '2025-11-01',
        status: 'Available',
        landlord_contact: 'john@landlord.com',
        notes: 'Near tube, bills included'
      };

      const result = await rooms.add(null, 'PUT', newRoom);
      
      expect(result).toHaveProperty('id');
      expect(result.id).toBeGreaterThan(0);
      expect(result.property_name).toBe('Sunny Studio');
      expect(result.address).toBe('123 Main St, London');
      expect(result.room_type).toBe('Studio');
      expect(result.price).toBe(800);
      expect(result.available_from).toBe('2025-11-01');
      expect(result.status).toBe('Available');
      expect(result.landlord_contact).toBe('john@landlord.com');
      expect(result.notes).toBe('Near tube, bills included');
    });

    test('should generate sequential ids for new rooms', async () => {
      const room1 = await rooms.add(null, 'PUT', {
        property_name: 'Room 1',
        address: 'Address 1',
        room_type: 'Studio',
        price: 800
      });

      const room2 = await rooms.add(null, 'PUT', {
        property_name: 'Room 2',
        address: 'Address 2',
        room_type: '1BR',
        price: 1000
      });

      expect(room2.id).toBeGreaterThan(room1.id);
    });

    test('should update existing room when id is provided', async () => {
      // First, create a room
      const newRoom = await rooms.add(null, 'PUT', {
        property_name: 'Original Property',
        address: 'Original Address',
        room_type: 'Studio',
        price: 800,
        available_from: '2025-11-01',
        status: 'Available',
        landlord_contact: 'original@test.com',
        notes: 'Original notes'
      });

      // Update the room
      const updatedRoom = {
        id: newRoom.id,
        property_name: 'Updated Property',
        address: 'Updated Address',
        room_type: '2BR',
        price: 1500,
        available_from: '2025-12-01',
        status: 'Pending',
        landlord_contact: 'updated@test.com',
        notes: 'Updated notes'
      };

      const result = await rooms.add(null, 'PUT', updatedRoom);
      
      expect(result.id).toBe(newRoom.id);
      expect(result.property_name).toBe('Updated Property');
      expect(result.address).toBe('Updated Address');
      expect(result.room_type).toBe('2BR');
      expect(result.price).toBe(1500);
      expect(result.available_from).toBe('2025-12-01');
      expect(result.status).toBe('Pending');
      expect(result.landlord_contact).toBe('updated@test.com');
      expect(result.notes).toBe('Updated notes');

      // Verify the room was actually updated in the database
      const roomsAfterUpdate = await rooms.get();
      const updated = roomsAfterUpdate.find(r => r.id === newRoom.id);
      expect(updated.property_name).toBe('Updated Property');
    });

    test('should handle room with empty strings', async () => {
      const newRoom = {
        property_name: '',
        address: '',
        room_type: '',
        price: null,
        available_from: null,
        status: 'Available',
        landlord_contact: '',
        notes: ''
      };

      const result = await rooms.add(null, 'PUT', newRoom);

      expect(result).toHaveProperty('id');
      expect(result.property_name).toBe('');
      expect(result.address).toBe('');
      expect(result.room_type).toBe('');
      expect(result.landlord_contact).toBe('');
      expect(result.notes).toBe('');
    });

    test('should use default status "Available" when not provided', async () => {
      const newRoom = {
        property_name: 'Test Property',
        address: 'Test Address',
        room_type: 'Studio',
        price: 800
      };

      const result = await rooms.add(null, 'PUT', newRoom);

      expect(result.status).toBe('Available');
    });

    test('should handle decimal prices correctly', async () => {
      const newRoom = {
        property_name: 'Test Property',
        address: 'Test Address',
        room_type: 'Studio',
        price: 850.50
      };

      const result = await rooms.add(null, 'PUT', newRoom);

      expect(result.price).toBe(850.50);
    });
  });

  describe('remove()', () => {
    test('should delete a room by id', async () => {
      // First, add a room to delete
      const newRoom = await rooms.add(null, 'PUT', {
        property_name: 'Temporary Room',
        address: 'Temp Address',
        room_type: 'Studio',
        price: 800,
        status: 'Available',
        landlord_contact: 'temp@test.com',
        notes: 'Will be deleted'
      });

      // Delete the room
      const result = await rooms.remove(null, 'DELETE', { id: newRoom.id });

      expect(result.success).toBe(true);
      expect(result.id).toBe(newRoom.id);
      expect(result.deleted).toBe(1);

      // Verify the room is no longer in the database
      const allRooms = await rooms.get();
      const deletedRoom = allRooms.find(r => r.id === newRoom.id);
      expect(deletedRoom).toBeUndefined();
    });

    test('should throw error when deleting non-existent room', async () => {
      await expect(
        rooms.remove(null, 'DELETE', { id: 99999 })
      ).rejects.toThrow('Room with id 99999 not found');
    });

    test('should throw error when id is not provided', async () => {
      await expect(
        rooms.remove(null, 'DELETE', {})
      ).rejects.toThrow('Room id is required for deletion');
    });

    test('should delete multiple rooms independently', async () => {
      // Add two rooms
      const room1 = await rooms.add(null, 'PUT', {
        property_name: 'Room 1',
        address: 'Address 1',
        room_type: 'Studio',
        price: 800
      });

      const room2 = await rooms.add(null, 'PUT', {
        property_name: 'Room 2',
        address: 'Address 2',
        room_type: '1BR',
        price: 1000
      });

      // Delete first room
      await rooms.remove(null, 'DELETE', { id: room1.id });

      // Verify first room is deleted but second remains
      const allRooms = await rooms.get();
      const deletedRoom = allRooms.find(r => r.id === room1.id);
      const remainingRoom = allRooms.find(r => r.id === room2.id);

      expect(deletedRoom).toBeUndefined();
      expect(remainingRoom).toBeDefined();
      expect(remainingRoom.property_name).toBe('Room 2');
    });
  });
});

