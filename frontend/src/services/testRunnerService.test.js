import { describe, it, expect, vi, beforeEach } from "vitest";
import { runQuestionTestCases } from "./testRunnerService";
import * as executionApi from "./executionApi";

vi.mock("./executionApi", () => ({
  executeCode: vi.fn(),
}));

describe("testRunnerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleQuestion = {
    id: "two-sum",
    signature: { functionName: "twoSum" },
    sampleInput: "2 7 11 15\n9",
    validator: { type: "exact" },
    testCases: {
      visible: [
        {
          id: 1,
          name: "Case 1",
          rawInput: "2 7 11 15\n9",
          expectedOutput: "[0, 1]",
          inputs: [{ label: "nums", value: "[2,7,11,15]" }],
        },
        {
          id: 2,
          name: "Case 2",
          rawInput: "3 2 4\n6",
          expectedOutput: "[1, 2]",
          inputs: [{ label: "nums", value: "[3,2,4]" }],
        },
      ],
    },
  };

  it("evaluates all visible cases as accepted when all outputs match", async () => {
    vi.mocked(executionApi.executeCode)
      .mockResolvedValueOnce({
        status: "SUCCESS",
        stdout: "[0, 1]",
        executionTimeMs: 12,
        memoryKb: 1024,
      })
      .mockResolvedValueOnce({
        status: "SUCCESS",
        stdout: "[1, 2]",
        executionTimeMs: 14,
        memoryKb: 2048,
      });

    const result = await runQuestionTestCases({
      question: sampleQuestion,
      language: "java",
      sourceCode: "class Solution {}",
      activeLanguageName: "Java",
    });

    expect(result.status).toBe("accepted");
    expect(result.verdict).toBe("ACCEPTED");
    expect(result.passedCount).toBe(2);
    expect(result.totalCount).toBe(2);
    expect(result.executionTime).toBe(26);
    expect(result.memoryKb).toBe(2048);
    expect(result.cases).toHaveLength(2);
    expect(result.cases[0].passed).toBe(true);
    expect(result.cases[1].passed).toBe(true);
  });

  it("marks result as wrong_answer when any visible case fails", async () => {
    vi.mocked(executionApi.executeCode)
      .mockResolvedValueOnce({
        status: "SUCCESS",
        stdout: "[0, 1]",
        executionTimeMs: 10,
        memoryKb: 1024,
      })
      .mockResolvedValueOnce({
        status: "SUCCESS",
        stdout: "[0, 0]",
        executionTimeMs: 10,
        memoryKb: 1024,
      });

    const result = await runQuestionTestCases({
      question: sampleQuestion,
      language: "java",
      sourceCode: "class Solution {}",
      activeLanguageName: "Java",
    });

    expect(result.status).toBe("wrong_answer");
    expect(result.verdict).toBe("WRONG_ANSWER");
    expect(result.passedCount).toBe(1);
    expect(result.totalCount).toBe(2);
  });

  it("bails immediately on compilation error without running subsequent test cases", async () => {
    vi.mocked(executionApi.executeCode).mockResolvedValueOnce({
      status: "ERROR",
      stdout: "",
      compilationOutput: "Syntax error on line 5",
      stderr: "",
      executionTimeMs: 0,
      memoryKb: 0,
    });

    const result = await runQuestionTestCases({
      question: sampleQuestion,
      language: "java",
      sourceCode: "invalid code",
      activeLanguageName: "Java",
    });

    expect(result.status).toBe("error");
    expect(result.errorType).toBe("compilation");
    expect(result.error).toBe("Syntax error on line 5");
    expect(executionApi.executeCode).toHaveBeenCalledTimes(1);
  });

  it("bails immediately on runtime error without running subsequent test cases", async () => {
    vi.mocked(executionApi.executeCode).mockResolvedValueOnce({
      status: "ERROR",
      stdout: "",
      compilationOutput: "",
      stderr: "NullPointerException",
      executionTimeMs: 5,
      memoryKb: 512,
    });

    const result = await runQuestionTestCases({
      question: sampleQuestion,
      language: "java",
      sourceCode: "null access",
      activeLanguageName: "Java",
    });

    expect(result.status).toBe("error");
    expect(result.errorType).toBe("runtime");
    expect(result.error).toBe("NullPointerException");
    expect(executionApi.executeCode).toHaveBeenCalledTimes(1);
  });

  it("executes single custom input when no visible test cases are present", async () => {
    const questionWithoutCases = {
      id: "no-cases",
      signature: { functionName: "solve" },
    };

    vi.mocked(executionApi.executeCode).mockResolvedValueOnce({
      status: "SUCCESS",
      stdout: "custom output",
      compilationOutput: "",
      stderr: "",
      executionTimeMs: 8,
      memoryKb: 1200,
    });

    const result = await runQuestionTestCases({
      question: questionWithoutCases,
      language: "python",
      sourceCode: "print('custom output')",
      customInput: "123",
      activeLanguageName: "Python",
    });

    expect(result.status).toBe("success");
    expect(result.output).toBe("custom output");
    expect(result.input).toBe("123");
    expect(result.executionTime).toBe(8);
  });

  it("catches network or service errors gracefully", async () => {
    vi.mocked(executionApi.executeCode).mockRejectedValueOnce(
      new Error("Network connection lost")
    );

    const result = await runQuestionTestCases({
      question: sampleQuestion,
      language: "java",
      sourceCode: "class Solution {}",
      activeLanguageName: "Java",
    });

    expect(result.status).toBe("error");
    expect(result.error).toBe("Network connection lost");
  });
});
