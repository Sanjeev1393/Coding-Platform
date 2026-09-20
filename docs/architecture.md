---
title: "Architecture"
description: "System architecture diagram, Spring Boot package structure, and key design decisions."
---

# Architecture

## High-Level Architecture (Current: V1)

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│              React + Vite (SPA)                      │
│          Deployed: Vercel (CDN edge)                 │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + JSON
                       │ CORS enforced by Spring
                       ▼
┌─────────────────────────────────────────────────────┐
│           Spring Boot Backend (Java 21)              │
│           Deployed: Render (single instance)         │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │ ExecutionController  /api/v1/executions     │     │
│  │ QuestionController   /api/v1/questions      │     │
│  │ HealthController     /actuator/health       │     │
│  └─────────────────┬──────────────────────────┘     │
│                    │                                  │
│  ┌─────────────────▼──────────────────────────┐     │
│  │  ExecutionService   EvaluationService       │     │
│  │  OutputComparator                           │     │
│  └─────────────────┬──────────────────────────┘     │
│                    │                                  │
│  ┌─────────────────▼──────────────────────────┐     │
│  │  CodeExecutionProvider (interface)          │     │
│  │                                             │     │
│  │   PistonExecutionProvider                   │     │
│  │     @ConditionalOnProperty(provider=piston) │     │
│  │   JdoodleExecutionProvider                  │     │
│  │     @ConditionalOnProperty(provider=jdoodle)│     │
│  └─────────────────┬──────────────────────────┘     │
│                    │                                  │
│  ┌─────────────────▼──────────────────────────┐     │
│  │  InMemoryQuestionRepository                 │     │
│  │  (stateless; questions hardcoded in memory) │     │
│  └─────────────────────────────────────────────┘     │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
         ▼ (local/dev)                ▼ (production)
  ┌─────────────┐             ┌──────────────────┐
  │   Piston    │             │  JDoodle REST API │
  │  (Docker)   │             │  api.jdoodle.com  │
  └─────────────┘             └──────────────────┘
```

## Backend Package Structure

```
com.codingplatform.backend
│
├── config/
│   └── CorsConfig.java              ← CORS origin whitelist from env vars
│
├── controller/
│   ├── ExecutionController.java     ← POST /executions, POST /executions/submit
│   ├── QuestionController.java      ← GET /questions, GET /questions/{id}
│   └── HealthController.java        ← GET /health (lightweight liveness probe)
│
├── service/
│   ├── ExecutionService.java        ← Delegates to active CodeExecutionProvider
│   ├── EvaluationService.java       ← Judging engine (runs N test cases, computes verdict)
│   └── OutputComparator.java        ← Normalised stdout comparison (trim, case)
│
├── provider/
│   ├── CodeExecutionProvider.java   ← Interface (Strategy pattern)
│   ├── harness/
│   │   ├── HarnessGenerator.java    ← Generates driver code wrapping user solution
│   │   └── SourceFile.java          ← Value object: filename + content
│   ├── piston/
│   │   ├── PistonExecutionProvider.java
│   │   ├── PistonProperties.java
│   │   └── dto/  (PistonExecuteRequest, PistonExecuteResponse, ...)
│   └── jdoodle/
│       ├── JdoodleExecutionProvider.java
│       ├── JdoodleProperties.java
│       └── dto/  (JdoodleExecuteRequest, JdoodleExecuteResponse)
│
├── repository/
│   ├── QuestionRepository.java           ← Interface
│   └── InMemoryQuestionRepository.java   ← In-memory impl (no DB yet)
│
├── model/
│   ├── QuestionDefinition.java      ← Problem: title, description, signature, test cases
│   └── TestCase.java                ← input, expectedOutput, hidden flag
│
└── dto/
    ├── ExecutionRequest.java        ← language, sourceCode, stdin, signature
    ├── ExecutionResponse.java       ← status, stdout, stderr, metrics
    ├── SubmissionRequest.java       ← questionId + ExecutionRequest fields
    ├── EvaluationResult.java        ← verdict, passed/total, per-test-case results
    ├── TestCaseResult.java          ← per-test outcome (PASSED/FAILED/hidden masking)
    └── ExecutionStatus.java         ← SUCCESS, WRONG_ANSWER, COMPILATION_ERROR, etc.
```

## Key Design Decisions

### Strategy Pattern for Execution Provider

The `CodeExecutionProvider` interface lets the application switch between Piston (local Docker) and JDoodle (cloud API) at startup via a single environment variable (`EXECUTION_PROVIDER`). Spring's `@ConditionalOnProperty` activates exactly one provider bean.

**Why this matters**: Zero code change required to swap execution backends. Local dev uses Piston; production uses JDoodle. This is the **Open/Closed Principle** in practice.

### Separation of Execution vs. Evaluation

`ExecutionService` answers *"can I run this code?"*
`EvaluationService` answers *"does this solution pass all test cases?"*

The `EvaluationService` calls `ExecutionService` N times (once per test case), applies short-circuit on `COMPILATION_ERROR` (no point running further tests if code doesn't compile), masks hidden test case inputs/outputs in the response, and aggregates timing + memory metrics.

### HarnessGenerator

When a problem has a function signature (e.g., `twoSum(int[] nums, int target)`), users write only the function body. The `HarnessGenerator` wraps it in a complete driver program with a `main()` method that feeds stdin inputs and calls the function. This is the same approach used by competitive programming judges.

### CORS via Environment Variables

`CorsConfig` reads `CORS_ALLOWED_ORIGINS` from env at startup, splits on `,`, and configures Spring MVC's CORS registry. No wildcard origins — explicit allow-list only.

## Architecture Evolution Plan

| Version | Description | Status |
|---|---|---|
| V1 | React → Spring Boot → JDoodle/Piston | ✅ Live |
| V2 | + Database (MongoDB or PostgreSQL) | Planned |
| V3 | + User Authentication (JWT) | Planned |
| V4 | + Rate Limiting (in-process → Redis) | Planned |
| V5 | + Async Execution (Queue → Workers) | Planned |
| V6 | + Horizontal Scaling (Load Balancer + stateless) | Design study |
