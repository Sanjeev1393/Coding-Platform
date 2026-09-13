function EditorPanel({
  code,
  onCodeChange,
  onRunCode,
  onSubmit,
  isRunning = false,
  isLocked = false,
  children,
}) {
  return (
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
        onChange={(e) => onCodeChange?.(e.target.value)}
        spellCheck={false}
        aria-label="Code editor"
        disabled={isLocked}
      />

      {children}

      <div className="mt-4.5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onRunCode}
          disabled={isLocked}
          className="cursor-pointer rounded-md bg-gray-200 px-4.5 py-2.5 font-semibold text-gray-800 transition enabled:hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Running…" : "Run code"}
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLocked}
          className="cursor-pointer rounded-md bg-blue-600 px-4.5 py-2.5 font-semibold text-white transition enabled:hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit solution
        </button>
      </div>
    </section>
  );
}

export default EditorPanel;
