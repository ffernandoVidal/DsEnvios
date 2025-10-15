# Script de inicio para EnviosDS (PowerShell)
# Este script inicia tanto el backend como el frontend

Write-Host "🚀 Iniciando EnviosDS..." -ForegroundColor Green

# Verificar que Node.js esté instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instálalo primero." -ForegroundColor Red
    exit 1
}

# Verificar que MongoDB esté ejecutándose
Write-Host "🔍 Verificando MongoDB..." -ForegroundColor Yellow
$mongoRunning = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet
if (-not $mongoRunning) {
    Write-Host "⚠️  MongoDB no está ejecutándose en localhost:27017" -ForegroundColor Yellow
    Write-Host "   Por favor inicia MongoDB antes de continuar." -ForegroundColor Yellow
}

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias principales..." -ForegroundColor Blue
    npm install
}

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Blue
    Set-Location backend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🎯 Para iniciar el sistema, ejecuta estos comandos en terminales separadas:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "  node backend/server.js" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "  node servidor-frontend.js" -ForegroundColor White
Write-Host ""
Write-Host "Luego abre tu navegador en: http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Ver README.md para más información." -ForegroundColor Cyan