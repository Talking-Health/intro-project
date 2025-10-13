/**
 * Tests for public/js/form.js
 * @jest-environment jsdom
 */

const {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows
} = require('./helpers/form-wrapper.js');

describe('Form Utilities', () => {
  beforeEach(() => {
    // Set up a basic DOM structure for testing
    document.body.innerHTML = `
      <div id="content" style="display: block;">Main Content</div>
      <div id="testform" class="container" style="display: none;">
        <form>
          <input type="text" id="testinput" value="" />
          <textarea id="testtextarea"></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
      <table id="testtable">
        <thead>
          <tr>
            <th>Header</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Row 1</td>
          </tr>
          <tr>
            <td>Row 2</td>
          </tr>
        </tbody>
      </table>
    `;
  });

  describe('showform()', () => {
    test('should hide content and show form', () => {
      const content = document.getElementById('content');
      const form = document.getElementById('testform');

      showform('testform');

      expect(content.style.display).toBe('none');
      expect(form.style.display).toBe('block');
    });

    test('should store callback for form submission', () => {
      const mockCallback = jest.fn();
      
      showform('testform', mockCallback);

      // The callback is stored but not called immediately
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('should handle form without callback', () => {
      expect(() => {
        showform('testform');
      }).not.toThrow();
    });
  });

  describe('getformfieldvalue()', () => {
    test('should get input field value', () => {
      const input = document.getElementById('testinput');
      input.value = 'test value';

      const result = getformfieldvalue('testinput');

      expect(result).toBe('test value');
    });

    test('should get textarea value', () => {
      const textarea = document.getElementById('testtextarea');
      textarea.value = 'textarea content';

      const result = getformfieldvalue('testtextarea');

      expect(result).toBe('textarea content');
    });

    test('should return empty string for empty field', () => {
      const result = getformfieldvalue('testinput');

      expect(result).toBe('');
    });
  });

  describe('setformfieldvalue()', () => {
    test('should set input field value', () => {
      setformfieldvalue('testinput', 'new value');

      const input = document.getElementById('testinput');
      expect(input.value).toBe('new value');
    });

    test('should set textarea value', () => {
      setformfieldvalue('testtextarea', 'new textarea content');

      const textarea = document.getElementById('testtextarea');
      expect(textarea.value).toBe('new textarea content');
    });

    test('should overwrite existing value', () => {
      const input = document.getElementById('testinput');
      input.value = 'old value';

      setformfieldvalue('testinput', 'new value');

      expect(input.value).toBe('new value');
    });

    test('should handle empty string', () => {
      setformfieldvalue('testinput', '');

      const input = document.getElementById('testinput');
      expect(input.value).toBe('');
    });
  });

  describe('clearform()', () => {
    test('should clear all input fields in form', () => {
      const input = document.getElementById('testinput');
      input.value = 'test value';

      clearform('testform');

      expect(input.value).toBe('');
    });

    test('should clear all textarea fields in form', () => {
      const textarea = document.getElementById('testtextarea');
      textarea.value = 'test content';

      clearform('testform');

      expect(textarea.value).toBe('');
    });

    test('should clear multiple fields', () => {
      document.getElementById('testinput').value = 'input value';
      document.getElementById('testtextarea').value = 'textarea value';

      clearform('testform');

      expect(document.getElementById('testinput').value).toBe('');
      expect(document.getElementById('testtextarea').value).toBe('');
    });

    test('should handle form with no inputs', () => {
      document.body.innerHTML = `
        <div id="emptyform">
          <p>No inputs here</p>
        </div>
      `;

      expect(() => {
        clearform('emptyform');
      }).not.toThrow();
    });
  });

  describe('gettablebody()', () => {
    test('should return table tbody element', () => {
      const tbody = gettablebody('testtable');

      expect(tbody).not.toBeNull();
      expect(tbody.tagName.toLowerCase()).toBe('tbody');
    });

    test('should return first tbody if multiple exist', () => {
      document.body.innerHTML = `
        <table id="multitable">
          <tbody id="first">
            <tr><td>First</td></tr>
          </tbody>
          <tbody id="second">
            <tr><td>Second</td></tr>
          </tbody>
        </table>
      `;

      const tbody = gettablebody('multitable');

      expect(tbody.id).toBe('first');
    });

    test('should contain table rows', () => {
      const tbody = gettablebody('testtable');
      const rows = tbody.getElementsByTagName('tr');

      expect(rows.length).toBe(2);
    });
  });

  describe('cleartablerows()', () => {
    test('should remove all rows except header', () => {
      const table = document.getElementById('testtable');
      const initialRows = table.getElementsByTagName('tr').length;

      cleartablerows('testtable');

      const remainingRows = table.getElementsByTagName('tr').length;
      expect(remainingRows).toBe(1); // Only header row remains
    });

    test('should preserve header row', () => {
      cleartablerows('testtable');

      const table = document.getElementById('testtable');
      const headerRow = table.getElementsByTagName('tr')[0];
      const headerCell = headerRow.getElementsByTagName('th')[0];

      expect(headerCell.textContent).toBe('Header');
    });

    test('should handle table with only header', () => {
      document.body.innerHTML = `
        <table id="headeronly">
          <tr>
            <th>Header</th>
          </tr>
        </table>
      `;

      expect(() => {
        cleartablerows('headeronly');
      }).not.toThrow();

      const table = document.getElementById('headeronly');
      expect(table.getElementsByTagName('tr').length).toBe(1);
    });

    test('should remove multiple rows', () => {
      document.body.innerHTML = `
        <table id="manyrows">
          <tr><th>Header</th></tr>
          <tr><td>Row 1</td></tr>
          <tr><td>Row 2</td></tr>
          <tr><td>Row 3</td></tr>
          <tr><td>Row 4</td></tr>
          <tr><td>Row 5</td></tr>
        </table>
      `;

      cleartablerows('manyrows');

      const table = document.getElementById('manyrows');
      expect(table.getElementsByTagName('tr').length).toBe(1);
    });
  });
});

