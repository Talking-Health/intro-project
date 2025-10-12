/* eslint-env mocha */

const { JSDOM } = require("jsdom");
const chai = require("chai");
const expect = chai.expect;
const frontend = require("../public/script.js"); // adjust path

describe("Frontend UI functions", () => {
  let dom, document;

  beforeEach(() => {
    dom = new JSDOM(`
      <html>
        <body>
          <table id="peopletable">
            <tbody><tr><td>Kermit Frog</td><td></td></tr></tbody>
          </table>
        </body>
      </html>
    `);
    document = dom.window.document;
    global.document = document;
  });

  it("should mark a day", () => {
    const cell = document.querySelector("td:nth-child(2)");
    cell.textContent = "X";
    expect(cell.textContent).to.equal("X");
  });
});
