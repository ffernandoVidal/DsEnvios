# 🗄️ Sistema de Gestión de Base de Datos - Panel de Administración

## 📋 Descripción

Se ha integrado un sistema completo de gestión de base de datos en el panel de administración de EnviosDS. Esta herramienta permite a los administradores:

- ✅ Verificar el estado de conexión a MySQL
- ✅ Listar todas las tablas de la base de datos
- ✅ Ver la estructura de cada tabla (columnas, tipos de datos, claves)
- ✅ Consultar datos de cualquier tabla con paginación
- ✅ Ejecutar consultas SQL personalizadas (solo SELECT)
- ✅ Ver estadísticas en tiempo real

## 🚀 Cómo Usar

### 1. Acceder al Panel de Base de Datos

1. Inicia sesión como administrador en: `http://localhost:4200/login`
   - Correo: `admin@envios.com`
   - Contraseña: `admin123`

2. En el Dashboard principal, haz clic en el botón **"🗄️ Base de Datos"** en la sección de Acciones Rápidas

### 2. Verificar Estado de Conexión

Al abrir el panel, verás una tarjeta con información de la base de datos:
- **Estado**: Conectado/Desconectado
- **Base de Datos**: enviosdb
- **Versión MySQL**: 8.x.x
- **Hora del Servidor**: Timestamp actual

### 3. Explorar Tablas

**Panel Izquierdo - Lista de Tablas:**
- Muestra todas las tablas disponibles (8 tablas)
- Indica el número de registros de cada tabla
- Haz clic en cualquier tabla para ver sus datos

**Tablas Disponibles:**
1. **roles** - Roles del sistema (admin, operador, usuario)
2. **usuarios** - Usuarios registrados
3. **sucursales** - Sucursales de la empresa
4. **bodegas** - Bodegas de almacenamiento
5. **personas** - Datos de clientes y empleados
6. **estados_envio** - Estados de los envíos
7. **guias_envio** - Guías de envío registradas
8. **tracking** - Historial de rastreo

### 4. Ver Datos de una Tabla

1. Haz clic en una tabla del panel izquierdo
2. Se mostrará:
   - **Estructura de la tabla**: Columnas, tipos de datos, claves primarias
   - **Datos**: Registros en formato de tabla
   - **Paginación**: Navegación entre páginas (20 registros por página)

**Controles de Paginación:**
- **← Anterior**: Ir a la página anterior
- **Página X de Y**: Indicador de página actual
- **Siguiente →**: Ir a la siguiente página

### 5. Ejecutar Consultas SQL Personalizadas

**Sección de Consulta Personalizada:**
- Ubicada en la parte inferior del panel
- Solo permite consultas **SELECT** por seguridad
- No se permiten INSERT, UPDATE, DELETE, DROP, etc.

**Ejemplos de Consultas:**

```sql
-- Ver todos los usuarios
SELECT * FROM usuarios;

-- Ver usuarios con rol de admin
SELECT u.*, r.nombre_rol 
FROM usuarios u 
INNER JOIN roles r ON u.id_rol = r.id_rol 
WHERE r.nombre_rol = 'admin';

-- Contar guías por estado
SELECT e.nombre_estado, COUNT(*) as total
FROM guias_envio g
INNER JOIN estados_envio e ON g.id_estado = e.id_estado
GROUP BY e.nombre_estado;

-- Ver últimas 5 guías creadas
SELECT * FROM guias_envio 
ORDER BY fecha_creacion DESC 
LIMIT 5;

-- Ver seguimiento de una guía específica
SELECT * FROM tracking 
WHERE numero_guia = 'ENV-2024-001'
ORDER BY fecha_evento DESC;
```

**Cómo Ejecutar:**
1. Escribe tu consulta SQL en el área de texto
2. Haz clic en **"▶ Ejecutar"**
3. Los resultados aparecerán en una tabla debajo
4. Usa **"Limpiar resultados"** para borrar los resultados

### 6. Actualizar Información

- Haz clic en **"🔄 Actualizar"** para recargar toda la información
- Esto actualizará:
  - Estado de conexión
  - Lista de tablas
  - Contadores de registros

## 🔒 Seguridad

### Restricciones Implementadas:

1. **Autenticación Requerida**: Solo usuarios con sesión activa pueden acceder
2. **Solo Administradores**: El panel solo está visible para rol 'admin'
3. **Solo Consultas SELECT**: No se permiten operaciones de modificación
4. **Validación en Backend**: El servidor valida todas las consultas
5. **Token JWT**: Todas las peticiones requieren token de autenticación

### Mensajes de Error:

- **"Token de acceso requerido"**: Sesión expirada, vuelve a iniciar sesión
- **"Solo se permiten consultas SELECT"**: Intentaste ejecutar una consulta no permitida
- **"Tabla no encontrada"**: La tabla especificada no existe
- **Error de sintaxis SQL**: Revisa tu consulta SQL

## 📊 Estructura de la Base de Datos

### Tabla: roles
- `id_rol` (INT, PK, AUTO_INCREMENT)
- `nombre_rol` (VARCHAR)
- `descripcion` (TEXT)

### Tabla: usuarios
- `id_usuario` (INT, PK, AUTO_INCREMENT)
- `id_rol` (INT, FK → roles)
- `correo` (VARCHAR, UNIQUE)
- `contrasena` (VARCHAR, hash bcrypt)
- `nombre` (VARCHAR)
- `apellido` (VARCHAR)
- `telefono` (VARCHAR)
- `activo` (BOOLEAN)

### Tabla: sucursales
- `id_sucursal` (INT, PK, AUTO_INCREMENT)
- `nombre` (VARCHAR)
- `direccion` (TEXT)
- `telefono` (VARCHAR)
- `ciudad` (VARCHAR)
- `departamento` (VARCHAR)

### Tabla: bodegas
- `id_bodega` (INT, PK, AUTO_INCREMENT)
- `id_sucursal` (INT, FK → sucursales)
- `nombre` (VARCHAR)
- `capacidad` (INT)
- `ubicacion` (VARCHAR)

### Tabla: personas
- `id_persona` (INT, PK, AUTO_INCREMENT)
- `nombre` (VARCHAR)
- `apellido` (VARCHAR)
- `dpi` (VARCHAR, UNIQUE)
- `telefono` (VARCHAR)
- `direccion` (TEXT)
- `email` (VARCHAR)
- `tipo` (ENUM: 'cliente', 'empleado')

### Tabla: estados_envio
- `id_estado` (INT, PK, AUTO_INCREMENT)
- `nombre_estado` (VARCHAR)
- `descripcion` (TEXT)
- `color` (VARCHAR)

### Tabla: guias_envio
- `id_guia` (INT, PK, AUTO_INCREMENT)
- `numero_guia` (VARCHAR, UNIQUE)
- `id_estado` (INT, FK → estados_envio)
- `id_remitente` (INT, FK → personas)
- `id_destinatario` (INT, FK → personas)
- `origen` (VARCHAR)
- `destino` (VARCHAR)
- `peso` (DECIMAL)
- `valor_declarado` (DECIMAL)
- `costo_envio` (DECIMAL)
- `fecha_creacion` (DATETIME)
- `fecha_entrega_estimada` (DATETIME)

### Tabla: tracking
- `id_tracking` (INT, PK, AUTO_INCREMENT)
- `numero_guia` (VARCHAR, FK → guias_envio)
- `id_estado` (INT, FK → estados_envio)
- `ubicacion` (VARCHAR)
- `observaciones` (TEXT)
- `fecha_evento` (DATETIME)

## 🛠️ Endpoints de la API

### GET /api/database/status
Obtiene el estado de conexión de la base de datos

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "database": "enviosdb",
    "version": "8.0.30",
    "serverTime": "2025-10-23T21:00:00.000Z"
  }
}
```

### GET /api/database/tables
Lista todas las tablas con sus columnas

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "name": "usuarios",
      "rowCount": 3,
      "columns": [
        {
          "name": "id_usuario",
          "type": "int",
          "null": false,
          "key": "PRI",
          "default": null,
          "extra": "auto_increment"
        }
      ]
    }
  ]
}
```

### GET /api/database/tables/:tableName?limit=20&offset=0
Obtiene datos de una tabla específica con paginación

**Parámetros:**
- `tableName`: Nombre de la tabla
- `limit`: Registros por página (default: 100)
- `offset`: Desplazamiento (default: 0)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "tableName": "usuarios",
    "rows": [...],
    "total": 3,
    "limit": 20,
    "offset": 0
  }
}
```

### POST /api/database/query
Ejecuta una consulta SQL personalizada

**Body:**
```json
{
  "query": "SELECT * FROM usuarios WHERE activo = 1"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "rows": [...],
    "count": 3
  }
}
```

### GET /api/database/stats
Obtiene estadísticas generales de la base de datos

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalTables": 8,
    "tables": [
      {"name": "usuarios", "rowCount": 3},
      {"name": "guias_envio", "rowCount": 0}
    ]
  }
}
```

## 💡 Casos de Uso

### 1. Verificar Usuarios Registrados
```sql
SELECT id_usuario, nombre, apellido, correo, activo 
FROM usuarios;
```

### 2. Ver Guías Pendientes
```sql
SELECT g.numero_guia, g.origen, g.destino, e.nombre_estado
FROM guias_envio g
INNER JOIN estados_envio e ON g.id_estado = e.id_estado
WHERE e.nombre_estado = 'Pendiente';
```

### 3. Auditar Actividad de Rastreo
```sql
SELECT t.numero_guia, t.ubicacion, t.observaciones, t.fecha_evento
FROM tracking t
ORDER BY t.fecha_evento DESC
LIMIT 20;
```

### 4. Ver Sucursales por Ciudad
```sql
SELECT ciudad, COUNT(*) as total_sucursales
FROM sucursales
GROUP BY ciudad;
```

### 5. Buscar Cliente por DPI
```sql
SELECT * FROM personas 
WHERE dpi = '1234567890101' AND tipo = 'cliente';
```

## ⚠️ Notas Importantes

1. **No Guardar Contraseñas**: Las contraseñas están hasheadas con bcrypt
2. **Paginación Automática**: Las consultas grandes se paginan automáticamente
3. **Límite de Resultados**: La consulta personalizada puede retornar máximo 1000 registros
4. **Timeout**: Las consultas que tarden más de 30 segundos se cancelarán
5. **Solo Lectura**: Este panel es solo para consulta, no para modificación

## 🔧 Solución de Problemas

### No puedo ver el botón de Base de Datos
- Verifica que iniciaste sesión como administrador
- Revisa que tu rol sea 'admin'

### Error: "No es posible conectar con el servidor remoto"
- Verifica que el backend esté corriendo en puerto 3005
- Revisa que MySQL esté activo en puerto 3310

### Las tablas no cargan
- Haz clic en "🔄 Actualizar"
- Verifica la conexión a MySQL
- Revisa la consola del navegador (F12)

### Error: "Token inválido"
- Tu sesión expiró, vuelve a iniciar sesión
- Verifica que el token JWT sea válido

## 📞 Contacto y Soporte

Para reportar problemas o sugerencias sobre la gestión de base de datos, contacta al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Fecha**: Octubre 2025  
**Sistema**: EnviosDS - Panel de Administración
