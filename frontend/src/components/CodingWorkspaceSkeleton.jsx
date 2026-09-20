import { Timer } from "lucide-react";

/**
 * CodingWorkspaceSkeleton renders a high-fidelity shimmer loading UI
 * that matches the 2-column coding assessment layout (QuestionPanel + EditorPanel).
 * Displayed while questions are loading or retrying during backend cold starts.
 *
 * Adheres to WCAG 2.1 AA accessibility standards with role="status" and aria-busy="true".
 *
 * @returns {JSX.Element} The rendered skeleton screen
 */
function CodingWorkspaceSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading coding assessment"
      className="flex h-full flex-col bg-slate-100 text-slate-800 overflow-hidden select-none"
    >
      <span className="sr-only">
        Loading coding assessment questions and workspace from server...
      </span>

      {/* Header Skeleton */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5 animate-shimmer-slow">
        <div>
          <div className="h-7 w-52 rounded-md bg-slate-200" />
          <div className="mt-2 h-4 w-40 rounded bg-slate-100" />
        </div>

        <div className="flex items-center gap-3">
          {/* Timer pill placeholder */}
          <div className="flex h-10 w-28 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3.5">
            <Timer className="h-4 w-4 text-slate-300" aria-hidden="true" />
            <div className="h-4 w-12 rounded bg-slate-200" />
          </div>

          {/* Finish assessment button placeholder */}
          <div className="h-10 w-36 rounded-md bg-slate-100 border border-slate-200" />
        </div>
      </header>

      {/* 2-Column Workspace Skeleton */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-5 min-h-0 overflow-hidden">
        {/* Left Column: Question Panel Skeleton (2 cols) */}
        <section
          aria-hidden="true"
          className="flex flex-col justify-between overflow-y-auto min-h-0 border-b border-slate-200 bg-white p-7 md:col-span-2 md:border-b-0 md:border-r animate-shimmer-slow"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="h-4.5 w-32 rounded-full bg-blue-100/70" />
              <div className="h-5 w-16 rounded-full bg-slate-100" />
            </div>

            <div className="mt-4 h-7 w-4/5 rounded-md bg-slate-200" />

            <div className="mt-4 space-y-2.5">
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-11/12 rounded bg-slate-100" />
              <div className="h-4 w-4/5 rounded bg-slate-100" />
              <div className="h-4 w-2/3 rounded bg-slate-100" />
            </div>

            {/* Example cards skeleton */}
            <div className="mt-8 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-slate-100" />
                  <div className="h-3.5 w-1/2 rounded bg-slate-100" />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-3.5 w-2/3 rounded bg-slate-100" />
                  <div className="h-3.5 w-2/5 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Pagination buttons skeleton */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
            <div className="h-9 w-24 rounded-md bg-slate-100 border border-slate-200" />
            <div className="h-9 w-20 rounded-md bg-blue-200" />
          </div>
        </section>

        {/* Right Column: Editor Panel Skeleton (3 cols) */}
        <section
          aria-hidden="true"
          className="flex flex-col overflow-y-auto min-h-0 p-7 md:col-span-3"
        >
          <div className="flex items-center justify-between animate-shimmer-slow">
            <div className="h-6 w-36 rounded-md bg-slate-200" />
            <div className="h-9 w-32 rounded-md bg-slate-200" />
          </div>

          {/* Dark editor mock: solid dark background with calm, gentle code line glow */}
          <div className="mt-4 min-h-[240px] flex-1 overflow-hidden rounded-md border border-slate-800 bg-gray-900 p-5 shadow-sm">
            <div className="flex gap-4">
              {/* Line numbers gutter */}
              <div className="flex flex-col gap-3 font-mono text-xs text-slate-600 select-none border-r border-slate-800/80 pr-3 text-right">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>

              {/* Code lines with soft, gentle glow */}
              <div className="flex-1 space-y-3 pt-0.5 animate-editor-code">
                <div className="h-3.5 w-28 rounded bg-slate-700/60" />
                <div className="h-3.5 w-48 rounded bg-slate-700/40 ml-4" />
                <div className="h-3.5 w-36 rounded bg-slate-700/35 ml-8" />
                <div className="h-3.5 w-44 rounded bg-slate-700/35 ml-8" />
                <div className="h-3.5 w-24 rounded bg-slate-700/40 ml-4" />
                <div className="h-3.5 w-10 rounded bg-slate-700/60" />
              </div>
            </div>
          </div>

          {/* Console tabs skeleton */}
          <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 shadow-2xs space-y-3 animate-shimmer-slow">
            <div className="flex gap-2">
              <div className="h-7 w-24 rounded-md bg-slate-200" />
              <div className="h-7 w-24 rounded-md bg-slate-100" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-16 rounded-md bg-slate-100" />
              <div className="h-6 w-16 rounded-md bg-slate-100" />
            </div>
            <div className="h-16 rounded-md bg-slate-50 border border-slate-100 p-3">
              <div className="h-3.5 w-1/3 rounded bg-slate-200" />
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="mt-4.5 flex flex-shrink-0 justify-end gap-3 pb-1 animate-shimmer-slow">
            <div className="h-10 w-24 rounded-md bg-slate-200" />
            <div className="h-10 w-36 rounded-md bg-blue-300" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default CodingWorkspaceSkeleton;
