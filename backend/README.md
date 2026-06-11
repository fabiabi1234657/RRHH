# Backend — API REST de RRHH

![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20MFA-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Docs-Swagger%20UI-85EA2D?style=flat-square&logo=swagger&logoColor=black)

API REST construida con Node.js 24 + Express 4 + MongoDB 7 (Mongoose 8). Expone todos los endpoints del sistema de Gestión de Recursos Humanos y se ejecuta dentro de Docker como parte del stack completo.

---

## Tecnologías

| Paquete | Versión | Rol |
|---------|---------|-----|
| Node.js | 24 (alpine) | Entorno de ejecución |
| Express | 4 | Framework HTTP |
| Mongoose | 8 | ODM para MongoDB |
| jsonwebtoken | 9 | Autenticación JWT en cookie HTTP-only (7 días) |
| bcryptjs | 2 | Hash de contraseñas |
| speakeasy | 2 | MFA — TOTP (Google Authenticator compatible) |
| qrcode | 1 | Generación de QR para configuración MFA |
| multer | 2 | Subida de archivos (documentos de empleados) |
| swagger-ui-express + swagger-jsdoc | 5 / 6 | Documentación interactiva en `/api-docs` |
| morgan | 1 | Logging HTTP |

---

## Estructura del proyecto

```
backend/
├── server.js                   ← Punto de entrada, conecta MongoDB y levanta el puerto
├── package.json
├── Dockerfile
├── .env.example
├── scripts/
│   ├── seedDatabase.js         ← Datos completos: 71 empleados + 38.250 registros asistencia
│   └── seedAdmin.js            ← Solo crea el usuario administrador inicial
└── src/
    ├── config/
    │   ├── cors.js             ← Orígenes permitidos para frontend
    │   ├── cookies.js          ← Opciones de cookie JWT
    │   ├── database.js         ← Conexión a MongoDB
    │   ├── env.js              ← Carga de variables de entorno
    │   └── swagger.js          ← Configuración Swagger (tags, schemas, seguridad)
    ├── models/
    │   ├── User.js             ← Credenciales de acceso + MFA
    │   ├── Employee.js         ← Perfil laboral + fechas de vencimiento
    │   ├── Department.js
    │   ├── Position.js
    │   └── Attendance.js
    ├── controllers/
    │   ├── authController.js
    │   ├── employeeController.js
    │   ├── departmentController.js
    │   ├── positionController.js
    │   ├── attendanceController.js
    │   ├── reportController.js
    │   └── documentController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── employeeRoutes.js
    │   ├── departmentRoutes.js
    │   ├── positionRoutes.js
    │   ├── attendanceRoutes.js
    │   ├── reportRoutes.js
    │   └── documentRoutes.js
    ├── middlewares/
    │   ├── authMiddleware.js   ← Valida JWT en cookie, popula req.user
    │   └── roleMiddleware.js   ← authorize(...roles) — restringe por rol
    └── __tests__/
        ├── auth.test.js
        ├── attendance.test.js
        ├── reports.test.js
        └── rrhhModels.test.js
```

---

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
MONGO_URI=mongodb://mongo:27017/rrhh_db      # URI interna de Docker
MONGO_URI_TEST=mongodb://localhost:27017/rrhh_test
JWT_SECRET=<cadena aleatoria de 64+ bytes>
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://rrhh-frontend.onrender.com
```

> En desarrollo local cambia `MONGO_URI` a `mongodb://localhost:27017/rrhh_db`. CORS permite por defecto `http://localhost:5173` y `http://localhost:3000`; usa `FRONTEND_URL` solo para el dominio final desplegado en Render.

---

## Ejecución con Docker (método principal)

El backend forma parte del stack definido en `docker-compose.yml` en la raíz del proyecto.

```bash
# Desde la raíz del proyecto — levanta mongo + backend + frontend
docker compose up -d

# Cargar datos de ejemplo (71 empleados, 38.250 registros de asistencia 2023-2026)
docker compose exec backend npm run seed

# Solo crear el admin (sin borrar datos existentes)
docker compose exec backend npm run seed:admin

# Ver logs en tiempo real
docker compose logs -f backend

# Reconstruir la imagen tras cambios de código
docker compose build --no-cache backend
docker compose up -d backend
```

El backend queda disponible en `http://localhost:5000`.
Swagger UI: `http://localhost:5000/api-docs`
Healthcheck: `http://localhost:5000/health`

---

## Ejecución local (desarrollo)

```bash
cd backend
npm install
cp .env.example .env     # ajustar MONGO_URI y FRONTEND_URL para local
npm run dev              # nodemon — recarga automática en http://localhost:5000
```

Scripts disponibles:

| Comando | Acción |
|---------|--------|
| `npm start` | Producción (node server.js) |
| `npm run dev` | Desarrollo con nodemon |
| `npm run seed` | Seed completo (borra y recrea todo) |
| `npm run seed:admin` | Solo crea el usuario admin |
| `npm run lint` | Revisión ESLint del backend |
| `npm test` | Suite de pruebas Jest |
| `npm run test:coverage` | Pruebas con reporte de cobertura y umbral global 90% |

---

## Modelos de datos

### User

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | String | Nombre completo |
| `email` | String (único) | Correo de acceso |
| `password` | String | Hash bcrypt |
| `role` | `admin` / `employee` | Rol (default: `employee`) |
| `mfaSecret` | String | Secreto TOTP (null si MFA no habilitado) |
| `mfaEnabled` | Boolean | Si el MFA está activo |

### Employee

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | ObjectId → User | Referencia única al usuario |
| `position` | ObjectId → Position | Cargo actual |
| `department` | ObjectId → Department | Departamento |
| `hireDate` | Date | Fecha de contratación |
| `status` | `active` / `inactive` | Estado laboral (default: `active`) |
| `trialEndDate` | Date / null | Fin del periodo de prueba (alerta en dashboard) |
| `contractEndDate` | Date / null | Vencimiento de contrato (alerta en dashboard) |
| `dataPolicySignedAt` | Date / null | Firma de política Habeas Data (null = pendiente) |

### Department

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | String (único) | Nombre del departamento |
| `description` | String | Descripción opcional |

### Position

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | String | Nombre del cargo |
| `department` | ObjectId → Department | Departamento al que pertenece |

### Attendance

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `employeeId` | ObjectId → Employee | Empleado |
| `date` | Date | Fecha del registro (índice único con `employeeId`) |
| `checkIn` | Date | Hora de entrada |
| `checkOut` | Date | Hora de salida |
| `status` | `present` / `absent` / `late` / `justified` | Estado del día |

---

## Endpoints de la API

### Autenticación — `/api/auth`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/register` | Público | Registra nuevo usuario |
| POST | `/login` | Público | Inicia sesión, emite cookie JWT |
| POST | `/logout` | Privado | Cierra sesión, borra cookie |
| GET | `/profile` | Privado | Perfil del usuario actual |
| PUT | `/profile` | Privado | Actualiza nombre o contraseña |
| POST | `/mfa/setup` | Privado | Genera QR y secreto TOTP |
| POST | `/mfa/verify` | Privado | Verifica código TOTP y activa MFA |
| POST | `/mfa/disable` | Privado | Desactiva MFA |

### Salud — `/health`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/health` | Público | Devuelve estado operativo del backend para Docker, Render o CI |

### Empleados — `/api/empleados`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Admin | Listar todos (populate usuario, cargo, depto) |
| GET | `/:id` | Admin | Obtener por ID |
| POST | `/` | Admin | Crear empleado |
| PUT | `/:id` | Admin | Actualizar empleado |
| DELETE | `/:id` | Admin | Eliminar empleado |

### Departamentos — `/api/departamentos`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Privado | Listar departamentos |
| GET | `/:id` | Privado | Obtener por ID |
| POST | `/` | Admin | Crear departamento |
| PUT | `/:id` | Admin | Actualizar departamento |
| DELETE | `/:id` | Admin | Eliminar departamento |

### Cargos — `/api/cargos`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Privado | Listar cargos |
| GET | `/:id` | Privado | Obtener por ID |
| POST | `/` | Admin | Crear cargo |
| PUT | `/:id` | Admin | Actualizar cargo |
| DELETE | `/:id` | Admin | Eliminar cargo |

### Asistencia — `/api/attendance`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/checkin` | Privado | Registrar entrada del usuario actual |
| PUT | `/checkout` | Privado | Registrar salida del usuario actual |
| GET | `/me` | Privado | Historial propio del empleado actual |
| GET | `/:employeeId` | Admin | Historial por empleado |
| GET | `/date/:date` | Admin | Asistencia de todos los empleados por fecha `YYYY-MM-DD` |

### Reportes — `/api/reports`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/attendance/monthly` | Admin | Reporte mensual `?month=3&year=2024` |
| GET | `/headcount` | Admin | Empleados activos agrupados por departamento |
| GET | `/employee/:id/summary` | Admin | Resumen individual del empleado |

### Documentos — `/api`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/empleados/:id/documents` | Admin | Listar documentos de un empleado |
| POST | `/empleados/:id/documents` | Admin | Subir documento (multipart/form-data) |
| DELETE | `/documents/:id` | Admin | Eliminar documento |

Los archivos se almacenan en el volumen Docker `backend_uploads` (ruta interna `/app/uploads`).

---

## Datos de ejemplo (seed)

El script `scripts/seedDatabase.js` genera:

- **10 departamentos**: Tecnología, Recursos Humanos, Finanzas, Operaciones, Comercial, Marketing, Legal, Logística, Atención al Cliente, Gerencia
- **32 cargos** distribuidos entre los departamentos
- **71 empleados** activos (incluye 2 inactivos para pruebas) + 1 administrador
- **38.250 registros de asistencia** de enero 2023 a abril 2026
  - Distribución realista: 65% presente, 15% tardanza, 12% ausente, 8% justificado
  - Inserción en lotes de 3.000 registros con `insertMany`
- `trialEndDate`, `contractEndDate` y `dataPolicySignedAt` con valores variados para que las alertas del dashboard tengan datos reales

---

## Pruebas automatizadas

Requiere MongoDB corriendo localmente y `.env` configurado con `MONGO_URI_TEST`.

```bash
cd backend
npm test
```

| Archivo | Qué cubre |
|---------|-----------|
| `auth.test.js` | Registro, login, perfil, credenciales inválidas, actualización |
| `attendance.test.js` | Check-in/out, restricciones por rol, consultas admin |
| `reports.test.js` | Seguridad admin, coherencia de datos de reportes |
| `rrhhModels.test.js` | Relaciones de modelos, valores por defecto, índices únicos |

---

## Seguridad

- Contraseñas hasheadas con bcrypt (factor 12)
- JWT almacenado exclusivamente en cookie `HTTP-only` — inaccesible desde JavaScript
- CORS restringido al origen del frontend configurado en `FRONTEND_URL`
- Variables sensibles gestionadas con `.env` (excluido del repositorio)
- Archivos subidos aislados en volumen Docker dedicado (`backend_uploads`)
