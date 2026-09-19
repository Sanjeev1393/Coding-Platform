/**
 * Test fixture providing mock questions for unit and integration tests.
 * Mirrors the sanitized QuestionResponse structure returned by GET /api/v1/questions
 * without exposing sensitive hidden test cases.
 */
export const mockQuestions = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers and a target, return the indices of two numbers whose sum is equal to the target.",
    sampleInput: "numbers = [2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
    signature: {
      methodName: "twoSum",
      functionName: "twoSum",
      params: [
        { name: "nums", type: "int[]", description: "Array of integers" },
        { name: "target", type: "int", description: "Target sum" },
      ],
      returnType: "int[]",
    },
    starterCodes: {
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // code here
    }
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # code here
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // code here
}`,
    },
    testCases: {
      visible: [
        {
          id: "case-1",
          name: "Example 1",
          inputs: {
            nums: [2, 7, 11, 15],
            target: 9,
          },
          rawInput: "[2, 7, 11, 15]\n9",
          input: "[2, 7, 11, 15]\n9",
          expectedOutput: "[0, 1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
        },
        {
          id: "case-2",
          name: "Example 2",
          inputs: {
            nums: [3, 2, 4],
            target: 6,
          },
          rawInput: "[3, 2, 4]\n6",
          input: "[3, 2, 4]\n6",
          expectedOutput: "[1, 2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
        },
      ],
    },
    runnerTemplate: {
      type: "standard",
      customDrivers: { java: null, python: null, javascript: null },
    },
    validator: {
      type: "unordered_array",
      customValidator: null,
    },
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    description:
      "Given a string, return a new string with the characters reversed.",
    sampleInput: 's = "hello"',
    sampleOutput: '"olleh"',
    signature: {
      methodName: "reverseString",
      functionName: "reverseString",
      params: [{ name: "s", type: "string", description: "Input string" }],
      returnType: "string",
    },
    starterCodes: {
      java: `class Solution {
    public String reverseString(String s) {
        // code here
    }
}`,
      python: `class Solution:
    def reverseString(self, s: str) -> str:
        # code here
        pass`,
      javascript: `/**
 * @param {string} s
 * @return {string}
 */
function reverseString(s) {
    // code here
}`,
    },
    testCases: {
      visible: [
        {
          id: "case-1",
          name: "Example 1",
          inputs: { s: "hello" },
          rawInput: '"hello"',
          input: '"hello"',
          expectedOutput: '"olleh"',
          explanation: null,
        },
        {
          id: "case-2",
          name: "Example 2",
          inputs: { s: "world" },
          rawInput: '"world"',
          input: '"world"',
          expectedOutput: '"dlrow"',
          explanation: null,
        },
      ],
    },
    runnerTemplate: {
      type: "standard",
      customDrivers: { java: null, python: null, javascript: null },
    },
    validator: {
      type: "exact",
      customValidator: null,
    },
  },
];
