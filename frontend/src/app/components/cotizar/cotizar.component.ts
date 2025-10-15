import { Component } from '@angular/core';

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

interface PaqueteSeleccionado {
  id: string;
  tipo: TipoPaquete;
  cantidad: number;
  nombrePersonalizado: string;
}

@Component({
  selector: 'app-cotizar',
  templateUrl: './cotizar.component.html',
  styleUrls: ['./cotizar.component.css']
})
export class CotizarComponent {
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

  // Variables para los formularios
  origenSeleccionado = '';
  destinoSeleccionado = '';
  origenFiltrado: string[] = [];
  destinoFiltrado: string[] = [];
  busquedaOrigen = '';
  busquedaDestino = '';
  mostrarListaOrigen = false;
  mostrarListaDestino = false;

  // Lista completa de municipios con departamento
  todosLosMunicipios: Municipio[] = [];

  // Variables para paquetes
  tiposPaquete: TipoPaquete[] = [
    {
      id: 1,
      nombre: 'Pequeño',
      icono: '📦',
      limiteSize: '28cm',
      limitePeso: '10lbs',
      descripcion: 'Ideal para documentos y objetos pequeños',
      color: '#e3f2fd'
    },
    {
      id: 2,
      nombre: 'Mediano',
      icono: '📋',
      limiteSize: '36cm',
      limitePeso: '30lbs',
      descripcion: 'Perfect para ropa y objetos medianos',
      color: '#f3e5f5'
    },
    {
      id: 3,
      nombre: 'Grande',
      icono: '📫',
      limiteSize: '47cm',
      limitePeso: '40lbs',
      descripcion: 'Para electrodomésticos pequeños y más',
      color: '#e8f5e8'
    },
    {
      id: 4,
      nombre: 'Extra Grande',
      icono: '🗃️',
      limiteSize: '51cm',
      limitePeso: '59lbs',
      descripcion: 'Para objetos grandes y pesados',
      color: '#fff3e0'
    },
    {
      id: 5,
      nombre: 'Sobredimensionado',
      icono: '🏗️',
      limiteSize: 'Más de 51cm',
      limitePeso: 'Más de 60lbs',
      descripcion: 'Para envíos especiales y muy pesados',
      color: '#ffebee'
    }
  ];

  paquetesSeleccionados: PaqueteSeleccionado[] = [];
  tipoSeleccionado: TipoPaquete | null = null;

  constructor() {
    this.generarListaMunicipios();
  }

  generarListaMunicipios() {
    this.todosLosMunicipios = [];
    this.departamentosGuatemala.forEach(depto => {
      depto.municipios.forEach(municipio => {
        this.todosLosMunicipios.push({
          nombre: municipio,
          departamento: depto.nombre
        });
      });
    });
    this.origenFiltrado = this.todosLosMunicipios.map(m => `${m.nombre}, ${m.departamento}`);
    this.destinoFiltrado = this.todosLosMunicipios.map(m => `${m.nombre}, ${m.departamento}`);
  }

  filtrarOrigen(evento: any) {
    const busqueda = evento.target.value.toLowerCase();
    this.busquedaOrigen = busqueda;
    
    if (busqueda === '') {
      this.origenFiltrado = this.todosLosMunicipios.map(m => `${m.nombre}, ${m.departamento}`);
    } else {
      this.origenFiltrado = this.todosLosMunicipios
        .filter(m => 
          m.nombre.toLowerCase().includes(busqueda) || 
          m.departamento.toLowerCase().includes(busqueda)
        )
        .map(m => `${m.nombre}, ${m.departamento}`);
    }
  }

  filtrarDestino(evento: any) {
    const busqueda = evento.target.value.toLowerCase();
    this.busquedaDestino = busqueda;
    
    if (busqueda === '') {
      this.destinoFiltrado = this.todosLosMunicipios.map(m => `${m.nombre}, ${m.departamento}`);
    } else {
      this.destinoFiltrado = this.todosLosMunicipios
        .filter(m => 
          m.nombre.toLowerCase().includes(busqueda) || 
          m.departamento.toLowerCase().includes(busqueda)
        )
        .map(m => `${m.nombre}, ${m.departamento}`);
    }
  }

  mostrarListaCompleta(tipo: string) {
    if (tipo === 'origen') {
      this.mostrarListaOrigen = true;
      this.origenFiltrado = this.todosLosMunicipios.map(m => `${m.nombre}, ${m.departamento}`);
    } else if (tipo === 'destino') {
      this.mostrarListaDestino = true;
      this.destinoFiltrado = this.todosLosMunicipios.map(m => `${m.nombre}, ${m.departamento}`);
    }
  }

  ocultarLista(tipo: string) {
    setTimeout(() => {
      if (tipo === 'origen') {
        this.mostrarListaOrigen = false;
      } else if (tipo === 'destino') {
        this.mostrarListaDestino = false;
      }
    }, 200);
  }

  seleccionarOrigen(ubicacion: string) {
    this.origenSeleccionado = ubicacion;
    this.busquedaOrigen = ubicacion;
    this.mostrarListaOrigen = false;
  }

  seleccionarDestino(ubicacion: string) {
    this.destinoSeleccionado = ubicacion;
    this.busquedaDestino = ubicacion;
    this.mostrarListaDestino = false;
  }

  limpiarOrigen() {
    this.origenSeleccionado = '';
    this.busquedaOrigen = '';
    this.mostrarListaOrigen = false;
  }

  limpiarDestino() {
    this.destinoSeleccionado = '';
    this.busquedaDestino = '';
    this.mostrarListaDestino = false;
  }

  cotizarEnvio() {
    if (this.origenSeleccionado && this.destinoSeleccionado && this.paquetesSeleccionados.length > 0) {
      console.log('Cotizando envío:');
      console.log('Origen:', this.origenSeleccionado);
      console.log('Destino:', this.destinoSeleccionado);
      console.log('Paquetes:', this.paquetesSeleccionados);
      // Aquí irá la lógica de cotización
    } else {
      let mensaje = 'Por favor completa la siguiente información:\n';
      if (!this.origenSeleccionado) mensaje += '- Selecciona el origen\n';
      if (!this.destinoSeleccionado) mensaje += '- Selecciona el destino\n';
      if (this.paquetesSeleccionados.length === 0) mensaje += '- Agrega al menos un paquete\n';
      alert(mensaje);
    }
  }

  // Métodos para manejo de paquetes
  seleccionarTipoPaquete(tipo: TipoPaquete) {
    this.tipoSeleccionado = tipo;
  }

  agregarPaquete() {
    if (this.tipoSeleccionado) {
      const nuevoPaquete: PaqueteSeleccionado = {
        id: Date.now().toString(),
        tipo: this.tipoSeleccionado,
        cantidad: 1,
        nombrePersonalizado: `${this.tipoSeleccionado.nombre} ${this.paquetesSeleccionados.length + 1}`
      };
      this.paquetesSeleccionados.push(nuevoPaquete);
      this.tipoSeleccionado = null;
    } else {
      alert('Por favor selecciona un tipo de paquete primero');
    }
  }

  eliminarPaquete(id: string) {
    this.paquetesSeleccionados = this.paquetesSeleccionados.filter(p => p.id !== id);
  }

  actualizarCantidad(id: string, cantidad: number) {
    const paquete = this.paquetesSeleccionados.find(p => p.id === id);
    if (paquete && cantidad > 0) {
      paquete.cantidad = cantidad;
    }
  }

  actualizarNombre(id: string, nombre: string) {
    const paquete = this.paquetesSeleccionados.find(p => p.id === id);
    if (paquete) {
      paquete.nombrePersonalizado = nombre;
    }
  }
}