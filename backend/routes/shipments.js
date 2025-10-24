/**
 * RUTAS DE ENVÍOS
 * Sistema DsEnvios - Backend
 * 
 * Manejo completo de envíos, cotizaciones y seguimiento
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
 *  CREAR ENVÍO COMPLETO
 * Endpoint principal para procesar envíos desde el formulario
 */
router.post('/shipments/create-with-validation', async (req, res) => {
    try {
        const {
            // Datos del destinatario
            receiverName,
            receiverEmail,
            receiverPhone,
            receiverReference,
            receiverDepartamento,
            receiverMunicipio,
            receiverPoblado,
            receiverAddress,
            
            // Datos del paquete
            packageTypeId,
            packageWeight,
            packageDescription,
            packageValue,
            packageDimensions,
            
            // Datos de pago
            paymentMethodId,
            
            // Otros datos
            frequentAddressId,
            notes,
            priority = 'normal',
            serviceType = 'standard'
        } = req.body;

        // Validar campos obligatorios
        if (!receiverName || !receiverEmail || !receiverPhone || !receiverDepartamento || !receiverMunicipio) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios del destinatario'
            });
        }

        if (!packageTypeId || !packageWeight || !packageDescription || !packageValue) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios del paquete'
            });
        }

        if (!paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: 'Método de pago es obligatorio'
            });
        }

        // Obtener usuario actual del token JWT
        const userId = req.user ? req.user.userId : null;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Verificar que existan las referencias
        const packageType = await db.collection('package_types').findOne({ _id: new ObjectId(packageTypeId) });
        const paymentMethod = await db.collection('payment_methods').findOne({ _id: new ObjectId(paymentMethodId) });
        const department = await db.collection('departments').findOne({ name: receiverDepartamento });

        if (!packageType) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de paquete no válido'
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Método de pago no válido'
            });
        }

        // Generar números únicos
        const trackingNumber = generateTrackingNumber();
        const quotationNumber = generateQuotationNumber();
        const orderNumber = generateOrderNumber();

        // Calcular precios
        const pricing = await calculateShippingPrice({
            packageType,
            paymentMethod,
            department,
            weight: packageWeight,
            value: packageValue,
            serviceType
        });

        // 1. Crear cotización
        const quotationData = {
            quotation_number: quotationNumber,
            customer_id: new ObjectId(userId),
            quotation_type: 'shipment',
            status: 'accepted',
            
            // Información del origen y destino
            origin: {
                department: 'Guatemala',
                municipality: 'Guatemala',
                address: 'Oficina Principal DsEnvios'
            },
            destination: {
                department: receiverDepartamento,
                municipality: receiverMunicipio,
                zone: receiverPoblado || '',
                full_address: `${receiverDepartamento}, ${receiverMunicipio}${receiverPoblado ? ', ' + receiverPoblado : ''}`
            },
            
            // Información del paquete
            package_details: {
                type_id: new ObjectId(packageTypeId),
                weight: packageWeight,
                dimensions: packageDimensions || {
                    length: 0,
                    width: 0,
                    height: 0
                },
                declared_value: packageValue,
                description: packageDescription,
                fragile: false,
                dangerous: false
            },
            
            // Información del servicio
            service_details: {
                service_type: serviceType,
                delivery_type: 'standard',
                insurance_included: false,
                signature_required: false,
                estimated_delivery_days: getEstimatedDeliveryDays(receiverDepartamento, serviceType)
            },
            
            // Precios
            pricing: {
                base_price: pricing.basePrice,
                weight_charge: pricing.weightCharge,
                distance_charge: pricing.distanceCharge,
                service_charge: pricing.serviceCharge,
                payment_fee: pricing.paymentFee,
                tax_amount: pricing.taxAmount,
                total_amount: pricing.totalAmount,
                currency: 'GTQ'
            },
            
            validity_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
            notes: notes || '',
            created_at: new Date(),
            updated_at: new Date(),
            created_by: new ObjectId(userId)
        };

        const quotationResult = await db.collection('quotations').insertOne(quotationData);

        // 2. Crear orden
        const orderData = {
            order_number: orderNumber,
            customer_id: new ObjectId(userId),
            quotation_id: quotationResult.insertedId,
            
            order_type: 'shipment',
            priority: priority,
            status: 'confirmed',
            payment_status: 'pending',
            
            // Información del cliente
            customer_details: {
                user_id: new ObjectId(userId),
                contact_name: receiverName,
                email: receiverEmail,
                phone: receiverPhone
            },
            
            // Elementos de la orden
            items: [{
                item_type: 'shipment_service',
                description: `Envío ${packageType.display_name} - ${receiverDepartamento}`,
                quantity: 1,
                unit_price: pricing.totalAmount,
                total_price: pricing.totalAmount,
                package_details: {
                    type_id: new ObjectId(packageTypeId),
                    weight: packageWeight,
                    description: packageDescription,
                    declared_value: packageValue
                }
            }],
            
            // Totales
            totals: {
                subtotal: pricing.basePrice,
                tax_amount: pricing.taxAmount,
                shipping_amount: 0,
                discount_amount: 0,
                total_amount: pricing.totalAmount,
                currency: 'GTQ'
            },
            
            // Información de entrega
            delivery_info: {
                delivery_type: 'standard',
                recipient_name: receiverName,
                recipient_phone: receiverPhone,
                recipient_email: receiverEmail,
                delivery_address: {
                    department: receiverDepartamento,
                    municipality: receiverMunicipio,
                    zone: receiverPoblado || '',
                    street: receiverAddress?.street || '',
                    reference: receiverReference,
                    coordinates: null
                },
                delivery_instructions: notes || '',
                estimated_delivery: new Date(Date.now() + getEstimatedDeliveryDays(receiverDepartamento, serviceType) * 24 * 60 * 60 * 1000)
            },
            
            // Información de pago
            payment_info: {
                payment_method_id: new ObjectId(paymentMethodId),
                payment_status: 'pending',
                payment_due_date: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
            },
            
            created_at: new Date(),
            updated_at: new Date(),
            created_by: new ObjectId(userId)
        };

        const orderResult = await db.collection('orders').insertOne(orderData);

        // 3. Crear envío
        const shipmentData = {
            tracking_number: trackingNumber,
            order_id: orderResult.insertedId,
            quotation_id: quotationResult.insertedId,
            
            // Información básica
            shipment_type: 'standard',
            status: 'pending',
            priority: priority,
            
            // Información del remitente (empresa)
            sender: {
                user_id: new ObjectId(userId),
                company_name: 'DsEnvios',
                contact_name: 'Centro de Envíos',
                email: 'envios@dsenvios.com',
                phone: '+502 2234-5678',
                address: {
                    department: 'Guatemala',
                    municipality: 'Guatemala',
                    zone: 'Zona 1',
                    street: 'Oficina Principal',
                    reference: 'Centro de operaciones'
                }
            },
            
            // Información del destinatario
            recipient: {
                name: receiverName,
                email: receiverEmail,
                phone: receiverPhone,
                reference: receiverReference,
                address: {
                    department: receiverDepartamento,
                    municipality: receiverMunicipio,
                    zone: receiverPoblado || '',
                    street: receiverAddress?.street || '',
                    reference: receiverReference,
                    coordinates: null,
                    delivery_instructions: notes || ''
                }
            },
            
            // Información del paquete
            package_info: {
                type_id: new ObjectId(packageTypeId),
                weight: packageWeight,
                dimensions: packageDimensions || {
                    length: 0,
                    width: 0,
                    height: 0
                },
                declared_value: packageValue,
                description: packageDescription,
                fragile: false,
                dangerous: false,
                special_handling: false
            },
            
            // Información del servicio
            service_info: {
                service_type: serviceType,
                payment_method_id: new ObjectId(paymentMethodId),
                insurance_included: false,
                signature_required: false,
                delivery_confirmation: true,
                estimated_delivery: new Date(Date.now() + getEstimatedDeliveryDays(receiverDepartamento, serviceType) * 24 * 60 * 60 * 1000)
            },
            
            // Fechas y timestamps
            pickup_date: new Date(),
            estimated_delivery_date: new Date(Date.now() + getEstimatedDeliveryDays(receiverDepartamento, serviceType) * 24 * 60 * 60 * 1000),
            created_at: new Date(),
            updated_at: new Date(),
            created_by: new ObjectId(userId)
        };

        const shipmentResult = await db.collection('shipments').insertOne(shipmentData);

        // 4. Crear registro inicial de seguimiento
        const trackingData = {
            shipment_id: shipmentResult.insertedId,
            tracking_number: trackingNumber,
            
            status: 'pending',
            status_description: 'Envío registrado - Pendiente de recolección',
            
            location: {
                department: 'Guatemala',
                municipality: 'Guatemala',
                zone: 'Zona 1',
                facility: 'Centro de Operaciones DsEnvios',
                address: 'Oficina Principal'
            },
            
            event_type: 'created',
            event_description: 'Envío creado y registrado en el sistema',
            
            timestamp: new Date(),
            recorded_by: new ObjectId(userId),
            
            additional_info: {
                created_from: 'web_form',
                user_agent: req.headers['user-agent'] || '',
                ip_address: req.ip || req.connection.remoteAddress || ''
            }
        };

        await db.collection('tracking').insertOne(trackingData);

        // 5. Crear notificación para el usuario
        await createNotification({
            recipient_id: new ObjectId(userId),
            type: 'order_confirmation',
            title: 'Envío Creado Exitosamente',
            content: `Tu envío con número de guía ${trackingNumber} ha sido creado. Recibirás actualizaciones sobre su estado.`,
            related_entity: {
                entity_type: 'shipment',
                entity_id: shipmentResult.insertedId
            },
            channel: 'email',
            variables: {
                tracking_number: trackingNumber,
                receiver_name: receiverName,
                estimated_delivery: shipmentData.estimated_delivery_date.toLocaleDateString('es-GT')
            }
        });

        // 6. Incrementar uso de dirección frecuente si aplica
        if (frequentAddressId) {
            await db.collection('frequent_addresses').updateOne(
                { _id: new ObjectId(frequentAddressId) },
                { 
                    $inc: { usage_count: 1 },
                    $set: { last_used: new Date() }
                }
            );
        }

        // 7. Registrar en logs del sistema
        await logSystemEvent({
            level: 'info',
            source: 'api',
            category: 'shipment',
            message: `Nuevo envío creado: ${trackingNumber}`,
            context: {
                user_id: userId,
                shipment_id: shipmentResult.insertedId,
                tracking_number: trackingNumber,
                destination: `${receiverDepartamento}, ${receiverMunicipio}`
            }
        });

        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Envío creado exitosamente',
            data: {
                shipment: {
                    id: shipmentResult.insertedId,
                    trackingNumber: trackingNumber,
                    status: 'pending',
                    estimatedDelivery: shipmentData.estimated_delivery_date
                },
                order: {
                    id: orderResult.insertedId,
                    orderNumber: orderNumber,
                    totalAmount: pricing.totalAmount
                },
                quotation: {
                    id: quotationResult.insertedId,
                    quotationNumber: quotationNumber
                },
                pricing: pricing
            }
        });

    } catch (error) {
        console.error('Error creating shipment:', error);
        
        // Log del error
        await logSystemEvent({
            level: 'error',
            source: 'api',
            category: 'shipment',
            message: `Error al crear envío: ${error.message}`,
            context: {
                user_id: req.user?.userId,
                error_stack: error.stack,
                request_body: req.body
            },
            error_details: {
                error_code: 'SHIPMENT_CREATION_ERROR',
                error_type: error.name,
                stack_trace: error.stack
            }
        });

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 *  CALCULAR PRECIO DE ENVÍO
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
            distanceCharge = distanceCharges[department.name] || 40;
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
        if (paymentMethod.processing_fee_percent) {
            paymentFee = (basePrice + weightCharge + distanceCharge + serviceCharge) * (paymentMethod.processing_fee_percent / 100);
        }
        if (paymentMethod.fixed_fee) {
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
 * GENERADORES DE NÚMEROS ÚNICOS
 */
function generateTrackingNumber() {
    const prefix = 'DSE';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `${prefix}${year}${month}${day}${timestamp}${random}`;
}

function generateQuotationNumber() {
    const prefix = 'COT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    
    return `${prefix}-${timestamp}-${random}`;
}

function generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    
    return `${prefix}-${timestamp}-${random}`;
}

/**
 *  CALCULAR DÍAS DE ENTREGA ESTIMADOS
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

/**
 *  CREAR NOTIFICACIÓN
 */
async function createNotification(notificationData) {
    try {
        const notification = {
            notification_id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            ...notificationData,
            priority: notificationData.priority || 'normal',
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        };
        
        await db.collection('notifications').insertOne(notification);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

/**
 *  REGISTRAR EVENTO EN LOGS
 */
async function logSystemEvent(eventData) {
    try {
        const logEntry = {
            log_id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            ...eventData,
            timestamp: new Date(),
            processed_at: new Date(),
            archived: false
        };
        
        await db.collection('system_logs').insertOne(logEntry);
        return logEntry;
    } catch (error) {
        console.error('Error logging system event:', error);
    }
}

// Exportar router y función para asignar la base de datos
module.exports = router;

// Función para asignar la base de datos al router
module.exports.setDB = function(database) {
    db = database;
};