import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Shipment {
  _id: string;
  tracking_number: string;
  sender: {
    name: string;
    phone: string;
    address: {
      department: string;
      municipality: string;
    };
  };
  recipient: {
    name: string;
    phone: string;
    address: {
      department: string;
      municipality: string;
    };
  };
  package_details: {
    weight: number;
    value: number;
    description: string;
  };
  pricing: {
    total_cost: number;
    currency: string;
  };
  status: string;
  service_type: string;
  created_at: Date;
}

@Component({
  selector: 'app-envios',
  templateUrl: './envios.component.html',
  styleUrls: ['./envios.component.css']
})
export class EnviosComponent implements OnInit {
  private apiUrl = 'http://localhost:3005/api';
  
  shipments: Shipment[] = [];
  filteredShipments: Shipment[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  statusFilter = 'all';
  
  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'picked_up', label: 'Recogido' },
    { value: 'in_transit', label: 'En Tránsito' },
    { value: 'out_for_delivery', label: 'En Entrega' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    this.loading = true;
    this.error = '';
    
    this.http.get<any>(`${this.apiUrl}/db/collection/resumen_envio`).subscribe({
      next: (response) => {
        console.log('Envíos cargados:', response);
        this.shipments = response.documents || [];
        this.filterShipments();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando envíos:', err);
        this.error = 'Error al cargar los envíos. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  filterShipments(): void {
    let filtered = [...this.shipments];
    
    // Filtrar por estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === this.statusFilter);
    }
    
    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.tracking_number.toLowerCase().includes(term) ||
        s.sender.name.toLowerCase().includes(term) ||
        s.recipient.name.toLowerCase().includes(term) ||
        s.recipient.address.department.toLowerCase().includes(term)
      );
    }
    
    this.filteredShipments = filtered;
  }

  onSearchChange(): void {
    this.filterShipments();
  }

  onStatusFilterChange(): void {
    this.filterShipments();
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'picked_up': 'status-picked',
      'in_transit': 'status-transit',
      'out_for_delivery': 'status-delivery',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return `Q ${amount.toFixed(2)}`;
  }

  refresh(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.loadShipments();
  }

  viewDetails(shipment: Shipment): void {
    // TODO: Navegar a página de detalles o abrir modal
    console.log('Ver detalles de:', shipment);
  }

  deleteShipment(shipment: Shipment): void {
    if (confirm(`¿Está seguro de eliminar el envío ${shipment.tracking_number}?`)) {
      this.http.delete(`${this.apiUrl}/db/collection/resumen_envio/${shipment._id}`).subscribe({
        next: () => {
          this.loadShipments();
          alert('Envío eliminado correctamente');
        },
        error: (err) => {
          console.error('Error eliminando envío:', err);
          alert('Error al eliminar el envío');
        }
      });
    }
  }
}
