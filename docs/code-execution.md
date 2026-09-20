---
title: "Code Execution"
description: "How the platform safely runs user-submitted code — providers, sandboxing, harness generation, and scale."
---

# Code Execution

This is the most technically interesting and interview-rich part of the entire project.

## The Core Problem

Running user-submitted code is fundamentally dangerous. Naive approaches (e.g., `Runtime.exec()` directly on the host) create severe security risks:

- Infinite loops consuming CPU
- Memory exhaustion crashing the host
- Filesystem access or deletion
- Network calls to internal services
- Code that forks/bombs processes

The platform addresses this through **provider isolation**: execution is delegated entirely to a sandboxed external service.

## Execution Flow

```
Frontend submits code
         │
         ▼
ExecutionController.execute()
         │
         ▼
ExecutionService.execute()
         │
         ▼
CodeExecutionProvider (interface)
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
Piston      JDoodle
(local)     (cloud)
    │          │
    │  HTTP POST to execution API
    │          │
    ▼          ▼
   Sandbox executes code in isolated environment
         │
         ▼
ExecutionResponse { status, stdout, stderr, timeMs, memoryKb }
```

## Provider Strategy Pattern

The `CodeExecutionProvider` interface defines a single contract:

```java
public interface CodeExecutionProvider {
    ExecutionResponse execute(ExecutionRequest request);
}
```

Spring's `@ConditionalOnProperty` activates exactly one implementation at startup:

```java
@ConditionalOnProperty(name = "execution.provider", havingValue = "piston", matchIfMissing = true)
public class PistonExecutionProvider implements CodeExecutionProvider { ... }

@ConditionalOnProperty(name = "execution.provider", havingValue = "jdoodle")
public class JdoodleExecutionProvider implements CodeExecutionProvider { ... }
```

**Interview point**: This is the Strategy + Factory pattern. Zero code change to switch providers. The selection happens via a single environment variable.

---

## Piston Provider (Local / Dev)

**What is Piston?**
An open-source self-hosted code execution engine. Runs inside Docker. Supports 60+ languages.

**How it works:**
- Runs code in isolated containers per request
- Returns: `stdout`, `stderr`, `exit code`, `status`, `signal`, `wallTime`, `memory`
- Has a `compile` stage (for compiled languages) and a `run` stage

**Key mapping logic in `PistonExecutionProvider`:**
- `compile.code != 0` → `COMPILATION_ERROR`
- `run.status == "TO"` or `run.signal == "SIGKILL"` → `TIME_LIMIT_EXCEEDED`
- `run.code == 0` and not `"RE"` status → `SUCCESS`
- Anything else → `RUNTIME_ERROR`

**Why Piston for local?**
- Free, no API limits
- Identical behaviour to production (deterministic testing)
- Docker Compose makes it trivial to start alongside the backend

**Limitations:**
- Requires Docker running locally
- Harder to deploy on serverless/cloud (needs a persistent container)
- Not used in production because Render free tier + Docker container = cold start latency

---

## JDoodle Provider (Production)

**What is JDoodle?**
A third-party cloud-based code compilation and execution API. Pay-per-use (daily credits on free tier).

**How it works:**
- Stateless REST API: `POST https://api.jdoodle.com/v1/execute`
- Accepts: `clientId`, `clientSecret`, `script`, `stdin`, `language`, `versionIndex`
- Returns: `output` (combined stdout/stderr), `cpuTime`, `memory`, `statusCode`

**Key challenge — JDoodle mixes stdout and stderr into a single `output` field.**
Unlike Piston which separates `stdout` and `stderr`, JDoodle returns everything in `output`. The provider uses regex pattern matching to classify:

```java
// Timeout detection
Pattern.compile("(?i)\\b(time\\s*limit\\s*exceeded|timed?\\s*out)\\b")

// Compilation error detection
Pattern.compile("(?m)(^.*\\.java:\\d+:\\s*error:|\\berror:\\s+|\\b\\d+\\s+errors?\\b)")

// Runtime error detection
Pattern.compile("(?s).*(Exception in thread|java\\.lang\\.[A-Za-z]+Exception|...).*")
```

**Interview point**: Regex-based error classification is fragile. It works for the current languages (Java, Python, JS) but could break for edge cases. A more robust approach would be structured error response from the API — which JDoodle does not provide.

**Error handling in JDoodle:**
JDoodle embeds HTTP status codes *inside the JSON body* (e.g., `statusCode: 429` for quota exceeded), in addition to returning them as actual HTTP status codes. The provider handles both cases.

**Credentials management:**
- `clientId` and `clientSecret` injected via `JdoodleProperties` (from `JDOODLE_CLIENT_ID`, `JDOODLE_CLIENT_SECRET` env vars)
- Never logged. Validated at execution time with a blank check before making any API call.

---

## HarnessGenerator — Function-Level Execution

**The problem:** Users write only a function body (e.g., `twoSum()`), not a complete runnable program.

**The solution:** `HarnessGenerator` synthesises a complete driver program at runtime:

```
User writes:
  class Solution {
    public int[] twoSum(int[] nums, int target) {
      // their code
    }
  }

HarnessGenerator produces:
  class Solution {
    public int[] twoSum(...) { ... }  // user's code

    public static void main(String[] args) {
      // parse stdin: "2\n[2,7,11,15]\n9"
      // call twoSum(nums, target)
      // print result to stdout
    }
  }
```

This is then passed to Piston or JDoodle as a complete executable script.

**Interview point**: This is exactly how LeetCode-style judges work. The platform doesn't run arbitrary `main()` methods — it controls the execution harness and only lets users write the problem's function.

---

## Execution Status Model

```java
public enum ExecutionStatus {
    SUCCESS,
    WRONG_ANSWER,
    COMPILATION_ERROR,
    RUNTIME_ERROR,
    TIME_LIMIT_EXCEEDED,
    INTERNAL_ERROR
}
```

`INTERNAL_ERROR` is used when the execution engine itself fails (network error, credential issue, quota exceeded). It is deliberately separate from `RUNTIME_ERROR` which means *the user's code* crashed.

---

## Current Limitations and What Would Change at Scale

### Limitation 1: Synchronous execution

Currently: `POST /submit` → Spring Boot waits for JDoodle response → returns result

For 5 test cases × ~1.5s each = ~7-10 seconds blocking an HTTP thread.

**At scale**: Move to async. Client polls for status, or use WebSocket/SSE to stream results.

### Limitation 2: No execution queue

Under high load, all requests hit the execution provider simultaneously. JDoodle has daily credit limits; Piston has no built-in rate control.

**At scale**: A queue (Kafka, RabbitMQ, or SQS) between submission and execution. Workers pull from queue. Backpressure is naturally handled.

### Limitation 3: No sandbox on the backend

The current backend trusts JDoodle/Piston to sandbox. The backend itself does no isolation.

**At scale**: For self-hosted execution, each code run would be inside a Docker container with:
- CPU limits
- Memory limits
- No network access
- Read-only filesystem
- Dropped Linux capabilities

### Limitation 4: No result persistence

Submissions are not stored. Users cannot see their submission history.

**Next phase**: Add a `Submission` entity in the database.

---

## Interview Questions This Section Answers

- How do you execute untrusted code safely?
- What is sandboxing? How does Docker isolation work?
- What happens if the execution service goes down?
- How do you handle API timeouts with external services?
- How did you handle the 7–10 second execution latency?
- How would you handle 1,000 concurrent submissions?
- What would you change to make this async?
- Why is JDoodle's combined `output` field a problem?
- How do you detect compilation errors vs. runtime errors?
- What is the Strategy pattern and where do you use it?
