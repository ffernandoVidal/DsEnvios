/**
 * SCRIPT UNIFICADO DE INICIALIZACIÓN DE BASE DE DATOS
 * DsEnvios - Sistema de Gestión de Envíos Guatemala
 * 
 * Este script inicializa completamente la base de datos enviosdb1
 * con todos los esquemas, índices y datos iniciales necesarios.
 * 
 * Autor: Sistema DsEnvios
 * Fecha: Octubre 2025
 */

const { MongoClient } = require('mongodb');

// Configuración de conexión
const CONFIG = {
    development: {
        uri: 'mongodb://localhost:27017',
        dbName: 'enviosdb1'
    },
    production: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        dbName: process.env.DB_NAME || 'enviosdb1'
    }
};

const environment = process.env.NODE_ENV || 'development';
const dbConfig = CONFIG[environment];

/**
 * ESQUEMAS DE VALIDACIÓN DE COLECCIONES
 */
const SCHEMAS = {
    // USUARIOS
    users: {
        bsonType: "object",
        required: ["email", "password_hash", "first_name", "last_name", "phone", "role", "status", "created_at"],
        properties: {
            _id: { bsonType: "objectId" },
            email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
            password_hash: { bsonType: "string", minLength: 60 },
            first_name: { bsonType: "string", minLength: 2, maxLength: 50 },
            last_name: { bsonType: "string", minLength: 2, maxLength: 50 },
            phone: { bsonType: "string", pattern: "^[0-9+\\-\\s()]{8,15}$" },
            role: { enum: ["admin", "employee", "customer"] },
            status: { enum: ["active", "inactive", "pending", "suspended"] },
            address: { bsonType: "string", maxLength: 200 },
            department_id: { bsonType: "objectId" },
            municipality_id: { bsonType: "objectId" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" },
            last_login: { bsonType: "date" }
        }
    },

    // DEPARTAMENTOS
    departments: {
        bsonType: "object",
        required: ["code", "name", "region", "shipping_zone", "delivery_base_cost", "active", "created_at"],
        properties: {
            _id: { bsonType: "objectId" },
            code: { bsonType: "string", pattern: "^[0-9]{2}$" },
            name: { bsonType: "string", minLength: 3, maxLength: 50 },
            region: { enum: ["Central", "Norte", "Sur", "Oriente", "Occidente", "Costa Sur", "Caribe"] },
            shipping_zone: { enum: ["A", "B", "C", "D"] },
            delivery_base_cost: { bsonType: "double", minimum: 0 },
            active: { bsonType: "bool" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
        }
    },

    // MUNICIPIOS
    municipalities: {
        bsonType: "object",
        required: ["department_id", "name", "active", "created_at"],
        properties: {
            _id: { bsonType: "objectId" },
            department_id: { bsonType: "objectId" },
            name: { bsonType: "string", minLength: 2, maxLength: 50 },
            active: { bsonType: "bool" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
        }
    },

    // TIPOS DE PAQUETES
    packagetypes: {
        bsonType: "object",
        required: ["typeId", "displayName", "description", "max_weight_kg", "base_cost", "cost_per_kg", "active", "created_at"],
        properties: {
            _id: { bsonType: "objectId" },
            typeId: { bsonType: "string", minLength: 3, maxLength: 30 },
            displayName: { bsonType: "string", minLength: 5, maxLength: 50 },
            description: { bsonType: "string", maxLength: 200 },
            max_weight_kg: { bsonType: "double", minimum: 0 },
            base_cost: { bsonType: "double", minimum: 0 },
            cost_per_kg: { bsonType: "double", minimum: 0 },
            active: { bsonType: "bool" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
        }
    },

    // MÉTODOS DE PAGO
    paymentmethods: {
        bsonType: "object",
        required: ["methodId", "displayName", "description", "requires_card", "processing_fee", "active", "created_at"],
        properties: {
            _id: { bsonType: "objectId" },
            methodId: { bsonType: "string", minLength: 3, maxLength: 30 },
            displayName: { bsonType: "string", minLength: 5, maxLength: 50 },
            description: { bsonType: "string", maxLength: 200 },
            requires_card: { bsonType: "bool" },
            processing_fee: { bsonType: "double", minimum: 0 },
            active: { bsonType: "bool" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
        }
    },

    // TIPOS DE SERVICIO
    servicetypes: {
        bsonType: "object",
        required: ["serviceId", "displayName", "description", "delivery_days", "cost_multiplier", "active", "created_at"],
        properties: {
            _id: { bsonType: "objectId" },
            serviceId: { bsonType: "string", minLength: 3, maxLength: 30 },
            displayName: { bsonType: "string", minLength: 5, maxLength: 50 },
            description: { bsonType: "string", maxLength: 200 },
            delivery_days: { bsonType: "int", minimum: 1 },
            cost_multiplier: { bsonType: "double", minimum: 0.1 },
            active: { bsonType: "bool" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
        }
    },

    // ENVÍOS
    shipments: {
        bsonType: "object",
        required: ["user_id", "sender_name", "sender_phone", "sender_address", "recipient_name", "recipient_phone", "recipient_address", "department_from_id", "department_to_id", "package_type_id", "payment_method_id", "service_type_id", "declared_value", "weight_kg", "total_cost", "status", "created_at"],
        properties: {
            _id: { bsonType: "objectId" },
            user_id: { bsonType: "objectId" },
            sender_name: { bsonType: "string", minLength: 3, maxLength: 100 },
            sender_phone: { bsonType: "string", pattern: "^[0-9+\\-\\s()]{8,15}$" },
            sender_address: { bsonType: "string", minLength: 10, maxLength: 200 },
            recipient_name: { bsonType: "string", minLength: 3, maxLength: 100 },
            recipient_phone: { bsonType: "string", pattern: "^[0-9+\\-\\s()]{8,15}$" },
            recipient_address: { bsonType: "string", minLength: 10, maxLength: 200 },
            department_from_id: { bsonType: "objectId" },
            municipality_from_id: { bsonType: "objectId" },
            department_to_id: { bsonType: "objectId" },
            municipality_to_id: { bsonType: "objectId" },
            package_type_id: { bsonType: "objectId" },
            payment_method_id: { bsonType: "objectId" },
            service_type_id: { bsonType: "objectId" },
            declared_value: { bsonType: "double", minimum: 0 },
            weight_kg: { bsonType: "double", minimum: 0.1 },
            description: { bsonType: "string", maxLength: 500 },
            tracking_number: { bsonType: "string", pattern: "^DS[0-9]{10}$" },
            total_cost: { bsonType: "double", minimum: 0 },
            status: { enum: ["pending", "confirmed", "in_transit", "delivered", "cancelled", "returned"] },
            observations: { bsonType: "string", maxLength: 500 },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" },
            estimated_delivery: { bsonType: "date" },
            actual_delivery: { bsonType: "date" }
        }
    }
};

/**
 * DATOS INICIALES PARA LAS COLECCIONES
 */
const INITIAL_DATA = {
    // Departamentos de Guatemala
    departments: [
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
    ],

    // Tipos de paquetes
    packagetypes: [
        { typeId: "documento", displayName: "Documento", description: "Documentos y papeles importantes", max_weight_kg: 0.5, base_cost: 15.00, cost_per_kg: 0.00, active: true, created_at: new Date(), updated_at: new Date() },
        { typeId: "paquete_pequeno", displayName: "Paquete Pequeño", description: "Paquetes hasta 5kg", max_weight_kg: 5.0, base_cost: 25.00, cost_per_kg: 3.00, active: true, created_at: new Date(), updated_at: new Date() },
        { typeId: "paquete_mediano", displayName: "Paquete Mediano", description: "Paquetes de 5kg a 20kg", max_weight_kg: 20.0, base_cost: 40.00, cost_per_kg: 4.00, active: true, created_at: new Date(), updated_at: new Date() },
        { typeId: "paquete_grande", displayName: "Paquete Grande", description: "Paquetes de 20kg a 50kg", max_weight_kg: 50.0, base_cost: 65.00, cost_per_kg: 5.00, active: true, created_at: new Date(), updated_at: new Date() },
        { typeId: "carga_pesada", displayName: "Carga Pesada", description: "Paquetes mayores a 50kg", max_weight_kg: 999.0, base_cost: 100.00, cost_per_kg: 6.00, active: true, created_at: new Date(), updated_at: new Date() }
    ],

    // Métodos de pago
    paymentmethods: [
        { methodId: "efectivo_origen", displayName: "Efectivo en Origen", description: "Pago en efectivo al momento del envío", requires_card: false, processing_fee: 0.00, active: true, created_at: new Date(), updated_at: new Date() },
        { methodId: "efectivo_destino", displayName: "Contra Entrega", description: "Pago en efectivo al momento de la entrega", requires_card: false, processing_fee: 0.00, active: true, created_at: new Date(), updated_at: new Date() },
        { methodId: "tarjeta_credito", displayName: "Tarjeta de Crédito", description: "Pago con tarjeta de crédito", requires_card: true, processing_fee: 2.50, active: true, created_at: new Date(), updated_at: new Date() },
        { methodId: "tarjeta_debito", displayName: "Tarjeta de Débito", description: "Pago con tarjeta de débito", requires_card: true, processing_fee: 1.50, active: true, created_at: new Date(), updated_at: new Date() },
        { methodId: "transferencia", displayName: "Transferencia Bancaria", description: "Pago por transferencia bancaria", requires_card: false, processing_fee: 5.00, active: true, created_at: new Date(), updated_at: new Date() }
    ],

    // Tipos de servicio
    servicetypes: [
        { serviceId: "estandar", displayName: "Envío Estándar", description: "Entrega en 3-5 días hábiles", delivery_days: 5, cost_multiplier: 1.0, active: true, created_at: new Date(), updated_at: new Date() },
        { serviceId: "express", displayName: "Envío Express", description: "Entrega en 1-2 días hábiles", delivery_days: 2, cost_multiplier: 1.5, active: true, created_at: new Date(), updated_at: new Date() },
        { serviceId: "mismo_dia", displayName: "Mismo Día", description: "Entrega el mismo día (solo área metropolitana)", delivery_days: 1, cost_multiplier: 2.0, active: true, created_at: new Date(), updated_at: new Date() }
    ]
};

/**
 * ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
 */
const INDEXES = {
    users: [
        { key: { email: 1 }, unique: true },
        { key: { role: 1, status: 1 } },
        { key: { department_id: 1 } }
    ],
    departments: [
        { key: { code: 1 }, unique: true },
        { key: { shipping_zone: 1 } },
        { key: { active: 1 } }
    ],
    municipalities: [
        { key: { department_id: 1 } },
        { key: { name: 1, department_id: 1 } }
    ],
    packagetypes: [
        { key: { typeId: 1 }, unique: true },
        { key: { active: 1 } }
    ],
    paymentmethods: [
        { key: { methodId: 1 }, unique: true },
        { key: { active: 1 } }
    ],
    servicetypes: [
        { key: { serviceId: 1 }, unique: true },
        { key: { active: 1 } }
    ],
    shipments: [
        { key: { tracking_number: 1 }, unique: true },
        { key: { user_id: 1 } },
        { key: { status: 1 } },
        { key: { created_at: -1 } },
        { key: { department_from_id: 1, department_to_id: 1 } }
    ]
};

/**
 * CLASE PRINCIPAL PARA INICIALIZACIÓN DE BD
 */
class DatabaseInitializer {
    constructor() {
        this.client = null;
        this.db = null;
    }

    /**
     * Conectar a MongoDB
     */
    async connect() {
        try {
            console.log(`📡 Conectando a MongoDB (${environment})...`);
            console.log(`🔗 URI: ${dbConfig.uri}`);
            console.log(`🗄️  Base de datos: ${dbConfig.dbName}`);
            
            this.client = new MongoClient(dbConfig.uri);
            await this.client.connect();
            this.db = this.client.db(dbConfig.dbName);
            
            console.log('✅ Conexión exitosa a MongoDB');
        } catch (error) {
            console.error('❌ Error al conectar a MongoDB:', error.message);
            throw error;
        }
    }

    /**
     * Crear esquemas de validación para todas las colecciones
     */
    async createSchemas() {
        console.log('\n📋 Creando esquemas de validación...');
        
        for (const [collectionName, schema] of Object.entries(SCHEMAS)) {
            try {
                // Verificar si la colección ya existe
                const collections = await this.db.listCollections({ name: collectionName }).toArray();
                
                if (collections.length > 0) {
                    console.log(`⚠️  Colección '${collectionName}' ya existe - actualizando validador`);
                    
                    // Actualizar el validador
                    await this.db.command({
                        collMod: collectionName,
                        validator: { $jsonSchema: schema }
                    });
                } else {
                    console.log(`🆕 Creando colección '${collectionName}'`);
                    
                    // Crear la colección con validador
                    await this.db.createCollection(collectionName, {
                        validator: { $jsonSchema: schema }
                    });
                }
                
                console.log(`✅ Esquema de '${collectionName}' configurado`);
            } catch (error) {
                console.error(`❌ Error al crear esquema de '${collectionName}':`, error.message);
                throw error;
            }
        }
    }

    /**
     * Crear índices para optimización
     */
    async createIndexes() {
        console.log('\n🔍 Creando índices de optimización...');
        
        for (const [collectionName, indexes] of Object.entries(INDEXES)) {
            try {
                const collection = this.db.collection(collectionName);
                
                for (const indexSpec of indexes) {
                    const indexName = Object.keys(indexSpec.key).join('_');
                    console.log(`📝 Creando índice '${indexName}' en '${collectionName}'`);
                    
                    await collection.createIndex(indexSpec.key, indexSpec);
                }
                
                console.log(`✅ Índices de '${collectionName}' creados`);
            } catch (error) {
                console.error(`❌ Error al crear índices de '${collectionName}':`, error.message);
                throw error;
            }
        }
    }

    /**
     * Insertar datos iniciales
     */
    async insertInitialData() {
        console.log('\n📊 Insertando datos iniciales...');
        
        for (const [collectionName, data] of Object.entries(INITIAL_DATA)) {
            try {
                const collection = this.db.collection(collectionName);
                
                // Verificar si ya existen datos
                const existingCount = await collection.countDocuments();
                
                if (existingCount > 0) {
                    console.log(`⚠️  La colección '${collectionName}' ya tiene ${existingCount} documentos - omitiendo inserción`);
                    continue;
                }
                
                console.log(`📥 Insertando ${data.length} registros en '${collectionName}'`);
                const result = await collection.insertMany(data);
                
                console.log(`✅ Insertados ${result.insertedCount} documentos en '${collectionName}'`);
            } catch (error) {
                console.error(`❌ Error al insertar datos en '${collectionName}':`, error.message);
                throw error;
            }
        }
    }

    /**
     * Verificar integridad de la base de datos
     */
    async verifyDatabase() {
        console.log('\n🔍 Verificando integridad de la base de datos...');
        
        const summary = {};
        
        for (const collectionName of Object.keys(SCHEMAS)) {
            try {
                const collection = this.db.collection(collectionName);
                const count = await collection.countDocuments();
                summary[collectionName] = count;
                
                console.log(`📊 ${collectionName}: ${count} documentos`);
            } catch (error) {
                console.error(`❌ Error al verificar '${collectionName}':`, error.message);
                summary[collectionName] = 'ERROR';
            }
        }
        
        console.log('\n📈 Resumen de la base de datos:');
        console.table(summary);
        
        return summary;
    }

    /**
     * Cerrar conexión
     */
    async close() {
        if (this.client) {
            await this.client.close();
            console.log('🔐 Conexión cerrada');
        }
    }

    /**
     * Inicialización completa
     */
    async initialize() {
        try {
            console.log('🚀 INICIANDO CONFIGURACIÓN DE BASE DE DATOS DSENVIOS\n');
            console.log('=' .repeat(60));
            
            await this.connect();
            await this.createSchemas();
            await this.createIndexes();
            await this.insertInitialData();
            await this.verifyDatabase();
            
            console.log('\n' + '=' .repeat(60));
            console.log('🎉 ¡BASE DE DATOS INICIALIZADA EXITOSAMENTE!');
            console.log('=' .repeat(60));
            
            return true;
        } catch (error) {
            console.error('\n💥 ERROR DURANTE LA INICIALIZACIÓN:', error.message);
            console.error('📋 Stack trace:', error.stack);
            return false;
        } finally {
            await this.close();
        }
    }
}

/**
 * FUNCIÓN PRINCIPAL DE EJECUCIÓN
 */
async function main() {
    const initializer = new DatabaseInitializer();
    const success = await initializer.initialize();
    
    if (success) {
        console.log('\n✅ Script completado exitosamente');
        process.exit(0);
    } else {
        console.log('\n❌ Script completado con errores');
        process.exit(1);
    }
}

// Exportar para uso en el servidor
module.exports = {
    DatabaseInitializer,
    CONFIG,
    SCHEMAS,
    INITIAL_DATA,
    INDEXES
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Error crítico:', error);
        process.exit(1);
    });
}