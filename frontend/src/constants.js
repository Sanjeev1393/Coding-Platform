export const ASSESSMENT_DURATION_SECONDS = 30 * 60;

export const SUPPORTED_LANGUAGES = [
  {
    id: "java",
    name: "Java",
    extension: "java",
    defaultStarterCode: () => `class Solution {
    public void solution() {
        // code here
    }
}`,
  },
  {
    id: "javascript",
    name: "JavaScript",
    extension: "js",
    defaultStarterCode: () => `function solution() {
    // code here
}`,
  },
  {
    id: "python",
    name: "Python",
    extension: "py",
    defaultStarterCode: () => `def solution():
    # code here
    pass`,
  },
];

export const questions = [
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
          expectedOutput: [0, 1],
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
          expectedOutput: [1, 2],
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
        },
      ],
      hidden: [
        {
          id: "case-3",
          name: "Hidden Case 1 (Duplicate numbers)",
          inputs: {
            nums: [3, 3],
            target: 6,
          },
          rawInput: "[3, 3]\n6",
          expectedOutput: [0, 1],
        },
        {
          id: "case-4",
          name: "Hidden Case 2 (Negative integers)",
          inputs: {
            nums: [-1, -2, -3, -4, -5],
            target: -8,
          },
          rawInput: "[-1, -2, -3, -4, -5]\n-8",
          expectedOutput: [2, 4],
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
          inputs: {
            s: "hello",
          },
          rawInput: '"hello"',
          expectedOutput: "olleh",
        },
        {
          id: "case-2",
          name: "Example 2",
          inputs: {
            s: "world",
          },
          rawInput: '"world"',
          expectedOutput: "dlrow",
        },
      ],
      hidden: [
        {
          id: "case-3",
          name: "Hidden Case 1 (Single character)",
          inputs: {
            s: "a",
          },
          rawInput: '"a"',
          expectedOutput: "a",
        },
        {
          id: "case-4",
          name: "Hidden Case 2 (Palindrome)",
          inputs: {
            s: "racecar",
          },
          rawInput: '"racecar"',
          expectedOutput: "racecar",
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
