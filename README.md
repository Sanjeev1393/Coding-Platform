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
│   │   │   ├── StatusBanner.jsx
│   │   │   └── TestCasePanel.jsx
│   │   ├── hooks/
│   │   │   ├── useAssessmentTimer.js   # Countdown timer hook
│   │   │   └── useKeyboardShortcuts.js # Cross-platform keyboard shortcuts hook
│   │   ├── services/
│   │   │   └── executionApi.js         # Backend REST API client
│   │   ├── utils/
│   │   │   ├── formatTime.js           # Time formatting utility
│   │   │   ├── formatValue.js          # Value formatting utility
│   │   │   ├── languageUtils.js        # Type mapping and signature generator
│   │   │   └── resultValidator.js      # Output validation strategies
│   │   ├── constants.js                # Questions, test cases, language configs
│   │   └── App.jsx                     # Root assessment orchestration component
│   ├── nginx.conf                      # Nginx reverse proxy & SPA fallback configuration
│   ├── Dockerfile                      # Multi-stage build (Node 22 -> Nginx Alpine)
│   ├── .dockerignore                   # Frontend build exclusions
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
│   ├── Dockerfile                      # Multi-stage build (Temurin JDK 21 -> JRE 21)
│   ├── .dockerignore                   # Backend build exclusions
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
