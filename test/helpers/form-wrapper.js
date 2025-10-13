/**
 * Wrapper to test form utility functions
 * Replicates the logic from public/js/form.js for testing
 */

let formsubmitcallback;

/**
 * Show form by id name
 * @param { string } formid 
 * @param { function } onsubmit
 */
function showform( formid, onsubmit ) {
  document.getElementById( "content" ).style.display = "none"

  const form = document.getElementById( formid )
  form.style.display = "block"

  formsubmitcallback = onsubmit
}

/**
 * Get form field value
 * @param { string } formitemid 
 * @returns { string }
 */
function getformfieldvalue( formitemid ) {
  return document.getElementById( formitemid ).value
}

/**
 * Set form field value
 * @param { string } formitemid
 * @param { string } value
 */
function setformfieldvalue( formitemid, value ) {
  document.getElementById( formitemid ).value = value
}

/**
 * Clear all inputs and textareas in a form
 * @param { string } formid 
 */
function clearform( formid ) {
  const form = document.getElementById( formid )

  form.querySelectorAll( "input" ).forEach( ( input ) => input.value = "" )
  form.querySelectorAll( "textarea" ).forEach( ( input ) => input.value = "" )
}

/**
 * Get table body element
 * @param { string } formid
 * @returns { HTMLTableSectionElement }
 */
function gettablebody( formid ) {
  return document.getElementById( formid ).getElementsByTagName( "tbody" )[ 0 ]
}

/**
 * Clear all table rows except header
 * @param { string } formid 
 */
function cleartablerows( formid ) {
  const table = document.getElementById( formid )

  const rows = table.getElementsByTagName( "tr" )
  for( let i = rows.length - 1; i > 0; i-- ) {
    table.deleteRow( i )
  }
}

module.exports = {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows
};

