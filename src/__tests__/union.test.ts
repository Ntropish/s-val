import { describe, it, expect } from "vitest";
import { s } from "../index.js";
import { ValidationError } from "../types.js";

describe("Union Validator", () => {
  it("should pass if the value matches one of the schemas", async () => {
    const schema = s.union({ validate: { of: [s.string(), s.number()] } });
    await expect(schema.parse("hello")).resolves.toBe("hello");
    await expect(schema.parse(123)).resolves.toBe(123);
  });

  it("should throw if the value does not match any of the schemas", async () => {
    const schema = s.union({ validate: { of: [s.string(), s.number()] } });
    await expect(schema.parse(true)).rejects.toThrow(ValidationError);
  });

  it("should pass with more complex schemas", async () => {
    const schema = s.union({
      validate: {
        of: [
          s.string({ validate: { minLength: 5 } }),
          s.number({ validate: { gte: 100 } }),
        ],
      },
    });

    await expect(schema.parse("long enough")).resolves.toBe("long enough");
    await expect(schema.parse(150)).resolves.toBe(150);
  });

  it("should throw with more complex schemas if validation fails", async () => {
    const schema = s.union({
      validate: {
        of: [
          s.string({ validate: { minLength: 5 } }),
          s.number({ validate: { gte: 100 } }),
        ],
      },
    });
    const result = await schema.safeParse("shrt");
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error.issues).toHaveLength(2); // one for string, one for number
    }
  });

  it("should work with object schemas", async () => {
    const schema = s.union({
      validate: {
        of: [
          s.object({
            validate: {
              properties: {
                type: s.literal("a"),
                a: s.string(),
              },
            },
          }),
          s.object({
            validate: {
              properties: {
                type: s.literal("b"),
                b: s.number(),
              },
            },
          }),
        ],
      },
    });

    const dataA = { type: "a" as const, a: "hello" };
    const dataB = { type: "b" as const, b: 123 };
    const invalidData = { type: "a", a: 123 };

    await expect(schema.parse(dataA)).resolves.toEqual(dataA);
    await expect(schema.parse(dataB)).resolves.toEqual(dataB);
    await expect(schema.parse(invalidData)).rejects.toThrow(ValidationError);
  });

  it("should use a custom error message for the union", async () => {
    const customMessage = "The value must be a string or a number.";
    const schema = s.union({
      validate: {
        of: [s.string(), s.number()],
        custom: [
          {
            name: "union_level_check",
            validator: () => false, // Always fail to trigger the message
          },
        ],
      },
      messages: {
        union_level_check: customMessage,
      },
    });
    const result = await schema.safeParse(true);
    expect(result.status).toBe("error");
    if (result.status === "error") {
      // The custom message for the union itself is the first issue
      expect(result.error.issues[0].message).toBe(customMessage);
    }
  });

  it("should apply preparations at the union level", async () => {
    const schema = s.union({
      validate: { of: [s.number(), s.boolean()] },
      prepare: {
        custom: [
          (value) => {
            if (typeof value === "string" && !isNaN(Number(value))) {
              return Number(value);
            }
            return value;
          },
        ],
      },
    });
    await expect(schema.parse("123")).resolves.toBe(123);
    await expect(schema.parse(true)).resolves.toBe(true);
  });

  it("should apply transformations at the union level", async () => {
    const schema = s.union({
      validate: { of: [s.string(), s.number()] },
      transform: {
        custom: [(value) => ({ data: value })],
      },
    });
    await expect(schema.parse("hello")).resolves.toEqual({ data: "hello" });
    await expect(schema.parse(123)).resolves.toEqual({ data: 123 });
  });
});
