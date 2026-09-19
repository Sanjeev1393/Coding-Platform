import { useState } from "react";
import { ASSESSMENT_DURATION_SECONDS, questions } from "./constants";
import { useAssessmentTimer } from "./hooks/useAssessmentTimer";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useQuestionSession } from "./hooks/useQuestionSession";
import { useCodeExecution } from "./hooks/useCodeExecution";
import AssessmentHeader from "./components/AssessmentHeader";
import QuestionPanel from "./components/QuestionPanel";
import EditorPanel from "./components/EditorPanel";
import ConfirmDialog from "./components/ConfirmDialog";
import StatusBanner from "./components/StatusBanner";
import EmptyAssessment from "./components/EmptyAssessment";

function App() {
  const {
    currentQuestionIndex,
    currentQuestion,
    selectedLanguage,
    activeLanguageName,
    currentCode,
    currentCustomInput,
    selectedCaseIndex,
    isFirstQuestion,
    isLastQuestion,
    hasQuestions,
    goToPreviousQuestion,
    goToNextQuestion,
    changeLanguage,
    updateCode,
    updateCustomInput,
    selectCase,
  } = useQuestionSession(questions);

  const {
    isRunning,
    executionResult,
    runSolution,
    clearExecutionResult,
    setExecutionResult,
  } = useCodeExecution();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Custom hook isolates all timer lifecycle, formatting, and urgency states
  const { formattedTime, isTimeUp, isUrgent } = useAssessmentTimer(
    ASSESSMENT_DURATION_SECONDS
  );

  // Derived state
  const isLocked = isSubmitted || isRunning || isTimeUp;

  const handlePreviousQuestion = () => {
    if (goToPreviousQuestion()) {
      clearExecutionResult();
    }
  };

  const handleNextQuestion = () => {
    if (goToNextQuestion()) {
      clearExecutionResult();
    }
  };

  const handleLanguageChange = (newLanguage) => {
    if (isLocked) return;
    changeLanguage(newLanguage);
    clearExecutionResult();
  };

  const handleCodeChange = (newCode) => {
    if (isLocked) return;
    updateCode(newCode);
  };

  const handleCustomInputChange = (eventOrValue) => {
    if (isLocked) return;
    updateCustomInput(eventOrValue);
  };

  const handleSelectCase = (index) => {
    if (isLocked) return;
    selectCase(index);
  };

  const handleRunCode = async () => {
    await runSolution({
      question: currentQuestion,
      language: selectedLanguage,
      sourceCode: currentCode,
      customInput: currentCustomInput,
      activeLanguageName,
      isLocked,
    });
  };

  const handleSubmitClick = () => {
    if (isLocked || showConfirmDialog) return;

    if (currentCode.trim() === "") {
      setExecutionResult({
        status: "error",
        error: "Editor is empty. Please write your solution before submitting.",
        output: "",
        executionTime: null,
      });
      return;
    }
    clearExecutionResult();
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    setIsSubmitted(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  // Cross-platform keyboard shortcuts (Ctrl/⌘ + Enter to run, Ctrl/⌘ + Shift + Enter to submit)
  useKeyboardShortcuts({
    onRunCode: handleRunCode,
    onSubmit: handleSubmitClick,
    disabled: isLocked || showConfirmDialog,
  });

  return (
    <main className="flex h-screen flex-col bg-slate-100 text-slate-800 overflow-hidden">
      <AssessmentHeader
        testName="DSA Coding Assessment"
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
        <div className="grid flex-1 grid-cols-1 md:grid-cols-5 min-h-0 overflow-hidden">
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
            customInput={currentCustomInput}
            onCustomInputChange={handleCustomInputChange}
            testCases={currentQuestion?.testCases?.visible || []}
            selectedCaseIndex={selectedCaseIndex}
            onSelectCase={handleSelectCase}
            executionResult={executionResult}
            activeLanguageName={activeLanguageName}
            currentQuestionIndex={currentQuestionIndex}
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
            ) : null}
          </EditorPanel>
        </div>
      )}
    </main>
  );
}

export default App;
