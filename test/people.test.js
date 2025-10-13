/**
 * Tests for lib/people.js
 */

const people = require('../lib/people');

describe('People Module', () => {
  describe('get()', () => {
    test('should return an array of people', async () => {
      const result = await people.get();
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return people with correct properties', async () => {
      const result = await people.get();
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(person => {
        expect(person).toHaveProperty('id');
        expect(person).toHaveProperty('name');
        expect(person).toHaveProperty('email');
        expect(person).toHaveProperty('notes');
      });
    });

    test('should include default people (Kermit Frog and Miss Piggy)', async () => {
      const result = await people.get();
      const names = result.map(p => p.name);
      
      expect(names).toContain('Kermit Frog');
      expect(names).toContain('Miss Piggy');
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
});

