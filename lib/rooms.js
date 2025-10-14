/**
 * Rooms module - handles room data operations
 */

const { getDatabase } = require('./database');

/**
 * Get all rooms from the database
 * @returns {Promise<Array>} Array of room objects
 */
async function get() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM rooms ORDER BY id');
  return stmt.all();
}

/**
 * Add a new room or update an existing one
 * @param {string} parsedurl - Parsed URL (not used but matches API signature)
 * @param {string} method - HTTP method (PUT for add/update)
 * @param {Object} data - Room data
 * @returns {Promise<Object>} The created/updated room
 */
async function add(parsedurl, method, data) {
  const db = getDatabase();

  // Update existing room if id is present
  if (data.id !== undefined) {
    const stmt = db.prepare(`
      UPDATE rooms
      SET property_name = @property_name,
          address = @address,
          room_type = @room_type,
          price = @price,
          available_from = @available_from,
          status = @status,
          landlord_contact = @landlord_contact,
          notes = @notes,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    const info = stmt.run({
      id: data.id,
      property_name: data.property_name || '',
      address: data.address || '',
      room_type: data.room_type || '',
      price: data.price || null,
      available_from: data.available_from || null,
      status: data.status || 'Available',
      landlord_contact: data.landlord_contact || '',
      notes: data.notes || ''
    });

    // Return the updated room
    const selectStmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
    return selectStmt.get(data.id);
  } else {
    // Insert new room
    const stmt = db.prepare(`
      INSERT INTO rooms (property_name, address, room_type, price, available_from, status, landlord_contact, notes)
      VALUES (@property_name, @address, @room_type, @price, @available_from, @status, @landlord_contact, @notes)
    `);

    const info = stmt.run({
      property_name: data.property_name || '',
      address: data.address || '',
      room_type: data.room_type || '',
      price: data.price || null,
      available_from: data.available_from || null,
      status: data.status || 'Available',
      landlord_contact: data.landlord_contact || '',
      notes: data.notes || ''
    });

    // Return the newly created room
    const selectStmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
    return selectStmt.get(info.lastInsertRowid);
  }
}

/**
 * Delete a room by ID
 * @param {string} parsedurl - Parsed URL (not used but matches API signature)
 * @param {string} method - HTTP method
 * @param {Object} data - Object containing the id of the room to delete
 * @returns {Promise<Object>} Result object with success status
 */
async function remove(parsedurl, method, data) {
  const db = getDatabase();

  if (data.id === undefined) {
    throw new Error('Room id is required for deletion');
  }

  const stmt = db.prepare('DELETE FROM rooms WHERE id = ?');
  const info = stmt.run(data.id);

  if (info.changes === 0) {
    throw new Error(`Room with id ${data.id} not found`);
  }

  return {
    success: true,
    id: data.id,
    deleted: info.changes
  };
}

module.exports = {
  get,
  add,
  remove
};

