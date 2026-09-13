import { useEffect, useState } from "react";
import {
  ASSESSMENT_DURATION_SECONDS,
  INITIAL_CODE,
  questions,
} from "./constants";
import AssessmentHeader from "./components/AssessmentHeader";
import QuestionPanel from "./components/QuestionPanel";
import EditorPanel from "./components/EditorPanel";
import OutputPanel from "./components/OutputPanel";
import ConfirmDialog from "./components/ConfirmDialog";

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  // Derived values for questions and navigation
  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setResult(null);
      setError("");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setResult(null);
      setError("");
    }
  };

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

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-800">
      <AssessmentHeader
        testName="Java Programming Test"
        formattedTime={formattedTime}
      />

      {showConfirmDialog && (
        <ConfirmDialog
          onConfirm={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
        />
      )}

      <div className="grid flex-1 grid-cols-1 md:grid-cols-5">
        <QuestionPanel
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
        />

        <EditorPanel
          code={code}
          onCodeChange={setCode}
          onRunCode={handleRunCode}
          onSubmit={handleSubmitClick}
          isRunning={isRunning}
          isSubmitted={isSubmitted}
        >
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
            <OutputPanel
              result={result}
              error={error}
              isRunning={isRunning}
            />
          )}
        </EditorPanel>
      </div>
    </main>
  );
}

export default App;
