import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface LoginForm {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      name: string;
      role: string;
      email: string;
    };
    token: string;
  };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  
  loginForm: LoginForm = {
    username: '',
    password: ''
  };

  // Estados del formulario
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al admin
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit(): void {
    // Limpiar errores previos
    this.errorMessage = '';
    
    // Validaciones básicas
    if (!this.loginForm.username || !this.loginForm.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (this.loginForm.username.length < 2) {
      this.errorMessage = 'El usuario debe tener al menos 2 caracteres';
      return;
    }

    if (this.loginForm.password.length < 3) {
      this.errorMessage = 'La contraseña debe tener al menos 3 caracteres';
      return;
    }

    // Iniciar proceso de login
    this.isLoading = true;

    this.subscription.add(
      this.authService.login(this.loginForm.username, this.loginForm.password).subscribe({
        next: (response: LoginResponse) => {
          console.log(' Login exitoso:', response);
          this.isLoading = false;
          
          if (response.success) {
            // Redirigir al admin
            this.router.navigate(['/admin']);
          } else {
            this.errorMessage = response.message || 'Error de autenticación';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error en login:', error);
          this.isLoading = false;
          
          if (error.status === 401) {
            this.errorMessage = 'Usuario o contraseña incorrectos';
          } else if (error.status === 0) {
            this.errorMessage = 'Error de conexión con el servidor';
          } else {
            this.errorMessage = error.error?.message || 'Error interno del servidor';
          }
        }
      })
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onUsernameChange(event: any): void {
    this.loginForm.username = event.target.value.trim();
    this.clearError();
  }

  onPasswordChange(event: any): void {
    this.loginForm.password = event.target.value;
    this.clearError();
  }

  private clearError(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  // Método para demo/testing (remover en producción)
  fillDemoCredentials(role: string): void {
    switch (role) {
      case 'admin':
        this.loginForm.username = 'admin';
        this.loginForm.password = 'admin123';
        break;
      case 'user':
        this.loginForm.username = 'usuario';
        this.loginForm.password = 'user123';
        break;
      case 'operator':
        this.loginForm.username = 'operador';
        this.loginForm.password = 'op123';
        break;
    }
  }
}