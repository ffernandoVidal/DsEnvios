import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CotizarComponent } from './components/cotizar/cotizar.component';
import { RealizarEnvioComponent } from './components/realizar-envio/realizar-envio.component';
import { RastreoComponent } from './components/rastreo/rastreo.component';
import { ContactoComponent } from './components/contacto/contacto.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cotizar', component: CotizarComponent },
  { path: 'realizar-envio', component: RealizarEnvioComponent },
  { path: 'rastreo', component: RastreoComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: '**', redirectTo: '' } // Wildcard route para páginas no encontradas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }