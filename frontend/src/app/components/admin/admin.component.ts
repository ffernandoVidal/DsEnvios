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

interface DashboardStats {
  totalQuotes: number;
  totalShipments: number;
  pendingShipments: number;
  completedShipments: number;
}

export interface NewShipmentForm {
  receiverName: string;           // ✅
  receiverEmail: string;          // ✅
  receiverReference: 'casa' | 'trabajo' | 'gimnasio' | 'escuela';  // ✅
  receiverDepartamento: string;   // ✅
  receiverMunicipio: string;      // ✅
  receiverPoblado: string;        // ✅
  receiverPhone?: string;         // ✅
  paymentMethodId: string;        // ✅
  packageTypeId: string;          // ✅
  // ... otras propiedades
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  
  currentUser: User | null = null;
  stats: DashboardStats = {
    totalQuotes: 0,
    totalShipments: 0,
    pendingShipments: 0,
    completedShipments: 0
  };
  
  isLoading = true;
  currentTime = new Date();
  
  // Menú de navegación según el rol
  menuItems: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Actualizar hora cada segundo
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    // Cargar datos del usuario
    this.loadUserData();
    
    // Simular carga de estadísticas
    this.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadUserData(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.setupMenuItems();
      })
    );
  }

  private setupMenuItems(): void {
    if (!this.currentUser) return;

    const baseItems = [
      {
        title: 'Dashboard',
        icon: '🏠',
        route: '/admin',
        description: 'Panel principal'
      },
      {
        title: 'Cotizar',
        icon: '💰',
        route: '/cotizar',
        description: 'Realizar cotización'
      },
      {
        title: 'Nuevo Envío',
        icon: '📋',
        route: '/realizar-envio',
        description: 'Crear un nuevo envío'
      }
    ];

    if (this.currentUser.role === 'admin') {
      this.menuItems = [
        ...baseItems,
        {
          title: 'Gestionar Cotizaciones',
          icon: '📊',
          route: '/admin/quotes',
          description: 'Ver todas las cotizaciones'
        },
        {
          title: 'Envíos',
          icon: '📦',
          route: '/admin/shipments',
          description: 'Gestionar envíos'
        },
        {
          title: 'Usuarios',
          icon: '👥',
          route: '/admin/users',
          description: 'Administrar usuarios'
        },
        {
          title: 'Configuración',
          icon: '⚙️',
          route: '/admin/settings',
          description: 'Configuración del sistema'
        },
        {
          title: 'Reportes',
          icon: '📈',
          route: '/admin/reports',
          description: 'Reportes y análisis'
        }
      ];
    } else if (this.currentUser.role === 'operator') {
      // Panel de operador deshabilitado temporalmente
      this.menuItems = [
        ...baseItems,
        {
          title: 'Panel en Mantenimiento',
          icon: '�',
          route: '#',
          description: 'Funcionalidad temporalmente deshabilitada'
        }
      ];
    } else {
      this.menuItems = [
        {
          title: 'Mi Perfil',
          icon: '👤',
          route: '/admin/profile',
          description: 'Información personal'
        },
        {
          title: 'Cotizar',
          icon: '💰',
          route: '/cotizar',
          description: 'Realizar cotización'
        },
        {
          title: 'Nuevo Envío',
          icon: '📋',
          route: '/realizar-envio',
          description: 'Crear un nuevo envío'
        },
        {
          title: 'Mis Envíos',
          icon: '📦',
          route: '/admin/my-shipments',
          description: 'Mis envíos'
        }
      ];
    }
  }

  private loadDashboardStats(): void {
    // Simular carga de datos
    setTimeout(() => {
      this.stats = {
        totalQuotes: 1247,
        totalShipments: 892,
        pendingShipments: 34,
        completedShipments: 858
      };
      this.isLoading = false;
    }, 1000);
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  navigateToPublic(): void {
    this.router.navigate(['/']);
  }

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getRoleName(role: string): string {
    const roles: { [key: string]: string } = {
      'admin': 'Administrador',
      'operator': 'Operador (Deshabilitado)',
      'user': 'Usuario'
    };
    return roles[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'admin': '#ff9800',
      'operator': '#9e9e9e', // Gris para indicar deshabilitado
      'user': '#2196f3'
    };
    return colors[role] || '#666';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateToNewShipment(): void {
    console.log('🚚 Navegando a crear nuevo envío...');
    this.router.navigate(['/realizar-envio']);
  }

  onMenuItemClick(item: any): void {
    console.log('Navegando a:', item.route);
    
    // Verificar si es el panel deshabilitado
    if (item.route === '#') {
      alert(`⚠️ ${item.title}\n\n${item.description}\n\nEsta funcionalidad será habilitada próximamente.`);
      return;
    }
    
    // Rutas que están funcionando
    if (item.route === '/cotizar' || 
        item.route === '/admin' || 
        item.route === '/' || 
        item.route === '/realizar-envio') {
      this.router.navigate([item.route]);
      return;
    }
    
    // Por ahora mostrar mensaje para otras rutas
    alert(`Navegando a: ${item.title}\n(Funcionalidad pendiente)`);
  }
}