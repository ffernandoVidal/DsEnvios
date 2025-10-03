import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  carouselImages = [
    {
      src: 'https://via.placeholder.com/1200x600/007bff/ffffff?text=Envíos+Rápidos+y+Seguros',
      alt: 'Envíos rápidos y seguros',
      title: 'Envíos Rápidos y Seguros',
      description: 'Conectamos tu negocio con el mundo a través de nuestro servicio de envíos'
    },
    {
      src: 'https://via.placeholder.com/1200x600/28a745/ffffff?text=Rastreo+en+Tiempo+Real',
      alt: 'Rastreo en tiempo real',
      title: 'Rastreo en Tiempo Real',
      description: 'Sigue tu paquete en cada paso del camino con nuestro sistema de tracking'
    },
    {
      src: 'https://via.placeholder.com/1200x600/6f42c1/ffffff?text=Cobertura+Nacional',
      alt: 'Cobertura nacional',
      title: 'Cobertura Nacional',
      description: 'Llegamos a todos los rincones del país con la mejor calidad de servicio'
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