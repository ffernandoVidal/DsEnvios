# Script para detener el sistema EnviosDS
# Ejecutar con: .\stop-system.ps1

Write-Host "🛑 Deteniendo Sistema EnviosDS..." -ForegroundColor Cyan
Write-Host ""

# Detener procesos de Node.js
Write-Host "🔧 Deteniendo Backend..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force
Write-Host "✅ Backend detenido" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Sistema detenido correctamente!" -ForegroundColor Green