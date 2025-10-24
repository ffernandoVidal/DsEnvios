const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '00000',
            port: process.env.DB_PORT || 3310
        });

        console.log(' Conectado a MySQL');

        // Crear la base de datos si no existe
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'enviosdb'}\``);
        console.log(` Base de datos '${process.env.DB_NAME || 'enviosdb'}' creada/verificada correctamente`);
        
        // Cerrar y reconectar a la base de datos específica
        await connection.end();
        
        const dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '00000',
            port: process.env.DB_PORT || 3310,
            database: process.env.DB_NAME || 'enviosdb'
        });
        
        console.log(' Conectado a la base de datos enviosdb');

        await dbConnection.end();
        console.log(' Proceso completado exitosamente');
        
    } catch (error) {
        console.error(' Error:', error.message);
        process.exit(1);
    }
}

createDatabase();