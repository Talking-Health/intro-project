import { getdata, putdata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"

document.addEventListener( "DOMContentLoaded", async () => {
  document.getElementById( "addperson" ).addEventListener( "click", addpersoninput )
  await gopeople()
} )

/**
 * @returns { Promise< Array< object > > }
 */
async function fetchpeople() {
  return getdata( "people" )
}

/**
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< void > }
 */
async function addperson( name, email, notes ) {
  await putdata( "people", { name, email, notes } )
}

/**
 * @returns { Promise< void > }
 */
async function gopeople() {
  const people = await fetchpeople()
  cleartablerows( "peopletable" )

  people.forEach( ( person ) => {
    addpersondom( person )
  } )
}

function addpersoninput() {
  clearform( "personform" )
  showform( "personform", async () => {
    await addperson(
      getformfieldvalue( "personform-name" ),
      getformfieldvalue( "personform-email" ),
      getformfieldvalue( "personform-notes" ),
    )
    await gopeople()
  } )
}

function editperson( event ) {
  clearform( "personform" )
  const personRow = findancestorbytype( event.target, "tr" )
  setformfieldvalue( "personform-name", personRow.person.name )

  showform( "personform", () => {
    // TODO: Hook up updating logic
    console.log( "submitted peopleform" )
  } )
}

/**
 * @param { object } person
 */
export function addpersondom( person ) {
  const table = gettablebody( "peopletable" )
  const newRow = table.insertRow()

  const cells = []
  for( let index = 0; 9 > index; index++ ) {
    cells.push( newRow.insertCell( index ) )
  }

  // @ts-ignore
  newRow.person = person
  cells[ 0 ].innerText = person.name

  const editButton = document.createElement( "button" )
  editButton.textContent = "Edit"
  editButton.addEventListener( "click", editperson )

  cells[ 8 ].appendChild( editButton )
}
