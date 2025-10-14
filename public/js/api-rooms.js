/**
 * API client for rooms
 */

/**
 * Fetch all rooms from the server
 * @returns {Promise<Array>} Array of room objects
 */
export async function getrooms() {
  const response = await fetch('/api/rooms');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Save a room (create or update)
 * @param {Object} room - Room object to save
 * @returns {Promise<Object>} The saved room object
 */
export async function saveroom(room) {
  const response = await fetch('/api/rooms', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(room)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Delete a room by ID
 * @param {number} id - Room ID to delete
 * @returns {Promise<Object>} Result object
 */
export async function deleteroom(id) {
  const response = await fetch('/api/rooms', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

