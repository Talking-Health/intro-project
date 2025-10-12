// test/frontend.test.js
const { JSDOM } = require("jsdom");
const { expect } = require("chai");

// Suppose your code is in public/script.js which exports some functions
const frontend = require("../public/script.js");  // adjust path

describe("Frontend UI functions", () => {
  let dom, document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <table id="peopletable">
            <thead>
              <tr><th>Name</th><th colspan="7">Schedule</th><th>Action</th></tr>
              <tr class="days">
                <th></th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kermit Frog</td>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                <td><button class="edit-btn">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
  });

  it("should mark a day when edit is called", () => {
    // Example: assume your frontend has a function editPerson(name, dayIndex)
    const result = frontend.editPerson("Kermit Frog", 2);
    expect(result).to.be.true;

    const cell = document.querySelector("#peopletable tbody tr td:nth-child(3)");
    expect(cell.textContent).to.equal("X");
  });

  // You can also simulate button click
  it("clicking edit button triggers edit logic", () => {
    const btn = document.querySelector(".edit-btn");
    // pretend the button has an event listener attached in script.js
    btn.click();
    // Now assert table contents changed as expected
    const cell = document.querySelector("#peopletable tbody tr td:nth-child(2)");
    expect(cell.textContent).to.equal("X"); // or whatever the logic should do
  });
});
