// Script para verificar guías existentes
const mysql = require('mysql2/promise');

async function checkExistingGuias() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3310,
            user: 'root',
            password: '00000',
            database: 'enviosdb'
        });

        console.log(' Conectado a la base de datos\n');

        // Verificar tabla guia_envio
        console.log(' Verificando tabla guia_envio:');
        const [guias] = await connection.query('SELECT * FROM guia_envio LIMIT 10');
        
        if (guias.length === 0) {
            console.log('    No hay guías en guia_envio');
        } else {
            console.log(`    ${guias.length} guías encontradas en guia_envio`);
            console.table(guias.map(g => ({
                numero_guia: g.numero_guia,
                id_estado: g.id_estado,
                fecha_creacion: g.fecha_creacion
            })));
        }

        // Verificar tabla guias_envio
        try {
            console.log('\n Verificando tabla guias_envio:');
            const [guias2] = await connection.query('SELECT * FROM guias_envio LIMIT 10');
            
            if (guias2.length === 0) {
                console.log('    No hay guías en guias_envio');
            } else {
                console.log(`    ${guias2.length} guías encontradas en guias_envio`);
                console.table(guias2.map(g => ({
                    numero_guia: g.numero_guia,
                    id_estado: g.id_estado,
                    fecha_creacion: g.fecha_creacion
                })));
            }
        } catch (error) {
            console.log('    Tabla guias_envio no existe');
        }

        await connection.end();
    } catch (error) {
        console.error(' Error:', error.message);
    }
}

checkExistingGuias();
