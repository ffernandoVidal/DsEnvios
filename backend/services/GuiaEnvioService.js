const BaseService = require('./BaseService');
const { executeQuery, executeTransaction } = require('../config/database');

class GuiaEnvioService extends BaseService {
    constructor() {
        super('guia_envio');
    }

    // Generar número de guía único
    generateGuiaNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `DS${year}${month}${day}${random}`;
    }

    // Crear guía completa con remitente y destinatario
    async createComplete(data) {
        try {
            const queries = [];
            let remitenteId, destinatarioId;

            // Si se proporciona dirección del remitente, crearla
            if (data.direccion_remitente) {
                queries.push({
                    query: 'INSERT INTO direccion (departamento, municipio, aldea, zona, direccion_detalle, pais) VALUES (?, ?, ?, ?, ?, ?)',
                    params: [
                        data.direccion_remitente.departamento,
                        data.direccion_remitente.municipio,
                        data.direccion_remitente.aldea || null,
                        data.direccion_remitente.zona || null,
                        data.direccion_remitente.direccion_detalle || null,
                        data.direccion_remitente.pais || 'Guatemala'
                    ]
                });
            }

            // Si se proporciona dirección del destinatario, crearla
            if (data.direccion_destinatario) {
                queries.push({
                    query: 'INSERT INTO direccion (departamento, municipio, aldea, zona, direccion_detalle, pais) VALUES (?, ?, ?, ?, ?, ?)',
                    params: [
                        data.direccion_destinatario.departamento,
                        data.direccion_destinatario.municipio,
                        data.direccion_destinatario.aldea || null,
                        data.direccion_destinatario.zona || null,
                        data.direccion_destinatario.direccion_detalle || null,
                        data.direccion_destinatario.pais || 'Guatemala'
                    ]
                });
            }

            const transactionResult = await executeTransaction(queries);
            if (!transactionResult.success) {
                return transactionResult;
            }

            let direccionIndex = 0;
            const direccionRemitente = data.direccion_remitente ? transactionResult.data[direccionIndex++].insertId : data.remitente.id_direccion;
            const direccionDestinatario = data.direccion_destinatario ? transactionResult.data[direccionIndex++].insertId : data.destinatario.id_direccion;

            // Crear remitente
            const remitenteData = {
                ...data.remitente,
                id_direccion: direccionRemitente
            };
            const remitenteResult = await executeQuery(
                'INSERT INTO remitente (nombre, telefono, id_direccion) VALUES (?, ?, ?)',
                [remitenteData.nombre, remitenteData.telefono, remitenteData.id_direccion]
            );

            if (!remitenteResult.success) {
                return remitenteResult;
            }
            remitenteId = remitenteResult.data.insertId;

            // Crear destinatario
            const destinatarioData = {
                ...data.destinatario,
                id_direccion: direccionDestinatario
            };
            const destinatarioResult = await executeQuery(
                'INSERT INTO destinatario (nombre, telefono, id_direccion) VALUES (?, ?, ?)',
                [destinatarioData.nombre, destinatarioData.telefono, destinatarioData.id_direccion]
            );

            if (!destinatarioResult.success) {
                return destinatarioResult;
            }
            destinatarioId = destinatarioResult.data.insertId;

            // Crear guía
            const guiaData = {
                ...data.guia,
                numero_guia: this.generateGuiaNumber(),
                id_remitente: remitenteId,
                id_destinatario: destinatarioId
            };

            const guiaResult = await executeQuery(
                'INSERT INTO guia_envio (numero_guia, id_remitente, id_destinatario, id_bodega_origen, id_bodega_destino, peso, dimensiones, tipo_envio, costo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    guiaData.numero_guia,
                    guiaData.id_remitente,
                    guiaData.id_destinatario,
                    guiaData.id_bodega_origen,
                    guiaData.id_bodega_destino,
                    guiaData.peso,
                    guiaData.dimensiones,
                    guiaData.tipo_envio,
                    guiaData.costo
                ]
            );

            if (!guiaResult.success) {
                return guiaResult;
            }

            // Crear seguimiento inicial
            await executeQuery(
                'INSERT INTO seguimiento (id_guia, id_estado, ubicacion_actual) VALUES (?, ?, ?)',
                [guiaResult.data.insertId, 1, 'En preparación']
            );

            return {
                success: true,
                data: {
                    id_guia: guiaResult.data.insertId,
                    numero_guia: guiaData.numero_guia,
                    ...guiaData
                }
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obtener guías con información completa
    async getAllComplete(filters = {}, pagination = {}) {
        try {
            let query = `
                SELECT 
                    g.*,
                    r.nombre as remitente_nombre, r.telefono as remitente_telefono,
                    d.nombre as destinatario_nombre, d.telefono as destinatario_telefono,
                    bo.nombre as bodega_origen_nombre,
                    bd.nombre as bodega_destino_nombre,
                    dr.departamento as remitente_departamento, dr.municipio as remitente_municipio,
                    dd.departamento as destinatario_departamento, dd.municipio as destinatario_municipio,
                    es.nombre_estado as estado_actual
                FROM guia_envio g
                LEFT JOIN remitente r ON g.id_remitente = r.id_remitente
                LEFT JOIN destinatario d ON g.id_destinatario = d.id_destinatario
                LEFT JOIN bodega bo ON g.id_bodega_origen = bo.id_bodega
                LEFT JOIN bodega bd ON g.id_bodega_destino = bd.id_bodega
                LEFT JOIN direccion dr ON r.id_direccion = dr.id_direccion
                LEFT JOIN direccion dd ON d.id_direccion = dd.id_direccion
                LEFT JOIN (
                    SELECT s1.id_guia, es.nombre_estado
                    FROM seguimiento s1
                    INNER JOIN estado_envio es ON s1.id_estado = es.id_estado
                    WHERE s1.fecha_actualizacion = (
                        SELECT MAX(s2.fecha_actualizacion)
                        FROM seguimiento s2
                        WHERE s2.id_guia = s1.id_guia
                    )
                ) es ON g.id_guia = es.id_guia
            `;

            let countQuery = `
                SELECT COUNT(*) as total
                FROM guia_envio g
                LEFT JOIN remitente r ON g.id_remitente = r.id_remitente
                LEFT JOIN destinatario d ON g.id_destinatario = d.id_destinatario
            `;

            let params = [];
            let conditions = [];

            // Aplicar filtros
            if (filters.numero_guia) {
                conditions.push('g.numero_guia LIKE ?');
                params.push(`%${filters.numero_guia}%`);
            }
            if (filters.tipo_envio) {
                conditions.push('g.tipo_envio = ?');
                params.push(filters.tipo_envio);
            }
            if (filters.id_bodega_origen) {
                conditions.push('g.id_bodega_origen = ?');
                params.push(filters.id_bodega_origen);
            }
            if (filters.id_bodega_destino) {
                conditions.push('g.id_bodega_destino = ?');
                params.push(filters.id_bodega_destino);
            }
            if (filters.fecha_inicio) {
                conditions.push('DATE(g.fecha_creacion) >= ?');
                params.push(filters.fecha_inicio);
            }
            if (filters.fecha_fin) {
                conditions.push('DATE(g.fecha_creacion) <= ?');
                params.push(filters.fecha_fin);
            }

            if (conditions.length > 0) {
                const whereClause = ` WHERE ${conditions.join(' AND ')}`;
                query += whereClause;
                countQuery += whereClause;
            }

            // Obtener total
            const countResult = await executeQuery(countQuery, params);
            if (!countResult.success) return countResult;
            
            const total = countResult.data[0].total;

            // Aplicar ordenamiento
            if (pagination.sortBy) {
                const order = pagination.sortOrder || 'DESC';
                query += ` ORDER BY g.${pagination.sortBy} ${order}`;
            } else {
                query += ` ORDER BY g.fecha_creacion DESC`;
            }

            // Aplicar paginación
            if (pagination.page && pagination.limit) {
                const offset = (pagination.page - 1) * pagination.limit;
                query += ` LIMIT ${pagination.limit} OFFSET ${offset}`;
            }

            const result = await executeQuery(query, params);
            
            if (result.success) {
                return {
                    success: true,
                    data: {
                        items: result.data,
                        total,
                        page: pagination.page || 1,
                        limit: pagination.limit || total,
                        totalPages: pagination.limit ? Math.ceil(total / pagination.limit) : 1
                    }
                };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obtener seguimiento de una guía
    async getSeguimiento(numeroGuia) {
        try {
            const query = `
                SELECT 
                    g.*,
                    r.nombre as remitente_nombre, r.telefono as remitente_telefono,
                    d.nombre as destinatario_nombre, d.telefono as destinatario_telefono,
                    bo.nombre as bodega_origen_nombre,
                    bd.nombre as bodega_destino_nombre
                FROM guia_envio g
                LEFT JOIN remitente r ON g.id_remitente = r.id_remitente
                LEFT JOIN destinatario d ON g.id_destinatario = d.id_destinatario
                LEFT JOIN bodega bo ON g.id_bodega_origen = bo.id_bodega
                LEFT JOIN bodega bd ON g.id_bodega_destino = bd.id_bodega
                WHERE g.numero_guia = ?
            `;

            const guiaResult = await executeQuery(query, [numeroGuia]);
            if (!guiaResult.success || guiaResult.data.length === 0) {
                return { success: false, error: 'Guía no encontrada' };
            }

            const seguimientoQuery = `
                SELECT s.*, es.nombre_estado
                FROM seguimiento s
                LEFT JOIN estado_envio es ON s.id_estado = es.id_estado
                WHERE s.id_guia = ?
                ORDER BY s.fecha_actualizacion DESC
            `;

            const seguimientoResult = await executeQuery(seguimientoQuery, [guiaResult.data[0].id_guia]);
            
            return {
                success: true,
                data: {
                    guia: guiaResult.data[0],
                    seguimientos: seguimientoResult.success ? seguimientoResult.data : [],
                    estado_actual: seguimientoResult.success && seguimientoResult.data.length > 0 ? 
                        seguimientoResult.data[0] : null
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Actualizar estado de guía
    async actualizarEstado(idGuia, idEstado, ubicacion = '', coordenadas = '') {
        try {
            const result = await executeQuery(
                'INSERT INTO seguimiento (id_guia, id_estado, ubicacion_actual, coordenadas_gps) VALUES (?, ?, ?, ?)',
                [idGuia, idEstado, ubicacion, coordenadas]
            );

            if (result.success) {
                return { success: true, message: 'Estado actualizado correctamente' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = GuiaEnvioService;