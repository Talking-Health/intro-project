/**
 * Find the closest ancestor with a matching class name.
 * @param { Element } element
 * @param { string } className
 * @returns { Element | null }
 */
export function findancestorbyclass( element, className ) {
  let currentElement = element

  while( currentElement && !currentElement.classList.contains( className ) ) {
    currentElement = currentElement.parentNode
  }

  return currentElement
}

/**
 * Find the closest ancestor with a matching node type.
 * @param { Element } element
 * @param { string } type
 * @returns { Element | null }
 */
export function findancestorbytype( element, type ) {
  let currentElement = element
  const lowerType = type.toLowerCase()

  while( currentElement && currentElement.tagName && currentElement.tagName.toLowerCase() !== lowerType ) {
    currentElement = currentElement.parentNode
  }

  return currentElement
}
