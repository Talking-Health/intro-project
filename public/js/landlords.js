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

// Variable to store the landlord currently being edited
let currentEditingLandlord = null

document.addEventListener( "DOMContentLoaded", async function () {
  const addLandlordBtn = document.getElementById( "addlandlord" )
  if( addLandlordBtn ) {
    addLandlordBtn.addEventListener( "click", addlandlordinput )
  }
  await golandlords()
} )

// Listen for cross-module refresh events
window.addEventListener( "refreshLandlords", async () => {
  await golandlords()
} )

/**
 * Fetch all landlords from the API
 * @returns { Promise< object > }
 */
async function fetchlandlords() {
  return await getdata( "landlords" )
}

/**
 * Add a new landlord
 * @param { string } name
 * @param { string } email
 * @param { string } phone
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addlandlord( name, email, phone, notes ) {
  const landlordData = { name, email, phone, notes }
  await putdata( "landlords", landlordData )
}

/**
 * Update an existing landlord
 * @param { string } id
 * @param { string } name
 * @param { string } email
 * @param { string } phone
 * @param { string } notes
 */
async function updatelandlord( id, name, email, phone, notes ) {
  const landlordData = { id, name, email, phone, notes }
  await putdata( "landlords", landlordData )
}

/**
 * Refresh the landlords table
 * @returns { Promise }
 */
export async function golandlords() {
  const landlords = await fetchlandlords()
  cleartablerows( "landlordstable" )

  for( const landlord of landlords ) {
    addlandlorddom( landlord )
  }
}

/**
 * Show the add landlord form
 */
function addlandlordinput() {
  clearform( "landlordform" )

  showform( "landlordform", async () => {
    await addlandlord(
      getformfieldvalue( "landlordform-name" ),
      getformfieldvalue( "landlordform-email" ),
      getformfieldvalue( "landlordform-phone" ),
      getformfieldvalue( "landlordform-notes" )
    )
    await golandlords()

    // Refresh building dropdown options
    window.dispatchEvent( new CustomEvent( "refreshLandlordDropdown" ) )
  } )
}

/**
 * Edit landlord functionality
 */
function editlandlord( ev ) {
  clearform( "landlordform" )
  const landlordrow = findancestorbytype( ev.target, "tr" )

  // Store the landlord being edited
  currentEditingLandlord = landlordrow.landlord

  // Populate form fields with current landlord data
  setformfieldvalue( "landlordform-name", currentEditingLandlord.name )
  setformfieldvalue( "landlordform-email", currentEditingLandlord.email )
  setformfieldvalue( "landlordform-phone", currentEditingLandlord.phone )
  setformfieldvalue( "landlordform-notes", currentEditingLandlord.notes || "" )

  showform( "landlordform", async () => {
    // Store the landlord ID to avoid race condition
    const landlordToUpdate = currentEditingLandlord

    // Update the landlord with new data from form
    await updatelandlord(
      landlordToUpdate.id,
      getformfieldvalue( "landlordform-name" ),
      getformfieldvalue( "landlordform-email" ),
      getformfieldvalue( "landlordform-phone" ),
      getformfieldvalue( "landlordform-notes" )
    )
    // Refresh the landlords table to show updated data
    await golandlords()

    // Refresh building dropdown options in case name changed
    window.dispatchEvent( new CustomEvent( "refreshLandlordDropdown" ) )

    // Clear the editing state
    // eslint-disable-next-line require-atomic-updates
    currentEditingLandlord = null
  } )
}

/**
 * Delete landlord functionality
 */
async function deletelandlord( ev ) {
  const landlordrow = findancestorbytype( ev.target, "tr" )
  const landlord = landlordrow.landlord

  const buildingCount = landlord.buildings ? landlord.buildings.length : 0
  let confirmMessage = `Are you sure you want to delete ${landlord.name}?`

  if( 0 < buildingCount ) {
    confirmMessage += ` This will also delete ${buildingCount} building${1 < buildingCount ? "s" : ""} and all their rooms.`
  }

  confirmMessage += " This action cannot be undone."

  const confirmed = await showConfirmDialog( confirmMessage )
  if( !confirmed ) {
    return
  }

  try {
    await deletedata( "landlords", landlord.id )
    await golandlords()

    // Refresh buildings table if any buildings were deleted
    if( 0 < buildingCount ) {
      // Trigger a custom event that buildings.js can listen to
      window.dispatchEvent( new CustomEvent( "refreshBuildings" ) )
    }

    // Refresh building dropdown options
    window.dispatchEvent( new CustomEvent( "refreshLandlordDropdown" ) )
  } catch ( error ) {
    alert( `Failed to delete landlord: ${error.message}` )
  }
}

/**
 * Handle clicks on action cell text
 */
function handleActionClick( ev ) {
  ev.stopPropagation()

  if( ev.target.classList.contains( "edit-text" ) ) {
    editlandlord( ev )
  } else if( ev.target.classList.contains( "delete-text" ) ) {
    deletelandlord( ev )
  }
}

/**
 * Add landlord to the DOM table
 * @param { object } landlord
 */
export function addlandlorddom( landlord ) {
  const table = gettablebody( "landlordstable" )
  const newrow = table.insertRow()

  const cells = []
  // Create cells: Name, Email, Phone, Notes, Buildings Count, Action = 6 total
  for( let i = 0; 6 > i; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // Store landlord reference on the row
  // @ts-ignore (custom property)
  newrow.landlord = landlord

  // Populate landlord data with data-label attributes for mobile
  cells[0].setAttribute( "data-label", "Name" )
  cells[0].innerText = landlord.name
  cells[1].setAttribute( "data-label", "Email" )
  cells[1].innerText = landlord.email || ""
  cells[2].setAttribute( "data-label", "Phone" )
  cells[2].innerText = landlord.phone || ""
  cells[3].setAttribute( "data-label", "Notes" )
  cells[3].innerText = landlord.notes || ""

  // Buildings count
  cells[4].setAttribute( "data-label", "Buildings" )
  const buildingsCount = landlord.buildings ? landlord.buildings.length : 0
  cells[4].innerText = buildingsCount.toString()

  // Action column - Simple text with click handler on the cell
  cells[5].setAttribute( "data-label", "Action" )
  cells[5].innerHTML = '<span class="edit-text">Edit</span> / <span class="delete-text">Delete</span>'
  cells[5].classList.add( "action-cell" )
  cells[5].addEventListener( "click", handleActionClick )
}



