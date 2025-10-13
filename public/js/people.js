import { getdata, putdata, deletedata } from "./api.js"
import {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows,
} from "./form.js"
import { findancestorbytype } from "./dom.js"
import { showConfirmDialog } from "./modal-utils.js"

// Variable to store the person currently being edited
let currentEditingPerson = null

document.addEventListener( "DOMContentLoaded", async function () {
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
 * @param { Array< string > } [ schedule ] - Optional schedule array
 * @returns { Promise< object > }
 */
async function addperson( name, email, notes, schedule ) {
  const personData = { name, email, notes }
  if( schedule ) {
    personData.schedule = schedule
  }
  await putdata( "people", personData )
}

/**
 *
 * @param { string } id
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @param { Array< string > } [ schedule ] - Optional schedule array
 */
// eslint-disable-next-line no-unused-vars
async function updateperson( id, name, email, notes, schedule ) {
  const personData = { id, name, email, notes }
  if( schedule ) {
    personData.schedule = schedule
  }
  await putdata( "people", personData )
}

/**
 * @returns { Promise }
 */
async function gopeople() {
  const p = await fetchpeople()
  cleartablerows( "peopletable" )

  for( const pi in p ) {
    addpersondom( p[pi] )
  }
}

/**
 *
 */
function addpersoninput() {
  clearform( "personform" )

  // Set default schedule values for new person
  for( let i = 0; 7 > i; i++ ) {
    setformfieldvalue( `personform-schedule-${i}`, "Available" )
  }

  showform( "personform", async () => {
    // Collect schedule data from form
    const schedule = []
    for( let i = 0; 7 > i; i++ ) {
      schedule.push( getformfieldvalue( `personform-schedule-${i}` ) )
    }

    await addperson(
      getformfieldvalue( "personform-name" ),
      getformfieldvalue( "personform-email" ),
      getformfieldvalue( "personform-notes" ),
      schedule
    )
    await gopeople()
  } )
}

/**
 *
 */
function editperson( ev ) {
  clearform( "personform" )
  const personrow = findancestorbytype( ev.target, "tr" )

  // Store the person being edited
  currentEditingPerson = personrow.person

  // Populate all form fields with current person data
  setformfieldvalue( "personform-name", currentEditingPerson.name )
  setformfieldvalue( "personform-email", currentEditingPerson.email )
  setformfieldvalue( "personform-notes", currentEditingPerson.notes )

  // Populate schedule fields
  for( let i = 0; 7 > i; i++ ) {
    const scheduleValue = currentEditingPerson.schedule && currentEditingPerson.schedule[i] ? currentEditingPerson.schedule[i] : "Available"
    setformfieldvalue( `personform-schedule-${i}`, scheduleValue )
  }

  showform( "personform", async () => {
    // Store the person ID to avoid race condition
    const personToUpdate = currentEditingPerson

    // Collect schedule data from form
    const schedule = []
    for( let i = 0; 7 > i; i++ ) {
      schedule.push( getformfieldvalue( `personform-schedule-${i}` ) )
    }

    // Update the person with new data from form including schedule
    await updateperson(
      personToUpdate.id,
      getformfieldvalue( "personform-name" ),
      getformfieldvalue( "personform-email" ),
      getformfieldvalue( "personform-notes" ),
      schedule
    )
    // Refresh the people table to show updated data
    await gopeople()
    // Clear the editing state
    // eslint-disable-next-line require-atomic-updates
    currentEditingPerson = null
  } )
}

/**
 * Delete person functionality
 */
async function deleteperson( ev ) {
  const personrow = findancestorbytype( ev.target, "tr" )
  const person = personrow.person

  const confirmed = await showConfirmDialog( `Are you sure you want to delete ${person.name}? This action cannot be undone.` )
  if( !confirmed ) {
    return
  }

  try {
    await deletedata( "people", person.id )
    await gopeople()
  } catch ( error ) {
    alert( `Failed to delete person: ${error.message}` )
  }
}

/**
 * Handle clicks on action cell text
 */
function handleActionClick( ev ) {
  ev.stopPropagation()

  if( ev.target.classList.contains( "edit-text" ) ) {
    editperson( ev )
  } else if( ev.target.classList.contains( "delete-text" ) ) {
    deleteperson( ev )
  }
}

/**
 *
 * @param { object } person
 */
export function addpersondom( person ) {
  const table = gettablebody( "peopletable" )
  const newrow = table.insertRow()

  const cells = []
  // Create cells: Name, Email, Notes, Schedule, Action = 5 total
  for( let i = 0; 5 > i; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // @ts-ignore
  newrow.person = person

  // Populate person data with data-label attributes for mobile
  cells[0].setAttribute( "data-label", "Name" )
  cells[0].innerText = person.name
  cells[1].setAttribute( "data-label", "Email" )
  cells[1].innerText = person.email || ""
  cells[2].setAttribute( "data-label", "Notes" )
  cells[2].innerText = person.notes || ""

  // Schedule column - create "See schedule" button
  cells[3].setAttribute( "data-label", "Schedule" )
  const scheduleButton = document.createElement( "button" )
  scheduleButton.textContent = "See schedule"
  scheduleButton.classList.add( "schedule-view-btn" )
  scheduleButton.addEventListener( "click", () => showScheduleModal( person ) )
  cells[3].appendChild( scheduleButton )

  // Action column - Simple text with click handler on the cell
  cells[4].setAttribute( "data-label", "Action" )
  cells[4].innerHTML = '<span class="edit-text">Edit</span> / <span class="delete-text">Delete</span>'
  cells[4].classList.add( "action-cell" )
  cells[4].addEventListener( "click", handleActionClick )
}

/**
 * Show schedule modal with person's weekly schedule
 * @param { object } person
 */
function showScheduleModal( person ) {
  // Update modal title
  document.getElementById( "scheduleModalTitle" ).textContent = `Schedule for ${person.name}`

  // Update schedule display
  for( let i = 0; 7 > i; i++ ) {
    const scheduleStatus = person.schedule && person.schedule[i] ? person.schedule[i] : "Available"
    const dayElement = document.getElementById( `schedule-day-${i}` )
    dayElement.textContent = scheduleStatus

    // Add CSS class for styling
    dayElement.className = `day-status status-${scheduleStatus.toLowerCase()}`
  }

  // Show the modal
  document.getElementById( "content" ).style.display = "none"
  document.getElementById( "scheduleModal" ).style.display = "block"
}

