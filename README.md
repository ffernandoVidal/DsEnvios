# DsEnvios - Sistema de Envíos

Sistema web completo para gestión de envíos desarrollado con Django (backend) y Angular (frontend).

## Características

- **Frontend Angular**: Interfaz moderna y responsiva
- **Backend Django**: API REST robusta
- **Cotización de Envíos**: Sistema completo para Guatemala con todos los municipios
- **Navegación Intuitiva**: Navbar con acceso a todas las funcionalidades
- **Diseño Responsive**: Compatible con dispositivos móviles y desktop

## Estructura del Proyecto

```
.
├── backend/          # Proyecto Django (API REST)
│   ├── backend/      # Configuración principal
│   ├── api/          # Aplicación API
│   └── manage.py
├── frontend/         # Proyecto Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── home/
│   │   │   │   ├── cotizar/
│   │   │   │   ├── realizar-envio/
│   │   │   │   ├── rastreo/
│   │   │   │   └── contacto/
│   │   │   ├── app.module.ts
│   │   │   └── app-routing.module.ts
│   │   └── assets/
├── README.md
└── .github/
    └── copilot-instructions.md
```

## Instalación y Configuración

### Backend (Django)

1. Navegar al directorio backend:
   ```bash
   cd backend
   ```

2. Crear un entorno virtual:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # En Windows
   source venv/bin/activate  # En Linux/Mac
   ```

3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Ejecutar migraciones:
   ```bash
   python manage.py migrate
   ```

5. Ejecutar el servidor:
   ```bash
   python manage.py runserver
   ```

### Frontend (Angular)

1. Navegar al directorio frontend:
   ```bash
   cd frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar el servidor de desarrollo:
   ```bash
   ng serve
   ```

## URLs de Acceso

- **Backend Django**: http://localhost:8000
- **Frontend Angular**: http://localhost:4200
- **API Endpoint**: http://localhost:8000/api/hello/

## Funcionalidades

### Páginas Disponibles

1. **Inicio (Home)**: Página principal con información de la empresa
2. **Cotizar**: Sistema de cotización con:
   - Selección de departamentos y municipios de Guatemala
   - Tipos de paquetes (Documento, Paquete Pequeño, Paquete Mediano, Paquete Grande)
   - Cálculo automático de cotizaciones
3. **Realizar Envío**: Formulario para crear nuevos envíos
4. **Rastreo**: Sistema de seguimiento de paquetes
5. **Contacto**: Información de contacto y ubicación

### Características Técnicas

- **Django REST Framework**: API REST completa
- **CORS habilitado**: Comunicación entre frontend y backend
- **Angular Router**: Navegación SPA
- **Bootstrap**: Diseño responsive
- **TypeScript**: Tipado estático para mayor robustez

## Desarrollo

### Tareas VS Code

El proyecto incluye tareas configuradas en `.vscode/tasks.json`:

- **Django Backend**: Ejecuta el servidor Django
- **Angular Frontend**: Ejecuta el servidor Angular
- **Full Project**: Ejecuta ambos servidores simultáneamente

### Base de Datos

El proyecto incluye datos completos de Guatemala:
- 22 departamentos
- 340+ municipios
- Sistema de cotización por zona geográfica

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## Autor

Fernando Vidal - [@ffernandoVidal](https://github.com/ffernandoVidal)
