/**
 * Wrapper to test DOM utility functions
 * Since the original files use ES modules, we need to test the logic directly
 */

/**
 * Find ancestor element by class name
 * @param { object } element 
 * @param { string } className 
 * @returns { object | null }
 */
function findancestorbyclass( element, className ) {
  let currentElement = element

  while( currentElement && currentElement.classList && !currentElement.classList.contains( className ) ) {
    currentElement = currentElement.parentNode
  }

  return currentElement && currentElement.classList && currentElement.classList.contains( className ) ? currentElement : null;
}

/**
 * Find ancestor element by tag type
 * @param { object } element 
 * @param { string } type 
 * @returns { object | null }
 */
function findancestorbytype( element, type ) {
  let currentElement = element
  const lowertype = type.toLowerCase()
  while ( currentElement && currentElement.tagName && currentElement.tagName.toLowerCase() !== lowertype ) {
      currentElement = currentElement.parentNode
  }

  return currentElement && currentElement.tagName && currentElement.tagName.toLowerCase() === lowertype ? currentElement : null;
}

module.exports = {
  findancestorbyclass,
  findancestorbytype
};

