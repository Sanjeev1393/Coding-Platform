---
title: "Engineering Journal"
description: "A running log of real engineering decisions and production problems encountered while building the platform."
---

# Engineering Journal

A running log of meaningful engineering decisions, problems, and learnings. Each entry follows the same structure so every problem becomes a reusable interview story.

---

## Template

```
## [YYYY-MM] [Short Title]

**Problem:** What was the issue or decision?
**Why it happened:** Root cause or context
**Investigation:** How I found the issue or explored options
**Options considered:** What alternatives existed
**Decision:** What I chose and why
**Implementation:** How I implemented it
**Result:** What happened after
**What I learned:** The key takeaway
**At scale:** How this changes with 10x/100x load
**Interview questions it answers:** [list]
```

---

## 2026-09 — Hardcoded Production API URL

**Problem:** All API calls failed silently after first production deployment.

**Why it happened:** The frontend API service had `const API_BASE_URL = 'http://localhost:8080'` hardcoded. In the browser, `localhost` refers to the user's machine — not the backend server.

**Investigation:** Opened Chrome DevTools → Network tab → saw all requests going to `localhost:8080` with `ERR_CONNECTION_REFUSED`. Traced the URL to the API service file.

**Options considered:**
1. Set the URL directly in code per environment — rejected (requires code changes per deploy)
2. Use Vite's `import.meta.env` with an environment variable — accepted

**Decision:** `VITE_API_BASE_URL` env var, read at Vite build time. Falls back to `localhost:8080` for local dev.

**Implementation:**
```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```
Set `VITE_API_BASE_URL=https://...onrender.com` in Vercel dashboard.

**Result:** Production submissions started working immediately.

**What I learned:** Frontend env vars work differently from backend. Vite bakes them in at build time — wrong values require a new build. This is why you see CI/CD pipelines pass env vars at build time, not just at runtime.

**At scale:** Same pattern works regardless of scale. In a monorepo with multiple frontends, each frontend builds with its own env vars pointing to its own backend endpoint.

**Interview questions:**
- How does the frontend communicate with the backend in production?
- How do you handle environment-specific configuration?
- What is Vite's `import.meta.env`?
- Why do you need to rebuild when a frontend env var changes?

---

## 2026-09 — 7–10 Second Submission Latency

**Problem:** Submissions took 7–10 seconds even for trivially simple programs.

**Why it happened:** 5 test cases × ~1.5–2s JDoodle API round trip per call (sequential) = 7–10 seconds total.

**Investigation:** Added timing logs to `EvaluationService`. Measured per-test-case execution time. Identified that JDoodle itself was taking 1.5–2s per call. Verified by testing JDoodle directly with `curl` — same latency. Ruled out Spring Boot cold start as the primary cause.

**Options considered:**
1. Parallel test case execution via `CompletableFuture` — fastest fix, but burns JDoodle daily credits faster
2. Async submission (fire-and-forget + polling) — better UX, requires DB + async framework
3. Self-hosted Piston — eliminates network overhead, requires infrastructure

**Decision:** Documented as a known limitation. Added per-call timeout (`readTimeoutMs`) to prevent indefinite hangs. Parallel execution will be implemented when switching to self-hosted Piston.

**Result:** Latency unchanged (7–10s), but at least bounded by timeout. UX improved slightly by adding a shimmer loading state so the wait feels intentional.

**What I learned:** External dependencies add latency that you cannot optimise away without changing the architecture. Sequential execution of N independent operations is always O(N × latency). Parallelism gives you O(max(latency)) instead.

**At scale:** At 1,000 concurrent users, sequential execution + external API = infeasible. The answer is: async queue + worker pool + self-hosted executor + result polling.

**Interview questions:**
- How did you investigate the slow submission?
- What is the difference between sequential and parallel execution?
- What is `CompletableFuture`?
- When would you use a queue instead of making the client wait?
- How would you handle 1,000 concurrent submissions?

---

## 2026-09 — Execution Provider Strategy Pattern

**Problem:** The platform needs to work locally with Piston (Docker) and in production with JDoodle (REST API). These have completely different APIs, authentication models, and response structures.

**Why it happened:** Render free tier doesn't support a persistent Docker sidecar, so the same Docker-based Piston setup used locally can't run in production without infrastructure changes.

**Options considered:**
1. Write separate code paths with `if (env == production)` — rejected (tight coupling, hard to test)
2. Separate deployment configs with different code — rejected (maintenance burden)
3. Strategy pattern: `CodeExecutionProvider` interface + Spring conditional beans — accepted

**Decision:** Interface + `@ConditionalOnProperty`. The active provider is selected at startup from the `EXECUTION_PROVIDER` env var. Zero code change to switch environments.

**Implementation:**
```java
public interface CodeExecutionProvider {
    ExecutionResponse execute(ExecutionRequest request);
}

@ConditionalOnProperty(name = "execution.provider", havingValue = "piston", matchIfMissing = true)
public class PistonExecutionProvider implements CodeExecutionProvider { ... }

@ConditionalOnProperty(name = "execution.provider", havingValue = "jdoodle")
public class JdoodleExecutionProvider implements CodeExecutionProvider { ... }
```

**Result:** Local dev uses Piston. Production uses JDoodle. Identical application code.

**What I learned:** The Strategy pattern is extremely practical in Spring Boot. `@ConditionalOnProperty` is a clean way to implement feature flags and environment-specific behaviour without polluting business logic with environment checks.

**At scale:** Same pattern works when adding more providers (e.g., AWS Lambda executor, custom Docker runner). You add a new implementation and a new env var value.

**Interview questions:**
- What is the Strategy pattern? Give me an example.
- How does Spring's `@ConditionalOnProperty` work?
- How do you configure environment-specific behaviour in Spring Boot?
- What is Open/Closed Principle? How does your code demonstrate it?

---

## 2026-09 — CORS Configuration

**Problem:** Browser blocked all API calls in production with a CORS error, even though the backend was reachable.

**Why it happened:** The browser enforces the Same-Origin Policy. `coding-platform.vercel.app` and `*.onrender.com` are different origins. The browser sends a preflight `OPTIONS` request first; if the backend doesn't respond with the correct `Access-Control-Allow-Origin` header, the actual request is blocked.

**Investigation:** Saw `CORS policy: No 'Access-Control-Allow-Origin' header is present` in the browser console. Confirmed the backend was reachable directly (curl worked). Added CORS config to Spring Boot.

**Decision:** `CorsConfig` reads `CORS_ALLOWED_ORIGINS` from env (comma-separated). No wildcard `*` — explicit allow-list only.

**What I learned:** CORS is enforced by the browser, not the server. The server only needs to respond with the correct headers. Tools like `curl` and Postman are not subject to CORS — only browser requests are. Using `*` as an allowed origin is a security risk in authenticated APIs because it allows any website to make credentialed cross-origin requests.

**At scale:** With multiple frontend deployments (staging, preview, production), the `CORS_ALLOWED_ORIGINS` env var can include all of them. For dynamic preview URLs (e.g., Vercel preview deploys), you'd need either wildcard subdomains or a CORS origin validator that checks against a pattern.

**Interview questions:**
- What is CORS? Why does it exist?
- Who enforces CORS — the browser or the server?
- Why is `Access-Control-Allow-Origin: *` a security risk?
- How do you handle CORS in Spring Boot?
- Why does `curl` work but the browser request fails?

---

## 2026-09 — API Contract Drift & Schema Governance

**Problem:** Backend developers modify endpoints or DTO field names without notifying the frontend team, resulting in silent runtime breakage in production.

**Why it happened:** In code-first Spring Boot applications, changing a DTO field (e.g., renaming `sourceCode` to `code` or changing a validation constraint) compiles and passes backend unit tests, but immediately breaks frontend HTTP payloads. Without an automated guard, API documentation and client expectations drift apart from actual backend logic.

**Investigation:** Looked into how high-velocity engineering teams prevent breaking contract changes. Analyzed spec-first (handcrafting OpenAPI YAML before code) versus code-first (annotating DTOs with Springdoc `@Schema` and generating specs). Spec-first had too much friction for our velocity, while pure code-first had no CI enforcement.

**Options considered:**
1. *Spec-first with code generation:* High overhead; generated stubs often fight with domain logic.
2. *Dynamic Swagger UI only (no versioned file):* Zero maintenance, but no PR diffs and no CI validation.
3. *Code-first with versioned `openapi.json` & CI drift guard:* Full code velocity + strict CI contract enforcement.

**Decision:** Option 3. Check `docs/openapi.json` into Git. Run a CI check (`git diff --exit-code docs/openapi.json`) that fails the build if the code changes without an accompanying updated spec. Reject CI auto-commits to ensure developers consciously review contract diffs before pushing.

**Implementation:**
- Annotated DTOs and Controllers with Springdoc OpenAPI annotations (`@Schema`, `@Operation`, `@ApiResponse`).
- Created `scripts/generate-openapi.ps1` (PowerShell) and `.sh` (Bash) to fetch `/v3/api-docs` from the running backend.
- Added a `contract-drift-check` job in `.github/workflows/ci.yml` that boots Spring Boot and verifies zero git diff.
- Linked `docs/openapi.json` to Mintlify in `docs.json` for zero-effort, interactive API Reference docs.

**Result:** Any unintentional or breaking API modification triggers a red CI build during pull request checks. Frontend developers can review the exact JSON contract diff right in GitHub PRs before code merges.

**What I learned:** API contracts are public promises. Automated drift detection shifts contract testing left—catching breaking changes at code-review time rather than in production integration tests. Furthermore, making CI *fail* rather than *auto-commit* enforces developer intentionality.

**At scale:** At large companies, this pattern evolves into automated consumer-driven contract testing (e.g., Pact) or automated TypeScript client generation directly from the committed OpenAPI spec via tools like `openapi-typescript` in the frontend build pipeline.

**Interview questions:**
- How do you prevent breaking API changes between frontend and backend in a team?
- What is API contract drift, and how can CI detect it?
- Why should CI fail on uncommitted generated artifacts instead of auto-committing them?
- What are the trade-offs between code-first and spec-first API design?

---

## 2026-09 — Windows to Linux CI: File Permissions & Silent Failures

**Problem:** The CI pipeline crashed with a confusing error message: `Expecting value: line 1 column 1 (char 0)`. It looked like a broken JSON file, but the real cause was completely different.

**Why it happened:** A chain of three small issues created one misleading error:
1. **Windows vs. Linux file permissions:** Windows does not care about Linux execution permissions (`+x`). When we created or committed files from Windows, Git saved `./mvnw` with default read-only permissions (`100644`). When GitHub Actions ran on Ubuntu Linux, it failed with `./mvnw: Permission denied`.
2. **Background process died quietly:** Because `./mvnw spring-boot:run &` was run with `&` in the background, Linux printed the error, but the CI step finished anyway without stopping the build.
3. **The loop failed silently:** The health check loop tried to reach `localhost:8080` 40 times. When it failed all 40 times, the loop just ended normally without telling CI that it failed.
4. **The crash:** The next step ran `curl` against the dead server, received completely empty text (`""`), and passed it to Python. Python crashed trying to read empty text as JSON.

**Investigation:** 
- Checked the Git index with `git ls-files -s backend/mvnw`. It showed mode `100644` (not executable) instead of `100755` (executable).
- Realized that `curl -s` (silent mode) was hiding the connection error.
- Saw that the health check loop did not have an `exit 1` when it ran out of retries.

**Decision:** 
1. Fix the permissions directly in Git so Linux always knows the file is executable.
2. Tell the health check loop to immediately stop the build and show the real server log if the backend does not start.

**Implementation:**
- Ran `git update-index --chmod=+x backend/mvnw scripts/generate-openapi.sh` so Git saves the executable flag permanently.
- Changed backend startup in `ci.yml` to:
  `nohup ./mvnw spring-boot:run > /tmp/backend.log 2>&1 &`
  (`nohup` keeps the process alive and saves all output into `/tmp/backend.log`).
- Added a simple check after the retry loop: if the backend is not healthy, print `/tmp/backend.log` and stop with `exit 1`.
- Changed `curl -s` to `curl -sf` so it fails loudly if the server is unreachable.

**Result:** The pipeline now starts the backend cleanly on Linux. If the server ever fails to start in the future, CI immediately prints the exact error message from the backend log instead of showing a confusing JSON error.

**What I learned:** 
- **The real bug is usually earlier:** When a later step crashes with empty data, look at the earlier step that was supposed to produce that data.
- **Cross-platform awareness:** Developing on Windows and deploying on Linux (like GitHub Actions or Docker) means you must check executable permissions in Git.
- **Fail loudly:** Never let a retry loop finish quietly without checking if it actually succeeded.

**Interview questions:**
- Why do scripts from Windows sometimes fail with `Permission denied` on Linux CI?
- How does Git store and track file permissions?
- How do you safely start a background service and wait for it in a CI/CD pipeline?
- What does `nohup` do and why is it useful in automated scripts?

---
*Add new entries here as you encounter problems and make decisions.*
