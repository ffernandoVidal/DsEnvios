import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  Usuario 
} from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthNewService {
  private readonly API_URL = 'http://localhost:3005/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar usuario desde localStorage al inicializar
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }

  // Login
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        map(response => {
          if (response.success && response.data?.token) {
            // Guardar en localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify({
              usuario: response.data.usuario,
              rol: response.data.rol
            }));
            
            // Actualizar BehaviorSubject
            this.currentUserSubject.next({
              usuario: response.data.usuario,
              rol: response.data.rol
            });
          }
          return response;
        })
      );
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener usuario actual
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  // Obtener headers con autorización
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Verificar rol
  hasRole(requiredRole: string): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.rol?.nombre_rol === requiredRole;
  }

  // Verificar si es admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // Verificar si es empleado
  isEmpleado(): boolean {
    return this.hasRole('EMPLEADO');
  }

  // Verificar si es cliente
  isCliente(): boolean {
    return this.hasRole('CLIENTE');
  }
}