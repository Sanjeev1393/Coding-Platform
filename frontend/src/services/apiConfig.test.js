import { describe, it, expect } from "vitest";
import { API_BASE_URL, getApiUrl } from "./apiConfig";

describe("apiConfig", () => {
  it("defaults API_BASE_URL to empty string in test environment", () => {
    expect(API_BASE_URL).toBe("");
  });

  it("normalizes paths starting with a forward slash", () => {
    expect(getApiUrl("/api/v1/executions")).toBe("/api/v1/executions");
  });

  it("adds leading slash if missing from path", () => {
    expect(getApiUrl("api/v1/executions")).toBe("/api/v1/executions");
  });
});
