/**
 * Tests for public/js/people.js
 * @jest-environment jsdom
 */

const { addpersondom } = require('./helpers/people-wrapper.js');

describe('People Module', () => {
  describe('addpersondom()', () => {
    beforeEach(() => {
      // Set up DOM before each test
      document.body.innerHTML = `
        <div id="content">Main Content</div>
        <table id="peopletable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;
    });

    test('should create a new row in the table', () => {
      const person = {
        id: 1,
        name: 'Test Person',
        email: 'test@test.com',
        notes: 'Test notes'
      };

      const tbody = document.querySelector('#peopletable tbody');
      const initialRows = tbody.getElementsByTagName('tr').length;

      addpersondom(person);

      const finalRows = tbody.getElementsByTagName('tr').length;
      expect(finalRows).toBe(initialRows + 1);
    });

    test('should create 9 cells in the row', () => {
      const person = {
        id: 1,
        name: 'Test Person',
        email: 'test@test.com',
        notes: 'Test notes'
      };

      addpersondom(person);

      const tbody = document.querySelector('#peopletable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const cells = lastRow.getElementsByTagName('td');

      expect(cells.length).toBe(9);
    });

    test('should set person name in first cell', () => {
      const person = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        notes: 'Developer'
      };

      addpersondom(person);

      const tbody = document.querySelector('#peopletable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const firstCell = lastRow.getElementsByTagName('td')[0];

      expect(firstCell.innerText).toBe('John Doe');
    });

    test('should attach person object to row', () => {
      const person = {
        id: 1,
        name: 'Jane Smith',
        email: 'jane@example.com',
        notes: 'Designer'
      };

      addpersondom(person);

      const tbody = document.querySelector('#peopletable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];

      expect(lastRow.person).toBe(person);
    });

    test('should create edit button in last cell', () => {
      const person = {
        id: 1,
        name: 'Test Person',
        email: 'test@test.com',
        notes: 'Test notes'
      };

      addpersondom(person);

      const tbody = document.querySelector('#peopletable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const lastCell = lastRow.getElementsByTagName('td')[8];
      const button = lastCell.querySelector('button');

      expect(button).not.toBeNull();
      expect(button.textContent).toBe('Edit');
    });

    test('should handle person with empty fields', () => {
      const person = {
        id: 2,
        name: '',
        email: '',
        notes: ''
      };

      addpersondom(person);

      const tbody = document.querySelector('#peopletable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const firstCell = lastRow.getElementsByTagName('td')[0];

      expect(firstCell.innerText).toBe('');
      expect(lastRow.person).toBe(person);
    });

    test('should handle person with special characters in name', () => {
      const person = {
        id: 3,
        name: "O'Brien & Sons <Ltd>",
        email: 'obrien@example.com',
        notes: 'Special chars'
      };

      addpersondom(person);

      const tbody = document.querySelector('#peopletable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];
      const firstCell = lastRow.getElementsByTagName('td')[0];

      expect(firstCell.innerText).toBe("O'Brien & Sons <Ltd>");
    });

    test('should handle multiple people being added', () => {
      const people = [
        { id: 1, name: 'Person 1', email: 'p1@test.com', notes: 'Notes 1' },
        { id: 2, name: 'Person 2', email: 'p2@test.com', notes: 'Notes 2' },
        { id: 3, name: 'Person 3', email: 'p3@test.com', notes: 'Notes 3' }
      ];

      people.forEach(person => addpersondom(person));

      const tbody = document.querySelector('#peopletable tbody');
      const rows = tbody.getElementsByTagName('tr');

      expect(rows.length).toBe(3);
    });

    test('should preserve person data structure', () => {
      const person = {
        id: 1,
        name: 'Test Person',
        email: 'test@test.com',
        notes: 'Test notes',
        extraField: 'should be preserved'
      };

      addpersondom(person);

      const tbody = document.querySelector('#peopletable tbody');
      const lastRow = tbody.getElementsByTagName('tr')[tbody.getElementsByTagName('tr').length - 1];

      expect(lastRow.person).toEqual(person);
      expect(lastRow.person.extraField).toBe('should be preserved');
    });
  });
});

