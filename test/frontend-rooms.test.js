/**
 * Tests for public/js/rooms.js
 * @jest-environment jsdom
 */

const { addroomdom } = require('./helpers/rooms-wrapper.js');

describe('Rooms Module', () => {
  describe('addroomdom()', () => {
    beforeEach(() => {
      // Set up DOM before each test
      document.body.innerHTML = `
        <div id="content">Main Content</div>
        <table id="roomstable">
          <thead>
            <tr>
              <th>Property</th>
              <th>Address</th>
              <th>Type</th>
              <th>Price</th>
              <th>Available From</th>
              <th>Status</th>
              <th>Landlord</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;
    });

    test('should create a new row in the table', () => {
      const room = {
        id: 1,
        property_name: 'Test Property',
        address: '123 Test St',
        room_type: 'Studio',
        price: 800,
        available_from: '2025-11-01',
        status: 'Available',
        landlord_contact: 'test@landlord.com',
        notes: 'Test notes'
      };

      const tbody = document.querySelector('#roomstable tbody');
      const initialRows = tbody.getElementsByTagName('tr').length;

      addroomdom(room);

      const finalRows = tbody.getElementsByTagName('tr').length;
      expect(finalRows).toBe(initialRows + 1);
    });

    test('should create 9 cells in the row', () => {
      const room = {
        id: 1,
        property_name: 'Test Property',
        address: '123 Test St',
        room_type: 'Studio',
        price: 800,
        available_from: '2025-11-01',
        status: 'Available',
        landlord_contact: 'test@landlord.com',
        notes: 'Test notes'
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const cells = lastRow.getElementsByTagName('td');

      expect(cells.length).toBe(9);
    });

    test('should set property name in first cell', () => {
      const room = {
        id: 1,
        property_name: 'Sunny Studio',
        address: '123 Main St',
        room_type: 'Studio',
        price: 800
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const firstCell = lastRow.getElementsByTagName('td')[0];

      expect(firstCell.innerText).toBe('Sunny Studio');
    });

    test('should set address in second cell', () => {
      const room = {
        id: 1,
        property_name: 'Test Property',
        address: '456 Oak Avenue, London',
        room_type: 'Studio',
        price: 800
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const secondCell = lastRow.getElementsByTagName('td')[1];

      expect(secondCell.innerText).toBe('456 Oak Avenue, London');
    });

    test('should format price with £ symbol and 2 decimal places', () => {
      const room = {
        id: 1,
        property_name: 'Test Property',
        address: '123 Test St',
        room_type: 'Studio',
        price: 850.5
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const priceCell = lastRow.getElementsByTagName('td')[3];

      expect(priceCell.innerText).toBe('£850.50');
    });

    test('should format available_from date', () => {
      const room = {
        id: 1,
        property_name: 'Test Property',
        address: '123 Test St',
        room_type: 'Studio',
        price: 800,
        available_from: '2025-11-15'
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const dateCell = lastRow.getElementsByTagName('td')[4];

      // The date should be formatted using toLocaleDateString()
      const expectedDate = new Date('2025-11-15').toLocaleDateString();
      expect(dateCell.innerText).toBe(expectedDate);
    });

    test('should attach room object to row', () => {
      const room = {
        id: 1,
        property_name: 'Garden Flat',
        address: '789 Park Lane',
        room_type: '1BR',
        price: 1200,
        status: 'Available'
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];

      expect(lastRow.room).toBe(room);
    });

    test('should create edit and delete buttons in last cell', () => {
      const room = {
        id: 1,
        property_name: 'Test Property',
        address: '123 Test St',
        room_type: 'Studio',
        price: 800
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const lastCell = lastRow.getElementsByTagName('td')[8];
      const buttons = lastCell.querySelectorAll('button');

      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toBe('Edit');
      expect(buttons[1].textContent).toBe('Delete');
    });

    test('should handle room with empty fields', () => {
      const room = {
        id: 2,
        property_name: '',
        address: '',
        room_type: '',
        price: null,
        available_from: null,
        status: '',
        landlord_contact: '',
        notes: ''
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const firstCell = lastRow.getElementsByTagName('td')[0];
      const priceCell = lastRow.getElementsByTagName('td')[3];

      expect(firstCell.innerText).toBe('');
      expect(priceCell.innerText).toBe('');
      expect(lastRow.room).toBe(room);
    });

    test('should handle room with special characters in property name', () => {
      const room = {
        id: 3,
        property_name: "O'Brien's <Luxury> Apartment & Suite",
        address: '123 Test St',
        room_type: 'Studio',
        price: 800
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const firstCell = lastRow.getElementsByTagName('td')[0];

      expect(firstCell.innerText).toBe("O'Brien's <Luxury> Apartment & Suite");
    });

    test('should handle multiple rooms being added', () => {
      const rooms = [
        { id: 1, property_name: 'Room 1', address: 'Address 1', room_type: 'Studio', price: 800 },
        { id: 2, property_name: 'Room 2', address: 'Address 2', room_type: '1BR', price: 1000 },
        { id: 3, property_name: 'Room 3', address: 'Address 3', room_type: '2BR', price: 1500 }
      ];

      rooms.forEach(room => addroomdom(room));

      const tbody = document.querySelector('#roomstable tbody');
      const rows = tbody.getElementsByTagName('tr');

      expect(rows.length).toBe(3);
    });

    test('should preserve room data structure', () => {
      const room = {
        id: 1,
        property_name: 'Test Property',
        address: '123 Test St',
        room_type: 'Studio',
        price: 800,
        extraField: 'should be preserved'
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];

      expect(lastRow.room).toEqual(room);
      expect(lastRow.room.extraField).toBe('should be preserved');
    });

    test('should handle different room types', () => {
      const roomTypes = ['Studio', '1BR', '2BR', '3BR', 'House'];
      
      roomTypes.forEach((type, index) => {
        const room = {
          id: index + 1,
          property_name: `Property ${index + 1}`,
          address: `Address ${index + 1}`,
          room_type: type,
          price: 800 + (index * 200)
        };

        addroomdom(room);
      });

      const tbody = document.querySelector('#roomstable tbody');
      const rows = tbody.getElementsByTagName('tr');

      expect(rows.length).toBe(5);
      
      // Check that each room type is correctly displayed
      roomTypes.forEach((type, index) => {
        const typeCell = rows[index].getElementsByTagName('td')[2];
        expect(typeCell.innerText).toBe(type);
      });
    });

    test('should handle different statuses', () => {
      const statuses = ['Available', 'Pending', 'Rented'];
      
      statuses.forEach((status, index) => {
        const room = {
          id: index + 1,
          property_name: `Property ${index + 1}`,
          address: `Address ${index + 1}`,
          room_type: 'Studio',
          price: 800,
          status: status
        };

        addroomdom(room);
      });

      const tbody = document.querySelector('#roomstable tbody');
      const rows = tbody.getElementsByTagName('tr');

      expect(rows.length).toBe(3);
      
      // Check that each status is correctly displayed
      statuses.forEach((status, index) => {
        const statusCell = rows[index].getElementsByTagName('td')[5];
        expect(statusCell.innerText).toBe(status);
      });
    });

    test('should handle invalid date format gracefully', () => {
      const room = {
        id: 1,
        property_name: 'Test Property',
        address: '123 Test St',
        room_type: 'Studio',
        price: 800,
        available_from: 'invalid-date'
      };

      addroomdom(room);

      const tbody = document.querySelector('#roomstable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const dateCell = lastRow.getElementsByTagName('td')[4];

      // Should display the raw string if date is invalid
      expect(dateCell.innerText).toBe('invalid-date');
    });
  });
});

