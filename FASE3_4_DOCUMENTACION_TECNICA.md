# Fase 3 y 4 - Documentacion tecnica RRHH

## Diagnostico tecnico breve

El proyecto cumple la base de Fase 3 y 4: SPA en React + Vite, React Router v7, API REST Express/MongoDB, autenticacion JWT por cookie HTTP-only, CORS con credenciales, Swagger y arquitectura MVC. Se corrigieron las brechas principales: estado global migrado a Zustand, rutas protegidas sin depender de Context API, endpoints faltantes de perfil y recuperacion, y stores para auth, tema, departamentos, posiciones y catalogos.

## Dominio implementado: RRHH

El proyecto opera sobre entidades RRHH reales. Los modelos genericos `Category` y `Product` fueron eliminados del codigo. La integracion frontend–backend cubre:

- `Department` → `/api/departamentos`
- `Position` → `/api/cargos`
- `Employee` → `/api/empleados`
- `Attendance` → `/api/attendance`
- `Reports` → `/api/reports`

## Arquitectura frontend

El frontend esta construido con React + Vite y React Router v7. La aplicacion usa rutas publicas y rutas internas protegidas con layouts anidados mediante `<Outlet />`.

Capas principales:

- `src/router/AppRouter.jsx`: mapa de rutas, guardias y layout protegido.
- `src/services/api.js`: cliente HTTP centralizado con **Axios**, base `/api` y `withCredentials: true`.
- `src/stores/useAuthStore.js`: sesion global con Zustand.
- `src/stores/useThemeStore.js`: tema oscuro/claro persistente.
- `src/stores/useDepartmentStore.js`: CRUD de departamentos sobre `/api/departamentos`.
- `src/stores/usePositionStore.js`: CRUD de posiciones sobre `/api/cargos`.
- `src/stores/useCatalogStore.js`: carga combinada de catalogos para dashboard.
- `src/components/ui`: componentes reutilizables.
- `src/components/layout`: layout interno con sidebar y topbar.

## Arquitectura backend

El backend sigue arquitectura MVC:

- `models/`: esquemas Mongoose.
- `controllers/`: logica de negocio.
- `routes/`: endpoints Express.
- `middlewares/`: autenticacion y autorizacion.
- `config/`: MongoDB y Swagger.
- `server.js`: arranque de Express, middlewares globales, CORS, cookies, Swagger y rutas.

Seguridad:

- JWT firmado con `JWT_SECRET`.
- Cookie `token` HTTP-only.
- `secure` solo en produccion.
- CORS con `credentials: true`.
- `protect` valida sesion.
- `authorize(...roles)` restringe por rol.

## Mapa de rutas frontend

Publicas:

- `/`
- `/login`
- `/register`
- `/recuperar-contrasena`

Protegidas con layout interno:

- `/app/dashboard`
- `/app/departamentos`
- `/app/posiciones`
- `/app/asistencia`
- `/app/reportes`
- `/app/registro`
- `/app/mi-perfil`
- `/app/mi-asistencia`

Guardias:

- `PublicRoute`: redirige usuarios autenticados.
- `PrivateRoute`: requiere sesion.
- `AdminRoute`: requiere rol `admin`.
- `EmployeeRoute`: requiere sesion, permite admin y employee.

## Stores Zustand implementados

- `useAuthStore`: `user`, `usuario`, `isAuthenticated`, `estaAutenticado`, `loading`, `cargando`, `error`, `login()`, `logout()`, `checkAuth()`, `refrescarPerfil()`, `esAdmin()`, `esEmpleado()`.
- `useThemeStore`: `isDark`, `initTheme()`, `setTheme()`, `toggleTheme()`.
- `useDepartmentStore`: `departments`, `loading`, `error`, `fetchDepartments()`, `createDepartment()`, `updateDepartment()`, `deleteDepartment()`.
- `usePositionStore`: `positions`, `loading`, `error`, `fetchPositions()`, `createPosition()`, `updatePosition()`, `deletePosition()`.
- `useCatalogStore`: carga paralela de departamentos y posiciones para dashboard.

El JWT no se guarda en `localStorage` ni `sessionStorage`; solo se transmite mediante cookie HTTP-only gestionada exclusivamente por el backend.

## Contratos API principales

### POST `/api/auth/register`

Request:

```json
{
  "name": "Empleado Demo",
  "email": "empleado@empresa.com",
  "password": "Password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "user": {
    "id": "ObjectId",
    "name": "Empleado Demo",
    "email": "empleado@empresa.com",
    "role": "employee"
  }
}
```

### POST `/api/auth/register-admin`

Requiere cookie valida y rol `admin`.

```json
{
  "name": "Admin Demo",
  "email": "admin@empresa.com",
  "password": "Password123",
  "role": "admin"
}
```

### POST `/api/auth/login`

```json
{
  "email": "admin@empresa.com",
  "password": "Password123"
}
```

Devuelve usuario y setea cookie HTTP-only `token`.

### POST `/api/auth/logout`

Limpia la cookie `token`.

### GET `/api/auth/profile`

Requiere cookie valida. Devuelve datos del usuario autenticado.

### PUT `/api/auth/profile`

```json
{
  "name": "Nuevo Nombre",
  "password": "NuevaClave123"
}
```

`password` es opcional. Si se envia, debe tener minimo 6 caracteres.

### POST `/api/auth/recover`

```json
{
  "email": "usuario@empresa.com"
}
```

Devuelve una respuesta controlada sin revelar si el email existe.

### CRUD `/api/departamentos`

Requiere autenticacion. Escritura solo para rol `admin`.

- `GET /api/departamentos`
- `POST /api/departamentos`
- `PUT /api/departamentos/:id`
- `DELETE /api/departamentos/:id`

Request:

```json
{
  "name": "Talento Humano",
  "description": "Area de gestion de personal"
}
```

### CRUD `/api/cargos`

Requiere autenticacion. Escritura solo para rol `admin`.

- `GET /api/cargos`
- `POST /api/cargos`
- `PUT /api/cargos/:id`
- `DELETE /api/cargos/:id`

Request:

```json
{
  "title": "Analista de Nomina",
  "department": "ObjectId del departamento"
}
```

### CRUD `/api/empleados`

Requiere autenticacion. Escritura solo para rol `admin`.

- `GET /api/empleados`
- `POST /api/empleados`
- `PUT /api/empleados/:id`
- `DELETE /api/empleados/:id`

Request:

```json
{
  "userId": "ObjectId del usuario",
  "position": "ObjectId del cargo",
  "department": "ObjectId del departamento",
  "hireDate": "2024-01-15"
}
```

## JWT en cookies HTTP-only

El backend genera un JWT al registrar o iniciar sesion. Ese token se envia como cookie HTTP-only llamada `token`, por lo que JavaScript del navegador no puede leerlo. El frontend usa `withCredentials: true` en Axios para que el navegador envie la cookie automaticamente en cada peticion protegida.

## Modo oscuro persistente

El tema se maneja con `useThemeStore`. Se persiste solo la preferencia visual (`isDark`) en localStorage mediante Zustand persist. El store aplica `data-theme="dark|light"` al elemento `<html>`, permitiendo compatibilidad con las variables CSS del proyecto.

## Integracion parcial

La integracion demostrable se enfoca en:

- Login/logout/perfil con cookie HTTP-only.
- Dashboard protegido con resumen de departamentos, cargos y empleados.
- CRUD completo de departamentos sobre `/api/departamentos`.
- CRUD completo de cargos sobre `/api/cargos`.
- CRUD completo de empleados sobre `/api/empleados`.
- Registro de asistencia (checkin/checkout) sobre `/api/attendance`.
- Generacion de reportes en PDF/CSV sobre `/api/reports`.
- Registro publico de empleados.
- Registro de admins desde panel admin.

## Checklist final de pruebas

1. Instalar dependencias:

```bash
cd backend
npm install
cd ../frontend
npm install
```

2. Crear `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/rrhh_db
MONGO_URI_TEST=mongodb://localhost:27017/rrhh_test
JWT_SECRET=<cadena aleatoria de 64 bytes — ver .env.example>
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASS=ClaveAdmin123
```

3. Ejecutar MongoDB local.

4. Ejecutar backend:

```bash
cd backend
npm run dev
```

5. Ejecutar frontend:

```bash
cd frontend
npm run dev
```

6. Abrir Swagger:

```text
http://localhost:5000/api-docs
```

7. Probar registro publico en `/register`.

8. Probar login en `/login`.

9. Probar dashboard protegido `/app/dashboard`.

10. Probar CRUD de departamentos.

11. Probar CRUD de posiciones.

12. Probar logout.

13. Probar una ruta protegida sin sesion, por ejemplo `/app/dashboard`.

14. Probar modo oscuro/claro y recargar con F5.

15. Probar responsive en movil y escritorio.

16. Revisar commits por integrante:

```bash
git log --date=short --pretty=format:"%h %ad %an %s"
```

## Despliegue con Docker

Como alternativa al entorno local, el proyecto incluye un `docker-compose.yml` en la raiz:

```bash
# Desde la raiz del proyecto
cp backend/.env.example backend/.env  # completar con valores reales
docker-compose up -d
```

Servicios:

- `mongo`: MongoDB 7 con volumen persistente.
- `backend`: API REST en el puerto 5000.
- `frontend`: SPA servida por nginx en el puerto 80.

Crear el usuario administrador inicial:

```bash
docker-compose exec backend npm run seed:admin
```

## Proyeccion: Autenticacion Multifactor (MFA / TOTP)

El sistema autentica actualmente con correo y contrasena mediante JWT en cookie HTTP-only. La implementacion de un segundo factor (TOTP — RFC 6238, compatible con Google Authenticator, Authy y Microsoft Authenticator) se proyecta para una fase siguiente.

### Plan arquitectonico

**Backend:**

1. Agregar campos al modelo `User`:
   - `mfaEnabled: Boolean` (default `false`)
   - `mfaSecret: String` (clave TOTP cifrada en reposo con `crypto.createCipheriv`)

2. Nuevo endpoint `POST /api/auth/mfa/setup`:
   - Genera una clave TOTP con la libreria `otplib`.
   - Devuelve una URI `otpauth://` para renderizar un codigo QR con `qrcode`.
   - El usuario escanea el QR con su aplicacion autenticadora.

3. Nuevo endpoint `POST /api/auth/mfa/verify`:
   - Recibe el codigo de 6 digitos del usuario.
   - Valida con `authenticator.verify()` de `otplib`.
   - Si es correcto, activa `mfaEnabled = true` en el usuario.

4. Modificacion del flujo `POST /api/auth/login`:
   - Si `mfaEnabled === true`, el login inicial responde `202 Accepted` con un token de sesion temporal (sin permisos completos).
   - El cliente envia el codigo TOTP a `POST /api/auth/mfa/confirm`.
   - Solo entonces se emite la cookie JWT definitiva con permisos completos.

**Frontend:**

- Pantalla intermedia post-login cuando el backend responde `202`: formulario de ingreso del codigo TOTP de 6 digitos.
- Seccion en "Mi Perfil" para activar o desactivar MFA con visualizacion del QR de configuracion inicial.

**Dependencias a agregar:**

```bash
# Backend
npm install otplib qrcode
```

**Consideraciones de seguridad:**

- La clave TOTP (`mfaSecret`) debe cifrarse antes de persistir en la base de datos.
- Generar codigos de recuperacion de un solo uso durante la configuracion inicial.
- El endpoint de verificacion debe tener rate limiting estricto (maximo 5 intentos por minuto).
- Invalidar sesiones activas al deshabilitar MFA.

---

## Proyeccion: Repositorio de Documentos y Sistema de Alertas

### Repositorio de documentos por empleado

Cada empleado debe poder tener documentos adjuntos: contrato laboral, acta de terminacion, actualizacion de datos personales, firmas de politicas internas, entre otros.

**Plan de implementacion:**

1. Almacenamiento de archivos mediante **AWS S3** o **MinIO** (opcion auto-hospedada) usando `multer` + `@aws-sdk/client-s3`.

2. Nuevo modelo `EmployeeDocument`:
   - `employeeId` (ref `Employee`)
   - `tipo`: `'contrato' | 'acta' | 'politica' | 'otro'`
   - `nombre: String`
   - `url: String` (URL prefirmada de S3, expira en 15 minutos)
   - `fechaSubida: Date`
   - `subidoPor` (ref `User`)

3. Nuevos endpoints REST:
   - `POST /api/empleados/:id/documentos` — subir documento (multipart/form-data)
   - `GET /api/empleados/:id/documentos` — listar documentos del empleado
   - `DELETE /api/empleados/:id/documentos/:docId` — eliminar documento

4. En el frontend, pestana "Documentos" en el detalle del empleado con carga de archivos y lista descargable.

### Sistema de alertas automaticas

Casos de uso identificados:

- Fin del periodo de prueba (tipicamente 90 dias desde `hireDate`).
- Vencimiento de contratos a termino fijo.
- Empleados con pendientes de firma de politica de datos.

**Plan de implementacion:**

1. Campos opcionales en el modelo `Employee`:
   - `contractEndDate: Date`
   - `probationEndDate: Date`

2. Job programado con `node-cron` (ejecuta diariamente):
   - Consulta empleados con fechas criticas a 30 dias o menos.
   - Crea registros en un modelo `Alert` o envia correo con `nodemailer`.

3. Nuevo endpoint `GET /api/alerts` para el panel del administrador.

4. Widget de alertas en el Dashboard con conteo de alertas pendientes y acceso directo al empleado afectado.

---

## Errores comunes y solucion

- Backend apagado: el frontend mostrara error de conexion. Ejecutar `npm run dev` en `backend`.
- MongoDB apagado: el backend no inicia o falla al consultar. Iniciar servicio MongoDB local.
- Cookie no llega: verificar `credentials: "include"` en frontend y `credentials: true` en CORS.
- Usuario no es admin: rutas `/app/dashboard`, `/app/departamentos`, `/app/posiciones`, `/app/registro` redirigen a perfil.
- No aparece rol admin en registro publico: es intencional; solo admin autenticado puede crear admins.
- Swagger no abre: confirmar backend en puerto 5000 y entrar a `/api-docs`.
- F5 redirige incorrectamente: revisar que `checkAuth()` se ejecute en `App.jsx` y que backend responda `GET /api/auth/profile`.

