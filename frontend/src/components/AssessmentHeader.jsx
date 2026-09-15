function AssessmentHeader({
  testName = "DSA Coding Assessment",
  formattedTime,
  isUrgent = false,
  isTimeUp = false,
}) {
  const timerStyle = isTimeUp
    ? "bg-red-50 text-red-700 border-red-300"
    : isUrgent
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-blue-50 text-blue-700 border-transparent";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
      <div>
        <h1 className="text-2xl font-bold">Coding Assessment</h1>
        <p className="mt-1 text-slate-500">{testName}</p>
      </div>

      <div
        className={`rounded-md border px-5 py-2.5 text-xl font-semibold tabular-nums transition-colors duration-300 ${timerStyle}`}
        aria-label="Assessment countdown timer"
      >
        {formattedTime}
      </div>
    </header>
  );
}

export default AssessmentHeader;
