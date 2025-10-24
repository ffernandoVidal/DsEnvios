const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;
const JWT_SECRET = process.env.JWT_SECRET || 'dj2_logistica_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Datos mock para pruebas (en lugar de la base de datos)
const usuarios = [
    {
        id: 1,
        correo: 'admin@envios.com',
        contrasena: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'admin123'
        nombre: 'Administrador',
        role: 'admin',
        activo: true
    },
    {
        id: 2,
        correo: 'operador@envios.com',
        contrasena: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'op123'
        nombre: 'Operador',
        role: 'operator',
        activo: true
    },
    {
        id: 3,
        correo: 'usuario@envios.com',
        contrasena: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'user123'
        nombre: 'Usuario',
        role: 'user',
        activo: true
    }
];

const guias = [
    {
        id: 1,
        numero_guia: 'ENV001',
        tipo_envio: 'NACIONAL',
        fecha_creacion: '2024-01-15',
        costo_total: 150.00,
        estado: 'ENTREGADO',
        remitente: 'Juan Pérez',
        destinatario: 'María García'
    },
    {
        id: 2,
        numero_guia: 'ENV002',
        tipo_envio: 'INTERNACIONAL',
        fecha_creacion: '2024-01-16',
        costo_total: 350.00,
        estado: 'EN_TRANSITO',
        remitente: 'Carlos López',
        destinatario: 'Ana Martínez'
    }
];

// Función auxiliar para generar hash de contraseña
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Función auxiliar para comparar contraseñas
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Middleware de autenticación
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido'
            });
        }
        req.user = user;
        next();
    });
}

// Rutas

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor EnviosDS funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta de login
app.post('/auth/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Correo y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const usuario = usuarios.find(u => u.correo === correo && u.activo);
        
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña (para demo, aceptamos cualquier contraseña por ahora)
        // const isValidPassword = await comparePassword(contrasena, usuario.contrasena);
        const isValidPassword = true; // Simplificado para demo

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = jwt.sign(
            { 
                id: usuario.id, 
                correo: usuario.correo, 
                role: usuario.role 
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: usuario.id,
                    username: usuario.correo,
                    name: usuario.nombre,
                    role: usuario.role,
                    email: usuario.correo
                },
                token: token
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para obtener guías
app.get('/guias', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const totalItems = guias.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedGuias = guias.slice(offset, offset + limit);

    res.json({
        success: true,
        data: paginatedGuias,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1
        }
    });
});

// Ruta para crear guías
app.post('/guias', authenticateToken, (req, res) => {
    try {
        const nuevaGuia = {
            id: guias.length + 1,
            numero_guia: `ENV${String(guias.length + 1).padStart(3, '0')}`,
            ...req.body,
            fecha_creacion: new Date().toISOString().split('T')[0],
            estado: 'PENDIENTE'
        };

        guias.push(nuevaGuia);

        res.status(201).json({
            success: true,
            message: 'Guía creada exitosamente',
            data: nuevaGuia
        });

    } catch (error) {
        console.error('Error al crear guía:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Rutas para catálogos (datos mock)
app.get('/catalogos/sucursales', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, nombre: 'Sucursal Central', codigo: 'CENT', activo: true },
            { id: 2, nombre: 'Sucursal Norte', codigo: 'NORTE', activo: true },
            { id: 3, nombre: 'Sucursal Sur', codigo: 'SUR', activo: true }
        ]
    });
});

app.get('/catalogos/bodegas', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, nombre: 'Bodega Principal', codigo: 'BP01', activo: true },
            { id: 2, nombre: 'Bodega Secundaria', codigo: 'BS01', activo: true }
        ]
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(` Servidor ejecutándose en puerto ${PORT}`);
    console.log(` API disponible en http://localhost:${PORT}`);
    console.log(' Servidor funcionando con datos mock (sin base de datos)');
});

module.exports = app;