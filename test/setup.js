// Global test setup
const { JSDOM } = require('jsdom');

// Set up basic DOM environment for all tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

// Make DOM available globally for frontend tests
if (typeof global.window === 'undefined') {
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
}

// Add fetch polyfill for Node.js environment
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch');
}
