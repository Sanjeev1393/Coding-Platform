/**
 * Normalizer function for React Testing Library queries.
 *
 * RTL's default text normalizer collapses whitespace and line breaks (\n -> " ").
 * Use rawTextNormalizer to preserve exact formatting when asserting on multiline
 * strings inside <pre> blocks or formatted error messages.
 *
 * Usage:
 *   screen.getByText("line1\nline2", { normalizer: rawTextNormalizer });
 */
export const rawTextNormalizer = (text) => text;
