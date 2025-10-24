const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Importar configuración de base de datos
const { checkConnection } = require('./config/database');

// Importar servicios
const UsuarioService = require('./services/UsuarioService');
const GuiaEnvioService = require('./services/GuiaEnvioService');
const { RolService, DireccionService, SucursalService, BodegaService } = require('./services/CatalogoServices');
const { ClienteService, EmpleadoService, EstadoEnvioService } = require('./services/PersonaServices');

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Instanciar servicios
const usuarioService = new UsuarioService();
const guiaService = new GuiaEnvioService();
const rolService = new RolService();
const direccionService = new DireccionService();
const sucursalService = new SucursalService();
const bodegaService = new BodegaService();
const clienteService = new ClienteService();
const empleadoService = new EmpleadoService();
const estadoService = new EstadoEnvioService();

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token de acceso requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// ===================================================
// RUTAS DE AUTENTICACIÓN
// ===================================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        
        if (!correo || !contrasena) {
            return res.status(400).json({ 
                success: false, 
                error: 'Correo y contraseña son requeridos' 
            });
        }

        const result = await usuarioService.login(correo, contrasena);
        
        if (result.success) {
            const token = jwt.sign(
                { 
                    id: result.data.usuario.id_usuario, 
                    correo: result.data.usuario.correo,
                    rol: result.data.rol?.nombre_rol 
                },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                data: {
                    token,
                    usuario: result.data.usuario,
                    rol: result.data.rol
                }
            });
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===================================================
// RUTA DE COTIZACIÓN
// ===================================================
app.post('/api/cotizar', async (req, res) => {
    try {
        const { origen, destino, paquetes, servicio } = req.body;
        
        if (!origen || !destino || !paquetes || paquetes.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Origen, destino y paquetes son requeridos' 
            });
        }

        // Calcular costos
        let costoBase = 25.00; // Costo base de envío
        let costoDistancia = 0;
        let costoTamano = 0;
        let costoSeguro = 0;

        // Costo por distancia (simulado)
        if (origen !== destino) {
            costoDistancia = 15.00;
        }

        // Calcular costo por cada paquete
        paquetes.forEach((paquete) => {
            const volumen = (paquete.largo || 10) * (paquete.ancho || 10) * (paquete.alto || 10) / 1000;
            costoTamano += volumen * 2; // $2 por litro
            
            if (paquete.valor_declarado > 0) {
                costoSeguro += paquete.valor_declarado * 0.02; // 2% del valor declarado
            }
        });

        const costoTotal = (costoBase + costoDistancia + costoTamano + costoSeguro) * (paquetes.length || 1);
        
        // Tiempo estimado de entrega (días)
        let tiempoEstimado = origen === destino ? 1 : 3;

        // Preparar paquetes con desglose de costos
        const paquetesConCostos = paquetes.map((paquete, index) => {
            const volumen = (paquete.largo || 10) * (paquete.ancho || 10) * (paquete.alto || 10) / 1000;
            const costoTamanoPaquete = volumen * 2;
            const costoSeguroPaquete = paquete.valor_declarado > 0 ? paquete.valor_declarado * 0.02 : 0;
            const costoDistanciaPaquete = origen !== destino ? 15.00 / paquetes.length : 0;
            const totalPaquete = costoBase + costoDistanciaPaquete + costoTamanoPaquete + costoSeguroPaquete;

            return {
                id: paquete.id || `paquete-${index + 1}`,
                tipo: paquete.tipo || 'paquete',
                nombre: paquete.nombrePersonalizado || `Paquete ${index + 1}`,
                peso: paquete.peso || 0,
                dimensiones: {
                    largo: paquete.largo || 10,
                    ancho: paquete.ancho || 10,
                    alto: paquete.alto || 10
                },
                volumen: parseFloat(volumen.toFixed(2)),
                valor_declarado: paquete.valor_declarado || 0,
                breakdown: {
                    base: parseFloat(costoBase.toFixed(2)),
                    distancia: parseFloat(costoDistanciaPaquete.toFixed(2)),
                    tamano: parseFloat(costoTamanoPaquete.toFixed(2)),
                    seguro: parseFloat(costoSeguroPaquete.toFixed(2)),
                    total: parseFloat(totalPaquete.toFixed(2))
                }
            };
        });

        const cotizacion = {
            origen: {
                nombre: origen,
                display: origen,
                departamento: origen
            },
            destino: {
                nombre: destino,
                display: destino,
                departamento: destino
            },
            distancia: {
                distanceText: origen === destino ? '0 km' : '150 km',
                durationText: `${tiempoEstimado} día(s)`
            },
            paquetes: paquetesConCostos,
            servicios: [
                {
                    id: 'estandar',
                    nombre: 'Envío Estándar',
                    descripcion: `Entrega en ${tiempoEstimado} día(s) hábiles`,
                    precio: parseFloat(costoTotal.toFixed(2)),
                    tiempo: `${tiempoEstimado} día(s)`
                }
            ],
            servicio_seleccionado: servicio || 'estandar',
            costos_desglose: {
                base: parseFloat(costoBase.toFixed(2)),
                distancia: parseFloat(costoDistancia.toFixed(2)),
                tamano: parseFloat(costoTamano.toFixed(2)),
                seguro: parseFloat(costoSeguro.toFixed(2))
            },
            total_general: parseFloat(costoTotal.toFixed(2)),
            moneda: 'GTQ',
            tiempo_entrega: `${tiempoEstimado} día(s) hábiles`,
            validoHasta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        };

        res.json({
            success: true,
            message: 'Cotización generada exitosamente',
            cotizacion
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===================================================
// RUTA DE RASTREO
// ===================================================
app.get('/api/rastreo/:numeroGuia', async (req, res) => {
    try {
        const { numeroGuia } = req.params;
        const pool = require('./config/database').pool;
        const connection = await pool.getConnection();

        // Intentar buscar en guias_envio primero, luego en guia_envio
        let guias = [];
        try {
            [guias] = await connection.query(
                `SELECT g.*, 
                        e.nombre as estado_actual,
                        e.descripcion as estado_descripcion,
                        e.color as estado_color,
                        pr.nombre as remitente_nombre,
                        pr.apellido as remitente_apellido,
                        pr.telefono as remitente_telefono,
                        pr.direccion as remitente_direccion,
                        pd.nombre as destinatario_nombre,
                        pd.apellido as destinatario_apellido,
                        pd.telefono as destinatario_telefono,
                        pd.direccion as destinatario_direccion,
                        bo.nombre as bodega_origen_nombre,
                        bd.nombre as bodega_destino_nombre
                 FROM guias_envio g
                 LEFT JOIN estados_envio e ON g.id_estado = e.id
                 LEFT JOIN personas pr ON g.id_remitente = pr.id
                 LEFT JOIN personas pd ON g.id_destinatario = pd.id
                 LEFT JOIN bodegas bo ON g.id_bodega_origen = bo.id
                 LEFT JOIN bodegas bd ON g.id_bodega_destino = bd.id
                 WHERE g.numero_guia = ?`,
                [numeroGuia]
            );
        } catch (err) {
            // Si falla, intentar con guia_envio (singular)
            [guias] = await connection.query(
                `SELECT g.*, 
                        e.nombre as estado_actual,
                        e.descripcion as estado_descripcion,
                        e.color as estado_color
                 FROM guia_envio g
                 LEFT JOIN estado_envio e ON g.id_estado = e.id
                 WHERE g.numero_guia = ?`,
                [numeroGuia]
            );
        }

        if (guias.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                error: 'Número de guía no encontrado'
            });
        }

        const guia = guias[0];

        // Obtener historial de tracking
        const [tracking] = await connection.query(
            `SELECT t.*,
                    e.nombre as estado_nombre,
                    e.descripcion as estado_descripcion,
                    e.color as estado_color,
                    b.nombre as bodega_nombre,
                    u.nombre as usuario_nombre
             FROM tracking t
             INNER JOIN estados_envio e ON t.id_estado = e.id
             LEFT JOIN bodegas b ON t.id_bodega = b.id
             LEFT JOIN usuarios u ON t.id_usuario = u.id
             WHERE t.id_guia = ?
             ORDER BY t.fecha_registro ASC`,
            [guia.id]
        );

        connection.release();

        // Calcular progreso basado en el estado actual
        const estadosProgreso = {
            'PENDIENTE': { paso: 1, porcentaje: 0, completado: false },
            'RECOLECTADO': { paso: 2, porcentaje: 25, completado: false },
            'EN_BODEGA': { paso: 3, porcentaje: 50, completado: false },
            'EN_TRANSITO': { paso: 4, porcentaje: 65, completado: false },
            'EN_DISTRIBUCION': { paso: 5, porcentaje: 85, completado: false },
            'ENTREGADO': { paso: 6, porcentaje: 100, completado: true },
            'DEVUELTO': { paso: 0, porcentaje: 0, completado: true },
            'CANCELADO': { paso: 0, porcentaje: 0, completado: true }
        };

        const estadoActual = guia.estado_actual || 'PENDIENTE';
        const progreso = estadosProgreso[estadoActual] || estadosProgreso['PENDIENTE'];

        // Crear línea de tiempo de estados
        const timelineEstados = [
            {
                nombre: 'Pendiente',
                codigo: 'PENDIENTE',
                icono: '',
                completado: progreso.paso >= 1,
                activo: estadoActual === 'PENDIENTE'
            },
            {
                nombre: 'Recolectado',
                codigo: 'RECOLECTADO',
                icono: '',
                completado: progreso.paso >= 2,
                activo: estadoActual === 'RECOLECTADO'
            },
            {
                nombre: 'En Bodega',
                codigo: 'EN_BODEGA',
                icono: '',
                completado: progreso.paso >= 3,
                activo: estadoActual === 'EN_BODEGA'
            },
            {
                nombre: 'En Tránsito',
                codigo: 'EN_TRANSITO',
                icono: '',
                completado: progreso.paso >= 4,
                activo: estadoActual === 'EN_TRANSITO'
            },
            {
                nombre: 'En Distribución',
                codigo: 'EN_DISTRIBUCION',
                icono: '',
                completado: progreso.paso >= 5,
                activo: estadoActual === 'EN_DISTRIBUCION'
            },
            {
                nombre: 'Entregado',
                codigo: 'ENTREGADO',
                icono: '',
                completado: progreso.paso >= 6,
                activo: estadoActual === 'ENTREGADO'
            }
        ];

        // Formatear tracking history
        const historial = tracking.map(t => ({
            id: t.id,
            fecha: t.fecha_registro,
            estado: t.estado_nombre,
            descripcion: t.estado_descripcion,
            observaciones: t.observaciones,
            ubicacion: t.bodega_nombre,
            color: t.estado_color,
            usuario: t.usuario_nombre
        }));

        res.json({
            success: true,
            data: {
                guia: {
                    numero_guia: guia.numero_guia,
                    tipo_envio: guia.tipo_envio,
                    peso: guia.peso,
                    descripcion: guia.descripcion_contenido,
                    valor_declarado: guia.valor_declarado,
                    costo_total: guia.costo_total,
                    fecha_creacion: guia.fecha_creacion,
                    fecha_estimada_entrega: guia.fecha_estimada_entrega,
                    estado_actual: {
                        nombre: estadoActual,
                        descripcion: guia.estado_descripcion,
                        color: guia.estado_color
                    },
                    remitente: {
                        nombre: `${guia.remitente_nombre || ''} ${guia.remitente_apellido || ''}`.trim(),
                        telefono: guia.remitente_telefono,
                        direccion: guia.remitente_direccion
                    },
                    destinatario: {
                        nombre: `${guia.destinatario_nombre || ''} ${guia.destinatario_apellido || ''}`.trim(),
                        telefono: guia.destinatario_telefono,
                        direccion: guia.destinatario_direccion
                    },
                    bodega_origen: guia.bodega_origen_nombre,
                    bodega_destino: guia.bodega_destino_nombre,
                    notas: guia.notas
                },
                progreso: {
                    porcentaje: progreso.porcentaje,
                    paso_actual: progreso.paso,
                    completado: progreso.completado,
                    timeline: timelineEstados
                },
                historial: historial
            }
        });

    } catch (error) {
        console.error('Error en rastreo:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al consultar el rastreo del envío' 
        });
    }
});

// ===================================================
// RUTAS DE USUARIOS
// ===================================================
app.get('/api/usuarios', authenticateToken, async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, ...filters } = req.query;
        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sortBy,
            sortOrder
        };
        
        const result = await usuarioService.getAllWithRoles(filters, pagination);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/usuarios/:id', authenticateToken, async (req, res) => {
    try {
        const result = await usuarioService.findOneBy('id_usuario', req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/usuarios', authenticateToken, async (req, res) => {
    try {
        const result = await usuarioService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/usuarios/:id', authenticateToken, async (req, res) => {
    try {
        const result = await usuarioService.update(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/usuarios/:id', authenticateToken, async (req, res) => {
    try {
        const result = await usuarioService.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===================================================
// RUTAS DE GUÍAS DE ENVÍO
// ===================================================
app.get('/api/guias', authenticateToken, async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, ...filters } = req.query;
        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sortBy,
            sortOrder
        };
        
        const result = await guiaService.getAllComplete(filters, pagination);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/guias/:id', authenticateToken, async (req, res) => {
    try {
        const result = await guiaService.getById(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/guias', authenticateToken, async (req, res) => {
    try {
        const result = await guiaService.createComplete(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/seguimiento/:numeroGuia', async (req, res) => {
    try {
        const result = await guiaService.getSeguimiento(req.params.numeroGuia);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/guias/:id/estado', authenticateToken, async (req, res) => {
    try {
        const { id_estado, ubicacion, coordenadas } = req.body;
        const result = await guiaService.actualizarEstado(req.params.id, id_estado, ubicacion, coordenadas);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===================================================
// RUTAS DE CATÁLOGOS
// ===================================================

// Roles
app.get('/api/roles', authenticateToken, async (req, res) => {
    try {
        const result = await rolService.getAll();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/roles', authenticateToken, async (req, res) => {
    try {
        const result = await rolService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Direcciones
app.get('/api/direcciones', authenticateToken, async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, ...filters } = req.query;
        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sortBy,
            sortOrder
        };
        const result = await direccionService.getAll(filters, pagination);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/direcciones', authenticateToken, async (req, res) => {
    try {
        const result = await direccionService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Sucursales
app.get('/api/sucursales', authenticateToken, async (req, res) => {
    try {
        const result = await sucursalService.getAllWithDirecciones();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/sucursales', authenticateToken, async (req, res) => {
    try {
        const result = await sucursalService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Bodegas
app.get('/api/bodegas', authenticateToken, async (req, res) => {
    try {
        const result = await bodegaService.getAllWithSucursales();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/bodegas/sucursal/:idSucursal', authenticateToken, async (req, res) => {
    try {
        const result = await bodegaService.getBySucursal(req.params.idSucursal);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/bodegas', authenticateToken, async (req, res) => {
    try {
        const result = await bodegaService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Estados de envío
app.get('/api/estados', async (req, res) => {
    try {
        const result = await estadoService.getAll();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===================================================
// RUTAS DE CLIENTES Y EMPLEADOS
// ===================================================

// Clientes
app.get('/api/clientes', authenticateToken, async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, ...filters } = req.query;
        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sortBy,
            sortOrder
        };
        const result = await clienteService.getAllComplete(filters, pagination);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/clientes', authenticateToken, async (req, res) => {
    try {
        const result = await clienteService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Empleados
app.get('/api/empleados', authenticateToken, async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder, ...filters } = req.query;
        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sortBy,
            sortOrder
        };
        const result = await empleadoService.getAllComplete(filters, pagination);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/empleados', authenticateToken, async (req, res) => {
    try {
        const result = await empleadoService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===================================================
// RUTA DE SALUD Y INICIALIZACIÓN
// ===================================================
app.get('/api/health', async (req, res) => {
    const dbStatus = await checkConnection();
    res.json({
        status: 'OK',
        database: dbStatus ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// ===================================================
// RUTAS DE GESTIÓN DE BASE DE DATOS (ADMIN)
// ===================================================

// Obtener estado de conexión de BD
app.get('/api/database/status', authenticateToken, async (req, res) => {
    try {
        const pool = require('./config/database').pool;
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT DATABASE() as db, VERSION() as version, NOW() as time');
        connection.release();
        
        res.json({
            success: true,
            data: {
                connected: true,
                database: rows[0].db,
                version: rows[0].version,
                serverTime: rows[0].time
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            connected: false,
            error: error.message 
        });
    }
});

// Listar todas las tablas
app.get('/api/database/tables', authenticateToken, async (req, res) => {
    try {
        const pool = require('./config/database').pool;
        const connection = await pool.getConnection();
        const [tables] = await connection.query('SHOW TABLES');
        
        const tableList = [];
        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            
            // Obtener número de registros
            const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            const count = countResult[0].count;
            
            // Obtener columnas
            const [columns] = await connection.query(`DESCRIBE ${tableName}`);
            
            tableList.push({
                name: tableName,
                rowCount: count,
                columns: columns.map(col => ({
                    name: col.Field,
                    type: col.Type,
                    null: col.Null === 'YES',
                    key: col.Key,
                    default: col.Default,
                    extra: col.Extra
                }))
            });
        }
        
        connection.release();
        
        res.json({
            success: true,
            data: tableList
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Consultar datos de una tabla específica
app.get('/api/database/tables/:tableName', authenticateToken, async (req, res) => {
    try {
        const { tableName } = req.params;
        const { limit = 100, offset = 0 } = req.query;
        
        const pool = require('./config/database').pool;
        const connection = await pool.getConnection();
        
        // Validar que la tabla existe
        const [tables] = await connection.query('SHOW TABLES');
        const tableExists = tables.some(t => Object.values(t)[0] === tableName);
        
        if (!tableExists) {
            connection.release();
            return res.status(404).json({ 
                success: false, 
                error: 'Tabla no encontrada' 
            });
        }
        
        // Obtener datos
        const [rows] = await connection.query(
            `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, 
            [parseInt(limit), parseInt(offset)]
        );
        
        // Obtener total de registros
        const [countResult] = await connection.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        const total = countResult[0].total;
        
        connection.release();
        
        res.json({
            success: true,
            data: {
                tableName,
                rows,
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ejecutar consulta SQL personalizada (con restricciones de seguridad)
app.post('/api/database/query', authenticateToken, async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ 
                success: false, 
                error: 'Query SQL es requerido' 
            });
        }
        
        // Validar que solo sean consultas SELECT
        const trimmedQuery = query.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT')) {
            return res.status(403).json({ 
                success: false, 
                error: 'Solo se permiten consultas SELECT por seguridad' 
            });
        }
        
        const pool = require('./config/database').pool;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        connection.release();
        
        res.json({
            success: true,
            data: {
                rows,
                count: rows.length
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Obtener estadísticas de la base de datos
app.get('/api/database/stats', authenticateToken, async (req, res) => {
    try {
        const pool = require('./config/database').pool;
        const connection = await pool.getConnection();
        
        // Obtener información de todas las tablas
        const [tables] = await connection.query('SHOW TABLES');
        const stats = {
            totalTables: tables.length,
            tables: []
        };
        
        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            stats.tables.push({
                name: tableName,
                rowCount: countResult[0].count
            });
        }
        
        connection.release();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: 'API EnviosDS - Sistema de Gestión de Envíos',
        version: '1.0.0',
        endpoints: [
            'GET /api/health - Estado del sistema',
            'POST /api/auth/login - Autenticación',
            'GET /api/guias - Listar guías',
            'POST /api/guias - Crear guía',
            'GET /api/seguimiento/:numeroGuia - Rastrear envío',
            'GET /api/database/status - Estado de BD',
            'GET /api/database/tables - Listar tablas',
            'GET /api/database/tables/:tableName - Consultar tabla',
            'POST /api/database/query - Ejecutar consulta SQL',
            'GET /api/database/stats - Estadísticas de BD'
        ]
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(` Servidor ejecutándose en puerto ${PORT}`);
    console.log(` API disponible en http://localhost:${PORT}`);
    
    // Verificar conexión a la base de datos
    const dbConnected = await checkConnection();
    if (dbConnected) {
        console.log(' Conexión a MySQL establecida');
    } else {
        console.log(' No se pudo conectar a MySQL');
    }
});

module.exports = app;