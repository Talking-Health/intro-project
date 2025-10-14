const seed = require("./seed");
const devPeopleData = require("./data/development-data/people");

seed(devPeopleData)
  .then(() => {
    console.log("Development Database seeded!");
    process.exit(0);
  })
  .catch(console.error);
