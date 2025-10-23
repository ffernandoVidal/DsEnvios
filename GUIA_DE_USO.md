# 🚚 Sistema DJ2 Logística - Guía de Uso

## 📋 Resumen del Sistema

El Sistema DJ2 Logística es una aplicación completa de gestión de envíos desarrollada con:
- **Backend**: Node.js + Express + MySQL
- **Frontend**: Angular 16 + TypeScript
- **Base de Datos**: MySQL 8

## 🚀 Configuración e Instalación

### 1. Requisitos Previos
- Node.js 16+
- MySQL 8
- XAMPP (opcional, para MySQL local)
- Angular CLI 16

### 2. Configuración de la Base de Datos

1. **Crear la base de datos**:
   ```sql
   -- Ejecutar el script principal en MySQL
   source path/to/enviosdb_schema.sql
   
   -- Insertar datos de prueba
   source path/to/datos_prueba.sql
   ```

2. **Configurar variables de entorno**:
   - Copiar `.env.example` a `.env` en la carpeta `backend`
   - Configurar credenciales de MySQL:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=enviosdb
   DB_PORT=3306
   ```

### 3. Instalación y Ejecución

#### Backend (Puerto 3005)
```bash
cd backend
npm install
node server-mysql.js
```

#### Frontend (Puerto 4200)
```bash
cd frontend
npm install
ng serve
```

## 👥 Usuarios de Prueba

### Administrador
- **Email**: admin@dj2logistica.com
- **Contraseña**: admin123
- **Permisos**: Acceso completo al sistema

### Empleado
- **Email**: empleado@dj2logistica.com
- **Contraseña**: emp123
- **Permisos**: Gestión de guías y operaciones

### Cliente
- **Email**: cliente@example.com
- **Contraseña**: client123
- **Permisos**: Consulta de envíos propios

## 🔧 Funcionalidades Principales

### 1. Gestión de Usuarios
- **Endpoint**: `/api/usuarios`
- **Características**:
  - CRUD completo de usuarios
  - Roles: ADMIN, EMPLEADO, CLIENTE
  - Autenticación JWT
  - Hash de contraseñas con bcrypt

### 2. Creación de Guías de Envío
- **Ruta**: `/crear-guia`
- **Características**:
  - Formulario reactivo con validaciones
  - Generación automática de número de guía
  - Cálculo automático de costos
  - Selección de bodegas origen/destino
  - Tipos: NACIONAL e INTERNACIONAL

### 3. Lista y Búsqueda de Guías
- **Ruta**: `/lista-guias`
- **Características**:
  - Listado paginado de guías
  - Filtros por número, tipo, fechas
  - Información completa de remitente/destinatario
  - Estados de seguimiento en tiempo real

### 4. Rastreo de Envíos
- **Endpoint**: `/api/seguimiento/:numeroGuia`
- **Características**:
  - Seguimiento público (sin autenticación)
  - Historial completo de estados
  - Ubicación actual con coordenadas GPS
  - Timeline de movimientos

### 5. Gestión de Catálogos
- **Direcciones**: Departamentos, municipios, zonas
- **Sucursales**: Oficinas de DJ2 Logística
- **Bodegas**: Almacenes por sucursal
- **Estados**: Seguimiento de envíos

## 🔗 API Endpoints

### Autenticación
```
POST /api/auth/login
```

### Usuarios
```
GET    /api/usuarios
POST   /api/usuarios
GET    /api/usuarios/:id
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

### Guías de Envío
```
GET    /api/guias
POST   /api/guias
GET    /api/guias/:id
GET    /api/seguimiento/:numeroGuia
POST   /api/guias/:id/estado
```

### Catálogos
```
GET /api/roles
GET /api/direcciones
GET /api/sucursales
GET /api/bodegas
GET /api/estados
```

## 🎯 Flujo de Trabajo

### 1. Para Crear una Guía
1. Iniciar sesión como empleado/admin
2. Navegar a "Crear Guía"
3. Completar información del remitente
4. Completar información del destinatario
5. Seleccionar bodegas origen/destino
6. Ingresar peso y dimensiones
7. Sistema calcula costo automáticamente
8. Crear guía → Se genera número único

### 2. Para Rastrear un Envío
1. Usar el número de guía generado
2. Consultar en `/api/seguimiento/:numeroGuia`
3. Ver historial completo de estados
4. Ubicación actual y coordenadas

### 3. Para Gestionar Estados
1. Acceso como empleado/admin
2. Seleccionar guía desde lista
3. Actualizar estado (En preparación → En tránsito → Entregado)
4. Agregar ubicación y coordenadas actuales

## 🔒 Seguridad

### Autenticación
- JWT tokens con expiración de 24 horas
- Passwords hasheados con bcrypt (salt rounds: 10)
- Middleware de autenticación en rutas protegidas

### Autorización por Roles
- **ADMIN**: Acceso completo
- **EMPLEADO**: Gestión operacional
- **CLIENTE**: Solo consulta de envíos propios

### Validaciones
- Validaciones client-side (Angular Reactive Forms)
- Validaciones server-side (Express middleware)
- Sanitización de inputs SQL

## 📊 Base de Datos

### Estructura Principal
- **14 tablas** interrelacionadas
- **Llaves foráneas** para integridad referencial
- **Índices** para optimización de consultas
- **Triggers** para auditoría (opcional)

### Tablas Principales
1. `usuario` - Usuarios del sistema
2. `guia_envio` - Guías de envío
3. `seguimiento` - Estados de rastreo
4. `remitente` / `destinatario` - Personas involucradas
5. `bodega` / `sucursal` - Infraestructura logística

## 🚀 Despliegue en Producción

### Backend
1. Configurar variables de entorno de producción
2. Usar PM2 para gestión de procesos
3. Configurar proxy reverso (Nginx)
4. SSL/TLS certificates

### Frontend
1. Build de producción: `ng build --prod`
2. Servir archivos estáticos
3. Configurar routing client-side

### Base de Datos
1. MySQL en servidor dedicado
2. Backups automáticos
3. Réplicas para alta disponibilidad
4. Monitoreo de performance

## 🔧 Troubleshooting

### Errores Comunes

1. **Error de conexión a MySQL**:
   - Verificar credenciales en `.env`
   - Asegurar que MySQL esté ejecutándose
   - Verificar puerto 3306

2. **Error CORS en frontend**:
   - Verificar configuración CORS en backend
   - URL del API correcta en Angular

3. **Token inválido**:
   - Verificar JWT_SECRET en `.env`
   - Token puede haber expirado (24h)

4. **Error al crear guía**:
   - Verificar que existan bodegas en la BD
   - Validar formato de campos requeridos

## 📈 Próximas Mejoras

1. **Notificaciones en tiempo real** (WebSockets)
2. **Integración con Google Maps** para rutas
3. **Reportes y analytics** avanzados
4. **API móvil** para conductores
5. **Integración con APIs de paquetería externa**
6. **Sistema de facturación** electrónica

## 📞 Soporte

Para soporte técnico o dudas sobre el sistema:
- **Email**: soporte@dj2logistica.com
- **Documentación**: [GitHub Repository]
- **Issues**: [GitHub Issues]

---

**Sistema DJ2 Logística v1.0**  
Desarrollado por el equipo de desarrollo de DJ2 Logística S.A.