/**
 * Wrapper to test people functions
 * Replicates the logic from public/js/people.js for testing
 */

/**
 * Add person to DOM table
 * @param { object } person
 */
function addpersondom( person ) {
  // Get table body
  const table = document.getElementById( "peopletable" ).getElementsByTagName( "tbody" )[ 0 ]
  const newrow = table.insertRow()

  const cells = []
  for( let i = 0; i < ( 2 + 7 ); i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // Attach person object to row
  newrow.person = person
  cells[ 0 ].innerText = person.name

  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  // editbutton.addEventListener( "click", editperson )

  cells[ 8 ].appendChild( editbutton )
}

module.exports = {
  addpersondom
};

