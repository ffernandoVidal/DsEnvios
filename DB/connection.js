/**
 *  CONFIGURACIÓN DE CONEXIÓN A MONGODB - enviosdb1
 * Sistema de Gestión de Envíos DsEnvios
 * 
 * Este archivo maneja todas las conexiones a la base de datos MongoDB
 * con configuraciones específicas para desarrollo y producción.
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Configuración de base de datos
const DB_CONFIG = {
    // Configuración para desarrollo
    development: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/',
        name: process.env.DB_NAME || 'enviosdb1',
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Usar IPv4
            bufferMaxEntries: 0,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    
    // Configuración para producción
    production: {
        uri: process.env.MONGO_URI_PROD || process.env.MONGO_URI || 'mongodb://localhost:27017/',
        name: process.env.DB_NAME_PROD || process.env.DB_NAME || 'enviosdb1',
        options: {
            maxPoolSize: 50,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            family: 4,
            bufferMaxEntries: 0,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: process.env.MONGO_SSL === 'true',
            authSource: process.env.MONGO_AUTH_SOURCE || 'admin'
        }
    },
    
    // Configuración para testing
    test: {
        uri: process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/',
        name: process.env.DB_NAME_TEST || 'enviosdb1_test',
        options: {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 30000,
            family: 4,
            bufferMaxEntries: 0,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }
};

// Variables globales de conexión
let mongoClient = null;
let database = null;
const environment = process.env.NODE_ENV || 'development';

/**
 *  Conectar a MongoDB
 */
async function connectToDatabase() {
    try {
        const config = DB_CONFIG[environment];
        
        console.log(` Conectando a MongoDB (${environment})...`);
        console.log(` Base de datos: ${config.name}`);
        
        mongoClient = new MongoClient(config.uri, config.options);
        await mongoClient.connect();
        
        // Verificar conexión
        await mongoClient.db("admin").command({ ping: 1 });
        
        database = mongoClient.db(config.name);
        
        console.log(` MongoDB conectado exitosamente`);
        console.log(` Base de datos activa: ${config.name}`);
        
        // Inicializar colecciones si es necesario
        await initializeDatabase();
        
        return database;
        
    } catch (error) {
        console.error(' Error conectando a MongoDB:', error.message);
        console.error(' Verificar que MongoDB esté ejecutándose');
        throw error;
    }
}

/**
 *  Inicializar base de datos con colecciones básicas
 */
async function initializeDatabase() {
    try {
        console.log(' Inicializando estructura de base de datos...');
        
        // Lista de colecciones necesarias
        const requiredCollections = [
            'users',
            'shipments', 
            'quotations',
            'tracking',
            'orders',
            'departments',
            'municipalities', 
            'villages',
            'address_cache',
            'package_types',
            'pricing_config',
            'shipping_rates',
            'service_types',
            'payment_methods',
            'transactions',
            'notifications',
            'system_logs',
            'distance_cache',
            'frequent_addresses',
            'customer_preferences',
            'delivery_zones',
            'driver_routes',
            'inventory_tracking'
        ];
        
        // Verificar colecciones existentes
        const existingCollections = await database.listCollections().toArray();
        const existingNames = existingCollections.map(col => col.name);
        
        // Crear colecciones faltantes
        for (const collectionName of requiredCollections) {
            if (!existingNames.includes(collectionName)) {
                await database.createCollection(collectionName);
                console.log(` Colección creada: ${collectionName}`);
            }
        }
        
        console.log(' Estructura de base de datos inicializada');
        
    } catch (error) {
        console.error(' Error inicializando base de datos:', error);
        throw error;
    }
}

/**
 *  Cerrar conexión a MongoDB
 */
async function closeConnection() {
    try {
        if (mongoClient) {
            await mongoClient.close();
            console.log(' Conexión a MongoDB cerrada');
            mongoClient = null;
            database = null;
        }
    } catch (error) {
        console.error(' Error cerrando conexión:', error);
    }
}

/**
 *  Obtener instancia de la base de datos
 */
function getDatabase() {
    if (!database) {
        throw new Error('Base de datos no conectada. Ejecute connectToDatabase() primero.');
    }
    return database;
}

/**
 *  Obtener cliente de MongoDB
 */
function getClient() {
    if (!mongoClient) {
        throw new Error('Cliente MongoDB no conectado. Ejecute connectToDatabase() primero.');
    }
    return mongoClient;
}

/**
 *  Verificar estado de la conexión
 */
async function checkHealth() {
    try {
        if (!database) {
            return {
                status: 'disconnected',
                message: 'Base de datos no conectada'
            };
        }
        
        await mongoClient.db("admin").command({ ping: 1 });
        
        const stats = await database.stats();
        
        return {
            status: 'connected',
            database: database.databaseName,
            environment,
            collections: stats.collections,
            dataSize: stats.dataSize,
            indexSize: stats.indexSize,
            totalSize: stats.storageSize,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        return {
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 🧹 Utilidades para transacciones
 */
async function withTransaction(callback) {
    const session = mongoClient.startSession();
    
    try {
        await session.withTransaction(async () => {
            return await callback(session);
        });
    } finally {
        await session.endSession();
    }
}

/**
 *  Crear índices optimizados
 */
async function createOptimizedIndexes() {
    try {
        console.log(' Creando índices optimizados...');
        
        // Índices para colección users
        await database.collection('users').createIndex({ username: 1 }, { unique: true });
        await database.collection('users').createIndex({ email: 1 }, { unique: true });
        await database.collection('users').createIndex({ role: 1 });
        
        // Índices para colección shipments
        await database.collection('shipments').createIndex({ tracking_number: 1 }, { unique: true });
        await database.collection('shipments').createIndex({ sender_id: 1 });
        await database.collection('shipments').createIndex({ status: 1 });
        await database.collection('shipments').createIndex({ created_at: -1 });
        await database.collection('shipments').createIndex({ 
            "origin.department": 1, 
            "destination.department": 1 
        });
        
        // Índices para colección tracking
        await database.collection('tracking').createIndex({ shipment_id: 1 });
        await database.collection('tracking').createIndex({ tracking_number: 1 });
        await database.collection('tracking').createIndex({ timestamp: -1 });
        
        // Índices para colección quotations
        await database.collection('quotations').createIndex({ user_id: 1 });
        await database.collection('quotations').createIndex({ created_at: -1 });
        await database.collection('quotations').createIndex({ status: 1 });
        
        // Índices para ubicaciones
        await database.collection('departments').createIndex({ name: 1 }, { unique: true });
        await database.collection('municipalities').createIndex({ 
            department: 1, 
            name: 1 
        }, { unique: true });
        await database.collection('villages').createIndex({ 
            department: 1, 
            municipality: 1, 
            name: 1 
        }, { unique: true });
        
        // Índices para cache de direcciones
        await database.collection('address_cache').createIndex({ 
            origin: 1, 
            destination: 1 
        }, { unique: true });
        await database.collection('address_cache').createIndex({ created_at: 1 }, { 
            expireAfterSeconds: 86400 // 24 horas
        });
        
        // Índices para transacciones
        await database.collection('transactions').createIndex({ shipment_id: 1 });
        await database.collection('transactions').createIndex({ payment_method: 1 });
        await database.collection('transactions').createIndex({ status: 1 });
        await database.collection('transactions').createIndex({ created_at: -1 });
        
        console.log(' Índices optimizados creados exitosamente');
        
    } catch (error) {
        console.error(' Error creando índices:', error);
        throw error;
    }
}

// Manejo de eventos de conexión
process.on('SIGINT', async () => {
    console.log('\n Cerrando aplicación...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n Cerrando aplicación...');
    await closeConnection();
    process.exit(0);
});

// Exportar funciones y configuraciones
module.exports = {
    connectToDatabase,
    closeConnection,
    getDatabase,
    getClient,
    checkHealth,
    withTransaction,
    createOptimizedIndexes,
    DB_CONFIG,
    ObjectId
};