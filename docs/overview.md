---
title: "Project Overview"
description: "What the Coding Platform is, why it was built, and the current tech stack."
---

# Project Overview

## What is this project?

A full-stack **coding assessment platform** — similar in concept to LeetCode or HackerRank, but built from scratch as a personal engineering case study.

Users can:
- Browse coding problems
- Write solutions in Java, Python, or JavaScript directly in the browser
- Run code against visible test inputs ("Run Code")
- Submit a solution against visible + hidden test cases ("Submit") and receive a pass/fail verdict with per-test-case breakdown

## Why was it built?

Two goals:

1. **Engineering depth**: Learn how real production systems handle untrusted remote code execution, external API integration, environment-specific deployment, and backend service design.
2. **Interview preparation**: Build a project defensible in a 45-minute backend engineering interview, where every architectural decision has a documented *why*.

## Current Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Spring Boot 4.1.1 (Java 21) |
| Execution (local) | Piston (self-hosted Docker sandbox) |
| Execution (cloud) | JDoodle Compiler API |
| Frontend deploy | Vercel |
| Backend deploy | Render |
| Containerization | Docker + Docker Compose |
| Code formatting | Google Java Format (Spotless) + Prettier |
| Testing | Vitest (frontend) + Spring Boot Test (backend) |

## Current Application Flow

```
User (Browser)
     │
     │  POST /api/v1/executions        ← "Run Code"
     │  POST /api/v1/executions/submit ← "Submit"
     ▼
React (Vite)  ─────── Vercel CDN
     │
     │  HTTP (REST + JSON)
     ▼
Spring Boot Backend  ── Render (cloud)
     │
     │  Provider selected at startup via EXECUTION_PROVIDER env var:
     │    • "piston"   → local Docker container (dev / self-hosted)
     │    • "jdoodle"  → JDoodle REST API (current production)
     ▼
Code Execution Service
     │
     ▼
Result (stdout / stderr / status / metrics)
```

## Deployment Status

| Environment | Frontend | Backend | Execution |
|---|---|---|---|
| Local | `localhost:5173` | `localhost:8080` | Piston (Docker) |
| Production | Vercel | Render | JDoodle API |

## What is NOT yet built (and why it matters for interviews)

| Feature | Status | Interview angle |
|---|---|---|
| Database persistence | Not yet | Questions served from in-memory `InMemoryQuestionRepository` |
| User authentication | Not yet | All endpoints are currently public |
| Rate limiting | Not yet | Single backend; no per-user quota enforcement |
| Async execution / queue | Not yet | Execution is fully synchronous HTTP |
| Monitoring / tracing | Minimal | Spring Boot Actuator enabled; no metrics dashboard |
| Caching | Not yet | No Redis or in-process cache |

Each item represents a deliberate next engineering phase — not an oversight. The current in-memory approach was a conscious trade-off to ship a working demo quickly, with full understanding of what would need to change at scale.
