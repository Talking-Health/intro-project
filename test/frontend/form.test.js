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

// Import the form module after setting up the environment
const {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows,
} = require('../../public/js/form.js');

describe('Form Module', () => {
  beforeEach(() => {
    // Reset DOM for each test
    document.body.innerHTML = html;
  });

  describe('showform()', () => {
    it('should hide content and show form', () => {
      const content = document.getElementById('content');
      const form = document.getElementById('personform');

      showform('personform', () => {});

      expect(content.style.display).to.equal('none');
      expect(form.style.display).to.equal('block');
    });

    it('should set form submit callback', () => {
      let callbackCalled = false;
      const callback = () => {
        callbackCalled = true;
      };

      showform('personform', callback);

      // Simulate form submission
      const form = document.getElementById('personform').querySelector('form');
      const submitEvent = new window.Event('submit', { bubbles: true });
      form.dispatchEvent(submitEvent);

      expect(callbackCalled).to.be.true;
    });
  });

  describe('getformfieldvalue()', () => {
    it('should get value from form field', () => {
      const nameField = document.getElementById('personform-name');
      nameField.value = 'Test Name';

      const value = getformfieldvalue('personform-name');
      expect(value).to.equal('Test Name');
    });

    it('should return empty string for empty field', () => {
      const value = getformfieldvalue('personform-name');
      expect(value).to.equal('');
    });
  });

  describe('setformfieldvalue()', () => {
    it('should set value in form field', () => {
      setformfieldvalue('personform-name', 'New Name');

      const nameField = document.getElementById('personform-name');
      expect(nameField.value).to.equal('New Name');
    });

    it('should set value in textarea', () => {
      setformfieldvalue('personform-notes', 'Test notes');

      const notesField = document.getElementById('personform-notes');
      expect(notesField.value).to.equal('Test notes');
    });
  });

  describe('clearform()', () => {
    it('should clear all input fields in form', () => {
      // Set some values
      setformfieldvalue('personform-name', 'Test Name');
      setformfieldvalue('personform-email', 'test@example.com');
      setformfieldvalue('personform-notes', 'Test notes');

      // Clear the form
      clearform('personform');

      // Check values are cleared
      expect(getformfieldvalue('personform-name')).to.equal('');
      expect(getformfieldvalue('personform-email')).to.equal('');
      expect(getformfieldvalue('personform-notes')).to.equal('');
    });
  });

  describe('gettablebody()', () => {
    it('should return table body element', () => {
      const tbody = gettablebody('peopletable');
      expect(tbody).to.be.an('object');
      expect(tbody.tagName.toLowerCase()).to.equal('tbody');
    });
  });

  describe('cleartablerows()', () => {
    it('should clear all rows except header', () => {
      const table = document.getElementById('peopletable');
      const tbody = table.getElementsByTagName('tbody')[0];

      // Add some test rows
      const row1 = tbody.insertRow();
      row1.insertCell().textContent = 'Row 1';
      const row2 = tbody.insertRow();
      row2.insertCell().textContent = 'Row 2';

      expect(tbody.rows.length).to.equal(2);

      // Clear rows
      cleartablerows('peopletable');

      // Should have 0 rows (header row is in thead, not tbody)
      expect(tbody.rows.length).to.equal(0);
    });
  });
});
