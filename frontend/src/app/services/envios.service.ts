import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Interfaces para la API existentes
interface CotizacionRequest {
  origen: string;
  destino: string;
  paquetes: PaqueteRequest[];
  servicio?: string;
}

interface PaqueteRequest {
  id: string;
  tipo: string;
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
  valor_declarado: number;
  cantidad: number;
  nombrePersonalizado: string;
}

// ============================================
// NUEVAS INTERFACES PARA EL FORMULARIO DE ENVÍOS
// ============================================

// Dirección frecuente
export interface FrequentAddress {
  _id?: string;
  userId: string;
  nickname: string;
  category: 'casa' | 'trabajo' | 'gimnasio' | 'escuela' | 'otro';
  contactName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: {
    department: string;
    municipality: string;
    zone?: string;
    street: string;
    building?: string;
    floor?: string;
    apartment?: string;
    reference?: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  deliveryInstructions?: {
    preferredTime?: string;
    accessNotes?: string;
    alternateRecipient?: string;
    gateCode?: string;
    parkingInstructions?: string;
  };
  usageCount: number;
  lastUsed?: Date;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Método de pago
export interface PaymentMethod {
  _id?: string;
  methodId: string;
  displayName: string;
  description: string;
  type: string;
  isActive: boolean;
  requiresVerification: boolean;
  fees: {
    fixedAmount: number;
    percentageRate: number;
    minimumCharge: number;
    maximumCharge?: number;
    currency: string;
  };
  restrictions: {
    maxOrderValue: number;
    minOrderValue: number;
    allowedRegions: string[];
    excludedRegions: string[];
    requiresDocument: boolean;
  };
  settings: {
    collectionTimeout: number;
    verificationRequired: boolean;
    allowPartialPayment: boolean;
    refundable: boolean;
  };
}

// Tipo de paquete
export interface PackageType {
  _id?: string;
  typeId: string;
  displayName: string;
  category: string;
  specifications: {
    maxWeight: number;
    maxDimensions: {
      length: number;
      width: number;
      height: number;
    };
    fragile: boolean;
    stackable: boolean;
    requiresSignature: boolean;
  };
  pricing: {
    basePrice: number;
    priceModifier: number;
    includedServices: string[];
    excludedServices: string[];
  };
  contentRestrictions: {
    allowedItems: string[];
    prohibitedItems: string[];
    requiresDeclaration: boolean;
  };
  deliveryOptions: {
    availableServices: string[];
    defaultService: string;
    maxDeliveryDays: number;
    trackingLevel: string;
  };
  isActive: boolean;
  displayOrder: number;
}

// Datos del nuevo formulario de envío
export interface NewShipmentForm {
  // Paso 1: Información del destinatario (campos obligatorios con *)
  receiverName: string;           // *
  receiverEmail: string;          // *
  receiverReference: 'casa' | 'trabajo' | 'gimnasio' | 'escuela';  // *
  receiverPoblado: string;        // *
  receiverMunicipio: string;      // *
  receiverDepartamento: string;   // *
  receiverPhone?: string;
  receiverAddress?: any;
  frequentAddressId?: string;
  
  // Paso 2: Método de pago
  paymentMethodId: string;        // *
  
  // Paso 3: Tipo de paquete
  packageTypeId: string;          // *
  packageWeight?: number;
  packageDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  packageValue?: number;
  packageDescription?: string;
  
  // Información del remitente (opcional)
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  senderAddress?: any;
}

// Ubicación (Guatemala)
export interface LocationData {
  department: string;
  municipality: string;
  village?: string;
}

interface CotizacionResponse {
  success: boolean;
  cotizacion: {
    id: string;
    origen: {
      ciudad: string;
      departamento: string;
      display: string;
    };
    destino: {
      ciudad: string;
      departamento: string;
      display: string;
    };
    distancia: {
      distance: number;
      duration: number;
      distanceText: string;
      durationText: string;
      source: string;
    };
    paquetes: PaqueteCotizado[];
    servicios: ServicioDisponible[];
    total_general: number;
    moneda: string;
    tiempo_entrega: string;
    valida_hasta: string;
    generada_en: string;
  };
  message: string;
}

interface PaqueteCotizado {
  paquete_id: string;
  nombre: string;
  cantidad: number;
  total: number;
  currency: string;
  breakdown: {
    basePrice: number;
    weightCost: number;
    distanceCost: number;
    insuranceCost: number;
    oversizeCost: number;
    fuelSurcharge: number;
    handlingSurcharge: number;
    subtotal: number;
    total: number;
  };
  estimatedDelivery: string;
  serviceType: string;
}

interface ServicioDisponible {
  id: string;
  nombre: string;
  descripcion: string;
  precio_base: number;
  tiempo_entrega: string;
  precio_por_kg: number;
}

@Injectable({
  providedIn: 'root'
})
export class EnviosService {
  private apiUrl = 'http://localhost:3005/api'; // URL del backend
  private cotizacionActual = new BehaviorSubject<CotizacionResponse | null>(null);
  
  // Observable para que los componentes puedan suscribirse
  public cotizacion$ = this.cotizacionActual.asObservable();

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  /**
   * Solicita una cotización de envío
   */
  cotizarEnvio(request: CotizacionRequest): Observable<CotizacionResponse> {
    console.log(' Enviando solicitud de cotización:', request);
    
    return this.http.post<CotizacionResponse>(
      `${this.apiUrl}/cotizar`, 
      request, 
      this.getHttpOptions()
    ).pipe(
      tap(response => {
        console.log(' Cotización recibida:', response);
        if (response.success) {
          this.cotizacionActual.next(response);
        }
      }),
      catchError(error => {
        console.error(' Error en cotización:', error);
        throw error;
      })
    );
  }

  /**
   * Convierte los paquetes del formato del componente al formato de la API
   */
  convertirPaquetesParaAPI(paquetesSeleccionados: any[]): PaqueteRequest[] {
    return paquetesSeleccionados.map(paquete => ({
      id: paquete.id,
      tipo: paquete.tipo.id || paquete.tipo.nombre,
      peso: this.extraerNumero(paquete.tipo.limitePeso) || 1,
      largo: 20, // Valores por defecto, se pueden hacer dinámicos
      ancho: 20,
      alto: 20,
      valor_declarado: 0, // Se puede agregar al formulario
      cantidad: paquete.cantidad,
      nombrePersonalizado: paquete.nombrePersonalizado
    }));
  }

  /**
   * Extrae números de strings como "hasta 5kg"
   */
  private extraerNumero(texto: string): number {
    if (!texto) return 1;
    const match = texto.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 1;
  }

  /**
   * Obtiene la cotización actual
   */
  getCotizacionActual(): CotizacionResponse | null {
    return this.cotizacionActual.value;
  }

  /**
   * Limpia la cotización actual
   */
  limpiarCotizacion(): void {
    this.cotizacionActual.next(null);
  }

  /**
   * Valida que una cotización aún esté vigente
   */
  esCotizacionValida(cotizacion: CotizacionResponse): boolean {
    if (!cotizacion?.cotizacion?.valida_hasta) return false;
    const validaHasta = new Date(cotizacion.cotizacion.valida_hasta);
    return validaHasta > new Date();
  }

  /**
   * Formatea un precio para mostrar
   */
  formatearPrecio(precio: number, moneda: string = 'GTQ'): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2
    }).format(precio);
  }

  /**
   * Obtiene el estado de la conexión del servidor
   */
  verificarConexion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`, this.getHttpOptions());
  }

  // ============================================
  // MÉTODOS PARA ENVÍOS MEJORADOS
  // ============================================

  /**
   * Crear envío mejorado con autenticación
   */
  crearEnvioMejorado(datosEnvio: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('📦 Creando envío mejorado:', datosEnvio);

    return this.http.post(`${this.apiUrl}/shipments/enhanced`, datosEnvio, { headers }).pipe(
      tap(response => {
        console.log('✅ Envío creado exitosamente:', response);
      }),
      catchError(error => {
        console.error('❌ Error al crear envío:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener envíos del usuario autenticado
   */
  obtenerEnviosUsuario(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/shipments/user`, { headers }).pipe(
      tap(response => {
        console.log('📋 Envíos obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener envíos:', error);
        throw error;
      })
    );
  }

  /**
   * Actualizar estado de envío
   */
  actualizarEstadoEnvio(shipmentId: string, status: string, location?: string, description?: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const data = {
      status,
      location: location || 'Guatemala',
      description: description || `Estado actualizado a ${status}`
    };

    return this.http.put(`${this.apiUrl}/shipments/${shipmentId}/status`, data, { headers }).pipe(
      tap(response => {
        console.log('✅ Estado actualizado:', response);
      }),
      catchError(error => {
        console.error('❌ Error al actualizar estado:', error);
        throw error;
      })
    );
  }

  /**
   * Rastrear envío por número de tracking (público)
   */
  rastrearEnvio(trackingNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/shipments/track/${trackingNumber}`).pipe(
      tap(response => {
        console.log('🔍 Información de rastreo:', response);
      }),
      catchError(error => {
        console.error('❌ Error al rastrear envío:', error);
        throw error;
      })
    );
  }

  // ============================================
  // NUEVOS MÉTODOS PARA EL FORMULARIO DE ENVÍOS
  // ============================================

  /**
   * Obtener direcciones frecuentes del usuario
   */
  obtenerDireccionesFrecuentes(category?: string, search?: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = '';
    const queryParams = [];
    if (category) queryParams.push(`category=${category}`);
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (queryParams.length > 0) params = '?' + queryParams.join('&');

    return this.http.get(`${this.apiUrl}/frequent-addresses${params}`, { headers }).pipe(
      tap(response => {
        console.log('📍 Direcciones frecuentes obtenidas:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener direcciones frecuentes:', error);
        throw error;
      })
    );
  }

  /**
   * Crear nueva dirección frecuente
   */
  crearDireccionFrecuente(direccion: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/frequent-addresses`, direccion, { headers }).pipe(
      tap(response => {
        console.log('✅ Dirección frecuente creada:', response);
      }),
      catchError(error => {
        console.error('❌ Error al crear dirección frecuente:', error);
        throw error;
      })
    );
  }

  /**
   * Usar dirección frecuente (incrementar contador)
   */
  usarDireccionFrecuente(addressId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/frequent-addresses/${addressId}/use`, {}, { headers }).pipe(
      tap(response => {
        console.log('📊 Uso de dirección registrado:', response);
      }),
      catchError(error => {
        console.error('❌ Error al registrar uso de dirección:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener métodos de pago disponibles
   */
  obtenerMetodosPago(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment-methods`).pipe(
      tap(response => {
        console.log('💳 Métodos de pago obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener métodos de pago:', error);
        throw error;
      })
    );
  }

  /**
   * Calcular cargo por método de pago
   */
  calcularCargoPago(methodId: string, orderValue: number): Observable<any> {
    const data = { methodId, orderValue };

    return this.http.post(`${this.apiUrl}/payment-methods/calculate-fee`, data).pipe(
      tap(response => {
        console.log('💰 Cargo calculado:', response);
      }),
      catchError(error => {
        console.error('❌ Error al calcular cargo:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener tipos de paquetes disponibles
   */
  obtenerTiposPaquetes(category?: string): Observable<any> {
    let params = category ? `?category=${category}` : '';

    return this.http.get(`${this.apiUrl}/package-types${params}`).pipe(
      tap(response => {
        console.log('📦 Tipos de paquetes obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener tipos de paquetes:', error);
        throw error;
      })
    );
  }

  /**
   * Validar paquete según tipo
   */
  validarPaquete(typeId: string, weight?: number, dimensions?: any, value?: number): Observable<any> {
    const data = { typeId, weight, dimensions, value };

    return this.http.post(`${this.apiUrl}/package-types/validate`, data).pipe(
      tap(response => {
        console.log('✅ Validación de paquete:', response);
      }),
      catchError(error => {
        console.error('❌ Error al validar paquete:', error);
        throw error;
      })
    );
  }

  /**
   * Crear envío con validaciones completas
   */
  crearEnvioConValidacion(datosEnvio: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/shipments/create-with-validation`, datosEnvio, { headers }).pipe(
      tap(response => {
        console.log('🚚 Envío creado exitosamente:', response);
      }),
      catchError(error => {
        console.error('❌ Error al crear envío:', error);
        throw error;
      })
    );
  }

  /**
   * Crear un nuevo envío
   */
  createShipment(shipmentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/shipments/create-with-validation`, shipmentData).pipe(
      tap(response => {
        console.log('📦 Envío creado:', response);
      }),
      catchError(error => {
        console.error('❌ Error al crear envío:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener tipos de paquete disponibles
   */
  getPackageTypes(): Observable<PackageType[]> {
    return this.http.get<PackageType[]>(`${this.apiUrl}/package-types`).pipe(
      tap(response => {
        console.log('📦 Tipos de paquete obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener tipos de paquete:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener métodos de pago disponibles
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/payment-methods`).pipe(
      tap(response => {
        console.log('💳 Métodos de pago obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener métodos de pago:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener datos de ubicación (departamentos, municipios, etc.)
   */
  getLocationData(): Observable<LocationData> {
    return this.http.get<LocationData>(`${this.apiUrl}/locations/guatemala`).pipe(
      tap(response => {
        console.log('🌍 Datos de ubicación obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener datos de ubicación:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener departamentos de Guatemala
   */
  obtenerDepartamentos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/guatemala/departments`).pipe(
      tap(response => {
        console.log('🏛️ Departamentos obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener departamentos:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener municipios por departamento
   */
  obtenerMunicipios(department: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/guatemala/municipalities?department=${encodeURIComponent(department)}`).pipe(
      tap(response => {
        console.log('🏘️ Municipios obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener municipios:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener poblados/aldeas por municipio
   */
  obtenerPoblados(department: string, municipality: string): Observable<any> {
    const params = `?department=${encodeURIComponent(department)}&municipality=${encodeURIComponent(municipality)}`;
    
    return this.http.get(`${this.apiUrl}/guatemala/villages${params}`).pipe(
      tap(response => {
        console.log('🏡 Poblados obtenidos:', response);
      }),
      catchError(error => {
        console.error('❌ Error al obtener poblados:', error);
        throw error;
      })
    );
  }
}