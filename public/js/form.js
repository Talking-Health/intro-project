let formSubmitCallback

document.addEventListener( "DOMContentLoaded", () => {
  const closeElements = document.querySelectorAll( ".close" )
  closeElements.forEach( ( element ) => {
    element.addEventListener( "click", ( event ) => {
      event.preventDefault()
      closeAllForms()
    } )
  } )

  const formElements = document.querySelectorAll( "form" )
  formElements.forEach( ( element ) => {
    element.addEventListener( "submit", ( event ) => {
      event.preventDefault()

      document.getElementById( "content" ).style.display = "block"
      // @ts-ignore (it is part of HTML Element)
      element.parentNode.style.display = "none"

      if( formSubmitCallback ) {
        formSubmitCallback()
      }
    } )
  } )
} )

/**
 * Hide all divs with class container and show main content
 */
function closeAllForms() {
  document.querySelectorAll( "div.container" ).forEach( ( element ) => {
    // @ts-ignore
    element.style.display = "none"
  } )
  document.getElementById( "content" ).style.display = "block"
}

/**
 * Show form by id name
 * @param { string } formId
 * @param { () => void } onSubmit
 */
export function showform( formId, onSubmit ) {
  document.getElementById( "content" ).style.display = "none"

  const form = document.getElementById( formId )
  form.style.display = "block"

  formSubmitCallback = onSubmit
}

/**
 * @param { string } formItemId
 * @returns { string }
 */
export function getformfieldvalue( formItemId ) {
  // @ts-ignore (it does!)
  return document.getElementById( formItemId ).value
}

/**
 * @param { string } formItemId
 * @param { string } value
 */
export function setformfieldvalue( formItemId, value ) {
  // @ts-ignore (it does!)
  document.getElementById( formItemId ).value = value
}

/**
 * @param { string } formId
 */
export function clearform( formId ) {
  const form = document.getElementById( formId )

  form.querySelectorAll( "input" ).forEach( ( input ) => {
    input.value = ""
  } )
  form.querySelectorAll( "textarea" ).forEach( ( input ) => {
    input.value = ""
  } )
}

/**
 * @param { string } formId
 * @returns { HTMLTableSectionElement }
 */
export function gettablebody( formId ) {
  return document.getElementById( formId ).getElementsByTagName( "tbody" )[ 0 ]
}

/**
 * @param { string } formId
 */
export function cleartablerows( formId ) {
  const table = document.getElementById( formId )

  const rows = table.getElementsByTagName( "tr" )
  for( let index = rows.length - 1; 0 < index; index-- ) {
    // @ts-ignore
    table.deleteRow( index )
  }
}
