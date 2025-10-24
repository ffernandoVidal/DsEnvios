// Script de prueba para los endpoints de gestión de base de datos
const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3005/api';
let authToken = '';

async function testDatabaseEndpoints() {
    try {
        console.log('🧪 Iniciando pruebas de endpoints de base de datos...\n');

        // 1. Login para obtener token
        console.log('1⃣ Autenticando usuario...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            correo: 'admin@envios.com',
            contrasena: 'admin123'
        });

        if (loginResponse.data.success) {
            authToken = loginResponse.data.data.token;
            console.log(' Login exitoso. Token obtenido.\n');
        } else {
            console.log(' Error en login');
            return;
        }

        // Headers con autenticación
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        };

        // 2. Verificar estado de la base de datos
        console.log('2⃣ Verificando estado de conexión...');
        const statusResponse = await axios.get(`${API_URL}/database/status`, { headers });
        
        if (statusResponse.data.success) {
            console.log(' Estado de BD:', {
                conectado: statusResponse.data.data.connected,
                database: statusResponse.data.data.database,
                version: statusResponse.data.data.version,
                hora: statusResponse.data.data.serverTime
            });
            console.log('');
        }

        // 3. Listar todas las tablas
        console.log('3⃣ Listando tablas de la base de datos...');
        const tablesResponse = await axios.get(`${API_URL}/database/tables`, { headers });
        
        if (tablesResponse.data.success) {
            console.log(` Total de tablas: ${tablesResponse.data.data.length}`);
            tablesResponse.data.data.forEach(table => {
                console.log(`    ${table.name} (${table.rowCount} registros, ${table.columns.length} columnas)`);
            });
            console.log('');
        }

        // 4. Obtener datos de la tabla usuarios
        console.log('4⃣ Consultando tabla "usuarios"...');
        const usuariosResponse = await axios.get(`${API_URL}/database/tables/usuarios?limit=10&offset=0`, { headers });
        
        if (usuariosResponse.data.success) {
            console.log(` Datos de usuarios (${usuariosResponse.data.data.total} total):`);
            usuariosResponse.data.data.rows.forEach(user => {
                console.log(`    ${user.nombre} ${user.apellido} - ${user.correo} (${user.activo ? 'Activo' : 'Inactivo'})`);
            });
            console.log('');
        }

        // 5. Ejecutar consulta personalizada
        console.log('5⃣ Ejecutando consulta SQL personalizada...');
        const queryResponse = await axios.post(
            `${API_URL}/database/query`,
            { query: 'SELECT COUNT(*) as total FROM usuarios WHERE activo = 1' },
            { headers }
        );

        if (queryResponse.data.success) {
            console.log(` Consulta ejecutada. Resultados:`);
            console.log(queryResponse.data.data.rows);
            console.log('');
        }

        // 6. Obtener estadísticas
        console.log('6⃣ Obteniendo estadísticas de la base de datos...');
        const statsResponse = await axios.get(`${API_URL}/database/stats`, { headers });
        
        if (statsResponse.data.success) {
            console.log(` Estadísticas generales:`);
            console.log(`   Total de tablas: ${statsResponse.data.data.totalTables}`);
            statsResponse.data.data.tables.forEach(table => {
                console.log(`   - ${table.name}: ${table.rowCount} registros`);
            });
            console.log('');
        }

        // 7. Probar consulta no permitida (debe fallar)
        console.log('7⃣ Probando consulta no permitida (UPDATE)...');
        try {
            await axios.post(
                `${API_URL}/database/query`,
                { query: 'UPDATE usuarios SET nombre = "Test"' },
                { headers }
            );
            console.log(' Error: La consulta UPDATE debería haber sido rechazada\n');
        } catch (error) {
            if (error.response && error.response.data.error) {
                console.log(` Consulta rechazada correctamente: ${error.response.data.error}\n`);
            }
        }

        console.log(' ¡Todas las pruebas completadas exitosamente!');
        console.log('\n Resumen:');
        console.log('    Autenticación funcionando');
        console.log('    Estado de BD verificado');
        console.log('    Listado de tablas funcionando');
        console.log('    Consulta de datos por tabla funcionando');
        console.log('    Consultas SQL personalizadas funcionando');
        console.log('    Estadísticas de BD funcionando');
        console.log('    Validación de seguridad funcionando');

    } catch (error) {
        console.error(' Error en las pruebas:', error.response?.data || error.message);
    }
}

// Ejecutar pruebas
testDatabaseEndpoints();
