function QuestionPanel({ question }) {
  return (
    <section className="border-b border-slate-200 bg-white p-7 md:col-span-2 md:border-b-0 md:border-r">
      <p className="font-semibold text-blue-700">
        Question {question.number} of 2
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        {question.title}
      </h2>
      <p className="mt-2 leading-relaxed text-slate-600">
        {question.description}
      </p>

      <h3 className="mt-7 mb-2 text-[15px] font-semibold text-slate-900">
        Sample input
      </h3>
      <pre className="rounded-md bg-slate-100 p-3.5 font-mono text-sm whitespace-pre-wrap text-slate-800">
        {question.sampleInput}
      </pre>

      <h3 className="mt-7 mb-2 text-[15px] font-semibold text-slate-900">
        Sample output
      </h3>
      <pre className="rounded-md bg-slate-100 p-3.5 font-mono text-sm whitespace-pre-wrap text-slate-800">
        {question.sampleOutput}
      </pre>
    </section>
  );
}

export default QuestionPanel;
