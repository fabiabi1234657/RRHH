#  RRHH - Sistema de Gestión de Recursos Humanos

##  Descripción del Proyecto

Este proyecto es una **aplicación web moderna** para gestionar Recursos Humanos en una empresa. Con esta app puedes:

-  Registrar y administrar empleados
-  Controlar la asistencia diaria
-  Generar reportes de personal
-  Gestionar departamentos y cargos

La aplicación es una **SPA (Single Page Application)** con:
- **Frontend**: React + Vite (interfaz visual bonita y rápida)
- **Backend**: Node.js + Express (lógica del negocio)
- **Base de datos**: MongoDB (almacenamiento de datos)

### Tipos de usuarios:
- **Administrador**: Acceso total (crear empleados, reportes, gestionar sistema)
- **Empleado**: Acceso limitado (ver su información y asistencia)

---

##  Arquitectura del Proyecto

> **Nota importante:** El backend oficial y unico del proyecto es la carpeta `backend/`.

```
RRHH/
├── frontend/               ← Interfaz visual (React + Vite)
├── backend/                ← API REST (Node.js + Express)
│   ├── src/
│   │   ├── models/        ← Modelos de datos (RRHH)
│   │   ├── controllers/   ← Lógica de negocios
│   │   ├── routes/        ← Endpoints de la API
│   │   ├── middlewares/   ← Autenticación y autorización
│   │   └── config/        ← MongoDB y Swagger
│   ├── scripts/           ← seedDatabase.js, seedAdmin.js
│   └── server.js          ← Archivo principal del servidor
├── docker-compose.yml      ← Stack completo en contenedores
└── README.md
```

---

##  Tecnologías Utilizadas

### Frontend
- React 19 + Vite 8
- React Router v7
- Zustand (estado global)
- Axios (cliente HTTP)
- jsPDF (exportación de reportes en PDF/CSV)

### Backend
- **Node.js**: Entorno JavaScript en servidor
- **Express**: Framework para crear APIs REST
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación segura
- **bcryptjs**: Encriptación de contraseñas

### Seguridad
- Autenticación con JWT
- Contraseñas encriptadas
- Cookies HTTP-only
- CORS configurado

---

##  Cómo Ejecutar el Proyecto

### Con Docker (recomendado)

```bash
cp backend/.env.example backend/.env   # completar con valores reales
docker-compose up -d
```

Stack disponible en `http://localhost` (frontend) y `http://localhost:5000` (API).

Crear el usuario administrador inicial:

```bash
docker-compose exec backend npm run seed:admin
```

### Localmente (desarrollo)

#### Backend

```bash
cd backend
cp .env.example .env    # completar con valores reales
npm install
npm run seed:admin      # crea el usuario admin inicial
npm run dev
```

El backend se ejecutará en: `http://localhost:5000`

Pruebas:

```bash
npm test
```

Lee [backend/README.md](backend/README.md) para más detalles.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecutará en: `http://localhost:5173`

---

##  Documentación

- [Backend README](backend/README.md) - Instalación y uso del servidor
- [Frontend README](frontend/README.md) - Interfaz visual
- Swagger API Docs (backend en ejecución): `http://localhost:5000/api-docs`

---

##  Equipo de Desarrollo

Este proyecto fue desarrollado como parte del curso **Electiva Complementaria III** del Sexto Semestre
