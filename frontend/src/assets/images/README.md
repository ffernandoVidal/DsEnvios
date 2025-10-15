# 📁 Estructura de Imágenes del Proyecto

## 🗂️ Ruta Principal:
```
C:\Users\Ferna\Desktop\ENVIOS\frontend\src\assets\images\
```

## 📋 Estructura Completa:

```
frontend/src/assets/images/
│
├── logo.svg                    # ✅ Logo principal (ya creado)
├── logo.png                    # Logo alternativo (opcional)
│
├── carousel/                   # 🎠 Imágenes del carrusel
│   ├── slide1.jpg              # 1200x600px - Envíos/logística
│   ├── slide2.jpg              # 1200x600px - Tecnología/rastreo
│   └── slide3.jpg              # 1200x600px - Cobertura/mapas
│
├── team/                       # 👥 Fotos del equipo
│   ├── maria.jpg               # 300x300px - Gerente de Operaciones
│   ├── carlos.jpg              # 300x300px - Director de Tecnología
│   ├── ana.jpg                 # 300x300px - Servicio al Cliente
│   └── luis.jpg                # 300x300px - Jefe de Distribución
│
└── brands/                     # 🏢 Logos de marcas/socios
    ├── dhl.png                 # 200x100px - Logo DHL
    ├── fedex.png               # 200x100px - Logo FedEx
    ├── ups.png                 # 200x100px - Logo UPS
    ├── correos.png             # 200x100px - Logo Correos
    ├── seur.png                # 200x100px - Logo SEUR
    └── mrw.png                 # 200x100px - Logo MRW
```

## 🚀 Cómo agregar tus imágenes:

### 1. **Navega a la carpeta:**
```
C:\Users\Ferna\Desktop\ENVIOS\frontend\src\assets\images\
```

### 2. **Agrega imágenes en las subcarpetas correspondientes:**
- **carousel/** - Para el carrusel principal
- **team/** - Para fotos del equipo  
- **brands/** - Para logos de empresas

### 3. **Actualiza el código:**
Una vez agregadas las imágenes reales, edita:
```
src/app/components/home/home.component.ts
```

Cambia las URLs de `https://via.placeholder.com/...` por las rutas locales:
```typescript
// Ejemplo:
carouselImages = [
  {
    src: 'assets/images/carousel/slide1.jpg',  // ← Cambiar aquí
    alt: 'Envíos rápidos y seguros',
    // ...
  }
];
```

## 📏 Especificaciones Técnicas:

| Tipo | Tamaño | Formato | Peso Max |
|------|--------|---------|----------|
| Carrusel | 1200x600px | JPG/PNG | 500KB |
| Equipo | 300x300px | JPG/PNG | 100KB |
| Marcas | 200x100px | PNG | 50KB |
| Logo | 40x40px | SVG/PNG | 20KB |

## ✅ Estado Actual:
- ✅ Estructura de carpetas creada
- ✅ Logo SVG creado
- ⏳ Esperando imágenes reales
- ⏳ Código configurado con placeholders

**Nota:** Actualmente el proyecto usa imágenes placeholder de internet. 
Una vez que agregues las imágenes reales, el proyecto las cargará automáticamente.