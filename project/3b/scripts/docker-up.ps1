Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "Validating Docker availability..." -ForegroundColor Cyan

try {
    docker info | Out-Null
} catch {
    Write-Host "Docker engine is not available. Start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

Write-Host "Building and starting the full Arquisoft stack..." -ForegroundColor Green
docker compose up --build -d

Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Customer App:         http://localhost:3001"
Write-Host "  Restaurant Dashboard: http://localhost:5173"
Write-Host "  API Gateway:          http://localhost:4000"
Write-Host "  Catalog Service:      http://localhost:3000"
Write-Host "  Order Service:        http://localhost:8080"
Write-Host "  Notification Service: http://localhost:8000"
Write-Host "  Auth Service:         http://localhost:8001"
Write-Host "  RabbitMQ UI:          http://localhost:15672"
