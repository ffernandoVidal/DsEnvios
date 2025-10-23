const { executeQuery, executeTransaction } = require('../config/database');

class BaseService {
    constructor(tableName) {
        this.tableName = tableName;
    }

    // Crear un nuevo registro
    async create(data) {
        try {
            const fields = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(data);

            const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
            const result = await executeQuery(query, values);

            if (result.success) {
                return { success: true, data: { id: result.data.insertId, ...data } };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obtener todos los registros
    async getAll(filters = {}, pagination = {}) {
        try {
            let query = `SELECT * FROM ${this.tableName}`;
            let countQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
            let params = [];
            let conditions = [];

            // Aplicar filtros
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                    conditions.push(`${key} LIKE ?`);
                    params.push(`%${filters[key]}%`);
                }
            });

            if (conditions.length > 0) {
                const whereClause = ` WHERE ${conditions.join(' AND ')}`;
                query += whereClause;
                countQuery += whereClause;
            }

            // Obtener total de registros
            const countResult = await executeQuery(countQuery, params);
            if (!countResult.success) return countResult;
            
            const total = countResult.data[0].total;

            // Aplicar paginación
            if (pagination.page && pagination.limit) {
                const offset = (pagination.page - 1) * pagination.limit;
                query += ` LIMIT ${pagination.limit} OFFSET ${offset}`;
            }

            // Aplicar ordenamiento
            if (pagination.sortBy) {
                const order = pagination.sortOrder || 'ASC';
                query += ` ORDER BY ${pagination.sortBy} ${order}`;
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

    // Obtener por ID
    async getById(id) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            const result = await executeQuery(query, [id]);
            
            if (result.success && result.data.length > 0) {
                return { success: true, data: result.data[0] };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Actualizar por ID
    async update(id, data) {
        try {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${this.tableName} SET ${fields} WHERE id = ?`;
            const result = await executeQuery(query, values);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, data: { id, ...data } };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Eliminar por ID
    async delete(id) {
        try {
            const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
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

    // Buscar por campo específico
    async findBy(field, value) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE ${field} = ?`;
            const result = await executeQuery(query, [value]);
            
            if (result.success) {
                return { success: true, data: result.data };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Buscar uno por campo específico
    async findOneBy(field, value) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE ${field} = ? LIMIT 1`;
            const result = await executeQuery(query, [value]);
            
            if (result.success && result.data.length > 0) {
                return { success: true, data: result.data[0] };
            } else if (result.success) {
                return { success: false, error: 'Registro no encontrado' };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = BaseService;