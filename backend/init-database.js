const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    let connection;
    
    try {
        // Conectar a MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '00000',
            port: process.env.DB_PORT || 3310
        });

        console.log(' Conectado a MySQL');

        // Crear base de datos
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'enviosdb'}\``);
        console.log(` Base de datos '${process.env.DB_NAME || 'enviosdb'}' creada`);
        
        await connection.end();

        // Reconectar a la base de datos específica
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '00000',
            port: process.env.DB_PORT || 3310,
            database: process.env.DB_NAME || 'enviosdb'
        });

        console.log(' Conectado a la base de datos enviosdb');

        // Crear tablas
        console.log(' Creando tablas...');

        // Tabla de roles
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_rol VARCHAR(50) NOT NULL UNIQUE,
                descripcion TEXT,
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Tabla roles creada');

        // Tabla de usuarios
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                correo VARCHAR(255) NOT NULL UNIQUE,
                contrasena VARCHAR(255) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                telefono VARCHAR(20),
                id_rol INT,
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Tabla usuarios creada');

        // Tabla de sucursales
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS sucursales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                codigo VARCHAR(20) NOT NULL UNIQUE,
                direccion TEXT,
                telefono VARCHAR(20),
                departamento VARCHAR(50),
                municipio VARCHAR(50),
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Tabla sucursales creada');

        // Tabla de bodegas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bodegas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                codigo VARCHAR(20) NOT NULL UNIQUE,
                direccion TEXT,
                id_sucursal INT,
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Tabla bodegas creada');

        // Tabla de personas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS personas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                telefono VARCHAR(20) NOT NULL,
                direccion TEXT,
                departamento VARCHAR(50),
                municipio VARCHAR(50),
                tipo_persona ENUM('REMITENTE', 'DESTINATARIO', 'AMBOS') DEFAULT 'AMBOS',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Tabla personas creada');

        // Tabla de estados de envío
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS estados_envio (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL UNIQUE,
                descripcion TEXT,
                color VARCHAR(20),
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Tabla estados_envio creada');

        // Tabla de guías de envío
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS guias_envio (
                id INT AUTO_INCREMENT PRIMARY KEY,
                numero_guia VARCHAR(50) NOT NULL UNIQUE,
                tipo_envio ENUM('NACIONAL', 'INTERNACIONAL') NOT NULL,
                id_remitente INT NOT NULL,
                id_destinatario INT NOT NULL,
                id_bodega_origen INT,
                id_bodega_destino INT,
                peso DECIMAL(10,2),
                descripcion_contenido TEXT,
                valor_declarado DECIMAL(10,2),
                costo_envio DECIMAL(10,2),
                costo_seguro DECIMAL(10,2) DEFAULT 0,
                costo_embalaje DECIMAL(10,2) DEFAULT 0,
                costo_total DECIMAL(10,2),
                id_estado INT,
                id_usuario_creador INT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_estimada_entrega DATE,
                notas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_remitente) REFERENCES personas(id),
                FOREIGN KEY (id_destinatario) REFERENCES personas(id),
                FOREIGN KEY (id_bodega_origen) REFERENCES bodegas(id),
                FOREIGN KEY (id_bodega_destino) REFERENCES bodegas(id),
                FOREIGN KEY (id_estado) REFERENCES estados_envio(id),
                FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Tabla guias_envio creada');

        // Tabla de tracking
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS tracking (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_guia INT NOT NULL,
                id_estado INT NOT NULL,
                id_bodega INT,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                observaciones TEXT,
                id_usuario INT,
                FOREIGN KEY (id_guia) REFERENCES guias_envio(id) ON DELETE CASCADE,
                FOREIGN KEY (id_estado) REFERENCES estados_envio(id),
                FOREIGN KEY (id_bodega) REFERENCES bodegas(id),
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log(' Tabla tracking creada');

        // Insertar datos iniciales
        console.log(' Insertando datos iniciales...');

        // Roles
        await connection.execute(`
            INSERT IGNORE INTO roles (nombre_rol, descripcion) VALUES
            ('admin', 'Administrador del sistema'),
            ('operator', 'Operador de bodega'),
            ('user', 'Usuario cliente')
        `);
        console.log(' Roles insertados');

        // Estados de envío
        await connection.execute(`
            INSERT IGNORE INTO estados_envio (nombre, descripcion, color) VALUES
            ('PENDIENTE', 'Envío pendiente de recolección', '#FFA500'),
            ('RECOLECTADO', 'Envío recolectado', '#2196F3'),
            ('EN_BODEGA', 'En bodega', '#9C27B0'),
            ('EN_TRANSITO', 'En tránsito', '#FF9800'),
            ('EN_DISTRIBUCION', 'En distribución', '#3F51B5'),
            ('ENTREGADO', 'Entregado exitosamente', '#4CAF50'),
            ('DEVUELTO', 'Devuelto al remitente', '#F44336'),
            ('CANCELADO', 'Envío cancelado', '#607D8B')
        `);
        console.log(' Estados de envío insertados');

        // Usuario administrador por defecto (contraseña: admin123)
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await connection.execute(`
            INSERT IGNORE INTO usuarios (correo, contrasena, nombre, id_rol, activo) VALUES
            ('admin@envios.com', ?, 'Administrador', 1, TRUE)
        `, [hashedPassword]);
        console.log(' Usuario administrador creado (admin@envios.com / admin123)');

        // Sucursales de ejemplo
        await connection.execute(`
            INSERT IGNORE INTO sucursales (nombre, codigo, direccion, departamento, municipio) VALUES
            ('Sucursal Central', 'CENT', 'Zona 1, Ciudad de Guatemala', 'Guatemala', 'Guatemala'),
            ('Sucursal Quetzaltenango', 'XELA', 'Zona 3, Quetzaltenango', 'Quetzaltenango', 'Quetzaltenango'),
            ('Sucursal Zacapa', 'ZAC', 'Barrio El Centro', 'Zacapa', 'Zacapa')
        `);
        console.log(' Sucursales de ejemplo insertadas');

        // Bodegas de ejemplo
        await connection.execute(`
            INSERT IGNORE INTO bodegas (nombre, codigo, direccion, id_sucursal) VALUES
            ('Bodega Principal Central', 'BP-CENT', 'Bodega Zona 12, Guatemala', 1),
            ('Bodega Secundaria Central', 'BS-CENT', 'Bodega Zona 1, Guatemala', 1),
            ('Bodega Principal Xela', 'BP-XELA', 'Bodega Zona 3, Quetzaltenango', 2),
            ('Bodega Principal Zacapa', 'BP-ZAC', 'Bodega Centro, Zacapa', 3)
        `);
        console.log(' Bodegas de ejemplo insertadas');

        console.log('\n Base de datos inicializada correctamente');
        console.log(' Resumen:');
        console.log('   - Base de datos: enviosdb');
        console.log('   - Tablas creadas: 8');
        console.log('   - Usuario admin: admin@envios.com / admin123');

    } catch (error) {
        console.error(' Error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initDatabase();