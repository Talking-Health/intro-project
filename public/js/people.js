

import { getdata, putdata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"

document.addEventListener( "DOMContentLoaded", async function() {

  document.getElementById( "addperson" ).addEventListener( "click", addpersoninput )
  await gopeople()
} )

let editingPersonId = null


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
  editingPersonId = null
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
  const p = personrow.person
  editingPersonId = p.id

  // prefill all fields
  setformfieldvalue( "personform-name",  p.name  ?? "" )
  setformfieldvalue( "personform-email", p.email ?? "" )
  setformfieldvalue( "personform-notes", p.notes ?? "" )

  // submit updates, refresh table, exit edit mode
  showform( "personform", async () => {
    await updateperson(
      editingPersonId,
      getformfieldvalue( "personform-name" ),
      getformfieldvalue( "personform-email" ),
      getformfieldvalue( "personform-notes" )
   )
   editingPersonId = null
    await gopeople()
 } )

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

  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editperson )

  cells[ 8 ].appendChild( editbutton )
}
