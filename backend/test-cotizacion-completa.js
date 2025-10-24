// Test de cotización con estructura completa
const axios = require('axios');

async function testCotizacion() {
    try {
        console.log('🧪 Probando cotización con diferentes configuraciones...\n');
        
        // Test 1: Un paquete pequeño, mismo lugar
        const test1 = {
            origen: 'Guatemala',
            destino: 'Guatemala',
            paquetes: [{
                tipo: 'sobre',
                peso: 0.5,
                largo: 20,
                ancho: 15,
                alto: 2,
                valor_declarado: 100
            }]
        };

        console.log(' Test 1: Sobre pequeño en misma ciudad (Guatemala → Guatemala)');
        const response1 = await axios.post('http://localhost:3005/api/cotizar', test1);
        console.log(' Respuesta:', JSON.stringify(response1.data, null, 2));
        console.log(`Total: Q${response1.data.cotizacion.total_general}\n`);

        // Test 2: Dos paquetes grandes, diferentes ciudades
        const test2 = {
            origen: 'Guatemala',
            destino: 'Quetzaltenango',
            paquetes: [
                {
                    tipo: 'caja',
                    nombrePersonalizado: 'Caja de Libros',
                    peso: 5,
                    largo: 40,
                    ancho: 30,
                    alto: 20,
                    valor_declarado: 500
                },
                {
                    tipo: 'caja',
                    nombrePersonalizado: 'Caja de Ropa',
                    peso: 3,
                    largo: 50,
                    ancho: 40,
                    alto: 30,
                    valor_declarado: 300
                }
            ],
            servicio: 'express'
        };

        console.log(' Test 2: Dos cajas grandes entre ciudades (Guatemala → Quetzaltenango)');
        const response2 = await axios.post('http://localhost:3005/api/cotizar', test2);
        console.log(' Respuesta:', JSON.stringify(response2.data, null, 2));
        console.log(`Total: Q${response2.data.cotizacion.total_general}`);
        console.log(`Tiempo: ${response2.data.cotizacion.tiempo_entrega}\n`);

        // Verificar estructura esperada por el frontend
        console.log(' Verificando estructura de respuesta...');
        const cotizacion = response2.data.cotizacion;
        
        const checks = [
            { campo: 'origen.display', valor: cotizacion.origen?.display },
            { campo: 'destino.display', valor: cotizacion.destino?.display },
            { campo: 'distancia.distanceText', valor: cotizacion.distancia?.distanceText },
            { campo: 'distancia.durationText', valor: cotizacion.distancia?.durationText },
            { campo: 'paquetes (array)', valor: Array.isArray(cotizacion.paquetes) },
            { campo: 'servicios (array)', valor: Array.isArray(cotizacion.servicios) },
            { campo: 'total_general', valor: cotizacion.total_general },
            { campo: 'paquetes[0].breakdown', valor: cotizacion.paquetes?.[0]?.breakdown }
        ];

        console.log('\nCampos verificados:');
        checks.forEach(check => {
            const status = check.valor !== undefined && check.valor !== false ? '' : '';
            console.log(`${status} ${check.campo}: ${check.valor}`);
        });

    } catch (error) {
        console.error(' Error en la prueba:', error.response?.data || error.message);
    }
}

testCotizacion();
