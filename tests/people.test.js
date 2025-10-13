const { expect } = require('chai');
const { get, add } = require('../lib/people');

describe('People Module', () => {

  it('should return an array of people', async () => {
    const result = await get();
    expect(result).to.be.an('array');
    expect(result.length).to.be.greaterThan(0);
    expect(result[0]).to.have.property('id');
    expect(result[0]).to.have.property('name');
  });

  it('should add a new person if no id is provided', async () => {
    const newPerson = { name: 'Test User', email: 'test@example.com', notes: 'Test notes' };
    const added = await add(null, 'PUT', newPerson);

    expect(added).to.have.property('id');
    expect(added.name).to.equal(newPerson.name);

    // Check if the person array includes this new person
    const peopleList = await get();
    const exists = peopleList.some(p => p.id === added.id);
    expect(exists).to.be.true;
  });

  it('should update an existing person if id is provided', async () => {
    const peopleList = await get();
    const personToUpdate = peopleList[0];

    const updatedName = 'Updated Name';
    const updatedPerson = { ...personToUpdate, name: updatedName };
    const result = await add(null, 'PUT', updatedPerson);

    expect(result.id).to.equal(personToUpdate.id);
    expect(result.name).to.equal(updatedName);

    const updatedList = await get();
    expect(updatedList[0].name).to.equal(updatedName);
  });

});
