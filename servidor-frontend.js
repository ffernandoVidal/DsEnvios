// Servidor Frontend Simple para desarrollo
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Servir archivos estáticos desde el directorio actual
app.use(express.static(__dirname));

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para dashboard (página completa después del login)
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Ruta legacy para frontend-forza.html
app.get('/frontend-forza.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Frontend ejecutándose en http://localhost:${PORT}`);
    console.log(`📱 Abre tu navegador en: http://localhost:${PORT}`);
    console.log(`🏠 Página principal: http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
});