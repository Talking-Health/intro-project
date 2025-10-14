/**
 * Rooms module - handles room UI and interactions
 */

import { getdata, putdata, deletedata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"

document.addEventListener( "DOMContentLoaded", async function() {
  document.getElementById( "addroom" ).addEventListener( "click", addroominput )
  await gorooms()
} )

/**
 * Fetch all rooms from the server
 * @returns { Promise< object > }
 */
async function fetchrooms() {
  return await getdata( "rooms" )
}

/**
 * Add a new room
 * @param { string } property_name
 * @param { string } address
 * @param { string } room_type
 * @param { number } price
 * @param { string } available_from
 * @param { string } status
 * @param { string } landlord_contact
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addroom( property_name, address, room_type, price, available_from, status, landlord_contact, notes ) {
  await putdata( "rooms", { property_name, address, room_type, price, available_from, status, landlord_contact, notes } )
}

/**
 * Update an existing room
 * @param { string } id
 * @param { string } property_name
 * @param { string } address
 * @param { string } room_type
 * @param { number } price
 * @param { string } available_from
 * @param { string } status
 * @param { string } landlord_contact
 * @param { string } notes
 */
async function updateroom( id, property_name, address, room_type, price, available_from, status, landlord_contact, notes ) {
  await putdata( "rooms", { id, property_name, address, room_type, price, available_from, status, landlord_contact, notes } )
}

/**
 * Load and display all rooms
 * @returns { Promise }
 */
async function gorooms() {
  const rooms = await fetchrooms()
  cleartablerows( "roomstable" )

  for( const room of rooms ) {
    addroomdom( room )
  }
}

/**
 * Show form to add a new room
 */
function addroominput() {
  clearform( "roomform" )
  
  // Set default status
  setformfieldvalue( "roomform-status", "Available" )
  
  showform( "roomform", async () => {
    await addroom(
      getformfieldvalue( "roomform-property" ),
      getformfieldvalue( "roomform-address" ),
      getformfieldvalue( "roomform-type" ),
      parseFloat( getformfieldvalue( "roomform-price" ) ) || 0,
      getformfieldvalue( "roomform-available" ),
      getformfieldvalue( "roomform-status" ),
      getformfieldvalue( "roomform-landlord" ),
      getformfieldvalue( "roomform-notes" )
    )
    await gorooms()
  } )
}

/**
 * Edit room handler
 * @param { Event } ev
 */
function editroom( ev ) {
  clearform( "roomform" )
  const roomrow = findancestorbytype( ev.target, "tr" )
  const room = roomrow.room

  // Populate form with existing data
  setformfieldvalue( "roomform-property", room.property_name || "" )
  setformfieldvalue( "roomform-address", room.address || "" )
  setformfieldvalue( "roomform-type", room.room_type || "" )
  setformfieldvalue( "roomform-price", room.price || "" )
  setformfieldvalue( "roomform-available", room.available_from || "" )
  setformfieldvalue( "roomform-status", room.status || "Available" )
  setformfieldvalue( "roomform-landlord", room.landlord_contact || "" )
  setformfieldvalue( "roomform-notes", room.notes || "" )

  showform( "roomform", async () => {
    await updateroom(
      room.id,
      getformfieldvalue( "roomform-property" ),
      getformfieldvalue( "roomform-address" ),
      getformfieldvalue( "roomform-type" ),
      parseFloat( getformfieldvalue( "roomform-price" ) ) || 0,
      getformfieldvalue( "roomform-available" ),
      getformfieldvalue( "roomform-status" ),
      getformfieldvalue( "roomform-landlord" ),
      getformfieldvalue( "roomform-notes" )
    )
    await gorooms()
  } )
}

/**
 * Delete room handler
 * @param { Event } ev
 */
async function deleteroom( ev ) {
  const roomrow = findancestorbytype( ev.target, "tr" )
  const room = roomrow.room

  // Confirm deletion
  if( !confirm( `Are you sure you want to delete ${room.property_name}?` ) ) {
    return
  }

  try {
    // Call the delete API
    await deletedata( "rooms", { id: room.id } )

    // Refresh the table to show updated data
    await gorooms()
  } catch (error) {
    console.error( "Failed to delete room:", error )
    alert( "Failed to delete room. Please try again." )
  }
}

/**
 * Add a room row to the DOM table
 * @param { object } room
 */
export function addroomdom( room ) {
  const table = gettablebody( "roomstable" )
  const newrow = table.insertRow()

  const cells = []
  // Create cells: Property, Address, Type, Price, Available From, Status, Landlord, Notes, Action
  for( let i = 0; i < 9; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // Store room object on the row for later access
  // @ts-ignore
  newrow.room = room

  // Populate cells with data
  cells[ 0 ].innerText = room.property_name || ""
  cells[ 1 ].innerText = room.address || ""
  cells[ 2 ].innerText = room.room_type || ""
  cells[ 3 ].innerText = room.price ? `£${parseFloat(room.price).toFixed(2)}` : ""
  
  // Format available_from date for display
  if( room.available_from ) {
    const availDate = new Date( room.available_from )
    if( !isNaN( availDate.getTime() ) ) {
      cells[ 4 ].innerText = availDate.toLocaleDateString()
    } else {
      cells[ 4 ].innerText = room.available_from
    }
  } else {
    cells[ 4 ].innerText = ""
  }
  
  cells[ 5 ].innerText = room.status || ""
  cells[ 6 ].innerText = room.landlord_contact || ""
  cells[ 7 ].innerText = room.notes || ""

  // Create action buttons in the last cell
  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editroom )

  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", deleteroom )

  cells[ 8 ].appendChild( editbutton )
  cells[ 8 ].appendChild( deletebutton )
}

