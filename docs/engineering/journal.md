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
*Add new entries here as you encounter problems and make decisions.*
