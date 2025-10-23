import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, LoginResponse } from '../../interfaces/interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  
  loginForm: LoginRequest = {
    correo: '',
    contrasena: ''
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
    if (!this.loginForm.correo || !this.loginForm.contrasena) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (this.loginForm.correo.length < 5) {
      this.errorMessage = 'El correo debe ser válido';
      return;
    }

    if (this.loginForm.contrasena.length < 3) {
      this.errorMessage = 'La contraseña debe tener al menos 3 caracteres';
      return;
    }

    // Iniciar proceso de login
    this.isLoading = true;

    this.subscription.add(
      this.authService.login(this.loginForm.correo, this.loginForm.contrasena).subscribe({
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

  onCorreoChange(event: any): void {
    this.loginForm.correo = event.target.value.trim();
    this.clearError();
  }

  onContrasenaChange(event: any): void {
    this.loginForm.contrasena = event.target.value;
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
        this.loginForm.correo = 'admin@envios.com';
        this.loginForm.contrasena = 'admin123';
        break;
      case 'user':
        this.loginForm.correo = 'usuario@envios.com';
        this.loginForm.contrasena = 'user123';
        break;
      case 'operator':
        this.loginForm.correo = 'operador@envios.com';
        this.loginForm.contrasena = 'op123';
        break;
    }
  }
}