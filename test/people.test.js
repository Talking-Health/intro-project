// test/people.test.js
const assert = require("assert")
const peopleModule = require("../lib/people.js")

describe("People Module", function() {

    it("should return initial people", async function() {
    const people = await peopleModule.get()
    assert.ok(Array.isArray(people))
    assert.ok(people.length > 0)

  })

  it("should add a new person", async function() {
    const newPerson = { name: "Test User", email: "test@example.com", notes: "testing" }
    const addedPerson = await peopleModule.add(null, "PUT", newPerson)

    assert.ok(addedPerson.id)
    assert.strictEqual(addedPerson.name, "Test User")

    const people = await peopleModule.get()
    const found = people.find(p => p.id === addedPerson.id)
    assert.ok(found)
    assert.strictEqual(found.name, "Test User")
  })

  it("should update an existing person", async function() {
    const people = await peopleModule.get()
    const person = people[0]
    const updatedName = "Updated Name"

    const updatedPerson = await peopleModule.add(null, "PUT", {
      id: person.id,
      name: updatedName,
      email: person.email,
      notes: person.notes
    })

    assert.strictEqual(updatedPerson.name, updatedName)

    const refreshedPeople = await peopleModule.get()
    const found = refreshedPeople.find(p => p.id === person.id)
    assert.strictEqual(found.name, updatedName)
  })

})
