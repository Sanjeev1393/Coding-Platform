/**
 * Assessment duration in seconds (30 minutes).
 */
export const ASSESSMENT_DURATION_SECONDS = 30 * 60;

/**
 * Feature flag to control assessment countdown timer activity.
 * When set to false during development, the timer is stopped/guarded so candidate
 * editor, execution, and language selection actions are never locked out by timer expiry.
 * Set back to true once assessment flow is fully completed and ready for enforcement.
 */
export const IS_ASSESSMENT_TIMER_ACTIVE = false;

/**
 * Polling retry interval for fetching assessment questions from the backend (3 seconds).
 * Helps smoothly bridge free-tier backend cold starts (e.g., Render/Railway sleep).
 */
export const QUESTIONS_RETRY_INTERVAL_MS = 3000;

/**
 * Maximum cumulative retry timeout for fetching questions before logging errors to console (90 seconds).
 */
export const QUESTIONS_MAX_RETRY_TIMEOUT_MS = 90000;

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
