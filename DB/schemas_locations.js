/**
 * 🗺️ ESQUEMAS DE UBICACIONES DE GUATEMALA
 * Sistema de Gestión de Envíos DsEnvios
 * 
 * Este archivo define los esquemas para departments, municipalities, 
 * villages y address_cache específicamente para Guatemala.
 */

const { ObjectId } = require('mongodb');

/**
 * 🏛️ ESQUEMA DE DEPARTAMENTOS
 */
const DepartmentSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "code", "region"],
            properties: {
                name: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Nombre del departamento"
                },
                code: {
                    bsonType: "string",
                    pattern: "^[A-Z]{2,3}$",
                    description: "Código del departamento (2-3 letras)"
                },
                region: {
                    bsonType: "string",
                    enum: [
                        "Metropolitana", "Norte", "Nororiente", "Suroriente", 
                        "Central", "Suroccidente", "Noroccidente", "Petén"
                    ],
                    description: "Región geográfica de Guatemala"
                },
                area_km2: {
                    bsonType: "double",
                    minimum: 0,
                    description: "Área en kilómetros cuadrados"
                },
                population: {
                    bsonType: "int",
                    minimum: 0,
                    description: "Población estimada"
                },
                capital: {
                    bsonType: "string",
                    maxLength: 100,
                    description: "Municipio capital del departamento"
                },
                coordinates: {
                    bsonType: "object",
                    properties: {
                        lat: { 
                            bsonType: "double", 
                            minimum: 13.5, 
                            maximum: 18.0,
                            description: "Latitud centro del departamento"
                        },
                        lng: { 
                            bsonType: "double", 
                            minimum: -92.5, 
                            maximum: -88.0,
                            description: "Longitud centro del departamento"
                        }
                    }
                },
                boundaries: {
                    bsonType: "object",
                    properties: {
                        north: { bsonType: "double" },
                        south: { bsonType: "double" },
                        east: { bsonType: "double" },
                        west: { bsonType: "double" }
                    },
                    description: "Límites geográficos del departamento"
                },
                municipalities_count: {
                    bsonType: "int",
                    minimum: 1,
                    description: "Número de municipios"
                },
                shipping_zones: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            zone_name: { bsonType: "string" },
                            zone_type: { bsonType: "string", enum: ["urban", "suburban", "rural", "remote"] },
                            base_delivery_days: { bsonType: "int", minimum: 1 },
                            additional_cost: { bsonType: "double", minimum: 0 }
                        }
                    }
                },
                active: {
                    bsonType: "bool",
                    default: true,
                    description: "Si el departamento está activo para envíos"
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
};

/**
 * 🏘️ ESQUEMA DE MUNICIPIOS
 */
const MunicipalitySchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "department", "department_code"],
            properties: {
                name: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Nombre del municipio"
                },
                department: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Nombre del departamento al que pertenece"
                },
                department_code: {
                    bsonType: "string",
                    pattern: "^[A-Z]{2,3}$",
                    description: "Código del departamento"
                },
                code: {
                    bsonType: "string",
                    pattern: "^[A-Z]{2,3}-[0-9]{2,3}$",
                    description: "Código del municipio (DEPT-NUM)"
                },
                area_km2: {
                    bsonType: "double",
                    minimum: 0,
                    description: "Área en kilómetros cuadrados"
                },
                population: {
                    bsonType: "int",
                    minimum: 0,
                    description: "Población estimada"
                },
                altitude_meters: {
                    bsonType: "int",
                    minimum: 0,
                    maximum: 5000,
                    description: "Altitud sobre el nivel del mar"
                },
                coordinates: {
                    bsonType: "object",
                    properties: {
                        lat: { 
                            bsonType: "double", 
                            minimum: 13.5, 
                            maximum: 18.0
                        },
                        lng: { 
                            bsonType: "double", 
                            minimum: -92.5, 
                            maximum: -88.0
                        }
                    }
                },
                boundaries: {
                    bsonType: "object",
                    properties: {
                        north: { bsonType: "double" },
                        south: { bsonType: "double" },
                        east: { bsonType: "double" },
                        west: { bsonType: "double" }
                    }
                },
                municipality_type: {
                    bsonType: "string",
                    enum: ["urban", "suburban", "rural", "indigenous"],
                    description: "Tipo de municipio"
                },
                villages_count: {
                    bsonType: "int",
                    minimum: 0,
                    description: "Número de aldeas/poblados"
                },
                postal_codes: {
                    bsonType: "array",
                    items: {
                        bsonType: "string",
                        pattern: "^[0-9]{5}$"
                    },
                    description: "Códigos postales del municipio"
                },
                delivery_info: {
                    bsonType: "object",
                    properties: {
                        delivery_zone: { 
                            bsonType: "string", 
                            enum: ["zone_1", "zone_2", "zone_3", "zone_4", "zone_special"] 
                        },
                        base_delivery_time: { bsonType: "int", minimum: 1, maximum: 30 },
                        delivery_difficulty: { 
                            bsonType: "string", 
                            enum: ["easy", "moderate", "difficult", "very_difficult"] 
                        },
                        access_roads: { 
                            bsonType: "string", 
                            enum: ["paved", "gravel", "dirt", "4x4_required"] 
                        },
                        special_instructions: { bsonType: "string", maxLength: 500 },
                        additional_delivery_cost: { bsonType: "double", minimum: 0 }
                    }
                },
                climate: {
                    bsonType: "string",
                    enum: ["tropical", "temperate", "cold", "very_cold"],
                    description: "Clima predominante"
                },
                languages: {
                    bsonType: "array",
                    items: {
                        bsonType: "string",
                        enum: [
                            "español", "k'iche'", "kaqchikel", "mam", "q'eqchi'", 
                            "poqomchi'", "tz'utujil", "ixil", "akateko", "popti'",
                            "ch'orti'", "chuj", "awakateko", "sakapulteko",
                            "sipakapense", "uspanteko", "tektiteko", "mopan",
                            "itza'", "xinka", "garífuna"
                        ]
                    },
                    description: "Idiomas hablados en el municipio"
                },
                economic_activities: {
                    bsonType: "array",
                    items: {
                        bsonType: "string",
                        enum: [
                            "agricultura", "ganadería", "comercio", "turismo", 
                            "industria", "artesanías", "pesca", "minería"
                        ]
                    }
                },
                active: {
                    bsonType: "bool",
                    default: true,
                    description: "Si el municipio está activo para envíos"
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
};

/**
 * 🏡 ESQUEMA DE ALDEAS/POBLADOS
 */
const VillageSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "municipality", "department"],
            properties: {
                name: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Nombre de la aldea/poblado"
                },
                municipality: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Municipio al que pertenece"
                },
                department: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 100,
                    description: "Departamento al que pertenece"
                },
                type: {
                    bsonType: "string",
                    enum: [
                        "aldea", "caserío", "cantón", "colonia", "barrio", 
                        "zona", "parcelamiento", "finca", "cooperativa", 
                        "asentamiento", "lotificación"
                    ],
                    description: "Tipo de poblado"
                },
                population: {
                    bsonType: "int",
                    minimum: 0,
                    description: "Población estimada"
                },
                coordinates: {
                    bsonType: "object",
                    properties: {
                        lat: { 
                            bsonType: "double", 
                            minimum: 13.5, 
                            maximum: 18.0
                        },
                        lng: { 
                            bsonType: "double", 
                            minimum: -92.5, 
                            maximum: -88.0
                        }
                    }
                },
                postal_code: {
                    bsonType: "string",
                    pattern: "^[0-9]{5}$",
                    description: "Código postal"
                },
                delivery_info: {
                    bsonType: "object",
                    properties: {
                        accessible_by_vehicle: { bsonType: "bool", default: true },
                        road_condition: { 
                            bsonType: "string", 
                            enum: ["excellent", "good", "fair", "poor", "very_poor"] 
                        },
                        delivery_point: {
                            bsonType: "object",
                            properties: {
                                type: { 
                                    bsonType: "string", 
                                    enum: ["door_to_door", "collection_point", "municipal_office", "store"] 
                                },
                                address: { bsonType: "string", maxLength: 200 },
                                contact_person: { bsonType: "string", maxLength: 100 },
                                contact_phone: { bsonType: "string" },
                                operating_hours: { bsonType: "string", maxLength: 100 }
                            }
                        },
                        estimated_delivery_time: { bsonType: "int", minimum: 1, maximum: 30 },
                        additional_cost: { bsonType: "double", minimum: 0 },
                        special_requirements: { bsonType: "string", maxLength: 500 },
                        last_delivery_update: { bsonType: "date" }
                    }
                },
                landmarks: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            name: { bsonType: "string", maxLength: 100 },
                            type: { 
                                bsonType: "string", 
                                enum: ["church", "school", "store", "bridge", "river", "mountain", "road"] 
                            },
                            description: { bsonType: "string", maxLength: 200 }
                        }
                    },
                    description: "Puntos de referencia conocidos"
                },
                services: {
                    bsonType: "object",
                    properties: {
                        electricity: { bsonType: "bool", default: false },
                        water: { bsonType: "bool", default: false },
                        phone_coverage: { bsonType: "bool", default: false },
                        internet: { bsonType: "bool", default: false },
                        health_center: { bsonType: "bool", default: false },
                        school: { bsonType: "bool", default: false },
                        post_office: { bsonType: "bool", default: false }
                    }
                },
                distance_to_municipality: {
                    bsonType: "double",
                    minimum: 0,
                    description: "Distancia en kilómetros al centro del municipio"
                },
                active: {
                    bsonType: "bool",
                    default: true,
                    description: "Si la aldea está activa para envíos"
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
};

/**
 * 🗃️ ESQUEMA DE CACHE DE DIRECCIONES
 */
const AddressCacheSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["origin", "destination", "distance_info"],
            properties: {
                origin: {
                    bsonType: "object",
                    required: ["address"],
                    properties: {
                        address: { bsonType: "string", minLength: 5, maxLength: 300 },
                        department: { bsonType: "string", maxLength: 100 },
                        municipality: { bsonType: "string", maxLength: 100 },
                        village: { bsonType: "string", maxLength: 100 },
                        coordinates: {
                            bsonType: "object",
                            properties: {
                                lat: { bsonType: "double" },
                                lng: { bsonType: "double" }
                            }
                        },
                        normalized: { bsonType: "string", maxLength: 300 }
                    }
                },
                destination: {
                    bsonType: "object",
                    required: ["address"],
                    properties: {
                        address: { bsonType: "string", minLength: 5, maxLength: 300 },
                        department: { bsonType: "string", maxLength: 100 },
                        municipality: { bsonType: "string", maxLength: 100 },
                        village: { bsonType: "string", maxLength: 100 },
                        coordinates: {
                            bsonType: "object",
                            properties: {
                                lat: { bsonType: "double" },
                                lng: { bsonType: "double" }
                            }
                        },
                        normalized: { bsonType: "string", maxLength: 300 }
                    }
                },
                distance_info: {
                    bsonType: "object",
                    required: ["distance_km"],
                    properties: {
                        distance_km: { bsonType: "double", minimum: 0 },
                        estimated_duration_minutes: { bsonType: "int", minimum: 1 },
                        route_type: { 
                            bsonType: "string", 
                            enum: ["urban", "suburban", "rural", "remote", "international"] 
                        },
                        road_conditions: { 
                            bsonType: "string", 
                            enum: ["excellent", "good", "fair", "poor", "very_poor"] 
                        },
                        difficulty_level: { 
                            bsonType: "string", 
                            enum: ["easy", "moderate", "difficult", "very_difficult"] 
                        },
                        seasonal_restrictions: {
                            bsonType: "array",
                            items: {
                                bsonType: "string",
                                enum: ["rainy_season", "dry_season", "winter", "flooding", "landslides"]
                            }
                        }
                    }
                },
                google_maps_data: {
                    bsonType: "object",
                    properties: {
                        route_found: { bsonType: "bool" },
                        api_response: { bsonType: "object" },
                        last_updated: { bsonType: "date" }
                    }
                },
                pricing_cache: {
                    bsonType: "object",
                    properties: {
                        base_cost: { bsonType: "double", minimum: 0 },
                        distance_multiplier: { bsonType: "double", minimum: 0 },
                        difficulty_multiplier: { bsonType: "double", minimum: 1 },
                        last_calculated: { bsonType: "date" }
                    }
                },
                usage_stats: {
                    bsonType: "object",
                    properties: {
                        lookup_count: { bsonType: "int", minimum: 0, default: 1 },
                        last_used: { bsonType: "date" },
                        successful_deliveries: { bsonType: "int", minimum: 0, default: 0 },
                        failed_deliveries: { bsonType: "int", minimum: 0, default: 0 }
                    }
                },
                expires_at: {
                    bsonType: "date",
                    description: "Fecha de expiración del cache"
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
};

/**
 * 📍 ESQUEMA DE DIRECCIONES FRECUENTES
 */
const FrequentAddressSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["user_id", "address", "type"],
            properties: {
                user_id: { bsonType: "objectId", description: "ID del usuario" },
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
                },
                type: {
                    bsonType: "string",
                    enum: ["home", "work", "business", "family", "friend", "other"],
                    description: "Tipo de dirección"
                },
                alias: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 50,
                    description: "Nombre personalizado para la dirección"
                },
                contact_person: {
                    bsonType: "object",
                    properties: {
                        name: { bsonType: "string", maxLength: 100 },
                        phone: { bsonType: "string" },
                        relationship: { bsonType: "string", maxLength: 50 }
                    }
                },
                usage_count: {
                    bsonType: "int",
                    minimum: 0,
                    default: 0,
                    description: "Número de veces que se ha usado"
                },
                last_used: {
                    bsonType: "date",
                    description: "Última vez que se usó la dirección"
                },
                verified: {
                    bsonType: "bool",
                    default: false,
                    description: "Si la dirección ha sido verificada"
                },
                verification_date: { bsonType: "date" },
                delivery_notes: {
                    bsonType: "string",
                    maxLength: 500,
                    description: "Notas especiales para entrega"
                },
                active: {
                    bsonType: "bool",
                    default: true
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    }
};

// Exportar esquemas
module.exports = {
    DepartmentSchema,
    MunicipalitySchema,
    VillageSchema,
    AddressCacheSchema,
    FrequentAddressSchema
};