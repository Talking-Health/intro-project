/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

/**
 * @type { Array< person > }
 */
const people = [
  { id: 1, name: "Kermit Frog", email: "", notes: "" },
  { id: 2, name: "Miss Piggy", email: "", notes: "" },
]

/**
 * Demo function to return an array of people objects
 * @returns { Promise< Array< person > > }
 */
async function get() {
  return people
}

/**
 * Demo function adding a person
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add(parsedurl, method, person) {
  if (undefined !== person.id) {
    people.some((element) => {
      if (element.id === person.id) {
        element.name = person.name
        element.email = person.email
        element.notes = person.notes
        return true
      }
      return false
    })
    return person
  }

  person.id =
    people.reduce((maxid, obj) => {
      return Math.max(maxid, obj.id)
    }, -Infinity) + 1

  people.push(person)

  return person
}

module.exports = {
  get,
  add,
}
