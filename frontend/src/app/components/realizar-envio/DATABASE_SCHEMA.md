# 📊 ESQUEMA DE BASE DE DATOS - SISTEMA DE ENVÍOS DS

## 🎯 MODELO ENTIDAD-RELACIÓN

### 📋 ENTIDADES PRINCIPALES

---

## 👥 **USERS** (Usuarios del Sistema)
```
Collection: users
```

| Campo      | Tipo      | Descripción                    | Índices        |
|------------|-----------|--------------------------------|----------------|
| _id        | ObjectId  | Identificador único            | Primary Key    |
| username   | String    | Nombre de usuario único        | Unique Index   |
| password   | String    | Contraseña encriptada (bcrypt) |                |
| name       | String    | Nombre completo                |                |
| email      | String    | Correo electrónico             | Index          |
| role       | String    | Rol: admin, operator, user     | Index          |
| active     | Boolean   | Estado activo/inactivo         | Index          |
| created_at | Date      | Fecha de creación              | Index          |
| updated_at | Date      | Fecha de última actualización  |                |

**Roles y Permisos:**
- `admin`: Acceso completo, puede ver y gestionar todos los envíos
- `operator`: Puede crear y gestionar envíos asignados
- `user`: Solo puede ver sus propios envíos

---

## 📦 **SHIPMENTS** (Envíos)
```
Collection: shipments
```

| Campo              | Tipo      | Descripción                           | Índices        |
|--------------------|-----------|---------------------------------------|----------------|
| _id                | ObjectId  | Identificador único                   | Primary Key    |
| shipment_id        | String    | ID de envío único (ENV-YYYY-NNNNN)   | Unique Index   |
| user_id            | ObjectId  | Referencia al usuario creador         | Index          |
| assigned_operator  | ObjectId  | Operador asignado (opcional)          | Index          |
| status             | String    | Estado del envío                      | Index          |
| priority           | String    | Prioridad: low, normal, high, urgent | Index          |
| service_type       | String    | Tipo de servicio                      | Index          |
| **sender**         | Object    | Información del remitente             |                |
| **receiver**       | Object    | Información del destinatario          |                |
| **package_details** | Object    | Detalles del paquete                  |                |
| **addresses**      | Object    | Direcciones origen y destino          |                |
| **pricing**        | Object    | Información de precios                |                |
| **tracking**       | Array     | Historial de seguimiento              |                |
| created_at         | Date      | Fecha de creación                     | Index          |
| updated_at         | Date      | Fecha de última actualización         | Index          |
| delivery_date      | Date      | Fecha programada de entrega           | Index          |

### 📋 **SUBDOCUMENTOS SHIPMENTS:**

#### **sender** (Remitente)
```javascript
{
  name: String,           // Nombre completo
  phone: String,          // Teléfono
  email: String,          // Email (opcional)
  document_type: String,  // Tipo documento: DPI, NIT, Passport
  document_number: String // Número de documento
}
```

#### **receiver** (Destinatario)
```javascript
{
  name: String,           // Nombre completo
  phone: String,          // Teléfono
  email: String,          // Email (opcional)
  document_type: String,  // Tipo documento: DPI, NIT, Passport
  document_number: String // Número de documento
}
```

#### **package_details** (Detalles del Paquete)
```javascript
{
  description: String,    // Descripción del contenido
  weight: Number,         // Peso en kg
  dimensions: {
    length: Number,       // Largo en cm
    width: Number,        // Ancho en cm
    height: Number        // Alto en cm
  },
  declared_value: Number, // Valor declarado en GTQ
  fragile: Boolean,       // Es frágil
  special_handling: String // Instrucciones especiales
}
```

#### **addresses** (Direcciones)
```javascript
{
  origin: {
    department: String,   // Departamento
    municipality: String, // Municipio
    address: String,      // Dirección completa
    zone: String,         // Zona (opcional)
    reference: String     // Referencia (opcional)
  },
  destination: {
    department: String,   // Departamento
    municipality: String, // Municipio
    address: String,      // Dirección completa
    zone: String,         // Zona (opcional)
    reference: String     // Referencia (opcional)
  }
}
```

#### **pricing** (Precios)
```javascript
{
  base_cost: Number,      // Costo base
  distance_cost: Number,  // Costo por distancia
  weight_cost: Number,    // Costo por peso
  insurance_cost: Number, // Costo de seguro
  total_cost: Number,     // Costo total
  currency: String        // Moneda (GTQ)
}
```

#### **tracking** (Seguimiento)
```javascript
[
  {
    status: String,       // Estado
    location: String,     // Ubicación
    description: String,  // Descripción del evento
    timestamp: Date,      // Fecha y hora
    operator_id: ObjectId // Operador que registró el evento
  }
]
```

---

## 💰 **QUOTATIONS** (Cotizaciones)
```
Collection: quotations
```

| Campo          | Tipo     | Descripción                    | Índices     |
|----------------|----------|--------------------------------|-------------|
| _id            | ObjectId | Identificador único            | Primary Key |
| quote_id       | String   | ID de cotización único         | Unique      |
| user_id        | ObjectId | Usuario que solicitó (opcional)| Index       |
| user_ip        | String   | IP del solicitante             | Index       |
| origen         | Object   | Ubicación de origen            | Index       |
| destino        | Object   | Ubicación de destino           | Index       |
| package_info   | Object   | Información del paquete        |             |
| pricing        | Object   | Detalles de precios            |             |
| valid_until    | Date     | Válida hasta                   | Index       |
| status         | String   | Estado: active, expired, used  | Index       |
| created_at     | Date     | Fecha de creación              | Index       |

---

## 📍 **TRACKING_QUERIES** (Consultas de Rastreo)
```
Collection: tracking_queries
```

| Campo       | Tipo     | Descripción               | Índices     |
|-------------|----------|---------------------------|-------------|
| _id         | ObjectId | Identificador único       | Primary Key |
| shipment_id | String   | ID del envío consultado   | Index       |
| user_ip     | String   | IP del consultante        | Index       |
| user_agent  | String   | Navegador del usuario     |             |
| timestamp   | Date     | Fecha de consulta         | Index       |
| found       | Boolean  | Si se encontró el envío   | Index       |

---

## ⚙️ **PRICING_CONFIG** (Configuración de Precios)
```
Collection: pricing_config
```

| Campo         | Tipo     | Descripción                | Índices     |
|---------------|----------|----------------------------|-------------|
| _id           | ObjectId | Identificador único        | Primary Key |
| service_type  | String   | Tipo de servicio           | Index       |
| base_rate     | Number   | Tarifa base                |             |
| per_km_rate   | Number   | Tarifa por kilómetro       |             |
| per_kg_rate   | Number   | Tarifa por kilogramo       |             |
| insurance_rate| Number   | Tarifa de seguro (%)       |             |
| effective_date| Date     | Fecha de vigencia          | Index       |
| active        | Boolean  | Estado activo              | Index       |

---

## 🗺️ **DISTANCE_CACHE** (Cache de Distancias)
```
Collection: distance_cache
```

| Campo          | Tipo     | Descripción                | Índices     |
|----------------|----------|----------------------------|-------------|
| _id            | ObjectId | Identificador único        | Primary Key |
| origin_dest    | String   | Clave origen-destino       | Unique      |
| distance_km    | Number   | Distancia en kilómetros    |             |
| duration_hours | Number   | Duración en horas          |             |
| created_at     | Date     | Fecha de creación (TTL 7d) | TTL Index   |

---

## 🔗 RELACIONES ENTRE ENTIDADES

### **USUARIOS → ENVÍOS**
- **1:N** - Un usuario puede crear múltiples envíos
- Campo: `shipments.user_id` → `users._id`

### **USUARIOS → OPERACIONES**
- **1:N** - Un operador puede gestionar múltiples envíos
- Campo: `shipments.assigned_operator` → `users._id` (role: operator)

### **COTIZACIONES → ENVÍOS**
- **1:1** - Una cotización puede generar un envío
- Relación por `quote_id` en metadatos del envío

### **USUARIOS → SEGUIMIENTO**
- **1:N** - Un operador registra múltiples eventos de tracking
- Campo: `shipments.tracking[].operator_id` → `users._id`

---

## 🛡️ CONTROL DE ACCESO POR ROLES

### **ADMIN (Administrador)**
- ✅ Ver todos los envíos
- ✅ Crear envíos para cualquier usuario
- ✅ Asignar operadores
- ✅ Modificar estados
- ✅ Ver reportes completos
- ✅ Gestionar usuarios
- ✅ Configurar precios

### **OPERATOR (Operador)**
- ✅ Ver envíos asignados
- ✅ Crear envíos (asignados automáticamente)
- ✅ Actualizar estados de sus envíos
- ✅ Registrar eventos de tracking
- ❌ Ver envíos de otros operadores
- ❌ Gestionar usuarios

### **USER (Usuario)**
- ✅ Ver solo sus propios envíos
- ✅ Crear envíos personales
- ✅ Consultar tracking de sus envíos
- ❌ Ver envíos de otros usuarios
- ❌ Modificar estados
- ❌ Acceso a configuraciones

---

## 📈 ESTADOS DE ENVÍO

### **ESTADOS PRINCIPALES**
1. `pending` - Pendiente de procesamiento
2. `confirmed` - Confirmado
3. `picked_up` - Recolectado
4. `in_transit` - En tránsito
5. `out_for_delivery` - En reparto
6. `delivered` - Entregado
7. `failed_delivery` - Entrega fallida
8. `returned` - Devuelto
9. `cancelled` - Cancelado

### **TRANSICIONES PERMITIDAS**
```
pending → confirmed → picked_up → in_transit → out_for_delivery → delivered
              ↓              ↓           ↓              ↓
           cancelled     returned    returned    failed_delivery
```

---

## 🔍 ÍNDICES IMPORTANTES

### **Optimización de Consultas**
```javascript
// Shipments
db.shipments.createIndex({"user_id": 1, "status": 1})
db.shipments.createIndex({"assigned_operator": 1, "status": 1})
db.shipments.createIndex({"shipment_id": 1}, {unique: true})
db.shipments.createIndex({"created_at": -1})
db.shipments.createIndex({"status": 1, "created_at": -1})

// Users
db.users.createIndex({"username": 1}, {unique: true})
db.users.createIndex({"role": 1, "active": 1})
db.users.createIndex({"email": 1})

// Quotations
db.quotations.createIndex({"quote_id": 1}, {unique: true})
db.quotations.createIndex({"user_ip": 1, "created_at": -1})
db.quotations.createIndex({"valid_until": 1})
```

---

## 📊 MÉTRICAS Y REPORTES

### **KPIs por Rol**
- **Admin**: Total envíos, ingresos, performance por operador
- **Operator**: Envíos asignados, entregas exitosas, tiempo promedio
- **User**: Mis envíos, gastos totales, historial

---

**Fecha de creación:** 21 de Octubre 2025
**Última actualización:** 21 de Octubre 2025
**Versión:** 1.0