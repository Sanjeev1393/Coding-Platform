---
title: "ADR-001: Execution Service"
description: "Direct execution vs. Piston vs. JDoodle — options considered, trade-offs, and the final decision."
---

# ADR-001 — Execution Service: External API vs. Self-Hosted vs. Direct Execution
**Status:** Accepted

---

## Problem

The platform needs to execute arbitrary user-submitted code (Java, Python, JavaScript). The execution layer is the most critical design decision in the system because it has major implications for security, latency, cost, and deployment complexity.

---

## Options Considered

### Option 1: Direct execution on the backend host

**How:** Use `Runtime.getRuntime().exec()` or `ProcessBuilder` to compile and run code directly on the Spring Boot server.

**Pros:**
- Zero infrastructure overhead
- Lowest latency (no network hop)
- Full control over runtime environment

**Cons:**
- Severe security risk: user code runs with the same permissions as the JVM process
- Infinite loops can starve the server
- `System.exit()` can kill the backend
- File system access, network calls to internal services
- Virtually impossible to sandbox safely without OS-level isolation
- Would require seccomp/AppArmor/namespace configuration (Linux-only, complex)

**Decision:** Rejected. Security risk is unacceptable, even for a personal project. Understanding *why* this is unsafe is itself a valuable interview talking point.

---

### Option 2: Self-hosted Docker sandbox (Piston)

**How:** Run [Piston](https://github.com/engineer-man/piston) in a Docker container alongside the backend. Each code execution runs in an isolated container with CPU/memory/network limits.

**Pros:**
- Free, no external API costs
- Full control over resource limits
- Works offline / local dev
- Consistent behaviour (no external dependency)
- Supports 60+ languages
- Returns structured `compile` and `run` stages separately

**Cons:**
- Requires Docker everywhere (local ✓, but Render free tier has no persistent Docker sidecar)
- Container startup overhead
- Operational burden (keeping Piston image updated)
- Network latency between Spring Boot and Piston container (~2–5ms on localhost, higher remotely)

**Decision:** Accepted for **local development and testing**. Deterministic, fast, free.

---

### Option 3: External cloud execution API (JDoodle)

**How:** Send code to [JDoodle's REST API](https://www.jdoodle.com/compiler-api/) via HTTPS. JDoodle handles isolation and execution.

**Pros:**
- No infrastructure to manage in production
- Works on Render free tier (no Docker sidecar needed)
- Supports Java, Python, JavaScript
- Simple REST integration

**Cons:**
- External dependency: JDoodle downtime = platform downtime
- Daily credit limit on free tier (~200 requests/day)
- Combines stdout and stderr into a single `output` field (requires regex classification)
- Higher latency (~500ms–2s network round trip to JDoodle servers)
- Credential management required (API keys)
- No structured compile/run stage split — must infer from output content

**Decision:** Accepted for **production deployment**. Trade-off: operational simplicity over performance and reliability.

---

## Chosen Architecture: Dual-Provider Strategy

Rather than committing to one provider, the platform implements a **Strategy pattern** (`CodeExecutionProvider` interface) with provider selection via environment variable:

```
EXECUTION_PROVIDER=piston   → PistonExecutionProvider  (local dev)
EXECUTION_PROVIDER=jdoodle  → JdoodleExecutionProvider  (production)
```

This means:
- Zero code change to switch environments
- Local dev is fully offline-capable
- Production has no Docker dependency
- Both providers share the same response model (`ExecutionResponse`)

---

## Trade-offs Accepted

| Concern | Current trade-off | Better at scale |
|---|---|---|
| Reliability | Single JDoodle API key | Multiple keys, fallback to Piston |
| Latency | JDoodle adds ~500ms–2s | Self-hosted isolated workers |
| Security | Delegated entirely to JDoodle/Piston | Own Docker-based sandbox with seccomp |
| Cost | Free tier (limited requests) | Paid plan or self-hosted |
| Error classification | Regex on combined output | Structured API with separate stdout/stderr |

---

## Interview Questions This ADR Answers

- How do you execute untrusted code safely?
- Why did you choose JDoodle over running code directly?
- What are the risks of running code on your backend server?
- Why is Docker isolation important for code execution?
- What would you do if JDoodle goes down?
- What is the Strategy pattern and how did you apply it?
- How would you build your own execution sandbox?
