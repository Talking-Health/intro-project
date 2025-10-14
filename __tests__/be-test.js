const request = require("supertest");
const http = require("http");
const server = require("../../index.js");
const seed = require("../../db/seed");
const testPeopleData = require("../../db/data/test-data/people");

beforeEach(async () => {
  await seed(testPeopleData);
});

after(() => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

console.log("hello world");
