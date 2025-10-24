/**
 * 🏢 RUTAS DE CONFIGURACIÓN
 * Sistema DsEnvios - Backend
 * 
 * Endpoints para obtener datos de configuración (tipos de paquete, métodos de pago, ubicaciones)
 */

const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Variable para almacenar la referencia a la base de datos
let db;

// Middleware para verificar que la base de datos esté disponible
router.use((req, res, next) => {
    if (!db) {
        return res.status(500).json({
            success: false,
            message: 'Base de datos no disponible'
        });
    }
    next();
});

/**
 *  OBTENER TIPOS DE PAQUETE
 */
router.get('/package-types', async (req, res) => {
    try {
        const packageTypes = await db.collection('package_types').find({ active: true }).toArray();
        
        res.json({
            success: true,
            data: packageTypes.map(type => ({
                _id: type._id,
                code: type.code,
                displayName: type.name,
                specifications: {
                    maxWeight: type.max_weight,
                    maxLength: type.max_length,
                    maxWidth: type.max_width,
                    maxHeight: type.max_height
                },
                pricing: {
                    basePrice: type.base_price
                },
                description: type.description || `Paquete tipo ${type.name}`,
                active: type.active
            }))
        });
    } catch (error) {
        console.error('Error fetching package types:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de paquete'
        });
    }
});

/**
 * OBTENER MÉTODOS DE PAGO
 */
router.get('/payment-methods', async (req, res) => {
    try {
        const paymentMethods = await db.collection('payment_methods').find({ active: true }).toArray();
        
        res.json({
            success: true,
            data: paymentMethods.map(method => ({
                _id: method._id,
                code: method.code,
                name: method.name,
                displayName: method.display_name,
                type: method.type,
                processor: method.processor,
                fees: {
                    processingFeePercent: method.configuration?.processing_fee_percent || 0,
                    fixedAmount: method.configuration?.fixed_fee || 0
                },
                features: method.features || {},
                active: method.active
            }))
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener métodos de pago'
        });
    }
});

/*
 * OBTENER DEPARTAMENTOS
 */
router.get('/departments', async (req, res) => {
    try {
        const departments = await db.collection('departments').find({}).sort({ name: 1 }).toArray();
        
        res.json({
            success: true,
            data: departments.map(dept => ({
                _id: dept._id,
                code: dept.code,
                name: dept.name,
                region: dept.region,
                shippingZone: dept.shipping_zone,
                deliveryBaseCost: dept.delivery_base_cost
            }))
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener departamentos'
        });
    }
});

/**
 * BTENER MUNICIPIOS POR DEPARTAMENTO
 */
router.get('/municipalities/:departmentId', async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        const municipalities = await db.collection('municipalities')
            .find({ department_id: new ObjectId(departmentId) })
            .sort({ name: 1 })
            .toArray();
        
        res.json({
            success: true,
            data: municipalities.map(muni => ({
                _id: muni._id,
                departmentId: muni.department_id,
                code: muni.code,
                name: muni.name,
                deliveryDifficulty: muni.delivery_difficulty,
                accessRoads: muni.access_roads
            }))
        });
    } catch (error) {
        console.error('Error fetching municipalities:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener municipios'
        });
    }
});

/**
 *  OBTENER MUNICIPIOS POR NOMBRE DE DEPARTAMENTO
 */
router.get('/municipalities/by-department/:departmentName', async (req, res) => {
    try {
        const { departmentName } = req.params;
        
        // Buscar el departamento por nombre
        const department = await db.collection('departments').findOne({ name: departmentName });
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Departamento no encontrado'
            });
        }
        
        const municipalities = await db.collection('municipalities')
            .find({ department_id: department._id })
            .sort({ name: 1 })
            .toArray();
        
        res.json({
            success: true,
            data: municipalities.map(muni => ({
                _id: muni._id,
                departmentId: muni.department_id,
                departmentName: department.name,
                code: muni.code,
                name: muni.name,
                deliveryDifficulty: muni.delivery_difficulty,
                accessRoads: muni.access_roads
            }))
        });
    } catch (error) {
        console.error('Error fetching municipalities by department:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener municipios'
        });
    }
});

/**
 *  OBTENER ALDEAS/POBLADOS POR MUNICIPIO
 */
router.get('/villages/:municipalityId', async (req, res) => {
    try {
        const { municipalityId } = req.params;
        
        const villages = await db.collection('villages')
            .find({ municipality_id: new ObjectId(municipalityId) })
            .sort({ name: 1 })
            .toArray();
        
        res.json({
            success: true,
            data: villages.map(village => ({
                _id: village._id,
                municipalityId: village.municipality_id,
                name: village.name,
                coordinates: village.coordinates,
                deliveryAvailable: village.delivery_available,
                accessRoadCondition: village.access_road_condition
            }))
        });
    } catch (error) {
        console.error('Error fetching villages:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener aldeas/poblados'
        });
    }
});

/*
 *  DIRECCIONES FRECUENTES DEL USUARIO
 */
router.get('/frequent-addresses', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        
        const addresses = await db.collection('frequent_addresses')
            .find({ user_id: new ObjectId(userId) })
            .sort({ last_used: -1, usage_count: -1 })
            .limit(20)
            .toArray();
        
        res.json({
            success: true,
            data: addresses.map(addr => ({
                _id: addr._id,
                nickname: addr.nickname,
                category: addr.category,
                contactName: addr.contact_name,
                phone: addr.phone,
                email: addr.email,
                address: {
                    department: addr.address.department,
                    municipality: addr.address.municipality,
                    zone: addr.address.zone,
                    street: addr.address.street,
                    reference: addr.address.reference
                },
                usageCount: addr.usage_count,
                lastUsed: addr.last_used
            }))
        });
    } catch (error) {
        console.error('Error fetching frequent addresses:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener direcciones frecuentes'
        });
    }
});

/**
 * UARDAR DIRECCIÓN FRECUENTE
 */
router.post('/frequent-addresses', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        
        const {
            nickname,
            category,
            contactName,
            phone,
            email,
            address
        } = req.body;
        
        // Validar campos obligatorios
        if (!nickname || !contactName || !address?.department || !address?.municipality) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios'
            });
        }
        
        const frequentAddress = {
            user_id: new ObjectId(userId),
            nickname,
            category: category || 'otro',
            contact_name: contactName,
            phone: phone || '',
            email: email || '',
            address: {
                department: address.department,
                municipality: address.municipality,
                zone: address.zone || '',
                street: address.street || '',
                reference: address.reference || ''
            },
            usage_count: 1,
            last_used: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        };
        
        const result = await db.collection('frequent_addresses').insertOne(frequentAddress);
        
        res.json({
            success: true,
            message: 'Dirección frecuente guardada exitosamente',
            data: {
                _id: result.insertedId,
                ...frequentAddress
            }
        });
    } catch (error) {
        console.error('Error saving frequent address:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar dirección frecuente'
        });
    }
});

/**
 *  INCREMENTAR CONTADOR DE USO DE DIRECCIÓN FRECUENTE
 */
router.patch('/frequent-addresses/:addressId/increment', async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        
        const result = await db.collection('frequent_addresses').updateOne(
            { 
                _id: new ObjectId(addressId),
                user_id: new ObjectId(userId)
            },
            { 
                $inc: { usage_count: 1 },
                $set: { 
                    last_used: new Date(),
                    updated_at: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dirección no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Contador actualizado'
        });
    } catch (error) {
        console.error('Error incrementing address usage:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar contador'
        });
    }
});

/**
 *  CALCULAR COTIZACIÓN DE ENVÍO
 */
router.post('/quote', async (req, res) => {
    try {
        const {
            packageTypeId,
            packageWeight,
            packageValue,
            destinationDepartment,
            destinationMunicipality,
            serviceType = 'standard',
            paymentMethodId
        } = req.body;
        
        // Validar campos obligatorios
        if (!packageTypeId || !packageWeight || !destinationDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios para la cotización'
            });
        }
        
        // Obtener datos necesarios
        const packageType = await db.collection('package_types').findOne({ _id: new ObjectId(packageTypeId) });
        const department = await db.collection('departments').findOne({ name: destinationDepartment });
        const paymentMethod = paymentMethodId ? 
            await db.collection('payment_methods').findOne({ _id: new ObjectId(paymentMethodId) }) :
            { processing_fee_percent: 0, fixed_fee: 0 };
        
        if (!packageType) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de paquete no válido'
            });
        }
        
        // Calcular pricing usando la función existente
        const pricing = await calculateShippingPrice({
            packageType,
            paymentMethod,
            department,
            weight: packageWeight,
            value: packageValue || 100,
            serviceType
        });
        
        // Calcular días estimados de entrega
        const estimatedDays = getEstimatedDeliveryDays(destinationDepartment, serviceType);
        const estimatedDeliveryDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);
        
        res.json({
            success: true,
            data: {
                pricing,
                estimatedDeliveryDays: estimatedDays,
                estimatedDeliveryDate,
                packageType: {
                    name: packageType.name,
                    maxWeight: packageType.max_weight,
                    basePrice: packageType.base_price
                },
                destination: {
                    department: destinationDepartment,
                    municipality: destinationMunicipality,
                    shippingZone: department?.shipping_zone
                },
                serviceType
            }
        });
    } catch (error) {
        console.error('Error calculating quote:', error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular cotización'
        });
    }
});

/**
 *  CALCULAR PRECIO DE ENVÍO (función auxiliar)
 */
async function calculateShippingPrice(params) {
    const { packageType, paymentMethod, department, weight, value, serviceType } = params;
    
    try {
        // Precio base del tipo de paquete
        let basePrice = packageType.base_price || 25.00;
        
        // Cargo por peso extra
        let weightCharge = 0;
        if (weight > packageType.max_weight) {
            const extraWeight = weight - packageType.max_weight;
            weightCharge = extraWeight * 5.00; // Q5 por kg extra
        }
        
        // Cargo por distancia/zona
        let distanceCharge = 0;
        if (department && department.delivery_base_cost) {
            distanceCharge = department.delivery_base_cost;
        } else {
            // Cargos por defecto según departamento
            const distanceCharges = {
                'Guatemala': 0,
                'Sacatepéquez': 10,
                'Chimaltenango': 15,
                'Escuintla': 20,
                'Santa Rosa': 25,
                'Jalapa': 25,
                'Jutiapa': 30,
                'Sololá': 35,
                'Quetzaltenango': 40,
                'Totonicapán': 40,
                'Huehuetenango': 50,
                'San Marcos': 45,
                'Quiché': 55,
                'Baja Verapaz': 45,
                'Alta Verapaz': 50,
                'Izabal': 60,
                'Zacapa': 55,
                'Chiquimula': 50,
                'El Progreso': 35,
                'Petén': 75,
                'Retalhuleu': 45,
                'Suchitepéquez': 45
            };
            distanceCharge = distanceCharges[department?.name] || 40;
        }
        
        // Cargo por tipo de servicio
        let serviceCharge = 0;
        const serviceMultipliers = {
            'economy': 0.8,
            'standard': 1.0,
            'express': 1.5,
            'overnight': 2.0
        };
        const serviceMultiplier = serviceMultipliers[serviceType] || 1.0;
        serviceCharge = basePrice * (serviceMultiplier - 1.0);
        
        // Cargo por método de pago
        let paymentFee = 0;
        if (paymentMethod && paymentMethod.processing_fee_percent) {
            paymentFee = (basePrice + weightCharge + distanceCharge + serviceCharge) * (paymentMethod.processing_fee_percent / 100);
        }
        if (paymentMethod && paymentMethod.fixed_fee) {
            paymentFee += paymentMethod.fixed_fee;
        }
        
        // Subtotal
        const subtotal = basePrice + weightCharge + distanceCharge + serviceCharge + paymentFee;
        
        // Impuestos (IVA 12%)
        const taxAmount = subtotal * 0.12;
        
        // Total
        const totalAmount = subtotal + taxAmount;
        
        return {
            basePrice: parseFloat(basePrice.toFixed(2)),
            weightCharge: parseFloat(weightCharge.toFixed(2)),
            distanceCharge: parseFloat(distanceCharge.toFixed(2)),
            serviceCharge: parseFloat(serviceCharge.toFixed(2)),
            paymentFee: parseFloat(paymentFee.toFixed(2)),
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2))
        };
        
    } catch (error) {
        console.error('Error calculating shipping price:', error);
        return {
            basePrice: 25.00,
            weightCharge: 0,
            distanceCharge: 40.00,
            serviceCharge: 0,
            paymentFee: 0,
            subtotal: 65.00,
            taxAmount: 7.80,
            totalAmount: 72.80
        };
    }
}

/**
 * CALCULAR DÍAS DE ENTREGA ESTIMADOS (función auxiliar)
 */
function getEstimatedDeliveryDays(department, serviceType) {
    // Días base por departamento
    const baseDays = {
        'Guatemala': 1,
        'Sacatepéquez': 1,
        'Chimaltenango': 2,
        'Escuintla': 2,
        'Santa Rosa': 2,
        'Jalapa': 2,
        'Jutiapa': 3,
        'El Progreso': 2,
        'Baja Verapaz': 3,
        'Sololá': 3,
        'Quetzaltenango': 3,
        'Totonicapán': 3,
        'Retalhuleu': 3,
        'Suchitepéquez': 3,
        'San Marcos': 4,
        'Huehuetenango': 4,
        'Quiché': 4,
        'Alta Verapaz': 4,
        'Izabal': 4,
        'Zacapa': 4,
        'Chiquimula': 4,
        'Petén': 5
    };
    
    const baseDaysForDept = baseDays[department] || 3;
    
    // Modificadores por tipo de servicio
    const serviceModifiers = {
        'economy': 2,      // +2 días
        'standard': 0,     // días base
        'express': -1,     // -1 día
        'overnight': -2    // -2 días (mínimo 1)
    };
    
    const modifier = serviceModifiers[serviceType] || 0;
    const estimatedDays = Math.max(1, baseDaysForDept + modifier);
    
    return estimatedDays;
}

// Exportar router y función para asignar la base de datos
module.exports = router;

// Función para asignar la base de datos al router
module.exports.setDB = function(database) {
    db = database;
};