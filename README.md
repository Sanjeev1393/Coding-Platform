# Coding Assessment Platform

> **Tech Stack at a glance:** **React** · **Vite** · **Tailwind CSS** · **Monaco Editor** · **Java 21** · **Spring Boot** · **Spring RestClient** · **Piston** · **Docker** · **Vitest** · **React Testing Library** · **JUnit** · **Mockito**

A full-stack coding assessment platform for conducting timed programming tests and automatically executing candidate code — designed to replace a manual, error-prone hiring process with an interactive coding environment.

## Demo Video

> Watch the prototype in action — end-to-end Java code execution, error handling, and the candidate assessment workflow as it stands today.

**[▶ View Progress Demo on Google Drive](https://drive.google.com/drive/folders/1E2D34hlyobmhUElrEJEIJ16rXzOCO57f?usp=sharing)**

---

## Table of Contents

- [Why This Project Exists](#why-this-project-exists)
- [Current Demo](#current-demo)
- [Problem Being Solved](#problem-being-solved)
- [Implemented Features](#implemented-features)
  - [Candidate Interface](#candidate-interface)
  - [Code Editor](#code-editor)
  - [Java Execution](#java-execution)
  - [Result Validator](#result-validator)
  - [Error Handling](#error-handling)
  - [Testing](#testing)
- [Technology Stack](#technology-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Code Execution](#code-execution)
- [Architecture](#architecture)
  - [Execution Flow](#execution-flow)
  - [Backend Layer Design](#backend-layer-design)
- [Project Structure](#project-structure)
- [Running the Project Locally](#running-the-project-locally)
  - [Prerequisites](#prerequisites)
  - [1. Clone this repository](#1-clone-this-repository)
  - [2. Start Piston](#2-start-piston)
  - [3. Start the Spring Boot backend](#3-start-the-spring-boot-backend)
  - [4. Start the React frontend](#4-start-the-react-frontend)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
  - [Frontend tests](#frontend-tests)
  - [Backend tests](#backend-tests)
- [Production Builds](#production-builds)
- [Current Limitations](#current-limitations)
- [Roadmap](#roadmap)
- [Future Vision](#future-vision)
- [Security Note](#security-note)
- [Author](#author)

---

## Why This Project Exists

At many companies — including ours — the DSA interview round looks like this:

1. A candidate receives programming questions over email.
2. They write solutions in **Google Docs** — no syntax highlighting, no compiler, no feedback.
3. An evaluator manually reads every answer, _guesses_ whether it would compile, and hand-scores it.
4. Results are assembled manually, often inconsistently.

This does not scale. It is slow when a single evaluator reviews ten candidates. It breaks entirely during a hiring sprint or a company hackathon.

**This platform aims to replace that manual process** by providing an interactive code editor, real-time sandboxed code execution, automated test-case evaluation, and structured assessment reporting.

> **Project status:** Active development. Java code execution is working locally through **Spring Boot**, **Docker**, and **Piston**. Multi-test submission scoring, authentication, and administration features are planned next.

---

## Current Demo

The current prototype allows a candidate to:

- View programming questions with descriptions, sample input, and sample output
- Navigate between multiple questions with code **retained per-question and per-language**
- Write code in a **Monaco-based editor** (the same editor engine used by VS Code)
- Switch between **Java, JavaScript, and Python** language templates with idiomatic starter code generated automatically from question signature metadata
- Provide custom standard input through an expandable console panel
- **Run Java code** through a real execution engine (Piston in Docker)
- View standard output and wall-clock execution time
- See structured **compilation errors, runtime errors, and timeout errors**
- Complete an assessment with a **30-minute countdown timer** (code editing and execution lock on expiry or submission)
- Use **keyboard shortcuts** — `Ctrl+Enter` / `Cmd+Enter` to run code, `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` to submit

> Java is currently the only language connected to the execution backend. JavaScript and Python templates are visible in the interface, but their execution engines are planned for Phase 4.

---

## Problem Being Solved

**Current manual process:**

```
Candidate receives questions
        |
Writes solutions in Google Docs (no editor, no compiler)
        |
Evaluator manually checks syntax and logic
        |
Evaluator estimates whether code would compile
        |
Results prepared manually
```

This is slow, inconsistent, and difficult to scale.

**Target automated workflow:**

```
Create assessment
        |
Invite candidates
        |
Candidates write and execute code in a real editor
        |
Solutions run against visible and hidden test cases
        |
Scores and evaluation reports generated automatically
```

---

## Implemented Features

### Candidate Interface

| Feature | Detail |
|---|---|
| Timed assessment screen | 30-minute countdown timer; interface locks on expiry or confirmation |
| Question display | Title, description, sample input, and sample output |
| Question navigation | Previous and Next navigation preserving per-question code and input |
| Per-language starter code | Auto-generated from the question's function signature metadata |
| Code persistence | Candidate code retained in memory per-question and per-language during navigation |
| Custom input panel | Collapsible console panel for supplying custom standard input |
| Execution loading state | Run and submit actions disabled while execution is in flight |
| Result display | Standard output, execution time (ms), and error diagnostics |
| Keyboard shortcuts | `Ctrl/Cmd + Enter` to run; `Ctrl/Cmd + Shift + Enter` to submit |
| Confirm dialog | Modal confirmation dialog before submitting the assessment |
| Empty state handling | Fallback view rendered gracefully when no questions are available |

### Code Editor

| Feature | Detail |
|---|---|
| **Monaco Editor** integration | Browser-based VS Code-grade editing experience |
| Syntax highlighting | Context-aware styling for Java, JavaScript, and Python |
| Editor controls | Line numbers, code folding, bracket matching, and smooth scrolling |
| Starter code generation | Dynamically derived from signature metadata rather than static templates |
| Multi-language templates | Idiomatic stubs for Java (`class Solution`), JavaScript, and Python |
| Language selector | Switches syntax highlighting and active code stub smoothly |

### Java Execution

| Feature | Detail |
|---|---|
| **React to Spring Boot** API | Candidate submissions dispatched via `POST /api/v1/executions` |
| **Piston** execution engine | Sandboxed local execution running via Docker Compose |
| **Java 15.0.2** runtime | Compiles and executes submitted Java code |
| Test harness generation | Backend `HarnessGenerator` wraps solution methods into an executable driver with input parsing and output serialization |
| Custom stdin support | Standard input forwarded directly to the running process |
| Diagnostic capture | Backend captures and returns `stdout`, `stderr`, and wall-clock execution time (backend also monitors memory metrics) |

### Result Validator

A dedicated `resultValidator.js` utility is implemented on the frontend and covered by automated tests, supporting three validation strategies for client-side sample execution feedback:

- **`exact`** — Strict primitive equality or deep JSON equivalence
- **`unordered_array`** — Array equality ignoring element order (used for questions like Two Sum)
- **`floating_point`** — Numeric equality within a `1e-5` tolerance margin

> **Architecture Note:** While `resultValidator.js` handles visible sample/custom runs in the browser, final submission evaluation against hidden test cases will be handled exclusively on the backend (e.g. via a future `EvaluationService`/`JudgeService`). Hidden test inputs and expected outputs must never be exposed to the client.

### Error Handling

The backend maps execution outcomes into platform-specific statuses:

| Status | Trigger Condition |
|---|---|
| `SUCCESS` | Zero exit code and no runtime error signals |
| `COMPILATION_ERROR` | Non-zero compilation exit code or compiler error diagnostics |
| `RUNTIME_ERROR` | Non-zero runtime exit code, unhandled exceptions, or signal termination |
| `TIME_LIMIT_EXCEEDED` | Timeout status or `SIGKILL` from the execution sandbox |
| `INTERNAL_ERROR` | Engine unavailable, malformed responses, or unsupported runtime requests |

Infrastructure failures (e.g. Piston unavailable) are returned as safe application messages, shielding internal stack traces from the candidate interface.

### Testing

| Layer | Coverage |
|---|---|
| **Frontend components** | Vitest + React Testing Library for `QuestionPanel`, `EditorPanel`, `ExecutionResult`, `OutputPanel`, `LanguageSelector`, `CustomInputPanel`, and `ConsoleTabs` |
| **Custom hooks** | `useAssessmentTimer` (tick accuracy, pause/expire), `useKeyboardShortcuts` (cross-platform key handling) |
| **Utilities** | `formatTime`, `languageUtils` (type mapping, signature generation, storage keys), `resultValidator` (exact, unordered, floating point) |
| **Backend unit tests** | JUnit 5 + Mockito for `ExecutionService` and `PistonExecutionProvider` |
| **Piston response mapping** | `MockRestServiceServer` tests for success, compilation failure, runtime failure, timeout, and service degradation |

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React** | Component-based user interface |
| **Vite** | Development server and production build tooling |
| **Tailwind CSS** | Utility-first styling and responsive layout |
| **Monaco Editor** | Browser-based code editing engine |
| **Vitest** | Fast unit and component test runner |
| **React Testing Library** | Accessible, user-centric component testing |

### Backend

| Technology | Purpose |
|---|---|
| **Java 21** | Backend application language |
| **Spring Boot** | Backend application framework |
| **Spring Web** | RESTful API endpoints |
| **Spring Validation** | DTO request validation (`@NotBlank`, `@Pattern`) |
| **Spring Boot Actuator** | Application health and operational metrics |
| **Spring RestClient** | Synchronous HTTP communication with Piston |
| **Maven Wrapper** | Reproducible builds without pre-installed Maven |
| **JUnit 5 + Mockito** | Backend test suite and mock infrastructure |

### Code Execution

| Technology | Purpose |
|---|---|
| **Piston** | High-performance code execution engine |
| **Docker Desktop** | Containerized runtime environment |
| **Docker Compose** | Multi-container orchestration for Piston |
| **Java 15.0.2 Piston runtime** | Sandboxed execution runtime for candidate Java solutions |

> **Runtime Distinction:** The Spring Boot backend runs on **Java 21**, while submitted candidate code executes inside the **Piston** sandbox using the container's installed **Java 15.0.2** runtime.

---

## Architecture

```
React UI (Vite, Port 5173)
        |
        | POST /api/v1/executions
        |
Spring Boot API (Java 21, Port 8080)
        |
        | POST /api/v2/execute
        |
Piston in Docker (Port 2000)
        |
Java Runtime 15.0.2
```

### Execution Flow

1. The candidate writes code in the **Monaco Editor**.
2. **React** sends source code, selected language, function signature metadata, and custom input to the Spring Boot API.
3. **`HarnessGenerator`** (Java) wraps the candidate's `Solution` class into a driver that parses input arguments and formats the returned value.
4. The backend sends the payload to the local **Piston API**.
5. **Piston** compiles and executes the code within an isolated container sandbox.
6. Piston returns stdout, stderr, exit codes, and execution metrics.
7. **`PistonExecutionProvider`** maps the Piston response into a structured `ExecutionResponse`.
8. **React** displays the result — output, diagnostics, and execution time — to the candidate.

### Backend Layer Design

```
ExecutionController
        |
ExecutionService
        |
CodeExecutionProvider   <-- interface abstraction
        |
PistonExecutionProvider <-- current implementation
        |
Piston API (Docker)
```

The `CodeExecutionProvider` interface decouples the execution engine from core business logic. Alternative engines (e.g. Judge0 or cloud sandboxes) can be integrated by implementing this interface without altering controllers or services.

---

## Project Structure

```
Coding-Platform/
├── frontend/                           # React application
│   ├── src/
│   │   ├── components/                 # UI components with co-located tests
│   │   │   ├── AssessmentHeader.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── ConsoleTabBar.jsx
│   │   │   ├── ConsoleTabs.jsx
│   │   │   ├── CustomInputPanel.jsx
│   │   │   ├── EditorPanel.jsx
│   │   │   ├── EmptyAssessment.jsx
│   │   │   ├── ExecutionResult.jsx
│   │   │   ├── LanguageSelector.jsx
│   │   │   ├── OutputPanel.jsx
│   │   │   ├── QuestionPanel.jsx
│   │   │   └── StatusBanner.jsx
│   │   ├── hooks/
│   │   │   ├── useAssessmentTimer.js   # Countdown timer hook
│   │   │   └── useKeyboardShortcuts.js # Cross-platform keyboard shortcuts hook
│   │   ├── services/
│   │   │   └── executionApi.js         # Backend REST API client
│   │   ├── utils/
│   │   │   ├── formatTime.js           # Time formatting utility
│   │   │   ├── languageUtils.js        # Type mapping and signature generator
│   │   │   └── resultValidator.js      # Output validation strategies
│   │   ├── constants.js                # Questions, test cases, language configs
│   │   └── App.jsx                     # Root assessment orchestration component
│   └── package.json
│
├── backend/                            # Spring Boot application
│   ├── src/main/java/com/codingplatform/backend/
│   │   ├── controller/
│   │   │   ├── ExecutionController.java
│   │   │   └── HealthController.java
│   │   ├── dto/
│   │   │   ├── ExecutionRequest.java
│   │   │   ├── ExecutionResponse.java
│   │   │   ├── ExecutionStatus.java
│   │   │   ├── FunctionParam.java
│   │   │   └── FunctionSignature.java
│   │   ├── service/
│   │   │   └── ExecutionService.java
│   │   └── provider/
│   │       ├── CodeExecutionProvider.java       # Provider interface
│   │       └── piston/
│   │           ├── PistonExecutionProvider.java # Piston provider implementation
│   │           ├── PistonProperties.java
│   │           ├── dto/                         # Piston API DTOs
│   │           └── harness/
│   │               └── HarnessGenerator.java    # Dynamic test driver generator
│   ├── src/test/
│   ├── pom.xml
│   └── mvnw.cmd
│
└── README.md
```

---

## Running the Project Locally

### Prerequisites

Install the following dependencies:

- [Git](https://git-scm.com/)
- [Node.js and npm](https://nodejs.org/) (LTS recommended)
- [Java 21](https://adoptium.net/) (JDK 21)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **WSL 2** — recommended when running Docker Desktop on Windows
- Maven is optional; the Maven Wrapper (`.\mvnw.cmd` / `./mvnw`) is included

---

### 1. Clone this repository

```bash
git clone https://github.com/Sanjeev1393/Coding-Platform.git
cd Coding-Platform
```

---

### 2. Start Piston

Piston runs as an independent execution service in Docker. Clone and run it in a **separate directory outside the Coding-Platform repository** (for example, in your parent projects directory):

```bash
# Navigate outside the Coding-Platform repository
cd ..
git clone https://github.com/engineer-man/piston.git
cd piston
```

**Configure Piston port binding and execution limits:**

Open `docker-compose.yaml` inside the cloned `piston` directory and update the `api` service to:
1. Bind the port to `127.0.0.1` so Piston is only reachable from your local machine.
2. Increase Piston's server-side execution limits (`PISTON_RUN_TIMEOUT` and `PISTON_RUN_CPU_TIME`) to `10000` ms. A fresh Piston installation defaults to a 3000 ms ceiling, which would otherwise reject our backend's 6000 ms execution request with `run_timeout cannot exceed the configured limit of 3000`.

```yaml
# docker-compose.yaml (inside the piston/ directory)
services:
  api:
    ports:
      - "127.0.0.1:2000:2000"   # was: - "2000:2000"
    environment:
      PISTON_RUN_TIMEOUT: 10000
      PISTON_RUN_CPU_TIME: 10000
```

> **Container vs. Application Variables:** `PISTON_RUN_TIMEOUT` and `PISTON_RUN_CPU_TIME` configure the **Piston container** server limits (the maximum execution duration Piston allows any caller to request). In contrast, `PISTON_RUN_TIMEOUT_MS` configures the **Spring Boot backend** application (the timeout requested per execution). They configure two separate applications.

**Start (or recreate) the Piston container:**

```bash
docker compose up -d --force-recreate api
```

**Install the Java runtime via Piston's package manager:**

```bash
cd cli
npm install
node index.js ppman install java
cd ..
```

**Verify the runtime installation:**

```bash
curl http://127.0.0.1:2000/api/v2/runtimes
```

The returned JSON array should include `java` version `15.0.2`.

> Refer to the [official Piston documentation](https://github.com/engineer-man/piston) if installation procedures change.

---

### 3. Start the Spring Boot backend

Open a new terminal and navigate to the `backend` directory inside `Coding-Platform`:

**Windows (PowerShell):**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts at: **http://localhost:8080**

---

### 4. Start the React frontend

Open another terminal and navigate to the `frontend` directory inside `Coding-Platform`:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Configuration

Backend Piston integration properties are defined in:

```
backend/src/main/resources/application.properties
```

The application supports environment-variable overrides with the following defaults:

| Environment Variable | Default Value | Description |
|---|---|---|
| `PISTON_BASE_URL` | `http://127.0.0.1:2000` | Base URL of the Piston execution service |
| `PISTON_LANGUAGE` | `java` | Language identifier requested from Piston |
| `PISTON_VERSION` | `15.0.2` | Runtime version targeted in Piston |
| `PISTON_FILE_NAME` | `Main` | Source file name provided to Piston |
| `PISTON_CONNECT_TIMEOUT_MS` | `2000` | HTTP connection timeout in milliseconds |
| `PISTON_RUN_TIMEOUT_MS` | `6000` | Execution timeout in milliseconds |
| `PISTON_READ_TIMEOUT_MS` | `10000` | HTTP read response timeout in milliseconds |

> **Timeout Relationship:** `PISTON_CONNECT_TIMEOUT_MS` (2000 ms) < `PISTON_RUN_TIMEOUT_MS` (6000 ms) < `PISTON_READ_TIMEOUT_MS` (10000 ms). The backend read timeout must exceed Piston's execution timeout so Spring Boot does not terminate the connection while the runner is still legitimately executing. Additionally, ensure the Piston container's server limits (`PISTON_RUN_TIMEOUT` and `PISTON_RUN_CPU_TIME` in `docker-compose.yaml`) are set to at least 10000 ms so Piston does not reject requests exceeding its default 3000 ms ceiling.

---

## Running Tests

### Frontend tests

Run component and utility unit tests with Vitest:

```bash
cd frontend
npm run test:run
```

### Backend tests

Run JUnit test suites and Piston integration mock tests:

**Windows (PowerShell):**

```powershell
cd backend
.\mvnw.cmd test
```

**macOS / Linux:**

```bash
cd backend
./mvnw test
```

---

## Production Builds

### Frontend

Generate an optimized production build in `frontend/dist/`:

```bash
cd frontend
npm run build
```

### Backend

Package the Spring Boot application into an executable JAR:

**Windows (PowerShell):**

```powershell
cd backend
.\mvnw.cmd clean package
```

**macOS / Linux:**

```bash
cd backend
./mvnw clean package
```

---

## Current Limitations

- Only **Java** execution is currently wired end-to-end; JavaScript and Python stubs are present in the UI but backend execution engines are not yet enabled.
- **Piston and Docker** must be running locally before starting the backend service.
- Full **hidden-test submission evaluation** is in development — running code currently executes user input or sample input rather than automatically grading against complete test suites.
- Questions, sample data, and candidate submissions are currently held **in memory** and are not persisted to a database.
- **User authentication and role-based access control** are not yet implemented.
- The prototype is configured for local assessment demonstrations and requires container hardening before public multi-tenant deployment.

---

## Roadmap

### Phase 1 — Working Prototype _(complete)_

- [x] Timed candidate assessment interface with question navigation
- [x] 30-minute countdown timer with automatic assessment locking
- [x] Monaco Editor integration with language syntax highlighting
- [x] Dynamic starter code generation from question function signatures
- [x] In-memory code and input persistence across question navigation
- [x] Custom stdin console panel with tabbed output display
- [x] Cross-platform keyboard shortcuts (`Ctrl/Cmd + Enter` to run, `Ctrl/Cmd + Shift + Enter` to submit)
- [x] React to Spring Boot REST API integration (`POST /api/v1/executions`)
- [x] Local Piston engine integration via Docker Compose
- [x] Java 15 code compilation and execution
- [x] Diagnostic mapping for compilation, runtime, and timeout errors
- [x] Dynamic test harness generator (`HarnessGenerator`) for LeetCode-style solution methods
- [x] Pluggable result validator utility (`exact`, `unordered_array`, `floating_point`)
- [x] Automated frontend test suite with Vitest and React Testing Library
- [x] Automated backend test suite with JUnit 5, Mockito, and `MockRestServiceServer`

---

### Phase 2 — Automatic Evaluation _(next)_

- [ ] Use the frontend validator for visible Run Code feedback
- [ ] Implement backend-side test-case evaluation for submissions
- [ ] Keep hidden inputs and expected outputs exclusively on the server
- [ ] Differentiate `WRONG_ANSWER` from execution runtime errors
- [ ] Display granular submission summaries (e.g. 8 / 10 test cases passed)
- [ ] Persist candidate submission attempts and execution history

---

### Phase 3 — Assessment Management

- [ ] Candidate authentication and test session management
- [ ] Recruiter and evaluator administration roles
- [ ] Assessment creation and question bank management
- [ ] Candidate invitation links and scheduled test windows
- [ ] Real-time candidate status tracking
- [ ] Evaluation reports and exportable assessment summaries

---

### Phase 4 — Extended Language Support

- [ ] JavaScript execution support via Piston
- [ ] Python execution support via Piston
- [ ] Language-specific harness drivers for function-style solutions
- [ ] Per-language memory and time limit configurations

---

### Phase 5 — Production and Scale

- [ ] Persistent relational database (PostgreSQL)
- [ ] Asynchronous execution queue for concurrent submissions
- [ ] Rate limiting and candidate request throttling
- [ ] Sandboxed container hardening and network isolation
- [ ] Observability, structured audit logs, and performance metrics
- [ ] Plagiarism and code-similarity detection

---

## Future Vision

The long-term goal is a production-grade, self-hosted coding assessment platform that empowers engineering teams to:

- Create structured DSA rounds with configurable time windows
- Invite candidates via secure links
- Evaluate solutions automatically against visible and hidden test suites
- Generate detailed performance reports with timing, memory, and code analysis
- Support multiple programming languages natively
- Host internal engineering challenges and hackathons at scale

The project has achieved its foundational technical milestone:

> A candidate can write **Java code in a browser editor**, submit it to a **Spring Boot API**, execute it inside an **isolated Piston Docker sandbox**, and receive immediate, structured feedback — demonstrating a working path away from manual Google Docs code reviews.

---

## Security Note

Executing untrusted code requires rigorous isolation and resource constraints. The current local Piston environment is appropriate for development and controlled testing.

Before public deployment, the following security controls would be required:

- Authentication and candidate identity verification
- API rate limiting and DDoS safeguards
- Strict CPU, memory, and execution duration limits
- Network isolation (disabling outbound network access within execution sandboxes)
- Queue-backed execution workers to prevent container host exhaustion
- Container security hardening and non-root execution profiles
- Comprehensive audit logging and security monitoring

---

## Author

**Sanjeev Verma**  
GitHub: [Sanjeev1393](https://github.com/Sanjeev1393)
