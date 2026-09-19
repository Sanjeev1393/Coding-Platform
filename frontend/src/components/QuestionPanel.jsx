import { memo } from "react";
import {
  formatExampleInputs,
  formatExampleOutput,
} from "../utils/formatExample";

/**
 * Presentational subcomponent rendering an individual formatted example card
 * with inputs, outputs, and optional explanation.
 *
 * @param {Object} props
 * @param {Object} props.example - Test case metadata (inputs, rawInput, expectedOutput, explanation)
 * @param {number} props.index - Zero-based index of the example
 */
function ExampleCard({ example, index }) {
  const inputStr = formatExampleInputs(example.inputs, example.rawInput);
  const outputStr = formatExampleOutput(example.expectedOutput);

  return (
    <div
      key={example.id || `example-${index + 1}`}
      className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
    >
      <h3 className="text-sm font-bold text-slate-900">
        Example {index + 1}:
      </h3>
      <div className="mt-2 space-y-1.5 font-mono text-xs text-slate-800">
        <div className="break-words">
          <span className="font-semibold text-slate-700 font-sans select-none">
            Input:{" "}
          </span>
          <span>{inputStr}</span>
        </div>
        <div className="break-words">
          <span className="font-semibold text-slate-700 font-sans select-none">
            Output:{" "}
          </span>
          <span>{outputStr}</span>
        </div>
        {example.explanation && (
          <div className="mt-2 pt-2 border-t border-slate-200/80 font-sans text-xs text-slate-600 leading-relaxed break-words">
            <span className="font-semibold text-slate-800">
              Explanation:{" "}
            </span>
            <span>{example.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * QuestionPanel renders the problem statement, constraints, example cards,
 * submission status badge, and assessment pagination controls.
 *
 * @param {Object} props
 * @param {Object} props.question - Active question domain definition
 * @param {number} props.questionNumber - Current 1-based question number
 * @param {number} props.totalQuestions - Total questions in the assessment
 * @param {Function} props.onPrevious - Callback to navigate to previous question
 * @param {Function} props.onNext - Callback to navigate to next question
 * @param {boolean} props.isFirstQuestion - True if currently viewing the first question
 * @param {boolean} props.isLastQuestion - True if currently viewing the last question
 * @param {string|null} [props.submissionStatus=null] - Submission badge status ('accepted' | 'wrong_answer' | null)
 */
function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  onPrevious,
  onNext,
  isFirstQuestion,
  isLastQuestion,
  submissionStatus = null,
}) {
  if (!question) return null;

  // Limit examples to at most two
  const exampleCases = (question.testCases?.visible || []).slice(0, 2);

  return (
    <section className="flex flex-col justify-between overflow-y-auto min-h-0 border-b border-slate-200 bg-white p-7 md:col-span-2 md:border-b-0 md:border-r">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-blue-700">
            Question {questionNumber} of {totalQuestions}
          </p>
          {submissionStatus === "accepted" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-2xs">
              ✓ Solved
            </span>
          )}
          {submissionStatus === "wrong_answer" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 shadow-2xs">
              Attempted
            </span>
          )}
        </div>

        <h2 className="mt-2 text-2xl font-bold break-words text-slate-900">
          {question.title}
        </h2>
        <p className="mt-2 leading-relaxed break-words text-slate-600">
          {question.description}
        </p>

        {exampleCases.length > 0 ? (
          <div className="mt-7 space-y-4">
            {exampleCases.map((example, index) => (
              <ExampleCard
                key={example.id || `example-${index + 1}`}
                example={example}
                index={index}
              />
            ))}
          </div>
        ) : (
          <>
            <h3 className="mt-7 mb-2 text-[15px] font-semibold text-slate-900">
              Sample input
            </h3>
            <pre className="overflow-x-auto rounded-md bg-slate-100 p-3.5 font-mono text-sm whitespace-pre-wrap break-words text-slate-800">
              {question.sampleInput}
            </pre>

            <h3 className="mt-7 mb-2 text-[15px] font-semibold text-slate-900">
              Sample output
            </h3>
            <pre className="overflow-x-auto rounded-md bg-slate-100 p-3.5 font-mono text-sm whitespace-pre-wrap break-words text-slate-800">
              {question.sampleOutput}
            </pre>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition enabled:hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLastQuestion}
          className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default memo(QuestionPanel);
