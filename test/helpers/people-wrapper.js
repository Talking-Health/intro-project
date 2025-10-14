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
  // Create cells: Name, Email, Notes, Schedule, Action
  for( let i = 0; i < 5; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // Attach person object to row
  newrow.person = person

  // Populate cells with data
  cells[ 0 ].innerText = person.name || ""
  cells[ 1 ].innerText = person.email || ""
  cells[ 2 ].innerText = person.notes || ""

  // Format schedule for display (if exists)
  if( person.schedule ) {
    // Convert datetime-local format to readable format
    const scheduleDate = new Date( person.schedule )
    if( !isNaN( scheduleDate.getTime() ) ) {
      cells[ 3 ].innerText = scheduleDate.toLocaleString()
    } else {
      cells[ 3 ].innerText = person.schedule
    }
  } else {
    cells[ 3 ].innerText = ""
  }

  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  // editbutton.addEventListener( "click", editperson )

  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  // deletebutton.addEventListener( "click", deleteperson )

  cells[ 4 ].appendChild( editbutton )
  cells[ 4 ].appendChild( deletebutton )
}

module.exports = {
  addpersondom
};

