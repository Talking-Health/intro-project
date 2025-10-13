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

// Variable to store the building currently being edited
let currentEditingBuilding = null

document.addEventListener( "DOMContentLoaded", async function () {
  const addBuildingBtn = document.getElementById( "addbuilding" )
  if( addBuildingBtn ) {
    addBuildingBtn.addEventListener( "click", addbuildinginput )
  }

  // Add room button event listener
  const addRoomBtn = document.getElementById( "addRoomBtn" )
  if( addRoomBtn ) {
    addRoomBtn.addEventListener( "click", addRoomToForm )
  }

  await gobuildings()
  await populateLandlordDropdown()
} )

/**
 * Fetch all buildings from the API
 * @returns { Promise< object > }
 */
async function fetchbuildings() {
  return await getdata( "buildings" )
}

/**
 * Fetch all landlords from the API
 * @returns { Promise< object > }
 */
async function fetchlandlords() {
  return await getdata( "landlords" )
}

/**
 * Add a new building
 * @param { string } name
 * @param { string } address
 * @param { string } landlordId
 * @param { string } type
 * @param { string } yearBuilt
 * @param { string } notes
 * @param { Array< object > } rooms
 * @returns { Promise< object > }
 */
async function addbuilding( name, address, landlordId, type, yearBuilt, notes, rooms ) {
  const buildingData = {
    name,
    address,
    landlordId: parseInt( landlordId, 10 ),
    type,
    yearBuilt: yearBuilt ? parseInt( yearBuilt, 10 ) : undefined,
    notes,
    rooms: rooms || []
  }
  await putdata( "buildings", buildingData )
}

/**
 * Update an existing building
 * @param { string } id
 * @param { string } name
 * @param { string } address
 * @param { string } landlordId
 * @param { string } type
 * @param { string } yearBuilt
 * @param { string } notes
 * @param { Array< object > } rooms
 */
async function updatebuilding( id, name, address, landlordId, type, yearBuilt, notes, rooms ) {
  const buildingData = {
    id,
    name,
    address,
    landlordId: parseInt( landlordId, 10 ),
    type,
    yearBuilt: yearBuilt ? parseInt( yearBuilt, 10 ) : undefined,
    notes,
    rooms: rooms || []
  }
  await putdata( "buildings", buildingData )
}

/**
 * Refresh the buildings table
 * @returns { Promise }
 */
async function gobuildings() {
  const buildings = await fetchbuildings()
  const landlords = await fetchlandlords()

  cleartablerows( "buildingstable" )

  for( const building of buildings ) {
    const landlord = landlords.find( l => l.id === building.landlordId )
    addbuildingdom( building, landlord )
  }
}

/**
 * Populate the landlord dropdown in the form
 */
async function populateLandlordDropdown() {
  const landlords = await fetchlandlords()
  const dropdown = document.getElementById( "buildingform-landlord" )

  if( dropdown ) {
    // Clear existing options
    dropdown.innerHTML = '<option value="">Select a landlord...</option>'

    // Add landlord options
    for( const landlord of landlords ) {
      const option = document.createElement( "option" )
      option.value = landlord.id.toString()
      option.textContent = landlord.name
      dropdown.appendChild( option )
    }
  }
}

/**
 * Create room type options HTML
 */
function createRoomTypeOptions( selectedType ) {
  const types = [
    { value: "living room", label: "Living Room" },
    { value: "bedroom", label: "Bedroom" },
    { value: "bathroom", label: "Bathroom" },
    { value: "kitchen", label: "Kitchen" },
    { value: "office", label: "Office" },
    { value: "retail", label: "Retail" },
    { value: "lobby", label: "Lobby" },
    { value: "storage", label: "Storage" },
    { value: "other", label: "Other" }
  ]

  let options = '<option value="">Select type...</option>'
  types.forEach( type => {
    const selected = selectedType === type.value ? "selected" : ""
    options += `<option value="${type.value}" ${selected}>${type.label}</option>`
  } )
  return options
}

/**
 * Add a room to the form
 */
function addRoomToForm( roomData = null ) {
  const roomsList = document.getElementById( "roomsList" )
  const roomIndex = roomsList.children.length
  const name = roomData ? roomData.name : ""
  const size = roomData && roomData.size ? roomData.size : ""
  const notes = roomData && roomData.notes ? roomData.notes : ""
  const typeOptions = createRoomTypeOptions( roomData ? roomData.type : "" )

  const roomDiv = document.createElement( "div" )
  roomDiv.className = "room-editor-item"
  roomDiv.innerHTML = `
    <div class="room-editor-header">
      <span class="room-editor-title">Room ${roomIndex + 1}</span>
      <button type="button" class="remove-room-btn" onclick="removeRoomFromForm(this)">Remove</button>
    </div>
    <div class="room-editor-grid">
      <div>
        <label>Name</label>
        <input type="text" class="room-name" value="${name}" placeholder="e.g., Unit 101 - Living Room">
      </div>
      <div>
        <label>Type</label>
        <select class="room-type">
          ${typeOptions}
        </select>
      </div>
      <div>
        <label>Size (sq ft)</label>
        <input type="number" class="room-size" value="${size}" placeholder="Optional">
      </div>
      <div class="room-editor-full">
        <label>Notes</label>
        <textarea class="room-notes" rows="2" placeholder="Optional notes about this room">${notes}</textarea>
      </div>
    </div>
  `

  roomsList.appendChild( roomDiv )
}

/**
 * Remove room from form
 */
function removeRoomFromForm( button ) {
  const roomItem = button.closest( ".room-editor-item" )
  roomItem.remove()

  // Update room numbers
  const roomsList = document.getElementById( "roomsList" )
  const rooms = roomsList.querySelectorAll( ".room-editor-item" )
  rooms.forEach( ( room, index ) => {
    const title = room.querySelector( ".room-editor-title" )
    title.textContent = `Room ${index + 1}`
  } )
}

// Make removeRoomFromForm globally accessible
// @ts-ignore
window.removeRoomFromForm = removeRoomFromForm

/**
 * Get rooms data from form
 */
function getRoomsFromForm() {
  const roomsList = document.getElementById( "roomsList" )
  const roomItems = roomsList.querySelectorAll( ".room-editor-item" )
  const rooms = []

  roomItems.forEach( item => {
    // @ts-ignore
    const name = item.querySelector( ".room-name" ).value.trim()
    // @ts-ignore
    const type = item.querySelector( ".room-type" ).value
    // @ts-ignore
    const size = item.querySelector( ".room-size" ).value
    // @ts-ignore
    const notes = item.querySelector( ".room-notes" ).value.trim()

    if( name ) { // Only add rooms with a name
      const room = { name, type }
      if( size ) room.size = parseInt( size, 10 )
      if( notes ) room.notes = notes
      rooms.push( room )
    }
  } )

  return rooms
}

/**
 * Clear rooms from form
 */
function clearRoomsFromForm() {
  const roomsList = document.getElementById( "roomsList" )
  roomsList.innerHTML = ""
}

/**
 * Populate rooms in form
 */
function populateRoomsInForm( rooms ) {
  clearRoomsFromForm()
  if( rooms && 0 < rooms.length ) {
    rooms.forEach( room => addRoomToForm( room ) )
  }
}

/**
 * Show the add building form
 */
function addbuildinginput() {
  clearform( "buildingform" )
  clearRoomsFromForm()

  showform( "buildingform", async () => {
    const rooms = getRoomsFromForm()
    await addbuilding(
      getformfieldvalue( "buildingform-name" ),
      getformfieldvalue( "buildingform-address" ),
      getformfieldvalue( "buildingform-landlord" ),
      getformfieldvalue( "buildingform-type" ),
      getformfieldvalue( "buildingform-yearbuilt" ),
      getformfieldvalue( "buildingform-notes" ),
      rooms
    )
    await gobuildings()
  } )
}

/**
 * Edit building functionality
 */
async function editbuilding( ev ) {
  clearform( "buildingform" )
  const buildingrow = findancestorbytype( ev.target, "tr" )

  // Store the building being edited
  currentEditingBuilding = buildingrow.building

  // Ensure landlord dropdown is populated
  await populateLandlordDropdown()

  // Populate form fields with current building data
  setformfieldvalue( "buildingform-name", currentEditingBuilding.name )
  setformfieldvalue( "buildingform-address", currentEditingBuilding.address )
  setformfieldvalue( "buildingform-landlord", currentEditingBuilding.landlordId.toString() )
  setformfieldvalue( "buildingform-type", currentEditingBuilding.type || "" )
  setformfieldvalue( "buildingform-yearbuilt", currentEditingBuilding.yearBuilt ? currentEditingBuilding.yearBuilt.toString() : "" )
  setformfieldvalue( "buildingform-notes", currentEditingBuilding.notes || "" )

  // Populate rooms in the form
  populateRoomsInForm( currentEditingBuilding.rooms )

  showform( "buildingform", async () => {
    // Store the building ID to avoid race condition
    const buildingToUpdate = currentEditingBuilding
    const rooms = getRoomsFromForm()

    // Update the building with new data from form
    await updatebuilding(
      buildingToUpdate.id,
      getformfieldvalue( "buildingform-name" ),
      getformfieldvalue( "buildingform-address" ),
      getformfieldvalue( "buildingform-landlord" ),
      getformfieldvalue( "buildingform-type" ),
      getformfieldvalue( "buildingform-yearbuilt" ),
      getformfieldvalue( "buildingform-notes" ),
      rooms
    )
    // Refresh the buildings table to show updated data
    await gobuildings()
    // Clear the editing state
    // eslint-disable-next-line require-atomic-updates
    currentEditingBuilding = null
  } )
}

/**
 * Show rooms modal with building's rooms
 * @param { object } building
 */
function showRoomsModal( building ) {
  // Update modal title
  document.getElementById( "roomsModalTitle" ).textContent = `Rooms in ${building.name}`

  // Clear existing rooms display
  const roomsContainer = document.getElementById( "roomsDisplay" )
  roomsContainer.innerHTML = ""

  if( building.rooms && 0 < building.rooms.length ) {
    for( const room of building.rooms ) {
      const roomDiv = document.createElement( "div" )
      roomDiv.className = "room-item"
      roomDiv.innerHTML = `
        <div class="room-header">
          <strong>${room.name}</strong>
          <span class="room-type">(${room.type})</span>
        </div>
        <div class="room-details">
          ${room.size ? `Size: ${room.size} sq ft` : ""}
          ${room.notes ? `<br>Notes: ${room.notes}` : ""}
        </div>
      `
      roomsContainer.appendChild( roomDiv )
    }
  } else {
    roomsContainer.innerHTML = "<p>No rooms added to this building yet.</p>"
  }

  // Show the modal
  document.getElementById( "content" ).style.display = "none"
  document.getElementById( "roomsModal" ).style.display = "block"
}

/**
 * Add building to the DOM table
 * @param { object } building
 * @param { object } landlord
 */
export function addbuildingdom( building, landlord ) {
  const table = gettablebody( "buildingstable" )
  const newrow = table.insertRow()

  const cells = []
  // Create cells: Name, Address, Landlord, Type, Year Built, Rooms Count, Action = 7 total
  for( let i = 0; 7 > i; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // Store building reference on the row
  // @ts-ignore (custom property)
  newrow.building = building

  // Populate building data with data-label attributes for mobile
  cells[0].setAttribute( "data-label", "Name" )
  cells[0].innerText = building.name
  cells[1].setAttribute( "data-label", "Address" )
  cells[1].innerText = building.address || ""
  cells[2].setAttribute( "data-label", "Landlord" )
  cells[2].innerText = landlord ? landlord.name : "Unknown"
  cells[3].setAttribute( "data-label", "Type" )
  cells[3].innerText = building.type || ""
  cells[4].setAttribute( "data-label", "Year Built" )
  cells[4].innerText = building.yearBuilt ? building.yearBuilt.toString() : ""

  // Rooms count with "View Rooms" button
  cells[5].setAttribute( "data-label", "Rooms" )
  const roomsCount = building.rooms ? building.rooms.length : 0
  const roomsButton = document.createElement( "button" )
  roomsButton.textContent = `View Rooms (${roomsCount})`
  roomsButton.classList.add( "rooms-view-btn" )
  roomsButton.addEventListener( "click", () => showRoomsModal( building ) )
  cells[5].appendChild( roomsButton )

  // Action column - Edit button
  cells[6].setAttribute( "data-label", "Action" )
  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.classList.add( "edit-btn" )
  editbutton.addEventListener( "click", editbuilding )
  cells[6].appendChild( editbutton )
}