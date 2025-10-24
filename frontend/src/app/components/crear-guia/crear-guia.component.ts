import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CreateGuiaRequest, Sucursal, Bodega, EstadoEnvio } from '../../interfaces/interfaces';

@Component({
  selector: 'app-crear-guia',
  templateUrl: './crear-guia.component.html',
  styleUrls: ['./crear-guia.component.css']
})
export class CrearGuiaComponent implements OnInit {
  guiaForm!: FormGroup;
  sucursales: Sucursal[] = [];
  bodegas: Bodega[] = [];
  bodegasOrigen: Bodega[] = [];
  bodegasDestino: Bodega[] = [];
  
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Opciones para selects
  departamentos = [
    'Guatemala', 'Quetzaltenango', 'Zacapa', 'Petén', 'Escuintla',
    'Chimaltenango', 'Huehuetenango', 'Alta Verapaz', 'Baja Verapaz'
  ];

  tiposEnvio = [
    { value: 'NACIONAL', label: 'Nacional' },
    { value: 'INTERNACIONAL', label: 'Internacional' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCatalogos();
  }

  private initializeForm(): void {
    this.guiaForm = this.fb.group({
      // Datos del remitente
      remitente: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]]
      }),
      
      // Dirección del remitente
      direccion_remitente: this.fb.group({
        departamento: ['', Validators.required],
        municipio: ['', Validators.required],
        aldea: [''],
        zona: [''],
        direccion_detalle: ['']
      }),

      // Datos del destinatario
      destinatario: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]]
      }),

      // Dirección del destinatario
      direccion_destinatario: this.fb.group({
        departamento: ['', Validators.required],
        municipio: ['', Validators.required],
        aldea: [''],
        zona: [''],
        direccion_detalle: ['']
      }),

      // Datos de la guía
      guia: this.fb.group({
        id_bodega_origen: ['', Validators.required],
        id_bodega_destino: ['', Validators.required],
        peso: ['', [Validators.required, Validators.min(0.1)]],
        dimensiones: [''],
        tipo_envio: ['NACIONAL', Validators.required],
        costo: ['', [Validators.required, Validators.min(1)]]
      })
    });

    // Observar cambios en bodegas para filtrar opciones
    this.guiaForm.get('guia.id_bodega_origen')?.valueChanges.subscribe(() => {
      this.updateBodegasDestino();
    });
  }

  private loadCatalogos(): void {
    this.isLoading = true;
    
    // Cargar sucursales y bodegas
    this.apiService.getSucursales().subscribe({
      next: (response) => {
        if (response.success) {
          this.sucursales = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error cargando sucursales:', error);
        this.errorMessage = 'Error cargando catálogos';
      }
    });

    this.apiService.getBodegas().subscribe({
      next: (response) => {
        if (response.success) {
          this.bodegas = response.data || [];
          this.bodegasOrigen = [...this.bodegas];
          this.updateBodegasDestino();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando bodegas:', error);
        this.errorMessage = 'Error cargando catálogos';
        this.isLoading = false;
      }
    });
  }

  private updateBodegasDestino(): void {
    const bodegaOrigenId = this.guiaForm.get('guia.id_bodega_origen')?.value;
    this.bodegasDestino = this.bodegas.filter(bodega => 
      bodega.id_bodega !== parseInt(bodegaOrigenId)
    );
    
    // Si la bodega destino seleccionada es la misma que origen, limpiarla
    const bodegaDestinoId = this.guiaForm.get('guia.id_bodega_destino')?.value;
    if (bodegaDestinoId && parseInt(bodegaDestinoId) === parseInt(bodegaOrigenId)) {
      this.guiaForm.get('guia.id_bodega_destino')?.setValue('');
    }
  }

  calculateCost(): void {
    const peso = this.guiaForm.get('guia.peso')?.value;
    const tipoEnvio = this.guiaForm.get('guia.tipo_envio')?.value;
    
    if (peso && peso > 0) {
      let costoPorKilo = tipoEnvio === 'INTERNACIONAL' ? 25 : 15;
      let costoCalculado = peso * costoPorKilo;
      
      // Costo mínimo
      costoCalculado = Math.max(costoCalculado, tipoEnvio === 'INTERNACIONAL' ? 100 : 50);
      
      this.guiaForm.get('guia.costo')?.setValue(costoCalculado.toFixed(2));
    }
  }

  onSubmit(): void {
    if (this.guiaForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const guiaData: CreateGuiaRequest = this.guiaForm.value;
      
      console.log('Datos de la guía a enviar:', guiaData);

      this.apiService.createGuia(guiaData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          if (response.success) {
            this.successMessage = `Guía creada exitosamente. Número de guía: ${response.data?.numero_guia}`;
            this.resetForm();
          } else {
            this.errorMessage = response.error || 'Error al crear la guía';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creando guía:', error);
          this.errorMessage = error.error?.error || 'Error interno del servidor';
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Por favor complete todos los campos requeridos';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.guiaForm.controls).forEach(key => {
      const control = this.guiaForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          control.get(subKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  resetForm(): void {
    this.guiaForm.reset();
    this.initializeForm();
  }

  // Helpers para validación
  isFieldInvalid(fieldPath: string): boolean {
    const field = this.guiaForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldPath: string): string {
    const field = this.guiaForm.get(fieldPath);
    if (field && field.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['pattern']) return 'Formato inválido';
    }
    return '';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}