---
title: "System Design Evolution"
description: "How the architecture evolved from a simple prototype to a more sophisticated design, and how it would scale further."
---

# System Design Evolution

This document tracks how the architecture has evolved and how it would continue to evolve at scale.

## Version 1 — Current (Live)

```
React (Vite)
     │
     │  HTTPS + JSON
     ▼
Spring Boot (Render)
     │
     │  EXECUTION_PROVIDER env var selects provider at startup
     ├── JDoodle REST API  (production)
     └── Piston (Docker)   (local dev)
```

**Characteristics:**
- Single backend instance
- Synchronous execution (client waits 7–10s for result)
- In-memory question store (no database)
- No authentication, no rate limiting, no queue

---

## Version 2 — Persistence (Next)

Add a database. Questions and submissions become persistent.

```
React
  │
  ▼
Spring Boot
  ├── Execution Service (JDoodle/Piston)
  └── Database (MongoDB or PostgreSQL)
        ├── questions
        ├── submissions
        └── execution_results
```

**What this adds:**
- Submission history per user
- Problem management without code changes
- Indexes for fast lookup
- Foundation for authentication

---

## Version 3 — Authentication

Add JWT-based user login.

```
React
  │  (Authorization: Bearer <jwt>)
  ▼
Spring Boot
  ├── Auth filter (validate JWT)
  ├── Execution Service
  └── Database
        └── users (id, email, password_hash)
```

**What this adds:**
- Protected submission endpoint (`/submit` requires auth)
- Per-user submission history
- Interview topics: JWT, bcrypt, access vs refresh tokens, stateless auth

---

## Version 4 — Rate Limiting

Prevent abuse of the execution endpoint.

```
React
  │
  ▼
Spring Boot
  ├── Rate limiter (in-process → Redis)
  ├── Execution Service
  └── Database
```

**Why in-process rate limiting breaks at scale:**
```
             ┌── Backend 1 ── counter = 3
User ────────┼── Backend 2 ── counter = 3
             └── Backend 3 ── counter = 3
```
Real total: 9 requests. Each server thinks only 3.

**Fix:** Shared state in Redis with atomic `INCR` + TTL.

---

## Version 5 — Async Execution (Queue)

Decouple submission from execution.

```
React
  │  POST /submit → { submissionId, status: "PENDING" }
  │  GET /submissions/{id} → polling for result
  ▼
Spring Boot
  │
  ▼
Queue (Kafka / RabbitMQ / SQS)
  │
  ▼
Execution Workers (pull from queue)
  │
  ▼
Execution Sandbox (Piston / custom Docker)
  │
  ▼
Results Database
```

**What this adds:**
- Instant HTTP response (no more 7–10s wait)
- Backpressure: workers drain queue at controlled rate
- Retry on failure (dead-letter queue)
- Interview topics: async processing, Kafka, idempotency, consumer failures

---

## Version 6 — Horizontal Scale (Hypothetical)

```
Client
  │
  ▼
CDN / Load Balancer
  │
  ├── Backend 1 ──┐
  ├── Backend 2 ──┼── Redis (shared state: rate limits, sessions)
  └── Backend 3 ──┘
         │
         ▼
       Queue
         │
   ┌─────┼─────┐
   ▼     ▼     ▼
Worker Worker Worker
   │     │     │
   └─────┼─────┘
         ▼
  Execution Sandbox Cluster
         │
         ▼
     Results DB
```

**Key lessons for interviews:**
- Stateless services scale horizontally; stateful ones don't
- Every shared-state component (Redis, DB, Queue) can become a bottleneck
- The queue provides natural backpressure — workers process at their own pace
- The sandbox cluster is the hardest part to scale safely (isolation, resource limits)

---

*This document is updated as each phase is implemented.*
