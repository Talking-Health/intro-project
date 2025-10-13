import { getdata, putdata } from "./api.js"
import {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows,
} from "./form.js"
import { findancestorbytype } from "./dom.js"

// Variable to store the landlord currently being edited
let currentEditingLandlord = null

document.addEventListener( "DOMContentLoaded", async function () {
  const addLandlordBtn = document.getElementById( "addlandlord" )
  if( addLandlordBtn ) {
    addLandlordBtn.addEventListener( "click", addlandlordinput )
  }
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
async function golandlords() {
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
    // Clear the editing state
    // eslint-disable-next-line require-atomic-updates
    currentEditingLandlord = null
  } )
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

  // Action column - Edit button
  cells[5].setAttribute( "data-label", "Action" )
  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.classList.add( "edit-btn" )
  editbutton.addEventListener( "click", editlandlord )
  cells[5].appendChild( editbutton )
}