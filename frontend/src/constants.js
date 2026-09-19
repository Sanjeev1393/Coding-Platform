/**
 * Assessment duration in seconds (30 minutes).
 */
export const ASSESSMENT_DURATION_SECONDS = 30 * 60;

/**
 * Supported programming languages for the assessment editor and runner.
 * Each language defines its identifier, display name, file extension, and default starter code.
 */
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
