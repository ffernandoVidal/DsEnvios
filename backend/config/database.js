/**
 * CONFIGURADOR DE BASE DE DATOS PARA EL SERVIDOR
 * 
 * Este módulo se encarga de integrar la inicialización de BD
 * en el servidor principal de manera automática y estructurada
 */

const { DatabaseInitializer } = require('../initialize_database');

/**
 * Configuración de la base de datos para el servidor
 */
class DatabaseConfig {
    constructor() {
        this.initialized = false;
        this.client = null;
        this.db = null;
    }

    /**
     * Inicializar automáticamente la BD al arrancar el servidor
     */
    async autoInitialize() {
        console.log(' Verificando estado de la base de datos...');
        
        try {
            const initializer = new DatabaseInitializer();
            await initializer.connect();
            
            // Verificar si la BD ya está inicializada
            const collections = await initializer.db.listCollections().toArray();
            const hasRequiredCollections = ['departments', 'packagetypes', 'paymentmethods', 'servicetypes']
                .every(name => collections.some(col => col.name === name));
            
            if (!hasRequiredCollections) {
                console.log('  Base de datos no inicializada. Ejecutando inicialización automática...');
                await initializer.initialize();
            } else {
                console.log('Base de datos ya está inicializada');
                await initializer.close();
            }
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error en inicialización automática:', error.message);
            return false;
        }
    }

    /**
     * Obtener conexión a la base de datos
     */
    async getConnection() {
        const { MongoClient } = require('mongodb');
        const { CONFIG } = require('../initialize_database');
        
        const environment = process.env.NODE_ENV || 'development';
        const dbConfig = CONFIG[environment];
        
        if (!this.client) {
            this.client = new MongoClient(dbConfig.uri);
            await this.client.connect();
            this.db = this.client.db(dbConfig.dbName);
        }
        
        return { client: this.client, db: this.db };
    }

    /**
     * Cerrar conexión
     */
    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
    }

    /**
     * Verificar conectividad
     */
    async testConnection() {
        try {
            const { db } = await this.getConnection();
            await db.admin().ping();
            return true;
        } catch (error) {
            console.error(' Error de conectividad:', error.message);
            return false;
        }
    }

    /**
     * Obtener estadísticas de la BD
     */
    async getStats() {
        try {
            const { db } = await this.getConnection();
            
            const stats = {};
            const collections = ['users', 'departments', 'municipalities', 'packagetypes', 
                               'paymentmethods', 'servicetypes', 'shipments'];
            
            for (const collectionName of collections) {
                try {
                    const count = await db.collection(collectionName).countDocuments();
                    stats[collectionName] = count;
                } catch (error) {
                    stats[collectionName] = 'N/A';
                }
            }
            
            return stats;
        } catch (error) {
            console.error(' Error al obtener estadísticas:', error.message);
            return {};
        }
    }
}

// Singleton para uso global
const dbConfig = new DatabaseConfig();

module.exports = {
    DatabaseConfig,
    dbConfig
};