import { describe, it, expect } from "vitest";
import { formatValue } from "./formatValue";

describe("formatValue", () => {
  it("formats primitive values cleanly", () => {
    expect(formatValue(42)).toBe("42");
    expect(formatValue("hello")).toBe("hello");
    expect(formatValue(true)).toBe("true");
    expect(formatValue(null)).toBe("");
    expect(formatValue(undefined)).toBe("");
  });

  it("formats arrays with a space after commas", () => {
    expect(formatValue([0, 1])).toBe("[0, 1]");
    expect(formatValue([2, 7, 11, 15])).toBe("[2, 7, 11, 15]");
    expect(formatValue([])).toBe("[]");
  });

  it("formats nested arrays with standard spacing", () => {
    expect(formatValue([[1, 2], [3, 4]])).toBe("[[1, 2], [3, 4]]");
  });

  it("formats objects with JSON stringification", () => {
    expect(formatValue({ a: 1 })).toBe('{"a":1}');
  });
});
