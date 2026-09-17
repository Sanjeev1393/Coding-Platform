/**
 * Evaluates whether an actual execution result matches the expected output
 * based on the specified validation rule.
 *
 * Supported validator types:
 * - 'exact': Strict value equality or deep array/object equality.
 * - 'unordered_array': Array equality where element ordering does not matter (e.g. [0, 1] == [1, 0]).
 * - 'floating_point': Numerical equality within a small epsilon tolerance (1e-5).
 *
 * @param {*} actual - Value returned by the candidate's solution
 * @param {*} expected - Expected test case output
 * @param {string} [type='exact'] - Validation strategy
 * @returns {boolean} True if the result satisfies the test case
 */
export function validateResult(actual, expected, type = "exact") {
  if (actual === expected) return true;

  // Normalize string representations of null/undefined
  if (actual === null || actual === undefined) {
    return expected === null || expected === undefined;
  }

  // Handle parseable JSON strings if actual is raw string output
  let parsedActual = actual;
  if (typeof actual === "string") {
    const trimmed = actual.trim();
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      /^-?\d+(\.\d+)?$/.test(trimmed) ||
      trimmed === "true" ||
      trimmed === "false"
    ) {
      try {
        parsedActual = JSON.parse(trimmed);
      } catch {
        parsedActual = trimmed;
      }
    } else {
      parsedActual = trimmed;
    }
  }

  let parsedExpected = expected;
  if (typeof expected === "string") {
    const trimmed = expected.trim();
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      /^-?\d+(\.\d+)?$/.test(trimmed) ||
      trimmed === "true" ||
      trimmed === "false"
    ) {
      try {
        parsedExpected = JSON.parse(trimmed);
      } catch {
        parsedExpected = trimmed;
      }
    } else {
      parsedExpected = trimmed;
    }
  }

  switch (type) {
    case "unordered_array": {
      if (!Array.isArray(parsedActual) || !Array.isArray(parsedExpected)) {
        return false;
      }
      if (parsedActual.length !== parsedExpected.length) {
        return false;
      }
      const sortedActual = [...parsedActual].sort();
      const sortedExpected = [...parsedExpected].sort();
      return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
    }

    case "floating_point": {
      const numActual = Number(parsedActual);
      const numExpected = Number(parsedExpected);
      if (Number.isNaN(numActual) || Number.isNaN(numExpected)) {
        return false;
      }
      return Math.abs(numActual - numExpected) < 1e-5;
    }

    case "exact":
    default: {
      if (typeof parsedActual === "object" && typeof parsedExpected === "object") {
        return JSON.stringify(parsedActual) === JSON.stringify(parsedExpected);
      }
      return String(parsedActual) === String(parsedExpected);
    }
  }
}
