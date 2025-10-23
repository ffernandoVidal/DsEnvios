import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PaginationRequest, PaginationResponse, FiltroGuias } from '../../interfaces/interfaces';

@Component({
  selector: 'app-lista-guias',
  templateUrl: './lista-guias.component.html',
  styleUrls: ['./lista-guias.component.css']
})
export class ListaGuiasComponent implements OnInit {
  guias: any[] = [];
  filtroForm!: FormGroup;
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Estados
  isLoading = false;
  errorMessage = '';
  
  // Referencia global a Math para usar en templates
  Math = Math;
  
  // Opciones para filtros
  tiposEnvio = [
    { value: '', label: 'Todos los tipos' },
    { value: 'NACIONAL', label: 'Nacional' },
    { value: 'INTERNACIONAL', label: 'Internacional' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.initializeFilters();
  }

  ngOnInit(): void {
    this.loadGuias();
  }

  private initializeFilters(): void {
    this.filtroForm = this.fb.group({
      numero_guia: [''],
      tipo_envio: [''],
      fecha_inicio: [''],
      fecha_fin: ['']
    });
  }

  loadGuias(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const pagination: PaginationRequest = {
      page: page,
      limit: this.itemsPerPage,
      sortBy: 'fecha_creacion',
      sortOrder: 'DESC'
    };

    const filters = this.getActiveFilters();

    this.apiService.getGuias(pagination, filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success && response.data) {
          this.guias = response.data.data || [];
          this.totalItems = response.data.total || 0;
          this.totalPages = response.data.totalPages || 0;
          this.currentPage = response.data.page || 1;
        } else {
          this.errorMessage = response.error || 'Error cargando guías';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error cargando guías:', error);
        this.errorMessage = 'Error de conexión con el servidor';
      }
    });
  }

  private getActiveFilters(): any {
    const formValue = this.filtroForm.value;
    const filters: any = {};

    // Solo incluir filtros que tengan valor
    Object.keys(formValue).forEach(key => {
      if (formValue[key] && formValue[key].trim() !== '') {
        filters[key] = formValue[key];
      }
    });

    return filters;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadGuias(1);
  }

  clearFilters(): void {
    this.filtroForm.reset();
    this.currentPage = 1;
    this.loadGuias(1);
  }

  // Paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadGuias(page);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Obtener páginas para mostrar en la paginación
  getPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Funciones de utilidad
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    if (!amount) return 'Q 0.00';
    return `Q ${amount.toFixed(2)}`;
  }

  getEstadoBadgeClass(estado: string): string {
    const estadoLower = estado?.toLowerCase() || '';
    
    if (estadoLower.includes('preparación')) return 'badge-warning';
    if (estadoLower.includes('tránsito')) return 'badge-info';
    if (estadoLower.includes('entregado')) return 'badge-success';
    if (estadoLower.includes('devuelto')) return 'badge-danger';
    
    return 'badge-secondary';
  }

  verDetalles(guia: any): void {
    // Implementar navegación a detalles
    console.log('Ver detalles de guía:', guia);
  }

  verSeguimiento(numeroGuia: string): void {
    // Implementar navegación a seguimiento
    console.log('Ver seguimiento de guía:', numeroGuia);
  }

  editarGuia(guia: any): void {
    // Implementar edición de guía
    console.log('Editar guía:', guia);
  }

  // TrackBy function para mejorar performance
  trackByGuia(index: number, guia: any): any {
    return guia.id_guia || index;
  }
}