import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../constants";

function LanguageSelector({
  selectedLanguage = "java",
  onLanguageChange,
  languages = SUPPORTED_LANGUAGES,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedLangConfig = languages.find(
    (lang) => lang.id === selectedLanguage
  );
  const selectedName = selectedLangConfig?.name || selectedLanguage;

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (langId) => {
    onLanguageChange?.(langId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Native select for screen readers, keyboard tabbing, and automated testing */}
      <select
        id="language-select"
        aria-label="Select programming language"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange?.(e.target.value)}
        disabled={disabled}
        className="sr-only"
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="language-selector-button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className="inline-flex cursor-pointer items-center justify-between gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{selectedName}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-500 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && !disabled && (
        <ul
          role="menu"
          aria-label="Programming languages"
          className="absolute right-0 z-30 mt-1 min-w-[125px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-slate-900/5 focus:outline-none"
        >
          {languages.map((lang) => {
            const isSelected = lang.id === selectedLanguage;

            return (
              <li
                key={lang.id}
                role="menuitem"
                onClick={() => handleSelect(lang.id)}
                className={`flex cursor-pointer items-center rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 ${
                  isSelected ? "font-semibold text-slate-900" : "text-slate-700"
                }`}
              >
                {/* Tick mark on the left of the selected option */}
                {isSelected ? (
                  <Check
                    data-testid={`tick-${lang.id}`}
                    aria-hidden="true"
                    className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-blue-600"
                  />
                ) : (
                  <span
                    className="mr-1.5 inline-block h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>{lang.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default LanguageSelector;
