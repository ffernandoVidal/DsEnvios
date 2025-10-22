// Backend con Integración Completa de Forza Ecommerce Engine
require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// Configuración de Google Maps API
const GOOGLE_MAPS_CONFIG = {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    baseUrl: 'https://maps.googleapis.com/maps/api',
    enabled: process.env.GOOGLE_MAPS_API_KEY ? true : false
};

let db = null;
let mongoClient = null;

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:4200', 'http://localhost:52079'],
    credentials: true
}));
app.use(express.json());

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'ds-envios-secret-key-2024';

// Middleware para autenticar tokens JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        req.user = user;
        next();
    });
}

console.log('🚀 Iniciando servidor con integración Forza Ecommerce Engine...');
console.log('🔧 Forza API habilitada:', FORZA_CONFIG.enabled);
console.log('🗺️ Google Maps API habilitada:', GOOGLE_MAPS_CONFIG.enabled);

// ============================================
// CONFIGURACIÓN DE PRECIOS FORZA
// ============================================
const FORZA_PRICING = {
    // Tarifas base por tipo de servicio (en GTQ)
    basePrices: {
        standard: 15.00,     // Envío estándar (3-5 días)
        express: 25.00,      // Envío express (1-2 días)
        overnight: 45.00     // Envío nocturno (24 horas)
    },
    
    // Tarifas por peso (GTQ por kg)
    weightRates: {
        standard: 3.50,      // Q3.50 por kg adicional
        express: 5.00,       // Q5.00 por kg adicional
        overnight: 8.00      // Q8.00 por kg adicional
    },
    
    // Tarifas por distancia (GTQ por km)
    distanceRates: {
        local: 0.05,         // Dentro del mismo departamento
        regional: 0.08,      // Entre departamentos cercanos
        national: 0.12       // Entre departamentos lejanos
    },
    
    // Seguro por valor declarado (% del valor)
    insuranceRate: 0.015,    // 1.5% del valor declarado
    
    // Recargos adicionales
    surcharges: {
        fuelSurcharge: 0.08,     // 8% recargo por combustible
        handlingSurcharge: 2.00,  // Q2.00 recargo por manejo
        remoteAreaSurcharge: 10.00, // Q10.00 para áreas remotas
        oversizePackage: 15.00    // Q15.00 para paquetes grandes
    },
    
    // Límites de peso y dimensiones
    limits: {
        maxWeight: 50,        // kg máximo por paquete
        maxDimension: 150,    // cm máximo por lado
        maxVolume: 0.2        // m³ máximo
    }
};

// ============================================
// SERVICIOS DE CÁLCULO DE DISTANCIA
// ============================================

/**
 * Calcula la distancia entre dos ubicaciones usando Google Distance Matrix API
 */
async function calculateDistance(origin, destination) {
    if (!GOOGLE_MAPS_CONFIG.enabled) {
        console.log('⚠️ Google Maps API no configurada, usando cálculo estimado');
        return estimateDistanceLocal(origin, destination);
    }

    try {
        const url = `${GOOGLE_MAPS_CONFIG.baseUrl}/distancematrix/json`;
        const params = {
            origins: `${origin.city}, ${origin.state || origin.department || ''}, Guatemala`,
            destinations: `${destination.city}, ${destination.state || destination.department || ''}, Guatemala`,
            key: GOOGLE_MAPS_CONFIG.apiKey,
            units: 'metric',
            language: 'es',
            region: 'gt'
        };

        console.log('🗺️ Calculando distancia con Google Maps API...');
        const response = await axios.get(url, { params, timeout: 10000 });

        if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
            const element = response.data.rows[0].elements[0];
            const distanceData = {
                distance: element.distance.value / 1000, // Convertir a km
                duration: element.duration.value / 60,   // Convertir a minutos
                distanceText: element.distance.text,
                durationText: element.duration.text,
                source: 'google_maps'
            };

            console.log('✅ Distancia calculada:', distanceData);
            return distanceData;
        } else {
            console.log('⚠️ Google Maps API sin resultados, usando estimación local');
            return estimateDistanceLocal(origin, destination);
        }
    } catch (error) {
        console.error('❌ Error calculando distancia con Google Maps:', error.message);
        return estimateDistanceLocal(origin, destination);
    }
}

/**
 * Estimación local de distancia basada en departamentos de Guatemala
 */
function estimateDistanceLocal(origin, destination) {
    // Simplificación: estimar distancia basada en departamentos
    const departmentDistances = {
        'Guatemala': { 'Guatemala': 25, 'Sacatepéquez': 45, 'Chimaltenango': 65, 'Escuintla': 85 },
        'Sacatepéquez': { 'Guatemala': 45, 'Sacatepéquez': 20, 'Chimaltenango': 35, 'Escuintla': 70 },
        'Chimaltenango': { 'Guatemala': 65, 'Sacatepéquez': 35, 'Chimaltenango': 25, 'Escuintla': 90 },
        'Escuintla': { 'Guatemala': 85, 'Sacatepéquez': 70, 'Chimaltenango': 90, 'Escuintla': 30 },
        // Agregar más departamentos según sea necesario
    };

    const originDept = origin.department || extractDepartmentFromCity(origin.city);
    const destDept = destination.department || extractDepartmentFromCity(destination.city);
    
    let estimatedDistance = 100; // Distancia por defecto
    
    if (departmentDistances[originDept] && departmentDistances[originDept][destDept]) {
        estimatedDistance = departmentDistances[originDept][destDept];
    }

    return {
        distance: estimatedDistance,
        duration: estimatedDistance * 1.5, // Estimación: 1.5 minutos por km
        distanceText: `${estimatedDistance} km (estimado)`,
        durationText: `${Math.round(estimatedDistance * 1.5)} min (estimado)`,
        source: 'local_estimation'
    };
}

/**
 * Extrae el departamento de una ciudad conocida
 */
function extractDepartmentFromCity(cityName) {
    const cityToDepartment = {
        'Guatemala': 'Guatemala',
        'Mixco': 'Guatemala',
        'Villa Nueva': 'Guatemala',
        'Antigua Guatemala': 'Sacatepéquez',
        'Chimaltenango': 'Chimaltenango',
        'Escuintla': 'Escuintla',
        'Quetzaltenango': 'Quetzaltenango',
        // Agregar más ciudades según sea necesario
    };
    
    return cityToDepartment[cityName] || 'Guatemala';
}

/**
 * Calcula el costo de envío usando las tarifas de Forza
 */
async function calculateShippingCost(origin, destination, packageDetails, serviceType = 'standard') {
    try {
        console.log('💰 Calculando costo de envío con tarifas Forza...');
        
        // 1. Calcular distancia
        const distanceData = await calculateDistance(origin, destination);
        
        // 2. Obtener tarifas base
        const basePrice = FORZA_PRICING.basePrices[serviceType] || FORZA_PRICING.basePrices.standard;
        const weightRate = FORZA_PRICING.weightRates[serviceType] || FORZA_PRICING.weightRates.standard;
        
        // 3. Calcular costo por peso
        const weight = packageDetails.weight || 1;
        const weightCost = Math.max(0, weight - 1) * weightRate; // Primer kg incluido
        
        // 4. Calcular costo por distancia
        const distanceType = getDistanceType(distanceData.distance);
        const distanceCost = distanceData.distance * FORZA_PRICING.distanceRates[distanceType];
        
        // 5. Calcular seguro
        const declaredValue = packageDetails.declared_value || 0;
        const insuranceCost = declaredValue * FORZA_PRICING.insuranceRate;
        
        // 6. Verificar si es paquete grande
        const isOversized = checkOversizedPackage(packageDetails);
        const oversizeCost = isOversized ? FORZA_PRICING.surcharges.oversizePackage : 0;
        
        // 7. Aplicar recargos
        const subtotal = basePrice + weightCost + distanceCost + insuranceCost + oversizeCost;
        const fuelSurcharge = subtotal * FORZA_PRICING.surcharges.fuelSurcharge;
        const handlingSurcharge = FORZA_PRICING.surcharges.handlingSurcharge;
        
        // 8. Total final
        const total = subtotal + fuelSurcharge + handlingSurcharge;
        
        // 9. Calcular tiempo estimado de entrega
        const estimatedDelivery = calculateDeliveryTime(serviceType, distanceData.distance);
        
        const breakdown = {
            basePrice: parseFloat(basePrice.toFixed(2)),
            weightCost: parseFloat(weightCost.toFixed(2)),
            distanceCost: parseFloat(distanceCost.toFixed(2)),
            insuranceCost: parseFloat(insuranceCost.toFixed(2)),
            oversizeCost: parseFloat(oversizeCost.toFixed(2)),
            fuelSurcharge: parseFloat(fuelSurcharge.toFixed(2)),
            handlingSurcharge: parseFloat(handlingSurcharge.toFixed(2)),
            subtotal: parseFloat(subtotal.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
        
        console.log('✅ Costo calculado:', breakdown);
        
        return {
            success: true,
            pricing: {
                total: breakdown.total,
                currency: 'GTQ',
                breakdown,
                distanceData,
                estimatedDelivery,
                serviceType,
                validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // Válido por 24 horas
            }
        };
        
    } catch (error) {
        console.error('❌ Error calculando costo de envío:', error);
        throw error;
    }
}

/**
 * Determina el tipo de distancia para aplicar tarifa correcta
 */
function getDistanceType(distance) {
    if (distance <= 50) return 'local';
    if (distance <= 150) return 'regional';
    return 'national';
}

/**
 * Verifica si un paquete es considerado grande
 */
function checkOversizedPackage(packageDetails) {
    const { length = 0, width = 0, height = 0, weight = 0 } = packageDetails;
    const maxDim = Math.max(length, width, height);
    const volume = (length * width * height) / 1000000; // Convertir a m³
    
    return weight > FORZA_PRICING.limits.maxWeight ||
           maxDim > FORZA_PRICING.limits.maxDimension ||
           volume > FORZA_PRICING.limits.maxVolume;
}

/**
 * Calcula tiempo estimado de entrega
 */
function calculateDeliveryTime(serviceType, distance) {
    const baseDays = {
        standard: { min: 3, max: 5 },
        express: { min: 1, max: 2 },
        overnight: { min: 1, max: 1 }
    };
    
    let days = baseDays[serviceType] || baseDays.standard;
    
    // Agregar días adicionales para distancias largas
    if (distance > 200) {
        days.min += 1;
        days.max += 2;
    } else if (distance > 100) {
        days.min += 0;
        days.max += 1;
    }
    
    if (days.min === days.max) {
        return `${days.min} día${days.min > 1 ? 's' : ''} laboral${days.min > 1 ? 'es' : ''}`;
    } else {
        return `${days.min}-${days.max} días laborales`;
    }
}

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
        await initializeCollections();
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

// Inicializar colecciones y índices para el sistema de cotizaciones
async function initializeCollections() {
    try {
        console.log('🔧 Inicializando colecciones de base de datos...');
        
        // Crear índices para colección de cotizaciones
        const quotations = db.collection('quotations');
        await quotations.createIndex({ "id": 1 }, { unique: true });
        await quotations.createIndex({ "created_at": -1 });
        await quotations.createIndex({ "origen.ciudad": 1, "destino.ciudad": 1 });
        await quotations.createIndex({ "user_ip": 1 });
        await quotations.createIndex({ "valida_hasta": 1 });
        
        // Crear índices para colección de precios (para futuras configuraciones)
        const pricing = db.collection('pricing_config');
        await pricing.createIndex({ "service_type": 1 });
        await pricing.createIndex({ "effective_date": -1 });
        await pricing.createIndex({ "active": 1 });
        
        // Crear configuración de precios por defecto si no existe
        const existingPricing = await pricing.countDocuments({ active: true });
        if (existingPricing === 0) {
            await pricing.insertOne({
                id: 'forza_default_2024',
                name: 'Configuración de Precios Forza 2024',
                active: true,
                effective_date: new Date(),
                pricing_config: FORZA_PRICING,
                created_at: new Date(),
                created_by: 'system'
            });
            console.log('💰 Configuración de precios por defecto creada');
        }
        
        // Crear índices para tracking de distancias (cache)
        const distanceCache = db.collection('distance_cache');
        await distanceCache.createIndex({ 
            "origin_key": 1, 
            "destination_key": 1 
        }, { unique: true });
        await distanceCache.createIndex({ "created_at": 1 }, { expireAfterSeconds: 604800 }); // 7 días TTL
        
        console.log('✅ Colecciones e índices inicializados correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando colecciones:', error.message);
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
// ENDPOINTS DE ENVÍOS (SHIPMENTS)
// ============================================

// Crear nuevo envío
app.post('/api/shipments', authenticateToken, async (req, res) => {
    try {
        console.log('📦 Creando nuevo envío...');
        console.log('Usuario autenticado:', req.user);
        console.log('Datos del envío:', JSON.stringify(req.body, null, 2));

        const {
            senderName,
            senderPhone,
            senderEmail,
            receiverName,
            receiverPhone,
            receiverEmail,
            packageWeight,
            packageDimensions,
            packageDescription,
            packageValue,
            fragile,
            senderAddress,
            receiverAddress,
            serviceType,
            paymentMethod,
            additionalServices,
            notes
        } = req.body;

        // Validaciones requeridas
        if (!senderName || !senderPhone || !receiverName || !receiverPhone) {
            return res.status(400).json({
                success: false,
                message: 'Datos de remitente y destinatario son requeridos'
            });
        }

        if (!packageWeight || !packageDescription) {
            return res.status(400).json({
                success: false,
                message: 'Peso y descripción del paquete son requeridos'
            });
        }

        if (!senderAddress || !receiverAddress) {
            return res.status(400).json({
                success: false,
                message: 'Direcciones de origen y destino son requeridas'
            });
        }

        if (!serviceType || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de servicio y método de pago son requeridos'
            });
        }

        // Generar número de tracking único
        const trackingNumber = `DS${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        // Calcular precio base del envío
        let basePrice = 0;
        if (packageWeight <= 1) {
            basePrice = 25;
        } else if (packageWeight <= 5) {
            basePrice = 35;
        } else if (packageWeight <= 10) {
            basePrice = 50;
        } else {
            basePrice = 50 + ((packageWeight - 10) * 5);
        }

        // Ajustar precio según tipo de servicio
        let finalPrice = basePrice;
        switch (serviceType) {
            case 'express':
                finalPrice = basePrice * 1.5;
                break;
            case 'overnight':
                finalPrice = basePrice * 2.0;
                break;
            case 'same-day':
                finalPrice = basePrice * 2.5;
                break;
        }

        // Agregar servicios adicionales
        if (additionalServices) {
            if (additionalServices.includes('insurance') && packageValue) {
                finalPrice += packageValue * 0.02; // 2% del valor del paquete
            }
            if (additionalServices.includes('signature')) {
                finalPrice += 10;
            }
            if (additionalServices.includes('packaging')) {
                finalPrice += 15;
            }
        }

        // Crear objeto de envío
        const newShipment = {
            trackingNumber,
            status: 'pending',
            createdBy: req.user.id,
            createdByRole: req.user.role,
            sender: {
                name: senderName,
                phone: senderPhone,
                email: senderEmail || null,
                address: senderAddress
            },
            receiver: {
                name: receiverName,
                phone: receiverPhone,
                email: receiverEmail || null,
                address: receiverAddress
            },
            package: {
                weight: parseFloat(packageWeight),
                dimensions: packageDimensions || null,
                description: packageDescription,
                value: packageValue ? parseFloat(packageValue) : null,
                fragile: fragile || false
            },
            service: {
                type: serviceType,
                additionalServices: additionalServices || []
            },
            payment: {
                method: paymentMethod,
                amount: Math.round(finalPrice * 100) / 100, // Redondear a 2 decimales
                status: 'pending'
            },
            notes: notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            timeline: [{
                status: 'pending',
                timestamp: new Date(),
                description: 'Envío creado exitosamente',
                location: senderAddress.department || 'Guatemala'
            }]
        };

        // Insertar en base de datos
        const result = await db.collection('shipments').insertOne(newShipment);

        console.log('✅ Envío creado exitosamente:', trackingNumber);

        res.status(201).json({
            success: true,
            message: 'Envío creado exitosamente',
            data: {
                trackingNumber,
                shipmentId: result.insertedId,
                estimatedPrice: newShipment.payment.amount,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('❌ Error al crear envío:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear el envío'
        });
    }
});

// Obtener envíos del usuario (según rol)
app.get('/api/shipments', authenticateToken, async (req, res) => {
    try {
        console.log('📋 Obteniendo envíos para usuario:', req.user);

        let query = {};
        
        // Filtrar según el rol del usuario
        if (req.user.role === 'user') {
            // Los usuarios solo ven sus propios envíos
            query.createdBy = req.user.id;
        } else if (req.user.role === 'operator') {
            // Los operadores ven envíos que pueden gestionar
            query.$or = [
                { createdBy: req.user.id },
                { status: { $in: ['pending', 'in-transit', 'delivered'] } }
            ];
        }
        // Los administradores ven todos los envíos (sin filtro)

        const shipments = await db.collection('shipments')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`✅ Se encontraron ${shipments.length} envíos`);

        res.json({
            success: true,
            data: shipments
        });

    } catch (error) {
        console.error('❌ Error al obtener envíos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener envío por tracking number
app.get('/api/shipments/track/:trackingNumber', async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        console.log('🔍 Rastreando envío:', trackingNumber);

        const shipment = await db.collection('shipments').findOne({
            trackingNumber: trackingNumber
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Número de seguimiento no encontrado'
            });
        }

        // Información pública del envío (sin datos sensibles)
        const publicShipmentInfo = {
            trackingNumber: shipment.trackingNumber,
            status: shipment.status,
            sender: {
                name: shipment.sender.name,
                address: {
                    department: shipment.sender.address.department,
                    municipality: shipment.sender.address.municipality
                }
            },
            receiver: {
                name: shipment.receiver.name,
                address: {
                    department: shipment.receiver.address.department,
                    municipality: shipment.receiver.address.municipality
                }
            },
            package: {
                description: shipment.package.description,
                weight: shipment.package.weight
            },
            service: shipment.service,
            timeline: shipment.timeline,
            createdAt: shipment.createdAt
        };

        console.log('✅ Envío encontrado');

        res.json({
            success: true,
            data: publicShipmentInfo
        });

    } catch (error) {
        console.error('❌ Error al rastrear envío:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Actualizar estado de envío (solo admin y operadores)
app.put('/api/shipments/:id/status', authenticateToken, async (req, res) => {
    try {
        // Verificar permisos
        if (req.user.role === 'user') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar envíos'
            });
        }

        const { id } = req.params;
        const { status, location, description } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Estado es requerido'
            });
        }

        const validStatuses = ['pending', 'confirmed', 'picked-up', 'in-transit', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        // Actualizar envío
        const updateData = {
            status,
            updatedAt: new Date(),
            $push: {
                timeline: {
                    status,
                    timestamp: new Date(),
                    description: description || `Estado actualizado a ${status}`,
                    location: location || 'Guatemala',
                    updatedBy: req.user.username
                }
            }
        };

        const result = await db.collection('shipments').updateOne(
            { _id: new ObjectId(id) },
            updateData
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Envío no encontrado'
            });
        }

        console.log('✅ Estado de envío actualizado:', id);

        res.json({
            success: true,
            message: 'Estado actualizado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
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

// ============================================
// ENDPOINT DE COTIZACIÓN MEJORADO
// ============================================

app.post('/api/cotizar', async (req, res) => {
    try {
        console.log('📦 Nueva solicitud de cotización:', req.body);
        
        const { 
            origen, 
            destino, 
            paquetes, 
            servicio = 'standard',
            // Compatibilidad con formato legacy
            peso, 
            alto, 
            ancho, 
            largo, 
            valor_declarado 
        } = req.body;

        // Validaciones básicas
        if (!origen || !destino) {
            return res.status(400).json({
                success: false,
                message: 'Origen y destino son requeridos',
                error: 'MISSING_LOCATIONS'
            });
        }

        // Preparar datos de ubicaciones
        const origin = {
            city: typeof origen === 'string' ? origen.split(',')[0].trim() : origen.city,
            department: typeof origen === 'string' ? origen.split(',')[1]?.trim() : origen.department,
            country: 'GT'
        };

        const destination = {
            city: typeof destino === 'string' ? destino.split(',')[0].trim() : destino.city,
            department: typeof destino === 'string' ? destino.split(',')[1]?.trim() : destino.department,
            country: 'GT'
        };

        let cotizaciones = [];

        // Procesar múltiples paquetes o formato legacy
        if (paquetes && Array.isArray(paquetes) && paquetes.length > 0) {
            // Formato nuevo: múltiples paquetes
            for (const paquete of paquetes) {
                const packageDetails = {
                    weight: paquete.peso || paquete.weight || 1,
                    length: paquete.largo || paquete.length || 20,
                    width: paquete.ancho || paquete.width || 20,
                    height: paquete.alto || paquete.height || 20,
                    declared_value: paquete.valor_declarado || paquete.declared_value || 0,
                    quantity: paquete.cantidad || paquete.quantity || 1,
                    type: paquete.tipo || paquete.type || 'standard'
                };

                const result = await calculateShippingCost(origin, destination, packageDetails, servicio);
                
                if (result.success) {
                    cotizaciones.push({
                        paquete_id: paquete.id || `pkg_${cotizaciones.length + 1}`,
                        nombre: paquete.nombrePersonalizado || paquete.name || `Paquete ${cotizaciones.length + 1}`,
                        cantidad: packageDetails.quantity,
                        ...result.pricing
                    });
                }
            }
        } else {
            // Formato legacy: un solo paquete
            const packageDetails = {
                weight: peso || 1,
                length: largo || 20,
                width: ancho || 20,
                height: alto || 20,
                declared_value: valor_declarado || 0
            };

            const result = await calculateShippingCost(origin, destination, packageDetails, servicio);
            
            if (result.success) {
                cotizaciones.push({
                    paquete_id: 'pkg_1',
                    nombre: 'Paquete 1',
                    cantidad: 1,
                    ...result.pricing
                });
            }
        }

        if (cotizaciones.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'No se pudo calcular la cotización',
                error: 'CALCULATION_FAILED'
            });
        }

        // Calcular totales
        const totalGeneral = cotizaciones.reduce((sum, cot) => sum + (cot.total * cot.cantidad), 0);
        const distanceData = cotizaciones[0].distanceData;
        const estimatedDelivery = cotizaciones[0].estimatedDelivery;

        // Generar opciones de servicio
        const servicios = await generateServiceOptions(origin, destination, cotizaciones[0]);

        const response = {
            success: true,
            cotizacion: {
                id: `quote_${Date.now()}`,
                origen: {
                    ciudad: origin.city,
                    departamento: origin.department,
                    display: `${origin.city}${origin.department ? ', ' + origin.department : ''}`
                },
                destino: {
                    ciudad: destination.city,
                    departamento: destination.department,
                    display: `${destination.city}${destination.department ? ', ' + destination.department : ''}`
                },
                distancia: distanceData,
                paquetes: cotizaciones,
                servicios: servicios,
                total_general: parseFloat(totalGeneral.toFixed(2)),
                moneda: 'GTQ',
                tiempo_entrega: estimatedDelivery,
                valida_hasta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                generada_en: new Date().toISOString()
            },
            message: 'Cotización generada exitosamente'
        };

        // Guardar cotización en base de datos
        if (db) {
            try {
                await db.collection('quotations').insertOne({
                    ...response.cotizacion,
                    request_data: req.body,
                    user_ip: req.ip,
                    user_agent: req.get('User-Agent'),
                    created_at: new Date()
                });
                console.log('✅ Cotización guardada en base de datos');
            } catch (dbError) {
                console.error('⚠️ Error guardando cotización en DB:', dbError.message);
            }
        }

        console.log('✅ Cotización generada exitosamente:', response.cotizacion.id);
        res.json(response);

    } catch (error) {
        console.error('❌ Error en endpoint de cotización:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al generar cotización',
            error: error.message
        });
    }
});

/**
 * Genera opciones de servicios disponibles
 */
async function generateServiceOptions(origin, destination, baseCotizacion) {
    const services = ['standard', 'express', 'overnight'];
    const opciones = [];

    for (const serviceType of services) {
        try {
            const packageDetails = {
                weight: 1, // Peso base para estimación
                length: 20, width: 20, height: 20,
                declared_value: 0
            };

            const result = await calculateShippingCost(origin, destination, packageDetails, serviceType);
            
            if (result.success) {
                const serviceNames = {
                    standard: 'Envío Estándar',
                    express: 'Envío Express',
                    overnight: 'Envío Nocturno'
                };

                const serviceDescriptions = {
                    standard: 'Entrega en horario laboral estándar',
                    express: 'Entrega prioritaria en 1-2 días',
                    overnight: 'Entrega garantizada en 24 horas'
                };

                opciones.push({
                    id: serviceType,
                    nombre: serviceNames[serviceType],
                    descripcion: serviceDescriptions[serviceType],
                    precio_base: result.pricing.breakdown.basePrice,
                    tiempo_entrega: result.pricing.estimatedDelivery,
                    precio_por_kg: FORZA_PRICING.weightRates[serviceType]
                });
            }
        } catch (error) {
            console.error(`⚠️ Error generando opción de servicio ${serviceType}:`, error.message);
        }
    }

    return opciones;
}

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

// ============================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔐 Intento de login...');
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Usuarios de demostración
        const demoUsers = [
            {
                id: 'admin001',
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'Administrador',
                email: 'admin@dsenvios.com'
            },
            {
                id: 'op001',
                username: 'operador',
                password: 'op123',
                role: 'operator',
                name: 'Operador',
                email: 'operador@dsenvios.com'
            },
            {
                id: 'user001',
                username: 'usuario',
                password: 'user123',
                role: 'user',
                name: 'Usuario',
                email: 'usuario@ejemplo.com'
            }
        ];

        // Buscar usuario
        const user = demoUsers.find(u => u.username === username && u.password === password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Crear token JWT
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Login exitoso para:', username);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    name: user.name,
                    email: user.email
                }
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// ============================================
// ENDPOINTS DE ENVÍOS MEJORADOS
// ============================================

// Crear nuevo envío con validación completa
app.post('/api/shipments/enhanced', authenticateToken, async (req, res) => {
    try {
        console.log('📦 Creando nuevo envío mejorado...');
        console.log('Usuario autenticado:', req.user);
        console.log('Datos del envío:', JSON.stringify(req.body, null, 2));

        const {
            senderName,
            senderPhone,
            senderEmail,
            receiverName,
            receiverPhone,
            receiverEmail,
            packageWeight,
            packageDimensions,
            packageDescription,
            packageValue,
            fragile,
            senderAddress,
            receiverAddress,
            serviceType,
            paymentMethod,
            additionalServices,
            notes
        } = req.body;

        // Validaciones requeridas
        if (!senderName || !senderPhone || !receiverName || !receiverPhone) {
            return res.status(400).json({
                success: false,
                message: 'Datos de remitente y destinatario son requeridos'
            });
        }

        if (!packageWeight || !packageDescription) {
            return res.status(400).json({
                success: false,
                message: 'Peso y descripción del paquete son requeridos'
            });
        }

        if (!senderAddress || !receiverAddress) {
            return res.status(400).json({
                success: false,
                message: 'Direcciones de origen y destino son requeridas'
            });
        }

        if (!serviceType || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de servicio y método de pago son requeridos'
            });
        }

        // Generar número de tracking único
        const trackingNumber = `DS${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        // Calcular precio base del envío
        let basePrice = 0;
        if (packageWeight <= 1) {
            basePrice = 25;
        } else if (packageWeight <= 5) {
            basePrice = 35;
        } else if (packageWeight <= 10) {
            basePrice = 50;
        } else {
            basePrice = 50 + ((packageWeight - 10) * 5);
        }

        // Ajustar precio según tipo de servicio
        let finalPrice = basePrice;
        switch (serviceType) {
            case 'express':
                finalPrice = basePrice * 1.5;
                break;
            case 'overnight':
                finalPrice = basePrice * 2.0;
                break;
            case 'same-day':
                finalPrice = basePrice * 2.5;
                break;
        }

        // Agregar servicios adicionales
        if (additionalServices) {
            if (additionalServices.includes('insurance') && packageValue) {
                finalPrice += packageValue * 0.02; // 2% del valor del paquete
            }
            if (additionalServices.includes('signature')) {
                finalPrice += 10;
            }
            if (additionalServices.includes('packaging')) {
                finalPrice += 15;
            }
        }

        // Crear objeto de envío mejorado
        const newShipment = {
            trackingNumber,
            status: 'pending',
            createdBy: req.user.id,
            createdByRole: req.user.role,
            createdByName: req.user.name,
            sender: {
                name: senderName,
                phone: senderPhone,
                email: senderEmail || null,
                address: senderAddress
            },
            receiver: {
                name: receiverName,
                phone: receiverPhone,
                email: receiverEmail || null,
                address: receiverAddress
            },
            package: {
                weight: parseFloat(packageWeight),
                dimensions: packageDimensions || null,
                description: packageDescription,
                value: packageValue ? parseFloat(packageValue) : null,
                fragile: fragile || false
            },
            service: {
                type: serviceType,
                additionalServices: additionalServices || []
            },
            payment: {
                method: paymentMethod,
                amount: Math.round(finalPrice * 100) / 100, // Redondear a 2 decimales
                status: 'pending'
            },
            notes: notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            timeline: [{
                status: 'pending',
                timestamp: new Date(),
                description: 'Envío creado exitosamente',
                location: senderAddress.department || 'Guatemala',
                updatedBy: req.user.name
            }]
        };

        // Insertar en base de datos
        const result = await db.collection('shipments').insertOne(newShipment);

        console.log('✅ Envío mejorado creado exitosamente:', trackingNumber);

        res.status(201).json({
            success: true,
            message: 'Envío creado exitosamente',
            data: {
                trackingNumber,
                shipmentId: result.insertedId,
                estimatedPrice: newShipment.payment.amount,
                status: 'pending',
                createdBy: req.user.name
            }
        });

    } catch (error) {
        console.error('❌ Error al crear envío mejorado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear el envío'
        });
    }
});

// Obtener envíos del usuario (con filtros por rol)
app.get('/api/shipments/user', authenticateToken, async (req, res) => {
    try {
        console.log('📋 Obteniendo envíos para usuario:', req.user);

        let query = {};
        
        // Filtrar según el rol del usuario
        if (req.user.role === 'user') {
            // Los usuarios solo ven sus propios envíos
            query.createdBy = req.user.id;
        } else if (req.user.role === 'operator') {
            // Los operadores ven envíos que pueden gestionar
            query.$or = [
                { createdBy: req.user.id },
                { status: { $in: ['pending', 'confirmed', 'picked-up', 'in-transit'] } }
            ];
        }
        // Los administradores ven todos los envíos (sin filtro)

        const shipments = await db.collection('shipments')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`✅ Se encontraron ${shipments.length} envíos para ${req.user.role}`);

        res.json({
            success: true,
            data: shipments,
            userRole: req.user.role,
            totalShipments: shipments.length
        });

    } catch (error) {
        console.error('❌ Error al obtener envíos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Actualizar estado de envío (solo admin y operadores)
app.put('/api/shipments/:id/status', authenticateToken, async (req, res) => {
    try {
        // Verificar permisos
        if (req.user.role === 'user') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar envíos'
            });
        }

        const { id } = req.params;
        const { status, location, description } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Estado es requerido'
            });
        }

        const validStatuses = ['pending', 'confirmed', 'picked-up', 'in-transit', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        // Actualizar envío
        const updateData = {
            status,
            updatedAt: new Date(),
            $push: {
                timeline: {
                    status,
                    timestamp: new Date(),
                    description: description || `Estado actualizado a ${status}`,
                    location: location || 'Guatemala',
                    updatedBy: req.user.name
                }
            }
        };

        const result = await db.collection('shipments').updateOne(
            { _id: new ObjectId(id) },
            updateData
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Envío no encontrado'
            });
        }

        console.log('✅ Estado de envío actualizado:', id, 'por', req.user.name);

        res.json({
            success: true,
            message: 'Estado actualizado exitosamente',
            updatedBy: req.user.name
        });

    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ============================================
// ENDPOINTS EXISTENTES (mantener compatibilidad)
// ============================================

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
