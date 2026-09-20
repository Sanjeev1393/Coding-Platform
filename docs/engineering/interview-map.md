---
title: "Interview Question Map"
description: "Every interview question this project can answer, cross-referenced to the document that covers it."
---

# Interview Question Map

This is your master cross-reference between project features and the interview questions they equip you to answer.

Use this when preparing for a specific topic: find the topic, see which docs go deep on it, and practice telling the story from your own project.

---

## By Interview Topic

### System Design & Architecture

| Question | Source |
|---|---|
| Explain the architecture of your project | [02-architecture.md](02-architecture.md) |
| Walk me through what happens when a user submits code | [02-architecture.md](02-architecture.md), [05-code-execution.md](05-code-execution.md) |
| How would you scale this to 100,000 users? | [05-code-execution.md](05-code-execution.md), [11-deployment.md](11-deployment.md) |
| What happens if the execution service goes down? | [05-code-execution.md](05-code-execution.md), [decisions/ADR-001](decisions/ADR-001-execution-service.md) |
| When would you introduce a queue? | [incidents/INC-002](incidents/INC-002-execution-latency.md) |
| What is backpressure? Why does it matter? | [incidents/INC-002](incidents/INC-002-execution-latency.md) |
| How would you handle 1,000 concurrent submissions? | [incidents/INC-002](incidents/INC-002-execution-latency.md) |

---

### APIs & REST

| Question | Source |
|---|---|
| Walk me through your REST API design | [03-api-design.md](03-api-design.md) |
| Why do you return 200 for compilation errors? | [03-api-design.md](03-api-design.md) |
| How do you handle request validation? | [03-api-design.md](03-api-design.md) |
| How do you version your API? | [03-api-design.md](03-api-design.md) — `/api/v1/` prefix |
| How do you document your API? | Placeholder: [03-api-design.md](03-api-design.md) (Swagger/OpenAPI — future) |

---

### Code Execution & Security

| Question | Source |
|---|---|
| How do you execute untrusted code safely? | [05-code-execution.md](05-code-execution.md), [decisions/ADR-001](decisions/ADR-001-execution-service.md) |
| What is sandboxing? | [decisions/ADR-001](decisions/ADR-001-execution-service.md) |
| Why didn't you run code directly on the backend? | [decisions/ADR-001](decisions/ADR-001-execution-service.md) |
| What are the risks of direct code execution? | [decisions/ADR-001](decisions/ADR-001-execution-service.md) |
| How do you detect compilation vs. runtime errors? | [05-code-execution.md](05-code-execution.md) |
| What is the Strategy pattern? Where did you use it? | [05-code-execution.md](05-code-execution.md), [02-architecture.md](02-architecture.md) |
| How did you generate the driver harness? | [05-code-execution.md](05-code-execution.md) |

---

### External Services & Resilience

| Question | Source |
|---|---|
| Why did you choose JDoodle? | [decisions/ADR-003](decisions/ADR-003-jdoodle-vs-piston.md) |
| What are the trade-offs of using JDoodle? | [decisions/ADR-003](decisions/ADR-003-jdoodle-vs-piston.md) |
| How do you handle external API failures? | [05-code-execution.md](05-code-execution.md) |
| How do you set timeouts for external HTTP calls? | [05-code-execution.md](05-code-execution.md) |
| What would you do if JDoodle had an outage? | [decisions/ADR-001](decisions/ADR-001-execution-service.md) |
| Why does your JDoodle integration use regex? | [decisions/ADR-003](decisions/ADR-003-jdoodle-vs-piston.md) |

---

### Deployment & DevOps

| Question | Source |
|---|---|
| How did you deploy this project? | [11-deployment.md](11-deployment.md) |
| How do you manage secrets in production? | [11-deployment.md](11-deployment.md) |
| What is Docker multi-stage build? Why use it? | [11-deployment.md](11-deployment.md) |
| What is CORS and how do you handle it? | [11-deployment.md](11-deployment.md) |
| How does the frontend know the backend URL? | [11-deployment.md](11-deployment.md), [incidents/INC-001](incidents/INC-001-production-api-url.md) |
| What deployment problems did you face? | [incidents/INC-001](incidents/INC-001-production-api-url.md) |
| How does Render know your backend is healthy? | [11-deployment.md](11-deployment.md) |

---

### Performance & Observability

| Question | Source |
|---|---|
| Your submission takes 7–10 seconds. How did you debug it? | [incidents/INC-002](incidents/INC-002-execution-latency.md) |
| What was the root cause of the latency? | [incidents/INC-002](incidents/INC-002-execution-latency.md) |
| How would you make execution faster? | [incidents/INC-002](incidents/INC-002-execution-latency.md) |
| What logging do you have? | [05-code-execution.md](05-code-execution.md) — SLF4J/Logback in controllers + providers |
| How would you monitor this in production? | Future: [12-observability.md](12-observability.md) |

---

### Database (Planned — not yet implemented)

| Question | Source |
|---|---|
| Why haven't you added a database yet? | [01-project-overview.md](01-project-overview.md) |
| What would your schema look like? | Future: [04-database-design.md](04-database-design.md) |
| MongoDB vs. PostgreSQL — which would you choose? | Future: [decisions/ADR-002-database.md](decisions/ADR-002-database.md) |
| How would you handle 10 million submissions? | Future: [04-database-design.md](04-database-design.md) |

---

### Authentication (Planned — not yet implemented)

| Question | Source |
|---|---|
| How would you add user authentication? | Future: [07-authentication.md](07-authentication.md) |
| What is JWT? How does it work? | Future: [07-authentication.md](07-authentication.md) |
| What is the difference between authentication and authorization? | Future: [07-authentication.md](07-authentication.md) |

---

### Rate Limiting (Planned — not yet implemented)

| Question | Source |
|---|---|
| How would you rate-limit submissions? | Future: [08-rate-limiting.md](08-rate-limiting.md) |
| Why doesn't in-memory rate limiting work at scale? | Future: [08-rate-limiting.md](08-rate-limiting.md) |
| Why Redis for distributed rate limiting? | Future: [08-rate-limiting.md](08-rate-limiting.md) |

---

## Your Strongest Interview Stories (Today)

These are the stories you can tell confidently right now, with concrete details:

| Story | Key points |
|---|---|
| Production URL bug | DevTools debugging, env vars, Vite build-time vars |
| 7–10s execution latency | Root cause analysis, sequential vs. parallel, async options |
| Execution provider design | Strategy pattern, @ConditionalOnProperty, zero code change to swap |
| JDoodle regex classification | External API limitations, trade-offs, what you'd do differently |
| CORS configuration | Why it's needed, allow-list vs. wildcard, env-driven config |
| HarnessGenerator | How LeetCode-style judges work, code generation, stdin parsing |

---

## Documents Still To Create

- [ ] `04-database-design.md` — After adding MongoDB/PostgreSQL
- [ ] `06-security.md` — After adding input sanitisation
- [ ] `07-authentication.md` — After adding JWT auth
- [ ] `08-rate-limiting.md` — After implementing rate limiting
- [ ] `09-caching.md` — After adding Redis caching
- [ ] `10-async-processing.md` — After adding async execution / queue
- [ ] `12-observability.md` — After adding metrics/tracing
- [ ] `13-performance.md` — After profiling
- [ ] `14-testing.md` — After expanding test coverage
- [ ] `decisions/ADR-002-database.md`
- [ ] `decisions/ADR-004-sync-vs-async.md`
- [ ] `incidents/INC-003-*.md` — Next incident you encounter
