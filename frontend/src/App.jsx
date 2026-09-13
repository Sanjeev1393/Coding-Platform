import { useEffect, useState } from "react";
import {
  ASSESSMENT_DURATION_SECONDS,
  INITIAL_CODE,
  question,
} from "./constants";
import AssessmentHeader from "./components/AssessmentHeader";
import QuestionPanel from "./components/QuestionPanel";
import OutputPanel from "./components/OutputPanel";
import ConfirmDialog from "./components/ConfirmDialog";

function App() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [timeLeft, setTimeLeft] = useState(ASSESSMENT_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleRunCode = () => {
    if (code.trim() === "") {
      setResult(null);
      setError("Editor is empty. Please write your solution before running.");
      return;
    }

    setIsRunning(true);
    setResult(null);
    setError("");

    // Simulate ~1 second of "compilation / execution"
    setTimeout(() => {
      setResult({ status: "Passed", testCases: "2 / 2", output: "[0, 1]" });
      setIsRunning(false);
    }, 1000);
  };

  const handleSubmitClick = () => {
    if (code.trim() === "") {
      setError("Editor is empty. Please write your solution before submitting.");
      return;
    }
    setError("");
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    setIsSubmitted(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  // Disable all interaction once submitted or while code is running
  const isLocked = isSubmitted || isRunning;

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-800">
      <AssessmentHeader formattedTime={formattedTime} />

      {showConfirmDialog && (
        <ConfirmDialog
          onConfirm={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
        />
      )}

      <div className="grid flex-1 grid-cols-1 md:grid-cols-5">
        <QuestionPanel question={question} />

        <section className="flex flex-col p-7 md:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your solution</h2>
            <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              Java
            </span>
          </div>

          <textarea
            className="mt-4 min-h-[400px] flex-1 resize-y rounded-md border border-slate-400 bg-gray-900 p-4 font-mono text-[15px] leading-relaxed text-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            aria-label="Code editor"
            disabled={isSubmitted}
          />

          {isSubmitted ? (
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-700">
                ✓ Solution submitted successfully.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your code has been recorded. You may close this window.
              </p>
            </div>
          ) : (
            <OutputPanel result={result} error={error} />
          )}

          <div className="mt-4.5 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isLocked}
              className="cursor-pointer rounded-md bg-gray-200 px-4.5 py-2.5 font-semibold text-gray-800 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? "Running…" : "Run code"}
            </button>

            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={isLocked}
              className="cursor-pointer rounded-md bg-blue-600 px-4.5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit solution
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
