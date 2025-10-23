-- ===================================================
-- DATOS DE PRUEBA PARA EL SISTEMA DJ2 LOGÍSTICA
-- ===================================================

USE enviosdb;

-- Insertar usuarios de prueba
INSERT INTO usuario (nombre, correo, contrasena, telefono, id_rol) VALUES
('Administrator', 'admin@dj2logistica.com', '$2b$10$8K.W/vgQ8LQOxA4AzGTxreJYjA9Z0rK4FgUjI9.Zl3cG4.K8W/vgQ', '22221111', 1),
('Carlos Empleado', 'empleado@dj2logistica.com', '$2b$10$8K.W/vgQ8LQOxA4AzGTxreJYjA9Z0rK4FgUjI9.Zl3cG4.K8W/vgQ', '22222222', 3),
('María Cliente', 'cliente@example.com', '$2b$10$8K.W/vgQ8LQOxA4AzGTxreJYjA9Z0rK4FgUjI9.Zl3cG4.K8W/vgQ', '33333333', 2);

-- Insertar direcciones adicionales para pruebas
INSERT INTO direccion (departamento, municipio, aldea, zona, direccion_detalle) VALUES
('Guatemala', 'Guatemala', 'Zona Rosa', '10', '12 calle 5-42 zona 10'),
('Guatemala', 'Villa Nueva', 'Monte María', '', 'Km 22.5 Carretera a Villa Nueva'),
('Sacatepéquez', 'Antigua Guatemala', 'Centro', '', '5ta Avenida Norte No. 15'),
('Chimaltenango', 'Chimaltenango', 'Centro', '1', '3ra Calle 4-20 zona 1');

-- Insertar clientes de prueba
INSERT INTO cliente (id_usuario, id_direccion, nit) VALUES
(3, 5, '12345678-9');

-- Insertar empleados de prueba
INSERT INTO empleado (id_usuario, id_sucursal, puesto) VALUES
(2, 1, 'Supervisor de Operaciones');

-- Insertar remitentes de prueba
INSERT INTO remitente (nombre, telefono, id_direccion) VALUES
('Juan Pérez', '44444444', 5),
('Ana García', '55555555', 6),
('Luis Rodríguez', '66666666', 7);

-- Insertar destinatarios de prueba
INSERT INTO destinatario (nombre, telefono, id_direccion) VALUES
('María López', '77777777', 8),
('Carlos Martínez', '88888888', 6),
('Laura Hernández', '99999999', 5);

-- Insertar guías de envío de prueba
INSERT INTO guia_envio (numero_guia, id_remitente, id_destinatario, id_bodega_origen, id_bodega_destino, peso, dimensiones, tipo_envio, costo) VALUES
('DS2410230001', 1, 1, 1, 2, 2.5, '30x20x15', 'NACIONAL', 75.00),
('DS2410230002', 2, 2, 2, 3, 1.8, '25x25x10', 'NACIONAL', 65.00),
('DS2410230003', 3, 3, 1, 4, 5.0, '40x30x25', 'NACIONAL', 125.00);

-- Insertar seguimientos de prueba
INSERT INTO seguimiento (id_guia, id_estado, ubicacion_actual, coordenadas_gps) VALUES
(1, 1, 'Bodega Central Guatemala', '14.6349,-90.5069'),
(1, 2, 'En ruta hacia Quetzaltenango', '14.8333,-91.5167'),
(2, 1, 'Bodega Occidente Quetzaltenango', '14.8333,-91.5167'),
(3, 1, 'Bodega Central Guatemala', '14.6349,-90.5069');

-- Insertar notificaciones de prueba
INSERT INTO notificacion (id_cliente, id_guia, mensaje) VALUES
(1, 1, 'Su envío ha sido procesado y está en preparación'),
(1, 1, 'Su envío está en tránsito hacia el destino');

-- ===================================================
-- CONSULTAS DE VERIFICACIÓN
-- ===================================================

-- Verificar usuarios creados
SELECT u.*, r.nombre_rol 
FROM usuario u 
LEFT JOIN rol r ON u.id_rol = r.id_rol;

-- Verificar guías con información completa
SELECT 
    g.numero_guia,
    r.nombre as remitente,
    d.nombre as destinatario,
    bo.nombre as bodega_origen,
    bd.nombre as bodega_destino,
    g.peso,
    g.costo,
    g.tipo_envio,
    g.fecha_creacion
FROM guia_envio g
LEFT JOIN remitente r ON g.id_remitente = r.id_remitente
LEFT JOIN destinatario d ON g.id_destinatario = d.id_destinatario
LEFT JOIN bodega bo ON g.id_bodega_origen = bo.id_bodega
LEFT JOIN bodega bd ON g.id_bodega_destino = bd.id_bodega;

-- Verificar seguimientos
SELECT 
    g.numero_guia,
    s.ubicacion_actual,
    es.nombre_estado,
    s.fecha_actualizacion
FROM seguimiento s
LEFT JOIN guia_envio g ON s.id_guia = g.id_guia
LEFT JOIN estado_envio es ON s.id_estado = es.id_estado
ORDER BY s.fecha_actualizacion DESC;