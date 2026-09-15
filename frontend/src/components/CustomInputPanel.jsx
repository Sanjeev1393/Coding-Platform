/**
 * CustomInputPanel renders the stdin textarea and helper toolbar.
 *
 * @param {Object} props
 * @param {string} props.value - Current custom input text.
 * @param {Function} props.onChange - Handler called when textarea content changes.
 * @param {boolean} props.disabled - Whether input is disabled (e.g. locked assessment).
 */
function CustomInputPanel({ value = "", onChange, disabled = false }) {
  const hasInput = typeof value === "string" && value.trim() !== "";
  const lineCount = value ? value.split("\n").length : 0;

  const handleClear = (event) => {
    event.stopPropagation();
    if (disabled) return;
    onChange?.({ target: { value: "" } });
  };

  return (
    <>
      <label htmlFor="custom-input" className="sr-only">
        Custom Input
      </label>
      <textarea
        id="custom-input"
        name="customInput"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Enter input for your program"
        rows={3}
        className="w-full resize-y bg-slate-50/30 p-3 font-mono text-xs leading-relaxed text-slate-800 placeholder-slate-400 transition-colors focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 min-h-[76px] max-h-[220px]"
      />

      {/* Minimal Footer Toolbar */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-3 py-1 text-[10.5px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <span>Standard input (stdin)</span>
          {hasInput && (
            <span>
              • {lineCount} line{lineCount === 1 ? "" : "s"}
            </span>
          )}
        </span>

        {hasInput && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="cursor-pointer text-slate-400 hover:text-red-600 transition-colors"
            title="Clear input"
          >
            Clear
          </button>
        )}
      </div>
    </>
  );
}

export default CustomInputPanel;
