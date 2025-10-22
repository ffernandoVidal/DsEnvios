# Sistema de Cotización DsEnvios - Guía de Prueba

## Estado del Sistema ✅

### Backend
- ✅ Servidor ejecutándose en http://localhost:3005
- ✅ MongoDB conectado
- ✅ API de cotización funcionando
- ⚠️ Google Maps API deshabilitada (usar estimación local)
- ⚠️ Forza API deshabilitada (usar cálculo local)

### Frontend  
- ✅ Servidor ejecutándose en http://localhost:4200
- ✅ Componente cotizar configurado
- ✅ Servicio EnviosService importado

## Prueba Manual del Botón "Cotizar"

### 1. Abrir la aplicación
- Ir a http://localhost:4200
- Navegar a la sección "Cotizar"

### 2. Completar el formulario
1. **Origen**: Seleccionar "Guatemala, Guatemala"
2. **Destino**: Seleccionar "Antigua Guatemala, Sacatepéquez"  
3. **Paquetes**: Agregar al menos un paquete
   - Seleccionar tipo de paquete (ej: "Sobre")
   - Hacer clic en "Agregar paquete"

### 3. Hacer clic en "Cotizar Envío"
- El botón debe cambiar a "Calculando..."
- Debe aparecer una sección con los resultados

## Problemas Comunes

### Si el botón está deshabilitado:
- Verificar que origen esté seleccionado
- Verificar que destino esté seleccionado  
- Verificar que haya al menos un paquete agregado

### Si no aparecen resultados:
- Abrir DevTools (F12)
- Revisar la consola por errores
- Verificar la pestaña Network para ver las llamadas HTTP

### Si hay errores de conexión:
- Verificar que el backend esté ejecutándose en puerto 3005
- Verificar configuración CORS en server.js

## Configuración Opcional

### Para habilitar Google Maps API:
1. Crear archivo .env en la carpeta backend:
```
GOOGLE_MAPS_API_KEY=tu_clave_aqui
```

### Para datos de prueba rápida:
- Origen: "Guatemala, Guatemala"
- Destino: "Antigua Guatemala, Sacatepéquez"
- Paquete: Tipo "Sobre", peso 1kg