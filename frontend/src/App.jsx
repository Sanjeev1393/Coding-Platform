const question = {
  number: 1,
  title: "Two Sum",
  description:
    "Given an array of integers and a target, return the indices of two numbers whose sum is equal to the target.",
  sampleInput: "numbers = [2, 7, 11, 15], target = 9",
  sampleOutput: "[0, 1]",
};

const INITIAL_CODE = `public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`;

function App() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-800">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">Coding Assessment</h1>
          <p className="mt-1 text-slate-500">Java Programming Test</p>
        </div>

        <div className="rounded-md bg-blue-50 px-5 py-2.5 text-xl font-semibold text-blue-700 tabular-nums">
          30:00
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 md:grid-cols-5">
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

        <section className="flex flex-col p-7 md:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your solution</h2>
            <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              Java
            </span>
          </div>

          <textarea
            className="mt-4 min-h-[400px] flex-1 resize-y rounded-md border border-slate-400 bg-gray-900 p-4 font-mono text-[15px] leading-relaxed text-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            defaultValue={INITIAL_CODE}
            spellCheck={false}
            aria-label="Code editor"
          />

          <div className="mt-4.5 flex justify-end gap-3">
            <button
              type="button"
              className="cursor-pointer rounded-md bg-gray-200 px-4.5 py-2.5 font-semibold text-gray-800 transition hover:bg-gray-300"
            >
              Run code
            </button>

            <button
              type="button"
              className="cursor-pointer rounded-md bg-blue-600 px-4.5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Submit solution
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
