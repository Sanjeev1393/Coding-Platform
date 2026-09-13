function EmptyAssessment({
  title = "No questions available",
  message = "No questions are available for this assessment.",
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
          📋
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-slate-600">{message}</p>
      </div>
    </div>
  );
}

export default EmptyAssessment;
