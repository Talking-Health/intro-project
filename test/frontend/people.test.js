const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load the test HTML
const html = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock fetch for testing
global.fetch = (url, options) => {
  if (url.includes('/api/people') && (!options || options.method === 'GET')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            name: 'Test Person 1',
            email: 'test1@example.com',
            notes: 'Notes 1',
          },
          {
            id: 2,
            name: 'Test Person 2',
            email: 'test2@example.com',
            notes: 'Notes 2',
          },
        ]),
    });
  }

  if (url.includes('/api/people') && options && options.method === 'PUT') {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          id: 3,
          name: 'New Person',
          email: 'new@example.com',
          notes: 'New notes',
        }),
    });
  }

  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Not found' }),
  });
};

// Import the people module after setting up the environment
const { addpersondom } = require('../../public/js/people.js');

describe('People Module', () => {
  beforeEach(() => {
    // Reset DOM for each test
    document.body.innerHTML = html;
  });

  describe('addpersondom()', () => {
    it('should add a person row to the table', () => {
      const person = {
        id: 1,
        name: 'Test Person',
        email: 'test@example.com',
        notes: 'Test notes',
      };

      addpersondom(person);

      const table = document.getElementById('peopletable');
      const tbody = table.getElementsByTagName('tbody')[0];
      const rows = tbody.getElementsByTagName('tr');

      expect(rows.length).to.equal(1);
      expect(rows[0].cells[0].textContent).to.equal('Test Person');
    });

    it('should create edit button for each person', () => {
      const person = {
        id: 1,
        name: 'Test Person',
        email: 'test@example.com',
        notes: 'Test notes',
      };

      addpersondom(person);

      const table = document.getElementById('peopletable');
      const tbody = table.getElementsByTagName('tbody')[0];
      const rows = tbody.getElementsByTagName('tr');
      const editButton = rows[0].cells[8].querySelector('button');

      expect(editButton).to.exist;
      expect(editButton.textContent).to.equal('Edit');
    });

    it('should attach person data to row element', () => {
      const person = {
        id: 1,
        name: 'Test Person',
        email: 'test@example.com',
        notes: 'Test notes',
      };

      addpersondom(person);

      const table = document.getElementById('peopletable');
      const tbody = table.getElementsByTagName('tbody')[0];
      const row = tbody.getElementsByTagName('tr')[0];

      expect(row.person).to.deep.equal(person);
    });

    it('should add multiple people to the table', () => {
      const person1 = {
        id: 1,
        name: 'Person 1',
        email: 'person1@example.com',
        notes: 'Notes 1',
      };
      const person2 = {
        id: 2,
        name: 'Person 2',
        email: 'person2@example.com',
        notes: 'Notes 2',
      };

      addpersondom(person1);
      addpersondom(person2);

      const table = document.getElementById('peopletable');
      const tbody = table.getElementsByTagName('tbody')[0];
      const rows = tbody.getElementsByTagName('tr');

      expect(rows.length).to.equal(2);
      expect(rows[0].cells[0].textContent).to.equal('Person 1');
      expect(rows[1].cells[0].textContent).to.equal('Person 2');
    });
  });
});
