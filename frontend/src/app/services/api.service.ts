import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  Usuario,
  PaginationRequest,
  PaginationResponse
} from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'http://localhost:3005/api';

  constructor(private http: HttpClient) {}

  // Obtener headers con autorización
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Construir parámetros de paginación
  private buildPaginationParams(pagination?: PaginationRequest, filters?: any): HttpParams {
    let params = new HttpParams();
    
    if (pagination) {
      if (pagination.page) params = params.set('page', pagination.page.toString());
      if (pagination.limit) params = params.set('limit', pagination.limit.toString());
      if (pagination.sortBy) params = params.set('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params = params.set('sortOrder', pagination.sortOrder);
    }
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    
    return params;
  }

  // ===================================================
  // SERVICIOS GENÉRICOS
  // ===================================================

  // Obtener estado del sistema
  getHealth(): Observable<any> {
    return this.http.get(`${this.API_URL}/health`);
  }

  // ===================================================
  // SERVICIOS DE USUARIOS
  // ===================================================

  getUsuarios(pagination?: PaginationRequest, filters?: any): Observable<ApiResponse<PaginationResponse<Usuario>>> {
    const params = this.buildPaginationParams(pagination, filters);
    return this.http.get<ApiResponse<PaginationResponse<Usuario>>>(
      `${this.API_URL}/usuarios`, 
      { headers: this.getAuthHeaders(), params }
    );
  }

  getUsuario(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(
      `${this.API_URL}/usuarios/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  createUsuario(usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(
      `${this.API_URL}/usuarios`, 
      usuario,
      { headers: this.getAuthHeaders() }
    );
  }

  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(
      `${this.API_URL}/usuarios/${id}`, 
      usuario,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_URL}/usuarios/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // ===================================================
  // SERVICIOS DE GUÍAS DE ENVÍO
  // ===================================================

  getGuias(pagination?: PaginationRequest, filters?: any): Observable<ApiResponse<PaginationResponse<any>>> {
    const params = this.buildPaginationParams(pagination, filters);
    return this.http.get<ApiResponse<PaginationResponse<any>>>(
      `${this.API_URL}/guias`, 
      { headers: this.getAuthHeaders(), params }
    );
  }

  getGuia(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.API_URL}/guias/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  createGuia(guiaData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/guias`, 
      guiaData,
      { headers: this.getAuthHeaders() }
    );
  }

  getSeguimiento(numeroGuia: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/seguimiento/${numeroGuia}`);
  }

  actualizarEstadoGuia(idGuia: number, estadoData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/guias/${idGuia}/estado`, 
      estadoData,
      { headers: this.getAuthHeaders() }
    );
  }

  // ===================================================
  // SERVICIOS DE CATÁLOGOS
  // ===================================================

  // Roles
  getRoles(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.API_URL}/roles`, 
      { headers: this.getAuthHeaders() }
    );
  }

  createRol(rol: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/roles`, 
      rol,
      { headers: this.getAuthHeaders() }
    );
  }

  // Direcciones
  getDirecciones(pagination?: PaginationRequest, filters?: any): Observable<ApiResponse<PaginationResponse<any>>> {
    const params = this.buildPaginationParams(pagination, filters);
    return this.http.get<ApiResponse<PaginationResponse<any>>>(
      `${this.API_URL}/direcciones`, 
      { headers: this.getAuthHeaders(), params }
    );
  }

  createDireccion(direccion: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/direcciones`, 
      direccion,
      { headers: this.getAuthHeaders() }
    );
  }

  // Sucursales
  getSucursales(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.API_URL}/sucursales`, 
      { headers: this.getAuthHeaders() }
    );
  }

  createSucursal(sucursal: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/sucursales`, 
      sucursal,
      { headers: this.getAuthHeaders() }
    );
  }

  // Bodegas
  getBodegas(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.API_URL}/bodegas`, 
      { headers: this.getAuthHeaders() }
    );
  }

  getBodegasBySucursal(idSucursal: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.API_URL}/bodegas/sucursal/${idSucursal}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  createBodega(bodega: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/bodegas`, 
      bodega,
      { headers: this.getAuthHeaders() }
    );
  }

  // Estados de envío
  getEstados(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_URL}/estados`);
  }

  // ===================================================
  // SERVICIOS DE CLIENTES Y EMPLEADOS
  // ===================================================

  // Clientes
  getClientes(pagination?: PaginationRequest, filters?: any): Observable<ApiResponse<PaginationResponse<any>>> {
    const params = this.buildPaginationParams(pagination, filters);
    return this.http.get<ApiResponse<PaginationResponse<any>>>(
      `${this.API_URL}/clientes`, 
      { headers: this.getAuthHeaders(), params }
    );
  }

  createCliente(cliente: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/clientes`, 
      cliente,
      { headers: this.getAuthHeaders() }
    );
  }

  // Empleados
  getEmpleados(pagination?: PaginationRequest, filters?: any): Observable<ApiResponse<PaginationResponse<any>>> {
    const params = this.buildPaginationParams(pagination, filters);
    return this.http.get<ApiResponse<PaginationResponse<any>>>(
      `${this.API_URL}/empleados`, 
      { headers: this.getAuthHeaders(), params }
    );
  }

  createEmpleado(empleado: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/empleados`, 
      empleado,
      { headers: this.getAuthHeaders() }
    );
  }
}