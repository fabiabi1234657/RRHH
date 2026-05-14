# Backend - API de RRHH

> Este es el backend unico y oficial del proyecto RRHH.
> Ejecuta siempre el servidor desde esta carpeta para evitar inconsistencias.

## ¿Qué se hizo en esta fase?

Este backend es la **base del proyecto RRHH**. Aquí hemos implementado:

-  **Autenticación segura**: Los usuarios pueden registrarse y hacer login
-  **Contraseñas encriptadas**: Usamos bcryptjs, que es casi imposible de hackear
-  **Tokens JWT en cookies**: Las sesiones son seguras y duran 7 días
-  **Rutas protegidas**: Solo usuarios autenticados pueden acceder ciertas URL
-  **Base de datos MongoDB**: Almacenamos usuarios de forma persistente
-  **CORS configurado**: El frontend puede comunicarse con el backend

## Actualizacion reciente: Documentacion Swagger

Se agrego documentacion interactiva de la API con Swagger para facilitar pruebas y entendimiento de endpoints.

### Que se cambio (resumen rapido)

- Se instalaron las dependencias `swagger-ui-express` y `swagger-jsdoc`.
- Se creo la configuracion en `src/config/swagger.js` con:
  - `tags` por modulo (`Auth`, `Empleados`, `Departamentos`, `Cargos`, `Asistencia`, `Reportes`).
  - `schemas` reutilizables para modelos y requests/responses.
  - seguridad por cookie JWT (`cookieAuth`, cookie `token`).
- Se expuso la UI en `GET /api-docs` desde `server.js`.
- Se documentaron todos los endpoints existentes en `src/routes/*.js` con bloques `@swagger`:
  - request body
  - parametros path/query
  - respuestas `200`, `201`, `400`, `401`, `403`, `404`, `500`

### Como usar Swagger

1. Inicia el backend:

```bash
cd backend
npm run dev
```

2. Abre en el navegador:

```text
http://localhost:5000/api-docs
```

### Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         ← Conexión a MongoDB
│   │   └── swagger.js          ← Configuración Swagger
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Position.js
│   │   ├── Employee.js
│   │   └── Attendance.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── departmentController.js
│   │   ├── positionController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── positionRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── reportRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   └── __tests__/
│       ├── auth.test.js
│       ├── attendance.test.js
│       ├── reports.test.js
│       └── rrhhModels.test.js
├── scripts/
│   ├── seedDatabase.js         ← Datos de ejemplo
│   └── seedAdmin.js            ← Crea usuario administrador inicial
├── server.js
├── package.json
├── Dockerfile
├── .env.example
└── .gitignore
```

##  Cómo ejecutar el backend

### Paso 1: Instalar MongoDB
Descarga MongoDB Community desde: https://www.mongodb.com/try/download/community

### Paso 2: Clonar o descargar el proyecto
Ya está en tu carpeta

### Paso 3: Configurar variables de entorno

1. Clona el archivo `.env.example` y renómbralo a `.env`
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` si es necesario:
   ```
   MONGO_URI=mongodb://localhost:27017/rrhh_db
   MONGO_URI_TEST=mongodb://localhost:27017/rrhh_test
   JWT_SECRET=<cadena aleatoria de 64 bytes — ver .env.example>
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ADMIN_EMAIL=admin@empresa.com
   ADMIN_PASS=ClaveAdmin123
   ```

### Paso 4: Instalar dependencias

```bash
cd backend
npm install
```

### Paso 5: Iniciar el servidor

**Modo producción:**
```bash
npm start
```

**Modo desarrollo (con nodemon - se reinicia automáticamente):**
```bash
npm run dev
```

Deberías ver algo como:
```
 Servidor iniciado en puerto 5000
 URL: http://localhost:5000
```

## Pruebas Automatizadas

Este backend incluye pruebas de integración con Jest + Supertest sobre MongoDB local.

### Requisitos para correr tests

1. Tener MongoDB corriendo en local.
2. Tener archivo `.env` configurado con al menos:

```env
MONGO_URI=mongodb://localhost:27017/rrhh_db
MONGO_URI_TEST=mongodb://localhost:27017/rrhh_test
JWT_SECRET=<cadena aleatoria de 64 bytes — ver .env.example>
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Ejecutar la suite completa

```bash
cd backend
npm test
```

### Cobertura actual de pruebas

- `auth.test.js`: registro, login, perfil, credenciales inválidas.
- `attendance.test.js`: checkin/checkout, restricciones por rol, consultas admin por empleado y fecha.
- `reports.test.js`: seguridad admin y coherencia de reportes con el dominio RRHH.
- `rrhhModels.test.js`: relaciones de modelos RRHH, `status` por defecto e índices únicos.

##  Endpoints de la API

Todas las peticiones van a `http://localhost:5000/api/auth`

### 1. **Registrar un nuevo usuario**
```
POST /api/auth/register

Body (JSON):
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "Password123"
}

Respuesta exitosa (201):
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "user": {
    "id": "...",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "role": "employee"
  }
}
```

### 2. **Iniciar sesión**
```
POST /api/auth/login

Body (JSON):
{
  "email": "juan@email.com",
  "password": "Password123"
}

Respuesta exitosa (200):
{
  "success": true,
  "message": "Sesión iniciada correctamente",
  "user": {
    "id": "...",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "role": "employee"
  }
}
```

### 3. **Obtener perfil (PROTEGIDA - requiere estar logeado)**
```
GET /api/auth/profile

Respuesta exitosa (200):
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "role": "employee",
    "createdAt": "2024-03-17T..."
  }
}
```

### 4. **Cerrar sesión**
```
POST /api/auth/logout

Respuesta exitosa (200):
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

## Modelos de datos

### Department

- `name` (String, requerido): nombre del departamento (ej: "Recursos Humanos", "IT").
- `description` (String, opcional): descripción del departamento.
- `createdAt` (Date): fecha de creación automática.

### Position

- `title` (String, requerido): nombre del cargo (ej: "Desarrollador Backend").
- `department` (ObjectId, requerido): referencia al departamento (`Department`).
- `createdAt` (Date): fecha de creación automática.

### Employee

- `userId` (ObjectId, requerido, único): referencia al usuario (User).
- `position` (ObjectId, requerido): referencia al cargo (`Position`).
- `department` (ObjectId, requerido): referencia al departamento (`Department`).
- `hireDate` (Date): fecha de contratación.
- `status` (String, enum): estado del empleado: `'active'`, `'inactive'` (default: `'active'`).
- `createdAt` (Date): fecha de creación automática.

### Attendance

- `employeeId` (ObjectId, requerido): referencia al empleado (Employee).
- `date` (Date, requerido): fecha de registro de asistencia (día base).
- `checkIn` (Date, opcional): hora de entrada.
- `checkOut` (Date, opcional): hora de salida.
- `status` (String, enum): estado de asistencia: `'present'`, `'absent'`, `'late'`.
- `createdAt` (Date): fecha de creación automática.
- **Índice único**: `(employeeId, date)` para evitar duplicados.

### Relación entre modelos

- `User (1) -> (1) Employee`: Un usuario tiene un perfil de empleado.
- `Department (1) -> (N) Position`: Un departamento puede tener muchos cargos.
- `Position (1) -> (N) Employee`: Un cargo puede tener muchos empleados asociados.
- `Department (1) -> (N) Employee`: Un departamento puede tener muchos empleados.
- `Employee (1) -> (N) Attendance`: Un empleado puede tener muchos registros de asistencia.

## Middleware de roles

- `protect`: valida sesión y agrega `req.user` con `id` y `role`.
- `authorize(...roles)`: permite acceso solo si el rol de `req.user.role` está dentro de los roles permitidos.
- Aplicado a escritura de recursos RRHH:
  - `POST /api/departamentos`, `PUT /api/departamentos/:id`, `DELETE /api/departamentos/:id`
  - `POST /api/cargos`, `PUT /api/cargos/:id`, `DELETE /api/cargos/:id`
  - `POST /api/empleados`, `PUT /api/empleados/:id`, `DELETE /api/empleados/:id`
- Los endpoints `GET` son accesibles para cualquier usuario autenticado.

## Endpoints RRHH

### Departamentos (`/api/departamentos`)
**Requiere autenticación (token en cookie)**

- `GET /api/departamentos`: listar departamentos.
- `GET /api/departamentos/:id`: obtener departamento por ID.
- `POST /api/departamentos`: crear departamento (solo **admin**).
- `PUT /api/departamentos/:id`: actualizar departamento (solo **admin**).
- `DELETE /api/departamentos/:id`: eliminar departamento (solo **admin**).

### Cargos (`/api/cargos`)
**Requiere autenticación (token en cookie)**

- `GET /api/cargos`: listar cargos.
- `GET /api/cargos/:id`: obtener cargo por ID.
- `POST /api/cargos`: crear cargo (solo **admin**).
- `PUT /api/cargos/:id`: actualizar cargo (solo **admin**).
- `DELETE /api/cargos/:id`: eliminar cargo (solo **admin**).

### Empleados (`/api/empleados`)
**Requiere autenticación (token en cookie)**

- `GET /api/empleados`: listar empleados.
- `GET /api/empleados/:id`: obtener empleado por ID.
- `POST /api/empleados`: crear empleado (solo **admin**).
- `PUT /api/empleados/:id`: actualizar empleado (solo **admin**).
- `DELETE /api/empleados/:id`: eliminar empleado (solo **admin**).

### Reports (`/api/reports`)
**Requiere autenticación + rol admin**

- `GET /api/reports/attendance/monthly?month=3&year=2024`: Obtener reporte de asistencia mensual de todos los empleados con totales por estado.
- `GET /api/reports/headcount`: Obtener cantidad total de empleados activos agrupados por departamento.
- `GET /api/reports/employee/:employeeId/summary`: Obtener resumen individual del empleado (posición, departamento, días trabajados en el mes actual).

### Attendance (`/api/attendance`)

- `POST /api/attendance/checkin`: registrar entrada del empleado autenticado.
- `PUT /api/attendance/checkout`: registrar salida del empleado autenticado.
- `GET /api/attendance/:employeeId`: historial de asistencia por empleado (solo **admin**).
- `GET /api/attendance/date/:date`: asistencia de todos los empleados por fecha `YYYY-MM-DD` (solo **admin**).

## Ejemplos de peticiones y respuestas

### 1) Crear departamento

Request:

```http
POST /api/departamentos
Content-Type: application/json
Cookie: token=<jwt_token>

{
  "name": "Tecnologia",
  "description": "Desarrollo de software"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Departamento creado correctamente",
  "department": {
    "_id": "67d7503d0f9a0d0f40e8f111",
    "name": "Tecnologia",
    "description": "Desarrollo de software",
    "createdAt": "2026-03-17T18:00:00.000Z"
  }
}
```

### 2) Crear cargo

Request:

```http
POST /api/cargos
Content-Type: application/json
Cookie: token=<jwt_token>

{
  "title": "Desarrollador Backend",
  "department": "67d7503d0f9a0d0f40e8f111"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Cargo creado correctamente",
  "position": {
    "_id": "67d7508d0f9a0d0f40e8f222",
    "title": "Desarrollador Backend",
    "department": {
      "_id": "67d7503d0f9a0d0f40e8f111",
      "name": "Tecnologia"
    },
    "createdAt": "2026-03-17T18:02:00.000Z"
  }
}
```

### 3) Reporte de asistencia mensual

Request:

```http
GET /api/reports/attendance/monthly?month=3&year=2024
Cookie: token=<jwt_token>
```

Response `200`:

```json
{
  "success": true,
  "message": "Reporte de asistencia para 3/2024",
  "month": 3,
  "year": 2024,
  "totalEmployees": 5,
  "data": [
    {
      "employeeId": "67d7508d0f9a0d0f40e8f333",
      "name": "Juan Pérez",
      "email": "juan@company.com",
      "position": "Developer",
      "department": "IT",
      "present": 18,
      "absent": 1,
      "late": 2,
      "totalDays": 21
    }
  ]
}
```

### 5) Reporte de cantidad de empleados

Request:

```http
GET /api/reports/headcount
Cookie: token=<jwt_token>
```

Response `200`:

```json
{
  "success": true,
  "message": "Reporte de cantidad de empleados por departamento",
  "totalEmployees": 12,
  "departments": [
    {
      "departmentId": "67d7503d0f9a0d0f40e8f444",
      "departmentName": "IT",
      "headcount": 5
    },
    {
      "departmentId": "67d7503d0f9a0d0f40e8f555",
      "departmentName": "HR",
      "headcount": 7
    }
  ]
}
```

### 6) Resumen de empleado

Request:

```http
GET /api/reports/employee/67d7508d0f9a0d0f40e8f333/summary
Cookie: token=<jwt_token>
```

Response `200`:

```json
{
  "success": true,
  "message": "Resumen del empleado",
  "employee": {
    "employeeId": "67d7508d0f9a0d0f40e8f333",
    "name": "Juan Pérez",
    "email": "juan@company.com",
    "position": "Developer",
    "department": "IT",
    "salary": 3500,
    "hireDate": "2023-01-15T00:00:00.000Z",
    "isActive": true,
    "currentMonthAttendance": {
      "present": 18,
      "absent": 1,
      "late": 2,
      "leave": 0,
      "total": 21
    }
  }
}
```
    }
  ]
}
```

##  Testing

Este proyecto incluye pruebas de integración que validan todas las rutas del backend.

### Configurar la BD de prueba

Antes de ejecutar los tests, configura una base de datos separada en tu archivo `.env`:

```
MONGO_URI=mongodb://localhost:27017/rrhh_db
MONGO_URI_TEST=mongodb://localhost:27017/rrhh_test
JWT_SECRET=tu_clave_secreta_super_segura
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Ejecutar tests

```bash
npm test
```

Esto ejecutará todos los tests en `src/__tests__/` con salida detallada.

### Cobertura de tests

Los tests cubren:

**auth.test.js:**
- ✅ POST `/api/auth/register` — registro exitoso devuelve 201
- ✅ POST `/api/auth/register` — email duplicado devuelve 400
- ✅ POST `/api/auth/login` — credenciales correctas devuelven 200 con cookie
- ✅ POST `/api/auth/login` — credenciales incorrectas devuelven 401
- ✅ PUT `/api/auth/profile` — actualiza nombre o contraseña con sesión activa

### Nota sobre limpieza

Los tests limpian automáticamente la base de datos de prueba después de cada suite, asegurando que no haya datos contaminados entre ejecuciones.

| Tecnología | ¿Para qué sirve? |
|-----------|-----------------|
| **Node.js** | Entorno de ejecución de JavaScript en el servidor |
| **Express** | Framework para crear la API REST fácilmente |
| **MongoDB** | Base de datos NoSQL para guardar los usuarios |
| **Mongoose** | Librería para conectar MongoDB con Node.js |
| **JWT (jsonwebtoken)** | Para crear tokens de seguridad en las sesiones |
| **bcryptjs** | Para encriptar contraseñas (no son legibles) |
| **cookie-parser** | Para trabajar con cookies HTTP-only |
| **CORS** | Para que el frontend pueda hablar con el backend |
| **dotenv** | Para guardar información sensible en archivos `.env` |
| **nodemon** | Herramienta de desarrollo que reinicia el server automáticamente |

##  Seguridad

- **Contraseñas encriptadas**: Imposible ver la contraseña original
- **JWT en cookies HTTP-only**: El token no se puede robar desde JavaScript
- **CORS configurado**: Solo el frontend autorizado puede hacer peticiones
- **Variables de entorno**: Datos sensibles no están en el código

##  Despliegue con Docker

El backend incluye un `Dockerfile` y forma parte del `docker-compose.yml` en la raíz del proyecto.

```bash
# Desde la raíz del proyecto
cp backend/.env.example backend/.env
docker-compose up -d
```

Crear administrador inicial en el contenedor:

```bash
docker-compose exec backend npm run seed:admin
```

---

