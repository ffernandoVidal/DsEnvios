// Script para crear datos de prueba usando las tablas existentes
const mysql = require('mysql2/promise');

async function createSimpleTestData() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3310,
            user: 'root',
            password: '00000',
            database: 'enviosdb'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Insertar guías de prueba en guia_envio
        const guiasData = [
            {
                numero_guia: 'ENV-2025-001',
                tipo_envio: 'NACIONAL',
                peso: 2.5,
                descripcion_contenido: 'Documentos importantes',
                valor_declarado: 100.00,
                costo_envio: 50.00,
                id_estado: 6 // ENTREGADO
            },
            {
                numero_guia: 'ENV-2025-002',
                tipo_envio: 'NACIONAL',
                peso: 5.0,
                descripcion_contenido: 'Ropa y accesorios',
                valor_declarado: 500.00,
                costo_envio: 75.00,
                id_estado: 4 // EN_TRANSITO
            },
            {
                numero_guia: 'ENV-2025-003',
                tipo_envio: 'NACIONAL',
                peso: 1.0,
                descripcion_contenido: 'Libros',
                valor_declarado: 200.00,
                costo_envio: 45.00,
                id_estado: 3 // EN_BODEGA
            },
            {
                numero_guia: 'ENV-2025-004',
                tipo_envio: 'NACIONAL',
                peso: 3.0,
                descripcion_contenido: 'Electrónicos',
                valor_declarado: 1000.00,
                costo_envio: 80.00,
                id_estado: 1 // PENDIENTE
            }
        ];

        for (const guia of guiasData) {
            try {
                await connection.query(
                    `INSERT INTO guia_envio (
                        numero_guia, tipo_envio, peso, descripcion_contenido,
                        valor_declarado, costo_envio, id_estado
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE id_estado = VALUES(id_estado)`,
                    [
                        guia.numero_guia, guia.tipo_envio, guia.peso,
                        guia.descripcion_contenido, guia.valor_declarado,
                        guia.costo_envio, guia.id_estado
                    ]
                );
                console.log(`✅ Guía creada/actualizada: ${guia.numero_guia}`);
            } catch (error) {
                console.log(`❌ Error con ${guia.numero_guia}: ${error.message}`);
            }
        }

        // Crear historial de tracking
        console.log('\n📝 Creando historial de tracking...');

        // Para ENV-2025-001 (ENTREGADO) - historial completo
        const [guia1] = await connection.query(
            'SELECT id FROM guia_envio WHERE numero_guia = ?',
            ['ENV-2025-001']
        );

        if (guia1.length > 0) {
            const idGuia1 = guia1[0].id;
            const trackingGuia1 = [
                { id_estado: 1, observaciones: 'Envío registrado y pendiente de recolección', fecha: '2025-10-20 08:00:00' },
                { id_estado: 2, observaciones: 'Paquete recolectado de la dirección del remitente', fecha: '2025-10-20 14:30:00' },
                { id_estado: 3, observaciones: 'Paquete recibido en bodega central', fecha: '2025-10-21 09:00:00' },
                { id_estado: 4, observaciones: 'Paquete en tránsito hacia destino', fecha: '2025-10-21 16:00:00' },
                { id_estado: 5, observaciones: 'Paquete en distribución local', fecha: '2025-10-22 10:00:00' },
                { id_estado: 6, observaciones: 'Paquete entregado exitosamente', fecha: '2025-10-22 15:45:00' }
            ];

            for (const track of trackingGuia1) {
                try {
                    await connection.query(
                        `INSERT INTO seguimiento (id_guia, id_estado, descripcion, fecha_actualizacion)
                         VALUES (?, ?, ?, ?)`,
                        [idGuia1, track.id_estado, track.observaciones, track.fecha]
                    );
                } catch (error) {
                    console.log(`   ⚠️ Error insertando tracking: ${error.message}`);
                }
            }
            console.log(`✅ Historial completo para ENV-2025-001`);
        }

        // Para ENV-2025-002 (EN_TRANSITO)
        const [guia2] = await connection.query(
            'SELECT id FROM guia_envio WHERE numero_guia = ?',
            ['ENV-2025-002']
        );

        if (guia2.length > 0) {
            const idGuia2 = guia2[0].id;
            const trackingGuia2 = [
                { id_estado: 1, observaciones: 'Envío registrado', fecha: '2025-10-22 09:00:00' },
                { id_estado: 2, observaciones: 'Recolectado exitosamente', fecha: '2025-10-22 15:00:00' },
                { id_estado: 3, observaciones: 'En bodega', fecha: '2025-10-23 08:00:00' },
                { id_estado: 4, observaciones: 'En tránsito hacia destino final', fecha: '2025-10-23 14:00:00' }
            ];

            for (const track of trackingGuia2) {
                try {
                    await connection.query(
                        `INSERT INTO seguimiento (id_guia, id_estado, descripcion, fecha_actualizacion)
                         VALUES (?, ?, ?, ?)`,
                        [idGuia2, track.id_estado, track.observaciones, track.fecha]
                    );
                } catch (error) {
                    console.log(`   ⚠️ Error: ${error.message}`);
                }
            }
            console.log(`✅ Historial para ENV-2025-002`);
        }

        // Para ENV-2025-003 (EN_BODEGA)
        const [guia3] = await connection.query(
            'SELECT id FROM guia_envio WHERE numero_guia = ?',
            ['ENV-2025-003']
        );

        if (guia3.length > 0) {
            const idGuia3 = guia3[0].id;
            const trackingGuia3 = [
                { id_estado: 1, observaciones: 'Envío registrado', fecha: '2025-10-23 10:00:00' },
                { id_estado: 2, observaciones: 'Recolectado', fecha: '2025-10-23 16:00:00' },
                { id_estado: 3, observaciones: 'Almacenado en bodega central', fecha: '2025-10-23 19:00:00' }
            ];

            for (const track of trackingGuia3) {
                try {
                    await connection.query(
                        `INSERT INTO seguimiento (id_guia, id_estado, descripcion, fecha_actualizacion)
                         VALUES (?, ?, ?, ?)`,
                        [idGuia3, track.id_estado, track.observaciones, track.fecha]
                    );
                } catch (error) {
                    console.log(`   ⚠️ Error: ${error.message}`);
                }
            }
            console.log(`✅ Historial para ENV-2025-003`);
        }

        // Para ENV-2025-004 (PENDIENTE)
        const [guia4] = await connection.query(
            'SELECT id FROM guia_envio WHERE numero_guia = ?',
            ['ENV-2025-004']
        );

        if (guia4.length > 0) {
            const idGuia4 = guia4[0].id;
            try {
                await connection.query(
                    `INSERT INTO seguimiento (id_guia, id_estado, descripcion, fecha_actualizacion)
                     VALUES (?, ?, ?, NOW())`,
                    [idGuia4, 1, 'Envío registrado, esperando recolección']
                );
            } catch (error) {
                console.log(`   ⚠️ Error: ${error.message}`);
            }
            console.log(`✅ Historial para ENV-2025-004`);
        }

        console.log('\n🎉 Datos de prueba creados exitosamente!');
        console.log('\n📦 Guías disponibles para rastrear:');
        console.log('   - ENV-2025-001 (Entregado)');
        console.log('   - ENV-2025-002 (En tránsito)');
        console.log('   - ENV-2025-003 (En bodega)');
        console.log('   - ENV-2025-004 (Pendiente)');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createSimpleTestData();
