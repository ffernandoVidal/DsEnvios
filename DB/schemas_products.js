/**
 * 📦 ESQUEMAS DE PRODUCTOS Y SERVICIOS
 * Sistema de Gestión de Envíos DsEnvios
 * 
 * Este archivo define los esquemas para package_types, pricing_config,
 * shipping_rates y service_types del sistema de envíos.
 */

const { ObjectId } = require('mongodb');

/**
 * 📦 ESQUEMA DE TIPOS DE PAQUETES
 */
const PackageTypeSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "display_name", "category", "weight_limits", "dimension_limits"],
            properties: {
                name: {
                    bsonType: "string",
                    pattern: "^[a-z_]+$",
                    minLength: 3,
                    maxLength: 50,
                    description: "Nombre técnico del tipo de paquete"
                },
                display_name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 100,
                    description: "Nombre para mostrar al usuario"
                },
                description: {
                    bsonType: "string",
                    minLength: 10,
                    maxLength: 500,
                    description: "Descripción detallada del tipo de paquete"
                },
                category: {
                    bsonType: "string",
                    enum: ["document", "small_package", "medium_package", "large_package", "oversized", "special"],
                    description: "Categoría del paquete"
                },
                weight_limits: {
                    bsonType: "object",
                    required: ["min_kg", "max_kg"],
                    properties: {
                        min_kg: { bsonType: "double", minimum: 0, maximum: 1000 },
                        max_kg: { bsonType: "double", minimum: 0.01, maximum: 1000 },
                        tolerance_kg: { bsonType: "double", minimum: 0, default: 0.1 }
                    }
                },
                dimension_limits: {
                    bsonType: "object",
                    required: ["max_length_cm", "max_width_cm", "max_height_cm"],
                    properties: {
                        max_length_cm: { bsonType: "double", minimum: 1, maximum: 500 },
                        max_width_cm: { bsonType: "double", minimum: 1, maximum: 500 },
                        max_height_cm: { bsonType: "double", minimum: 1, maximum: 500 },
                        max_volume_cm3: { bsonType: "double", minimum: 1 },
                        max_perimeter_cm: { bsonType: "double", minimum: 10 }
                    }
                },
                pricing: {
                    bsonType: "object",
                    required: ["base_price_gtq"],
                    properties: {
                        base_price_gtq: { bsonType: "double", minimum: 1 },
                        price_per_kg: { bsonType: "double", minimum: 0 },
                        price_per_cm3: { bsonType: "double", minimum: 0 },
                        minimum_charge: { bsonType: "double", minimum: 0 },
                        maximum_charge: { bsonType: "double", minimum: 0 }
                    }
                },
                restrictions: {
                    bsonType: "object",
                    properties: {
                        fragile_allowed: { bsonType: "bool", default: true },
                        liquids_allowed: { bsonType: "bool", default: false },
                        hazardous_allowed: { bsonType: "bool", default: false },
                        high_value_allowed: { bsonType: "bool", default: true },
                        international_allowed: { bsonType: "bool", default: false },
                        prohibited_items: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        },
                        special_handling: {
                            bsonType: "array",
                            items: {
                                bsonType: "string",
                                enum: ["fragile", "refrigerated", "upright_only", "two_person_lift"]
                            }
                        }
                    }
                },
                delivery_options: {
                    bsonType: "object",
                    properties: {
                        standard_delivery: { bsonType: "bool", default: true },
                        express_delivery: { bsonType: "bool", default: true },
                        overnight_delivery: { bsonType: "bool", default: false },
                        same_day_delivery: { bsonType: "bool", default: false },
                        min_delivery_days: { bsonType: "int", minimum: 1, maximum: 30 },
                        max_delivery_days: { bsonType: "int", minimum: 1, maximum: 30 }
                    }
                },
                insurance: {
                    bsonType: "object",
                    properties: {
                        included_coverage_gtq: { bsonType: "double", minimum: 0 },
                        max_coverage_gtq: { bsonType: "double", minimum: 0 },
                        insurance_rate_percent: { bsonType: "double", minimum: 0, maximum: 10 },
                        mandatory_insurance: { bsonType: "bool", default: false }
                    }
                },
                tracking: {
                    bsonType: "object",
                    properties: {
                        tracking_included: { bsonType: "bool", default: true },
                        real_time_tracking: { bsonType: "bool", default: false },
                        delivery_confirmation: { bsonType: "bool", default: true },
                        signature_required: { bsonType: "bool", default: false },
                        photo_proof: { bsonType: "bool", default: false }
                    }
                },
                icon: {
                    bsonType: "string",
                    maxLength: 100,
                    description: "Nombre del icono para mostrar en UI"
                },
                color: {
                    bsonType: "string",
                    pattern: "^#[0-9A-Fa-f]{6}$",
                    description: "Color hexadecimal para UI"
                },
                sort_order: {
                    bsonType: "int",
                    minimum: 0,
                    default: 100,
                    description: "Orden para mostrar en UI"
                },
                active: {
                    bsonType: "bool",
                    default: true
                },
                available_regions: {
                    bsonType: "array",
                    items: { bsonType: "string" },
                    description: "Regiones donde está disponible este tipo"
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "objectId" }
            }
        }
    }
};

/**
 * 💰 ESQUEMA DE CONFIGURACIÓN DE PRECIOS
 */
const PricingConfigSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "type", "rules"],
            properties: {
                name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 100,
                    description: "Nombre de la configuración de precios"
                },
                type: {
                    bsonType: "string",
                    enum: ["base_pricing", "distance_pricing", "weight_pricing", "volume_pricing", "service_pricing"],
                    description: "Tipo de configuración de precios"
                },
                description: {
                    bsonType: "string",
                    maxLength: 500,
                    description: "Descripción de la configuración"
                },
                rules: {
                    bsonType: "object",
                    properties: {
                        base_rates: {
                            bsonType: "object",
                            properties: {
                                local_delivery: { bsonType: "double", minimum: 0 },
                                regional_delivery: { bsonType: "double", minimum: 0 },
                                national_delivery: { bsonType: "double", minimum: 0 },
                                remote_delivery: { bsonType: "double", minimum: 0 }
                            }
                        },
                        distance_tiers: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                required: ["min_km", "max_km", "rate_per_km"],
                                properties: {
                                    tier_name: { bsonType: "string" },
                                    min_km: { bsonType: "double", minimum: 0 },
                                    max_km: { bsonType: "double", minimum: 0 },
                                    rate_per_km: { bsonType: "double", minimum: 0 },
                                    flat_rate: { bsonType: "double", minimum: 0 }
                                }
                            }
                        },
                        weight_tiers: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                required: ["min_kg", "max_kg", "rate_per_kg"],
                                properties: {
                                    tier_name: { bsonType: "string" },
                                    min_kg: { bsonType: "double", minimum: 0 },
                                    max_kg: { bsonType: "double", minimum: 0 },
                                    rate_per_kg: { bsonType: "double", minimum: 0 },
                                    flat_rate: { bsonType: "double", minimum: 0 }
                                }
                            }
                        },
                        volume_pricing: {
                            bsonType: "object",
                            properties: {
                                rate_per_cm3: { bsonType: "double", minimum: 0 },
                                volumetric_weight_factor: { bsonType: "double", minimum: 0, default: 5000 },
                                min_volumetric_charge: { bsonType: "double", minimum: 0 }
                            }
                        },
                        service_multipliers: {
                            bsonType: "object",
                            properties: {
                                standard: { bsonType: "double", minimum: 0.5, maximum: 3, default: 1 },
                                express: { bsonType: "double", minimum: 1, maximum: 5, default: 1.5 },
                                overnight: { bsonType: "double", minimum: 1.5, maximum: 10, default: 3 },
                                same_day: { bsonType: "double", minimum: 2, maximum: 15, default: 5 },
                                economy: { bsonType: "double", minimum: 0.3, maximum: 1, default: 0.8 }
                            }
                        },
                        surcharges: {
                            bsonType: "object",
                            properties: {
                                fuel_surcharge_percent: { bsonType: "double", minimum: 0, maximum: 50 },
                                remote_area_surcharge: { bsonType: "double", minimum: 0 },
                                residential_surcharge: { bsonType: "double", minimum: 0 },
                                oversized_surcharge: { bsonType: "double", minimum: 0 },
                                fragile_handling_fee: { bsonType: "double", minimum: 0 },
                                hazardous_materials_fee: { bsonType: "double", minimum: 0 }
                            }
                        },
                        discounts: {
                            bsonType: "object",
                            properties: {
                                volume_discounts: {
                                    bsonType: "array",
                                    items: {
                                        bsonType: "object",
                                        properties: {
                                            min_shipments: { bsonType: "int", minimum: 1 },
                                            discount_percent: { bsonType: "double", minimum: 0, maximum: 50 }
                                        }
                                    }
                                },
                                loyalty_discount_percent: { bsonType: "double", minimum: 0, maximum: 30 },
                                new_customer_discount: { bsonType: "double", minimum: 0 }
                            }
                        }
                    }
                },
                currency: {
                    bsonType: "string",
                    enum: ["GTQ", "USD"],
                    default: "GTQ"
                },
                effective_date: {
                    bsonType: "date",
                    description: "Fecha desde cuando es efectiva esta configuración"
                },
                expiry_date: {
                    bsonType: "date",
                    description: "Fecha hasta cuando es válida esta configuración"
                },
                regions: {
                    bsonType: "array",
                    items: { bsonType: "string" },
                    description: "Regiones donde aplica esta configuración"
                },
                customer_types: {
                    bsonType: "array",
                    items: {
                        bsonType: "string",
                        enum: ["individual", "business", "corporate", "government"]
                    },
                    description: "Tipos de cliente para los que aplica"
                },
                active: {
                    bsonType: "bool",
                    default: true
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "objectId" },
                approved_by: { bsonType: "objectId" },
                approval_date: { bsonType: "date" }
            }
        }
    }
};

/**
 * 🚚 ESQUEMA DE TARIFAS DE ENVÍO
 */
const ShippingRateSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["origin_zone", "destination_zone", "service_type", "rates"],
            properties: {
                origin_zone: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Zona de origen (departamento/región)"
                },
                destination_zone: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Zona de destino (departamento/región)"
                },
                service_type: {
                    bsonType: "string",
                    enum: ["standard", "express", "overnight", "same_day", "economy"],
                    description: "Tipo de servicio"
                },
                distance_range: {
                    bsonType: "object",
                    properties: {
                        min_km: { bsonType: "double", minimum: 0 },
                        max_km: { bsonType: "double", minimum: 0 }
                    }
                },
                rates: {
                    bsonType: "object",
                    required: ["base_rate"],
                    properties: {
                        base_rate: { bsonType: "double", minimum: 0 },
                        per_kg_rate: { bsonType: "double", minimum: 0 },
                        per_km_rate: { bsonType: "double", minimum: 0 },
                        minimum_charge: { bsonType: "double", minimum: 0 },
                        maximum_charge: { bsonType: "double", minimum: 0 }
                    }
                },
                delivery_time: {
                    bsonType: "object",
                    properties: {
                        min_days: { bsonType: "int", minimum: 1, maximum: 30 },
                        max_days: { bsonType: "int", minimum: 1, maximum: 30 },
                        business_days_only: { bsonType: "bool", default: true },
                        cutoff_time: { bsonType: "string", pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" }
                    }
                },
                restrictions: {
                    bsonType: "object",
                    properties: {
                        max_weight_kg: { bsonType: "double", minimum: 0 },
                        max_dimensions_cm: {
                            bsonType: "object",
                            properties: {
                                length: { bsonType: "double", minimum: 0 },
                                width: { bsonType: "double", minimum: 0 },
                                height: { bsonType: "double", minimum: 0 }
                            }
                        },
                        excluded_postal_codes: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        },
                        seasonal_restrictions: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                properties: {
                                    start_date: { bsonType: "string", pattern: "^[0-9]{2}-[0-9]{2}$" },
                                    end_date: { bsonType: "string", pattern: "^[0-9]{2}-[0-9]{2}$" },
                                    restriction_type: { bsonType: "string" },
                                    additional_days: { bsonType: "int", minimum: 0 }
                                }
                            }
                        }
                    }
                },
                surcharges: {
                    bsonType: "object",
                    properties: {
                        fuel_surcharge: { bsonType: "double", minimum: 0 },
                        remote_area_fee: { bsonType: "double", minimum: 0 },
                        handling_fee: { bsonType: "double", minimum: 0 },
                        insurance_rate: { bsonType: "double", minimum: 0, maximum: 10 }
                    }
                },
                active: {
                    bsonType: "bool",
                    default: true
                },
                effective_date: { bsonType: "date" },
                expiry_date: { bsonType: "date" },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "objectId" }
            }
        }
    }
};

/**
 * 🔧 ESQUEMA DE TIPOS DE SERVICIO
 */
const ServiceTypeSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["code", "name", "category", "delivery_commitment"],
            properties: {
                code: {
                    bsonType: "string",
                    pattern: "^[A-Z_]+$",
                    minLength: 2,
                    maxLength: 20,
                    description: "Código único del servicio"
                },
                name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 100,
                    description: "Nombre del servicio"
                },
                display_name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 100,
                    description: "Nombre para mostrar al cliente"
                },
                description: {
                    bsonType: "string",
                    minLength: 10,
                    maxLength: 500,
                    description: "Descripción detallada del servicio"
                },
                category: {
                    bsonType: "string",
                    enum: ["economy", "standard", "express", "premium", "specialized"],
                    description: "Categoría del servicio"
                },
                delivery_commitment: {
                    bsonType: "object",
                    required: ["min_days", "max_days"],
                    properties: {
                        min_days: { bsonType: "int", minimum: 1, maximum: 30 },
                        max_days: { bsonType: "int", minimum: 1, maximum: 30 },
                        guaranteed: { bsonType: "bool", default: false },
                        money_back_guarantee: { bsonType: "bool", default: false },
                        time_definite: { bsonType: "bool", default: false },
                        cutoff_time: { bsonType: "string" },
                        weekend_delivery: { bsonType: "bool", default: false },
                        holiday_delivery: { bsonType: "bool", default: false }
                    }
                },
                features: {
                    bsonType: "object",
                    properties: {
                        tracking: { bsonType: "bool", default: true },
                        insurance_included: { bsonType: "bool", default: false },
                        signature_required: { bsonType: "bool", default: false },
                        proof_of_delivery: { bsonType: "bool", default: true },
                        real_time_updates: { bsonType: "bool", default: false },
                        sms_notifications: { bsonType: "bool", default: false },
                        email_notifications: { bsonType: "bool", default: true },
                        delivery_window: { bsonType: "bool", default: false },
                        scheduled_delivery: { bsonType: "bool", default: false }
                    }
                },
                pricing_model: {
                    bsonType: "object",
                    properties: {
                        base_multiplier: { bsonType: "double", minimum: 0.1, maximum: 10 },
                        distance_factor: { bsonType: "double", minimum: 0, maximum: 5 },
                        weight_factor: { bsonType: "double", minimum: 0, maximum: 3 },
                        volume_factor: { bsonType: "double", minimum: 0, maximum: 3 },
                        minimum_charge: { bsonType: "double", minimum: 0 }
                    }
                },
                availability: {
                    bsonType: "object",
                    properties: {
                        regions: {
                            bsonType: "array",
                            items: { bsonType: "string" },
                            description: "Regiones donde está disponible"
                        },
                        cities: {
                            bsonType: "array",
                            items: { bsonType: "string" },
                            description: "Ciudades específicas donde está disponible"
                        },
                        postal_codes: {
                            bsonType: "array",
                            items: { bsonType: "string" },
                            description: "Códigos postales donde está disponible"
                        },
                        max_distance_km: { bsonType: "double", minimum: 0 },
                        international: { bsonType: "bool", default: false }
                    }
                },
                restrictions: {
                    bsonType: "object",
                    properties: {
                        max_weight_kg: { bsonType: "double", minimum: 0 },
                        max_value_gtq: { bsonType: "double", minimum: 0 },
                        prohibited_items: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        },
                        special_handling_required: {
                            bsonType: "array",
                            items: { bsonType: "string" }
                        },
                        age_restrictions: { bsonType: "bool", default: false },
                        business_address_only: { bsonType: "bool", default: false }
                    }
                },
                icon: { bsonType: "string", maxLength: 100 },
                color: { bsonType: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
                sort_order: { bsonType: "int", minimum: 0, default: 100 },
                active: { bsonType: "bool", default: true },
                featured: { bsonType: "bool", default: false },
                popular: { bsonType: "bool", default: false },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" },
                created_by: { bsonType: "objectId" }
            }
        }
    }
};

// Exportar esquemas
module.exports = {
    PackageTypeSchema,
    PricingConfigSchema,
    ShippingRateSchema,
    ServiceTypeSchema
};