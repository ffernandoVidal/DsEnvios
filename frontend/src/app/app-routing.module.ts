import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CotizarComponent } from './components/cotizar/cotizar.component';
import { RealizarEnvioComponent } from './components/realizar-envio/realizar-envio.component';
import { RastreoComponent } from './components/rastreo/rastreo.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { CrearGuiaComponent } from './components/crear-guia/crear-guia.component';
import { ListaGuiasComponent } from './components/lista-guias/lista-guias.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  // Rutas públicas
  { path: '', component: HomeComponent },
  { path: 'cotizar', component: CotizarComponent },
  { path: 'realizar-envio', component: RealizarEnvioComponent },
  { path: 'rastreo', component: RastreoComponent },
  { path: 'contacto', component: ContactoComponent },
  
  // Ruta de login
  { path: 'login', component: LoginComponent },
  
  // Rutas protegidas (requieren autenticación)
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard]
  },
  
  // Rutas específicas del sistema
  { 
    path: 'crear-guia', 
    component: CrearGuiaComponent,
    canActivate: [AuthGuard]
  },
  
  { 
    path: 'lista-guias', 
    component: ListaGuiasComponent,
    canActivate: [AuthGuard]
  },
  
  // Rutas adicionales protegidas por rol
  { 
    path: 'admin/usuarios', 
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  
  { 
    path: 'admin/guias', 
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'EMPLEADO'] }
  },

  { 
    path: 'empleado', 
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['EMPLEADO'] }
  },

  { 
    path: 'cliente', 
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CLIENTE'] }
  },
  
  // Dashboard general
  { 
    path: 'dashboard', 
    component: AdminComponent,
    canActivate: [AuthGuard]
  },
  
  // Wildcard route para páginas no encontradas
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }