import { describe, it, expect } from "vitest";
import { formatExampleInputs, formatExampleOutput } from "./formatExample";

describe("formatExampleInputs", () => {
  it("formats single and multiple parameter objects correctly", () => {
    expect(
      formatExampleInputs({ nums: [2, 7, 11, 15], target: 9 })
    ).toBe("nums = [2, 7, 11, 15], target = 9");
  });

  it("quotes string parameters correctly", () => {
    expect(formatExampleInputs({ s: "hello" })).toBe('s = "hello"');
  });

  it("falls back to rawInput if inputs object is empty or null", () => {
    expect(formatExampleInputs(null, "raw fallback")).toBe("raw fallback");
    expect(formatExampleInputs({}, "raw fallback")).toBe("raw fallback");
  });

  it("handles string or primitive inputs directly", () => {
    expect(formatExampleInputs("x = 5")).toBe("x = 5");
    expect(formatExampleInputs(123)).toBe("123");
  });

  it("returns empty string when inputs and rawInput are null/empty", () => {
    expect(formatExampleInputs(null)).toBe("");
    expect(formatExampleInputs(undefined)).toBe("");
  });
});

describe("formatExampleOutput", () => {
  it("quotes strings that are not already quoted", () => {
    expect(formatExampleOutput("olleh")).toBe('"olleh"');
    expect(formatExampleOutput('"olleh"')).toBe('"olleh"');
  });

  it("formats array outputs using formatValue", () => {
    expect(formatExampleOutput([0, 1])).toBe("[0, 1]");
    expect(formatExampleOutput([1, 2])).toBe("[1, 2]");
  });

  it("formats number and boolean outputs", () => {
    expect(formatExampleOutput(42)).toBe("42");
    expect(formatExampleOutput(true)).toBe("true");
  });

  it("handles null and undefined gracefully", () => {
    expect(formatExampleOutput(null)).toBe("");
    expect(formatExampleOutput(undefined)).toBe("");
  });
});
