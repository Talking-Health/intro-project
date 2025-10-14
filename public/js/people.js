

import { getdata, putdata, deletedata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"

document.addEventListener( "DOMContentLoaded", async function() {

  document.getElementById( "addperson" ).addEventListener( "click", addpersoninput )
  await gopeople()
} )


/**
 * 
 * @returns { Promise< object > }
 */
async function fetchpeople() {
  return await getdata( "people" )
}

/**
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @param { string } schedule
 * @returns { Promise< object > }
 */
async function addperson( name, email, notes, schedule ) {
  await putdata( "people", { name, email, notes, schedule } )
}

/**
 *
 * @param { string } id
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @param { string } schedule
 */
async function updateperson( id, name, email, notes, schedule ) {
  await putdata( "people", { id, name, email, notes, schedule } )
}



/**
 * @returns { Promise }
 */
async function gopeople() {
  const p = await fetchpeople()
  cleartablerows( "peopletable" )

  for( const pi in p ) {
    addpersondom( p[ pi ] )
  }
}

/**
 *
 */
function addpersoninput() {

  clearform( "personform" )
  showform( "personform", async () => {

    await addperson(
      getformfieldvalue( "personform-name" ),
      getformfieldvalue( "personform-email" ),
      getformfieldvalue( "personform-notes" ),
      getformfieldvalue( "personform-schedule" )
    )
    await gopeople()
  } )
}

/**
 * Edit person handler
 * @param { Event } ev
 */
function editperson( ev ) {

  clearform( "personform" )
  const personrow = findancestorbytype( ev.target, "tr" )
  const person = personrow.person

  // Populate form with existing data
  setformfieldvalue( "personform-name", person.name )
  setformfieldvalue( "personform-email", person.email || "" )
  setformfieldvalue( "personform-notes", person.notes || "" )
  setformfieldvalue( "personform-schedule", person.schedule || "" )

  showform( "personform", async () => {
    await updateperson(
      person.id,
      getformfieldvalue( "personform-name" ),
      getformfieldvalue( "personform-email" ),
      getformfieldvalue( "personform-notes" ),
      getformfieldvalue( "personform-schedule" )
    )
    await gopeople()
  } )

}

/**
 * Delete person handler
 * @param { Event } ev
 */
async function deleteperson( ev ) {
  const personrow = findancestorbytype( ev.target, "tr" )
  const person = personrow.person

  // Confirm deletion
  if( !confirm( `Are you sure you want to delete ${person.name}?` ) ) {
    return
  }

  try {
    // Call the delete API
    await deletedata( "people", { id: person.id } )

    // Refresh the table to show updated data
    await gopeople()
  } catch (error) {
    console.error( "Failed to delete person:", error )
    alert( "Failed to delete person. Please try again." )
  }
}

/**
 * Add a person row to the DOM table
 * @param { object } person
 */
export function addpersondom( person ) {

  const table = gettablebody( "peopletable" )
  const newrow = table.insertRow()

  const cells = []
  // Create cells: Name, Email, Notes, Schedule, Action
  for( let i = 0; i < 5; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // Store person object on the row for later access
  // @ts-ignore
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

  // Create action buttons in the last cell
  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editperson )

  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", deleteperson )

  cells[ 4 ].appendChild( editbutton )
  cells[ 4 ].appendChild( deletebutton )
}
