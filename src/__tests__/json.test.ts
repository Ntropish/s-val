import { describe, it, expect } from "vitest";
import { s } from "../index.js";
import { ValidationError } from "../types.js";

describe("json validator", () => {
  it("should validate a string containing JSON that matches the schema", async () => {
    const schema = s.string({
      validate: {
        json: s.object({
          validate: {
            properties: {
              name: s.string(),
              age: s.number(),
            },
          },
        }),
      },
    });

    const data = JSON.stringify({ name: "John Doe", age: 30 });
    await expect(schema.parse(data)).resolves.toBe(data);
  });

  it("should throw an error for a string containing JSON that does not match the schema", async () => {
    const schema = s.string({
      validate: {
        json: s.object({
          validate: {
            properties: {
              name: s.string(),
              age: s.number(),
            },
          },
        }),
      },
    });

    const data = JSON.stringify({ name: "John Doe", age: "30" }); // age is a string
    await expect(schema.parse(data)).rejects.toThrow(ValidationError);
  });

  it("should throw an error for a string that is not valid JSON", async () => {
    const schema = s.string({
      validate: {
        json: s.object({
          validate: {
            properties: {
              name: s.string(),
            },
          },
        }),
      },
    });

    const data = "not a json string";
    await expect(schema.parse(data)).rejects.toThrow(ValidationError);
  });

  it("should throw an error if the value is not a string", async () => {
    const schema = s.string({
      validate: {
        json: s.object({
          validate: {
            properties: {
              name: s.string(),
            },
          },
        }),
      },
    });

    const data = 123;
    await expect(schema.parse(data as any)).rejects.toThrow(ValidationError);
  });

  it("should handle nested JSON schemas", async () => {
    const schema = s.string({
      validate: {
        json: s.object({
          validate: {
            properties: {
              data: s.array(s.number()),
            },
          },
        }),
      },
    });
    const validJson = JSON.stringify({
      data: [1, 2, 3],
    });
    const invalidJson = JSON.stringify({
      data: [1, "2", 3],
    });
    await expect(schema.parse(validJson)).resolves.toEqual(validJson);
    await expect(schema.parse(invalidJson)).rejects.toThrow();
  });
});
