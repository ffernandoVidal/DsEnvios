const axios = require('axios');

const API_URL = 'http://localhost:3005';

async function testAPI() {
    console.log('🧪 Probando API EnviosDS...\n');

    try {
        // Test 1: Health check
        console.log('1⃣ Probando conexión al servidor...');
        const health = await axios.get(API_URL);
        console.log(' Servidor:', health.data.message);
        console.log('');

        // Test 2: Login
        console.log('2⃣ Probando login...');
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            correo: 'admin@envios.com',
            contrasena: 'admin123'
        });
        
        if (loginResponse.data.success) {
            console.log(' Login exitoso');
            console.log('   Usuario:', loginResponse.data.data.usuario.nombre);
            console.log('   Rol:', loginResponse.data.data.rol?.nombre_rol || 'N/A');
            const token = loginResponse.data.data.token;
            console.log('   Token recibido: ');
            console.log('');

            // Test 3: Listar guías (requiere autenticación)
            console.log('3⃣ Probando listado de guías...');
            const guiasResponse = await axios.get(`${API_URL}/api/guias`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const totalGuias = guiasResponse.data.pagination?.totalItems || guiasResponse.data.data?.length || 0;
            console.log(' Guías obtenidas:', totalGuias);
            console.log('');

            // Test 4: Catálogos
            console.log('4⃣ Probando catálogos...');
            const sucursalesResponse = await axios.get(`${API_URL}/api/sucursales`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(' Sucursales:', sucursalesResponse.data.data.length);

            const bodegasResponse = await axios.get(`${API_URL}/api/bodegas`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(' Bodegas:', bodegasResponse.data.data.length);
            console.log('');

            console.log(' Todas las pruebas pasaron correctamente!\n');
            console.log(' Resumen:');
            console.log('    Servidor funcionando');
            console.log('    Autenticación JWT');
            console.log('    Endpoints protegidos');
            console.log('    Base de datos conectada');
            console.log('    Catálogos funcionando');
        }

    } catch (error) {
        console.error(' Error en las pruebas:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Mensaje:', error.response.data.message || error.response.data);
        } else if (error.code) {
            console.error('   Código de error:', error.code);
            console.error('   Mensaje:', error.message);
            if (error.code === 'ECONNREFUSED') {
                console.error('\n  El servidor no está respondiendo en http://localhost:3005');
                console.error('   Verifica que el servidor esté ejecutándose con:');
                console.error('   node server-mysql.js');
            }
        } else {
            console.error('   Error completo:', error);
        }
    }
}

testAPI();