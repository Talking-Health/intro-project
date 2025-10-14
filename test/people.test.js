/**
 * Tests for lib/people.js
 */

const people = require('../lib/people');
const { initTestDatabase, resetTestDatabase, closeTestDatabase } = require('./helpers/test-database');

describe('People Module', () => {
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

    test('should return an array of people', async () => {
      const result = await people.get();
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return people with correct properties', async () => {
      // This test works regardless of what data is in the database
      // It just verifies the structure is correct
      const result = await people.get();
      expect(result.length).toBeGreaterThan(0);

      result.forEach(person => {
        expect(person).toHaveProperty('id');
        expect(person).toHaveProperty('name');
        expect(person).toHaveProperty('email');
        expect(person).toHaveProperty('notes');
      });
    });
  });

  describe('add()', () => {
    test('should add a new person with auto-generated id', async () => {
      const newPerson = {
        name: 'Fozzie Bear',
        email: 'fozzie@muppets.com',
        notes: 'Comedian'
      };

      const result = await people.add(null, 'PUT', newPerson);
      
      expect(result).toHaveProperty('id');
      expect(result.id).toBeGreaterThan(0);
      expect(result.name).toBe('Fozzie Bear');
      expect(result.email).toBe('fozzie@muppets.com');
      expect(result.notes).toBe('Comedian');
    });

    test('should generate sequential ids for new people', async () => {
      const person1 = await people.add(null, 'PUT', {
        name: 'Gonzo',
        email: 'gonzo@muppets.com',
        notes: 'Daredevil'
      });

      const person2 = await people.add(null, 'PUT', {
        name: 'Animal',
        email: 'animal@muppets.com',
        notes: 'Drummer'
      });

      expect(person2.id).toBeGreaterThan(person1.id);
    });

    test('should update existing person when id is provided', async () => {
      // First, get the current people to find an existing id
      const currentPeople = await people.get();
      const existingPerson = currentPeople[0];

      const updatedPerson = {
        id: existingPerson.id,
        name: 'Updated Name',
        email: 'updated@email.com',
        notes: 'Updated notes'
      };

      const result = await people.add(null, 'PUT', updatedPerson);
      
      expect(result.id).toBe(existingPerson.id);
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@email.com');
      expect(result.notes).toBe('Updated notes');

      // Verify the person was actually updated in the array
      const peopleAfterUpdate = await people.get();
      const updated = peopleAfterUpdate.find(p => p.id === existingPerson.id);
      expect(updated.name).toBe('Updated Name');
    });

    test('should handle person with empty strings', async () => {
      const newPerson = {
        name: '',
        email: '',
        notes: ''
      };

      const result = await people.add(null, 'PUT', newPerson);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('');
      expect(result.email).toBe('');
      expect(result.notes).toBe('');
    });
  });

  describe('remove()', () => {
    test('should delete a person by id', async () => {
      // First, add a person to delete
      const newPerson = await people.add(null, 'PUT', {
        name: 'Temporary Person',
        email: 'temp@test.com',
        notes: 'Will be deleted'
      });

      // Delete the person
      const result = await people.remove(null, 'DELETE', { id: newPerson.id });

      expect(result.success).toBe(true);
      expect(result.id).toBe(newPerson.id);
      expect(result.deleted).toBe(1);

      // Verify the person is no longer in the database
      const allPeople = await people.get();
      const deletedPerson = allPeople.find(p => p.id === newPerson.id);
      expect(deletedPerson).toBeUndefined();
    });

    test('should throw error when deleting non-existent person', async () => {
      await expect(
        people.remove(null, 'DELETE', { id: 99999 })
      ).rejects.toThrow('Person with id 99999 not found');
    });

    test('should throw error when id is not provided', async () => {
      await expect(
        people.remove(null, 'DELETE', {})
      ).rejects.toThrow('Person id is required for deletion');
    });
  });
});

