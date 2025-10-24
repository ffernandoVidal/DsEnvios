# Script para iniciar el sistema EnviosDS
# Ejecutar con: .\start-system.ps1

Write-Host "🚀 Iniciando Sistema EnviosDS..." -ForegroundColor Cyan
Write-Host ""

# Verificar MySQL
Write-Host "📊 Verificando MySQL..." -ForegroundColor Yellow
$mysqlProcess = Get-Process | Where-Object { $_.ProcessName -like "*mysqld*" }
if ($mysqlProcess) {
    Write-Host "✅ MySQL está ejecutándose" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL no está ejecutándose. Por favor inicia XAMPP." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Ferna\Desktop\envios ds\DsEnvios\backend'; node server-mysql.js"

Start-Sleep -Seconds 3

Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Ferna\Desktop\envios ds\DsEnvios\frontend'; ng serve"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Sistema iniciado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Acceso al sistema:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:57583" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3005" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciales:" -ForegroundColor Cyan
Write-Host "   Correo: admin@envios.com" -ForegroundColor White
Write-Host "   Contraseña: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para abrir el navegador..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:57583"