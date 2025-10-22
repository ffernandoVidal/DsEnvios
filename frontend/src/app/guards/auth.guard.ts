import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('AuthGuard: Verificando acceso a:', state.url);
    
    if (this.authService.isAuthenticated()) {
      console.log(' AuthGuard: Usuario autenticado, acceso permitido');
      return true;
    }

    console.log(' AuthGuard: Usuario no autenticado, redirigiendo a login');
    
    // Guardar la URL intentada para redirigir después del login
    localStorage.setItem('redirectUrl', state.url);
    
    // Redirigir al login
    this.router.navigate(['/login']);
    return false;
  }
}