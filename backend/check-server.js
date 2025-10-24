// Script simple para verificar el servidor
const http = require('http');

function checkServer() {
    const options = {
        hostname: 'localhost',
        port: 3005,
        path: '/',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log(' Servidor respondió');
        console.log('   Status:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('   Respuesta:', data);
        });
    });

    req.on('error', (error) => {
        if (error.code === 'ECONNREFUSED') {
            console.log(' El servidor no está ejecutándose en el puerto 3005');
            console.log('   Inicia el servidor con: node server-mysql.js');
        } else {
            console.log(' Error:', error.message);
        }
    });

    req.on('timeout', () => {
        console.log('⏱  Timeout - El servidor no respondió a tiempo');
        req.destroy();
    });

    req.end();
}

console.log(' Verificando servidor en http://localhost:3005...\n');
checkServer();