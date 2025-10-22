import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { EnviosService, FrequentAddress, PaymentMethod, PackageType, NewShipmentForm, LocationData } from '../../services/envios.service';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string;
}

interface Municipio {
  nombre: string;
  departamento: string;
}

interface Departamento {
  nombre: string;
  municipios: string[];
}

interface TipoPaquete {
  id: number;
  nombre: string;
  icono: string;
  limiteSize: string;
  limitePeso: string;
  descripcion: string;
  color: string;
}

@Component({
  selector: 'app-realizar-envio',
  templateUrl: './realizar-envio.component.html',
  styleUrls: ['./realizar-envio.component.css']
})
export class RealizarEnvioComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private apiUrl = 'http://localhost:3005/api';
  
  currentUser: User | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  currentStep = 1;
  totalSteps = 4;

  // Datos para la búsqueda de direcciones frecuentes
  searchTerm = '';
  frequentAddresses: FrequentAddress[] = [];
  showFrequentAddresses = false;

  // Variables para búsqueda de direcciones
  busquedaDepartamento = '';
  busquedaMunicipio = '';
  departamentosFiltrados: string[] = [];
  municipiosFiltrados: Municipio[] = [];
  mostrarListaDepartamentos = false;
  mostrarListaMunicipios = false;
  
  // Lista completa de municipios con departamento
  todosLosMunicipios: Municipio[] = [];

  // Datos de departamentos y municipios de Guatemala
  departamentosGuatemala: Departamento[] = [
    {
      nombre: 'Guatemala',
      municipios: [
        'Guatemala', 'Santa Catarina Pinula', 'San José Pinula', 'San José del Golfo',
        'Palencia', 'Chinautla', 'San Pedro Ayampuc', 'Mixco', 'San Pedro Sacatepéquez',
        'San Juan Sacatepéquez', 'San Raymundo', 'Chuarrancho', 'Fraijanes',
        'Amatitlán', 'Villa Nueva', 'Villa Canales', 'San Miguel Petapa'
      ]
    },
    {
      nombre: 'Alta Verapaz',
      municipios: [
        'Cobán', 'Santa Cruz Verapaz', 'San Cristóbal Verapaz', 'Tactic', 'Tamahú',
        'Tucurú', 'Panzós', 'Senahú', 'San Pedro Carchá', 'San Juan Chamelco',
        'Lanquín', 'Santa María Cahabón', 'Chisec', 'Chahal', 'Fray Bartolomé de las Casas',
        'La Tinta'
      ]
    },
    {
      nombre: 'Baja Verapaz',
      municipios: [
        'Salamá', 'San Miguel Chicaj', 'Rabinal', 'Cubulco', 'Granados',
        'Santa Cruz el Chol', 'San Jerónimo', 'Purulhá'
      ]
    },
    {
      nombre: 'Chimaltenango',
      municipios: [
        'Chimaltenango', 'San José Poaquil', 'San Martín Jilotepeque', 'San Juan Comalapa',
        'Santa Apolonia', 'Tecpán', 'Patzún', 'Pochuta', 'Patzicía', 'Santa Cruz Balanyá',
        'Acatenango', 'Yepocapa', 'San Andrés Itzapa', 'Parramos', 'Zaragoza', 'El Tejar'
      ]
    },
    {
      nombre: 'Chiquimula',
      municipios: [
        'Chiquimula', 'San José la Arada', 'San Juan Ermita', 'Jocotán', 'Camotán',
        'Olopa', 'Esquipulas', 'Concepción Las Minas', 'Quezaltepeque', 'San Jacinto', 'Ipala'
      ]
    },
    {
      nombre: 'El Progreso',
      municipios: [
        'Guastatoya', 'Morazán', 'San Agustín Acasaguastlán', 'San Cristóbal Acasaguastlán',
        'El Jícaro', 'Sansare', 'Sanarate', 'San Antonio La Paz'
      ]
    },
    {
      nombre: 'Escuintla',
      municipios: [
        'Escuintla', 'Santa Lucía Cotzumalguapa', 'La Democracia', 'Siquinalá',
        'Masagua', 'Tiquisate', 'La Gomera', 'Guanagazapa', 'San José',
        'Iztapa', 'Palín', 'San Vicente Pacaya', 'Nueva Concepción'
      ]
    },
    {
      nombre: 'Huehuetenango',
      municipios: [
        'Huehuetenango', 'Chiantla', 'Malacatancito', 'Cuilco', 'Nentón', 'San Pedro Necta',
        'Jacaltenango', 'San Pedro Soloma', 'San Ildefonso Ixtahuacán', 'Santa Bárbara',
        'La Libertad', 'La Democracia', 'San Miguel Acatán', 'San Rafael La Independencia',
        'Todos Santos Cuchumatán', 'San Juan Atitán', 'Santa Eulalia', 'San Mateo Ixtatán',
        'Colotenango', 'San Sebastián Huehuetenango', 'Tectitán', 'Concepción Huista',
        'San Juan Ixcoy', 'San Antonio Huista', 'San Sebastián Coatán', 'Santa Cruz Barillas',
        'Aguacatán', 'San Rafael Petzal', 'San Gaspar Ixchil', 'Santiago Chimaltenango',
        'Santa Ana Huista', 'Unión Cantinil'
      ]
    },
    {
      nombre: 'Izabal',
      municipios: [
        'Puerto Barrios', 'Livingston', 'El Estor', 'Morales', 'Los Amates'
      ]
    },
    {
      nombre: 'Jalapa',
      municipios: [
        'Jalapa', 'San Pedro Pinula', 'San Luis Jilotepeque', 'San Manuel Chaparrón',
        'San Carlos Alzatate', 'Monjas', 'Mataquescuintla'
      ]
    },
    {
      nombre: 'Jutiapa',
      municipios: [
        'Jutiapa', 'El Progreso', 'Santa Catarina Mita', 'Agua Blanca', 'Asunción Mita',
        'Yupiltepeque', 'Atescatempa', 'Jerez', 'El Adelanto', 'Zapotitlán',
        'Comapa', 'Jalpatagua', 'Conguaco', 'Moyuta', 'Pasaco', 'San José Acatempa', 'Quesada'
      ]
    },
    {
      nombre: 'Petén',
      municipios: [
        'Flores', 'San José', 'San Benito', 'San Andrés', 'La Libertad', 'San Francisco',
        'Santa Ana', 'Dolores', 'San Luis', 'Sayaxché', 'Melchor de Mencos', 'Poptún',
        'Las Cruces', 'El Chal'
      ]
    },
    {
      nombre: 'Quetzaltenango',
      municipios: [
        'Quetzaltenango', 'Salcajá', 'Olintepeque', 'San Carlos Sija', 'Sibilia',
        'Cabricán', 'Cajolá', 'San Miguel Sigüilá', 'San Juan Ostuncalco', 'San Mateo',
        'Concepción Chiquirichapa', 'San Martín Sacatepéquez', 'Almolonga', 'Cantel',
        'Huitán', 'Zunil', 'Colomba Costa Cuca', 'San Francisco La Unión', 'El Palmar',
        'Coatepeque', 'Génova', 'Flores Costa Cuca', 'La Esperanza', 'Palestina de Los Altos'
      ]
    },
    {
      nombre: 'Quiché',
      municipios: [
        'Santa Cruz del Quiché', 'Chiché', 'Chinique', 'Zacualpa', 'Chajul', 'Santo Tomás Chichicastenango',
        'Patzité', 'San Antonio Ilotenango', 'San Pedro Jocopilas', 'Cunén', 'San Juan Cotzal',
        'Joyabaj', 'Nebaj', 'San Andrés Sajcabajá', 'San Miguel Uspantán', 'Sacapulas',
        'San Bartolomé Jocotenango', 'Canillá', 'Chicamán', 'Ixcán', 'Pachalum', 'Playa Grande'
      ]
    },
    {
      nombre: 'Retalhuleu',
      municipios: [
        'Retalhuleu', 'San Sebastián', 'Santa Cruz Muluá', 'San Martín Zapotitlán',
        'San Felipe', 'San Andrés Villa Seca', 'Champerico', 'Nuevo San Carlos', 'El Asintal'
      ]
    },
    {
      nombre: 'Sacatepéquez',
      municipios: [
        'Antigua Guatemala', 'Jocotenango', 'Pastores', 'Sumpango', 'Santo Domingo Xenacoj',
        'Santiago Sacatepéquez', 'San Bartolomé Milpas Altas', 'San Lucas Sacatepéquez',
        'Santa Lucía Milpas Altas', 'Magdalena Milpas Altas', 'Santa María de Jesús',
        'Ciudad Vieja', 'San Miguel Dueñas', 'Alotenango', 'San Antonio Aguas Calientes', 'Santa Catarina Barahona'
      ]
    },
    {
      nombre: 'San Marcos',
      municipios: [
        'San Marcos', 'San Pedro Sacatepéquez', 'San Antonio Sacatepéquez', 'Comitancillo',
        'San Miguel Ixtahuacán', 'Concepción Tutuapa', 'Tacaná', 'Sibinal', 'Tajumulco',
        'Tejutla', 'San Rafael Pie de la Cuesta', 'Nuevo Progreso', 'El Tumbador',
        'El Rodeo', 'Malacatán', 'Catarina', 'Ayutla', 'Ocós', 'San Pablo',
        'El Quetzal', 'La Reforma', 'Pajapita', 'Ixchiguán', 'San José Ojetenam',
        'San Cristóbal Cucho', 'Sipacapa', 'Esquipulas Palo Gordo', 'Río Blanco', 'San Lorenzo'
      ]
    },
    {
      nombre: 'Santa Rosa',
      municipios: [
        'Cuilapa', 'Casillas', 'Nueva Santa Rosa', 'Santa Rosa de Lima', 'Barberena',
        'Santa María Ixhuatán', 'Guazacapán', 'Santa Cruz Naranjo', 'Pueblo Nuevo Viñas',
        'Taxisco', 'Oratorio', 'San Juan Tecuaco', 'Chiquimulilla'
      ]
    },
    {
      nombre: 'Sololá',
      municipios: [
        'Sololá', 'San José Chacayá', 'Santa María Visitación', 'Santa Lucía Utatlán',
        'Nahualá', 'Santa Catarina Ixtahuacán', 'Santa Clara La Laguna', 'Concepción',
        'San Andrés Semetabaj', 'Panajachel', 'Santa Catarina Palopó', 'San Antonio Palopó',
        'San Lucas Tolimán', 'Santa Cruz La Laguna', 'San Pablo La Laguna', 'San Marcos La Laguna',
        'San Juan La Laguna', 'San Pedro La Laguna', 'Santiago Atitlán'
      ]
    },
    {
      nombre: 'Suchitepéquez',
      municipios: [
        'Mazatenango', 'Cuyotenango', 'San Francisco Zapotitlán', 'San Bernardino',
        'San José El Ídolo', 'Santo Domingo Suchitepéquez', 'San Lorenzo', 'Samayac',
        'San Pablo Jocopilas', 'San Antonio Suchitepéquez', 'San Miguel Panán',
        'San Gabriel', 'Chicacao', 'Patulul', 'Santa Bárbara', 'San Juan Bautista',
        'Santo Tomás La Unión', 'Zunilito', 'Pueblo Nuevo', 'Río Bravo'
      ]
    },
    {
      nombre: 'Totonicapán',
      municipios: [
        'Totonicapán', 'San Cristóbal Totonicapán', 'San Francisco El Alto',
        'San Andrés Xecul', 'Momostenango', 'Santa María Chiquimula', 'Santa Lucía La Reforma', 'San Bartolo'
      ]
    },
    {
      nombre: 'Zacapa',
      municipios: [
        'Zacapa', 'Estanzuela', 'Río Hondo', 'Gualán', 'Teculután', 'Usumatlán',
        'Cabañas', 'San Diego', 'La Unión', 'Huité'
      ]
    }
  ];
  
  // Formulario principal usando las interfaces del servicio
  shipmentForm: NewShipmentForm = {
    receiverName: '',
    receiverEmail: '',
    receiverReference: 'casa',
    receiverPoblado: '',
    receiverMunicipio: '',
    receiverDepartamento: '',
    receiverPhone: '',
    paymentMethodId: '',
    packageTypeId: ''
  };

  // Arrays para datos del servicio
  paymentMethods: PaymentMethod[] = [];
  packageTypes: PackageType[] = [];
  
  // Variables adicionales para compatibilidad
  costoTotal: number = 0;
  codigoGuia: string = '';

  // Tipos de paquete para visualización (mismo formato que cotizar)
  tiposPaqueteVisualizacion: TipoPaquete[] = [
    {
      id: 1,
      nombre: 'Pequeño',
      icono: '📦',
      limiteSize: '28cm',
      limitePeso: '10lbs',
      descripcion: 'Ideal para documentos y objetos pequeños',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      nombre: 'Mediano',
      icono: '📦',
      limiteSize: '36cm',
      limitePeso: '30lbs',
      descripcion: 'Perfecto para ropa y objetos medianos',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 3,
      nombre: 'Grande',
      icono: '📦',
      limiteSize: '47cm',
      limitePeso: '40lbs',
      descripcion: 'Para electrodomésticos pequeños y más',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 4,
      nombre: 'Extra Grande',
      icono: '📦',
      limiteSize: '51cm',
      limitePeso: '59lbs',
      descripcion: 'Para objetos grandes y pesados',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      id: 5,
      nombre: 'Sobredimensionado',
      icono: '📦',
      limiteSize: 'Más de 51cm',
      limitePeso: 'Más de 60lbs',
      descripcion: 'Para envíos especiales y muy pesados',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  // Variable para el tipo seleccionado
  tipoSeleccionado: TipoPaquete | null = null;
  
  // Opciones para los selectores
  referenciaOpciones = [
    { value: 'casa', label: 'Casa' },
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'gimnasio', label: 'Gimnasio' },
    { value: 'escuela', label: 'Escuela' }
  ];
  
  metodoPagoOpciones = [
    { 
      value: 'contra_entrega', 
      label: 'Cobro contra entrega', 
      cargo: 4.00,
      descripcion: 'Q. 4.00 de cargos adicionales' 
    },
    { 
      value: 'mi_cuenta', 
      label: 'Cobro a mi cuenta', 
      cargo: 0,
      descripcion: 'Sin cargos adicionales' 
    },
    { 
      value: 'tarjeta', 
      label: 'Pago con tarjeta de crédito o débito', 
      cargo: 0,
      descripcion: 'Pago inmediato' 
    }
  ];
  
  tiposPaquete = [
    { value: 'sobres', label: 'Sobres (hasta 500g)', maxPeso: 0.5, precio: 15 },
    { value: 'paquete_pequeno', label: 'Paquete Pequeño (hasta 2kg)', maxPeso: 2, precio: 25 },
    { value: 'paquete_mediano', label: 'Paquete Mediano (hasta 5kg)', maxPeso: 5, precio: 35 },
    { value: 'paquete_grande', label: 'Paquete Grande (hasta 10kg)', maxPeso: 10, precio: 50 },
    { value: 'paquete_extra', label: 'Paquete Extra Grande (hasta 25kg)', maxPeso: 25, precio: 75 }
  ];
  
  // Datos de ubicaciones usando la interfaz del servicio
  departamentos: LocationData[] = [
    {
      department: 'Guatemala',
      municipality: 'Guatemala'
    },
    {
      department: 'Guatemala',
      municipality: 'Mixco'
    },
    {
      department: 'Guatemala',
      municipality: 'Villa Nueva'
    },
    {
      department: 'Sacatepéquez',
      municipality: 'Antigua Guatemala'
    },
    {
      department: 'Sacatepéquez',
      municipality: 'San Lucas Sacatepéquez'
    }
  ];
  
  // Variables para los selectores dependientes
  municipiosDisponibles: string[] = [];
  pobladosDisponibles: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private enviosService: EnviosService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadFrequentAddresses();
    this.loadPaymentMethods();
    this.loadPackageTypes();
    this.initializeMunicipiosList();
  }

  private initializeMunicipiosList(): void {
    // Crear lista completa de municipios con su departamento
    this.todosLosMunicipios = [];
    this.departamentosGuatemala.forEach(depto => {
      depto.municipios.forEach(municipio => {
        this.todosLosMunicipios.push({
          nombre: municipio,
          departamento: depto.nombre
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadUserData(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  // Cargar direcciones frecuentes del usuario
  private loadFrequentAddresses(): void {
    this.isLoading = true;
    this.subscription.add(
      this.http.get<{success: boolean, data: FrequentAddress[]}>(`${this.apiUrl}/frequent-addresses`).subscribe({
        next: (response) => {
          if (response.success) {
            this.frequentAddresses = response.data;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading frequent addresses:', error);
          this.isLoading = false;
        }
      })
    );
  }

  // Cargar métodos de pago
  private loadPaymentMethods(): void {
    this.subscription.add(
      this.enviosService.obtenerMetodosPago().subscribe({
        next: (response) => {
          if (response.success) {
            this.paymentMethods = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading payment methods:', error);
        }
      })
    );
  }

  // Cargar tipos de paquetes
  private loadPackageTypes(): void {
    this.subscription.add(
      this.enviosService.obtenerTiposPaquetes().subscribe({
        next: (response) => {
          if (response.success) {
            this.packageTypes = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading package types:', error);
        }
      })
    );
  }

  // Buscar en direcciones frecuentes
  onSearchFrequentAddresses(): void {
    if (this.searchTerm.length >= 2) {
      this.showFrequentAddresses = true;
    } else {
      this.showFrequentAddresses = false;
    }
  }

  // Filtrar direcciones frecuentes
  getFilteredFrequentAddresses(): FrequentAddress[] {
    if (!this.searchTerm) return this.frequentAddresses;
    
    const term = this.searchTerm.toLowerCase();
    return this.frequentAddresses.filter(addr => 
      addr.nickname.toLowerCase().includes(term) ||
      addr.contactName.toLowerCase().includes(term) ||
      addr.address.department.toLowerCase().includes(term) ||
      addr.address.municipality.toLowerCase().includes(term)
    );
  }

  // Seleccionar dirección frecuente
  selectFrequentAddress(address: FrequentAddress): void {
    this.shipmentForm.receiverName = address.contactName;
    this.shipmentForm.receiverEmail = address.email || '';
    this.shipmentForm.receiverReference = address.category === 'otro' ? 'casa' : address.category;
    this.shipmentForm.receiverDepartamento = address.address.department;
    this.shipmentForm.receiverMunicipio = address.address.municipality;
    this.shipmentForm.receiverPoblado = address.address.zone || '';
    this.shipmentForm.receiverPhone = address.phone;
    this.shipmentForm.frequentAddressId = address._id;
    
    this.updateMunicipios();
    this.showFrequentAddresses = false;
    this.searchTerm = '';
    
    // Incrementar contador de uso si se implementa en el backend
    if (address._id) {
      this.incrementAddressUsage(address._id);
    }
  }

  private incrementAddressUsage(addressId: string): void {
    this.http.patch(`${this.apiUrl}/frequent-addresses/${addressId}/increment`, {}).subscribe();
  }

  // Manejar cambios en departamento
  onDepartamentoChange(): void {
    this.shipmentForm.receiverMunicipio = '';
    this.shipmentForm.receiverPoblado = '';
    this.updateMunicipios();
  }

  // Manejar cambios en municipio
  onMunicipioChange(): void {
    this.shipmentForm.receiverPoblado = '';
  }

  private updateMunicipios(): void {
    this.municipiosDisponibles = this.departamentos
      .filter(d => d.department === this.shipmentForm.receiverDepartamento)
      .map(d => d.municipality);
  }

  // Getter para obtener departamentos únicos
  get uniqueDepartments(): string[] {
    return [...new Set(this.departamentos.map(d => d.department))];
  }

  // Manejar cambio de método de pago
  onMetodoPagoChange(): void {
    // Buscar el método seleccionado en los datos del servicio
    const metodo = this.paymentMethods.find(m => m._id === this.shipmentForm.paymentMethodId);
    this.calcularCostoTotal();
  }

  // Manejar cambio de tipo de paquete
  onTipoPaqueteChange(): void {
    // Buscar el tipo seleccionado en los datos del servicio
    const tipo = this.packageTypes.find(t => t._id === this.shipmentForm.packageTypeId);
    if (tipo && this.shipmentForm.packageWeight && this.shipmentForm.packageWeight > tipo.specifications.maxWeight) {
      this.shipmentForm.packageWeight = tipo.specifications.maxWeight;
    }
    this.calcularCostoTotal();
  }

  // Calcular costo total del envío
  calcularCostoTotal(): void {
    let costoBase = 0;
    
    // Obtener precio base según tipo de paquete
    const tipoPaquete = this.packageTypes.find(t => t._id === this.shipmentForm.packageTypeId);
    if (tipoPaquete) {
      costoBase = tipoPaquete.pricing.basePrice;
    }
    
    // Agregar cargos adicionales por método de pago
    const metodoPago = this.paymentMethods.find(m => m._id === this.shipmentForm.paymentMethodId);
    const cargosPago = metodoPago ? metodoPago.fees.fixedAmount : 0;
    
    // Calcular recargo por peso extra si aplica
    let recargosPeso = 0;
    if (tipoPaquete && this.shipmentForm.packageWeight && this.shipmentForm.packageWeight > tipoPaquete.specifications.maxWeight) {
      const pesoExtra = this.shipmentForm.packageWeight - tipoPaquete.specifications.maxWeight;
      recargosPeso = pesoExtra * 5; // Q5 por kg extra
    }
    
    this.costoTotal = costoBase + cargosPago + recargosPeso;
  }

  // Navegación entre pasos
  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        if (this.currentStep === 4) {
          this.calcularCostoTotal();
          this.generateGuiaCode();
        }
        this.clearMessages();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.clearMessages();
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.clearMessages();
    }
  }

  // Validaciones por paso
  validateCurrentStep(): boolean {
    this.clearMessages();
    
    switch (this.currentStep) {
      case 1:
        return this.validateDestinatario();
      case 2:
        return this.validateMetodoPago();
      case 3:
        return this.validatePaquete();
      case 4:
        return true; // Resumen, no necesita validación adicional
      default:
        return false;
    }
  }

  private validateDestinatario(): boolean {
    if (!this.shipmentForm.receiverName.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return false;
    }
    
    if (!this.shipmentForm.receiverEmail.trim() || !this.isValidEmail(this.shipmentForm.receiverEmail)) {
      this.errorMessage = 'El correo electrónico es obligatorio y debe ser válido';
      return false;
    }
    
    if (!this.shipmentForm.receiverReference) {
      this.errorMessage = 'La referencia es obligatoria';
      return false;
    }
    
    if (!this.shipmentForm.receiverDepartamento) {
      this.errorMessage = 'El departamento es obligatorio';
      return false;
    }
    
    if (!this.shipmentForm.receiverPhone?.trim()) {
      this.errorMessage = 'El número de teléfono es obligatorio';
      return false;
    }
    
    return true;
  }

  private validateMetodoPago(): boolean {
    if (!this.shipmentForm.paymentMethodId) {
      this.errorMessage = 'Debe seleccionar un método de pago';
      return false;
    }
    return true;
  }

  private validatePaquete(): boolean {
    if (!this.shipmentForm.packageTypeId) {
      this.errorMessage = 'Debe seleccionar un tipo de paquete';
      return false;
    }
    
    if (!this.shipmentForm.packageWeight || this.shipmentForm.packageWeight <= 0) {
      this.errorMessage = 'El peso debe ser mayor a 0';
      return false;
    }
    
    if (!this.shipmentForm.packageDescription?.trim()) {
      this.errorMessage = 'La descripción del paquete es obligatoria';
      return false;
    }
    
    if (!this.shipmentForm.packageValue || this.shipmentForm.packageValue <= 0) {
      this.errorMessage = 'El valor declarado debe ser mayor a 0';
      return false;
    }
    
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generar código de guía único
  private generateGuiaCode(): void {
    const prefix = 'DSE';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.codigoGuia = `${prefix}${timestamp}${random}`;
  }

  // Guardar dirección como frecuente
  saveAsFrequentAddress(): void {
    const frequentAddress = {
      nickname: `${this.shipmentForm.receiverReference} - ${this.shipmentForm.receiverName}`,
      category: this.shipmentForm.receiverReference,
      contactName: this.shipmentForm.receiverName,
      phone: this.shipmentForm.receiverPhone || '',
      email: this.shipmentForm.receiverEmail,
      address: {
        department: this.shipmentForm.receiverDepartamento,
        municipality: this.shipmentForm.receiverMunicipio,
        zone: this.shipmentForm.receiverPoblado,
        street: this.shipmentForm.receiverAddress?.street || '',
        reference: `${this.shipmentForm.receiverReference} address`
      }
    };
    
    this.subscription.add(
      this.http.post(`${this.apiUrl}/frequent-addresses`, frequentAddress).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.successMessage = 'Dirección guardada como frecuente';
            this.loadFrequentAddresses(); // Recargar lista
          }
        },
        error: (error) => {
          console.error('Error saving frequent address:', error);
        }
      })
    );
  }

  // Envío final del formulario
  onSubmit(): void {
    if (!this.validateCurrentStep()) {
      return;
    }
    
    this.isSubmitting = true;
    this.clearMessages();
    
    // Crear datos usando la nueva estructura del backend
    const shipmentData = {
      ...this.shipmentForm,
      packageWeight: this.shipmentForm.packageWeight || 1,
      packageValue: this.shipmentForm.packageValue || 100,
      packageDescription: this.shipmentForm.packageDescription || 'Paquete general'
    };
    
    this.subscription.add(
      this.http.post(`${this.apiUrl}/shipments/create-with-validation`, shipmentData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          
          if (response.success) {
            this.codigoGuia = response.shipment.trackingNumber;
            this.successMessage = `¡Envío creado exitosamente! Código de guía: ${this.codigoGuia}`;
            
            // Generar PDF automáticamente
            this.generatePDF();
            
            setTimeout(() => {
              this.router.navigate(['/rastreo'], { 
                queryParams: { codigo: this.codigoGuia } 
              });
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Error al crear el envío';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.errorMessage = 'Error interno del servidor. Intenta nuevamente.';
          console.error('Error creating shipment:', error);
        }
      })
    );
  }

  // Generar PDF de la guía
  generatePDF(): void {
    // Esta función se implementará para generar el PDF con todos los datos
    console.log('Generando PDF para guía:', this.codigoGuia);
    
    // Aquí se implementaría la lógica para generar el PDF
    // Puede usar librerías como jsPDF o llamar a un endpoint del backend
  }

  // Utilidades
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetForm(): void {
    this.currentStep = 1;
    this.shipmentForm = {
      receiverName: '',
      receiverEmail: '',
      receiverReference: 'casa',
      receiverPoblado: '',
      receiverMunicipio: '',
      receiverDepartamento: '',
      receiverPhone: '',
      paymentMethodId: '',
      packageTypeId: ''
    };
    this.costoTotal = 0;
    this.codigoGuia = '';
    this.clearMessages();
  }

  getStepTitle(step: number): string {
    const titles = {
      1: 'Información del Destinatario',
      2: 'Método de Pago',
      3: 'Detalles del Paquete',
      4: 'Resumen y Confirmación'
    };
    return titles[step as keyof typeof titles] || 'Paso';
  }

  // Función para obtener el peso máximo permitido por tipo de paquete
  getMaxWeightForPackageType(typeId: string): number {
    const paquete = this.packageTypes.find(p => p._id === typeId);
    return paquete ? paquete.specifications.maxWeight : 0;
  }

  // Función para validar que el peso no exceda el máximo
  validateWeight(): boolean {
    if (!this.shipmentForm.packageTypeId || !this.shipmentForm.packageWeight) {
      return false;
    }
    const maxWeight = this.getMaxWeightForPackageType(this.shipmentForm.packageTypeId);
    return this.shipmentForm.packageWeight <= maxWeight;
  }

  // ===== MÉTODOS DE BÚSQUEDA DE DIRECCIONES =====

  // Filtrar departamentos según la búsqueda
  onBuscarDepartamento(): void {
    if (this.busquedaDepartamento.length === 0) {
      this.departamentosFiltrados = [];
      this.mostrarListaDepartamentos = false;
      return;
    }

    this.departamentosFiltrados = this.departamentosGuatemala
      .map(depto => depto.nombre)
      .filter(nombre => 
        nombre.toLowerCase().includes(this.busquedaDepartamento.toLowerCase())
      )
      .slice(0, 10); // Limitar a 10 resultados

    this.mostrarListaDepartamentos = this.departamentosFiltrados.length > 0;
  }

  // Seleccionar departamento
  seleccionarDepartamento(departamento: string): void {
    this.shipmentForm.receiverDepartamento = departamento;
    this.busquedaDepartamento = departamento;
    this.mostrarListaDepartamentos = false;
    
    // Limpiar municipio cuando se cambia el departamento
    this.shipmentForm.receiverMunicipio = '';
    this.busquedaMunicipio = '';
    this.municipiosFiltrados = [];
    this.mostrarListaMunicipios = false;
  }

  // Filtrar municipios según la búsqueda y departamento seleccionado
  onBuscarMunicipio(): void {
    if (this.busquedaMunicipio.length === 0) {
      this.municipiosFiltrados = [];
      this.mostrarListaMunicipios = false;
      return;
    }

    // Si hay departamento seleccionado, filtrar solo los municipios de ese departamento
    let municipiosParaFiltrar = this.todosLosMunicipios;
    
    if (this.shipmentForm.receiverDepartamento) {
      municipiosParaFiltrar = this.todosLosMunicipios.filter(municipio => 
        municipio.departamento === this.shipmentForm.receiverDepartamento
      );
    }

    this.municipiosFiltrados = municipiosParaFiltrar
      .filter(municipio => 
        municipio.nombre.toLowerCase().includes(this.busquedaMunicipio.toLowerCase())
      )
      .slice(0, 10); // Limitar a 10 resultados

    this.mostrarListaMunicipios = this.municipiosFiltrados.length > 0;
  }

  // Seleccionar municipio
  seleccionarMunicipio(municipio: Municipio): void {
    this.shipmentForm.receiverMunicipio = municipio.nombre;
    this.busquedaMunicipio = municipio.nombre;
    this.mostrarListaMunicipios = false;
    
    // Auto-completar departamento si no estaba seleccionado
    if (!this.shipmentForm.receiverDepartamento) {
      this.shipmentForm.receiverDepartamento = municipio.departamento;
      this.busquedaDepartamento = municipio.departamento;
    }
  }

  // Ocultar listas cuando se hace clic fuera
  onBlurDepartamento(): void {
    setTimeout(() => {
      this.mostrarListaDepartamentos = false;
    }, 200);
  }

  onBlurMunicipio(): void {
    setTimeout(() => {
      this.mostrarListaMunicipios = false;
    }, 200);
  }

  // Mostrar listas al hacer focus
  onFocusDepartamento(): void {
    if (this.departamentosFiltrados.length > 0) {
      this.mostrarListaDepartamentos = true;
    }
  }

  onFocusMunicipio(): void {
    if (this.municipiosFiltrados.length > 0) {
      this.mostrarListaMunicipios = true;
    }
  }

  // ===== MÉTODOS PARA SELECCIÓN DE TIPO DE PAQUETE =====

  // Seleccionar tipo de paquete
  seleccionarTipoPaquete(tipo: TipoPaquete): void {
    this.tipoSeleccionado = tipo;
    
    // Buscar el packageType correspondiente en el arreglo del servicio
    const packageTypeCorrespondiente = this.packageTypes.find(pt => 
      pt.displayName.toLowerCase().includes(tipo.nombre.toLowerCase()) ||
      tipo.nombre.toLowerCase().includes(pt.displayName.toLowerCase())
    );
    
    if (packageTypeCorrespondiente && packageTypeCorrespondiente._id) {
      this.shipmentForm.packageTypeId = packageTypeCorrespondiente._id;
      this.onTipoPaqueteChange();
    }
  }
}