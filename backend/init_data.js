const { MongoClient } = require('mongodb');

async function initializeData() {
    let client;
    
    try {
        // Conectar a MongoDB
        client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        console.log('Conectado a MongoDB');
        
        const db = client.db('enviosdb1');
        
        // Verificar si ya hay datos
        const deptCount = await db.collection('departments').countDocuments();
        const packageCount = await db.collection('packagetypes').countDocuments();
        const paymentCount = await db.collection('paymentmethods').countDocuments();
        
        console.log(`Datos existentes: Departments: ${deptCount}, PackageTypes: ${packageCount}, PaymentMethods: ${paymentCount}`);
        
        if (deptCount > 0 && packageCount > 0 && paymentCount > 0) {
            console.log('Los datos ya existen en la base de datos');
            return;
        }
        
        // Datos de departamentos de Guatemala
        const departamentos = [
            { code: "01", name: "Guatemala", region: "Central", shipping_zone: "A", delivery_base_cost: 25.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "02", name: "El Progreso", region: "Norte", shipping_zone: "B", delivery_base_cost: 35.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "03", name: "Sacatepéquez", region: "Central", shipping_zone: "A", delivery_base_cost: 30.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "04", name: "Chimaltenango", region: "Central", shipping_zone: "B", delivery_base_cost: 35.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "05", name: "Escuintla", region: "Costa Sur", shipping_zone: "B", delivery_base_cost: 40.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "06", name: "Santa Rosa", region: "Costa Sur", shipping_zone: "C", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "07", name: "Sololá", region: "Occidente", shipping_zone: "B", delivery_base_cost: 40.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "08", name: "Totonicapán", region: "Occidente", shipping_zone: "B", delivery_base_cost: 40.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "09", name: "Quetzaltenango", region: "Occidente", shipping_zone: "B", delivery_base_cost: 40.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "10", name: "Suchitepéquez", region: "Costa Sur", shipping_zone: "C", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "11", name: "Retalhuleu", region: "Costa Sur", shipping_zone: "C", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "12", name: "San Marcos", region: "Occidente", shipping_zone: "C", delivery_base_cost: 50.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "13", name: "Huehuetenango", region: "Norte", shipping_zone: "C", delivery_base_cost: 50.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "14", name: "Quiché", region: "Norte", shipping_zone: "C", delivery_base_cost: 50.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "15", name: "Baja Verapaz", region: "Norte", shipping_zone: "B", delivery_base_cost: 40.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "16", name: "Alta Verapaz", region: "Norte", shipping_zone: "C", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "17", name: "Petén", region: "Norte", shipping_zone: "D", delivery_base_cost: 60.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "18", name: "Izabal", region: "Caribe", shipping_zone: "C", delivery_base_cost: 50.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "19", name: "Zacapa", region: "Oriente", shipping_zone: "C", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "20", name: "Chiquimula", region: "Oriente", shipping_zone: "C", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "21", name: "Jalapa", region: "Oriente", shipping_zone: "B", delivery_base_cost: 40.00, active: true, created_at: new Date(), updated_at: new Date() },
            { code: "22", name: "Jutiapa", region: "Oriente", shipping_zone: "C", delivery_base_cost: 45.00, active: true, created_at: new Date(), updated_at: new Date() }
        ];
        
        // Tipos de paquetes
        const tiposPaquetes = [
            { typeId: "documento", displayName: "Documento", description: "Documentos y papeles importantes", max_weight_kg: 0.5, base_cost: 15.00, cost_per_kg: 0.00, active: true, created_at: new Date(), updated_at: new Date() },
            { typeId: "paquete_pequeno", displayName: "Paquete Pequeño", description: "Paquetes hasta 5kg", max_weight_kg: 5.0, base_cost: 25.00, cost_per_kg: 3.00, active: true, created_at: new Date(), updated_at: new Date() },
            { typeId: "paquete_mediano", displayName: "Paquete Mediano", description: "Paquetes de 5kg a 20kg", max_weight_kg: 20.0, base_cost: 40.00, cost_per_kg: 4.00, active: true, created_at: new Date(), updated_at: new Date() },
            { typeId: "paquete_grande", displayName: "Paquete Grande", description: "Paquetes de 20kg a 50kg", max_weight_kg: 50.0, base_cost: 65.00, cost_per_kg: 5.00, active: true, created_at: new Date(), updated_at: new Date() },
            { typeId: "carga_pesada", displayName: "Carga Pesada", description: "Paquetes mayores a 50kg", max_weight_kg: 999.0, base_cost: 100.00, cost_per_kg: 6.00, active: true, created_at: new Date(), updated_at: new Date() }
        ];
        
        // Métodos de pago
        const metodosPago = [
            { methodId: "efectivo_origen", displayName: "Efectivo en Origen", description: "Pago en efectivo al momento del envío", requires_card: false, processing_fee: 0.00, active: true, created_at: new Date(), updated_at: new Date() },
            { methodId: "efectivo_destino", displayName: "Contra Entrega", description: "Pago en efectivo al momento de la entrega", requires_card: false, processing_fee: 0.00, active: true, created_at: new Date(), updated_at: new Date() },
            { methodId: "tarjeta_credito", displayName: "Tarjeta de Crédito", description: "Pago con tarjeta de crédito", requires_card: true, processing_fee: 2.50, active: true, created_at: new Date(), updated_at: new Date() },
            { methodId: "tarjeta_debito", displayName: "Tarjeta de Débito", description: "Pago con tarjeta de débito", requires_card: true, processing_fee: 1.50, active: true, created_at: new Date(), updated_at: new Date() },
            { methodId: "transferencia", displayName: "Transferencia Bancaria", description: "Pago por transferencia bancaria", requires_card: false, processing_fee: 5.00, active: true, created_at: new Date(), updated_at: new Date() }
        ];
        
        // Tipos de servicio
        const tiposServicio = [
            { serviceId: "estandar", displayName: "Envío Estándar", description: "Entrega en 3-5 días hábiles", delivery_days: 5, cost_multiplier: 1.0, active: true, created_at: new Date(), updated_at: new Date() },
            { serviceId: "express", displayName: "Envío Express", description: "Entrega en 1-2 días hábiles", delivery_days: 2, cost_multiplier: 1.5, active: true, created_at: new Date(), updated_at: new Date() },
            { serviceId: "mismo_dia", displayName: "Mismo Día", description: "Entrega el mismo día (solo área metropolitana)", delivery_days: 1, cost_multiplier: 2.0, active: true, created_at: new Date(), updated_at: new Date() }
        ];
        
        // Insertar datos si no existen
        if (deptCount === 0) {
            await db.collection('departments').insertMany(departamentos);
            console.log(`Insertados ${departamentos.length} departamentos`);
        }
        
        if (packageCount === 0) {
            await db.collection('packagetypes').insertMany(tiposPaquetes);
            console.log(`Insertados ${tiposPaquetes.length} tipos de paquetes`);
        }
        
        if (paymentCount === 0) {
            await db.collection('paymentmethods').insertMany(metodosPago);
            console.log(`Insertados ${metodosPago.length} métodos de pago`);
        }
        
        // Verificar si existen tipos de servicio
        const serviceCount = await db.collection('servicetypes').countDocuments();
        if (serviceCount === 0) {
            await db.collection('servicetypes').insertMany(tiposServicio);
            console.log(`Insertados ${tiposServicio.length} tipos de servicio`);
        }
        
        console.log('Inicialización de datos completada exitosamente');
        
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('Conexión cerrada');
        }
    }
}

// Ejecutar la inicialización
initializeData().then(() => {
    console.log('Script completado');
    process.exit(0);
}).catch(error => {
    console.error('Error en el script:', error);
    process.exit(1);
});