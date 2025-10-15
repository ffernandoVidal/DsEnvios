// Backend con Integración Completa de Forza Ecommerce Engine
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3005;

// Configuración de MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'enviosdb';

// Configuración de Forza Ecommerce Engine
const FORZA_CONFIG = {
    baseUrl: process.env.FORZA_API_URL || 'https://api.forza.com/v1',
    apiKey: process.env.FORZA_API_KEY || '',
    clientId: process.env.FORZA_CLIENT_ID || '',
    enabled: process.env.FORZA_ENABLED === 'true',
    timeout: 30000
};

let db = null;
let mongoClient = null;

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:4200'],
    credentials: true
}));
app.use(express.json());

console.log('🚀 Iniciando servidor con integración Forza Ecommerce Engine...');
console.log('🔧 Forza API habilitada:', FORZA_CONFIG.enabled);

// ============================================
// CONEXIÓN A MONGODB
// ============================================
async function connectToMongoDB() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
        await mongoClient.db("admin").command({ ping: 1 });
        
        db = mongoClient.db(DB_NAME);
        console.log('✅ MongoDB conectado exitosamente:', DB_NAME);
        
        await createDefaultUsers();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        return false;
    }
}

// Crear usuarios por defecto
async function createDefaultUsers() {
    try {
        const users = db.collection('users');
        const existingUsers = await users.countDocuments();
        
        if (existingUsers === 0) {
            const defaultUsers = [
                {
                    username: 'admin',
                    password: await bcrypt.hash('admin123', 10),
                    name: 'Administrador',
                    role: 'admin',
                    email: 'admin@enviosds.com',
                    createdAt: new Date()
                },
                {
                    username: 'usuario1',
                    password: await bcrypt.hash('123456', 10),
                    name: 'Usuario Prueba',
                    role: 'user',
                    email: 'usuario1@enviosds.com',
                    createdAt: new Date()
                },
                {
                    username: 'operador',
                    password: await bcrypt.hash('operador123', 10),
                    name: 'Operador Envíos',
                    role: 'operator',
                    email: 'operador@enviosds.com',
                    createdAt: new Date()
                }
            ];
            
            await users.insertMany(defaultUsers);
            console.log('👥 Usuarios por defecto creados');
        }
    } catch (error) {
        console.error('❌ Error creando usuarios:', error.message);
    }
}

// ============================================
// FUNCIONES HELPER PARA FORZA API
// ============================================

// Headers para Forza API
function getForzaHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FORZA_CONFIG.apiKey}`,
        'X-Client-ID': FORZA_CONFIG.clientId,
        'User-Agent': 'EnviosDS/1.0'
    };
}

// Llamada genérica a Forza API
async function callForzaAPI(endpoint, method = 'GET', data = null) {
    try {
        if (!FORZA_CONFIG.enabled) {
            throw new Error('Forza API está deshabilitada');
        }

        if (!FORZA_CONFIG.apiKey || !FORZA_CONFIG.clientId) {
            throw new Error('Credenciales de Forza API no configuradas');
        }

        const config = {
            method,
            url: `${FORZA_CONFIG.baseUrl}${endpoint}`,
            headers: getForzaHeaders(),
            timeout: FORZA_CONFIG.timeout
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }

        console.log(`🔗 Llamando Forza API: ${method} ${config.url}`);
        const response = await axios(config);
        
        console.log('✅ Respuesta de Forza API recibida');
        return {
            success: true,
            data: response.data,
            status: response.status
        };
    } catch (error) {
        console.error('❌ Error en Forza API:', error.message);
        return {
            success: false,
            error: error.message,
            status: error.response?.status || 500
        };
    }
}

// ============================================
// ENDPOINTS BÁSICOS
// ============================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'EnviosDS Backend',
        forza: FORZA_CONFIG.enabled ? 'Habilitada' : 'Deshabilitada',
        database: db ? 'Conectada' : 'Desconectada'
    });
});

// Estado de la base de datos
app.get('/api/db-status', (req, res) => {
    res.json({
        connected: !!db,
        database: DB_NAME,
        uri: MONGO_URI,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        const user = await db.collection('users').findOne({ username });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }

        const userResponse = {
            id: user._id,
            username: user.username,
            name: user.name,
            role: user.role,
            email: user.email
        };

        res.json({
            success: true,
            message: 'Login exitoso',
            user: userResponse
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ============================================
// DATOS DE UBICACIONES DE GUATEMALA
// ============================================

// Ubicaciones de Guatemala (municipios, departamentos, aldeas)
// Estructura completa de ubicaciones de Guatemala organizadas por departamentos
const guatemalaLocations = {
    "Guatemala": {
        departamento: "Guatemala",
        municipios: {
            "Guatemala": ["Zona 1", "Zona 2", "Zona 3", "Zona 4", "Zona 5", "Zona 6", "Zona 7", "Zona 8", "Zona 9", "Zona 10", "Zona 11", "Zona 12", "Zona 13", "Zona 14", "Zona 15", "Zona 16", "Zona 17", "Zona 18", "Zona 19", "Zona 21"],
            "Mixco": ["Zona 1 de Mixco", "Zona 3 de Mixco", "Zona 4 de Mixco", "Zona 6 de Mixco", "Zona 7 de Mixco", "Zona 8 de Mixco", "Zona 11 de Mixco"],
            "Villa Nueva": ["Villa Nueva Centro", "Villa Lobos", "Bárcenas", "El Frutal", "San Antonio"],
            "Petapa": ["Petapa Centro", "Villa Hermosa", "San Francisco"],
            "San José Pinula": ["San José Pinula Centro", "El Sauce", "Mataquescuintla"],
            "Villa Canales": ["Villa Canales Centro", "Boca del Monte", "San Antonio Las Flores"],
            "Amatitlán": ["Amatitlán Centro", "El Cerrito", "Villa Canales"],
            "Chinautla": ["Chinautla Centro", "Santa Rosita", "El Búcaro"],
            "Fraijanes": ["Fraijanes Centro", "El Tablón", "Los Encuentros"],
            "Palencia": ["Palencia Centro", "San Antonio La Paz", "El Rosario"],
            "San Juan Sacatepéquez": ["San Juan Sacatepéquez Centro", "Cruz Blanca", "Comunidad de Ruiz"],
            "San Pedro Sacatepéquez": ["San Pedro Sacatepéquez Centro", "El Tejar", "San José"],
            "San Pedro Ayampuc": ["San Pedro Ayampuc Centro", "Las Flores", "El Rosario"],
            "San Raymundo": ["San Raymundo Centro", "El Jute", "Chuarrancho"],
            "Chuarrancho": ["Chuarrancho Centro", "El Tablón", "Las Anonas"],
            "Santa Catarina Pinula": ["Santa Catarina Pinula Centro", "El Sauce", "Villa Hermosa"],
            "San José del Golfo": ["San José del Golfo Centro", "El Carmen", "Las Cañas"]
        }
    },
    "Sacatepéquez": {
        departamento: "Sacatepéquez",
        municipios: {
            "Antigua Guatemala": ["Antigua Guatemala Centro", "San Bartolomé Becerra", "San Cristóbal El Alto", "San Felipe de Jesús", "Santa Ana", "Santa Inés del Monte Pulciano"],
            "Jocotenango": ["Jocotenango Centro", "San Lorenzo El Tejar", "Santa Lucía Milpas Altas"],
            "Pastores": ["Pastores Centro", "El Hato", "Los Tarros"],
            "Sumpango": ["Sumpango Centro", "Xenacoj", "El Tablón"],
            "Santo Domingo Xenacoj": ["Santo Domingo Xenacoj Centro", "San Gaspar", "Choacorral"],
            "Santiago Sacatepéquez": ["Santiago Sacatepéquez Centro", "Chimaltenango", "San Lucas"],
            "San Bartolomé Milpas Altas": ["San Bartolomé Centro", "Las Crucitas", "Los Aposentos"],
            "San Lucas Sacatepéquez": ["San Lucas Centro", "El Manzanillo", "Zorzoya"],
            "Santa Lucía Milpas Altas": ["Santa Lucía Centro", "El Hato", "La Embaulada"],
            "Magdalena Milpas Altas": ["Magdalena Centro", "El Hato", "Los Aposentos"],
            "Santa María de Jesús": ["Santa María de Jesús Centro", "San Miguel Escobar", "San Juan del Obispo"],
            "Ciudad Vieja": ["Ciudad Vieja Centro", "San Miguel Escobar", "Choacorral"],
            "San Miguel Dueñas": ["San Miguel Dueñas Centro", "Santa Catarina Bobadilla", "El Hato"],
            "Alotenango": ["Alotenango Centro", "San Miguel Pochuta", "El Rodeo"],
            "San Antonio Aguas Calientes": ["San Antonio Centro", "Santa Catarina Bobadilla", "San Miguel Dueñas"],
            "Santa Catarina Barahona": ["Santa Catarina Barahona Centro", "El Hato", "Los Aposentos"]
        }
    },
    "Chimaltenango": {
        departamento: "Chimaltenango",
        municipios: {
            "Chimaltenango": ["Chimaltenango Centro", "San José Poaquil", "Balanyá"],
            "San José Poaquil": ["San José Poaquil Centro", "Simajhuleu", "Palín"],
            "San Martín Jilotepeque": ["San Martín Centro", "Jilotepeque", "Comalapa"],
            "Comalapa": ["Comalapa Centro", "San José Poaquil", "Balanyá"],
            "Santa Apolonia": ["Santa Apolonia Centro", "Tecpán", "Patzún"],
            "Tecpán Guatemala": ["Tecpán Centro", "Iximché", "Patzún"],
            "Patzún": ["Patzún Centro", "Comalapa", "Santa Apolonia"],
            "Pochuta": ["Pochuta Centro", "San Pedro Yepocapa", "Acatenango"],
            "Patzicía": ["Patzicía Centro", "Zaragoza", "Santa Cruz Balanyá"],
            "Santa Cruz Balanyá": ["Santa Cruz Balanyá Centro", "Patzicía", "El Tejar"],
            "Acatenango": ["Acatenango Centro", "La Soledad", "Yepocapa"],
            "San Pedro Yepocapa": ["San Pedro Yepocapa Centro", "Pochuta", "Acatenango"],
            "San Andrés Itzapa": ["San Andrés Itzapa Centro", "Parramos", "Zaragoza"],
            "Parramos": ["Parramos Centro", "San Andrés Itzapa", "Zaragoza"],
            "Zaragoza": ["Zaragoza Centro", "Parramos", "El Tejar"],
            "El Tejar": ["El Tejar Centro", "Zaragoza", "Parramos"]
        }
    },
    "Escuintla": {
        departamento: "Escuintla",
        municipios: {
            "Escuintla": ["Escuintla Centro", "Concepción", "El Rosario"],
            "Santa Lucía Cotzumalguapa": ["Cotzumalguapa Centro", "La Democracia", "Siquinalá"],
            "La Democracia": ["La Democracia Centro", "Sipacate", "Buena Vista"],
            "Siquinalá": ["Siquinalá Centro", "Masagua", "Puerto de San José"],
            "Masagua": ["Masagua Centro", "Tiquisate", "La Gomera"],
            "Tiquisate": ["Tiquisate Centro", "Nueva Concepción", "Cuyotenango"],
            "La Gomera": ["La Gomera Centro", "Guanagazapa", "Sipacate"],
            "Guanagazapa": ["Guanagazapa Centro", "Iztapa", "Puerto Quetzal"],
            "San José": ["Puerto San José", "Chulamar", "Monterrico"],
            "Iztapa": ["Iztapa Centro", "Puerto Quetzal", "Monterrico"],
            "Palín": ["Palín Centro", "San Vicente Pacaya", "Escuintla"],
            "San Vicente Pacaya": ["San Vicente Pacaya Centro", "Palín", "Amatitlán"],
            "Nueva Concepción": ["Nueva Concepción Centro", "Tiquisate", "Cuyotenango"],
            "Sipacate": ["Sipacate Centro", "La Democracia", "Monterrico"]
        }
    }
};

// Función para obtener todas las ubicaciones en formato plano
function getAllLocationsFlat() {
    const locations = [];
    
    Object.keys(guatemalaLocations).forEach(departamento => {
        const dept = guatemalaLocations[departamento];
        
        // Agregar el departamento
        locations.push(departamento);
        
        // Agregar municipios
        Object.keys(dept.municipios).forEach(municipio => {
            locations.push(`${municipio}, ${departamento}`);
            
            // Agregar aldeas/localidades
            dept.municipios[municipio].forEach(aldea => {
                locations.push(`${aldea}, ${municipio}, ${departamento}`);
            });
        });
    });
    
    return locations.sort();
}

// Endpoint para obtener ubicaciones de Guatemala (formato completo)
app.get('/api/guatemala/locations', (req, res) => {
    try {
        res.json({
            success: true,
            locations: getAllLocationsFlat(),
            structured: guatemalaLocations,
            count: getAllLocationsFlat().length
        });
    } catch (error) {
        console.error('❌ Error obteniendo ubicaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo ubicaciones'
        });
    }
});

// Endpoint para buscar ubicaciones por departamento
app.get('/api/guatemala/locations/:departamento', (req, res) => {
    try {
        const { departamento } = req.params;
        const dept = guatemalaLocations[departamento];
        
        if (!dept) {
            return res.status(404).json({
                success: false,
                message: 'Departamento no encontrado'
            });
        }
        
        const locations = [];
        Object.keys(dept.municipios).forEach(municipio => {
            locations.push(`${municipio}, ${departamento}`);
            dept.municipios[municipio].forEach(aldea => {
                locations.push(`${aldea}, ${municipio}, ${departamento}`);
            });
        });
        
        res.json({
            success: true,
            departamento,
            locations: locations.sort(),
            municipios: Object.keys(dept.municipios),
            count: locations.length
        });
    } catch (error) {
        console.error('❌ Error obteniendo ubicaciones por departamento:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo ubicaciones'
        });
    }
});

// Endpoint para obtener solo departamentos
app.get('/api/guatemala/departamentos', (req, res) => {
    try {
        const departamentos = Object.keys(guatemalaLocations);
        res.json({
            success: true,
            departamentos,
            count: departamentos.length
        });
    } catch (error) {
        console.error('❌ Error obteniendo departamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo departamentos'
        });
    }
});

// Endpoint para buscar ubicaciones con filtros
app.get('/api/guatemala/search', (req, res) => {
    try {
        const { q, type } = req.query; // q = query, type = departamento|municipio|aldea
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Parámetro de búsqueda requerido'
            });
        }
        
        const allLocations = getAllLocationsFlat();
        const searchTerm = q.toLowerCase();
        
        let filteredLocations = allLocations.filter(location => 
            location.toLowerCase().includes(searchTerm)
        );
        
        // Filtrar por tipo si se especifica
        if (type) {
            switch (type) {
                case 'departamento':
                    filteredLocations = filteredLocations.filter(loc => 
                        !loc.includes(',') // Solo departamentos
                    );
                    break;
                case 'municipio':
                    filteredLocations = filteredLocations.filter(loc => 
                        (loc.match(/,/g) || []).length === 1 // municipio, departamento
                    );
                    break;
                case 'aldea':
                    filteredLocations = filteredLocations.filter(loc => 
                        (loc.match(/,/g) || []).length === 2 // aldea, municipio, departamento
                    );
                    break;
            }
        }
        
        res.json({
            success: true,
            query: q,
            type: type || 'all',
            locations: filteredLocations.slice(0, 50), // Limitar a 50 resultados
            count: filteredLocations.length
        });
    } catch (error) {
        console.error('❌ Error en búsqueda de ubicaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error en búsqueda'
        });
    }
});

// ============================================
// ENDPOINTS DE FORZA ECOMMERCE ENGINE
// ============================================

// 1. Verificar estado de Forza API
app.get('/api/forza/status', async (req, res) => {
    try {
        if (!FORZA_CONFIG.enabled) {
            return res.json({
                enabled: false,
                configured: false,
                message: 'Forza API está deshabilitada'
            });
        }

        const result = await callForzaAPI('/health');
        
        res.json({
            enabled: FORZA_CONFIG.enabled,
            configured: !!(FORZA_CONFIG.apiKey && FORZA_CONFIG.clientId),
            api_status: result.success ? 'Online' : 'Offline',
            last_check: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verificando estado de Forza API'
        });
    }
});

// 2. Obtener servicios de envío disponibles
app.get('/api/forza/services', async (req, res) => {
    try {
        const result = await callForzaAPI('/shipping/services');
        
        if (result.success) {
            res.json({
                success: true,
                services: result.data
            });
        } else {
            // Fallback con servicios locales
            res.json({
                success: true,
                services: [
                    { id: 'standard', name: 'Envío Estándar', delivery_time: '3-5 días' },
                    { id: 'express', name: 'Envío Express', delivery_time: '1-2 días' },
                    { id: 'overnight', name: 'Envío Nocturno', delivery_time: '24 horas' }
                ],
                source: 'local'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error obteniendo servicios de envío'
        });
    }
});

// 3. Cotizar envío con Forza
app.post('/api/forza/quote', async (req, res) => {
    try {
        const { origin, destination, package_details, service_type } = req.body;

        // Validaciones básicas
        if (!origin || !destination || !package_details) {
            return res.status(400).json({
                success: false,
                message: 'Origen, destino y detalles del paquete son requeridos'
            });
        }

        // Preparar datos para Forza API
        const forzaData = {
            shipment: {
                origin: {
                    address: origin.address,
                    city: origin.city,
                    state: origin.state,
                    postal_code: origin.postal_code,
                    country: origin.country || 'GT'
                },
                destination: {
                    address: destination.address,
                    city: destination.city,
                    state: destination.state,
                    postal_code: destination.postal_code,
                    country: destination.country || 'GT'
                },
                package: {
                    weight: package_details.weight,
                    dimensions: {
                        length: package_details.length,
                        width: package_details.width,
                        height: package_details.height
                    },
                    declared_value: package_details.declared_value || 0
                },
                service_type: service_type || 'standard'
            }
        };

        console.log('📦 Cotizando con Forza API:', forzaData);
        const result = await callForzaAPI('/shipping/quote', 'POST', forzaData);

        if (result.success) {
            // Guardar cotización en base de datos
            if (db) {
                await db.collection('quotes').insertOne({
                    ...forzaData.shipment,
                    forza_response: result.data,
                    created_at: new Date(),
                    source: 'forza'
                });
            }

            res.json({
                success: true,
                quote: result.data,
                source: 'forza'
            });
        } else {
            // Fallback a cotización local
            const localQuote = await generateLocalQuote(origin, destination, package_details);
            res.json(localQuote);
        }

    } catch (error) {
        console.error('❌ Error en cotización Forza:', error);
        
        // Fallback a cotización local
        try {
            const localQuote = await generateLocalQuote(req.body.origin, req.body.destination, req.body.package_details);
            res.json(localQuote);
        } catch (fallbackError) {
            res.status(500).json({
                success: false,
                message: 'Error en cotización'
            });
        }
    }
});

// 4. Crear envío con Forza
app.post('/api/forza/shipment', async (req, res) => {
    try {
        const shipmentData = req.body;
        
        const result = await callForzaAPI('/shipments', 'POST', shipmentData);
        
        if (result.success) {
            // Guardar envío en base de datos
            if (db) {
                await db.collection('shipments').insertOne({
                    ...shipmentData,
                    forza_response: result.data,
                    tracking_number: result.data.tracking_number,
                    status: 'created',
                    created_at: new Date(),
                    source: 'forza'
                });
            }

            res.json({
                success: true,
                shipment: result.data,
                tracking_number: result.data.tracking_number
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Error creando envío con Forza',
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno creando envío'
        });
    }
});

// 3. Rastrear envío
app.post('/api/forza/tracking', async (req, res) => {
    try {
        const { trackingNumber } = req.body;
        
        if (!trackingNumber) {
            return res.status(400).json({
                success: false,
                message: 'Número de tracking requerido'
            });
        }

        let trackingResult;

        if (FORZA_CONFIG.enabled) {
            try {
                trackingResult = await callForzaAPI(`/tracking/${trackingNumber}`, 'GET');
            } catch (error) {
                console.log('⚠️ Error con Forza API, usando fallback local:', error.message);
                trackingResult = generateLocalTracking(trackingNumber);
            }
        } else {
            trackingResult = generateLocalTracking(trackingNumber);
        }

        // Guardar en base de datos si está disponible
        if (db) {
            await db.collection('tracking_queries').insertOne({
                trackingNumber,
                result: trackingResult,
                source: FORZA_CONFIG.enabled ? 'forza' : 'local',
                queriedAt: new Date()
            });
        }

        res.json({
            success: true,
            tracking: trackingResult,
            source: FORZA_CONFIG.enabled ? 'forza' : 'local'
        });

    } catch (error) {
        console.error('❌ Error en tracking:', error);
        res.status(500).json({
            success: false,
            message: 'Error consultando tracking'
        });
    }
});

// Mantener endpoint GET por compatibilidad
app.get('/api/forza/tracking/:trackingNumber', async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        
        const result = await callForzaAPI(`/tracking/${trackingNumber}`);
        
        if (result.success) {
            res.json({
                success: true,
                tracking: result.data
            });
        } else {
            // Buscar en base de datos local
            if (db) {
                const shipment = await db.collection('shipments').findOne({
                    tracking_number: trackingNumber
                });
                
                if (shipment) {
                    res.json({
                        success: true,
                        tracking: {
                            tracking_number: trackingNumber,
                            status: shipment.status || 'in_transit',
                            events: shipment.events || [],
                            estimated_delivery: shipment.estimated_delivery
                        },
                        source: 'local'
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'Número de rastreo no encontrado'
                    });
                }
            }
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rastreando envío'
        });
    }
});

// ============================================
// FUNCIONES DE FALLBACK LOCALES
// ============================================

async function generateLocalQuote(origin, destination, packageDetails) {
    // Algoritmo simple de cotización local
    const baseRate = 15.00; // Q15 base
    const weightRate = packageDetails.weight * 2.50; // Q2.50 por kg
    const distanceRate = 5.00; // Q5 estimado por distancia
    const valueRate = (packageDetails.declared_value || 0) * 0.01; // 1% del valor declarado
    
    const total = baseRate + weightRate + distanceRate + valueRate;
    
    const quote = {
        success: true,
        quote: {
            total_cost: total.toFixed(2),
            currency: 'GTQ',
            estimated_delivery: '3-5 días laborales',
            services: [
                {
                    service_id: 'standard',
                    name: 'Envío Estándar',
                    cost: total.toFixed(2),
                    delivery_time: '3-5 días'
                },
                {
                    service_id: 'express',
                    name: 'Envío Express',
                    cost: (total * 1.5).toFixed(2),
                    delivery_time: '1-2 días'
                }
            ]
        },
        source: 'local'
    };

    // Guardar cotización local en DB
    if (db) {
        await db.collection('quotes').insertOne({
            origin,
            destination,
            package_details: packageDetails,
            quote: quote.quote,
            created_at: new Date(),
            source: 'local'
        });
    }

    return quote;
}

// ============================================
// ENDPOINT DE COTIZACIÓN LEGACY (COMPATIBILIDAD)
// ============================================

app.post('/api/cotizar', async (req, res) => {
    try {
        const { origen, destino, peso, alto, ancho, largo, valor_declarado } = req.body;

        // Convertir formato legacy a formato Forza
        const origin = { city: origen, country: 'GT' };
        const destination = { city: destino, country: 'GT' };
        const package_details = {
            weight: peso,
            length: largo,
            width: ancho,
            height: alto,
            declared_value: valor_declarado
        };

        const quote = await generateLocalQuote(origin, destination, package_details);
        res.json(quote);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generando cotización'
        });
    }
});

// ============================================
// ENDPOINTS DE GESTIÓN
// ============================================

// Listar envíos con POST (permite filtros)
app.post('/api/shipments', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Base de datos no disponible'
            });
        }

        // Obtener filtros del body (opcional)
        const { limit = 50, status, dateFrom, dateTo } = req.body || {};
        
        let query = {};
        if (status) query.status = status;
        if (dateFrom || dateTo) {
            query.created_at = {};
            if (dateFrom) query.created_at.$gte = new Date(dateFrom);
            if (dateTo) query.created_at.$lte = new Date(dateTo);
        }

        const shipments = await db.collection('shipments')
            .find(query)
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .toArray();

        res.json({
            success: true,
            shipments,
            count: shipments.length
        });

    } catch (error) {
        console.error('❌ Error obteniendo envíos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo envíos'
        });
    }
});

// Listar envíos (GET - compatibilidad)
app.get('/api/shipments', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Base de datos no disponible'
            });
        }

        const shipments = await db.collection('shipments')
            .find({})
            .sort({ created_at: -1 })
            .limit(50)
            .toArray();

        res.json({
            success: true,
            shipments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error obteniendo envíos'
        });
    }
});

// Listar cotizaciones con POST (permite filtros)
app.post('/api/quotes', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Base de datos no disponible'
            });
        }

        // Obtener filtros del body (opcional)
        const { limit = 50, source, dateFrom, dateTo } = req.body || {};
        
        let query = {};
        if (source) query.source = source;
        if (dateFrom || dateTo) {
            query.created_at = {};
            if (dateFrom) query.created_at.$gte = new Date(dateFrom);
            if (dateTo) query.created_at.$lte = new Date(dateTo);
        }

        const quotes = await db.collection('quotes')
            .find(query)
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .toArray();

        res.json({
            success: true,
            quotes,
            count: quotes.length
        });

    } catch (error) {
        console.error('❌ Error obteniendo cotizaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo cotizaciones'
        });
    }
});

// Listar cotizaciones (GET - compatibilidad)
app.get('/api/quotes', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Base de datos no disponible'
            });
        }

        const quotes = await db.collection('quotes')
            .find({})
            .sort({ created_at: -1 })
            .limit(50)
            .toArray();

        res.json({
            success: true,
            quotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error obteniendo cotizaciones'
        });
    }
});

// ============================================
// ENDPOINTS PARA GESTIÓN DE ENVÍOS
// ============================================

// Obtener historial de envíos
app.get('/api/shipments/history', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ success: false, message: 'Base de datos no conectada' });
        }

        const shipments = await db.collection('shipments')
            .find({})
            .sort({ created_at: -1 })
            .limit(50)
            .toArray();

        const formattedShipments = shipments.map(shipment => ({
            id: shipment._id,
            recipient_name: shipment.recipient_name,
            recipient_email: shipment.recipient_email,
            recipient_phone: shipment.recipient_phone,
            contact_name: shipment.contact_name,
            department: shipment.department,
            municipality: shipment.municipality,
            village: shipment.village,
            exact_address: shipment.exact_address,
            address_summary: `${shipment.municipality}, ${shipment.department}`,
            created_at: shipment.created_at,
            tracking_number: shipment.tracking_number
        }));

        res.json({
            success: true,
            shipments: formattedShipments
        });

    } catch (error) {
        console.error('Error obteniendo historial de envíos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Guardar datos del destinatario
app.post('/api/shipments/save-recipient', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ success: false, message: 'Base de datos no conectada' });
        }

        const recipientData = {
            ...req.body,
            created_at: new Date(),
            type: 'recipient_data'
        };

        const result = await db.collection('recipients').insertOne(recipientData);

        res.json({
            success: true,
            message: 'Datos del destinatario guardados correctamente',
            id: result.insertedId
        });

    } catch (error) {
        console.error('Error guardando datos del destinatario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Crear envío completo
app.post('/api/shipments/create', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ success: false, message: 'Base de datos no conectada' });
        }

        // Generar número de seguimiento único
        const trackingNumber = `DS${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        const shipmentData = {
            ...req.body,
            tracking_number: trackingNumber,
            status: 'created',
            created_at: new Date(),
            updated_at: new Date()
        };

        // Insertar en base de datos
        const result = await db.collection('shipments').insertOne(shipmentData);

        // Crear registro de seguimiento
        const trackingData = {
            shipment_id: result.insertedId,
            tracking_number: trackingNumber,
            status: 'created',
            events: [
                {
                    date: new Date(),
                    description: 'Envío creado',
                    location: `${shipmentData.municipality}, ${shipmentData.department}`
                }
            ],
            created_at: new Date()
        };

        await db.collection('tracking').insertOne(trackingData);

        res.json({
            success: true,
            message: 'Envío creado exitosamente',
            guide: {
                id: result.insertedId,
                tracking_number: trackingNumber,
                status: 'created'
            }
        });

    } catch (error) {
        console.error('Error creando envío:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Descargar guía de envío
app.get('/api/shipments/download-guide/:id', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ success: false, message: 'Base de datos no conectada' });
        }

        const { ObjectId } = require('mongodb');
        const shipmentId = new ObjectId(req.params.id);

        const shipment = await db.collection('shipments').findOne({ _id: shipmentId });

        if (!shipment) {
            return res.status(404).json({ success: false, message: 'Envío no encontrado' });
        }

        // Generar contenido PDF simple (en texto)
        const guideContent = `
=== GUÍA DE ENVÍO ===
Número de Seguimiento: ${shipment.tracking_number}
Fecha: ${shipment.created_at.toLocaleDateString()}

DESTINATARIO:
Nombre: ${shipment.recipient_name}
Email: ${shipment.recipient_email || 'No proporcionado'}
Teléfono: ${shipment.recipient_phone}
Contacto: ${shipment.contact_name || 'N/A'}

DIRECCIÓN:
${shipment.exact_address}
${shipment.village ? shipment.village + ', ' : ''}${shipment.municipality}
${shipment.department}, Guatemala

PAQUETE:
Tamaño: ${shipment.package_size}
Descripción: ${shipment.package_description || 'No especificada'}
Valor: Q${shipment.package_value || 0}

Status: ${shipment.status}
        `;

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="guia_${shipment.tracking_number}.txt"`);
        res.send(guideContent);

    } catch (error) {
        console.error('Error descargando guía:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// ============================================
// ENDPOINTS PARA UBICACIONES DE GUATEMALA
// ============================================

// Obtener departamentos
app.get('/api/guatemala/departments', async (req, res) => {
    try {
        // Departamentos de Guatemala con sus municipios principales
        const departments = [
            {
                name: "Guatemala",
                municipalities: ["Guatemala", "Mixco", "Villa Nueva", "San José Pinula", "Santa Catarina Pinula", "San José del Golfo", "Palencia", "Chinautla", "San Pedro Ayampuc", "San Juan Sacatepéquez", "San Pedro Sacatepéquez", "San Raymundo", "Chuarrancho", "Fraijanes", "Amatitlán", "Villa Canales", "Petapa"]
            },
            {
                name: "Sacatepéquez",
                municipalities: ["Antigua Guatemala", "Jocotenango", "Pastores", "Sumpango", "Santo Domingo Xenacoj", "Santiago Sacatepéquez", "San Bartolomé Milpas Altas", "San Lucas Sacatepéquez", "Santa Lucía Milpas Altas", "Magdalena Milpas Altas", "Santa María de Jesús", "Ciudad Vieja", "San Miguel Dueñas", "Alotenango", "San Antonio Aguas Calientes", "Santa Catarina Barahona"]
            },
            {
                name: "Chimaltenango",
                municipalities: ["Chimaltenango", "San José Poaquil", "San Martín Jilotepeque", "Comalapa", "Santa Apolonia", "Tecpán Guatemala", "Patzún", "Pochuta", "Patzicía", "Santa Cruz Balanyá", "Acatenango", "Yepocapa", "San Andrés Itzapa", "Parramos", "Zaragoza", "El Tejar"]
            },
            {
                name: "Escuintla",
                municipalities: ["Escuintla", "Santa Lucía Cotzumalguapa", "La Democracia", "Siquinalá", "Masagua", "Tiquisate", "La Gomera", "Guanagazapa", "San José", "Iztapa", "Palín", "San Vicente Pacaya", "Nueva Concepción", "Taxisco"]
            },
            {
                name: "Santa Rosa",
                municipalities: ["Cuilapa", "Barberena", "Santa Rosa de Lima", "Casillas", "San Rafael las Flores", "Oratorio", "San Juan Tecuaco", "Chiquimulilla", "Taxisco", "Santa María Ixhuatán", "Guazacapán", "Santa Cruz Naranjo", "Pueblo Nuevo Viñas", "Nueva Santa Rosa"]
            }
        ];

        res.json({
            success: true,
            departments: departments
        });

    } catch (error) {
        console.error('Error obteniendo departamentos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Obtener municipios por departamento
app.get('/api/guatemala/municipalities', async (req, res) => {
    try {
        const { department } = req.query;

        if (!department) {
            return res.status(400).json({ success: false, message: 'Departamento requerido' });
        }

        // Mapeo de departamentos a municipios (simplificado)
        const departmentMunicipalities = {
            "Guatemala": ["Guatemala", "Mixco", "Villa Nueva", "San José Pinula", "Santa Catarina Pinula", "Chinautla", "San Pedro Ayampuc", "Amatitlán", "Villa Canales", "Petapa"],
            "Sacatepéquez": ["Antigua Guatemala", "Jocotenango", "Pastores", "Sumpango", "San Lucas Sacatepéquez", "Ciudad Vieja", "San Antonio Aguas Calientes"],
            "Chimaltenango": ["Chimaltenango", "Tecpán Guatemala", "Patzún", "Comalapa", "San Martín Jilotepeque", "Acatenango", "Yepocapa"],
            "Escuintla": ["Escuintla", "Santa Lucía Cotzumalguapa", "La Democracia", "Tiquisate", "Masagua", "Palín", "Nueva Concepción"],
            "Santa Rosa": ["Cuilapa", "Barberena", "Chiquimulilla", "Santa Rosa de Lima", "Taxisco", "Guazacapán"]
        };

        const municipalities = departmentMunicipalities[department] || [];

        res.json({
            success: true,
            municipalities: municipalities
        });

    } catch (error) {
        console.error('Error obteniendo municipios:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Obtener aldeas/poblados por municipio
app.get('/api/guatemala/villages', async (req, res) => {
    try {
        const { department, municipality } = req.query;

        if (!department || !municipality) {
            return res.status(400).json({ success: false, message: 'Departamento y municipio requeridos' });
        }

        // Generar algunas aldeas ejemplo (esto debería venir de una base de datos real)
        const exampleVillages = [
            `${municipality} Centro`,
            `${municipality} Norte`,
            `${municipality} Sur`,
            `${municipality} Este`,
            `${municipality} Oeste`,
            `Aldea El Progreso`,
            `Aldea La Esperanza`,
            `Aldea San Antonio`,
            `Aldea El Carmen`,
            `Cantón Central`
        ];

        res.json({
            success: true,
            villages: exampleVillages
        });

    } catch (error) {
        console.error('Error obteniendo aldeas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// ============================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================

async function startServer() {
    try {
        const dbConnected = await connectToMongoDB();
        
        app.listen(PORT, () => {
            console.log('');
            console.log('🚀 ===============================================');
            console.log(`📡 Servidor ejecutándose en http://localhost:${PORT}`);
            console.log('🎯 Endpoints disponibles:');
            console.log('   📊 GET  /api/health');
            console.log('   � GET  /api/db-status');
            console.log('   �🔐 POST /api/login');
            console.log('   🌐 GET  /api/forza/status');
            console.log('   📦 POST /api/forza/quote');
            console.log('   🚚 POST /api/forza/shipment');
            console.log('   📍 POST /api/forza/tracking');
            console.log('   📋 POST /api/shipments');
            console.log('   💰 POST /api/quotes');
            console.log(`🎨 Forza API: ${FORZA_CONFIG.enabled ? '✅ Habilitada' : '❌ Deshabilitada'}`);
            console.log(`💾 MongoDB: ${db ? '✅ Conectada' : '❌ Desconectada'}`);
            console.log('🚀 ===============================================');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🔄 Cerrando servidor...');
    if (mongoClient) {
        await mongoClient.close();
        console.log('📁 MongoDB desconectado');
    }
    process.exit(0);
});

// Iniciar servidor
startServer();
