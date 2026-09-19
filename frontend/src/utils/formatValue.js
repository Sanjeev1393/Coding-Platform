/**
 * Formats a value for display in the test case and execution result panels,
 * ensuring arrays and objects are formatted consistently with standard spaces
 * after commas (e.g. [0, 1] instead of [0,1]).
 *
 * @param {*} val - Value to format
 * @returns {string} Formatted string representation
 */
export function formatValue(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;

  if (Array.isArray(val)) {
    return `[${val.map((item) => (typeof item === "object" ? formatValue(item) : String(item))).join(", ")}]`;
  }

  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }

  return String(val);
}
