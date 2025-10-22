import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  carouselImages = [
    {
      src: 'assets/images/carousel/1.jpg',
      alt: 'Servicios de logística y envíos',
      title: 'Envíos Rápidos y Seguros',
      description: 'Conectamos tu negocio con el mundo a través de nuestro servicio de envíos profesional'
    },
    {
      src: 'assets/images/carousel/2.jpg',
      alt: 'Tecnología de rastreo avanzada',
      title: 'Rastreo en Tiempo Real',
      description: 'Sigue tu paquete en cada paso del camino con nuestra tecnología de tracking avanzada'
    },
    {
      src: 'assets/images/carousel/3.jpg',
      alt: 'Cobertura nacional completa',
      title: 'Cobertura Nacional',
      description: 'Llegamos a todos los rincones del país con la mejor calidad de servicio garantizada'
    },
    {
      src: 'assets/images/carousel/4.jpg',
      alt: 'Equipo profesional de logística',
      title: 'Equipo Profesional',
      description: 'Nuestro equipo especializado garantiza el manejo seguro de tus envíos más importantes'
    },
    {
      src: 'assets/images/carousel/5.jpg',
      alt: 'Control de temperatura y calidad',
      title: 'Control de Calidad',
      description: 'Mantenemos los más altos estándares de calidad y control de temperatura para tus productos'
    },
    {
      src: 'assets/images/carousel/6.jpg',
      alt: 'Soluciones logísticas empresariales',
      title: 'Soluciones Empresariales',
      description: 'Ofrecemos soluciones logísticas personalizadas para empresas de todos los tamaños'
    },
    {
      src: 'assets/images/carousel/7.jpg',
      alt: 'Tecnología e innovación en envíos',
      title: 'Tecnología e Innovación',
      description: 'Utilizamos la última tecnología para optimizar tus envíos y reducir costos'
    },
    {
      src: 'assets/images/carousel/download (1).jpg',
      alt: 'Red de distribución nacional',
      title: 'Red de Distribución',
      description: 'Contamos con una amplia red de distribución para llegar a cualquier destino'
    }
  ];

  currentSlide = 0;

  collaborators = [
    {
      name: 'María González',
      position: 'Gerente de Operaciones',
      image: 'https://via.placeholder.com/120x120/007bff/ffffff?text=MG',
      description: 'Especialista en logística con más de 10 años de experiencia'
    },
    {
      name: 'Carlos Rodríguez',
      position: 'Director de Tecnología',
      image: 'https://via.placeholder.com/120x120/28a745/ffffff?text=CR',
      description: 'Experto en sistemas de tracking y automatización'
    },
    {
      name: 'Ana Martínez',
      position: 'Coordinadora de Servicio al Cliente',
      image: 'https://via.placeholder.com/120x120/dc3545/ffffff?text=AM',
      description: 'Comprometida con la excelencia en atención al cliente'
    },
    {
      name: 'Luis Fernández',
      position: 'Jefe de Distribución',
      image: 'https://via.placeholder.com/120x120/6f42c1/ffffff?text=LF',
      description: 'Garantiza entregas puntuales y eficientes'
    }
  ];

  brands = [
    { name: 'DHL', logo: 'https://via.placeholder.com/120x60/ffcc00/000000?text=DHL' },
    { name: 'FedEx', logo: 'https://via.placeholder.com/120x60/4b0082/ffffff?text=FedEx' },
    { name: 'UPS', logo: 'https://via.placeholder.com/120x60/8b4513/ffffff?text=UPS' },
    { name: 'Correos', logo: 'https://via.placeholder.com/120x60/ff0000/ffffff?text=Correos' },
    { name: 'SEUR', logo: 'https://via.placeholder.com/120x60/0066cc/ffffff?text=SEUR' },
    { name: 'MRW', logo: 'https://via.placeholder.com/120x60/228b22/ffffff?text=MRW' }
  ];

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.carouselImages.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.carouselImages.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}