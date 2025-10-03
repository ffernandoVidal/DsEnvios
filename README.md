# Proyecto Django + Angular - Hola Mundo

Este proyecto consiste en una aplicación web con Django como backend y Angular como frontend.

## Estructura del Proyecto

```
.
├── backend/          # Proyecto Django
├── frontend/         # Proyecto Angular
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
   venv\Scripts\activate
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

## URLs

- Backend Django: http://localhost:8000
- Frontend Angular: http://localhost:4200

## Descripción

El proyecto muestra una página principal simple con el mensaje "Hola Mundo" utilizando Angular para el frontend y Django proporcionando una API REST.