# Logos de Marcas/Socios

Coloca aquí los logos de las empresas colaboradoras o marcas.

## Archivos necesarios:
- `dhl.png` - Logo de DHL
- `fedex.png` - Logo de FedEx
- `ups.png` - Logo de UPS
- `correos.png` - Logo de Correos
- `seur.png` - Logo de SEUR
- `mrw.png` - Logo de MRW

## Especificaciones técnicas:
- **Resolución:** 200x100 píxeles (ratio 2:1)
- **Formato:** PNG (con fondo transparente preferible)
- **Peso máximo:** 50KB por logo
- **Estilo:** Logos oficiales de las empresas

## Actualización en código:
Cuando agregues los logos reales, actualiza el archivo:
`src/app/components/home/home.component.ts`

Cambia las URLs de placeholder por:
```typescript
brands = [
  { name: 'DHL', logo: 'assets/images/brands/dhl.png' },
  { name: 'FedEx', logo: 'assets/images/brands/fedex.png' },
  // ...
];
```