import {
  getLanguageExtension,
  getStarterCode,
  buildQuestionLanguageKey,
  generateSignatureStub,
  resolveType,
} from "./languageUtils";

describe("languageUtils", () => {
  describe("getLanguageExtension", () => {
    test("returns correct extension for supported languages", () => {
      expect(getLanguageExtension("java")).toBe("java");
      expect(getLanguageExtension("javascript")).toBe("js");
      expect(getLanguageExtension("python")).toBe("py");
    });

    test("falls back to languageId if language is unknown", () => {
      expect(getLanguageExtension("cpp")).toBe("cpp");
    });
  });

  describe("resolveType", () => {
    test("resolves generic types across supported languages", () => {
      expect(resolveType("int[]", "java")).toBe("int[]");
      expect(resolveType("int[]", "javascript")).toBe("number[]");
      expect(resolveType("int[]", "python")).toBe("list[int]");

      expect(resolveType("string", "java")).toBe("String");
      expect(resolveType("string", "javascript")).toBe("string");
      expect(resolveType("string", "python")).toBe("str");

      expect(resolveType("boolean", "java")).toBe("boolean");
      expect(resolveType("boolean", "javascript")).toBe("boolean");
      expect(resolveType("boolean", "python")).toBe("bool");
    });

    test("falls back to original type if unknown", () => {
      expect(resolveType("TreeNode", "java")).toBe("TreeNode");
      expect(resolveType("TreeNode", "python")).toBe("TreeNode");
    });
  });

  describe("generateSignatureStub", () => {
    const signature = {
      functionName: "twoSum",
      params: [
        { name: "nums", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returnType: "int[]",
    };

    test("generates idiomatic Java Solution class with method", () => {
      const javaStub = generateSignatureStub(signature, "java");
      expect(javaStub).toBe(`class Solution {
    public int[] twoSum(int[] nums, int target) {
        // code here
    }
}`);
    });

    test("generates idiomatic JavaScript function with JSDoc annotations", () => {
      const jsStub = generateSignatureStub(signature, "javascript");
      expect(jsStub).toBe(`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // code here
}`);
    });

    test("generates idiomatic Python Solution class with type hints", () => {
      const pyStub = generateSignatureStub(signature, "python");
      expect(pyStub).toBe(`class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # code here
        pass`);
    });

    test("returns null if signature or functionName is missing", () => {
      expect(generateSignatureStub(null, "java")).toBeNull();
      expect(generateSignatureStub({}, "python")).toBeNull();
    });
  });

  describe("getStarterCode", () => {
    test("returns empty string when question is null or undefined", () => {
      expect(getStarterCode(null, "java")).toBe("");
      expect(getStarterCode(undefined, "python")).toBe("");
    });

    test("generates code from signature metadata (LeetCode pattern)", () => {
      const question = {
        id: "two-sum",
        title: "Two Sum",
        signature: {
          functionName: "twoSum",
          params: [
            { name: "nums", type: "int[]" },
            { name: "target", type: "int" },
          ],
          returnType: "int[]",
        },
      };

      const javaCode = getStarterCode(question, "java");
      expect(javaCode).toContain("class Solution");
      expect(javaCode).toContain("public int[] twoSum(int[] nums, int target)");

      const pyCode = getStarterCode(question, "python");
      expect(pyCode).toContain("class Solution:");
      expect(pyCode).toContain("def twoSum(self, nums: list[int], target: int) -> list[int]:");

      const jsCode = getStarterCode(question, "javascript");
      expect(jsCode).toContain("function twoSum(nums, target)");
    });

    test("uses language-specific starterCodes mapping when present as an override", () => {
      const question = {
        id: "custom-design",
        title: "LRU Cache",
        signature: {
          functionName: "notUsed",
        },
        starterCodes: {
          python: "class LRUCache: pass",
        },
      };

      expect(getStarterCode(question, "python")).toBe("class LRUCache: pass");
    });

    test("falls back to question.starterCode for Java if starterCodes and signature are missing", () => {
      const question = {
        id: "legacy-q",
        title: "Legacy Question",
        starterCode: "class LegacyJava {}",
      };

      expect(getStarterCode(question, "java")).toBe("class LegacyJava {}");
    });

    test("generates default starter code template when question lacks specific template", () => {
      const question = {
        id: "test-q",
        title: "Custom Problem",
      };

      const pyCode = getStarterCode(question, "python");
      expect(pyCode).toContain("# code here");
      expect(pyCode).toContain("def solution():");

      const jsCode = getStarterCode(question, "javascript");
      expect(jsCode).toContain("// code here");
      expect(jsCode).toContain("function solution()");
    });
  });

  describe("buildQuestionLanguageKey", () => {
    test("constructs composite key from question id and language", () => {
      expect(buildQuestionLanguageKey("two-sum", "python")).toBe("two-sum-python");
      expect(buildQuestionLanguageKey("1", "java")).toBe("1-java");
    });
  });
});
