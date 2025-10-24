// ===================================================
// INTERFACES PARA EL SISTEMA DE ENVÍOS DJ2 LOGÍSTICA
// ===================================================

export interface Rol {
    id_rol?: number;
    nombre_rol: string;
    descripcion?: string;
}

export interface Usuario {
    id_usuario?: number;
    nombre: string;
    correo: string;
    contrasena: string;
    telefono?: string;
    id_rol: number;
    fecha_registro?: Date;
    rol?: Rol; // Para joins
}

export interface Direccion {
    id_direccion?: number;
    pais?: string;
    departamento: string;
    municipio: string;
    aldea?: string;
    zona?: string;
    direccion_detalle?: string;
}

export interface Sucursal {
    id_sucursal?: number;
    nombre: string;
    id_direccion: number;
    telefono?: string;
    correo?: string;
    direccion?: Direccion; // Para joins
}

export interface Bodega {
    id_bodega?: number;
    nombre: string;
    id_sucursal: number;
    capacidad?: number;
    responsable?: string;
    sucursal?: Sucursal; // Para joins
}

export interface Cliente {
    id_cliente?: number;
    id_usuario: number;
    id_direccion?: number;
    nit?: string;
    usuario?: Usuario; // Para joins
    direccion?: Direccion; // Para joins
}

export interface Empleado {
    id_empleado?: number;
    id_usuario: number;
    id_sucursal: number;
    puesto?: string;
    usuario?: Usuario; // Para joins
    sucursal?: Sucursal; // Para joins
}

export interface Remitente {
    id_remitente?: number;
    nombre: string;
    telefono?: string;
    id_direccion?: number;
    direccion?: Direccion; // Para joins
}

export interface Destinatario {
    id_destinatario?: number;
    nombre: string;
    telefono?: string;
    id_direccion?: number;
    direccion?: Direccion; // Para joins
}

export type TipoEnvio = 'NACIONAL' | 'INTERNACIONAL';

export interface GuiaEnvio {
    id_guia?: number;
    numero_guia: string;
    id_remitente: number;
    id_destinatario: number;
    id_bodega_origen: number;
    id_bodega_destino: number;
    peso: number;
    dimensiones?: string;
    tipo_envio?: TipoEnvio;
    costo: number;
    fecha_creacion?: Date;
    remitente?: Remitente; // Para joins
    destinatario?: Destinatario; // Para joins
    bodega_origen?: Bodega; // Para joins
    bodega_destino?: Bodega; // Para joins
}

export interface EstadoEnvio {
    id_estado?: number;
    nombre_estado: string;
}

export interface Seguimiento {
    id_seguimiento?: number;
    id_guia: number;
    id_estado: number;
    ubicacion_actual?: string;
    coordenadas_gps?: string;
    fecha_actualizacion?: Date;
    guia?: GuiaEnvio; // Para joins
    estado?: EstadoEnvio; // Para joins
}

export interface Notificacion {
    id_notificacion?: number;
    id_cliente: number;
    id_guia: number;
    mensaje?: string;
    fecha_envio?: Date;
    cliente?: Cliente; // Para joins
    guia?: GuiaEnvio; // Para joins
}

// ===================================================
// INTERFACES PARA DTOs (Data Transfer Objects)
// ===================================================

export interface LoginRequest {
    correo: string;
    contrasena: string;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    usuario?: Omit<Usuario, 'contrasena'>;
    rol?: Rol;
    message?: string;
}

export interface CreateGuiaRequest {
    remitente: Omit<Remitente, 'id_remitente'>;
    destinatario: Omit<Destinatario, 'id_destinatario'>;
    direccion_remitente?: Omit<Direccion, 'id_direccion'>;
    direccion_destinatario?: Omit<Direccion, 'id_direccion'>;
    guia: Omit<GuiaEnvio, 'id_guia' | 'numero_guia' | 'fecha_creacion'>;
}

export interface SeguimientoResponse {
    guia: GuiaEnvio;
    seguimientos: (Seguimiento & { estado: EstadoEnvio })[];
    estado_actual: EstadoEnvio;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// ===================================================
// INTERFACES PARA FILTROS Y BÚSQUEDAS
// ===================================================

export interface FiltroGuias {
    numero_guia?: string;
    tipo_envio?: TipoEnvio;
    id_estado?: number;
    fecha_inicio?: Date;
    fecha_fin?: Date;
    id_bodega_origen?: number;
    id_bodega_destino?: number;
}

export interface FiltroClientes {
    nombre?: string;
    correo?: string;
    telefono?: string;
    departamento?: string;
    municipio?: string;
}

export interface PaginationRequest {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}