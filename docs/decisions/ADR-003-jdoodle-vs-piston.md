---
title: "ADR-003: JDoodle vs Piston"
description: "Why JDoodle was chosen for production and Piston retained for local development."
---

# ADR-003 — JDoodle vs. Piston: Production Provider Selection
**Status:** Accepted (JDoodle chosen for production; Piston retained for local)

---

## Context

Both providers are already integrated. This ADR documents the decision of which to use in the production environment (Render) and why.

---

## Comparison

| Dimension | Piston | JDoodle |
|---|---|---|
| Hosting | Self-hosted Docker container | Managed cloud API |
| Cost | Free | Free tier: ~200 req/day |
| Latency | ~100–500ms (same machine) | ~500ms–2000ms (external network) |
| Setup complexity | Docker required | REST API + credentials |
| Language support | 60+ | 70+ |
| Response structure | Separate compile + run stages | Single `output` field |
| Error classification | Structured (exit codes, signals) | Requires regex on output text |
| Production reliability | Depends on your infra | Depends on JDoodle uptime |
| Render free tier | ❌ No persistent sidecar | ✅ No Docker needed |

---

## The Deciding Factor

**Render free tier does not support a persistent Piston sidecar container.**

Render's free tier runs a single Docker container (the backend). Running Piston alongside requires either:
- A second Render service (adds cost and network latency)
- Docker-in-Docker (complex, not supported on free tier)
- A separate VM/VPS

For the current project stage (personal demo, limited budget), JDoodle's cloud API is the simplest path to a working production deployment.

---

## Consequences Accepted

**JDoodle's combined `output` field:**

Piston returns:
```json
{ "compile": { "stdout": "...", "stderr": "..." }, "run": { "stdout": "...", "stderr": "..." } }
```

JDoodle returns:
```json
{ "output": "...everything...", "cpuTime": "0.42", "memory": "10240" }
```

This forces the platform to classify errors by scanning output content with regex:

```java
// Compilation error
Pattern.compile("(?m)(^.*\\.java:\\d+:\\s*error:|\\berror:\\s+|\\b\\d+\\s+errors?\\b)")

// Runtime error
Pattern.compile("(?s).*(Exception in thread|java\\.lang\\.[A-Za-z]+Exception|...).*")
```

**Risk:** A user program that prints text matching these patterns could be misclassified. This is a known limitation of the current approach.

---

## Future Migration Path

When the project adds self-hosted infrastructure (Phase 2+):

1. Stand up a Piston instance on a separate server (or upgrade Render plan)
2. Switch `EXECUTION_PROVIDER=piston` in Render env vars
3. Update `PistonProperties.baseUrl` to point to the remote Piston host
4. Zero code change required — the Strategy pattern handles the rest

---

## Interview Questions This ADR Answers

- Why did you choose JDoodle over Piston for production?
- What are the limitations of JDoodle's API?
- How would you migrate execution providers without changing code?
- Why does your JDoodle integration use regex for error detection?
- What are the risks of regex-based error classification?
