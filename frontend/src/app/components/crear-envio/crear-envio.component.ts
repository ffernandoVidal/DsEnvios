import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

interface Department {
  _id: string;
  code: string;
  name: string;
  region: string;
  shipping_zone: string;
  delivery_base_cost: number;
}

interface PackageType {
  _id: string;
  typeId: string;
  displayName: string;
  description: string;
  max_weight_kg: number;
  base_cost: number;
  cost_per_kg: number;
}

interface ServiceType {
  _id: string;
  serviceId: string;
  displayName: string;
  description: string;
  delivery_days: number;
  cost_multiplier: number;
}

interface PaymentMethod {
  _id: string;
  methodId: string;
  displayName: string;
  description: string;
  processing_fee: number;
}

@Component({
  selector: 'app-crear-envio',
  templateUrl: './crear-envio.component.html',
  styleUrls: ['./crear-envio.component.css']
})
export class CrearEnvioComponent implements OnInit {
  private apiUrl = 'http://localhost:3005/api';

  // Datos del formulario
  shipmentForm = {
    // Remitente
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    departmentFromId: '',
    municipalityFromId: '',

    // Destinatario
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientAddress: '',
    departmentToId: '',
    municipalityToId: '',

    // Paquete
    packageTypeId: '',
    weightKg: 0,
    declaredValue: 0,
    description: '',
    fragile: false,
    
    // Servicio
    serviceTypeId: '',
    paymentMethodId: '',
    
    // Notas
    specialInstructions: ''
  };

  // Catálogos
  departments: Department[] = [];
  departmentsFrom: Department[] = [];
  departmentsTo: Department[] = [];
  packageTypes: PackageType[] = [];
  serviceTypes: ServiceType[] = [];
  paymentMethods: PaymentMethod[] = [];

  // Cálculo de costos
  calculatedCost = {
    baseCost: 0,
    distanceCost: 0,
    weightCost: 0,
    serviceCost: 0,
    insuranceCost: 0,
    processingFee: 0,
    totalCost: 0
  };

  // Estados
  loading = false;
  calculating = false;
  success = '';
  error = '';
  currentStep = 1;
  totalSteps = 4;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
  }

  loadCatalogs(): void {
    this.loading = true;

    // Cargar departamentos
    this.http.get<any>(`${this.apiUrl}/db/collection/departments`).subscribe({
      next: (response) => {
        this.departments = response.documents || [];
        this.departmentsFrom = [...this.departments];
        this.departmentsTo = [...this.departments];
      },
      error: (err) => console.error('Error cargando departamentos:', err)
    });

    // Cargar tipos de paquete
    this.http.get<any>(`${this.apiUrl}/db/collection/packagetypes`).subscribe({
      next: (response) => {
        this.packageTypes = response.documents || [];
      },
      error: (err) => console.error('Error cargando tipos de paquete:', err)
    });

    // Cargar tipos de servicio
    this.http.get<any>(`${this.apiUrl}/db/collection/servicetypes`).subscribe({
      next: (response) => {
        this.serviceTypes = response.documents || [];
      },
      error: (err) => console.error('Error cargando tipos de servicio:', err)
    });

    // Cargar métodos de pago
    this.http.get<any>(`${this.apiUrl}/db/collection/paymentmethods`).subscribe({
      next: (response) => {
        this.paymentMethods = response.documents || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando métodos de pago:', err);
        this.loading = false;
      }
    });
  }

  calculateCost(): void {
    if (!this.canCalculate()) {
      return;
    }

    this.calculating = true;
    this.error = '';

    const deptFrom = this.departments.find(d => d._id === this.shipmentForm.departmentFromId);
    const deptTo = this.departments.find(d => d._id === this.shipmentForm.departmentToId);
    const packageType = this.packageTypes.find(p => p._id === this.shipmentForm.packageTypeId);
    const serviceType = this.serviceTypes.find(s => s._id === this.shipmentForm.serviceTypeId);
    const paymentMethod = this.paymentMethods.find(pm => pm._id === this.shipmentForm.paymentMethodId);

    if (!deptFrom || !deptTo || !packageType || !serviceType) {
      this.calculating = false;
      return;
    }

    // Cálculo de costos base
    this.calculatedCost.baseCost = packageType.base_cost;
    
    // Costo por distancia (zona de envío)
    const zoneMultiplier = this.getZoneMultiplier(deptFrom.shipping_zone, deptTo.shipping_zone);
    this.calculatedCost.distanceCost = deptTo.delivery_base_cost * zoneMultiplier;
    
    // Costo por peso
    this.calculatedCost.weightCost = this.shipmentForm.weightKg * packageType.cost_per_kg;
    
    // Costo por tipo de servicio
    this.calculatedCost.serviceCost = (this.calculatedCost.baseCost + this.calculatedCost.distanceCost) * 
                                      (serviceType.cost_multiplier - 1);
    
    // Seguro (1% del valor declarado)
    this.calculatedCost.insuranceCost = this.shipmentForm.declaredValue * 0.01;
    
    // Tarifa de procesamiento de pago
    this.calculatedCost.processingFee = paymentMethod ? paymentMethod.processing_fee : 0;
    
    // Total
    this.calculatedCost.totalCost = 
      this.calculatedCost.baseCost +
      this.calculatedCost.distanceCost +
      this.calculatedCost.weightCost +
      this.calculatedCost.serviceCost +
      this.calculatedCost.insuranceCost +
      this.calculatedCost.processingFee;

    this.calculating = false;
  }

  getZoneMultiplier(zoneFrom: string, zoneTo: string): number {
    const zoneValues: { [key: string]: number } = {
      'A': 1,
      'B': 1.5,
      'C': 2,
      'D': 2.5
    };

    const fromValue = zoneValues[zoneFrom] || 1;
    const toValue = zoneValues[zoneTo] || 1;
    
    return Math.abs(toValue - fromValue) + 1;
  }

  canCalculate(): boolean {
    return !!(
      this.shipmentForm.departmentFromId &&
      this.shipmentForm.departmentToId &&
      this.shipmentForm.packageTypeId &&
      this.shipmentForm.serviceTypeId &&
      this.shipmentForm.weightKg > 0
    );
  }

  createShipment(): void {
    if (!this.validateForm()) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = '';

    // Obtener los nombres de departamentos
    const senderDept = this.departments.find(d => d._id === this.shipmentForm.departmentFromId);
    const recipientDept = this.departments.find(d => d._id === this.shipmentForm.departmentToId);

    // Obtener el tipo de servicio
    const serviceType = this.serviceTypes.find(s => s._id === this.shipmentForm.serviceTypeId);
    const serviceCode = serviceType?.serviceId || 'standard';

    const shipmentData = {
      tracking_number: this.generateTrackingNumber(),
      
      sender: {
        name: this.shipmentForm.senderName,
        phone: this.shipmentForm.senderPhone,
        email: this.shipmentForm.senderEmail || undefined,
        address: {
          street: this.shipmentForm.senderAddress,
          department: senderDept?.name || 'Guatemala',
          municipality: 'Guatemala',
          village: '',
          postal_code: '',
          reference: ''
        }
      },
      
      recipient: {
        name: this.shipmentForm.recipientName,
        phone: this.shipmentForm.recipientPhone,
        email: this.shipmentForm.recipientEmail || undefined,
        address: {
          street: this.shipmentForm.recipientAddress,
          department: recipientDept?.name || 'Guatemala',
          municipality: 'Guatemala',
          village: '',
          postal_code: '',
          reference: ''
        }
      },
      
      package_details: {
        type_id: this.shipmentForm.packageTypeId,
        weight: this.shipmentForm.weightKg,
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          volume: 1000
        },
        description: this.shipmentForm.description || 'Paquete estándar',
        value: this.shipmentForm.declaredValue,
        fragile: this.shipmentForm.fragile,
        hazardous: false,
        special_instructions: this.shipmentForm.specialInstructions || ''
      },
      
      service_type: serviceCode,
      
      pricing: {
        base_cost: this.calculatedCost.baseCost,
        distance_cost: this.calculatedCost.distanceCost,
        weight_cost: this.calculatedCost.weightCost,
        service_cost: this.calculatedCost.serviceCost,
        insurance_cost: this.calculatedCost.insuranceCost,
        taxes: 0,
        discounts: 0,
        total_cost: this.calculatedCost.totalCost,
        currency: 'GTQ'
      },
      
      status: 'pending',
      
      payment: {
        method: this.shipmentForm.paymentMethodId,
        status: 'pending'
      }
    };

    this.http.post<any>(`${this.apiUrl}/shipments/create`, shipmentData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response.success) {
          this.success = '¡Envío creado exitosamente! Número de seguimiento: ' + response.guide.tracking_number;
          this.loading = false;
          
          // Generar PDF de la guía
          this.generateShippingLabel(response.guide, shipmentData);
          
          setTimeout(() => {
            this.resetForm();
          }, 3000);
        } else {
          this.error = 'Error al crear el envío: ' + (response.message || 'Error desconocido');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error completo:', err);
        this.error = 'Error al crear el envío: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  generateTrackingNumber(): string {
    const prefix = 'DS';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  }

  validateForm(): boolean {
    return !!(
      this.shipmentForm.senderName &&
      this.shipmentForm.senderPhone &&
      this.shipmentForm.senderAddress &&
      this.shipmentForm.departmentFromId &&
      this.shipmentForm.recipientName &&
      this.shipmentForm.recipientPhone &&
      this.shipmentForm.recipientAddress &&
      this.shipmentForm.departmentToId &&
      this.shipmentForm.packageTypeId &&
      this.shipmentForm.serviceTypeId &&
      this.shipmentForm.paymentMethodId &&
      this.shipmentForm.weightKg > 0 &&
      this.calculatedCost.totalCost > 0
    );
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  resetForm(): void {
    this.shipmentForm = {
      senderName: '',
      senderPhone: '',
      senderEmail: '',
      senderAddress: '',
      departmentFromId: '',
      municipalityFromId: '',
      recipientName: '',
      recipientPhone: '',
      recipientEmail: '',
      recipientAddress: '',
      departmentToId: '',
      municipalityToId: '',
      packageTypeId: '',
      weightKg: 0,
      declaredValue: 0,
      description: '',
      fragile: false,
      serviceTypeId: '',
      paymentMethodId: '',
      specialInstructions: ''
    };
    this.calculatedCost = {
      baseCost: 0,
      distanceCost: 0,
      weightCost: 0,
      serviceCost: 0,
      insuranceCost: 0,
      processingFee: 0,
      totalCost: 0
    };
    this.currentStep = 1;
  }

  // Helper methods for template
  getPackageTypeName(id: string): string {
    const packageType = this.packageTypes.find(p => p._id === id);
    return packageType ? packageType.displayName : '';
  }

  getServiceTypeName(id: string): string {
    const serviceType = this.serviceTypes.find(s => s._id === id);
    return serviceType ? serviceType.displayName : '';
  }

  getPaymentMethodName(id: string): string {
    const paymentMethod = this.paymentMethods.find(pm => pm._id === id);
    return paymentMethod ? paymentMethod.displayName : '';
  }

  generateShippingLabel(guide: any, shipmentData: any): void {
    try {
      const doc = new jsPDF();
      
      // Configuración de colores y estilos
      const primaryColor = '#2c3e50';
      const accentColor = '#3498db';
      const successColor = '#27ae60';
      
      // Header con logo y título
      doc.setFillColor(44, 62, 80);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text('EnviosDS', 20, 25);
      
      doc.setFontSize(12);
      doc.text('Guía de Envío', 20, 33);
      
      // Número de tracking destacado
      doc.setFillColor(39, 174, 96);
      doc.rect(140, 10, 60, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('No. Tracking:', 145, 17);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(guide.tracking_number, 145, 25);
      doc.setFont('helvetica', 'normal');
      
      // Información del remitente
      let y = 55;
      doc.setTextColor(44, 62, 80);
      doc.setFillColor(52, 152, 219);
      doc.rect(20, y - 7, 85, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('REMITENTE', 25, y - 2);
      
      y += 5;
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Nombre:', 25, y);
      doc.setFont('helvetica', 'bold');
      doc.text(shipmentData.sender.name, 50, y);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Teléfono:', 25, y);
      doc.setFont('helvetica', 'bold');
      doc.text(shipmentData.sender.phone, 50, y);
      
      if (shipmentData.sender.email) {
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Email:', 25, y);
        doc.setFont('helvetica', 'bold');
        doc.text(shipmentData.sender.email, 50, y);
      }
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Dirección:', 25, y);
      y += 5;
      doc.setFont('helvetica', 'bold');
      const senderAddress = doc.splitTextToSize(shipmentData.sender.address.street, 75);
      doc.text(senderAddress, 25, y);
      y += senderAddress.length * 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${shipmentData.sender.address.municipality}, ${shipmentData.sender.address.department}`, 25, y);
      
      // Información del destinatario
      y = 55;
      doc.setFillColor(52, 152, 219);
      doc.rect(110, y - 7, 85, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DESTINATARIO', 115, y - 2);
      
      y += 5;
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Nombre:', 115, y);
      doc.setFont('helvetica', 'bold');
      doc.text(shipmentData.recipient.name, 140, y);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Teléfono:', 115, y);
      doc.setFont('helvetica', 'bold');
      doc.text(shipmentData.recipient.phone, 140, y);
      
      if (shipmentData.recipient.email) {
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Email:', 115, y);
        doc.setFont('helvetica', 'bold');
        doc.text(shipmentData.recipient.email, 140, y);
      }
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Dirección:', 115, y);
      y += 5;
      doc.setFont('helvetica', 'bold');
      const recipientAddress = doc.splitTextToSize(shipmentData.recipient.address.street, 75);
      doc.text(recipientAddress, 115, y);
      y += recipientAddress.length * 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${shipmentData.recipient.address.municipality}, ${shipmentData.recipient.address.department}`, 115, y);
      
      // Detalles del paquete
      y = 130;
      doc.setFillColor(52, 152, 219);
      doc.rect(20, y, 175, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLES DEL PAQUETE', 25, y + 5);
      
      y += 15;
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Tabla de detalles
      const tableStartY = y;
      const col1X = 25;
      const col2X = 70;
      const col3X = 115;
      const col4X = 160;
      
      doc.text('Tipo:', col1X, y);
      doc.setFont('helvetica', 'bold');
      doc.text(this.getPackageTypeName(shipmentData.package_details.type_id), col1X + 20, y);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Peso:', col3X, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`${shipmentData.package_details.weight} kg`, col3X + 20, y);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Servicio:', col1X, y);
      doc.setFont('helvetica', 'bold');
      doc.text(this.getServiceTypeName(shipmentData.service_type), col1X + 20, y);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Valor:', col3X, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`Q ${shipmentData.package_details.value.toFixed(2)}`, col3X + 20, y);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('Frágil:', col1X, y);
      doc.setFont('helvetica', 'bold');
      doc.text(shipmentData.package_details.fragile ? 'SÍ' : 'NO', col1X + 20, y);
      
      if (shipmentData.package_details.description) {
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Descripción:', col1X, y);
        y += 5;
        doc.setFont('helvetica', 'bold');
        const description = doc.splitTextToSize(shipmentData.package_details.description, 165);
        doc.text(description, col1X, y);
        y += description.length * 5;
      }
      
      // Costos
      y += 10;
      doc.setFillColor(52, 152, 219);
      doc.rect(20, y, 175, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('COSTOS', 25, y + 5);
      
      y += 15;
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const costItems = [
        { label: 'Costo Base:', value: shipmentData.pricing.base_cost },
        { label: 'Costo por Distancia:', value: shipmentData.pricing.distance_cost },
        { label: 'Costo por Peso:', value: shipmentData.pricing.weight_cost },
        { label: 'Costo de Servicio:', value: shipmentData.pricing.service_cost },
        { label: 'Seguro:', value: shipmentData.pricing.insurance_cost }
      ];
      
      costItems.forEach(item => {
        doc.text(item.label, 25, y);
        doc.text(`Q ${item.value.toFixed(2)}`, 170, y, { align: 'right' });
        y += 7;
      });
      
      // Total
      y += 3;
      doc.setDrawColor(39, 174, 96);
      doc.setLineWidth(0.5);
      doc.line(20, y, 195, y);
      
      y += 8;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(39, 174, 96);
      doc.text('TOTAL:', 25, y);
      doc.text(`Q ${shipmentData.pricing.total_cost.toFixed(2)}`, 170, y, { align: 'right' });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.setFont('helvetica', 'normal');
      doc.text('EnviosDS - Sistema de Gestión de Envíos', 105, 280, { align: 'center' });
      doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 105, 285, { align: 'center' });
      
      // Guardar PDF
      doc.save(`Guia_${guide.tracking_number}.pdf`);
      
      console.log(' PDF de guía generado exitosamente');
    } catch (error) {
      console.error(' Error generando PDF:', error);
      alert('No se pudo generar el PDF de la guía');
    }
  }
}
