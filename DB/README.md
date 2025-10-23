# �️ Sistema de Base de Datos DsEnvios

Este sistema proporciona una inicialización completa y estructurada de la base de datos MongoDB para el proyecto DsEnvios.

## 📋 Estructura

```
DB/
├── initialize_database.js    # Script principal de inicialización
├── schemas_main.js          # Esquemas principales (users, shipments, etc.)
├── schemas_locations.js     # Esquemas de ubicaciones (departamentos, municipios)
├── schemas_products.js      # Esquemas de productos y servicios
├── schemas_operational.js   # Esquemas operacionales (pagos, notificaciones)
└── init_realizar_envio.js   # Script específico para el formulario

backend/
├── config/
│   └── database.js          # Configuración y auto-inicialización
└── server.js               # Servidor principal con integración automática
```
├── schemas_locations.js    # 🌍 Esquemas de ubicaciones (departamentos, municipios)
├── schemas_products.js     # 📦 Esquemas de productos y servicios
├── schemas_operational.js  # ⚙️ Esquemas operacionales (pagos, notificaciones)
├── init_database.js        # 🚀 Inicializador de base de datos
└── README.md              # 📖 Esta documentación
```

## 🏗️ Colecciones de Base de Datos

### 👥 **Colecciones Principales**

#### `users` - Usuarios del Sistema
- **Propósito**: Gestión de usuarios (clientes, administradores, empleados)
- **Campos Clave**: `email`, `phone`, `document_number`, `user_type`, `status`
- **Validaciones**: Email único, teléfono guatemalteco, DPI válido
- **Índices**: `email`, `phone`, `document_number`

#### `shipments` - Envíos
- **Propósito**: Gestión completa de envíos y paquetes
- **Campos Clave**: `tracking_number`, `sender_id`, `recipient_id`, `status`, `dimensions`
- **Estados**: `pending`, `confirmed`, `in_transit`, `delivered`, `cancelled`
- **Validaciones**: Dimensiones válidas, pesos permitidos, direcciones completas
- **Índices**: `tracking_number`, `sender_id`, `recipient_id`, `status`

#### `quotations` - Cotizaciones
- **Propósito**: Generación y gestión de cotizaciones de envío
- **Campos Clave**: `quotation_number`, `customer_id`, `total_amount`, `validity_date`
- **Validaciones**: Precios válidos, fechas de vigencia, detalles completos
- **Índices**: `quotation_number`, `customer_id`, `status`

#### `tracking` - Seguimiento
- **Propósito**: Historial detallado de seguimiento de envíos
- **Campos Clave**: `shipment_id`, `tracking_number`, `status`, `location`, `timestamp`
- **Validaciones**: Secuencia temporal, ubicaciones válidas
- **Índices**: `shipment_id`, `tracking_number`, `timestamp`

#### `orders` - Órdenes
- **Propósito**: Gestión de órdenes de servicio y facturación
- **Campos Clave**: `order_number`, `customer_id`, `total_amount`, `payment_status`
- **Estados**: `draft`, `confirmed`, `paid`, `processing`, `completed`, `cancelled`
- **Índices**: `order_number`, `customer_id`, `status`

### 🌍 **Colecciones de Ubicaciones**

#### `departments` - Departamentos de Guatemala
- **Propósito**: 22 departamentos con información de envío
- **Campos Clave**: `code`, `name`, `region`, `shipping_zone`, `delivery_base_cost`
- **Datos**: Todos los departamentos guatemaltecos con costos base
- **Índices**: `code`, `name`

#### `municipalities` - Municipios
- **Propósito**: Municipios por departamento con detalles logísticos
- **Campos Clave**: `department_id`, `code`, `name`, `delivery_difficulty`, `access_roads`
- **Validaciones**: Referencia válida a departamento, códigos únicos
- **Índices**: `department_id`, `code`, `name`

#### `villages` - Aldeas y Caseríos
- **Propósito**: Ubicaciones específicas para entrega detallada
- **Campos Clave**: `municipality_id`, `name`, `coordinates`, `delivery_available`
- **Validaciones**: Coordenadas GPS válidas, disponibilidad de entrega
- **Índices**: `municipality_id`, `name`

#### `address_cache` - Cache de Direcciones
- **Propósito**: Optimización de direcciones frecuentes
- **Campos Clave**: `full_address`, `coordinates`, `validated`, `geocoded_data`
- **Validaciones**: Formato de dirección, coordenadas válidas
- **Índices**: `coordinates`, `full_address`

### 📦 **Colecciones de Productos y Servicios**

#### `package_types` - Tipos de Paquete
- **Propósito**: Definición de categorías de paquetes por tamaño/peso
- **Campos Clave**: `code`, `name`, `max_weight`, `max_dimensions`, `base_price`
- **Tipos**: Sobre, Pequeño, Mediano, Grande, Extra Grande
- **Validaciones**: Dimensiones coherentes, precios válidos
- **Índices**: `code`, `active`

#### `pricing_config` - Configuración de Precios
- **Propósito**: Reglas dinámicas de cálculo de precios
- **Campos Clave**: `service_type`, `base_price`, `weight_factor`, `distance_factor`
- **Validaciones**: Factores numéricos positivos, configuración completa
- **Índices**: `service_type`, `active`

#### `service_types` - Tipos de Servicio
- **Propósito**: Definición de servicios (Estándar, Express, Overnight)
- **Campos Clave**: `code`, `name`, `delivery_time_min/max`, `price_multiplier`
- **Servicios**: Standard, Express, Overnight, Economy
- **Índices**: `code`, `active`

#### `shipping_rates` - Tarifas de Envío
- **Propósito**: Matriz de precios por zonas y servicios
- **Campos Clave**: `origin_zone`, `destination_zone`, `service_type`, `base_rate`
- **Validaciones**: Zonas válidas, tarifas positivas
- **Índices**: `origin_zone`, `destination_zone`, `service_type`

### ⚙️ **Colecciones Operacionales**

#### `payment_methods` - Métodos de Pago
- **Propósito**: Configuración de procesadores de pago
- **Campos Clave**: `code`, `name`, `type`, `processor`, `configuration`
- **Tipos**: Efectivo, Tarjetas, Transferencias, Billeteras Digitales
- **Procesadores**: Visa, Mastercard, Banrural, BAC, PayPal, Stripe
- **Índices**: `code`, `type`, `active`

#### `transactions` - Transacciones
- **Propósito**: Registro completo de todas las transacciones
- **Campos Clave**: `transaction_id`, `order_id`, `amount`, `status`, `payment_details`
- **Estados**: `pending`, `processing`, `completed`, `failed`, `refunded`
- **Validaciones**: Montos válidos, referencias correctas, detección de fraude
- **Índices**: `transaction_id`, `order_id`, `status`

#### `notifications` - Notificaciones
- **Propósito**: Sistema de notificaciones multicanal
- **Campos Clave**: `notification_id`, `recipient_id`, `type`, `channel`, `status`
- **Canales**: Email, SMS, Push, In-App, WhatsApp
- **Tipos**: Confirmaciones, Actualizaciones, Alertas, Promociones
- **Índices**: `recipient_id`, `type`, `status`

#### `system_logs` - Logs del Sistema
- **Propósito**: Auditoría y monitoreo del sistema
- **Campos Clave**: `log_id`, `level`, `source`, `message`, `timestamp`
- **Niveles**: debug, info, warn, error, fatal
- **Categorías**: authentication, payment, shipment, system, security
- **Índices**: `level`, `source`, `timestamp`

## 🚀 Instalación y Configuración

### 1. **Requisitos Previos**
```bash
# MongoDB 6.0+
# Node.js 18+
# Dependencias npm
npm install mongodb dotenv
```

### 2. **Variables de Entorno**
```env
# .env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=enviosdb1
MONGODB_CONNECTION_TIMEOUT=10000
MONGODB_MAX_POOL_SIZE=50
```

### 3. **Inicialización**
```bash
# Inicialización completa
node DB/init_database.js

# Reset completo (SOLO DESARROLLO)
node DB/init_database.js --reset

# Verificación de salud
node DB/init_database.js --check
```

## 🔧 Uso de la Base de Datos

### **Conexión Básica**
```javascript
const { connectToDatabase } = require('./DB/connection');

async function ejemplo() {
    const { db, client } = await connectToDatabase();
    
    // Usar la base de datos
    const users = await db.collection('users').find({}).toArray();
    
    // Cerrar conexión al finalizar
    await client.close();
}
```

### **Transacciones**
```javascript
const { withTransaction } = require('./DB/connection');

await withTransaction(async (session) => {
    await db.collection('orders').insertOne(orderData, { session });
    await db.collection('shipments').insertOne(shipmentData, { session });
    // Si algo falla, se hace rollback automático
});
```

### **Consultas Optimizadas**
```javascript
// Buscar envíos por tracking
const shipment = await db.collection('shipments')
    .findOne({ tracking_number: "ENV-20241201-ABC123" });

// Historial de seguimiento
const tracking = await db.collection('tracking')
    .find({ shipment_id: shipment._id })
    .sort({ timestamp: -1 })
    .toArray();
```

## 📊 Datos Iniciales Incluidos

### **22 Departamentos de Guatemala**
- Códigos oficiales (01-22)
- Zonas de envío (A, B, C, D)
- Costos base por región
- Información geográfica

### **Tipos de Paquete Estándar**
- Sobre (0.5kg, Q15.00)
- Pequeño (2kg, Q25.00)
- Mediano (5kg, Q35.00)
- Grande (10kg, Q50.00)
- Extra Grande (20kg, Q75.00)

### **Servicios de Entrega**
- **Estándar**: 3-5 días (precio base)
- **Express**: 1-2 días (+50%)
- **Overnight**: 1 día (+100%)
- **Económico**: 5-7 días (-20%)

### **Métodos de Pago**
- Efectivo (interno)
- Tarjetas Visa/Mastercard
- Transferencias Banrural/BAC
- Configuración para modo prueba

## 🔒 Seguridad y Validación

### **Validación de Esquemas**
- JSON Schema validation en MongoDB
- Tipos de datos estrictos (bsonType)
- Patrones regex para formatos
- Rangos numéricos válidos
- Referencias entre colecciones

### **Índices de Rendimiento**
- Índices simples en campos de búsqueda
- Índices compuestos para consultas complejas
- Índices de texto para búsqueda
- TTL para logs automáticos

### **Auditoria Completa**
- Timestamps automáticos (created_at, updated_at)
- Usuario de creación (created_by)
- Logs de sistema para todas las operaciones
- Historial de seguimiento detallado

## 🚨 Consideraciones de Producción

### **Respaldos**
```bash
# Backup completo
mongodump --uri="mongodb://localhost:27017/enviosdb1" --out=backup/

# Restore
mongorestore --uri="mongodb://localhost:27017/enviosdb1" backup/enviosdb1/
```

### **Monitoreo**
- Logs categorizados por nivel y fuente
- Métricas de rendimiento en system_logs
- Alertas automáticas para errores críticos
- Dashboard de salud de base de datos

### **Escalabilidad**
- Índices optimizados para consultas frecuentes
- Pool de conexiones configurado
- Paginación en consultas grandes
- Cache de direcciones para optimización

## 📈 Roadmap y Mejoras Futuras

### **Fase 2**
- [ ] Replica sets para alta disponibilidad
- [ ] Sharding para escalabilidad horizontal
- [ ] Índices de texto completo para búsqueda
- [ ] Agregaciones para reportes analíticos

### **Fase 3**
- [ ] MongoDB Atlas para cloud
- [ ] Backup automático en la nube
- [ ] Métricas avanzadas con MongoDB Compass
- [ ] Integración con sistemas ERP externos

---

## 📞 Soporte

Para consultas sobre la base de datos:
- Documentación técnica: `/DB/README.md`
- Logs del sistema: Colección `system_logs`
- Verificación de salud: `node DB/init_database.js --check`

**¡La base de datos DsEnvios está lista para producción! 🚀**