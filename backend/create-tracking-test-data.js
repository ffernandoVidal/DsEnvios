// Script para crear datos de prueba de rastreo
const mysql = require('mysql2/promise');

async function createTestTrackingData() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3310,
            user: 'root',
            password: '00000',
            database: 'enviosdb'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Crear personas (remitente y destinatario)
        await connection.query(
            `INSERT INTO personas (nombre, apellido, dpi, telefono, direccion, email, tipo)
             VALUES 
             ('Juan Carlos', 'García López', '1234567890101', '5551-1234', 'Zona 10, Guatemala', 'juan.garcia@email.com', 'cliente'),
             ('María Elena', 'Rodríguez Pérez', '9876543210987', '5552-5678', 'Zona 1, Quetzaltenango', 'maria.rodriguez@email.com', 'cliente')
             ON DUPLICATE KEY UPDATE id=id`
        );
        console.log('✅ Personas creadas\n');

        // Obtener IDs de las personas
        const [personas] = await connection.query('SELECT id FROM personas ORDER BY id LIMIT 2');
        const idRemitente = personas[0]?.id || 1;
        const idDestinatario = personas[1]?.id || 2;

        // Crear guías de prueba con diferentes estados
        const guiasData = [
            {
                numero_guia: 'ENV-2025-001',
                tipo_envio: 'NACIONAL',
                peso: 2.5,
                descripcion_contenido: 'Documentos importantes',
                valor_declarado: 100.00,
                costo_envio: 50.00,
                costo_total: 50.00,
                id_estado: 6, // ENTREGADO
                fecha_estimada_entrega: '2025-10-25'
            },
            {
                numero_guia: 'ENV-2025-002',
                tipo_envio: 'NACIONAL',
                peso: 5.0,
                descripcion_contenido: 'Ropa y accesorios',
                valor_declarado: 500.00,
                costo_envio: 75.00,
                costo_total: 85.00,
                id_estado: 4, // EN_TRANSITO
                fecha_estimada_entrega: '2025-10-26'
            },
            {
                numero_guia: 'ENV-2025-003',
                tipo_envio: 'NACIONAL',
                peso: 1.0,
                descripcion_contenido: 'Libros',
                valor_declarado: 200.00,
                costo_envio: 45.00,
                costo_total: 49.00,
                id_estado: 3, // EN_BODEGA
                fecha_estimada_entrega: '2025-10-27'
            },
            {
                numero_guia: 'ENV-2025-004',
                tipo_envio: 'NACIONAL',
                peso: 3.0,
                descripcion_contenido: 'Electrónicos',
                valor_declarado: 1000.00,
                costo_envio: 80.00,
                costo_total: 100.00,
                id_estado: 1, // PENDIENTE
                fecha_estimada_entrega: '2025-10-28'
            }
        ];

        // Insertar guías
        for (const guia of guiasData) {
            await connection.query(
                `INSERT INTO guias_envio (
                    numero_guia, tipo_envio, id_remitente, id_destinatario,
                    peso, descripcion_contenido, valor_declarado,
                    costo_envio, costo_total, id_estado, fecha_estimada_entrega
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE id_estado = VALUES(id_estado)`,
                [
                    guia.numero_guia, guia.tipo_envio, idRemitente, idDestinatario, guia.peso,
                    guia.descripcion_contenido, guia.valor_declarado,
                    guia.costo_envio, guia.costo_total, guia.id_estado,
                    guia.fecha_estimada_entrega
                ]
            );
            console.log(`✅ Guía creada/actualizada: ${guia.numero_guia}`);
        }

        // Crear historial de tracking completo para ENV-2025-001 (ENTREGADO)
        const [guia1] = await connection.query(
            'SELECT id FROM guias_envio WHERE numero_guia = ?',
            ['ENV-2025-001']
        );
        
        if (guia1.length > 0) {
            const idGuia1 = guia1[0].id;
            
            const trackingGuia1 = [
                { id_estado: 1, observaciones: 'Envío registrado y pendiente de recolección', fecha: '2025-10-20 08:00:00' },
                { id_estado: 2, observaciones: 'Paquete recolectado de la dirección del remitente', fecha: '2025-10-20 14:30:00' },
                { id_estado: 3, observaciones: 'Paquete recibido en bodega central de Guatemala', fecha: '2025-10-21 09:00:00' },
                { id_estado: 4, observaciones: 'Paquete en tránsito hacia Quetzaltenango', fecha: '2025-10-21 16:00:00' },
                { id_estado: 5, observaciones: 'Paquete en distribución local', fecha: '2025-10-22 10:00:00' },
                { id_estado: 6, observaciones: 'Paquete entregado exitosamente al destinatario', fecha: '2025-10-22 15:45:00' }
            ];

            for (const track of trackingGuia1) {
                await connection.query(
                    `INSERT INTO tracking (id_guia, id_estado, observaciones, fecha_registro)
                     VALUES (?, ?, ?, ?)`,
                    [idGuia1, track.id_estado, track.observaciones, track.fecha]
                );
            }
            console.log(`✅ Tracking completo creado para ENV-2025-001`);
        }

        // Crear tracking para ENV-2025-002 (EN_TRANSITO)
        const [guia2] = await connection.query(
            'SELECT id FROM guias_envio WHERE numero_guia = ?',
            ['ENV-2025-002']
        );
        
        if (guia2.length > 0) {
            const idGuia2 = guia2[0].id;
            
            const trackingGuia2 = [
                { id_estado: 1, observaciones: 'Envío registrado', fecha: '2025-10-22 09:00:00' },
                { id_estado: 2, observaciones: 'Recolectado exitosamente', fecha: '2025-10-22 15:00:00' },
                { id_estado: 3, observaciones: 'En bodega de Guatemala', fecha: '2025-10-23 08:00:00' },
                { id_estado: 4, observaciones: 'En tránsito hacia destino final', fecha: '2025-10-23 14:00:00' }
            ];

            for (const track of trackingGuia2) {
                await connection.query(
                    `INSERT INTO tracking (id_guia, id_estado, observaciones, fecha_registro)
                     VALUES (?, ?, ?, ?)`,
                    [idGuia2, track.id_estado, track.observaciones, track.fecha]
                );
            }
            console.log(`✅ Tracking creado para ENV-2025-002`);
        }

        // Crear tracking para ENV-2025-003 (EN_BODEGA)
        const [guia3] = await connection.query(
            'SELECT id FROM guias_envio WHERE numero_guia = ?',
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
                await connection.query(
                    `INSERT INTO tracking (id_guia, id_estado, observaciones, fecha_registro)
                     VALUES (?, ?, ?, ?)`,
                    [idGuia3, track.id_estado, track.observaciones, track.fecha]
                );
            }
            console.log(`✅ Tracking creado para ENV-2025-003`);
        }

        // Crear tracking para ENV-2025-004 (PENDIENTE)
        const [guia4] = await connection.query(
            'SELECT id FROM guias_envio WHERE numero_guia = ?',
            ['ENV-2025-004']
        );
        
        if (guia4.length > 0) {
            const idGuia4 = guia4[0].id;
            
            await connection.query(
                `INSERT INTO tracking (id_guia, id_estado, observaciones, fecha_registro)
                 VALUES (?, ?, ?, NOW())`,
                [idGuia4, 1, 'Envío registrado, esperando recolección']
            );
            console.log(`✅ Tracking creado para ENV-2025-004`);
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

createTestTrackingData();
