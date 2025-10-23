const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'enviosdb',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para verificar la conexión
async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida correctamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        return false;
    }
}

// Función para ejecutar queries con manejo de errores
async function executeQuery(query, params = []) {
    try {
        const [results] = await pool.execute(query, params);
        return { success: true, data: results };
    } catch (error) {
        console.error('Error en query:', error.message);
        return { success: false, error: error.message };
    }
}

// Función para transacciones
async function executeTransaction(queries) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (let i = 0; i < queries.length; i++) {
            const { query, params } = queries[i];
            const [result] = await connection.execute(query, params || []);
            results.push(result);
        }
        
        await connection.commit();
        connection.release();
        
        return { success: true, data: results };
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error en transacción:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    pool,
    checkConnection,
    executeQuery,
    executeTransaction
};