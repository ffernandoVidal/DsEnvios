@echo off
echo ========================================
echo   SISTEMA DJ2 LOGISTICA - INICIO
echo ========================================
echo.

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    pause
    exit /b 1
)

echo.
echo Verificando MySQL...
mysql --version
if %errorlevel% neq 0 (
    echo ADVERTENCIA: MySQL no encontrado en PATH
    echo Asegurese de que MySQL este ejecutandose
)

echo.
echo ========================================
echo   INICIANDO BACKEND (Puerto 3005)
echo ========================================
cd backend

echo Verificando archivo .env...
if not exist .env (
    echo Creando archivo .env desde .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Configure las credenciales de MySQL en backend\.env
    echo.
    pause
)

echo Instalando dependencias del backend...
call npm install

echo.
echo Iniciando servidor backend...
start "DJ2 Backend" cmd /k "echo Backend ejecutandose en http://localhost:3005 && node server-mysql.js"

echo.
echo ========================================
echo   INICIANDO FRONTEND (Puerto 4200)  
echo ========================================
cd ..\frontend

echo Instalando dependencias del frontend...
call npm install

echo.
echo Iniciando servidor frontend...
start "DJ2 Frontend" cmd /k "echo Frontend ejecutandose en http://localhost:4200 && ng serve"

echo.
echo ========================================
echo   SISTEMA INICIADO CORRECTAMENTE
echo ========================================
echo.
echo Backend:  http://localhost:3005
echo Frontend: http://localhost:4200
echo.
echo Usuarios de prueba:
echo - Admin:    admin@dj2logistica.com / admin123
echo - Empleado: empleado@dj2logistica.com / emp123  
echo - Cliente:  cliente@example.com / client123
echo.
echo Presione cualquier tecla para abrir el navegador...
pause > nul

start http://localhost:4200

echo.
echo Sistema en ejecucion. Cierre esta ventana cuando termine.
pause