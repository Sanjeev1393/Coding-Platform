# ─────────────────────────────────────────────────────────────────────────────
# scripts/generate-openapi.ps1
#
# Generates a fresh OpenAPI 3.1 spec from the running Spring Boot backend
# and writes it to docs/openapi.json.
#
# Usage (run from project root — D:\Personal Project):
#   1. Start the backend first:  cd backend; .\mvnw.cmd spring-boot:run
#   2. Open a NEW terminal at the project root and run:
#      .\scripts\generate-openapi.ps1
# ─────────────────────────────────────────────────────────────────────────────

$BackendUrl   = "http://localhost:8080"
$SpecEndpoint = "$BackendUrl/v3/api-docs"
$HealthUrl    = "$BackendUrl/actuator/health"
$OutputFile   = "docs/openapi.json"
$MaxRetries   = 20
$healthy      = $false

# ── 1. Wait for the backend to be healthy ────────────────────────────────────
Write-Host "Checking backend health at $HealthUrl..."

for ($i = 1; $i -le $MaxRetries; $i++) {
    $status = $null
    try {
        $status = (Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 3).status
    } catch {
        $status = $null
    }

    if ($status -eq "UP") {
        Write-Host "Backend is healthy"
        $healthy = $true
        break
    }

    Write-Host "  Waiting... ($i / $MaxRetries)"
    Start-Sleep -Seconds 3
}

if (-not $healthy) {
    Write-Host ""
    Write-Host "ERROR: Backend did not become healthy after $MaxRetries attempts."
    Write-Host "Make sure the backend is running:"
    Write-Host "  cd backend"
    Write-Host "  .\mvnw.cmd spring-boot:run"
    exit 1
}

# ── 2. Fetch and write the spec ───────────────────────────────────────────────
Write-Host "Fetching OpenAPI spec from $SpecEndpoint..."

$spec = Invoke-RestMethod -Uri $SpecEndpoint
$spec | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $OutputFile

Write-Host "Spec written to $OutputFile"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  git add $OutputFile"
Write-Host "  git commit -m docs: regenerate openapi.json"
