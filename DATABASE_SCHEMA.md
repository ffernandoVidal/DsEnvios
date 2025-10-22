# 📊 ESQUEMA DE BASE DE DATOS - SISTEMA DE ENVÍOS DS ENVÍOS

## 🔗 ENTIDADES Y RELACIONES DE LA BASE DE DATOS

### 📋 DIAGRAMA DE ENTIDAD-RELACIÓN

```
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │     USERS       │   1:N │    SHIPMENTS    │   1:N │    TIMELINE     │
    │                 ├───────┤                 ├───────┤                 │
    │ - id (PK)       │       │ - _id (PK)      │       │ - status        │
    │ - username      │       │ - trackingNumber│       │ - timestamp     │
    │ - password      │       │ - status        │       │ - description   │
    │ - role          │       │ - createdBy (FK)│       │ - location      │
    │ - name          │       │ - sender        │       │ - updatedBy     │
    │ - email         │       │ - receiver      │       └─────────────────┘
    │ - createdAt     │       │ - package       │
    │ - isActive      │       │ - service       │
    └─────────────────┘       │ - payment       │
                              │ - addresses     │
                              │ - notes         │
                              │ - createdAt     │
                              │ - updatedAt     │
                              └─────────────────┘
                                       │
                                       │ 1:N
                                       ▼
                              ┌─────────────────┐
                              │   QUOTATIONS    │
                              │                 │
                              │ - _id (PK)      │
                              │ - shipmentId(FK)│
                              │ - basePrice     │
                              │ - finalPrice    │
                              │ - services      │
                              │ - validUntil    │
                              │ - createdAt     │
                              └─────────────────┘
```

---

## 🏗️ DEFINICIÓN DE COLECCIONES

### 1. 👥 COLECCIÓN: `users`

**Propósito**: Gestiona usuarios del sistema con diferentes roles y permisos.

```javascript
{
  _id: ObjectId("..."),
  id: "user001",                     // ID único del usuario
  username: "admin",                 // Nombre de usuario para login
  password: "hashedPassword123",     // Contraseña encriptada
  role: "admin",                     // Roles: admin, operator, user
  name: "Juan Pérez",               // Nombre completo
  email: "juan@dsenvios.com",       // Email de contacto
  phone: "+502 1234-5678",          // Teléfono opcional
  isActive: true,                   // Estado activo/inactivo
  permissions: [                    // Permisos específicos
    "create_shipments",
    "view_all_shipments",
    "update_shipment_status",
    "manage_users"
  ],
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),
  lastLogin: ISODate("2024-01-20T14:22:00Z")
}
```

**Índices**:
- `{ "username": 1 }` - UNIQUE
- `{ "email": 1 }` - UNIQUE
- `{ "role": 1 }`
- `{ "isActive": 1 }`

---

### 2. 📦 COLECCIÓN: `shipments`

**Propósito**: Registro completo de envíos con validación y control por roles.

```javascript
{
  _id: ObjectId("..."),
  trackingNumber: "DS1697875234001",     // Número único de seguimiento
  status: "in-transit",                  // Estados del envío
  
  // Información de creación y permisos
  createdBy: "user001",                  // ID del usuario que creó
  createdByRole: "operator",             // Rol del creador
  createdByName: "María González",       // Nombre del creador
  
  // Datos del remitente
  sender: {
    name: "Juan Pérez",
    phone: "+502 1234-5678",
    email: "juan@example.com",           // Opcional
    document: {
      type: "DPI",                       // DPI, NIT, Passport
      number: "1234567890123"
    },
    address: {
      department: "Guatemala",
      municipality: "Guatemala",
      zone: "Zona 10",
      address: "Calle Principal 123",
      reference: "Edificio azul, 2do piso",
      coordinates: {                     // Opcional
        lat: 14.6349,
        lng: -90.5069
      }
    }
  },
  
  // Datos del destinatario
  receiver: {
    name: "Ana López",                   // * Campo obligatorio
    phone: "+502 9876-5432",           // * Campo obligatorio
    email: "ana@example.com",           // * Campo obligatorio
    reference: "casa",                  // * Campo obligatorio: casa, trabajo, gimnasio, escuela
    poblado: "Antigua Guatemala",       // * Campo obligatorio
    municipio: "Antigua Guatemala",     // * Campo obligatorio  
    departamento: "Sacatepéquez",       // * Campo obligatorio
    document: {                         // Opcional
      type: "DPI",
      number: "9876543210987"
    },
    address: {
      department: "Sacatepéquez",       // Mismo que departamento*
      municipality: "Antigua Guatemala", // Mismo que municipio*
      zone: "Centro",
      address: "Avenida Central 456",
      reference: "Casa verde con portón negro",
      coordinates: {                    // Opcional
        lat: 14.5589,
        lng: -90.7349
      }
    },
    // Integración con direcciones frecuentes
    frequentAddressId: ObjectId("..."), // ID si se usó dirección frecuente
    isFrequentAddress: true             // Indica si proviene de direcciones frecuentes
  },
  
  // Detalles del paquete
  package: {
    description: "Documentos importantes",
    weight: 2.5,                         // En kilogramos
    dimensions: {                        // En centímetros
      length: 30,
      width: 20,
      height: 10
    },
    volume: 6000,                        // Volumen en cm³
    value: 500.00,                       // Valor declarado en GTQ
    fragile: false,                      // Paquete frágil
    category: "documents",               // Categoría del contenido
    specialInstructions: "Manejar con cuidado"
  },
  
  // Configuración del servicio
  service: {
    type: "express",                     // standard, express, overnight, same-day
    deliverySpeed: "1-2 days",          // Tiempo estimado de entrega
    additionalServices: [                // Servicios adicionales
      "insurance",
      "signature_required",
      "packaging"
    ],
    pickupDate: ISODate("2024-01-20T08:00:00Z"),
    estimatedDelivery: ISODate("2024-01-22T18:00:00Z")
  },
  
  // Información de pago
  payment: {
    method: "contra_entrega",            // contra_entrega, cobro_cuenta, tarjeta_credito
    methodDisplayName: "Cobro contra entrega",
    amount: 79.50,                       // Precio final en GTQ (incluye cargos)
    breakdown: {
      basePrice: 50.00,
      serviceUpcharge: 15.00,            // Recargo por servicio express
      insurance: 10.00,
      packaging: 0.50,
      paymentMethodFee: 4.00             // Cargo por cobro contra entrega
    },
    status: "pending",                   // pending, paid, failed, refunded
    paidAt: null,                        // Fecha de pago
    receiptNumber: null,                 // Número de recibo
    paymentMethodId: "contra_entrega",   // Referencia al método de pago
    specialInstructions: "Cobrar exacto, sin cambio disponible"
  },
  
  // Información de distancia y ruta
  distance: {
    kilometers: 45.2,
    estimatedTime: "1 hour 15 minutes",
    route: "Guatemala -> Sacatepéquez via CA-1"
  },
  
  // Notas adicionales
  notes: "Entregar en horario de oficina únicamente",
  
  // Metadatos de seguimiento
  createdAt: ISODate("2024-01-20T10:30:00Z"),
  updatedAt: ISODate("2024-01-21T14:22:00Z"),
  
  // Línea de tiempo del envío (embedded)
  timeline: [
    {
      status: "pending",
      timestamp: ISODate("2024-01-20T10:30:00Z"),
      description: "Envío creado exitosamente",
      location: "Guatemala, Guatemala",
      updatedBy: "María González",
      automatic: false
    },
    {
      status: "confirmed",
      timestamp: ISODate("2024-01-20T11:00:00Z"),
      description: "Envío confirmado y programado para recolección",
      location: "Guatemala, Guatemala",
      updatedBy: "Sistema",
      automatic: true
    },
    {
      status: "picked-up",
      timestamp: ISODate("2024-01-20T14:30:00Z"),
      description: "Paquete recolectado exitosamente",
      location: "Guatemala, Guatemala",
      updatedBy: "Carlos Méndez - Conductor",
      automatic: false
    },
    {
      status: "in-transit",
      timestamp: ISODate("2024-01-21T08:00:00Z"),
      description: "En camino hacia destino",
      location: "En ruta Guatemala -> Sacatepéquez",
      updatedBy: "Sistema GPS",
      automatic: true
    }
  ]
}
```

**Estados permitidos del envío**:
- `pending`: Creado pero no confirmado
- `confirmed`: Confirmado y programado
- `picked-up`: Recolectado del origen
- `in-transit`: En camino al destino
- `out-for-delivery`: En reparto local
- `delivered`: Entregado exitosamente
- `failed-delivery`: Intento de entrega fallido
- `returned`: Devuelto al remitente
- `cancelled`: Cancelado por el usuario/empresa

**Índices**:
- `{ "trackingNumber": 1 }` - UNIQUE
- `{ "createdBy": 1 }`
- `{ "status": 1 }`
- `{ "createdAt": -1 }`
- `{ "sender.phone": 1 }`
- `{ "receiver.phone": 1 }`
- `{ "service.type": 1 }`

---

### 3. 💰 COLECCIÓN: `quotations`

**Propósito**: Cotizaciones y precios calculados para envíos.

```javascript
{
  _id: ObjectId("..."),
  quotationId: "QT2024012001",          // ID único de cotización
  shipmentId: ObjectId("..."),          // Referencia al envío (opcional)
  
  // Información del solicitante
  requestedBy: "user001",               // Usuario que solicitó
  requestedAt: ISODate("2024-01-20T10:15:00Z"),
  
  // Parámetros de cotización
  origin: {
    department: "Guatemala",
    municipality: "Guatemala",
    zone: "Zona 10"
  },
  destination: {
    department: "Sacatepéquez",
    municipality: "Antigua Guatemala",
    zone: "Centro"
  },
  
  // Detalles del paquete para cotización
  package: {
    weight: 2.5,
    dimensions: {
      length: 30,
      width: 20,
      height: 10
    },
    value: 500.00,
    fragile: false
  },
  
  // Cálculo de precios
  pricing: {
    basePrice: 50.00,                   // Precio base según peso/distancia
    distance: 45.2,                     // Kilómetros
    serviceOptions: [
      {
        type: "standard",
        price: 50.00,
        deliveryTime: "3-5 days"
      },
      {
        type: "express",
        price: 75.00,
        deliveryTime: "1-2 days"
      },
      {
        type: "overnight",
        price: 100.00,
        deliveryTime: "Next day"
      }
    ],
    additionalServices: [
      {
        name: "insurance",
        price: 10.00,
        description: "Seguro del 2% del valor declarado"
      },
      {
        name: "packaging",
        price: 0.50,
        description: "Empaque especializado"
      }
    ]
  },
  
  // Validez de la cotización
  validUntil: ISODate("2024-01-27T23:59:59Z"),  // 7 días de validez
  status: "active",                     // active, expired, used
  
  // Metadatos
  createdAt: ISODate("2024-01-20T10:15:00Z"),
  usedAt: null                          // Fecha cuando se usó la cotización
}
```

**Índices**:
- `{ "quotationId": 1 }` - UNIQUE
- `{ "shipmentId": 1 }`
- `{ "requestedBy": 1 }`
- `{ "validUntil": 1 }`
- `{ "status": 1 }`

---

### 4. 📍 COLECCIÓN: `frequent_addresses`

**Propósito**: Direcciones frecuentes de usuarios para facilitar la creación de envíos.

```javascript
{
  _id: ObjectId("..."),
  userId: "user001",                    // Usuario propietario
  nickname: "Oficina Principal",        // Nombre descriptivo
  category: "trabajo",                  // casa, trabajo, gimnasio, escuela, otro
  
  // Información de contacto
  contactName: "María González",        // Nombre del contacto
  phone: "+502 1234-5678",            // Teléfono principal
  alternatePhone: "+502 9876-5432",   // Teléfono alternativo (opcional)
  email: "maria@empresa.com",          // Email (opcional)
  
  // Dirección completa
  address: {
    department: "Guatemala",
    municipality: "Guatemala", 
    zone: "Zona 10",
    street: "6a Avenida 12-45",
    building: "Edificio Empresarial Torre I",
    floor: "Piso 8",
    apartment: "Oficina 805",
    reference: "Frente al banco, edificio de cristal azul",
    postalCode: "01010",               // Código postal (opcional)
    coordinates: {                     // Coordenadas GPS (opcional)
      lat: 14.6074,
      lng: -90.5125
    }
  },
  
  // Configuración de entrega
  deliveryInstructions: {
    preferredTime: "08:00-17:00",      // Horario preferido
    accessNotes: "Solicitar en recepción, piso 8",
    alternateRecipient: "Recepcionista del edificio",
    gateCode: "1234",                  // Código de acceso (opcional)
    parkingInstructions: "Parqueo subterráneo disponible"
  },
  
  // Metadatos de uso
  usageCount: 15,                      // Veces que se ha usado
  lastUsed: ISODate("2024-01-21T10:30:00Z"),
  isActive: true,                      // Activa/inactiva
  isPrimary: false,                    // Dirección principal del usuario
  
  // Control de auditoría
  createdAt: ISODate("2024-01-10T09:15:00Z"),
  updatedAt: ISODate("2024-01-21T10:30:00Z"),
  createdBy: "user001"
}
```

**Categorías predefinidas**:
- `casa`: Dirección residencial
- `trabajo`: Oficina o lugar de trabajo
- `gimnasio`: Centro deportivo o fitness
- `escuela`: Institución educativa
- `otro`: Categoría personalizada

**Índices**:
- `{ "userId": 1, "category": 1 }`
- `{ "userId": 1, "isPrimary": 1 }`
- `{ "userId": 1, "lastUsed": -1 }`
- `{ "isActive": 1 }`

---

### 5. 💳 COLECCIÓN: `payment_methods`

**Propósito**: Métodos de pago configurables con diferentes tarifas y condiciones.

```javascript
{
  _id: ObjectId("..."),
  methodId: "contra_entrega",           // ID único del método
  displayName: "Cobro contra entrega",  // Nombre mostrado al usuario
  description: "Pago al recibir el paquete",
  
  // Configuración del método
  type: "cash_on_delivery",             // Tipo de método de pago
  isActive: true,                       // Disponible para uso
  requiresVerification: false,          // Requiere verificación previa
  
  // Tarifas y cargos
  fees: {
    fixedAmount: 4.00,                  // Cargo fijo en GTQ
    percentageRate: 0,                  // Porcentaje sobre el total
    minimumCharge: 4.00,                // Cargo mínimo
    maximumCharge: null,                // Cargo máximo (null = sin límite)
    currency: "GTQ"
  },
  
  // Restricciones
  restrictions: {
    maxOrderValue: 5000.00,             // Valor máximo de pedido
    minOrderValue: 1.00,                // Valor mínimo de pedido
    allowedRegions: ["all"],            // Regiones permitidas
    excludedRegions: [],                // Regiones excluidas
    requiresDocument: true              // Requiere documento de identidad
  },
  
  // Configuración específica
  settings: {
    collectionTimeout: 3,               // Días para recolección
    verificationRequired: false,
    allowPartialPayment: false,
    refundable: true
  },
  
  createdAt: ISODate("2024-01-15T10:00:00Z"),
  updatedAt: ISODate("2024-01-20T15:30:00Z")
}
```

**Métodos de pago predefinidos**:
```javascript
// Cobro contra entrega
{
  methodId: "contra_entrega",
  displayName: "Cobro contra entrega",
  fees: { fixedAmount: 4.00 },
  type: "cash_on_delivery"
}

// Cobro a cuenta
{
  methodId: "cobro_cuenta",
  displayName: "Cobro a mi cuenta",
  fees: { fixedAmount: 0.00 },
  type: "account_billing"
}

// Pago con tarjeta
{
  methodId: "tarjeta_credito",
  displayName: "Pago con tarjeta de crédito o débito",
  fees: { percentageRate: 2.5 },
  type: "card_payment"
}
```

---

### 6. 📦 COLECCIÓN: `package_types`

**Propósito**: Tipos de paquetes predefinidos con características específicas para cotización.

```javascript
{
  _id: ObjectId("..."),
  typeId: "documento_express",          // ID único del tipo
  displayName: "Documento Express",     // Nombre mostrado
  category: "documents",                // Categoría general
  
  // Características físicas
  specifications: {
    maxWeight: 2.0,                     // Peso máximo en kg
    maxDimensions: {                    // Dimensiones máximas en cm
      length: 35,
      width: 25,
      height: 5
    },
    fragile: false,                     // Requiere manejo especial
    stackable: true,                    // Se puede apilar
    requiresSignature: true             // Requiere firma al entregar
  },
  
  // Configuración de precios
  pricing: {
    basePrice: 25.00,                   // Precio base
    priceModifier: 1.0,                 // Multiplicador de precio
    includedServices: [                 // Servicios incluidos
      "basic_packaging",
      "tracking",
      "delivery_confirmation"
    ],
    excludedServices: [                 // Servicios no disponibles
      "insurance_premium"
    ]
  },
  
  // Restricciones de contenido
  contentRestrictions: {
    allowedItems: [
      "documents",
      "contracts", 
      "certificates",
      "photos"
    ],
    prohibitedItems: [
      "cash",
      "jewelry",
      "electronics"
    ],
    requiresDeclaration: false
  },
  
  // Configuración de entrega
  deliveryOptions: {
    availableServices: ["standard", "express"],
    defaultService: "express",
    maxDeliveryDays: 2,
    trackingLevel: "detailed"           // basic, detailed, premium
  },
  
  isActive: true,
  displayOrder: 1,                      // Orden de presentación
  createdAt: ISODate("2024-01-15T10:00:00Z")
}
```

**Tipos de paquetes predefinidos**:
- `documento_express`: Documentos importantes
- `paquete_pequeno`: Paquetes hasta 5kg
- `paquete_mediano`: Paquetes 5-15kg
- `paquete_grande`: Paquetes 15-30kg
- `fragil_especial`: Artículos frágiles
- `electronico`: Dispositivos electrónicos
- `ropa_textil`: Prendas de vestir
- `libro_revista`: Material impreso

---

### 7. ⚙️ COLECCIÓN: `pricing_config`

**Propósito**: Configuración de precios y tarifas del sistema.

```javascript
{
  _id: ObjectId("..."),
  configType: "base_pricing",           // Tipo de configuración
  
  // Precios base por servicio
  servicePricing: {
    standard: {
      basePrice: 25.00,                 // Precio base
      pricePerKg: 3.50,                 // Precio por kg adicional
      maxWeight: 50,                    // Peso máximo en kg
      deliveryDays: "3-5"
    },
    express: {
      basePrice: 35.00,
      pricePerKg: 5.00,
      multiplier: 1.5,                  // Multiplicador sobre standard
      maxWeight: 50,
      deliveryDays: "1-2"
    },
    overnight: {
      basePrice: 50.00,
      pricePerKg: 7.50,
      multiplier: 2.0,
      maxWeight: 25,
      deliveryDays: "Next day"
    },
    same_day: {
      basePrice: 75.00,
      pricePerKg: 10.00,
      multiplier: 2.5,
      maxWeight: 15,
      deliveryHours: "6-8"
    }
  },
  
  // Tarifas por distancia
  distancePricing: {
    zones: [
      {
        name: "Zona Metropolitana",
        maxKm: 50,
        multiplier: 1.0
      },
      {
        name: "Zona Central",
        maxKm: 150,
        multiplier: 1.2
      },
      {
        name: "Zona Nacional",
        maxKm: 999,
        multiplier: 1.5
      }
    ]
  },
  
  // Servicios adicionales
  additionalServices: {
    insurance: {
      rate: 0.02,                       // 2% del valor declarado
      minimum: 5.00,
      maximum: 100.00
    },
    packaging: {
      small: 0.50,
      medium: 1.50,
      large: 3.00,
      fragile: 5.00
    },
    signature: 10.00,
    saturday_delivery: 15.00,
    sunday_delivery: 25.00
  },
  
  // Configuración activa
  isActive: true,
  validFrom: ISODate("2024-01-01T00:00:00Z"),
  validUntil: ISODate("2024-12-31T23:59:59Z"),
  
  // Metadatos
  createdBy: "admin001",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

### 5. 🗺️ COLECCIÓN: `distance_cache`

**Propósito**: Cache de distancias calculadas para optimizar rendimiento.

```javascript
{
  _id: ObjectId("..."),
  origin: {
    department: "Guatemala",
    municipality: "Guatemala"
  },
  destination: {
    department: "Sacatepéquez",
    municipality: "Antigua Guatemala"
  },
  
  // Datos de distancia calculados
  distance: {
    kilometers: 45.2,
    estimatedTime: 75,                  // Minutos
    route: "Via CA-1 Sur",
    source: "google_maps",              // google_maps, estimated, manual
    accuracy: "high"                    // high, medium, low
  },
  
  // Cache info
  calculatedAt: ISODate("2024-01-20T10:00:00Z"),
  validUntil: ISODate("2024-04-20T10:00:00Z"),   // 3 meses de validez
  hitCount: 15,                         // Veces que se ha usado
  lastUsed: ISODate("2024-01-21T14:30:00Z")
}
```

**Índices**:
- `{ "origin.department": 1, "origin.municipality": 1, "destination.department": 1, "destination.municipality": 1 }` - COMPOUND UNIQUE
- `{ "validUntil": 1 }`

---

## 🔐 CONTROL DE ACCESO POR ROLES

### 👤 ROL: `user` (Usuario Regular)
**Permisos en Shipments**:
- ✅ **CREATE**: Puede crear sus propios envíos
- ✅ **READ**: Solo ve envíos que él creó (`createdBy: user.id`)
- ❌ **UPDATE**: No puede cambiar estados de envío
- ❌ **DELETE**: No puede eliminar envíos

**Query de filtro**:
```javascript
{ "createdBy": user.id }
```

### 👷 ROL: `operator` (Operador)
**Permisos en Shipments**:
- ✅ **CREATE**: Puede crear envíos para clientes
- ✅ **READ**: Ve envíos que él creó + envíos en proceso de gestión
- ✅ **UPDATE**: Puede actualizar estados de envío (excepto cancelled/refund)
- ❌ **DELETE**: No puede eliminar envíos

**Query de filtro**:
```javascript
{
  $or: [
    { "createdBy": user.id },
    { 
      "status": { 
        $in: ["pending", "confirmed", "picked-up", "in-transit", "out-for-delivery"] 
      } 
    }
  ]
}
```

### 👨‍💼 ROL: `admin` (Administrador)
**Permisos en Shipments**:
- ✅ **CREATE**: Puede crear cualquier envío
- ✅ **READ**: Ve todos los envíos sin restricción
- ✅ **UPDATE**: Puede cambiar cualquier estado, incluso cancelar/reembolsar
- ✅ **DELETE**: Puede eliminar envíos (con validaciones)
- ✅ **MANAGE**: Gestión completa de usuarios y configuración

**Query de filtro**:
```javascript
{}  // Sin filtros - acceso total
```

---

## 📊 CONSULTAS PRINCIPALES

### 1. Obtener envíos por usuario y rol
```javascript
// Para usuarios regulares
db.shipments.find({ "createdBy": "user001" });

// Para operadores  
db.shipments.find({
  $or: [
    { "createdBy": "op001" },
    { "status": { $in: ["pending", "confirmed", "picked-up", "in-transit"] } }
  ]
});

// Para administradores
db.shipments.find({});  // Todos los envíos
```

### 2. Rastrear envío por número
```javascript
db.shipments.findOne({ "trackingNumber": "DS1697875234001" });
```

### 3. Envíos por estado
```javascript
db.shipments.find({ "status": "in-transit" });
```

### 4. Historial de envíos por fecha
```javascript
db.shipments.find({
  "createdAt": {
    $gte: ISODate("2024-01-01T00:00:00Z"),
    $lt: ISODate("2024-02-01T00:00:00Z")
  }
}).sort({ "createdAt": -1 });
```

### 5. Envíos por servicio y región
```javascript
db.shipments.find({
  "service.type": "express",
  "sender.address.department": "Guatemala"
});
```

---

## 🔧 VALIDACIONES DE NEGOCIO

### Validaciones al crear envío:
1. **Usuario autenticado**: Token JWT válido
2. **Datos requeridos**: Remitente, destinatario, paquete, direcciones
3. **Límites de peso**: Según tipo de servicio seleccionado
4. **Valor declarado**: Máximo según políticas de la empresa
5. **Direcciones válidas**: Departamentos y municipios existentes

### Validaciones al actualizar estado:
1. **Permisos de rol**: Solo operators y admins
2. **Transiciones válidas**: Estados deben seguir flujo lógico
3. **Información completa**: Ubicación y descripción requeridas
4. **Timestamps**: Orden cronológico de actualizaciones

### Integridad referencial:
1. **createdBy**: Debe existir en colección users
2. **shipmentId** en quotations: Debe existir en shipments
3. **trackingNumber**: Único en toda la colección
4. **Eliminación en cascada**: Al desactivar usuario, marcar envíos

---

## � ESTRUCTURA DEL FORMULARIO DE ENVÍOS (4 PASOS)

### Paso 1: Información del Destinatario
**Campos obligatorios marcados con ***:

- **Nombre*** (`name`): Nombre completo del destinatario
- **Correo electrónico*** (`email`): Email válido para notificaciones  
- **Referencia*** (`reference`): Categoría predefinida
  - Opciones: `casa`, `trabajo`, `gimnasio`, `escuela`
- **Poblado*** (`poblado`): Localidad de destino
- **Municipio*** (`municipio`): Municipio de destino  
- **Departamento*** (`departamento`): Departamento de destino

**Funcionalidad de búsqueda**:
- Búsqueda de direcciones frecuentes por nombre/teléfono
- Autocompletado de campos al seleccionar dirección frecuente
- Opción de guardar nueva dirección como frecuente

### Paso 2: Método de Pago
**Opciones disponibles**:

1. **Cobro contra entrega** (`contra_entrega`)
   - Cargo adicional: Q4.00
   - Pago al recibir el paquete
   - Requiere documento de identidad

2. **Cobro a mi cuenta** (`cobro_cuenta`)  
   - Sin cargos adicionales
   - Facturación posterior
   - Solo para usuarios autorizados

3. **Pago con tarjeta de crédito o débito** (`tarjeta_credito`)
   - Cargo por procesamiento: 2.5%
   - Pago inmediato en línea
   - Confirmación automática

### Paso 3: Tipo de Paquete y Cálculo
**Selección de tipo** (como en cotizar):
- Dropdown con tipos predefinidos de `package_types`
- Cálculo automático de precio base
- Aplicación de servicios adicionales
- Validación de restricciones de peso/tamaño

### Paso 4: Confirmación y Generación PDF
**Resumen completo**:
- Información del destinatario
- Método de pago seleccionado
- Detalles del paquete
- Costo total desglosado

**Generación automática**:
- Número de tracking único
- Guía de envío en PDF
- Código QR para seguimiento
- Envío por email automático

---

## 🔒 CONTROL DE ACCESO Y ROLES

### Permisos por Rol para Formulario de Envíos:

**Admin** (`admin`):
- Crear envíos para cualquier usuario
- Acceso a todos los métodos de pago
- Modificar datos después de creación
- Ver direcciones frecuentes de todos los usuarios
- Generar reportes de envíos

**Operador** (`operator`):
- Crear envíos asignados a su zona
- Métodos de pago según configuración
- Editar solo campos específicos
- Ver direcciones frecuentes públicas
- Actualizar estado de envíos

**Usuario** (`user`):
- Crear envíos propios únicamente
- Métodos de pago habilitados para su perfil
- Solo ver sus propias direcciones frecuentes
- No puede modificar después de confirmar

---

## 📊 PERFORMANCE Y OPTIMIZACIÓN

### Índices recomendados:
- **Búsquedas frecuentes**: trackingNumber, createdBy, status
- **Consultas de fecha**: createdAt, updatedAt
- **Filtros de rol**: status + createdBy (compound)
- **Geolocalización**: coordinates (2dsphere para futuras funciones)

### Estrategias de cache:
- **Distancias**: Cache en colección distance_cache
- **Precios**: Cache en pricing_config con validez temporal
- **Usuarios activos**: Redis para tokens JWT

### Archivado de datos:
- **Envíos antiguos**: Mover a colección shipments_archive después de 2 años
- **Logs de timeline**: Comprimir eventos antiguos
- **Cotizaciones expiradas**: Eliminar después de 30 días

---

## 🚀 PRÓXIMAS MEJORAS

1. **Geolocalización en tiempo real**: Tracking GPS de paquetes
2. **Notificaciones automáticas**: SMS/Email en cambios de estado
3. **API de terceros**: Integración con servicios de mapas premium
4. **Analytics avanzados**: Dashboard de métricas de rendimiento
5. **Móvil**: App para conductores con actualización en tiempo real

---

*Documento actualizado: 21 de Octubre 2024*  
*Versión: 2.0*  
*Sistema: DS Envíos - Sistema de Gestión de Envíos*