---
title: "ADR-004: API Contract Governance & Drift Detection"
description: "Why we chose code-first OpenAPI with committed specs, automated CI drift detection, and explicit local regeneration over auto-commits."
---

# ADR-004 — API Contract Governance & CI Drift Detection
**Status:** Accepted

---

## Context

As the platform evolves, backend APIs change (new endpoints, modified request/response DTOs, changed field validations). Without a strict governance mechanism:
1. Backend changes can silently break frontend consumers without warning.
2. API documentation quickly becomes stale compared to actual runtime behavior.
3. Frontend and backend developers lack a version-controlled, diffable source of truth for communication.

---

## Options Considered

### Option 1: Runtime-Only Swagger (No Committed Spec)

**How:** Rely strictly on Springdoc Swagger UI at `/swagger-ui.html` and dynamic JSON at `/v3/api-docs` when the backend is running locally.

**Pros:**
- Zero maintenance overhead.
- No build scripts or versioning needed.

**Cons:**
- **No version history:** Git has no record of how contracts evolved across releases.
- **No PR visibility:** Code reviewers cannot see how a Java DTO refactor affects API consumers in the GitHub pull request diff.
- **No CI protection:** Broken or breaking API contracts cannot be detected before merging.
- **Documentation disconnect:** External documentation platforms (like Mintlify) cannot access the spec without calling a live, running server.

**Decision:** Rejected.

---

### Option 2: Spec-First Design (Design in YAML/JSON First)

**How:** Manually edit `openapi.yaml`, commit it, and use code generation plugins (`openapi-generator-maven-plugin`) to generate Spring Boot controller interfaces and models.

**Pros:**
- Strict contract enforcement.
- Frontends and backends can develop in parallel against mock servers.

**Cons:**
- High friction and cognitive overhead for a lean, fast-moving project.
- Generated Java boilerplate often conflicts with custom validation, Lombok, or domain logic.
- Dual-maintenance problem when tweaks are needed during implementation.

**Decision:** Rejected for current velocity needs.

---

### Option 3: Code-First with Committed Spec & CI Drift Detection (Chosen)

**How:**
1. Code remains the source of truth, enriched with declarative Springdoc/Swagger annotations (`@Schema`, `@Operation`, `@ApiResponse`).
2. The generated spec is checked into version control at `docs/openapi.json`.
3. A local regeneration script (`node scripts/generate-openapi.mjs`) produces the JSON artifact across all operating systems.
4. CI runs a **Contract Drift Guard**: it spins up the backend, fetches `/v3/api-docs`, and executes `git diff --exit-code docs/openapi.json`. If code changed without updating the spec, CI fails.
5. Mintlify consumes `docs/openapi.json` to generate interactive API Reference docs automatically.

**Pros:**
- **High developer velocity:** Write clean Java code and DTOs; annotations keep docs tightly coupled with logic.
- **Diffable PRs:** Any change to an endpoint or DTO shows up in GitHub PR diffs as a clear JSON contract change.
- **Zero drift guarantee:** Code and spec cannot drift apart in `main`.
- **Decoupled documentation:** Mintlify reads the static `docs/openapi.json` without needing access to a live database or backend container.

---

## The Deciding Factor: Why CI Must NOT Auto-Commit

When CI detects that `docs/openapi.json` has drifted from code, there are two choices:
1. **Auto-commit:** Have GitHub Actions run `git commit` and push the updated spec back to the branch.
2. **Fail the build:** Have CI reject the build and demand the developer regenerate and review the diff locally.

**We chose Option 2 (Fail the build).**

### Rationale:
- **Preserving Intentionality:** An API change is a public contract change. If a developer accidentally renames a field from `sourceCode` to `code`, an auto-commit would silently approve and document the breaking change. Failing the build forces the developer to inspect `git diff docs/openapi.json` locally and consciously acknowledge the breaking change before pushing.
- **Clean Git History & Security:** CI auto-commits require write tokens (`GITHUB_TOKEN` with write permissions), can trigger recursive CI loops, and create unexpected commit collisions if the developer continues making local commits.

---

## Consequences Accepted

- Backend developers must run `node scripts/generate-openapi.mjs` whenever they change an endpoint or DTO before pushing.
- GitHub Actions CI takes an extra ~1–2 minutes to start the backend and verify contract alignment.
- Local machines must have a running backend instance to execute the regeneration script.

---

## Interview Talking Points

- **API Contract Drift:** How modern microservices avoid breaking frontend consumers without heavy governance tools.
- **Shift-Left Contract Testing:** Catching schema mismatch during pull requests rather than post-deployment integration testing.
- **Fail-Fast CI Design:** Why automated schema commits in CI mask breaking changes, and why developer review is vital for contract stability.
