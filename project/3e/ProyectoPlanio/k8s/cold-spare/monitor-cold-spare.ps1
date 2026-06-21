# monitor-cold-spare.ps1
# Monitorea el Activity Service y activa el Cold Spare automaticamente
# cuando detecta que la instancia activa ha fallado.

Write-Host "Iniciando monitoreo del Activity Service..." -ForegroundColor Cyan
Write-Host "Verificando cada 5 segundos..." -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener." -ForegroundColor Yellow
Write-Host ""

$spareActivated = $false

while ($true) {
    # Contar pods activos (excluyendo cold-spare)
    $allPods = kubectl get pods -l app=activity-service --no-headers 2>$null
    $activePods = $allPods | Where-Object { $_ -notmatch "cold-spare" -and $_ -match "Running" -and $_ -match "1/1" }
    $activeCount = ($activePods | Measure-Object).Count

    $timestamp = Get-Date -Format "HH:mm:ss"

    if ($activeCount -gt 0 -and -not $spareActivated) {
        Write-Host "[$timestamp] OK - Instancia activa funcionando ($activeCount pods Running)" -ForegroundColor Green
        Start-Sleep -Seconds 5

    } elseif ($activeCount -eq 0 -and -not $spareActivated) {
        Write-Host "[$timestamp] FALLO DETECTADO - No hay pods activos disponibles" -ForegroundColor Red
        Write-Host "[$timestamp] Activando Cold Spare automaticamente..." -ForegroundColor Yellow

        kubectl scale deployment activity-service-cold-spare --replicas=1 | Out-Null
        $spareActivated = $true
        Write-Host "[$timestamp] Cold Spare activado. Esperando que este listo..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5

    } elseif ($spareActivated) {
        # Verificar si el spare ya esta listo
        $sparePods = $allPods | Where-Object { $_ -match "cold-spare" -and $_ -match "1/1" -and $_ -match "Running" }
        $spareReady = ($sparePods | Measure-Object).Count

        if ($spareReady -gt 0) {
            Write-Host "[$timestamp] Cold Spare ACTIVO y listo - sistema recuperado" -ForegroundColor Green
            Write-Host ""
            Write-Host "Para restaurar el estado normal ejecuta:" -ForegroundColor Cyan
            Write-Host "  kubectl scale deployment activity-service --replicas=2" -ForegroundColor White
            Write-Host "  kubectl scale deployment activity-service-cold-spare --replicas=0" -ForegroundColor White
            break
        } else {
            Write-Host "[$timestamp] Esperando que el Cold Spare arranque..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
}