import { useEffect, useRef, useState } from "react";
import {
  ASSESSMENT_DURATION_SECONDS,
  SUPPORTED_LANGUAGES,
  questions,
} from "./constants";
import {
  getStarterCode,
  buildQuestionLanguageKey,
} from "./utils/languageUtils";
import { useAssessmentTimer } from "./hooks/useAssessmentTimer";
import AssessmentHeader from "./components/AssessmentHeader";
import QuestionPanel from "./components/QuestionPanel";
import EditorPanel from "./components/EditorPanel";
import OutputPanel from "./components/OutputPanel";
import ConfirmDialog from "./components/ConfirmDialog";
import StatusBanner from "./components/StatusBanner";
import EmptyAssessment from "./components/EmptyAssessment";

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [solutionsByKey, setSolutionsByKey] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Custom hook isolates all timer lifecycle, formatting, and urgency states
  const { formattedTime, isTimeUp, isUrgent } = useAssessmentTimer(
    ASSESSMENT_DURATION_SECONDS
  );

  // Prevent memory leaks if unmounted while mock execution is running
  const runTimeoutRef = useRef(null);
  useEffect(() => {
    return () => {
      if (runTimeoutRef.current) {
        clearTimeout(runTimeoutRef.current);
      }
    };
  }, []);

  // Derived state
  const isLocked = isSubmitted || isRunning || isTimeUp;
  const hasQuestions = questions.length > 0;
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const currentKey = currentQuestion
    ? buildQuestionLanguageKey(currentQuestion.id, selectedLanguage)
    : "";
  const currentCode = currentQuestion
    ? (solutionsByKey[currentKey] ??
      getStarterCode(currentQuestion, selectedLanguage))
    : "";

  const activeLanguageConfig = SUPPORTED_LANGUAGES.find(
    (lang) => lang.id === selectedLanguage
  );
  const activeLanguageName = activeLanguageConfig?.name || selectedLanguage;

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

  const handleLanguageChange = (newLanguage) => {
    if (isLocked) return;
    setSelectedLanguage(newLanguage);
    setResult(null);
    setError("");
  };

  const handleCodeChange = (newCode) => {
    if (isLocked || !currentQuestion) return;

    setSolutionsByKey((prev) => ({
      ...prev,
      [buildQuestionLanguageKey(currentQuestion.id, selectedLanguage)]: newCode,
    }));
  };

  const handleRunCode = () => {
    if (isLocked) return;

    if (currentCode.trim() === "") {
      setResult(null);
      setError("Editor is empty. Please write your solution before running.");
      return;
    }

    setIsRunning(true);
    setResult(null);
    setError("");

    // Simulate ~1 second of "compilation / execution" safely
    runTimeoutRef.current = setTimeout(() => {
      setResult({
        status: "Passed",
        testCases: "2 / 2",
        output: "[0, 1]",
        language: activeLanguageName,
      });
      setIsRunning(false);
    }, 1000);
  };

  const handleSubmitClick = () => {
    if (isLocked || showConfirmDialog) return;

    if (currentCode.trim() === "") {
      setError(
        "Editor is empty. Please write your solution before submitting."
      );
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
        isUrgent={isUrgent}
        isTimeUp={isTimeUp}
      />

      {showConfirmDialog && (
        <ConfirmDialog
          onConfirm={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
        />
      )}

      {!hasQuestions ? (
        <EmptyAssessment />
      ) : (
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
            code={currentCode}
            questionId={currentQuestion?.id}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
            onSubmit={handleSubmitClick}
            isRunning={isRunning}
            isLocked={isLocked}
          >
            {isSubmitted ? (
              <StatusBanner
                variant="success"
                title="✓ Solution submitted successfully."
                message={`Your ${activeLanguageName} solution has been recorded. You may close this window.`}
              />
            ) : isTimeUp ? (
              <StatusBanner
                variant="warning"
                title="⏳ Time has expired"
                message="The assessment time is up. Code editing and execution have been disabled."
              />
            ) : (
              <OutputPanel
                result={result}
                error={error}
                isRunning={isRunning}
                languageName={activeLanguageName}
                questionNumber={currentQuestionIndex + 1}
              />
            )}
          </EditorPanel>
        </div>
      )}
    </main>
  );
}

export default App;
