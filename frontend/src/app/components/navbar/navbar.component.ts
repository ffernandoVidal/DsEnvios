import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  
  isMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de autenticación
    this.subscription.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    // Suscribirse a cambios del usuario actual
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.isUserMenuOpen = false; // Cerrar menú de usuario si está abierto
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isMenuOpen = false; // Cerrar menú principal si está abierto
  }

  closeMenus() {
    this.isMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  goToLogin() {
    this.closeMenus();
    this.router.navigate(['/login']);
  }

  goToAdmin() {
    this.closeMenus();
    this.router.navigate(['/admin']);
  }

  logout() {
    this.closeMenus();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getRoleName(role: string): string {
    const roles: { [key: string]: string } = {
      'admin': 'Administrador',
      'operator': 'Operador',
      'user': 'Usuario'
    };
    return roles[role] || role;
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}