import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstadoGuia {
  nombre: string;
  descripcion: string;
  color: string;
}

export interface Persona {
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface GuiaInfo {
  numero_guia: string;
  tipo_envio: string;
  peso: number;
  descripcion: string;
  valor_declarado: number;
  costo_total: number;
  fecha_creacion: string;
  fecha_estimada_entrega: string;
  estado_actual: EstadoGuia;
  remitente: Persona;
  destinatario: Persona;
  bodega_origen: string;
  bodega_destino: string;
  notas: string;
}

export interface TimelineEstado {
  nombre: string;
  codigo: string;
  icono: string;
  completado: boolean;
  activo: boolean;
}

export interface Progreso {
  porcentaje: number;
  paso_actual: number;
  completado: boolean;
  timeline: TimelineEstado[];
}

export interface TrackingHistorial {
  id: number;
  fecha: string;
  estado: string;
  descripcion: string;
  observaciones: string;
  ubicacion: string;
  color: string;
  usuario: string;
}

export interface RastreoResponse {
  success: boolean;
  data?: {
    guia: GuiaInfo;
    progreso: Progreso;
    historial: TrackingHistorial[];
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RastreoService {
  private apiUrl = 'http://localhost:3005/api';

  constructor(private http: HttpClient) {}

  rastrearEnvio(numeroGuia: string): Observable<RastreoResponse> {
    return this.http.get<RastreoResponse>(`${this.apiUrl}/rastreo/${numeroGuia}`);
  }
}
