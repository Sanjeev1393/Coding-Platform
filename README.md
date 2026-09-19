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
- [Running with Docker Compose (Demo Mode)](#running-with-docker-compose-demo-mode)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Useful Compose Commands](#useful-compose-commands)
  - [Service Architecture & DNS Resolution](#service-architecture--dns-resolution)
- [Hybrid Local Development Mode](#hybrid-local-development-mode)
  - [1. Start Piston via Compose](#1-start-piston-via-compose)
  - [2. Start Spring Boot on Windows/Host](#2-start-spring-boot-on-windowshost)
  - [3. Start React/Vite on Windows/Host](#3-start-reactvite-on-windowshost)
  - [Network Address Differences](#network-address-differences)
- [Piston Runtime Persistence & Bootstrap](#piston-runtime-persistence--bootstrap)
- [Resource Usage & Monitoring](#resource-usage--monitoring)
- [Troubleshooting](#troubleshooting)
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

> **Project status:** Active development. Dynamic question loading via REST API, automated multi-language evaluation (Java, Python, JavaScript, C++), sequential test-case progression, and hidden benchmark verification are working end-to-end through **Spring Boot**, **Docker**, and **Piston**.

---

## Current Demo

The current prototype allows a candidate to:

- Fetch DSA programming questions **dynamically from the backend REST API** (`GET /api/questions`) with resilient offline caching
- View rich problem descriptions, constraints, examples, and signature metadata
- Navigate between multiple questions with code **retained per-question and per-language**
- Write code in a **Monaco-based editor** (the same editor engine powering VS Code)
- Switch between **Java, JavaScript, and Python** language templates with idiomatic starter stubs dynamically generated from function signatures
- Provide custom standard input through a collapsible console panel
- **Run Code** against custom input or visible sample test cases with immediate feedback
- **Submit Solution** (`POST /api/execute/submit`) evaluated automatically by the backend judging engine against both visible examples and **hidden benchmark test cases**
- Watch **sequential step-through test case evaluation** in real time with an optional "Skip Animation" control
- Inspect granular test case results with **execution timing, memory metrics, and expected vs. actual diffs** (with hidden test cases safely masked)
- Retain submission evaluation results per-question across navigation, displaying a **✓ Solved** status badge
- Complete an assessment with a **30-minute countdown timer** (locks code editing and execution on expiry or submission)
- Use **keyboard shortcuts** — `Ctrl+Enter` / `Cmd+Enter` to run code, `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` to submit solution
- Finalize the assessment using the global **"Finish Assessment"** action backed by a modal confirmation dialog

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
| Dynamic Question Loading | Fetched via `GET /api/questions` from Spring Boot REST API with cached offline fallback |
| Timed Assessment Screen | 30-minute countdown timer with urgency threshold (< 5 mins) and automatic assessment locking |
| Question Display & Examples | Rich descriptions, constraints, examples decomposed into clean cards (`ExampleCard`), and signatures |
| Question Navigation | Previous/Next navigation preserving code, custom inputs, and submission status across questions |
| Solved Status Badges | Dynamic **✓ Solved** badge displayed on question panel and preserved upon navigation |
| Multi-Language Starter Code | Idiomatic stubs dynamically generated from function signature metadata for Java, JavaScript, Python, and C++ |
| Code Persistence | Candidate code retained in memory per-question and per-language during navigation |
| Custom Input Panel | Collapsible console panel for supplying custom standard input |
| Sequential Test-Case Stepper | Real-time step-through evaluation animation across all test cases with a "Skip Animation" option |
| Granular Result Breakdown | Decomposed `ExecutionResultBanner` + `TestCaseAccordionItem` showing status icons, timings, memory, and expected vs actual diffs |
| Hidden Test Case Masking | Backend keeps benchmark test case inputs and expected outputs secure; displayed as masked `Hidden Case` pills |
| Separate Submission Flows | Individual question submissions evaluate test cases; a dedicated **Finish Assessment** button locks the test via modal confirmation |
| Keyboard Shortcuts | `Ctrl/Cmd + Enter` to run; `Ctrl/Cmd + Shift + Enter` to submit solution |
| Empty State Handling | Fallback view rendered gracefully when no questions are available |

### Code Editor

| Feature | Detail |
|---|---|
| **Monaco Editor** Integration | Browser-based VS Code-grade editing experience |
| Syntax Highlighting | Context-aware styling for Java, JavaScript, Python, and C++ |
| Editor Controls | Line numbers, code folding, bracket matching, and smooth scrolling |
| Starter Code Generation | Dynamically derived from signature metadata rather than static templates |
| Multi-Language Templates | Idiomatic stubs for Java (`class Solution`), JavaScript, Python, and C++ |
| Language Selector | Switches syntax highlighting and active code stub smoothly |

### Automated Evaluation & Judging Engine

| Feature | Detail |
|---|---|
| **Submission Evaluation API** | Solutions evaluated via `POST /api/execute/submit` against problem test suites |
| **`EvaluationService`** | Wraps solution code into language harnesses, executes sequentially via Piston, and fails fast on errors |
| **`OutputComparator`** | Multi-strategy normalizer comparing outputs: exact match, whitespace trimming, floating-point epsilon (`1e-6`), and JSON/array structural equality |
| **Hidden Benchmark Protection** | Hidden test cases are evaluated securely on the backend; inputs and expected values are never exposed to the client |
| **Piston Sandboxing** | Multi-container isolated execution with CPU, memory, and wall-clock execution constraints |
| **Diagnostic Capture** | Structured error mapping for `COMPILATION_ERROR`, `RUNTIME_ERROR`, `TIME_LIMIT_EXCEEDED`, and `WRONG_ANSWER` |

### Error Handling

The backend maps execution outcomes into platform-specific statuses:

| Status | Trigger Condition |
|---|---|
| `ACCEPTED` / `SUCCESS` | All test cases passed with expected outputs, or custom run succeeded |
| `WRONG_ANSWER` | Code compiled and executed successfully, but returned output that differed from expected output |
| `COMPILATION_ERROR` | Non-zero compilation exit code or compiler error diagnostics |
| `RUNTIME_ERROR` | Non-zero runtime exit code, unhandled exceptions, or signal termination |
| `TIME_LIMIT_EXCEEDED` | Timeout status or `SIGKILL` from the execution sandbox |
| `INTERNAL_ERROR` | Engine unavailable, malformed responses, or unsupported runtime requests |

Infrastructure failures (e.g. Piston unavailable) are returned as safe application messages, shielding internal stack traces from the candidate interface.

### Testing

| Layer | Coverage |
|---|---|
| **Frontend Test Suite** | **220 automated tests across 21 test files** run via Vitest & React Testing Library |
| **Frontend Components** | Unit & behavioral tests for `QuestionPanel`, `EditorPanel`, `ExecutionResult`, `ExecutionResultBanner`, `TestCaseAccordionItem`, `OutputPanel`, `LanguageSelector`, `CustomInputPanel`, and `ConsoleTabs` |
| **Frontend E2E Flow** | Complete assessment flow in `App.test.jsx` (navigation, timer preservation, multi-language switching, submission, solved badges, keyboard shortcuts, and timeout locking) |
| **Custom Hooks** | `useAssessmentTimer`, `useKeyboardShortcuts`, `useQuestionSession`, `useCodeExecution`, and `useQuestions` |
| **Utilities & Services** | `resultValidator`, `languageUtils`, `formatExample`, `formatTime`, `formatValue`, `testRunnerService`, and `questionApi` |
| **Backend Unit Tests** | JUnit 5 + Mockito for `EvaluationServiceTest`, `OutputComparatorTest`, `QuestionControllerTest`, `ExecutionControllerTest`, `ExecutionServiceTest`, and `PistonExecutionProviderTest` |
| **Piston Response Mapping** | `MockRestServiceServer` tests for success, compilation failure, runtime failure, timeout, and service degradation |

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
        +-- GET  /api/questions           --> QuestionController (QuestionRepository)
        +-- POST /api/v1/executions       --> ExecutionController (Interactive Run)
        +-- POST /api/execute/submit      --> ExecutionController (Automated Evaluation)
                                                  |
                                                  v
                                          EvaluationService
                                                  |
                                                  +--> OutputComparator
                                                  +--> CodeExecutionProvider (Piston)
                                                                |
                                                                v
                                                       Piston in Docker (Port 2000)
                                                                |
                                                      Runtimes (Java, Python, JS, C++)
```

### Execution & Evaluation Flows

#### 1. Question Discovery Flow
- On load, React invokes `useQuestions()`, which fetches problem definitions via `GET /api/questions`.
- The backend's `QuestionRepository` strips hidden benchmark test case expected values, providing clean descriptions, constraints, examples, and function signatures.
- React caches questions in state and gracefully falls back to mock fixtures if the backend is temporarily unreachable.

#### 2. Interactive Run Flow (Custom Input & Sample Tests)
1. Candidate writes code in the **Monaco Editor** and clicks **Run Code** (or presses `Ctrl+Enter`).
2. Frontend dispatches code, selected language, and standard input to `POST /api/v1/executions`.
3. Backend wraps code with `HarnessGenerator` and executes via Piston sandbox.
4. Output, execution time, and stdout/stderr are returned to the client console.

#### 3. Automated Judging Flow (Submit Solution)
1. Candidate clicks **Submit Solution** (or presses `Ctrl+Shift+Enter`).
2. Frontend dispatches `POST /api/execute/submit` containing `questionId`, `language`, and `sourceCode`.
3. **`EvaluationService`** iterates through all visible and hidden test cases:
   - Wraps source code in a language-specific driver.
   - Executes each case sequentially via Piston, monitoring execution time and memory.
   - Compares actual vs expected output using **`OutputComparator`** (exact, trimmed whitespace, float epsilon `1e-6`, and array structural equivalence).
   - Fails fast on the first failing test case or compilation/runtime error.
4. Returns an **`EvaluationResult`** with granular test case results. Benchmark test cases have their inputs and expected values masked (`isHidden: true`) to maintain integrity.
5. The UI displays the verdict in **`ExecutionResultBanner`**, steps through sequential evaluation animations, and expands diffs in **`TestCaseAccordionItem`**.
6. The question is marked with a **✓ Solved** badge, retained across question navigation.

### Backend Layer Design

```
QuestionController                 ExecutionController
        |                                  |
QuestionRepository                  EvaluationService / ExecutionService
        |                                  |
InMemoryQuestionRepository          OutputComparator / CodeExecutionProvider
                                           |
                                    PistonExecutionProvider
                                           |
                                    Piston API (Docker)
```

---

## Project Structure

```
Coding-Platform/
├── frontend/                               # React application
│   ├── src/
│   │   ├── components/                     # UI components with co-located tests
│   │   │   ├── AssessmentHeader.jsx        # Countdown timer & Finish Assessment trigger
│   │   │   ├── CodeEditor.jsx              # Monaco Editor integration
│   │   │   ├── ConfirmDialog.jsx           # Modal confirmation dialog for assessment submission
│   │   │   ├── ConsoleTabBar.jsx           # Tab selector (Testcase vs Test Result)
│   │   │   ├── ConsoleTabs.jsx             # Collapsible bottom console container
│   │   │   ├── CustomInputPanel.jsx        # Stdin console textarea
│   │   │   ├── EditorPanel.jsx             # Language selector, editor, run/submit action bar
│   │   │   ├── EmptyAssessment.jsx         # Graceful empty state fallback
│   │   │   ├── ExecutionResult.jsx         # High-level evaluation coordinator
│   │   │   ├── ExecutionResultBanner.jsx   # Decomposed verdict banner, metrics & skip animation
│   │   │   ├── LanguageSelector.jsx        # Multi-language selector dropdown
│   │   │   ├── OutputPanel.jsx             # Raw execution output panel
│   │   │   ├── QuestionPanel.jsx           # Problem description & decomposed ExampleCards
│   │   │   ├── StatusBanner.jsx            # Submission confirmation notification
│   │   │   ├── TestCaseAccordionItem.jsx   # Decomposed test-case row, status icon & diff block
│   │   │   └── TestCasePanel.jsx           # Sample test case selector and input viewer
│   │   ├── hooks/
│   │   │   ├── useAssessmentTimer.js       # Countdown timer & urgency hook
│   │   │   ├── useCodeExecution.js         # Code execution & submission orchestration hook
│   │   │   ├── useKeyboardShortcuts.js     # Cross-platform keyboard shortcuts hook
│   │   │   ├── useQuestions.js             # Dynamic question fetching & caching hook
│   │   │   └── useQuestionSession.js       # Per-question code & navigation state hook
│   │   ├── services/
│   │   │   ├── executionApi.js             # REST client for runs and submissions
│   │   │   ├── questionApi.js              # REST client for question fetching
│   │   │   └── testRunnerService.js        # Execution orchestration and adapter service
│   │   ├── utils/
│   │   │   ├── formatExample.js            # Example formatting and normalization utility
│   │   │   ├── formatTime.js               # mm:ss time formatting utility
│   │   │   ├── formatValue.js              # Output formatting utility
│   │   │   ├── languageUtils.js            # Multi-language type mappings & signatures
│   │   │   └── resultValidator.js          # Output validation strategies
│   │   ├── __tests__/
│   │   │   └── mockQuestions.js            # Test fixtures for questions and test cases
│   │   ├── constants.js                    # Assessment durations, language configs
│   │   └── App.jsx                         # Root assessment orchestration component
│   ├── nginx.conf                          # Nginx reverse proxy & SPA fallback configuration
│   ├── Dockerfile                          # Multi-stage build (Node 22 -> Nginx Alpine)
│   ├── .dockerignore                       # Frontend build exclusions
│   └── package.json
│
├── backend/                                # Spring Boot application
│   ├── src/main/java/com/codingplatform/backend/
│   │   ├── controller/
│   │   │   ├── ExecutionController.java    # Interactive run and submission endpoints
│   │   │   ├── HealthController.java       # Healthcheck endpoint
│   │   │   └── QuestionController.java     # Dynamic question discovery endpoints
│   │   ├── dto/
│   │   │   ├── EvaluationResult.java       # Automated evaluation verdict and case details
│   │   │   ├── ExecutionRequest.java       # Interactive run request DTO
│   │   │   ├── ExecutionResponse.java      # Interactive run response DTO
│   │   │   ├── ExecutionStatus.java        # Platform status enum (ACCEPTED, WRONG_ANSWER, etc.)
│   │   │   ├── FunctionParam.java          # Parameter metadata
│   │   │   ├── FunctionSignature.java      # Function signature metadata
│   │   │   ├── QuestionResponse.java       # Safe question DTO (hidden cases masked)
│   │   │   ├── SubmissionRequest.java      # Solution submission DTO
│   │   │   └── TestCaseResult.java         # Single test case evaluation result DTO
│   │   ├── model/
│   │   │   ├── QuestionDefinition.java     # Core question domain model
│   │   │   └── TestCase.java               # Test case domain model (with isHidden flag)
│   │   ├── repository/
│   │   │   ├── InMemoryQuestionRepository.java # In-memory curated question store
│   │   │   └── QuestionRepository.java     # Repository interface abstraction
│   │   ├── service/
│   │   │   ├── EvaluationService.java      # Judging engine evaluating test case suites
│   │   │   ├── ExecutionService.java       # Single execution service
│   │   │   └── OutputComparator.java       # Multi-tiered output comparison engine
│   │   └── provider/
│   │       ├── CodeExecutionProvider.java  # Execution provider interface
│   │       └── piston/
│   │           ├── PistonExecutionProvider.java # Piston integration provider
│   │           ├── PistonProperties.java   # Configurable timeouts and endpoints
│   │           ├── dto/                    # Piston REST API DTOs
│   │           └── harness/
│   │               └── HarnessGenerator.java   # Dynamic test driver generator
│   ├── src/test/                               # JUnit 5, Mockito & MockMvc tests
│   ├── Dockerfile                              # Multi-stage build (Temurin JDK 21 -> JRE 21)
│   ├── .dockerignore                           # Backend build exclusions
│   ├── pom.xml
│   └── mvnw.cmd
│
├── compose.yaml                        # Root Docker Compose multi-service orchestration
└── README.md
```

---

## Running with Docker Compose (Demo Mode)

The entire platform — React frontend, Spring Boot backend, Piston execution engine, and Java runtime package — can be built and launched with a single Docker Compose command.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+ recommended)
- **WSL 2** backend enabled on Windows

---

### Quick Start

Start all services in detached mode with automatic image building:

```bash
docker compose up --build -d
```

Once the startup completes and health checks transition to healthy:
- **Frontend Application:** Open **[http://localhost:5173](http://localhost:5173)** in your browser.
- **Backend Health Check:** **[http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)**
- **Piston Runtimes Endpoint:** **[http://127.0.0.1:2000/api/v2/runtimes](http://127.0.0.1:2000/api/v2/runtimes)**

---

### Useful Compose Commands

| Action | Command |
|---|---|
| View container status and health | `docker compose ps` |
| View live aggregated logs | `docker compose logs -f` |
| View logs for a specific service | `docker compose logs -f backend` (or `frontend`, `piston`) |
| Inspect real-time resource consumption | `docker stats --no-stream` |
| Stop all containers safely | `docker compose down` |
| Stop containers and delete volumes | `docker compose down -v` *(Warning: removes installed Piston runtimes)* |

---

### Service Architecture & DNS Resolution

Inside Docker Compose, services communicate over a private bridge network (`personalproject_default`) using Docker's internal DNS resolver:

```
Browser Client
     │  http://localhost:5173
     ▼
Frontend Container (Nginx on port 80, mapped to host 127.0.0.1:5173)
     │  Proxies /api/* to http://backend:8080/* (Docker internal DNS)
     ▼
Backend Container (Spring Boot JRE 21 on port 8080, mapped to host 127.0.0.1:8080)
     │  Calls http://piston:2000/api/v2/execute (Docker internal DNS)
     ▼
Piston Execution Sandbox (Piston on port 2000, mapped to host 127.0.0.1:2000)
```

- **Browser to Backend:** The browser only talks to `http://localhost:5173`. Nginx transparently proxies all `/api/*` traffic to the backend container (`http://backend:8080`). The browser never needs to resolve the Docker hostname `backend`.
- **Backend to Piston:** Inside the container, the backend reaches Piston via `http://piston:2000` (configured via `PISTON_BASE_URL` in `compose.yaml`).

---

## Hybrid Local Development Mode

If you prefer developing code locally with fast hot-reloading (Vite HMR for React and Spring Boot devtools for Java), you can run Piston inside Docker while running frontend and backend directly on your Windows/host machine:

### 1. Start Piston via Compose

Start only the Piston execution engine (and its initialization helper):

```bash
docker compose up -d piston
```

Piston binds to `127.0.0.1:2000` on your host machine.

### 2. Start Spring Boot on Windows/Host

Open a terminal in the `backend/` directory:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The local backend automatically reads its default configuration from `application.properties`:
```properties
execution.piston.base-url=${PISTON_BASE_URL:http://127.0.0.1:2000}
```
Because no `PISTON_BASE_URL` override is needed, the local backend immediately communicates with the containerized Piston at `127.0.0.1:2000`.

### 3. Start React/Vite on Windows/Host

Open a terminal in the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Vite's local development server proxies `/api` calls to `http://localhost:8080` without requiring changes to JavaScript code.

---

### Network Address Differences

| Workflow Mode | Backend `PISTON_BASE_URL` | Why? |
|---|---|---|
| **Local Development** | `http://127.0.0.1:2000` | Host process communicates with Docker's published port on the host loopback interface (`127.0.0.1`). |
| **Docker Compose Mode** | `http://piston:2000` | The backend container communicates with the Piston container across the Compose bridge network using service-name DNS resolution (`piston`). |

> **Important:** `localhost` inside a Docker container refers exclusively to that container's own network namespace, **not** your laptop or sibling containers. Hence, the containerized backend must use `http://piston:2000`, not `localhost:2000`. No code changes are required: `application.properties` specifies `${PISTON_BASE_URL:http://127.0.0.1:2000}`, which defaults to `127.0.0.1:2000` for local runs and is set to `http://piston:2000` in `compose.yaml`.

---

## Piston Runtime Persistence & Bootstrap

Piston runs isolated compilers and interpreters from its `/piston/packages` directory. In our `compose.yaml`, this directory is mounted to a named Docker volume (`piston-packages`).

### Automated Initialization

When starting the stack via `docker compose up -d`:
1. The `piston-init` service waits for Piston to report healthy.
2. It queries `http://piston:2000/api/v2/runtimes`.
3. If Java `15.0.2` is not yet installed in the volume, `piston-init` calls Piston's package API (`POST /api/v2/packages`) to download and register Java `15.0.2`.
4. Once verified, `piston-init` exits `0`, and Spring Boot starts.
5. On all subsequent startups, `piston-init` detects that Java `15.0.2` is already present and exits in milliseconds without downloading anything.

### Manual Bootstrap (Optional Fallback)

If you ever start Piston without `piston-init` or want to install runtimes manually from the host terminal, send a POST request directly to Piston:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:2000/api/v2/packages" -Method Post -ContentType "application/json" -Body '{"language":"java","version":"15.0.2"}'
```

Verify installed runtimes:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:2000/api/v2/runtimes"
```

---

## Resource Usage & Monitoring

To monitor container memory and CPU footprint across the Compose stack, run:

```bash
docker stats --no-stream
```

Typical idle baseline metrics:

| Container | Image | Memory Usage | Memory % | Role |
|---|---|---|---|---|
| `personalproject-frontend-1` | `personalproject-frontend` (Nginx) | ~8 MiB | 0.11% | Static asset server & reverse proxy |
| `personalproject-backend-1` | `personalproject-backend` (Spring Boot) | ~220 MiB | 2.8% | REST API, validation, test harness generator |
| `personalproject-piston-1` | `piston:latest` (Node + Isolate) | ~270 MiB | 3.5% | Code execution sandbox & compiler runner |

> **Note on Docker Resource Usage:** Docker containers share the host Linux kernel (via WSL 2 on Windows) but maintain their own processes, userland tools, and JVM/Node heaps. Containerization provides process and network isolation rather than reducing laptop RAM usage.

---

## Troubleshooting

### 1. Port `5173`, `8080`, or `2000` already in use
- **Cause:** A local dev process (`npm run dev`, `mvnw`, or a previous standalone Piston container) is already bound to that port.
- **Fix (PowerShell):** Find the listening PID and stop it:
  ```powershell
  netstat -ano | findstr ":5173 :8080 :2000"
  Stop-Process -Id <PID> -Force
  ```
  If an older Docker container is holding port 2000:
  ```bash
  docker stop piston_api
  ```

### 2. Piston runtime list is empty
- **Cause:** Piston was started with a fresh volume before the runtime was initialized.
- **Fix:** Run the bootstrap command:
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:2000/api/v2/packages" -Method Post -ContentType "application/json" -Body '{"language":"java","version":"15.0.2"}'
  ```

### 3. Backend cannot resolve `piston`
- **Cause:** The backend container is running outside the Compose network or `PISTON_BASE_URL` was overridden with `localhost`.
- **Fix:** Ensure both services are defined in `compose.yaml` under the same network and verify container status with `docker compose ps`.

### 4. Frontend receives a `502 Bad Gateway`
- **Cause:** Nginx started before Spring Boot finished its context initialization.
- **Fix:** Our `compose.yaml` uses `depends_on` with `condition: service_healthy` based on Spring Boot's `/actuator/health` probe. If you encounter a temporary 502, check `docker compose logs backend` to confirm the Spring application started.

### 5. Docker Desktop / WSL 2 is not running
- **Cause:** Docker daemon is stopped or unreachable.
- **Fix:** Start Docker Desktop and confirm `docker ps` returns successfully.

### 6. Cold Java execution reaches a timeout
- **Cause:** The very first Java compilation inside a fresh container may take 2–3 seconds due to JVM JIT warmup and class loading.
- **Fix:** Piston server limits are configured to `10000` ms (`PISTON_RUN_TIMEOUT=10000`), and backend read timeout is set to `10000` ms (`PISTON_READ_TIMEOUT_MS=10000`), allowing sufficient headroom for cold runs. Subsequent runs typically complete in under 1 second.

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

- **Piston and Docker** must be running locally before starting the backend service.
- Questions, sample data, and candidate submissions are currently held **in memory** (`InMemoryQuestionRepository`, client state) and are not persisted to a relational database.
- **User authentication and role-based access control** (recruiter vs candidate) are not yet implemented.
- The prototype is configured for local assessment demonstrations and requires container hardening, rate limiting, and network isolation before public multi-tenant deployment.

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

### Phase 2 — Automatic Evaluation & Dynamic Question Bank _(complete)_

- [x] Dynamic question discovery via backend REST API (`GET /api/questions`)
- [x] Question repository abstraction with `InMemoryQuestionRepository`
- [x] Automatic judging engine on backend (`POST /api/execute/submit` via `EvaluationService`)
- [x] Multi-language submission evaluation support (Java, Python, JavaScript, C++)
- [x] Server-side protection for hidden benchmark test cases (inputs and expected values masked)
- [x] Accurate differentiation between `WRONG_ANSWER`, `COMPILATION_ERROR`, and `RUNTIME_ERROR`
- [x] Multi-strategy output comparator (`OutputComparator`: exact, whitespace, float epsilon, JSON/array)
- [x] Sequential test-case stepper animation with "Skip Animation" option
- [x] Granular execution breakdown with execution time, memory usage, and expected vs actual diffs
- [x] Component decomposition (`ExecutionResultBanner`, `TestCaseAccordionItem`, `ExampleCard`)
- [x] Submissions persisted per-question with **✓ Solved** badge across question navigation
- [x] Dedicated "Finish Assessment" confirmation modal workflow
- [x] Comprehensive end-to-end tests (220 frontend tests, JUnit evaluation suites)

---

### Phase 3 — Assessment Management _(next)_

- [ ] Candidate authentication and test session management
- [ ] Recruiter and evaluator administration roles
- [ ] Assessment creation and question bank management
- [ ] Candidate invitation links and scheduled test windows
- [ ] Real-time candidate status tracking
- [ ] Evaluation reports and exportable assessment summaries

---

### Phase 4 — Extended Language Optimization & Performance

- [ ] Language-specific memory and time limit fine-tuning
- [ ] Additional algorithmic data structures in test harnesses (trees, linked lists, graphs)
- [ ] Asynchronous worker queue for concurrent submissions under high candidate load
- [ ] Advanced candidate performance telemetry (memory profiles, microbenchmark benchmarks)

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
