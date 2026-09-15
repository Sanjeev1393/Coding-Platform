const EXECUTIONS_URL = "/api/v1/executions";

export async function executeCode(payload) {
  const response = await fetch(EXECUTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Execution request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody.detail || errorBody.message || message;
    } catch {
      // The backend did not return a JSON error body.
    }

    throw new Error(message);
  }

  return response.json();
}
