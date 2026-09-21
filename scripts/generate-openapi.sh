#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/generate-openapi.sh
#
# Generates a fresh OpenAPI 3.1 spec from the running Spring Boot backend
# and writes it to docs/openapi.json.
#
# Usage:
#   1. Start the backend first:  cd backend && ./mvnw spring-boot:run
#   2. In a separate terminal:   ./scripts/generate-openapi.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BACKEND_URL="http://localhost:8080"
SPEC_ENDPOINT="$BACKEND_URL/v3/api-docs"
OUTPUT_FILE="docs/openapi.json"
MAX_RETRIES=20

# ── 1. Wait for the backend to be healthy ────────────────────────────────────
echo "🔍 Checking backend health at $BACKEND_URL/actuator/health..."
for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf "$BACKEND_URL/actuator/health" > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo ""
    echo "❌ Backend did not become healthy after $MAX_RETRIES attempts."
    echo "   Make sure the backend is running:"
    echo "   cd backend && ./mvnw spring-boot:run"
    exit 1
  fi
  echo "   Waiting... ($i/$MAX_RETRIES)"
  sleep 3
done

# ── 2. Fetch and pretty-print the spec ───────────────────────────────────────
echo "📥 Fetching OpenAPI spec from $SPEC_ENDPOINT..."
curl -sf "$SPEC_ENDPOINT" | python3 -m json.tool --indent 2 > "$OUTPUT_FILE"

echo "✅ Spec written to $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "  git add $OUTPUT_FILE"
echo "  git commit -m 'docs: regenerate openapi.json'"
