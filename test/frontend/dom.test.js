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

// Import the DOM module after setting up the environment
const {
  findancestorbyclass,
  findancestorbytype,
} = require('../../public/js/dom.js');

describe('DOM Module', () => {
  beforeEach(() => {
    // Reset DOM for each test
    document.body.innerHTML = html;
  });

  describe('findancestorbyclass()', () => {
    it('should find ancestor element by class name', () => {
      // Create a nested structure
      const container = document.createElement('div');
      container.className = 'test-container';

      const child = document.createElement('div');
      const grandchild = document.createElement('span');
      grandchild.textContent = 'test';

      child.appendChild(grandchild);
      container.appendChild(child);
      document.body.appendChild(container);

      const result = findancestorbyclass(grandchild, 'test-container');
      expect(result).to.equal(container);
    });

    it('should return null if no ancestor with class is found', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const result = findancestorbyclass(element, 'non-existent-class');
      expect(result).to.be.null;
    });

    it('should return the element itself if it has the class', () => {
      const element = document.createElement('div');
      element.className = 'test-class';
      document.body.appendChild(element);

      const result = findancestorbyclass(element, 'test-class');
      expect(result).to.equal(element);
    });
  });

  describe('findancestorbytype()', () => {
    it('should find ancestor element by tag name', () => {
      // Create a nested structure
      const table = document.createElement('table');
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      const span = document.createElement('span');

      td.appendChild(span);
      tr.appendChild(td);
      table.appendChild(tr);
      document.body.appendChild(table);

      const result = findancestorbytype(span, 'tr');
      expect(result).to.equal(tr);
    });

    it('should be case insensitive', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      div.appendChild(span);
      document.body.appendChild(div);

      const result = findancestorbytype(span, 'DIV');
      expect(result).to.equal(div);
    });

    it('should return null if no ancestor with tag is found', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const result = findancestorbytype(element, 'table');
      expect(result).to.be.null;
    });

    it('should return the element itself if it matches the tag', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const result = findancestorbytype(element, 'div');
      expect(result).to.equal(element);
    });
  });
});
