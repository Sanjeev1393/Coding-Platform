function AssessmentHeader({ formattedTime }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
      <div>
        <h1 className="text-2xl font-bold">Coding Assessment</h1>
        <p className="mt-1 text-slate-500">Java Programming Test</p>
      </div>

      <div className="rounded-md bg-blue-50 px-5 py-2.5 text-xl font-semibold text-blue-700 tabular-nums">
        {formattedTime}
      </div>
    </header>
  );
}

export default AssessmentHeader;
