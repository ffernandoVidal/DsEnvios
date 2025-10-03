# Fotos del Equipo

Coloca aquí las fotos de los colaboradores/equipo.

## Archivos necesarios:
- `maria.jpg` - Foto de María González (Gerente de Operaciones)
- `carlos.jpg` - Foto de Carlos Rodríguez (Director de Tecnología)
- `ana.jpg` - Foto de Ana Martínez (Coordinadora de Servicio al Cliente)
- `luis.jpg` - Foto de Luis Fernández (Jefe de Distribución)

## Especificaciones técnicas:
- **Resolución:** 300x300 píxeles (cuadradas)
- **Formato:** JPG o PNG
- **Peso máximo:** 100KB por imagen
- **Estilo:** Fotos profesionales, fondo uniforme preferible

## Actualización en código:
Cuando agregues las fotos reales, actualiza el archivo:
`src/app/components/home/home.component.ts`

Cambia las URLs de placeholder por:
```typescript
collaborators = [
  {
    name: 'María González',
    position: 'Gerente de Operaciones',
    image: 'assets/images/team/maria.jpg',
    // ...
  },
  // ...
];
```