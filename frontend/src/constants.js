export const ASSESSMENT_DURATION_SECONDS = 30 * 60;

export const SUPPORTED_LANGUAGES = [
  {
    id: "java",
    name: "Java",
    extension: "java",
    defaultStarterCode: () => `public class Main {
    public static void main(String[] args) {
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
    description:
      "Given an array of integers and a target, return the indices of two numbers whose sum is equal to the target.",
    sampleInput: "numbers = [2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
    signature: {
      functionName: "twoSum",
      params: [
        { name: "nums", type: "int[]" },
        { name: "target", type: "int" },
      ],
      returnType: "int[]",
    },
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    description:
      "Given a string, return a new string with the characters reversed.",
    sampleInput: 's = "hello"',
    sampleOutput: '"olleh"',
    signature: {
      functionName: "reverseString",
      params: [{ name: "s", type: "string" }],
      returnType: "string",
    },
  },
];
