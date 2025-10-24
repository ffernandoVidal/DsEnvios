// Script para probar el endpoint de rastreo
const axios = require('axios');

async function testRastreo() {
    try {
        console.log('🧪 Probando endpoint de rastreo...\n');

        // Primero, consultar todas las guías disponibles
        const pool = require('./config/database').pool;
        const connection = await pool.getConnection();
        
        const [guias] = await connection.query(
            'SELECT numero_guia, id_estado, fecha_creacion FROM guias_envio LIMIT 5'
        );
        
        console.log(' Guías disponibles en la base de datos:');
        if (guias.length === 0) {
            console.log('    No hay guías registradas');
        } else {
            guias.forEach(g => {
                console.log(`   - ${g.numero_guia} (Estado ID: ${g.id_estado})`);
            });
        }
        
        connection.release();

        if (guias.length > 0) {
            // Probar rastreo con la primera guía
            const numeroGuia = guias[0].numero_guia;
            console.log(`\n Rastreando guía: ${numeroGuia}\n`);

            const response = await axios.get(`http://localhost:3005/api/rastreo/${numeroGuia}`);

            if (response.data.success) {
                const { guia, progreso, historial } = response.data.data;

                console.log(' Rastreo exitoso!\n');
                
                console.log(' Información de la Guía:');
                console.log(`   Número: ${guia.numero_guia}`);
                console.log(`   Tipo: ${guia.tipo_envio}`);
                console.log(`   Estado: ${guia.estado_actual.nombre}`);
                console.log(`   Peso: ${guia.peso} kg`);
                console.log(`   Costo: Q${guia.costo_total}`);
                
                console.log('\n Progreso:');
                console.log(`   Porcentaje: ${progreso.porcentaje}%`);
                console.log(`   Paso actual: ${progreso.paso_actual}/6`);
                console.log(`   Completado: ${progreso.completado ? 'Sí' : 'No'}`);
                
                console.log('\n Timeline:');
                progreso.timeline.forEach(estado => {
                    const status = estado.completado ? '' : '';
                    const current = estado.activo ? ' ← ACTUAL' : '';
                    console.log(`   ${status} ${estado.icono} ${estado.nombre}${current}`);
                });

                if (historial.length > 0) {
                    console.log('\n Historial:');
                    historial.forEach((h, i) => {
                        console.log(`   ${i + 1}. [${new Date(h.fecha).toLocaleString('es-GT')}]`);
                        console.log(`      ${h.estado}: ${h.observaciones || h.descripcion}`);
                        if (h.ubicacion) console.log(`       ${h.ubicacion}`);
                    });
                } else {
                    console.log('\n No hay historial de tracking');
                }

                console.log('\n Personas:');
                console.log(`   Remitente: ${guia.remitente.nombre}`);
                console.log(`   Destinatario: ${guia.destinatario.nombre}`);

            }
        }

        // Probar con guía inexistente
        console.log('\n\n🧪 Probando con guía inexistente...');
        try {
            await axios.get('http://localhost:3005/api/rastreo/GUIA-NO-EXISTE');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(' Error 404 manejado correctamente:', error.response.data.error);
            }
        }

        console.log('\n Pruebas completadas!');

    } catch (error) {
        console.error(' Error:', error.message);
        if (error.response) {
            console.error('   Respuesta:', error.response.data);
        }
    }
}

testRastreo();
