const axios = require('axios');

async function testLogin() {
    try {
        console.log('🔬 Probando endpoint de login...');
        console.log('📡 URL: http://localhost:3005/api/auth/login');
        
        const response = await axios.post('http://localhost:3005/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        console.log('✅ Login exitoso:');
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error en login:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('StatusText:', error.response.statusText);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No se recibió respuesta del servidor');
            console.error('Request:', error.request);
        } else {
            console.error('Error en configuración:', error.message);
        }
        console.error('Config:', error.config);
    }
}

// Esperar un poco antes de hacer la llamada
setTimeout(testLogin, 1000);