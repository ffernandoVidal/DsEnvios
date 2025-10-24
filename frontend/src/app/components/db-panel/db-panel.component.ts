import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface DBStats {
  database: string;
  connected: boolean;
  collections: any[];
  stats?: any;
}

interface CollectionData {
  name: string;
  count: number;
  documents: any[];
}

@Component({
  selector: 'app-db-panel',
  templateUrl: './db-panel.component.html',
  styleUrls: ['./db-panel.component.css']
})
export class DbPanelComponent implements OnInit {
  apiUrl = 'http://localhost:3005/api';
  
  dbStats: DBStats | null = null;
  selectedCollection: string = '';
  collectionData: CollectionData | null = null;
  loading = false;
  error = '';
  success = '';
  
  // Para crear/editar documentos
  showCreateForm = false;
  newDocument = '';
  editingDocument: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDBStats();
  }

  loadDBStats(): void {
    this.loading = true;
    this.error = '';
    
    this.http.get<any>(`${this.apiUrl}/db/stats`).subscribe({
      next: (response) => {
        this.dbStats = response;
        this.loading = false;
        this.success = 'Base de datos conectada correctamente';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = 'Error al conectar con la base de datos: ' + err.message;
        this.loading = false;
      }
    });
  }

  selectCollection(collectionName: string): void {
    this.selectedCollection = collectionName;
    this.loadCollectionData(collectionName);
  }

  loadCollectionData(collectionName: string): void {
    this.loading = true;
    this.error = '';
    
    this.http.get<any>(`${this.apiUrl}/db/collection/${collectionName}`).subscribe({
      next: (response) => {
        this.collectionData = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la colección: ' + err.message;
        this.loading = false;
      }
    });
  }

  createDocument(): void {
    if (!this.selectedCollection || !this.newDocument) {
      this.error = 'Debe seleccionar una colección e ingresar datos';
      return;
    }

    try {
      const doc = JSON.parse(this.newDocument);
      this.loading = true;
      
      this.http.post<any>(`${this.apiUrl}/db/collection/${this.selectedCollection}`, doc).subscribe({
        next: (response) => {
          this.success = 'Documento creado exitosamente';
          this.newDocument = '';
          this.showCreateForm = false;
          this.loadCollectionData(this.selectedCollection);
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Error al crear documento: ' + err.message;
          this.loading = false;
        }
      });
    } catch (e) {
      this.error = 'JSON inválido';
    }
  }

  editDocument(doc: any): void {
    this.editingDocument = { ...doc };
  }

  updateDocument(): void {
    if (!this.editingDocument || !this.editingDocument._id) {
      return;
    }

    this.loading = true;
    
    this.http.put<any>(
      `${this.apiUrl}/db/collection/${this.selectedCollection}/${this.editingDocument._id}`,
      this.editingDocument
    ).subscribe({
      next: (response) => {
        this.success = 'Documento actualizado exitosamente';
        this.editingDocument = null;
        this.loadCollectionData(this.selectedCollection);
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = 'Error al actualizar documento: ' + err.message;
        this.loading = false;
      }
    });
  }

  deleteDocument(id: string): void {
    if (!confirm('¿Está seguro de eliminar este documento?')) {
      return;
    }

    this.loading = true;
    
    this.http.delete<any>(`${this.apiUrl}/db/collection/${this.selectedCollection}/${id}`).subscribe({
      next: (response) => {
        this.success = 'Documento eliminado exitosamente';
        this.loadCollectionData(this.selectedCollection);
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = 'Error al eliminar documento: ' + err.message;
        this.loading = false;
      }
    });
  }

  cancelEdit(): void {
    this.editingDocument = null;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.newDocument = '{\n  \n}';
    }
  }

  formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  // Método para verificar si un valor es objeto
  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  // Método para verificar si un valor NO es objeto
  isNotObject(value: any): boolean {
    return typeof value !== 'object' || value === null;
  }

  // Exponer Object.keys para usar en el template
  Object = Object;
}