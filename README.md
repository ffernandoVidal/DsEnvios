# 🚚 EnviosDS - Sistema de Envíos con Forza API

Sistema completo de gestión de envíos con integración a Forza Ecommerce Engine API.

## 📁 Estructura del Proyecto

```
ENVIOSDS/
├── backend/                 # Servidor Node.js
│   ├── .env                # Variables de entorno
│   ├── .env.example       # Plantilla de configuración
│   ├── server-forza.js    # Servidor principal con integración Forza
│   ├── package.json       # Dependencias backend
│   └── node_modules/      # Módulos Node.js
├── index.html              # Página principal pública
├── dashboard.html          # Dashboard completo (post-login)
├── servidor-frontend.js    # Servidor de archivos estáticos
├── package.json           # Dependencias principales
└── README.md              # Esta documentación
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias
```bash
# Dependencias principales
npm install

# Dependencias del backend
cd backend
npm install
```

### 2. Configurar Variables de Entorno
```bash
cd backend
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Configuración MongoDB
Asegúrate de tener MongoDB ejecutándose en:
```
mongodb://localhost:27017/
```

## 🎯 Ejecución del Sistema

### Iniciar Backend (Puerto 3005)
```bash
node backend/server-forza.js
```

### Iniciar Frontend (Puerto 8080)
```bash
node servidor-frontend.js
```

### Acceder al Sistema
- **Página Principal**: http://localhost:8080
- **Dashboard Completo**: http://localhost:8080/dashboard.html (después del login)

## 👥 Usuarios de Prueba

| Usuario   | Contraseña  | Rol       |
|-----------|-------------|-----------|
| admin     | admin123    | Admin     |
| usuario1  | 123456      | Usuario   |
| operador  | operador123 | Operador  |

## 📡 API Endpoints

### Autenticación
- `POST /api/login` - Iniciar sesión

### Forza Integration
- `POST /api/forza/quote` - Cotizar envío
- `POST /api/forza/shipment` - Crear envío
- `POST /api/forza/tracking` - Rastrear envío
- `GET /api/forza/status` - Estado de Forza API

### Gestión
- `GET /api/health` - Estado del sistema
- `POST /api/shipments` - Listar envíos
- `POST /api/quotes` - Listar cotizaciones
- `GET /api/db-status` - Estado de la base de datos

## 🔧 Configuración Forza API

Para habilitar la integración completa con Forza API, edita `backend/.env`:

```env
FORZA_API_KEY=tu_api_key_aqui
FORZA_CLIENT_ID=tu_client_id_aqui
FORZA_ENABLED=true
```

## 🎨 Funcionalidades

### Página Principal (index.html)
- ✅ Cotización de envíos (sin login)
- ✅ Rastreo de paquetes (sin login)
- ✅ Sistema de login

### Dashboard Completo (dashboard.html)
- ✅ Todas las funciones de la página principal
- ✅ Crear nuevos envíos
- ✅ Gestión de envíos y cotizaciones
- ✅ Panel de administración

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de Datos**: MongoDB
- **Frontend**: HTML5 + CSS3 + JavaScript
- **API Externa**: Forza Ecommerce Engine
- **Autenticación**: bcrypt

## 📊 Sistema de Fallback

El sistema incluye un mecanismo de fallback local que permite:
- ✅ Generar cotizaciones locales cuando Forza API no esté disponible
- ✅ Simular tracking de envíos
- ✅ Mantener funcionalidad completa sin dependencia externa

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de datos en backend
- ✅ Sanitización de inputs
- ✅ CORS configurado

## 📝 Licencia

MIT License

## 🆘 Soporte

Para problemas o dudas, revisar el archivo `PROBLEMAS_RESUELTOS.md`.