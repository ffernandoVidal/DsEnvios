import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Interfaces para la autenticación
interface LoginRequest {
  correo: string;
  contrasena: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    usuario: {
      id: number;
      correo: string;
      nombre: string;
      telefono?: string;
      id_rol?: number;
      activo?: boolean;
    };
    rol?: {
      id: number;
      nombre_rol: string;
      descripcion?: string;
    };
    token: string;
  };
  error?: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3005/api';
  
  // Subjects para manejar el estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  // Observables públicos
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar datos del usuario desde localStorage al inicializar
    this.loadUserFromStorage();
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  /**
   * Realizar login con credenciales
   */
  login(correo: string, contrasena: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { correo, contrasena };
    
    console.log('🔐 Iniciando login para usuario:', correo);
    console.log('🌐 URL del endpoint:', `${this.apiUrl}/auth/login`);
    console.log('📤 Datos a enviar:', loginData);

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`, 
      loginData, 
      this.getHttpOptions()
    ).pipe(
      tap(response => {
        console.log('📨 Respuesta del servidor:', response);
        
        if (response.success && response.data && response.data.usuario) {
          // Convertir el usuario del backend al formato interno
          const user: User = {
            id: response.data.usuario.id.toString(),
            username: response.data.usuario.correo,
            name: response.data.usuario.nombre,
            role: response.data.rol?.nombre_rol || 'user',
            email: response.data.usuario.correo
          };
          
          this.setCurrentUser(user);
          
          // Guardar token si existe
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
          }
          
          console.log('✅ Usuario autenticado correctamente');
        }
      }),
      catchError(error => {
        console.error('❌ Error en login:', error);
        this.logout(); // Limpiar cualquier estado previo
        throw error;
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    console.log(' Cerrando sesión...');
    
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    // Limpiar subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    console.log('Sesión cerrada');
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener el token de autenticación
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Verificar si el usuario es operador
   */
  isOperator(): boolean {
    return this.hasRole('operator') || this.hasRole('admin');
  }

  /**
   * Verificar la validez del token en el servidor
   */
  validateToken(): Observable<boolean> {
    const token = this.getAuthToken();
    
    if (!token) {
      return of(false);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.apiUrl}/validate-token`, { headers }).pipe(
      tap(response => {
        if (response.valid && response.user) {
          this.setCurrentUser(response.user);
        } else {
          this.logout();
        }
      }),
      catchError(error => {
        console.error('Token inválido:', error);
        this.logout();
        return of(false);
      })
    );
  }

  /**
   * Establecer el usuario actual
   */
  private setCurrentUser(user: User): void {
    // Guardar en localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Actualizar subjects
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Cargar usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    try {
      const userData = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        const user: User = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        console.log('👤 Usuario cargado desde storage:', user.username);
        
        // Validar token en el servidor (opcional)
        // this.validateToken().subscribe();
      }
    } catch (error) {
      console.error('Error cargando usuario desde storage:', error);
      this.logout();
    }
  }

  /**
   * Obtener información del perfil del usuario
   */
  getProfile(): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<User>(`${this.apiUrl}/profile`, { headers }).pipe(
      tap(user => {
        this.setCurrentUser(user);
      }),
      catchError(error => {
        console.error(' Error obteniendo perfil:', error);
        throw error;
      })
    );
  }

  /**
   * Refrescar el token de autenticación
   */
  refreshToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {}, { headers }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      catchError(error => {
        console.error(' Error refrescando token:', error);
        this.logout();
        throw error;
      })
    );
  }
}