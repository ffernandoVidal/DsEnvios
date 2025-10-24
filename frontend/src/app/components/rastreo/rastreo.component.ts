import { Component } from '@angular/core';
import { RastreoService, GuiaInfo, Progreso, TrackingHistorial } from '../../services/rastreo.service';

@Component({
  selector: 'app-rastreo',
  templateUrl: './rastreo.component.html',
  styleUrls: ['./rastreo.component.css']
})
export class RastreoComponent {
  numeroGuia: string = '';
  buscando: boolean = false;
  encontrado: boolean = false;
  error: string = '';
  
  // Datos del rastreo
  guia: GuiaInfo | null = null;
  progreso: Progreso | null = null;
  historial: TrackingHistorial[] = [];

  constructor(private rastreoService: RastreoService) {}

  buscarEnvio(): void {
    if (!this.numeroGuia.trim()) {
      this.error = 'Por favor ingresa un número de guía';
      return;
    }

    this.buscando = true;
    this.error = '';
    this.encontrado = false;

    this.rastreoService.rastrearEnvio(this.numeroGuia.trim()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.guia = response.data.guia;
          this.progreso = response.data.progreso;
          this.historial = response.data.historial;
          this.encontrado = true;
        } else {
          this.error = response.error || 'No se encontró la guía';
        }
        this.buscando = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al buscar el envío';
        this.buscando = false;
        this.encontrado = false;
      }
    });
  }

  limpiarBusqueda(): void {
    this.numeroGuia = '';
    this.encontrado = false;
    this.error = '';
    this.guia = null;
    this.progreso = null;
    this.historial = [];
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}