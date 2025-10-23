const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '00000',
            port: process.env.DB_PORT || 3310,
            database: process.env.DB_NAME || 'enviosdb'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Verificar usuarios
        const [usuarios] = await connection.execute('SELECT id, correo, nombre, id_rol, activo FROM usuarios');
        console.log('📋 Usuarios en la base de datos:');
        console.log('');
        usuarios.forEach(user => {
            console.log(`   ID: ${user.id}`);
            console.log(`   Correo: ${user.correo}`);
            console.log(`   Nombre: ${user.nombre}`);
            console.log(`   Rol ID: ${user.id_rol}`);
            console.log(`   Activo: ${user.activo ? 'Sí' : 'No'}`);
            console.log('   ---');
        });

        if (usuarios.length === 0) {
            console.log('⚠️  No hay usuarios en la base de datos');
            console.log('   Ejecuta: node init-database.js');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUsers();