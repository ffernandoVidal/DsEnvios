/**
 *  ESQUEMAS PRINCIPALES DEL SISTEMA
 * Sistema de Gestión de Envíos DsEnvios
 * 
 * Este archivo define los esquemas principales para users, shipments, 
 * quotations, tracking y orders con validaciones completas.
 */

const { ObjectId } = require('mongodb');

/**
 *  ESQUEMA DE USUARIOS
 */
const UserSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["username", "password", "name", "role", "email"],
            properties: {
                username: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 50,
                    pattern: "^[a-zA-Z0-9_]+$",
                    description: "Nombre de usuario único (3-50 caracteres, solo letras, números y _)"
                },
                password: {
                    bsonType: "string",
                    minLength: 60,
                    maxLength: 100,
                    description: "Contraseña hasheada con bcrypt"
                },
                name: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Nombre completo del usuario"
                },
                email: {
                    bsonType: "string",
                    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                    description: "Correo electrónico válido"
                },
                role: {
                    bsonType: "string",
                    enum: ["admin", "operator", "user", "customer", "driver"],
                    description: "Rol del usuario en el sistema"
                },
                phone: {
                    bsonType: "string",
                    pattern: "^[+]?[0-9\\s\\-\\(\\)]{8,20}$",
                    description: "Número de teléfono"
                },
                address: {
                    bsonType: "object",
                    properties: {
                        street: { bsonType: "string", maxLength: 200 },
                        department: { bsonType: "string", maxLength: 100 },
                        municipality: { bsonType: "string", maxLength: 100 },
                        village: { bsonType: "string", maxLength: 100 },
                        postal_code: { bsonType: "string", maxLength: 10 },
                        coordinates: {
                            bsonType: "object",
                            properties: {
                                lat: { bsonType: "double", minimum: -90, maximum: 90 },
                                lng: { bsonType: "double", minimum: -180, maximum: 180 }
                            }
                        }
                    }
                },
                preferences: {
                    bsonType: "object",
                    properties: {
                        language: { bsonType: "string", enum: ["es", "en"], default: "es" },
                        notifications: {
                            bsonType: "object",
                            properties: {
                                email: { bsonType: "bool", default: true },
                                sms: { bsonType: "bool", default: false },
                                push: { bsonType: "bool", default: true }
                            }
                        },
                        default_package_type: { bsonType: "string" },
                        preferred_payment_method: { bsonType: "string" }
                    }
                },
                status: {
                    bsonType: "string",
                    enum: ["active", "inactive", "suspended", "pending_verification"],
                    default: "active"
                },
                verified: {
                    bsonType: "bool",
                    default: false
                },
                verification_token: { bsonType: "string" },
                password_reset_token: { bsonType: "string" },
                password_reset_expires: { bsonType: "date" },
                last_login: { bsonType: "date" },
                login_attempts: { bsonType: "int", minimum: 0, default: 0 },
                locked_until: { bsonType: "date" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
};

/**
 *  ESQUEMA DE ENVÍOS
 */
const ShipmentSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["tracking_number", "sender", "recipient", "package_details", "service_type", "status"],
            properties: {
                tracking_number: {
                    bsonType: "string",
                    pattern: "^[A-Z0-9]{8,20}$",
                    description: "Número de seguimiento único"
                },
                sender: {
                    bsonType: "object",
                    required: ["name", "phone", "address"],
                    properties: {
                        user_id: { bsonType: "objectId" },
                        name: { bsonType: "string", minLength: 2, maxLength: 100 },
                        phone: { bsonType: "string", pattern: "^[+]?[0-9\\s\\-\\(\\)]{8,20}$" },
                        email: { bsonType: "string" },
                        id_number: { bsonType: "string", maxLength: 20 },
                        address: {
                            bsonType: "object",
                            required: ["street", "department", "municipality"],
                            properties: {
                                street: { bsonType: "string", minLength: 5, maxLength: 200 },
                                department: { bsonType: "string", minLength: 2, maxLength: 100 },
                                municipality: { bsonType: "string", minLength: 2, maxLength: 100 },
                                village: { bsonType: "string", maxLength: 100 },
                                postal_code: { bsonType: "string", maxLength: 10 },
                                reference: { bsonType: "string", maxLength: 200 },
                                coordinates: {
                                    bsonType: "object",
                                    properties: {
                                        lat: { bsonType: "double" },
                                        lng: { bsonType: "double" }
                                    }
                                }
                            }
                        }
                    }
                },
                recipient: {
                    bsonType: "object",
                    required: ["name", "phone", "address"],
                    properties: {
                        user_id: { bsonType: "objectId" },
                        name: { bsonType: "string", minLength: 2, maxLength: 100 },
                        phone: { bsonType: "string", pattern: "^[+]?[0-9\\s\\-\\(\\)]{8,20}$" },
                        email: { bsonType: "string" },
                        id_number: { bsonType: "string", maxLength: 20 },
                        address: {
                            bsonType: "object",
                            required: ["street", "department", "municipality"],
                            properties: {
                                street: { bsonType: "string", minLength: 5, maxLength: 200 },
                                department: { bsonType: "string", minLength: 2, maxLength: 100 },
                                municipality: { bsonType: "string", minLength: 2, maxLength: 100 },
                                village: { bsonType: "string", maxLength: 100 },
                                postal_code: { bsonType: "string", maxLength: 10 },
                                reference: { bsonType: "string", maxLength: 200 },
                                coordinates: {
                                    bsonType: "object",
                                    properties: {
                                        lat: { bsonType: "double" },
                                        lng: { bsonType: "double" }
                                    }
                                }
                            }
                        }
                    }
                },
                package_details: {
                    bsonType: "object",
                    required: ["type_id", "weight", "dimensions"],
                    properties: {
                        type_id: { bsonType: "objectId", description: "ID del tipo de paquete" },
                        weight: { bsonType: "double", minimum: 0.01, maximum: 100 },
                        dimensions: {
                            bsonType: "object",
                            required: ["length", "width", "height"],
                            properties: {
                                length: { bsonType: "double", minimum: 1, maximum: 200 },
                                width: { bsonType: "double", minimum: 1, maximum: 200 },
                                height: { bsonType: "double", minimum: 1, maximum: 200 },
                                volume: { bsonType: "double", minimum: 0.01 }
                            }
                        },
                        description: { bsonType: "string", minLength: 5, maxLength: 500 },
                        value: { bsonType: "double", minimum: 0.01 },
                        fragile: { bsonType: "bool", default: false },
                        hazardous: { bsonType: "bool", default: false },
                        special_instructions: { bsonType: "string", maxLength: 500 }
                    }
                },
                service_type: {
                    bsonType: "string",
                    enum: ["standard", "express", "overnight", "same_day", "economy"],
                    description: "Tipo de servicio de envío"
                },
                pricing: {
                    bsonType: "object",
                    required: ["base_cost", "total_cost"],
                    properties: {
                        base_cost: { bsonType: "double", minimum: 0 },
                        distance_cost: { bsonType: "double", minimum: 0 },
                        weight_cost: { bsonType: "double", minimum: 0 },
                        volume_cost: { bsonType: "double", minimum: 0 },
                        service_cost: { bsonType: "double", minimum: 0 },
                        insurance_cost: { bsonType: "double", minimum: 0 },
                        taxes: { bsonType: "double", minimum: 0 },
                        discounts: { bsonType: "double", minimum: 0 },
                        total_cost: { bsonType: "double", minimum: 0 },
                        currency: { bsonType: "string", enum: ["GTQ", "USD"], default: "GTQ" }
                    }
                },
                status: {
                    bsonType: "string",
                    enum: [
                        "pending", "confirmed", "picked_up", "in_transit", 
                        "out_for_delivery", "delivered", "failed_delivery", 
                        "returned", "cancelled", "lost", "damaged"
                    ],
                    default: "pending"
                },
                payment: {
                    bsonType: "object",
                    properties: {
                        method: { bsonType: "string", enum: ["cash", "card", "transfer", "paypal", "crypto"] },
                        status: { bsonType: "string", enum: ["pending", "paid", "failed", "refunded"] },
                        transaction_id: { bsonType: "string" },
                        paid_at: { bsonType: "date" },
                        payment_reference: { bsonType: "string" }
                    }
                },
                delivery: {
                    bsonType: "object",
                    properties: {
                        estimated_date: { bsonType: "date" },
                        delivery_window: {
                            bsonType: "object",
                            properties: {
                                start: { bsonType: "date" },
                                end: { bsonType: "date" }
                            }
                        },
                        delivery_attempts: { bsonType: "int", minimum: 0, default: 0 },
                        delivered_at: { bsonType: "date" },
                        delivered_to: { bsonType: "string" },
                        signature_required: { bsonType: "bool", default: false },
                        signature_captured: { bsonType: "string" },
                        photo_proof: { bsonType: "string" }
                    }
                },
                forza_integration: {
                    bsonType: "object",
                    properties: {
                        forza_shipment_id: { bsonType: "string" },
                        forza_status: { bsonType: "string" },
                        last_sync: { bsonType: "date" },
                        sync_attempts: { bsonType: "int", minimum: 0, default: 0 },
                        api_response: { bsonType: "object" }
                    }
                },
                distance_info: {
                    bsonType: "object",
                    properties: {
                        distance_km: { bsonType: "double", minimum: 0 },
                        estimated_duration: { bsonType: "string" },
                        route_type: { bsonType: "string", enum: ["urban", "suburban", "rural", "international"] }
                    }
                },
                notes: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            user_id: { bsonType: "objectId" },
                            note: { bsonType: "string", maxLength: 1000 },
                            type: { bsonType: "string", enum: ["info", "warning", "error", "success"] },
                            timestamp: { bsonType: "date" }
                        }
                    }
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "objectId" },
                updated_by: { bsonType: "objectId" }
            }
        }
    }
};

/**
 *  ESQUEMA DE COTIZACIONES
 */
const QuotationSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["user_id", "origin", "destination", "package_details", "service_type"],
            properties: {
                quotation_number: {
                    bsonType: "string",
                    pattern: "^QT[0-9]{8}$",
                    description: "Número de cotización único"
                },
                user_id: { bsonType: "objectId", description: "ID del usuario que solicita" },
                origin: {
                    bsonType: "object",
                    required: ["department", "municipality"],
                    properties: {
                        department: { bsonType: "string", minLength: 2, maxLength: 100 },
                        municipality: { bsonType: "string", minLength: 2, maxLength: 100 },
                        village: { bsonType: "string", maxLength: 100 },
                        address: { bsonType: "string", maxLength: 200 },
                        coordinates: {
                            bsonType: "object",
                            properties: {
                                lat: { bsonType: "double" },
                                lng: { bsonType: "double" }
                            }
                        }
                    }
                },
                destination: {
                    bsonType: "object",
                    required: ["department", "municipality"],
                    properties: {
                        department: { bsonType: "string", minLength: 2, maxLength: 100 },
                        municipality: { bsonType: "string", minLength: 2, maxLength: 100 },
                        village: { bsonType: "string", maxLength: 100 },
                        address: { bsonType: "string", maxLength: 200 },
                        coordinates: {
                            bsonType: "object",
                            properties: {
                                lat: { bsonType: "double" },
                                lng: { bsonType: "double" }
                            }
                        }
                    }
                },
                package_details: {
                    bsonType: "object",
                    required: ["type_id", "weight", "dimensions"],
                    properties: {
                        type_id: { bsonType: "objectId" },
                        weight: { bsonType: "double", minimum: 0.01, maximum: 100 },
                        dimensions: {
                            bsonType: "object",
                            required: ["length", "width", "height"],
                            properties: {
                                length: { bsonType: "double", minimum: 1, maximum: 200 },
                                width: { bsonType: "double", minimum: 1, maximum: 200 },
                                height: { bsonType: "double", minimum: 1, maximum: 200 }
                            }
                        },
                        value: { bsonType: "double", minimum: 0.01 },
                        fragile: { bsonType: "bool", default: false },
                        description: { bsonType: "string", maxLength: 500 }
                    }
                },
                service_type: {
                    bsonType: "string",
                    enum: ["standard", "express", "overnight", "same_day", "economy"]
                },
                quote_results: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            service_name: { bsonType: "string" },
                            estimated_cost: { bsonType: "double", minimum: 0 },
                            estimated_delivery: { bsonType: "string" },
                            delivery_days: { bsonType: "int", minimum: 1 },
                            available: { bsonType: "bool" },
                            restrictions: { bsonType: "array", items: { bsonType: "string" } }
                        }
                    }
                },
                best_option: {
                    bsonType: "object",
                    properties: {
                        service: { bsonType: "string" },
                        cost: { bsonType: "double", minimum: 0 },
                        delivery_time: { bsonType: "string" },
                        reason: { bsonType: "string" }
                    }
                },
                pricing_breakdown: {
                    bsonType: "object",
                    properties: {
                        base_cost: { bsonType: "double", minimum: 0 },
                        distance_cost: { bsonType: "double", minimum: 0 },
                        weight_cost: { bsonType: "double", minimum: 0 },
                        service_cost: { bsonType: "double", minimum: 0 },
                        insurance_cost: { bsonType: "double", minimum: 0 },
                        taxes: { bsonType: "double", minimum: 0 },
                        total_cost: { bsonType: "double", minimum: 0 }
                    }
                },
                distance_info: {
                    bsonType: "object",
                    properties: {
                        distance_km: { bsonType: "double", minimum: 0 },
                        estimated_duration: { bsonType: "string" },
                        route_type: { bsonType: "string" }
                    }
                },
                status: {
                    bsonType: "string",
                    enum: ["active", "expired", "converted", "cancelled"],
                    default: "active"
                },
                valid_until: { bsonType: "date" },
                converted_to_shipment: { bsonType: "objectId" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
};

/**
 *  ESQUEMA DE SEGUIMIENTO
 */
const TrackingSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["shipment_id", "tracking_number", "status", "timestamp"],
            properties: {
                shipment_id: { bsonType: "objectId", description: "ID del envío" },
                tracking_number: { bsonType: "string", description: "Número de seguimiento" },
                status: {
                    bsonType: "string",
                    enum: [
                        "created", "confirmed", "picked_up", "in_transit", 
                        "arrived_at_facility", "out_for_delivery", "delivered", 
                        "failed_delivery", "returned", "cancelled", "exception"
                    ]
                },
                status_description: { bsonType: "string", maxLength: 500 },
                location: {
                    bsonType: "object",
                    properties: {
                        address: { bsonType: "string", maxLength: 200 },
                        department: { bsonType: "string", maxLength: 100 },
                        municipality: { bsonType: "string", maxLength: 100 },
                        facility_name: { bsonType: "string", maxLength: 100 },
                        coordinates: {
                            bsonType: "object",
                            properties: {
                                lat: { bsonType: "double" },
                                lng: { bsonType: "double" }
                            }
                        }
                    }
                },
                driver_info: {
                    bsonType: "object",
                    properties: {
                        driver_id: { bsonType: "objectId" },
                        driver_name: { bsonType: "string", maxLength: 100 },
                        vehicle_plate: { bsonType: "string", maxLength: 20 },
                        contact_phone: { bsonType: "string" }
                    }
                },
                estimated_delivery: { bsonType: "date" },
                notes: { bsonType: "string", maxLength: 1000 },
                photos: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            url: { bsonType: "string" },
                            description: { bsonType: "string" },
                            uploaded_at: { bsonType: "date" }
                        }
                    }
                },
                signature: {
                    bsonType: "object",
                    properties: {
                        image_url: { bsonType: "string" },
                        signed_by: { bsonType: "string", maxLength: 100 },
                        relationship: { bsonType: "string", maxLength: 50 }
                    }
                },
                timestamp: { bsonType: "date" },
                created_by: { bsonType: "objectId" },
                forza_sync: {
                    bsonType: "object",
                    properties: {
                        synced: { bsonType: "bool", default: false },
                        sync_attempts: { bsonType: "int", minimum: 0, default: 0 },
                        last_sync: { bsonType: "date" },
                        forza_status_id: { bsonType: "string" }
                    }
                }
            }
        }
    }
};

/**
 *  ESQUEMA DE ÓRDENES
 */
const OrderSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["order_number", "customer_id", "shipments", "total_amount", "status"],
            properties: {
                order_number: {
                    bsonType: "string",
                    pattern: "^ORD[0-9]{8}$",
                    description: "Número de orden único"
                },
                customer_id: { bsonType: "objectId", description: "ID del cliente" },
                shipments: {
                    bsonType: "array",
                    minItems: 1,
                    items: {
                        bsonType: "object",
                        required: ["shipment_id", "cost"],
                        properties: {
                            shipment_id: { bsonType: "objectId" },
                            tracking_number: { bsonType: "string" },
                            cost: { bsonType: "double", minimum: 0 },
                            status: { bsonType: "string" }
                        }
                    }
                },
                billing_info: {
                    bsonType: "object",
                    required: ["name", "address"],
                    properties: {
                        name: { bsonType: "string", minLength: 2, maxLength: 100 },
                        company: { bsonType: "string", maxLength: 100 },
                        tax_id: { bsonType: "string", maxLength: 20 },
                        address: {
                            bsonType: "object",
                            required: ["street", "department", "municipality"],
                            properties: {
                                street: { bsonType: "string", maxLength: 200 },
                                department: { bsonType: "string", maxLength: 100 },
                                municipality: { bsonType: "string", maxLength: 100 },
                                postal_code: { bsonType: "string", maxLength: 10 }
                            }
                        },
                        phone: { bsonType: "string" },
                        email: { bsonType: "string" }
                    }
                },
                payment_info: {
                    bsonType: "object",
                    required: ["method", "status"],
                    properties: {
                        method: { bsonType: "string", enum: ["cash", "card", "transfer", "paypal", "crypto"] },
                        status: { bsonType: "string", enum: ["pending", "paid", "failed", "refunded", "partial"] },
                        transaction_id: { bsonType: "string" },
                        payment_reference: { bsonType: "string" },
                        paid_amount: { bsonType: "double", minimum: 0 },
                        paid_at: { bsonType: "date" },
                        payment_details: { bsonType: "object" }
                    }
                },
                pricing: {
                    bsonType: "object",
                    required: ["subtotal", "total_amount"],
                    properties: {
                        subtotal: { bsonType: "double", minimum: 0 },
                        taxes: { bsonType: "double", minimum: 0 },
                        discounts: { bsonType: "double", minimum: 0 },
                        shipping_total: { bsonType: "double", minimum: 0 },
                        total_amount: { bsonType: "double", minimum: 0 },
                        currency: { bsonType: "string", enum: ["GTQ", "USD"], default: "GTQ" }
                    }
                },
                status: {
                    bsonType: "string",
                    enum: ["draft", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
                    default: "draft"
                },
                special_instructions: { bsonType: "string", maxLength: 1000 },
                internal_notes: { bsonType: "string", maxLength: 1000 },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "objectId" },
                updated_by: { bsonType: "objectId" }
            }
        }
    }
};

// Exportar esquemas
module.exports = {
    UserSchema,
    ShipmentSchema,
    QuotationSchema,
    TrackingSchema,
    OrderSchema
};