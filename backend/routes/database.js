const express = require('express');
const router = express.Router();

// Variable para almacenar la referencia a la base de datos
let db = null;

// Función para establecer la referencia a la base de datos
function setDB(database) {
    db = database;
}

/**
 * RUTA DE INICIALIZACIÓN DE BASE DE DATOS
 * Endpoint: POST /api/database/initialize
 */
router.post('/initialize', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Base de datos no conectada'
            });
        }

        // Datos iniciales
        const departamentos = [
            { code: "01", name: "Guatemala", region: "Central", shipping_zone: "A", delivery_base_cost: 25.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "02", name: "El Progreso", region: "Norte", shipping_zone: "B", delivery_base_cost: 35.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "03", name: "Sacatepéquez", region: "Central", shipping_zone: "A", delivery_base_cost: 30.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "04", name: "Chimaltenango", region: "Central", shipping_zone: "B", delivery_base_cost: 35.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "05", name: "Escuintla", region: "Sur", shipping_zone: "B", delivery_base_cost: 40.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "06", name: "Santa Rosa", region: "Sur", shipping_zone: "C", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "07", name: "Sololá", region: "Occidente", shipping_zone: "C", delivery_base_cost: 50.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "08", name: "Totonicapán", region: "Occidente", shipping_zone: "C", delivery_base_cost: 55.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "09", name: "Quetzaltenango", region: "Occidente", shipping_zone: "B", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "10", name: "Suchitepéquez", region: "Sur", shipping_zone: "C", delivery_base_cost: 50.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "11", name: "Retalhuleu", region: "Sur", shipping_zone: "C", delivery_base_cost: 55.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "12", name: "San Marcos", region: "Occidente", shipping_zone: "C", delivery_base_cost: 60.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "13", name: "Huehuetenango", region: "Norte", shipping_zone: "D", delivery_base_cost: 65.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "14", name: "Quiché", region: "Norte", shipping_zone: "D", delivery_base_cost: 70.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "15", name: "Baja Verapaz", region: "Norte", shipping_zone: "C", delivery_base_cost: 55.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "16", name: "Alta Verapaz", region: "Norte", shipping_zone: "D", delivery_base_cost: 65.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "17", name: "Petén", region: "Norte", shipping_zone: "D", delivery_base_cost: 75.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "18", name: "Izabal", region: "Oriente", shipping_zone: "C", delivery_base_cost: 55.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "19", name: "Zacapa", region: "Oriente", shipping_zone: "C", delivery_base_cost: 50.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "20", name: "Chiquimula", region: "Oriente", shipping_zone: "C", delivery_base_cost: 55.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "21", name: "Jalapa", region: "Oriente", shipping_zone: "C", delivery_base_cost: 50.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "22", name: "Jutiapa", region: "Sur", shipping_zone: "C", delivery_base_cost: 55.00, active: true, created_at: new Date(), updated_at: new Date() }
        ];

        const tiposPaquete = [
            { code: "ENVELOPE", name: "Sobre", displayName: "Pequeño", description: "Ideal para documentos y objetos pequeños", max_weight: 0.5, max_length: 30, max_width: 25, max_height: 2, base_price: 15.00, price_per_kg: 25.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "SMALL_BOX", name: "Paquete Pequeño", displayName: "Mediano", description: "Perfecto para ropa y objetos medianos", max_weight: 2.0, max_length: 20, max_width: 15, max_height: 10, base_price: 25.00, price_per_kg: 30.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "MEDIUM_BOX", name: "Paquete Mediano", displayName: "Grande", description: "Para electrodomésticos pequeños y objetos pesados", max_weight: 5.0, max_length: 30, max_width: 25, max_height: 20, base_price: 35.00, price_per_kg: 35.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "LARGE_BOX", name: "Paquete Grande", displayName: "Extra Grande", description: "Para objetos voluminosos y múltiples artículos", max_weight: 10.0, max_length: 50, max_width: 40, max_height: 30, base_price: 50.00, price_per_kg: 40.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "EXTRA_LARGE", name: "Paquete Extra Grande", displayName: "Jumbo", description: "Para envíos especiales y carga pesada", max_weight: 20.0, max_length: 80, max_width: 60, max_height: 50, base_price: 75.00, price_per_kg: 45.00, active: true, created_at: new Date(), updated_at: new Date() }
        ];

        const metodosPago = [
            { code: "CASH", name: "Efectivo", display_name: "Pago en Efectivo", type: "cash", processor: "internal", active: true, test_mode: false, created_at: new Date(), updated_at: new Date() },
            { code: "VISA", name: "Visa", display_name: "Tarjeta Visa", type: "card", processor: "visa", active: true, test_mode: true, created_at: new Date(), updated_at: new Date() },
            { code: "MASTERCARD", name: "Mastercard", display_name: "Tarjeta Mastercard", type: "card", processor: "mastercard", active: true, test_mode: true, created_at: new Date(), updated_at: new Date() },
            { code: "BANRURAL", name: "Banrural", display_name: "Transferencia Banrural", type: "bank_transfer", processor: "banrural", active: true, test_mode: true, created_at: new Date(), updated_at: new Date() },
            { code: "BAC", name: "BAC", display_name: "Transferencia BAC", type: "bank_transfer", processor: "bac", active: true, test_mode: true, created_at: new Date(), updated_at: new Date() }
        ];

        const tiposServicio = [
            { code: "STANDARD", name: "Estándar", description: "Entrega en 3-5 días hábiles", delivery_time_min: 3, delivery_time_max: 5, price_multiplier: 1.0, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "EXPRESS", name: "Express", description: "Entrega en 1-2 días hábiles", delivery_time_min: 1, delivery_time_max: 2, price_multiplier: 1.5, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "OVERNIGHT", name: "Overnight", description: "Entrega al siguiente día hábil", delivery_time_min: 1, delivery_time_max: 1, price_multiplier: 2.0, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "ECONOMY", name: "Económico", description: "Entrega en 5-7 días hábiles", delivery_time_min: 5, delivery_time_max: 7, price_multiplier: 0.8, active: true, created_at: new Date(), updated_at: new Date() }
        ];

        // Insertar datos solo si las colecciones están vacías
        const results = {};

        // Departamentos
        const deptCount = await db.collection('departments').countDocuments();
        if (deptCount === 0) {
            await db.collection('departments').insertMany(departamentos);
            results.departments = `${departamentos.length} departamentos insertados`;
        } else {
            results.departments = `${deptCount} departamentos ya existían`;
        }

        // Tipos de paquete
        const pkgCount = await db.collection('package_types').countDocuments();
        if (pkgCount === 0) {
            await db.collection('package_types').insertMany(tiposPaquete);
            results.package_types = `${tiposPaquete.length} tipos de paquete insertados`;
        } else {
            results.package_types = `${pkgCount} tipos de paquete ya existían`;
        }

        // Métodos de pago
        const payCount = await db.collection('payment_methods').countDocuments();
        if (payCount === 0) {
            await db.collection('payment_methods').insertMany(metodosPago);
            results.payment_methods = `${metodosPago.length} métodos de pago insertados`;
        } else {
            results.payment_methods = `${payCount} métodos de pago ya existían`;
        }

        // Tipos de servicio
        const svcCount = await db.collection('service_types').countDocuments();
        if (svcCount === 0) {
            await db.collection('service_types').insertMany(tiposServicio);
            results.service_types = `${tiposServicio.length} tipos de servicio insertados`;
        } else {
            results.service_types = `${svcCount} tipos de servicio ya existían`;
        }

        // Crear índices
        await db.collection('departments').createIndex({ "code": 1 }, { unique: true });
        await db.collection('package_types').createIndex({ "code": 1 }, { unique: true });
        await db.collection('payment_methods').createIndex({ "code": 1 }, { unique: true });
        await db.collection('service_types').createIndex({ "code": 1 }, { unique: true });

        res.status(200).json({
            success: true,
            message: 'Base de datos inicializada correctamente',
            results: results
        });

    } catch (error) {
        console.error('Error al inicializar base de datos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al inicializar base de datos',
            error: error.message
        });
    }
});

// Exportar el router y la función setDB
module.exports = router;
module.exports.setDB = setDB;