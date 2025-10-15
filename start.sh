#!/bin/bash

# Script de inicio para EnviosDS
# Este script inicia tanto el backend como el frontend

echo "🚀 Iniciando EnviosDS..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

# Verificar que MongoDB esté ejecutándose
echo "🔍 Verificando MongoDB..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  MongoDB no está ejecutándose en localhost:27017"
    echo "   Por favor inicia MongoDB antes de continuar."
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias principales..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🎯 Para iniciar el sistema, ejecuta estos comandos en terminales separadas:"
echo ""
echo "Terminal 1 (Backend):"
echo "  node backend/server.js"
echo ""
echo "Terminal 2 (Frontend):"
echo "  node servidor-frontend.js"
echo ""
echo "Luego abre tu navegador en: http://localhost:8080"
echo ""
echo "📚 Ver README.md para más información."