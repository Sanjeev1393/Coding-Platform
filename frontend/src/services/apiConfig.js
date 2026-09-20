/**
 * Resolves the configured API base URL for network requests.
 *
 * In local development, defaults to "" (empty string) so the browser
 * makes relative requests (e.g. /api/v1/executions), which Vite's local
 * development server proxy seamlessly forwards to http://localhost:8080.
 *
 * In production deployments (such as Vercel), set VITE_API_BASE_URL to the
 * public backend service URL (e.g. https://your-backend.onrender.com).
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

/**
 * Returns a fully qualified or relative URL by prepending the configured API base URL.
 *
 * @param {string} path - The API endpoint path (e.g., '/api/v1/executions')
 * @returns {string} The resolved request URL
 */
export function getApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
