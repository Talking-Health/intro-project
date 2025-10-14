const db = require("../db/connection");
const server = require("../index.js");
const http = require("http");
const request = require("supertest");
const seed = require("../db/seed");

const testPeopleData = require("../db/data/test-data/people");

beforeEach(() => {
  return seed(testPeopleData);
});

afterAll(() => {
  db.close();
});

describe("1. GET/ People", () => {
  test("200-responds with an array of people", () => {
    return request(server)
      .get("/api/people")
      .expect(200)
      .then(({ body }) => {
        expect(body.length).toBe(2);
        body.forEach((person) => {
          expect(person).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            email: expect.any(String),
            notes: expect.any(String),
          });
        });
      });
  });
});

describe(" PUT /api/people", () => {
  test("200: Responds with the added person object", () => {
    const putObj = {
      name: "Gonzo",
      email: "gonzo@hotmail.com",
      notes: "loves the stage",
    };

    return request(server)
      .put("/api/people")
      .send(putObj)
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          id: expect.any(Number),
          name: "Gonzo",
          email: "gonzo@hotmail.com",
          notes: "loves the stage",
        });
      });
  });
});

describe("PATCH /api/people/:id", () => {
  test("200: Updates an existing person", () => {
    const updatedObj = {
      name: "Walter",
      email: "walter@email.com",
      notes: "updated notes",
    };

    return request(server)
      .patch("/api/people/1")
      .send(updatedObj)
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          id: 1,
          name: "Walter",
          email: "walter@email.com",
          notes: "updated notes",
        });
      });
  });
});
