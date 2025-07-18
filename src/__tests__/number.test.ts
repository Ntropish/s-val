import { describe, it, expect } from "vitest";
import { s } from "../index.js";
import { ValidationError } from "../types.js";

describe("Number Addon Validators", () => {
  describe("shorthands", () => {
    it("should handle gt", async () => {
      const schema = s.number({ validate: { gt: 5 } });
      await expect(schema.parse(6)).resolves.toBe(6);
      await expect(schema.parse(5)).rejects.toThrow();
    });

    it("should handle gte", async () => {
      const schema = s.number({ validate: { gte: 5 } });
      await expect(schema.parse(5)).resolves.toBe(5);
      await expect(schema.parse(4)).rejects.toThrow();
    });

    it("should handle lt", async () => {
      const schema = s.number({ validate: { lt: 5 } });
      await expect(schema.parse(4)).resolves.toBe(4);
      await expect(schema.parse(5)).rejects.toThrow();
    });

    it("should handle lte", async () => {
      const schema = s.number({ validate: { lte: 5 } });
      await expect(schema.parse(5)).resolves.toBe(5);
      await expect(schema.parse(6)).rejects.toThrow();
    });
  });

  describe("coerce", () => {
    it("should coerce a string to a number", async () => {
      const schema = s.number({ prepare: { coerce: true } });
      await expect(schema.parse("123" as any)).resolves.toBe(123);
    });

    it("should not coerce an invalid string", async () => {
      const schema = s.number({ prepare: { coerce: true } });
      await expect(schema.parse("123a" as any)).rejects.toThrow(
        ValidationError
      );
    });

    it("should not coerce when disabled", async () => {
      const schema = s.number({ prepare: { coerce: false } });
      await expect(schema.parse("123" as any)).rejects.toThrow(ValidationError);
    });
  });

  describe("bigint", () => {
    it("should validate a correct bigint", async () => {
      const schema = s.bigint();
      await expect(schema.parse(BigInt(9007199254740991))).resolves.toBe(
        BigInt(9007199254740991)
      );
    });

    it("should throw for a non-bigint", async () => {
      const schema = s.bigint();
      await expect((schema as any).parse(123)).rejects.toThrow(ValidationError);
    });

    describe("coerce", () => {
      it("should coerce a string to a bigint", async () => {
        const schema = s.bigint({ prepare: { coerce: true } });
        await expect(schema.parse("123" as any)).resolves.toBe(BigInt(123));
      });

      it("should coerce a number to a bigint", async () => {
        const schema = s.bigint({ prepare: { coerce: true } });
        await expect(schema.parse(123 as any)).resolves.toBe(BigInt(123));
      });

      it("should not coerce an invalid string", async () => {
        const schema = s.bigint({ prepare: { coerce: true } });
        await expect(schema.parse("123a" as any)).rejects.toThrow(
          ValidationError
        );
      });

      it("should not coerce when disabled", async () => {
        const schema = s.bigint({ prepare: { coerce: false } });
        await expect(schema.parse("123" as any)).rejects.toThrow(
          ValidationError
        );
      });
    });
  });

  describe("nan", () => {
    it("should validate NaN", async () => {
      const schema = s.nan();
      await expect(schema.parse(NaN)).resolves.toBeNaN();
    });

    it("should throw for a non-NaN value", async () => {
      const schema = s.nan();
      await expect((schema as any).parse(123)).rejects.toThrow(ValidationError);
    });
  });
});
