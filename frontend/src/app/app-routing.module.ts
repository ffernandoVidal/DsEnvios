import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CotizarComponent } from './components/cotizar/cotizar.component';
import { RastreoComponent } from './components/rastreo/rastreo.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { DbPanelComponent } from './components/db-panel/db-panel.component';
import { CrearEnvioComponent } from './components/crear-envio/crear-envio.component';
import { EnviosComponent } from './components/envios/envios.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  // Rutas públicas
  { path: '', component: HomeComponent },
  { path: 'cotizar', component: CotizarComponent },
  { path: 'rastreo', component: RastreoComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'crear-envio', component: CrearEnvioComponent },
  { path: 'envios', component: EnviosComponent },
  
  // Ruta de login
  { path: 'login', component: LoginComponent },
  
  // Rutas protegidas (requieren autenticación)
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'db-panel', 
    component: DbPanelComponent
  },
  
  // Rutas adicionales protegidas por rol (para futuro)
  { 
    path: 'admin/users', 
    component: AdminComponent,  // Placeholder, se puede crear componente específico
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  
  { 
    path: 'admin/operations', 
    component: AdminComponent,  // Placeholder, se puede crear componente específico
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'operator'] }
  },
  
  // Wildcard route para páginas no encontradas
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }