# Imágenes del Carrusel

Coloca aquí las imágenes del carrusel principal. Recomendaciones:

## Archivos necesarios:
- `slide1.jpg` - Primera imagen del carrusel (1200x600px recomendado)
- `slide2.jpg` - Segunda imagen del carrusel (1200x600px recomendado)  
- `slide3.jpg` - Tercera imagen del carrusel (1200x600px recomendado)

## Especificaciones técnicas:
- **Resolución:** 1200x600 píxeles (ratio 2:1)
- **Formato:** JPG, PNG o WebP
- **Peso máximo:** 500KB por imagen
- **Contenido sugerido:**
  - slide1.jpg: Camiones de envío, logística
  - slide2.jpg: Tecnología, rastreo, códigos QR
  - slide3.jpg: Mapas, cobertura nacional

## Actualización en código:
Cuando agregues las imágenes reales, actualiza el archivo:
`src/app/components/home/home.component.ts`

Cambia las URLs de placeholder por:
```typescript
carouselImages = [
  {
    src: 'assets/images/carousel/slide1.jpg',
    alt: 'Envíos rápidos y seguros',
    // ...
  },
  // ...
];
```