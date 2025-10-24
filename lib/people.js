/**
 * @typedef { object } person
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
 * @param { URL } _parsedUrl
 * @returns { Promise< Array< person > > }
 */
async function get( _parsedUrl ) {
  void _parsedUrl
  return people
}

/**
 * Demo function adding a person
 * @param { string } _parsedUrl
 * @param { string } method
 * @param { person } person
 * @return { Promise < person > }
 */
async function add( _parsedUrl, method, person ) {
  void _parsedUrl

  if( undefined !== person.id ) {
    const wasUpdated = people.some( ( element ) => {
      if( element.id === person.id ) {
        element.name = person.name
        element.email = person.email
        element.notes = person.notes
        return true
      }

      return false
    } )

    if( wasUpdated ) {
      return person
    }
  }

  if( "PUT" !== method ) {
    throw new Error( "Unsupported method" )
  }

  const nextId = people.reduce( ( maxId, obj ) => {
    return Math.max( maxId, obj.id )
  }, -Infinity ) + 1

  person.id = nextId
  people.push( person )

  return person
}

module.exports = {
  get,
  add,
}
