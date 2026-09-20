---
title: "INC-002: Slow Execution (7–10s)"
description: "Root cause analysis of the 7–10 second submission latency and options to fix it."
---

# INC-002 — Slow Code Execution (7–10 seconds)

**Date:** 2026-09
**Severity:** Medium (degraded UX; submissions took 7–10 seconds)

---

## Symptom

Code submissions consistently took 7–10 seconds from clicking "Submit" to seeing results, even for trivially simple programs like returning a constant.

---

## Investigation

Traced the full request lifecycle:

```
[Browser]          → click Submit
[Frontend]         → POST /api/v1/executions/submit
[Spring Boot]      → EvaluationService.evaluate()
                      └── for each test case (5 total):
                            └── ExecutionService.execute()
                                  └── JdoodleExecutionProvider.execute()
                                        └── HTTP POST → api.jdoodle.com
                                              └── ~1.5–2s round trip per call
[Backend]          → aggregate results, return EvaluationResult
[Frontend]         → parse + render results
```

**Root cause breakdown:**
- 5 test cases × ~1.5–2s JDoodle round trip = **7–10 seconds total**
- JDoodle's average response time is 1–2 seconds for Java (JVM startup + compilation)
- All test cases execute **sequentially** (one after another)
- Network latency between Render (Singapore/US) and JDoodle servers adds overhead

---

## What Was Suspected First

Initially suspected the Spring Boot cold start on Render free tier (containers spin down after inactivity). Tested by keeping the backend warm — no significant improvement. Confirmed the bottleneck was JDoodle response time, not backend startup.

---

## What Changed

No code change was made for this incident — it revealed an architectural limitation that requires a more significant change.

Short-term mitigation:
- Added timeout configuration to `RestClient` (`readTimeoutMs`, `connectTimeoutMs`) to avoid hanging indefinitely if JDoodle becomes unresponsive
- Added logging of JDoodle response time per call to make this measurable

---

## What Would Fix This Properly

### Option A: Parallel test case execution
Run all 5 test cases concurrently using `CompletableFuture`:

```java
List<CompletableFuture<TestCaseResult>> futures = testCases.stream()
    .map(tc -> CompletableFuture.supplyAsync(() -> executeTestCase(tc)))
    .toList();

List<TestCaseResult> results = futures.stream()
    .map(CompletableFuture::join)
    .toList();
```

Result: ~1.5–2s total instead of 7–10s (limited by slowest test case, not sum of all).

**Trade-off:** JDoodle has a daily credit limit. Parallel requests would exhaust it faster. Also requires thread-pool sizing and error propagation design.

### Option B: Async submission + polling

```
POST /submit → returns { submissionId: "abc123", status: "PENDING" }

(backend processes in background)

GET /submissions/abc123 → { status: "RUNNING" }
GET /submissions/abc123 → { status: "COMPLETE", results: [...] }
```

Result: Instant HTTP response; frontend polls until complete. Better UX for long-running submissions.

**Requires:** Database (to store submission state), async execution framework.

### Option C: Self-hosted Piston (no JDoodle)
Piston on the same host as the backend adds ~50–200ms per execution (local network). 5 test cases × 200ms = ~1 second total.

**Requires:** Infrastructure that supports a persistent Docker container alongside the backend.

---

## Lesson

**Sequential synchronous execution of N independent operations is always a scalability bottleneck.** When each operation is independent (test cases don't depend on each other), parallelism is the natural solution. The constraint here was external API rate limits — demonstrating that external dependencies introduce constraints that internal solutions don't have.

---

## At Scale (1,000 Concurrent Users)

1,000 simultaneous submissions × 5 test cases = 5,000 JDoodle API calls per second. JDoodle's free tier allows ~200/day.

The only viable path at scale is:
1. A self-hosted execution cluster (Piston workers or custom Docker-based sandbox)
2. A submission queue (Kafka/SQS) to buffer spikes
3. Worker pool to drain the queue at a controlled rate
4. Result persistence so users can retrieve results asynchronously

---

## Interview Questions This Incident Answers

- How did you debug the slow submission performance?
- What caused the 7–10 second latency?
- How would you make the execution faster?
- What is the difference between sequential and parallel execution?
- What are the trade-offs of parallel vs. async execution?
- How would you handle 1,000 concurrent submissions?
- Why would you introduce a queue for code execution?
- What is backpressure and why does it matter?
