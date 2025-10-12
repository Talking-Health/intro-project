const { expect } = require('chai');
const people = require('../../lib/people');
const TestDatabase = require('../database-setup');

describe('People Module', () => {
  let testDb;

  before(async () => {
    testDb = new TestDatabase();
    await testDb.init();
    await testDb.seedTestData();
  });

  after(async () => {
    if (testDb) {
      await testDb.cleanup();
    }
  });

  beforeEach(async () => {
    await testDb.clearPeople();
    await testDb.seedTestData();
  });

  describe('get()', () => {
    it('should return an array of people', async () => {
      const result = await people.get();
      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(0);
    });

    it('should return people with required properties', async () => {
      const result = await people.get();
      expect(result[0]).to.have.property('id');
      expect(result[0]).to.have.property('name');
      expect(result[0]).to.have.property('email');
      expect(result[0]).to.have.property('notes');
    });

    it('should return people with correct data types', async () => {
      const result = await people.get();
      expect(result[0].id).to.be.a('number');
      expect(result[0].name).to.be.a('string');
      expect(result[0].email).to.be.a('string');
      expect(result[0].notes).to.be.a('string');
    });
  });

  describe('add()', () => {
    it('should add a new person without id', async () => {
      const newPerson = {
        name: 'Test Person',
        email: 'test@example.com',
        notes: 'Test notes',
      };

      const result = await people.add(null, 'PUT', newPerson);

      expect(result).to.have.property('id');
      expect(result.name).to.equal(newPerson.name);
      expect(result.email).to.equal(newPerson.email);
      expect(result.notes).to.equal(newPerson.notes);
    });

    it('should update an existing person with id', async () => {
      const existingPerson = {
        id: 1,
        name: 'Updated Name',
        email: 'updated@example.com',
        notes: 'Updated notes',
      };

      const result = await people.add(null, 'PUT', existingPerson);

      expect(result.id).to.equal(existingPerson.id);
      expect(result.name).to.equal(existingPerson.name);
      expect(result.email).to.equal(existingPerson.email);
      expect(result.notes).to.equal(existingPerson.notes);
    });

    it('should generate unique ids for new people', async () => {
      const person1 = {
        name: 'Person 1',
        email: 'person1@example.com',
        notes: '',
      };
      const person2 = {
        name: 'Person 2',
        email: 'person2@example.com',
        notes: '',
      };

      const result1 = await people.add(null, 'PUT', person1);
      const result2 = await people.add(null, 'PUT', person2);

      expect(result1.id).to.not.equal(result2.id);
    });
  });
});
