const BaseService = require('./BaseService');
const { executeQuery } = require('../config/database');
const bcrypt = require('bcrypt');

class UsuarioService extends BaseService {
    constructor() {
        super('usuarios');
    }

    // Crear usuario con hash de contraseña
    async create(data) {
        try {
            if (data.contrasena) {
                data.contrasena = await bcrypt.hash(data.contrasena, 10);
            }
            return await super.create(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obtener usuario por correo
    async getByEmail(correo) {
        return await this.findOneBy('correo', correo);
    }

    // Obtener usuarios con rol
    async getAllWithRoles(filters = {}, pagination = {}) {
        try {
            let query = `
                SELECT u.*, r.nombre_rol, r.descripcion as rol_descripcion
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id
            `;
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM usuario u 
                LEFT JOIN rol r ON u.id_rol = r.id_rol
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
            if (filters.id_rol) {
                conditions.push('u.id_rol = ?');
                params.push(filters.id_rol);
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

            // Aplicar paginación y ordenamiento
            if (pagination.sortBy) {
                const order = pagination.sortOrder || 'ASC';
                query += ` ORDER BY u.${pagination.sortBy} ${order}`;
            }

            if (pagination.page && pagination.limit) {
                const offset = (pagination.page - 1) * pagination.limit;
                query += ` LIMIT ${pagination.limit} OFFSET ${offset}`;
            }

            const result = await executeQuery(query, params);
            
            if (result.success) {
                // Remover contraseñas de la respuesta
                const users = result.data.map(user => {
                    const { contrasena, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                });

                return {
                    success: true,
                    data: {
                        items: users,
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

    // Verificar contraseña
    async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            return false;
        }
    }

    // Login
    async login(correo, contrasena) {
        try {
            const userResult = await this.getByEmail(correo);
            if (!userResult.success) {
                return { success: false, error: 'Usuario no encontrado' };
            }

            const user = userResult.data;
            const isValidPassword = await this.verifyPassword(contrasena, user.contrasena);
            
            if (!isValidPassword) {
                return { success: false, error: 'Contraseña incorrecta' };
            }

            // Obtener información del rol
            const roleQuery = 'SELECT * FROM roles WHERE id = ?';
            const roleResult = await executeQuery(roleQuery, [user.id_rol]);
            
            const { contrasena: _, ...userWithoutPassword } = user;
            
            return {
                success: true,
                data: {
                    usuario: userWithoutPassword,
                    rol: roleResult.success ? roleResult.data[0] : null
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = UsuarioService;