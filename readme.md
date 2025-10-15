

# Example starter project

## Running

This is a complete Node application. It can be run from the command line or within a Docker container:

```
node ./index.js
```

Then point a browser to `http://localhost:3000`

## Fork

Please fork this repo before you start work. When you have completed your project we would like you to present your work.

## Tasks

Some tasks - choose as many or as few as you would like to complete.

1. Add some tests - a test suite such as Mocha will require adding. The Node backend functions require testing as well as front end functions. √√√
2. The person table needs to be completed - at the very least complete the edit function. √√√
3. Convert the backend to use a non-volatile data store - a simple option would be to build in support for SQLite to save data to a database. √√√
4. We need to add further elements - Landlords and Buildings. Buildings require Rooms. √√√
5. Consider the UI - can it be improved - what would you suggest? √√√

## Gotchas

1. Style matters.
2. ESlint and Javascript checking are enabled in this project for VScode - keep an eye on this (you can check for linting errors by running ``` npx eslint index.js ``` ).
3. Show us your git etiquette.


Action Notes:

Method: VS Code was used as the IDE. The Augment coding agent extension was used to generate much of the code (see docs folder for details) under developer oversight for the requirements of the tasks within the project. Some manual coding was also carried out where needed.

Tasks Carried Out:

1. The Jest testing framework was installed and integrated into the project in order to implement unit tests for backend and frontend functions. The tests are located in the test folder. The test coverage report can be found in the coverage folder. All tests are passing - Test Suites: 8 passed, 8 total - Tests: 102 passed, 102 total - Code coverage stands at 98.56%.

2. The People table in the UI was completed by adding the email, notes, and schedule columns. These were also added to the API and database accordingly. Email, notes, and schedule data are now saved to the database from the form in the UI. Delete functionality was also added to the People table. The delete functionality is detailed in the docs/DELETE_API_IMPLEMENTATION.md file.

3. An SQLite database was implemented to replace the in-memory storage. The database schema is defined in the lib/database.js file. The database is initialized when the server starts and is closed when the server exits. The database is also reset before each test to ensure a clean slate for testing. The database implementation is detailed in the docs/SQLITE_IMPLEMENTATION.md file. The version is better-sqlite3@12.4.1.

4. A new Rooms UI table was added with columns for Property Name, Address, Type, Price, Available From, Status, Landlord Contact, and Notes. These were also added to the API and database accordingly. An added Rooms UI form now saves the data through the API into the database. A workflow context needed to be imagined for this app (in the absence of one that I could see) so the workflow could be:

Landlord adds a room to the Rooms table
Prospective tenant (Person) sets their availability schedule
Landlord views available people and contacts them via email
Person and landlord arrange viewing based on person's schedule
Room status updates to "Pending" or "Rented" when occupied

5. The UI was stylisically improved by adding responsive design to make the app more user-friendly on different screen widths. The responsive design is detailed in the docs/RESPONSIVE_DESIGN.md file. A delete button had also been added to the Actions column for both UI tables. Some general spacing was also carried out to improve readability in the layout. Finally a subtle background gradient was added to the page to improve the visual aspect.

Finally, the linting test was repeately carried out (using npx eslint index.js) until all errors were resolved.


All the work will have been carried out through 4 commits up to the fork repository.
