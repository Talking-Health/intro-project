/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 * @property { Array< string > } [ schedule ] - Weekly schedule array (7 days, optional).
 */

/**
 * @type { Array< person > }
 */
const people = [
  {
    id: 1,
    name: "Kermit Frog",
    email: "kermit@muppets.com",
    notes: "Great singer and banjo player",
    schedule: ["Available", "Available", "Busy", "Available", "Available", "Off", "Off"]
  },
  {
    id: 2,
    name: "Miss Piggy",
    email: "piggy@muppets.com",
    notes: "Fabulous and fierce",
    schedule: ["Busy", "Available", "Available", "Busy", "Available", "Available", "Off"]
  },
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
async function add( parsedurl, method, person ) {
  if( undefined !== person.id ) {
    people.some( element => {
      if( element.id === person.id ) {
        element.name = person.name
        element.email = person.email
        element.notes = person.notes
        if( person.schedule ) {
          element.schedule = person.schedule
        }
        return true
      }
      return false
    } )
    return person
  }

  person.id =
    people.reduce( ( maxid, obj ) => {
      return Math.max( maxid, obj.id )
    }, -Infinity ) + 1

  people.push( person )

  return person
}

/**
 * Update a person's schedule
 * @param { number } personId
 * @param { Array< string > } schedule
 * @return { Promise < object > }
 */
async function updateSchedule( personId, schedule ) {
  const person = people.find( p => p.id === personId )
  if( person ) {
    person.schedule = schedule
    return person
  }
  throw new Error( "Person not found" )
}

module.exports = {
  get,
  add,
  updateSchedule,
}
