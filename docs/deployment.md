---
title: "Deployment"
description: "How the platform is deployed — Vercel, Render, Docker Compose, secrets, CORS, and scaling."
---

# Deployment

## Architecture

```
GitHub (source of truth)
     │
     ├──── Vercel (automatic deploy on push)
     │          └─ React + Vite SPA
     │             Served from Vercel edge CDN
     │
     └──── Render (manual or auto deploy on push)
                └─ Spring Boot JAR inside Docker container
                   EXECUTION_PROVIDER=jdoodle
```

## Frontend — Vercel

**How it works:**
- Push to `main` triggers automatic Vercel deploy
- Vite builds static assets; Vercel serves them from CDN
- Environment variables set in Vercel dashboard: `VITE_API_BASE_URL`

**Key decision:** The frontend does not hardcode the backend URL. It reads `import.meta.env.VITE_API_BASE_URL` at build time.

```js
// services/apiConfig.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

**Why this matters:** Early in the project, the production build was calling `localhost:8080` — the frontend worked locally but all submissions failed in production. The root cause was a hardcoded URL. Fix: environment variable.

---

## Backend — Render

**How it works:**
- Render pulls the Docker image or builds from `Dockerfile` on deploy
- The `Dockerfile` performs a multi-stage build: Maven build → minimal JRE runtime image
- Environment variables set in Render dashboard (never in committed files)

**Dockerfile overview (multi-stage):**
```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
COPY . .
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
COPY --from=build target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Environment variables on Render:**
```
PORT=8080                        ← Render injects dynamically
EXECUTION_PROVIDER=jdoodle
JDOODLE_CLIENT_ID=...           ← Secret; set via Render dashboard
JDOODLE_CLIENT_SECRET=...       ← Secret; set via Render dashboard
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Health check:** Render pings `/actuator/health` to determine if the container is healthy before routing traffic.

---

## Local Development — Docker Compose

```yaml
# compose.yaml (simplified)
services:
  backend:
    build: ./backend
    ports: ["8080:8080"]
    environment:
      EXECUTION_PROVIDER: piston
      PISTON_BASE_URL: http://piston:2000
    depends_on: [piston]

  piston:
    image: ghcr.io/engineer-man/piston
    ports: ["2000:2000"]
```

Local uses **Piston** (self-hosted Docker sandbox). Production uses **JDoodle** (cloud API). The same codebase handles both via `EXECUTION_PROVIDER`.

---

## Secrets Management

**Rule:** Secrets are never committed to Git.

| Secret | Where stored |
|---|---|
| `JDOODLE_CLIENT_ID` | Render environment variables |
| `JDOODLE_CLIENT_SECRET` | Render environment variables |
| `VITE_API_BASE_URL` | Vercel environment variables |

`.env.example` is committed to show required variables with placeholder values. Actual `.env` files are in `.gitignore`.

---

## CORS

Cross-Origin Resource Sharing must be explicitly configured because the frontend (`*.vercel.app`) is a different origin from the backend (`*.onrender.com`).

**How it's configured (in code):**
```java
// CorsConfig.java
@Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
String allowedOriginsProperty
```

The `CORS_ALLOWED_ORIGINS` env var is a comma-separated list. At startup, it's split and logged:
```
INFO  Configured CORS allowed origins: [https://your-app.vercel.app, http://localhost:5173]
```

**No wildcard `*` origins.** This is intentional — wildcard CORS is a security risk because it allows any website to make credentialed requests to your API.

---

## Common Deployment Problems Encountered

See `incidents/` directory for full write-ups:
- [INC-001: Production API URL Hardcoded](incidents/INC-001-production-api-url.md)
- [INC-002: Execution Latency 7–10 seconds](incidents/INC-002-execution-latency.md)

---

## What Would Change at Scale

**Current:** Single Render instance, single JDoodle API key, no load balancing.

**With 100+ concurrent users:**
```
Client
  │
  ▼
Load Balancer (Render / AWS ALB)
  │
  ├── Backend Instance 1
  ├── Backend Instance 2
  └── Backend Instance 3
        │
        ▼
   Shared State (Redis)
   - Rate limiting counters
   - Session data (if added)
        │
        ▼
   Execution Queue (Kafka/SQS)
        │
        ▼
   Execution Workers
```

Key challenge with horizontal scaling: **stateful components must move to shared external stores.** A rate limiter that lives in each instance's memory becomes incorrect once you have 3 instances — each thinks the user has made 3 requests when the real total is 9.

---

## Interview Questions This Section Answers

- How did you deploy the project?
- How do you manage secrets in production?
- How do you prevent secrets from being committed to Git?
- How does the frontend communicate with the backend in production?
- What is CORS and how do you handle it?
- How do you handle environment-specific configuration?
- What is Docker multi-stage build and why use it?
- How does Render know if your backend is healthy?
- What problems did you face during deployment?
- How would you scale this to handle more users?
