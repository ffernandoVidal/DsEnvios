// Script para consultar estructura de tablas de rastreo
const mysql = require('mysql2/promise');

async function checkTrackingTables() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3310,
            user: 'root',
            password: '00000',
            database: 'enviosdb'
        });

        console.log(' Conectado a la base de datos\n');

        // Estructura de guias_envio
        console.log(' Estructura de guias_envio:');
        const [guiasColumns] = await connection.query('DESCRIBE guias_envio');
        console.table(guiasColumns);

        // Estructura de tracking
        console.log('\n Estructura de tracking:');
        const [trackingColumns] = await connection.query('DESCRIBE tracking');
        console.table(trackingColumns);

        // Estructura de estados_envio
        console.log('\n Estructura de estados_envio:');
        const [estadosColumns] = await connection.query('DESCRIBE estados_envio');
        console.table(estadosColumns);

        // Ver estados disponibles
        console.log('\n Estados de envío disponibles:');
        const [estados] = await connection.query('SELECT * FROM estados_envio');
        console.table(estados);

        await connection.end();
    } catch (error) {
        console.error(' Error:', error.message);
    }
}

checkTrackingTables();
