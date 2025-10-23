const BaseService = require('./BaseService');
const { executeQuery } = require('../config/database');

// Servicio para Clientes
class ClienteService extends BaseService {
    constructor() {
        super('cliente');
    }

    async getById(id) {
        return await super.findOneBy('id_cliente', id);
    }

    async update(id, data) {
        try {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${this.tableName} SET ${fields} WHERE id_cliente = ?`;
            const result = await executeQuery(query, values);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, data: { id_cliente: id, ...data } };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async delete(id) {
        try {
            const query = `DELETE FROM ${this.tableName} WHERE id_cliente = ?`;
            const result = await executeQuery(query, [id]);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, message: 'Registro eliminado correctamente' };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obtener clientes con información completa
    async getAllComplete(filters = {}, pagination = {}) {
        try {
            let query = `
                SELECT c.*, u.nombre, u.correo, u.telefono,
                       d.pais, d.departamento, d.municipio, d.aldea, d.zona, d.direccion_detalle
                FROM cliente c
                LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
                LEFT JOIN direccion d ON c.id_direccion = d.id_direccion
            `;

            let countQuery = `
                SELECT COUNT(*) as total
                FROM cliente c
                LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
                LEFT JOIN direccion d ON c.id_direccion = d.id_direccion
            `;

            let params = [];
            let conditions = [];

            // Aplicar filtros
            if (filters.nombre) {
                conditions.push('u.nombre LIKE ?');
                params.push(`%${filters.nombre}%`);
            }
            if (filters.correo) {
                conditions.push('u.correo LIKE ?');
                params.push(`%${filters.correo}%`);
            }
            if (filters.telefono) {
                conditions.push('u.telefono LIKE ?');
                params.push(`%${filters.telefono}%`);
            }
            if (filters.departamento) {
                conditions.push('d.departamento LIKE ?');
                params.push(`%${filters.departamento}%`);
            }
            if (filters.municipio) {
                conditions.push('d.municipio LIKE ?');
                params.push(`%${filters.municipio}%`);
            }
            if (filters.nit) {
                conditions.push('c.nit LIKE ?');
                params.push(`%${filters.nit}%`);
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
                const order = pagination.sortOrder || 'ASC';
                query += ` ORDER BY u.${pagination.sortBy} ${order}`;
            } else {
                query += ` ORDER BY u.nombre ASC`;
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

    // Obtener cliente por usuario
    async getByUsuario(idUsuario) {
        return await this.findOneBy('id_usuario', idUsuario);
    }
}

// Servicio para Empleados
class EmpleadoService extends BaseService {
    constructor() {
        super('empleado');
    }

    async getById(id) {
        return await super.findOneBy('id_empleado', id);
    }

    async update(id, data) {
        try {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${this.tableName} SET ${fields} WHERE id_empleado = ?`;
            const result = await executeQuery(query, values);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, data: { id_empleado: id, ...data } };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async delete(id) {
        try {
            const query = `DELETE FROM ${this.tableName} WHERE id_empleado = ?`;
            const result = await executeQuery(query, [id]);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, message: 'Registro eliminado correctamente' };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obtener empleados con información completa
    async getAllComplete(filters = {}, pagination = {}) {
        try {
            let query = `
                SELECT e.*, u.nombre, u.correo, u.telefono,
                       s.nombre as sucursal_nombre, s.telefono as sucursal_telefono,
                       d.departamento, d.municipio
                FROM empleado e
                LEFT JOIN usuario u ON e.id_usuario = u.id_usuario
                LEFT JOIN sucursal s ON e.id_sucursal = s.id_sucursal
                LEFT JOIN direccion d ON s.id_direccion = d.id_direccion
            `;

            let countQuery = `
                SELECT COUNT(*) as total
                FROM empleado e
                LEFT JOIN usuario u ON e.id_usuario = u.id_usuario
                LEFT JOIN sucursal s ON e.id_sucursal = s.id_sucursal
            `;

            let params = [];
            let conditions = [];

            // Aplicar filtros
            if (filters.nombre) {
                conditions.push('u.nombre LIKE ?');
                params.push(`%${filters.nombre}%`);
            }
            if (filters.puesto) {
                conditions.push('e.puesto LIKE ?');
                params.push(`%${filters.puesto}%`);
            }
            if (filters.id_sucursal) {
                conditions.push('e.id_sucursal = ?');
                params.push(filters.id_sucursal);
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
                const order = pagination.sortOrder || 'ASC';
                query += ` ORDER BY u.${pagination.sortBy} ${order}`;
            } else {
                query += ` ORDER BY u.nombre ASC`;
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

    // Obtener empleado por usuario
    async getByUsuario(idUsuario) {
        return await this.findOneBy('id_usuario', idUsuario);
    }

    // Obtener empleados por sucursal
    async getBySucursal(idSucursal) {
        return await this.findBy('id_sucursal', idSucursal);
    }
}

// Servicio para Estados de Envío
class EstadoEnvioService extends BaseService {
    constructor() {
        super('estado_envio');
    }

    async getById(id) {
        return await super.findOneBy('id_estado', id);
    }

    async update(id, data) {
        try {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${this.tableName} SET ${fields} WHERE id_estado = ?`;
            const result = await executeQuery(query, values);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, data: { id_estado: id, ...data } };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async delete(id) {
        try {
            const query = `DELETE FROM ${this.tableName} WHERE id_estado = ?`;
            const result = await executeQuery(query, [id]);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, message: 'Registro eliminado correctamente' };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = {
    ClienteService,
    EmpleadoService,
    EstadoEnvioService
};