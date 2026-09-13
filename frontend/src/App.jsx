import "./App.css";

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
    <main className="assessment-page">
      <header className="assessment-header">
        <div>
          <h1>Coding Assessment</h1>
          <p>Java Programming Test</p>
        </div>

        <div className="timer">30:00</div>
      </header>

      <div className="assessment-layout">
        <section className="question-panel">
          <p className="question-number">Question {question.number} of 2</p>

          <h2>{question.title}</h2>
          <p>{question.description}</p>

          <h3>Sample input</h3>
          <pre>{question.sampleInput}</pre>

          <h3>Sample output</h3>
          <pre>{question.sampleOutput}</pre>
        </section>

        <section className="editor-panel">
          <div className="editor-header">
            <h2>Your solution</h2>
            <span>Java</span>
          </div>

          <textarea
            className="code-editor"
            spellCheck={false}
            defaultValue={INITIAL_CODE}
          />

          <div className="action-buttons">
            <button className="run-button">Run code</button>
            <button className="submit-button">Submit solution</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
