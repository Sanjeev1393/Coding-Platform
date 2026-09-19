import { memo } from "react";

function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  onPrevious,
  onNext,
  isFirstQuestion,
  isLastQuestion,
}) {
  if (!question) return null;

  return (
    <section className="flex flex-col justify-between overflow-y-auto min-h-0 border-b border-slate-200 bg-white p-7 md:col-span-2 md:border-b-0 md:border-r">
      <div>
        <p className="font-semibold text-blue-700">
          Question {questionNumber} of {totalQuestions}
        </p>

        <h2 className="mt-2 text-2xl font-bold break-words text-slate-900">
          {question.title}
        </h2>
        <p className="mt-2 leading-relaxed break-words text-slate-600">
          {question.description}
        </p>

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
