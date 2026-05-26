# RRHH — Sistema de Gestión de Recursos Humanos

![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

Sistema web completo para gestionar Recursos Humanos: empleados, asistencia, departamentos, cargos y reportes. SPA con backend REST y base de datos MongoDB, desplegado completamente con Docker.

---

## Tipos de usuario

| Rol | Acceso |
|-----|--------|
| **Administrador** | Dashboard, empleados, departamentos, cargos, asistencia global, reportes, registro de usuarios |
| **Empleado** | Mi perfil, mi asistencia propia |

---

## Arquitectura

```
RRHH/
├── frontend/               ← React 19 + Vite 8 (SPA, sirve en puerto 80 vía nginx)
├── backend/                ← Node.js 20 + Express (API REST, puerto 5000)
│   ├── src/
│   │   ├── config/        ← Conexión MongoDB + Swagger
│   │   ├── models/        ← User, Employee, Department, Position, Attendance
│   │   ├── controllers/   ← Lógica de negocio
│   │   ├── routes/        ← Endpoints REST
│   │   └── middlewares/   ← Auth JWT + control de roles
│   ├── scripts/
│   │   ├── seedDatabase.js ← 71 empleados + 38.250 registros de asistencia (2023–2026)
│   │   └── seedAdmin.js    ← Crea el usuario administrador inicial
│   └── server.js
├── docker-compose.yml      ← Stack completo en tres contenedores
└── README.md
```

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, Vite 8, React Router v7, Zustand 5, Axios 1.15, Recharts, jsPDF |
| Backend | Node.js 20, Express 4, Mongoose 8, JWT, bcryptjs, speakeasy (MFA TOTP), multer |
| Base de datos | MongoDB 7 |
| Infraestructura | Docker + Docker Compose, nginx (alpine) |
| Documentación API | Swagger UI (`/api-docs`) |

---

## Ejecución con Docker (método principal)

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

### Paso 1 — Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con los valores reales:

```env
MONGO_URI=mongodb://mongo:27017/rrhh_db
JWT_SECRET=<cadena aleatoria de 64+ caracteres>
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost
```

### Paso 2 — Levantar el stack

```bash
docker compose up -d
```

Esto construye las imágenes y arranca los tres contenedores:

| Contenedor | Puerto | Descripción |
|-----------|--------|-------------|
| `rrhh_mongo` | 27017 | MongoDB 7 |
| `rrhh_backend` | 5000 | API REST Node.js |
| `rrhh_frontend` | **80** | SPA React servida por nginx |

La aplicación queda disponible en: **`http://localhost`**

### Paso 3 — Cargar datos de ejemplo

Ejecuta el seed completo (solo la primera vez o para reiniciar la BD):

```bash
docker compose exec backend npm run seed
```

Esto inserta:
- **1 administrador** y **71 empleados** en 10 departamentos
- **38.250 registros de asistencia** de enero 2023 a abril 2026
- Empleados con fechas de vencimiento de contrato y periodo de prueba para probar las alertas del dashboard

Credenciales de acceso post-seed:

| Usuario | Email | Contraseña |
|---------|-------|-----------|
| Administrador | `admin@rrhh.com` | `Password123` |
| Cualquier empleado | (ver BD) | `Password123` |

### Paso 4 — Operaciones habituales

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs del backend en tiempo real
docker compose logs -f backend

# Detener el stack
docker compose down

# Reconstruir la imagen del frontend (tras cambios de código)
docker compose build --no-cache frontend
docker compose up -d frontend

# Reconstruir el backend
docker compose build --no-cache backend
docker compose up -d backend
```

---

## Ejecución en modo desarrollo (local)

Solo si necesitas iterar sin Docker:

### Backend

```bash
cd backend
cp .env.example .env       # ajusta MONGO_URI a mongodb://localhost:27017/rrhh_db
npm install
npm run seed:admin         # crea el usuario admin
npm run dev                # inicia con nodemon en http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                # inicia Vite en http://localhost:5173
```

> Vite proxea `/api` a `http://localhost:5000` automáticamente en desarrollo.

---

## Documentación de la API

Con el backend corriendo, visita:

```
http://localhost:5000/api-docs
```

Swagger UI lista todos los endpoints con sus parámetros, cuerpos y respuestas.

---

## Rendimiento y calidad (Lighthouse)

Auditoría realizada con **Google Lighthouse 13** en modo Desktop (`http://localhost`). Se midieron las 10 páginas de la aplicación en cuatro categorías.

### Scores antes → después de las optimizaciones

| Página | Performance | Accessibility | Best Practices | SEO |
|--------|:-----------:|:-------------:|:--------------:|:---:|
| Landing (`/`) | 65 → **98** | 88 → **100** | 96 → **96** | 82 → **92** |
| Login (`/login`) | 65 → **98** | 88 → **100** | 96 → **96** | 82 → **92** |
| Recuperar contraseña | 65 → **98** | 95 → **98** | 96 → **96** | 82 → **92** |
| Dashboard (`/app/dashboard`) | 65 → **98** | 85 → **92** | 96 → **96** | 82 → **92** |
| Gestión empleados | 65 → **98** | 85 → **92** | 96 → **96** | 82 → **92** |
| Departamentos / Posiciones | 65 → **98** | 88 → **92** | 96 → **96** | 82 → **92** |
| Asistencia | 65 → **98** | 82 → **92** | 96 → **96** | 82 → **92** |
| Reportes | 65 → **98** | 80 → **90** | 96 → **96** | 82 → **92** |
| Generar reportes | 65 → **95** | 88 → **92** | 96 → **96** | 82 → **92** |
| Registro (`/app/registro`) | 65 → **98** | 85 → **95** | 96 → **96** | 82 → **92** |

### Problemas corregidos

**Performance — render blocking y bundle size**
- Google Fonts convertido de `rel="stylesheet"` bloqueante a `rel="preload"` + `onload` swap en `index.html`
- `@import` de Google Fonts eliminado de `globals.css` (bloqueaba el renderizado)
- Code splitting implementado con `React.lazy` + `Suspense` en `AppRouter.jsx`: bundle inicial reducido de **763 KB → 318 KB**; cada página se descarga solo al navegar a ella

**SEO**
- `<meta name="description">` añadido globalmente en `index.html`
- `<meta name="robots" content="index, follow">` añadido en `index.html`
- `frontend/public/robots.txt` creado: solo protege `/app/` (rutas autenticadas); páginas públicas (`/`, `/login`, `/register`, `/recuperar-contrasena`) permitidas para indexación

**Accesibilidad**
- `landmark-one-main`: `<main>` añadido en `Login.jsx` y `Home.jsx`
- `button-name`: `aria-label` dinámico en botón mostrar/ocultar contraseña (`Register.jsx`)
- `label` / `select-name`: labels visualmente ocultos (`.sr-only`) para inputs de fecha en `Attendance.jsx` y select/año en `Reports.jsx`
- `heading-order`: jerarquía h1 → h2 corregida en tarjetas de `Attendance.jsx` y `Reports.jsx`
- `.sr-only` añadido como clase utilitaria en `globals.css`

---

## Más información

- [backend/README.md](backend/README.md) — Modelos, endpoints y pruebas
- [frontend/README.md](frontend/README.md) — Rutas, stores y componentes

---

## Créditos

Desarrollado como proyecto de la asignatura **Electiva Complementaria III** — Sexto Semestre.
