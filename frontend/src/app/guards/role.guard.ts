import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const requiredRoles = route.data['roles'] as Array<string>;
    const user = this.authService.getCurrentUser();
    
    console.log(' RoleGuard: Verificando roles para:', state.url);
    console.log('Roles requeridos:', requiredRoles);
    console.log(' Usuario actual:', user);
    
    if (!this.authService.isAuthenticated()) {
      console.log(' RoleGuard: Usuario no autenticado');
      this.router.navigate(['/login']);
      return false;
    }

    if (!user) {
      console.log(' RoleGuard: No hay datos de usuario');
      this.router.navigate(['/login']);
      return false;
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log(' RoleGuard: No se requieren roles específicos');
      return true;
    }

    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (hasRequiredRole) {
      console.log(' RoleGuard: Usuario tiene el rol requerido');
      return true;
    }

    console.log(' RoleGuard: Usuario no tiene el rol requerido');
    
    // Redirigir según el rol del usuario
    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (user.role === 'operator') {
      this.router.navigate(['/admin/operations']);
    } else {
      this.router.navigate(['/admin/profile']);
    }
    
    return false;
  }
}