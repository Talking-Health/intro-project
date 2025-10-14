const { get, add } = require("../lib/people");

describe("People API functions", () => {
  describe("function 'get()'", () => {
    test("function returns an array of people", async () => {
      const result = await get();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).not.toBe(0);
    });
    test("function returns a person object with correct properties", async () => {
      const result = await get();
      const person = result[0];
      expect(person).toHaveProperty("id");
      expect(person).toHaveProperty("name");
      expect(person).toHaveProperty("email");
      expect(person).toHaveProperty("notes");
    });

    describe("function 'add()'", () => {
      test("adds a new person with correct properties, including id", async () => {
        const newPerson = {
          name: "User Test",
          email: "user@email.com",
          notes: "Notes Test",
        };

        const result = await add(null, "PUT", newPerson);
        expect(result).toHaveProperty("id");
        expect(result.name).toBe("User Test");
        expect(result.email).toBe("user@email.com");
        expect(result.notes).toBe("Notes Test");
      });
      test("updates existing person correctly if id is provided", async () => {
        const updatedPerson = {
          id: 1,
          name: "Kermit updated",
          email: "kermit@updated.com",
          notes: "Updated notes",
        };
        const result = await add(null, "PUT", updatedPerson);
        expect(result.id).toBe(1);
        expect(result.name).toBe("Kermit updated");
        expect(result.email).toBe("kermit@updated.com");
        expect(result.notes).toBe("Updated notes");
      });
    });
  });
});
