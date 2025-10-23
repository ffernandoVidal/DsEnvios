// ========================================
// SCRIPT DE INICIALIZACIÓN MONGODB
// Base de Datos: enviosdb1
// Sistema: DsEnvios - Formulario Realizar Envío
// ========================================

// Conectar a la base de datos
use enviosdb1;

// ========================================
// 1. DEPARTAMENTOS DE GUATEMALA (22 total)
// ========================================
db.departments.insertMany([
  {
    code: "01",
    name: "Guatemala",
    region: "Central",
    shipping_zone: "A",
    delivery_base_cost: 25.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "02", 
    name: "El Progreso",
    region: "Norte",
    shipping_zone: "B", 
    delivery_base_cost: 35.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "03",
    name: "Sacatepéquez", 
    region: "Central",
    shipping_zone: "A",
    delivery_base_cost: 30.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "04",
    name: "Chimaltenango",
    region: "Central", 
    shipping_zone: "B",
    delivery_base_cost: 35.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "05",
    name: "Escuintla",
    region: "Sur",
    shipping_zone: "B", 
    delivery_base_cost: 40.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "06",
    name: "Santa Rosa",
    region: "Sur",
    shipping_zone: "C",
    delivery_base_cost: 45.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "07", 
    name: "Sololá",
    region: "Occidente",
    shipping_zone: "C",
    delivery_base_cost: 50.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "08",
    name: "Totonicapán",
    region: "Occidente",
    shipping_zone: "C", 
    delivery_base_cost: 55.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "09",
    name: "Quetzaltenango", 
    region: "Occidente",
    shipping_zone: "B",
    delivery_base_cost: 45.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "10",
    name: "Suchitepéquez",
    region: "Sur",
    shipping_zone: "C",
    delivery_base_cost: 50.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "11",
    name: "Retalhuleu", 
    region: "Sur",
    shipping_zone: "C",
    delivery_base_cost: 55.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "12",
    name: "San Marcos",
    region: "Occidente",
    shipping_zone: "C",
    delivery_base_cost: 60.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "13",
    name: "Huehuetenango",
    region: "Norte", 
    shipping_zone: "D",
    delivery_base_cost: 65.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "14",
    name: "Quiché",
    region: "Norte",
    shipping_zone: "D",
    delivery_base_cost: 70.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "15",
    name: "Baja Verapaz",
    region: "Norte",
    shipping_zone: "C",
    delivery_base_cost: 55.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "16", 
    name: "Alta Verapaz",
    region: "Norte",
    shipping_zone: "D",
    delivery_base_cost: 65.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "17",
    name: "Petén",
    region: "Norte",
    shipping_zone: "D",
    delivery_base_cost: 75.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "18",
    name: "Izabal",
    region: "Oriente",
    shipping_zone: "C",
    delivery_base_cost: 55.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "19",
    name: "Zacapa",
    region: "Oriente",
    shipping_zone: "C",
    delivery_base_cost: 50.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "20",
    name: "Chiquimula",
    region: "Oriente", 
    shipping_zone: "C",
    delivery_base_cost: 55.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "21",
    name: "Jalapa",
    region: "Oriente",
    shipping_zone: "C",
    delivery_base_cost: 50.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "22",
    name: "Jutiapa",
    region: "Sur",
    shipping_zone: "C",
    delivery_base_cost: 55.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// ========================================
// 2. TIPOS DE PAQUETE
// ========================================
db.package_types.insertMany([
  {
    code: "ENVELOPE",
    name: "Sobre",
    displayName: "Pequeño",
    description: "Ideal para documentos y objetos pequeños",
    max_weight: 0.5,
    max_length: 30,
    max_width: 25, 
    max_height: 2,
    base_price: 15.00,
    price_per_kg: 25.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "SMALL_BOX",
    name: "Paquete Pequeño", 
    displayName: "Mediano",
    description: "Perfecto para ropa y objetos medianos",
    max_weight: 2.0,
    max_length: 20,
    max_width: 15,
    max_height: 10,
    base_price: 25.00,
    price_per_kg: 30.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "MEDIUM_BOX",
    name: "Paquete Mediano",
    displayName: "Grande", 
    description: "Para electrodomésticos pequeños y objetos pesados",
    max_weight: 5.0,
    max_length: 30,
    max_width: 25,
    max_height: 20,
    base_price: 35.00,
    price_per_kg: 35.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "LARGE_BOX",
    name: "Paquete Grande",
    displayName: "Extra Grande",
    description: "Para objetos voluminosos y múltiples artículos",
    max_weight: 10.0,
    max_length: 50,
    max_width: 40,
    max_height: 30,
    base_price: 50.00,
    price_per_kg: 40.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "EXTRA_LARGE",
    name: "Paquete Extra Grande",
    displayName: "Jumbo", 
    description: "Para envíos especiales y carga pesada",
    max_weight: 20.0,
    max_length: 80,
    max_width: 60,
    max_height: 50,
    base_price: 75.00,
    price_per_kg: 45.00,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// ========================================
// 3. MÉTODOS DE PAGO
// ========================================
db.payment_methods.insertMany([
  {
    code: "CASH",
    name: "Efectivo",
    display_name: "Pago en Efectivo",
    type: "cash",
    processor: "internal",
    active: true,
    test_mode: false,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "VISA", 
    name: "Visa",
    display_name: "Tarjeta Visa",
    type: "card",
    processor: "visa",
    active: true,
    test_mode: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "MASTERCARD",
    name: "Mastercard",
    display_name: "Tarjeta Mastercard",
    type: "card",
    processor: "mastercard",
    active: true,
    test_mode: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "BANRURAL",
    name: "Banrural",
    display_name: "Transferencia Banrural", 
    type: "bank_transfer",
    processor: "banrural",
    active: true,
    test_mode: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "BAC",
    name: "BAC",
    display_name: "Transferencia BAC",
    type: "bank_transfer", 
    processor: "bac",
    active: true,
    test_mode: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// ========================================
// 4. TIPOS DE SERVICIO
// ========================================
db.service_types.insertMany([
  {
    code: "STANDARD",
    name: "Estándar",
    description: "Entrega en 3-5 días hábiles",
    delivery_time_min: 3,
    delivery_time_max: 5,
    price_multiplier: 1.0,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "EXPRESS", 
    name: "Express",
    description: "Entrega en 1-2 días hábiles",
    delivery_time_min: 1,
    delivery_time_max: 2,
    price_multiplier: 1.5,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "OVERNIGHT",
    name: "Overnight",
    description: "Entrega al siguiente día hábil",
    delivery_time_min: 1,
    delivery_time_max: 1,
    price_multiplier: 2.0,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    code: "ECONOMY",
    name: "Económico",
    description: "Entrega en 5-7 días hábiles",
    delivery_time_min: 5,
    delivery_time_max: 7,
    price_multiplier: 0.8,
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// ========================================
// 5. CONFIGURACIÓN DE PRECIOS BASE
// ========================================
db.pricing_config.insertMany([
  {
    service_type: "STANDARD",
    base_price: 25.00,
    weight_factor: 1.0,
    distance_factor: 1.0,
    zone_multipliers: {
      "A-A": 1.0,
      "A-B": 1.2, 
      "A-C": 1.5,
      "A-D": 2.0,
      "B-B": 1.1,
      "B-C": 1.3,
      "B-D": 1.8,
      "C-C": 1.2,
      "C-D": 1.6,
      "D-D": 1.4
    },
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// ========================================
// 6. VERIFICAR INSERCIÓN
// ========================================
print("=== RESUMEN DE INSERCIÓN ===");
print("Departamentos insertados: " + db.departments.countDocuments());
print("Tipos de paquete insertados: " + db.package_types.countDocuments());
print("Métodos de pago insertados: " + db.payment_methods.countDocuments());
print("Tipos de servicio insertados: " + db.service_types.countDocuments());
print("Configuración de precios insertada: " + db.pricing_config.countDocuments());
print("===============================");

// ========================================
// 7. CREAR ÍNDICES BÁSICOS
// ========================================
db.departments.createIndex({ "code": 1 }, { unique: true });
db.departments.createIndex({ "name": 1 });
db.package_types.createIndex({ "code": 1 }, { unique: true });
db.package_types.createIndex({ "active": 1 });
db.payment_methods.createIndex({ "code": 1 }, { unique: true });
db.payment_methods.createIndex({ "active": 1 });
db.service_types.createIndex({ "code": 1 }, { unique: true });
db.service_types.createIndex({ "active": 1 });

print("Índices creados exitosamente");
print("Base de datos lista para el formulario Realizar Envío");