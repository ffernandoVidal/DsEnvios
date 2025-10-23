const BaseService = require('./BaseService');
const { executeQuery } = require('../config/database');

// Servicio para Roles
class RolService extends BaseService {
    constructor() {
        super('rol');
    }

    async getById(id) {
        return await super.findOneBy('id_rol', id);
    }

    async update(id, data) {
        try {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${this.tableName} SET ${fields} WHERE id_rol = ?`;
            const result = await executeQuery(query, values);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, data: { id_rol: id, ...data } };
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
            const query = `DELETE FROM ${this.tableName} WHERE id_rol = ?`;
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

// Servicio para Direcciones
class DireccionService extends BaseService {
    constructor() {
        super('direccion');
    }

    async getById(id) {
        return await super.findOneBy('id_direccion', id);
    }

    async update(id, data) {
        try {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${this.tableName} SET ${fields} WHERE id_direccion = ?`;
            const result = await executeQuery(query, values);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, data: { id_direccion: id, ...data } };
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
            const query = `DELETE FROM ${this.tableName} WHERE id_direccion = ?`;
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

    // Buscar direcciones por departamento
    async getByDepartamento(departamento) {
        return await this.findBy('departamento', departamento);
    }

    // Buscar direcciones por municipio
    async getByMunicipio(municipio) {
        return await this.findBy('municipio', municipio);
    }
}

// Servicio para Sucursales
class SucursalService extends BaseService {
    constructor() {
        super('sucursal');
    }

    async getById(id) {
        return await super.findOneBy('id_sucursal', id);
    }

    async update(id, data) {
        try {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${this.tableName} SET ${fields} WHERE id_sucursal = ?`;
            const result = await executeQuery(query, values);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, data: { id_sucursal: id, ...data } };
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
            const query = `DELETE FROM ${this.tableName} WHERE id_sucursal = ?`;
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

    // Obtener sucursales con direcciones
    async getAllWithDirecciones() {
        try {
            const query = `
                SELECT s.*, d.pais, d.departamento, d.municipio, d.aldea, d.zona, d.direccion_detalle
                FROM sucursal s
                LEFT JOIN direccion d ON s.id_direccion = d.id_direccion
                ORDER BY s.nombre
            `;
            const result = await executeQuery(query);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Servicio para Bodegas
class BodegaService extends BaseService {
    constructor() {
        super('bodega');
    }

    async getById(id) {
        return await super.findOneBy('id_bodega', id);
    }

    async update(id, data) {
        try {
            const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${this.tableName} SET ${fields} WHERE id_bodega = ?`;
            const result = await executeQuery(query, values);

            if (result.success && result.data.affectedRows > 0) {
                return { success: true, data: { id_bodega: id, ...data } };
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
            const query = `DELETE FROM ${this.tableName} WHERE id_bodega = ?`;
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

    // Obtener bodegas con información de sucursal
    async getAllWithSucursales() {
        try {
            const query = `
                SELECT b.*, s.nombre as sucursal_nombre, s.telefono as sucursal_telefono,
                       d.departamento, d.municipio
                FROM bodega b
                LEFT JOIN sucursal s ON b.id_sucursal = s.id_sucursal
                LEFT JOIN direccion d ON s.id_direccion = d.id_direccion
                ORDER BY b.nombre
            `;
            const result = await executeQuery(query);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Obtener bodegas por sucursal
    async getBySucursal(idSucursal) {
        return await this.findBy('id_sucursal', idSucursal);
    }
}

module.exports = {
    RolService,
    DireccionService,
    SucursalService,
    BodegaService
};