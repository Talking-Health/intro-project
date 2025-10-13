/**
 * Tests for public/js/dom.js
 * @jest-environment jsdom
 */

const { findancestorbyclass, findancestorbytype } = require('./helpers/dom-wrapper.js');

describe('DOM Utilities', () => {
  describe('findancestorbyclass()', () => {
    beforeEach(() => {
      // Set up a DOM structure for testing
      document.body.innerHTML = `
        <div class="grandparent">
          <div class="parent">
            <div class="child">
              <span id="target">Target Element</span>
            </div>
          </div>
        </div>
      `;
    });

    test('should find ancestor by class name', () => {
      const target = document.getElementById('target');
      const parent = findancestorbyclass(target, 'parent');
      
      expect(parent).not.toBeNull();
      expect(parent.classList.contains('parent')).toBe(true);
    });

    test('should find grandparent by class name', () => {
      const target = document.getElementById('target');
      const grandparent = findancestorbyclass(target, 'grandparent');
      
      expect(grandparent).not.toBeNull();
      expect(grandparent.classList.contains('grandparent')).toBe(true);
    });

    test('should return null if class not found', () => {
      const target = document.getElementById('target');
      const result = findancestorbyclass(target, 'nonexistent');
      
      expect(result).toBeNull();
    });

    test('should return the element itself if it has the class', () => {
      const target = document.querySelector('.child');
      const result = findancestorbyclass(target, 'child');
      
      expect(result).toBe(target);
    });

    test('should handle null element', () => {
      const result = findancestorbyclass(null, 'parent');
      expect(result).toBeNull();
    });
  });

  describe('findancestorbytype()', () => {
    beforeEach(() => {
      // Set up a DOM structure for testing
      document.body.innerHTML = `
        <table>
          <tbody>
            <tr>
              <td>
                <button id="target">Click me</button>
              </td>
            </tr>
          </tbody>
        </table>
      `;
    });

    test('should find ancestor by tag type (lowercase)', () => {
      const target = document.getElementById('target');
      const td = findancestorbytype(target, 'td');
      
      expect(td).not.toBeNull();
      expect(td.tagName.toLowerCase()).toBe('td');
    });

    test('should find ancestor by tag type (uppercase)', () => {
      const target = document.getElementById('target');
      const td = findancestorbytype(target, 'TD');
      
      expect(td).not.toBeNull();
      expect(td.tagName.toLowerCase()).toBe('td');
    });

    test('should find table row ancestor', () => {
      const target = document.getElementById('target');
      const tr = findancestorbytype(target, 'tr');
      
      expect(tr).not.toBeNull();
      expect(tr.tagName.toLowerCase()).toBe('tr');
    });

    test('should find table ancestor', () => {
      const target = document.getElementById('target');
      const table = findancestorbytype(target, 'table');
      
      expect(table).not.toBeNull();
      expect(table.tagName.toLowerCase()).toBe('table');
    });

    test('should return null if type not found', () => {
      const target = document.getElementById('target');
      const result = findancestorbytype(target, 'form');
      
      expect(result).toBeNull();
    });

    test('should return the element itself if it matches the type', () => {
      const target = document.getElementById('target');
      const result = findancestorbytype(target, 'button');
      
      expect(result).toBe(target);
    });

    test('should handle null element', () => {
      const result = findancestorbytype(null, 'div');
      expect(result).toBeNull();
    });

    test('should be case-insensitive', () => {
      const target = document.getElementById('target');
      const tdLower = findancestorbytype(target, 'td');
      const tdUpper = findancestorbytype(target, 'TD');
      const tdMixed = findancestorbytype(target, 'Td');
      
      expect(tdLower).toBe(tdUpper);
      expect(tdLower).toBe(tdMixed);
    });
  });
});

