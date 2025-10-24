/**
 *  INICIALIZADOR DE BASE DE DATOS
 * Sistema de Gestión de Envíos DsEnvios
 * 
 * Este archivo inicializa toda la estructura de base de datos,
 * colecciones, índices y datos iniciales.
 */

const { connectToDatabase, createOptimizedIndexes } = require('./connection');

// Importar todos los esquemas
const {
    UserSchema,
    ShipmentSchema,
    QuotationSchema,
    TrackingSchema,
    OrderSchema
} = require('./schemas_main');

const {
    DepartmentSchema,
    MunicipalitySchema,
    VillageSchema,
    AddressCacheSchema
} = require('./schemas_locations');

const {
    PackageTypeSchema,
    PricingConfigSchema,
    ServiceTypeSchema,
    ShippingRateSchema
} = require('./schemas_products');

const {
    PaymentMethodSchema,
    TransactionSchema,
    NotificationSchema,
    SystemLogSchema
} = require('./schemas_operational');

/**
 *  CONFIGURACIÓN DE COLECCIONES Y ESQUEMAS
 */
const COLLECTIONS_CONFIG = {
    // Colecciones principales
    users: { schema: UserSchema, indexes: ['email', 'phone', 'document_number'] },
    shipments: { schema: ShipmentSchema, indexes: ['tracking_number', 'sender_id', 'recipient_id', 'status'] },
    quotations: { schema: QuotationSchema, indexes: ['quotation_number', 'customer_id', 'status'] },
    tracking: { schema: TrackingSchema, indexes: ['shipment_id', 'tracking_number', 'timestamp'] },
    orders: { schema: OrderSchema, indexes: ['order_number', 'customer_id', 'status'] },
    
    // Colecciones de ubicaciones
    departments: { schema: DepartmentSchema, indexes: ['code', 'name'] },
    municipalities: { schema: MunicipalitySchema, indexes: ['department_id', 'code', 'name'] },
    villages: { schema: VillageSchema, indexes: ['municipality_id', 'name'] },
    address_cache: { schema: AddressCacheSchema, indexes: ['coordinates', 'full_address'] },
    
    // Colecciones de productos y servicios
    package_types: { schema: PackageTypeSchema, indexes: ['code', 'active'] },
    pricing_config: { schema: PricingConfigSchema, indexes: ['service_type', 'active'] },
    service_types: { schema: ServiceTypeSchema, indexes: ['code', 'active'] },
    shipping_rates: { schema: ShippingRateSchema, indexes: ['origin_zone', 'destination_zone', 'service_type'] },
    
    // Colecciones operacionales
    payment_methods: { schema: PaymentMethodSchema, indexes: ['code', 'type', 'active'] },
    transactions: { schema: TransactionSchema, indexes: ['transaction_id', 'order_id', 'status'] },
    notifications: { schema: NotificationSchema, indexes: ['recipient_id', 'type', 'status'] },
    system_logs: { schema: SystemLogSchema, indexes: ['level', 'source', 'timestamp'] }
};

/**
 *  DATOS INICIALES
 */
const INITIAL_DATA = {
    // Departamentos de Guatemala
    departments: [
        { code: "01", name: "Guatemala", region: "Central", shipping_zone: "A", delivery_base_cost: 25.00 },
        { code: "02", name: "El Progreso", region: "Norte", shipping_zone: "B", delivery_base_cost: 35.00 },
        { code: "03", name: "Sacatepéquez", region: "Central", shipping_zone: "A", delivery_base_cost: 30.00 },
        { code: "04", name: "Chimaltenango", region: "Central", shipping_zone: "B", delivery_base_cost: 35.00 },
        { code: "05", name: "Escuintla", region: "Sur", shipping_zone: "B", delivery_base_cost: 40.00 },
        { code: "06", name: "Santa Rosa", region: "Sur", shipping_zone: "C", delivery_base_cost: 45.00 },
        { code: "07", name: "Sololá", region: "Occidente", shipping_zone: "C", delivery_base_cost: 50.00 },
        { code: "08", name: "Totonicapán", region: "Occidente", shipping_zone: "C", delivery_base_cost: 55.00 },
        { code: "09", name: "Quetzaltenango", region: "Occidente", shipping_zone: "B", delivery_base_cost: 45.00 },
        { code: "10", name: "Suchitepéquez", region: "Sur", shipping_zone: "C", delivery_base_cost: 50.00 },
        { code: "11", name: "Retalhuleu", region: "Sur", shipping_zone: "C", delivery_base_cost: 55.00 },
        { code: "12", name: "San Marcos", region: "Occidente", shipping_zone: "C", delivery_base_cost: 60.00 },
        { code: "13", name: "Huehuetenango", region: "Norte", shipping_zone: "D", delivery_base_cost: 65.00 },
        { code: "14", name: "Quiché", region: "Norte", shipping_zone: "D", delivery_base_cost: 70.00 },
        { code: "15", name: "Baja Verapaz", region: "Norte", shipping_zone: "C", delivery_base_cost: 55.00 },
        { code: "16", name: "Alta Verapaz", region: "Norte", shipping_zone: "D", delivery_base_cost: 65.00 },
        { code: "17", name: "Petén", region: "Norte", shipping_zone: "D", delivery_base_cost: 75.00 },
        { code: "18", name: "Izabal", region: "Oriente", shipping_zone: "C", delivery_base_cost: 55.00 },
        { code: "19", name: "Zacapa", region: "Oriente", shipping_zone: "C", delivery_base_cost: 50.00 },
        { code: "20", name: "Chiquimula", region: "Oriente", shipping_zone: "C", delivery_base_cost: 55.00 },
        { code: "21", name: "Jalapa", region: "Oriente", shipping_zone: "C", delivery_base_cost: 50.00 },
        { code: "22", name: "Jutiapa", region: "Sur", shipping_zone: "C", delivery_base_cost: 55.00 }
    ],
    
    // Tipos de paquete
    package_types: [
        { code: "ENVELOPE", name: "Sobre", max_weight: 0.5, max_length: 30, max_width: 25, max_height: 2, base_price: 15.00, active: true },
        { code: "SMALL_BOX", name: "Paquete Pequeño", max_weight: 2.0, max_length: 20, max_width: 15, max_height: 10, base_price: 25.00, active: true },
        { code: "MEDIUM_BOX", name: "Paquete Mediano", max_weight: 5.0, max_length: 30, max_width: 25, max_height: 20, base_price: 35.00, active: true },
        { code: "LARGE_BOX", name: "Paquete Grande", max_weight: 10.0, max_length: 50, max_width: 40, max_height: 30, base_price: 50.00, active: true },
        { code: "EXTRA_LARGE", name: "Paquete Extra Grande", max_weight: 20.0, max_length: 80, max_width: 60, max_height: 50, base_price: 75.00, active: true }
    ],
    
    // Tipos de servicio
    service_types: [
        { code: "STANDARD", name: "Estándar", description: "Entrega en 3-5 días hábiles", delivery_time_min: 3, delivery_time_max: 5, price_multiplier: 1.0, active: true },
        { code: "EXPRESS", name: "Express", description: "Entrega en 1-2 días hábiles", delivery_time_min: 1, delivery_time_max: 2, price_multiplier: 1.5, active: true },
        { code: "OVERNIGHT", name: "Overnight", description: "Entrega al siguiente día hábil", delivery_time_min: 1, delivery_time_max: 1, price_multiplier: 2.0, active: true },
        { code: "ECONOMY", name: "Económico", description: "Entrega en 5-7 días hábiles", delivery_time_min: 5, delivery_time_max: 7, price_multiplier: 0.8, active: true }
    ],
    
    // Métodos de pago
    payment_methods: [
        { code: "CASH", name: "Efectivo", display_name: "Pago en Efectivo", type: "cash", processor: "internal", active: true, test_mode: false },
        { code: "VISA", name: "Visa", display_name: "Tarjeta Visa", type: "card", processor: "visa", active: true, test_mode: true },
        { code: "MASTERCARD", name: "Mastercard", display_name: "Tarjeta Mastercard", type: "card", processor: "mastercard", active: true, test_mode: true },
        { code: "BANRURAL", name: "Banrural", display_name: "Transferencia Banrural", type: "bank_transfer", processor: "banrural", active: true, test_mode: true },
        { code: "BAC", name: "BAC", display_name: "Transferencia BAC", type: "bank_transfer", processor: "bac", active: true, test_mode: true }
    ]
};

/**
 *  FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
 */
async function initializeDatabase() {
    console.log(' Iniciando configuración de base de datos DsEnvios...\n');
    
    try {
        // Conectar a la base de datos
        console.log(' Conectando a MongoDB...');
        const { db, client } = await connectToDatabase();
        console.log(' Conexión exitosa a MongoDB\n');
        
        // Crear colecciones con esquemas de validación
        console.log(' Creando colecciones y esquemas de validación...');
        for (const [collectionName, config] of Object.entries(COLLECTIONS_CONFIG)) {
            try {
                await db.createCollection(collectionName, config.schema);
                console.log(`    Colección '${collectionName}' creada`);
            } catch (error) {
                if (error.code === 48) { // Collection already exists
                    console.log(`     Colección '${collectionName}' ya existe`);
                } else {
                    throw error;
                }
            }
        }
        console.log('');
        
        // Crear índices optimizados
        console.log(' Creando índices optimizados...');
        await createOptimizedIndexes(db);
        console.log(' Índices creados exitosamente\n');
        
        // Insertar datos iniciales
        console.log(' Insertando datos iniciales...');
        for (const [collectionName, data] of Object.entries(INITIAL_DATA)) {
            const collection = db.collection(collectionName);
            const existingCount = await collection.countDocuments();
            
            if (existingCount === 0) {
                await collection.insertMany(data.map(item => ({
                    ...item,
                    created_at: new Date(),
                    updated_at: new Date()
                })));
                console.log(`    ${data.length} registros insertados en '${collectionName}'`);
            } else {
                console.log(`     Colección '${collectionName}' ya contiene ${existingCount} registros`);
            }
        }
        console.log('');
        
        // Verificar estado de la base de datos
        console.log(' Verificando estado de la base de datos...');
        const stats = await db.stats();
        console.log(`    Tamaño de BD: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`    Colecciones: ${stats.collections}`);
        console.log(`    Documentos: ${stats.objects}`);
        console.log(`    Índices: ${stats.indexes}`);
        console.log('');
        
        console.log(' ¡Inicialización de base de datos completada exitosamente!');
        console.log(' La base de datos DsEnvios está lista para uso en producción.\n');
        
        return { success: true, db, client };
        
    } catch (error) {
        console.error(' Error durante la inicialización:', error.message);
        throw error;
    }
}

/**
 *  FUNCIÓN DE RESET (SOLO PARA DESARROLLO)
 */
async function resetDatabase() {
    console.log('  ADVERTENCIA: Iniciando reset completo de base de datos...\n');
    
    try {
        const { db, client } = await connectToDatabase();
        
        // Listar todas las colecciones
        const collections = await db.listCollections().toArray();
        
        // Eliminar todas las colecciones
        for (const collection of collections) {
            await db.dropCollection(collection.name);
            console.log(`     Colección '${collection.name}' eliminada`);
        }
        
        console.log('\n Reinicializando base de datos...\n');
        
        // Reinicializar
        return await initializeDatabase();
        
    } catch (error) {
        console.error(' Error durante el reset:', error.message);
        throw error;
    }
}

/**
 *  FUNCIÓN DE VERIFICACIÓN DE SALUD
 */
async function checkDatabaseHealth() {
    try {
        const { db, client } = await connectToDatabase();
        
        console.log(' Verificando salud de la base de datos...\n');
        
        // Verificar conexión
        await db.admin().ping();
        console.log(' Conexión a MongoDB: OK');
        
        // Verificar colecciones
        const collections = await db.listCollections().toArray();
        const expectedCollections = Object.keys(COLLECTIONS_CONFIG);
        const missingCollections = expectedCollections.filter(
            name => !collections.find(col => col.name === name)
        );
        
        if (missingCollections.length === 0) {
            console.log(` Colecciones (${collections.length}): OK`);
        } else {
            console.log(`  Colecciones faltantes: ${missingCollections.join(', ')}`);
        }
        
        // Verificar datos básicos
        for (const collectionName of Object.keys(INITIAL_DATA)) {
            const count = await db.collection(collectionName).countDocuments();
            console.log(`    ${collectionName}: ${count} documentos`);
        }
        
        console.log('\n Verificación de salud completada');
        
        return { healthy: true, collections: collections.length };
        
    } catch (error) {
        console.error(' Error en verificación de salud:', error.message);
        return { healthy: false, error: error.message };
    }
}

// Exportar funciones
module.exports = {
    initializeDatabase,
    resetDatabase,
    checkDatabaseHealth,
    COLLECTIONS_CONFIG,
    INITIAL_DATA
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--reset')) {
        resetDatabase().catch(console.error);
    } else if (args.includes('--check')) {
        checkDatabaseHealth().catch(console.error);
    } else {
        initializeDatabase().catch(console.error);
    }
}