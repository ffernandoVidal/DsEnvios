import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DatabaseStatus {
  connected: boolean;
  database: string;
  version: string;
  serverTime: string;
}

export interface TableColumn {
  name: string;
  type: string;
  null: boolean;
  key: string;
  default: any;
  extra: string;
}

export interface TableInfo {
  name: string;
  rowCount: number;
  columns: TableColumn[];
}

export interface TableData {
  tableName: string;
  rows: any[];
  total: number;
  limit: number;
  offset: number;
}

export interface DatabaseStats {
  totalTables: number;
  tables: Array<{
    name: string;
    rowCount: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = 'http://localhost:3005/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtener estado de conexión de la base de datos
   */
  getStatus(): Observable<{ success: boolean; data?: DatabaseStatus; error?: string }> {
    return this.http.get<any>(`${this.apiUrl}/database/status`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Listar todas las tablas de la base de datos
   */
  getTables(): Observable<{ success: boolean; data?: TableInfo[]; error?: string }> {
    return this.http.get<any>(`${this.apiUrl}/database/tables`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener datos de una tabla específica
   */
  getTableData(tableName: string, limit: number = 100, offset: number = 0): Observable<{ success: boolean; data?: TableData; error?: string }> {
    return this.http.get<any>(`${this.apiUrl}/database/tables/${tableName}?limit=${limit}&offset=${offset}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Ejecutar consulta SQL personalizada (solo SELECT)
   */
  executeQuery(query: string): Observable<{ success: boolean; data?: { rows: any[]; count: number }; error?: string }> {
    return this.http.post<any>(`${this.apiUrl}/database/query`, 
      { query },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  getStats(): Observable<{ success: boolean; data?: DatabaseStats; error?: string }> {
    return this.http.get<any>(`${this.apiUrl}/database/stats`, {
      headers: this.getHeaders()
    });
  }
}
