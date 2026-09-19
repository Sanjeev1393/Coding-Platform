import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchQuestions } from "./questionApi";

describe("questionApi.fetchQuestions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns questions array from the server on successful 200 response", async () => {
    const mockQuestions = [
      { id: "q-1", title: "Question 1" },
      { id: "q-2", title: "Question 2" },
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockQuestions,
    });

    const result = await fetchQuestions();
    expect(result).toEqual(mockQuestions);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/v1/questions");
  });

  it("returns empty array when the server responds with an error status", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await fetchQuestions();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("returns empty array when fetch throws network error", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network Error"));

    const result = await fetchQuestions();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("returns empty array if response data is empty or invalid", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const result = await fetchQuestions();
    expect(result).toEqual([]);
  });
});
