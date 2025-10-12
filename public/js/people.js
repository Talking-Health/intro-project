

import { getdata, putdata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"

document.addEventListener( "DOMContentLoaded", async function() {

  document.getElementById( "addperson" ).addEventListener( "click", addpersoninput )
  await gopeople()
} )


/**
 * 
 * @returns { Promise< object > }
 */
async function fetchpeople() {
  return await getdata( "people" )
}

/**
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addperson( name, email, notes ) {
  await putdata( "people", { name, email, notes } )
}

/**
 * 
 * @param { string } id 
 * @param { string } name 
 * @param { string } email 
 * @param { string } notes 
 */
async function updateperson( id, name, email, notes ) {
  await putdata( "people", { id, name, email, notes } )
}



/**
 * @returns { Promise }
 */
async function gopeople() {
  const p = await fetchpeople()
  cleartablerows( "peopletable" )

  for( const pi in p ) {
    addpersondom( p[ pi ] )
  }
}

/**
 * 
 */
function addpersoninput() {

  clearform( "personform" )
  showform( "personform", async () => {

    await addperson( getformfieldvalue( "personform-name" ), 
                      getformfieldvalue( "personform-email" ), 
                      getformfieldvalue( "personform-notes" ) )
    await gopeople()
  } )
}

/**
 * 
 */
function editperson( ev ) {

  clearform( "personform" )
  const personrow = findancestorbytype( ev.target, "tr" )
  setformfieldvalue( "personform-name", personrow.person.name )
  setformfieldvalue( "personform-email", personrow.person.email )
  setformfieldvalue( "personform-notes", personrow.person.notes )

  showform( "personform", async () => {
    
    await updateperson(
      personrow.person.id,
      getformfieldvalue("personform-name"),
      getformfieldvalue("personform-email"),
      getformfieldvalue("personform-notes")
    )
    await gopeople()
  })

}

/**
 * 
 * @param { object } person
 */
export function addpersondom( person ) {

  const table = gettablebody( "peopletable" )
  const newrow = table.insertRow()

  const cells = []
  for( let i = 0; i < ( 2 + 7 ); i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // @ts-ignore
  newrow.person = person
  cells[ 0 ].innerText = person.name
  cells[ 1 ].innerText = person.email
  cells[ 2 ].innerText = person.notes

  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editperson )

  cells[ 8 ].appendChild( editbutton )
}
