import { formatValue } from "./formatValue";

/**
 * Formats test case inputs for display in example sections.
 *
 * @param {Object|string} inputs - Map of parameter names to values or raw input
 * @param {string} [rawInput] - Optional raw input fallback
 * @returns {string} Formatted input representation (e.g. "nums = [2, 7, 11, 15], target = 9")
 */
export function formatExampleInputs(inputs, rawInput = "") {
  if (inputs && typeof inputs === "object" && Object.keys(inputs).length > 0) {
    return Object.entries(inputs)
      .map(([key, val]) => {
        const formattedVal = typeof val === "string" ? `"${val}"` : formatValue(val);
        return `${key} = ${formattedVal}`;
      })
      .join(", ");
  }

  if (rawInput) return String(rawInput);
  if (inputs !== null && inputs !== undefined) return String(inputs);
  return "";
}

/**
 * Formats expected output for display in example sections.
 *
 * @param {*} output - Expected output value
 * @returns {string} Formatted output string
 */
export function formatExampleOutput(output) {
  if (output === null || output === undefined) return "";
  if (typeof output === "string") {
    const trimmed = output.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      return trimmed;
    }
    return `"${trimmed}"`;
  }
  return formatValue(output);
}
