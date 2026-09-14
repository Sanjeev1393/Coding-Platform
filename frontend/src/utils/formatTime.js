/**
 * Formats a duration in seconds into a MM:SS string.
 * Negative values are clamped to zero defensively.
 *
 * @param {number} totalSeconds - Duration in seconds.
 * @returns {string} Formatted time string, e.g. "29:59"
 */
export function formatTime(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
