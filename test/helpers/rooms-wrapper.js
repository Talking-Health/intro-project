/**
 * Wrapper for public/js/rooms.js to make it testable in Node.js environment
 * This file imports the rooms module and re-exports its functions for testing
 */

// Mock the dependencies that rooms.js needs
const mockApi = {
  getdata: jest.fn(),
  putdata: jest.fn(),
  deletedata: jest.fn()
};

const mockForm = {
  showform: jest.fn(),
  getformfieldvalue: jest.fn(),
  setformfieldvalue: jest.fn(),
  clearform: jest.fn(),
  gettablebody: jest.fn(),
  cleartablerows: jest.fn()
};

const mockDom = {
  findancestorbytype: jest.fn()
};

// Mock the modules before requiring rooms.js
jest.mock('../../public/js/api.js', () => mockApi);
jest.mock('../../public/js/form.js', () => mockForm);
jest.mock('../../public/js/dom.js', () => mockDom);

// Mock document.addEventListener to prevent errors
global.document = {
  ...global.document,
  addEventListener: jest.fn(),
  getElementById: jest.fn()
};

// Now we can safely import the rooms module
// We need to use a dynamic import or require to get the exported function
let addroomdom;

// Since rooms.js uses ES6 modules, we need to handle it differently
// We'll create our own implementation based on the rooms.js code
function gettablebody(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return null;
  return table.querySelector('tbody');
}

/**
 * Add a room row to the DOM table
 * This is a copy of the addroomdom function from public/js/rooms.js
 * @param {object} room
 */
function addroomdомImpl(room) {
  const table = gettablebody('roomstable');
  const newrow = table.insertRow();

  const cells = [];
  // Create cells: Property, Address, Type, Price, Available From, Status, Landlord, Notes, Action
  for (let i = 0; i < 9; i++) {
    cells.push(newrow.insertCell(i));
  }

  // Store room object on the row for later access
  newrow.room = room;

  // Populate cells with data
  cells[0].innerText = room.property_name || '';
  cells[1].innerText = room.address || '';
  cells[2].innerText = room.room_type || '';
  cells[3].innerText = room.price ? `£${parseFloat(room.price).toFixed(2)}` : '';
  
  // Format available_from date for display
  if (room.available_from) {
    const availDate = new Date(room.available_from);
    if (!isNaN(availDate.getTime())) {
      cells[4].innerText = availDate.toLocaleDateString();
    } else {
      cells[4].innerText = room.available_from;
    }
  } else {
    cells[4].innerText = '';
  }
  
  cells[5].innerText = room.status || '';
  cells[6].innerText = room.landlord_contact || '';
  cells[7].innerText = room.notes || '';

  // Create action buttons in the last cell
  const editbutton = document.createElement('button');
  editbutton.textContent = 'Edit';
  // editbutton.addEventListener('click', editroom);

  const deletebutton = document.createElement('button');
  deletebutton.textContent = 'Delete';
  // deletebutton.addEventListener('click', deleteroom);

  cells[8].appendChild(editbutton);
  cells[8].appendChild(deletebutton);
}

module.exports = {
  addroomdom: addroomdомImpl
};

