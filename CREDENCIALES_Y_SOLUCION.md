# 🔐 CREDENCIALES Y SOLUCIÓN DE PROBLEMAS

## ✅ CREDENCIALES CORRECTAS DE ACCESO

### Usuario Administrador
- **Correo:** `admin@envios.com`
- **Contraseña:** `admin123`

**IMPORTANTE:** Usa el CORREO, no un nombre de usuario.

---

## 🔧 PROBLEMAS RESUELTOS

### 1. ✅ Error de Login - SOLUCIONADO
**Problema:** No se podía iniciar sesión
**Causa:** El frontend enviaba `username` y `password` pero el backend esperaba `correo` y `contrasena`
**Solución:** Actualizado el servicio de autenticación para usar los campos correctos

### 2. ✅ Formulario de Cotización - SOLUCIONADO
**Problema:** El formulario de cotización no funcionaba
**Causa:** No existía el endpoint `/api/cotizar` en el backend
**Solución:** Agregado el endpoint de cotización al servidor MySQL

---

## 📡 ENDPOINTS DISPONIBLES

### Autenticación
```
POST /api/auth/login
Body: {
  "correo": "admin@envios.com",
  "contrasena": "admin123"
}
```

### Cotización de Envíos
```
POST /api/cotizar
Body: {
  "origen": "Guatemala",
  "destino": "Quetzaltenango",
  "paquetes": [
    {
      "tipo": "pequeño",
      "peso": 2,
      "largo": 20,
      "ancho": 15,
      "alto": 10,
      "valor_declarado": 100
    }
  ]
}
```

### Guías de Envío
```
GET /api/guias              - Listar guías (requiere token)
POST /api/guias             - Crear guía (requiere token)
GET /api/guias/:id          - Ver guía específica
PUT /api/guias/:id          - Actualizar guía
DELETE /api/guias/:id       - Eliminar guía
```

### Catálogos
```
GET /api/sucursales         - Listar sucursales (requiere token)
GET /api/bodegas            - Listar bodegas (requiere token)
```

---

## 🚀 CÓMO USAR EL SISTEMA

### 1. Asegúrate de que el backend esté ejecutándose
```powershell
# Verificar que el puerto 3005 esté en uso
netstat -ano | findstr :3005
```

### 2. Iniciar el frontend Angular
```powershell
cd "C:\Users\Ferna\Desktop\envios ds\DsEnvios\frontend"
ng serve
```

### 3. Acceder a la aplicación
1. Abre tu navegador en: http://localhost:4200 (o el puerto que Angular te indique)
2. En la página de login, ingresa:
   - **Correo:** admin@envios.com
   - **Contraseña:** admin123
3. Haz clic en "Iniciar Sesión"

### 4. Usar el formulario de cotización
1. Una vez logueado, busca la sección de "Cotizar"
2. Completa los campos:
   - Origen (departamento/municipio)
   - Destino (departamento/municipio)
   - Información de los paquetes (tamaño, peso, valor)
3. Haz clic en "Cotizar Envío"
4. Verás el resultado con:
   - Costo base
   - Costo por distancia
   - Costo por tamaño
   - Costo de seguro (si aplica)
   - Costo total
   - Tiempo estimado de entrega

---

## ⚠️ SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "No se puede conectar al servidor"
**Solución:**
1. Verifica que el backend esté ejecutándose:
   ```powershell
   netstat -ano | findstr :3005
   ```
2. Si no está ejecutándose, inícialo:
   ```powershell
   cd "C:\Users\Ferna\Desktop\envios ds\DsEnvios\backend"
   node server-mysql.js
   ```

### Error: "Credenciales inválidas"
**Solución:**
- Asegúrate de usar el **correo electrónico**, no un nombre de usuario
- Correo: `admin@envios.com`
- Contraseña: `admin123`
- Verifica que no haya espacios antes o después

### Error en el formulario de cotización
**Solución:**
1. Verifica que el backend esté ejecutándose
2. Abre la consola del navegador (F12) y verifica si hay errores
3. Asegúrate de completar todos los campos obligatorios:
   - Origen
   - Destino
   - Al menos un paquete

### Error: "Token inválido" o "No autorizado"
**Solución:**
1. Cierra sesión
2. Vuelve a iniciar sesión con las credenciales correctas
3. El token debería renovarse automáticamente

---

## 📊 ESTADO ACTUAL DEL SISTEMA

✅ Backend MySQL ejecutándose en puerto 3005
✅ Base de datos conectada (puerto 3310)
✅ Endpoint de login funcionando
✅ Endpoint de cotización funcionando
✅ Frontend Angular compilado sin errores
✅ Servicios actualizados con campos correctos
✅ Sistema completamente funcional

---

## 🔍 VERIFICAR QUE TODO FUNCIONE

### Prueba rápida del backend:
```powershell
cd "C:\Users\Ferna\Desktop\envios ds\DsEnvios\backend"
node test-api.js
```

Deberías ver:
```
✅ Servidor funcionando
✅ Autenticación JWT
✅ Endpoints protegidos
✅ Base de datos conectada
✅ Catálogos funcionando
```

---

**Última actualización:** 23 de octubre de 2025
**Estado:** ✅ TODOS LOS PROBLEMAS RESUELTOS