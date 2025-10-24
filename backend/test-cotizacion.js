const axios = require('axios');

const API_URL = 'http://localhost:3005';

async function testCotizacion() {
    console.log('🧪 Probando endpoint de cotización...\n');

    try {
        // Datos de prueba para cotización
        const cotizacionData = {
            origen: 'Guatemala',
            destino: 'Quetzaltenango',
            paquetes: [
                {
                    id: '1',
                    tipo: 'pequeño',
                    peso: 2,
                    largo: 20,
                    ancho: 15,
                    alto: 10,
                    valor_declarado: 150,
                    cantidad: 1,
                    nombrePersonalizado: 'Paquete de prueba'
                }
            ],
            servicio: 'estandar'
        };

        console.log(' Datos de cotización:');
        console.log('   Origen:', cotizacionData.origen);
        console.log('   Destino:', cotizacionData.destino);
        console.log('   Paquetes:', cotizacionData.paquetes.length);
        console.log('');

        const response = await axios.post(`${API_URL}/api/cotizar`, cotizacionData);

        if (response.data.success) {
            console.log(' Cotización exitosa!\n');
            const cot = response.data.cotizacion;
            console.log(' Resultado de la cotización:');
            console.log('    Costo base: Q' + cot.costoBase.toFixed(2));
            console.log('    Costo distancia: Q' + cot.costoDistancia.toFixed(2));
            console.log('    Costo tamaño: Q' + cot.costoTamano.toFixed(2));
            console.log('     Costo seguro: Q' + cot.costoSeguro.toFixed(2));
            console.log('   ');
            console.log('    TOTAL: Q' + cot.costoTotal.toFixed(2));
            console.log('');
            console.log('   ⏱  Tiempo estimado: ' + cot.tiempoEstimado + ' día(s)');
            console.log('    Válido hasta: ' + new Date(cot.validoHasta).toLocaleString('es-GT'));
            console.log('');
            console.log(' El formulario de cotización funciona correctamente!');
        } else {
            console.log(' Error en cotización:', response.data.error);
        }

    } catch (error) {
        console.error(' Error al probar cotización:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error:', error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('   El servidor no está ejecutándose en http://localhost:3005');
            console.error('   Inicia el servidor con: node server-mysql.js');
        } else {
            console.error('   ', error.message);
        }
    }
}

testCotizacion();