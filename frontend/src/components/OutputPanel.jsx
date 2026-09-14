import StatusBanner from "./StatusBanner";

function OutputPanel({ result, error, isRunning = false }) {
  if (isRunning) {
    return (
      <StatusBanner
        variant="info"
        title="Executing code…"
        message="Running test cases against your solution."
      />
    );
  }

  if (error) {
    return (
      <StatusBanner
        variant="error"
        title="Validation error"
        message={error}
      />
    );
  }

  if (!result) return null;

  return (
    <div
      role="region"
      aria-label="Execution result"
      className="mt-4 rounded-md border border-green-200 bg-green-50 p-4"
    >
      <p className="text-sm font-semibold text-green-700">
        ✓ {result.status} — {result.testCases} test cases passed
      </p>
      <p className="mt-2 text-sm text-slate-600">Output</p>
      <pre className="mt-1 rounded-md bg-white px-3 py-2 font-mono text-sm text-slate-800">
        {result.output}
      </pre>
      <p className="mt-3 text-xs text-slate-400">
        ⚠ Mock result — compiler not connected yet
      </p>
    </div>
  );
}

export default OutputPanel;
