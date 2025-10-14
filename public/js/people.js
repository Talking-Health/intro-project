import { getdata, putdata, patchdata } from "./api.js";
import {
  showform,
  getformfieldvalue,
  setformfieldvalue,
  clearform,
  gettablebody,
  cleartablerows,
} from "./form.js";
import { findancestorbytype } from "./dom.js";

document.addEventListener("DOMContentLoaded", async function () {
  document
    .getElementById("addperson")
    .addEventListener("click", addpersoninput);
  await gopeople();
});

/**
 *
 * @returns { Promise< object > }
 */
async function fetchpeople() {
  return await getdata("people");
}

/**
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addperson(name, email, notes) {
  await putdata("people", { name, email, notes });
}

/**
 *
 * @param { string } id
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 */
async function updateperson(id, name, email, notes) {
  await patchdata("people", { id, name, email, notes });
}

/**
 * @returns { Promise }
 */
async function gopeople() {
  const p = await fetchpeople();
  cleartablerows("peopletable");

  for (const pi in p) {
    addpersondom(p[pi]);
  }
}

/**
 *
 */
function addpersoninput() {
  clearform("personform");
  showform("personform", async () => {
    await addperson(
      getformfieldvalue("personform-name"),
      getformfieldvalue("personform-email"),
      getformfieldvalue("personform-notes")
    );
    await gopeople();
  });
}

/**
 *
 */
function editperson(ev) {
  clearform("personform");

  const personrow = findancestorbytype(ev.target, "tr");
  const person = personrow.person;

  setformfieldvalue("personform-name", person.name);
  setformfieldvalue("personform-email", person.email);
  setformfieldvalue("personform-notes", person.notes);

  setformfieldvalue("personform-id", person.id);

  showform("personform", async () => {
    await updateperson(
      getformfieldvalue("personform-id"),
      getformfieldvalue("personform-name"),
      getformfieldvalue("personform-email"),
      getformfieldvalue("personform-notes")
    );
    await gopeople();
  });
}

/**
 *
 * @param { object } person
 */
export function addpersondom(person) {
  const table = gettablebody("peopletable");
  const newrow = table.insertRow();

  const cells = [];
  for (let i = 0; i < 9; i++) {
    cells.push(newrow.insertCell(i));
  }

  // @ts-ignore
  newrow.person = person;

  // Name column
  cells[0].innerText = person.name;

  // Schedule columns (7 days)
  for (let day = 1; day <= 7; day++) {
    const cell = cells[day];
    cell.classList.add("editable-day");

    // If this person already has a task set for this day, show it
    if (person.schedule && person.schedule[day]) {
      cell.textContent = person.schedule[day];
    }

    cell.addEventListener("click", () => {
      showform("workflowform");
    });
  }

  // Edit button
  const editbutton = document.createElement("button");
  editbutton.textContent = "Edit";
  editbutton.addEventListener("click", editperson);
  cells[8].appendChild(editbutton);
}
