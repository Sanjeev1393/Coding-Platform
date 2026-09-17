import { describe, test, expect } from "vitest";
import { validateResult } from "./resultValidator";

describe("validateResult", () => {
  describe("exact validation", () => {
    test("matches identical primitives", () => {
      expect(validateResult(42, 42, "exact")).toBe(true);
      expect(validateResult("hello", "hello", "exact")).toBe(true);
      expect(validateResult(true, true, "exact")).toBe(true);
    });

    test("matches serialized and parsed objects/arrays", () => {
      expect(validateResult("[0, 1]", [0, 1], "exact")).toBe(true);
      expect(validateResult([0, 1], "[0, 1]", "exact")).toBe(true);
      expect(validateResult('{"a":1}', { a: 1 }, "exact")).toBe(true);
    });

    test("fails on mismatched values", () => {
      expect(validateResult("[0, 1]", [1, 2], "exact")).toBe(false);
      expect(validateResult("abc", "def", "exact")).toBe(false);
    });
  });

  describe("unordered_array validation", () => {
    test("matches arrays regardless of element order", () => {
      expect(validateResult([0, 1], [1, 0], "unordered_array")).toBe(true);
      expect(validateResult("[1, 0]", [0, 1], "unordered_array")).toBe(true);
      expect(validateResult(["b", "a"], ["a", "b"], "unordered_array")).toBe(true);
    });

    test("fails when arrays have different lengths or distinct elements", () => {
      expect(validateResult([0, 1], [0, 1, 2], "unordered_array")).toBe(false);
      expect(validateResult([1, 2], [1, 3], "unordered_array")).toBe(false);
    });

    test("fails when either operand is not an array", () => {
      expect(validateResult("not-an-array", [1, 2], "unordered_array")).toBe(false);
    });
  });

  describe("floating_point validation", () => {
    test("matches numbers within epsilon tolerance", () => {
      expect(validateResult(3.1415926, 3.14159, "floating_point")).toBe(true);
      expect(validateResult("0.30000000000000004", 0.3, "floating_point")).toBe(true);
    });

    test("fails when discrepancy exceeds tolerance", () => {
      expect(validateResult(3.14, 3.15, "floating_point")).toBe(false);
    });
  });
});
