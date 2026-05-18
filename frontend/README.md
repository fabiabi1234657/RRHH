# Frontend — RRHH

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-433E38?style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-3-22b5bf?style=flat-square)
![nginx](https://img.shields.io/badge/nginx-alpine-009639?style=flat-square&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)

Interfaz de usuario del Sistema de Gestión de Recursos Humanos. SPA construida con React 19 + Vite 8 que consume la API REST del backend mediante Axios y gestiona el estado global con Zustand 5. Desplegada en Docker vía nginx.

---

## Tecnologías

| Paquete | Versión | Rol |
|---------|---------|-----|
| React | 19 | Interfaz de usuario |
| Vite | 8 | Build tool y servidor de desarrollo |
| React Router | v7 | Navegación SPA |
| Zustand | 5 | Estado global |
| Axios | 1.15 | Cliente HTTP con cookies |
| Recharts | 3 | Gráficas de asistencia y dashboard |
| jsPDF + jspdf-autotable | 4 / 5 | Exportación de reportes en PDF |

---

## Estructura del proyecto

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.ts              ← Instancia Axios (baseURL /api, withCredentials)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx        ← Contenedor principal con sidebar + topbar
│   │   │   ├── Sidebar.jsx       ← Navegación lateral por rol
│   │   │   └── Topbar.jsx        ← Saludo de usuario y botón de cierre de sesión
│   │   └── ui/                   ← Componentes reutilizables
│   │       ├── Alert.jsx
│   │       ├── AlertsWidget.jsx  ← Widget de vencimientos (contratos, periodos de prueba, Habeas Data)
│   │       ├── Avatar.jsx
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Navbar.jsx
│   │       ├── Pagination.jsx    ← Paginación reutilizable (info, prev/next, páginas con elipsis)
│   │       ├── Spinner.jsx
│   │       ├── StatCard.jsx
│   │       ├── ThemeToggle.jsx
│   │       └── ToastContainer.jsx ← Notificaciones — un solo toast activo a la vez
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useTheme.js
│   ├── pages/
│   │   ├── Attendance.jsx        ← Asistencia global por fecha (admin)
│   │   ├── Dashboard.jsx         ← KPIs, gráficas y AlertsWidget
│   │   ├── Departments.jsx       ← CRUD de departamentos
│   │   ├── Employees.jsx         ← CRUD de cargos/posiciones
│   │   ├── GestionEmpleados.jsx  ← CRUD completo de empleados + documentos
│   │   ├── GenerateReports.jsx   ← Generación y descarga de reportes PDF
│   │   ├── Home.jsx              ← Landing pública
│   │   ├── Login.jsx
│   │   ├── MyAttendance.jsx      ← Historial de asistencia propia (empleado)
│   │   ├── MyProfile.jsx         ← Perfil propio + configuración MFA
│   │   ├── RecoverPassword.jsx
│   │   └── Register.jsx          ← Registro de usuario (público y admin)
│   ├── router/
│   │   └── AppRouter.jsx         ← Rutas y guardias por rol
│   ├── services/
│   │   └── api.js                ← Funciones de llamada a la API
│   ├── stores/
│   │   ├── useAuthStore.js       ← Sesión: login(), logout(), checkAuth(), esAdmin()
│   │   ├── useCatalogStore.js    ← Carga paralela de departamentos y cargos
│   │   ├── useDepartmentStore.js ← CRUD departamentos
│   │   ├── usePositionStore.js   ← CRUD cargos
│   │   ├── useThemeStore.js      ← Tema oscuro/claro persistido en localStorage
│   │   └── useToastStore.js      ← Sistema de notificaciones (toast único con deduplicación)
│   └── styles/
│       └── globals.css           ← Sistema de diseño: variables CSS, tokens, componentes
├── index.html
├── vite.config.js
├── nginx.conf                    ← Sirve el build y proxea /api/ al backend
└── Dockerfile                    ← Build multi-etapa: node → nginx:alpine
```

---

## Ejecución con Docker (método principal)

El frontend forma parte del stack definido en `docker-compose.yml` en la raíz del proyecto.

```bash
# Desde la raíz del proyecto — levanta los tres servicios
docker compose up -d
```

El frontend queda disponible en **`http://localhost`** (puerto 80).

```bash
# Reconstruir la imagen tras cambios de código (sin usar caché)
docker compose build --no-cache frontend
docker compose up -d frontend

# Ver logs de nginx
docker compose logs -f frontend
```

> **Nota sobre caché del navegador:** Si tras un rebuild el navegador muestra la versión anterior, haz `Ctrl+Shift+R` (hard refresh). El `nginx.conf` está configurado para no cachear `index.html`, por lo que Vite garantiza hashes únicos por build en los assets JS/CSS.

---

## Ejecución local (desarrollo)

```bash
cd frontend
npm install
npm run dev      # Vite en http://localhost:5173
```

Vite proxea automáticamente `/api` a `http://localhost:5000` — no se requieren variables de entorno adicionales.

Scripts disponibles:

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve `dist/` localmente para validar el build |
| `npm run lint` | ESLint |

---

## Rutas de la aplicación

### Públicas (sin autenticación)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Home.jsx` | Landing pública |
| `/login` | `Login.jsx` | Inicio de sesión |
| `/register` | `Register.jsx` | Registro de cuenta |
| `/recuperar-contrasena` | `RecoverPassword.jsx` | Recuperación de cuenta |

> Las rutas públicas redirigen al dashboard si el usuario ya tiene sesión activa.

### Protegidas — solo Administrador (`/app/...`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/app/dashboard` | `Dashboard.jsx` | KPIs, gráficas de asistencia, alertas de vencimientos |
| `/app/empleados` | `GestionEmpleados.jsx` | Lista, crear, editar, eliminar empleados y gestionar documentos |
| `/app/posiciones` | `Employees.jsx` | CRUD de cargos/posiciones |
| `/app/departamentos` | `Departments.jsx` | CRUD de departamentos |
| `/app/asistencia` | `Attendance.jsx` | Asistencia global por fecha |
| `/app/reportes` | `Reports.jsx` | Vista y análisis de reportes |
| `/app/generar-reportes` | `GenerateReports.jsx` | Generación y descarga de reportes PDF |
| `/app/registro` | `Register.jsx` | Crear nuevos usuarios (admin) |

### Protegidas — Empleado y Administrador

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/app/mi-perfil` | `MyProfile.jsx` | Perfil propio, cambio de contraseña, configuración MFA (TOTP) |
| `/app/mi-asistencia` | `MyAttendance.jsx` | Historial de asistencia propia |

### Guardias de ruta

| Guardia | Comportamiento |
|---------|---------------|
| `PublicRoute` | Redirige al dashboard si ya está autenticado |
| `PrivateRoute` | Redirige a `/login` si no hay sesión |
| `AdminRoute` | Redirige a `/app/mi-perfil` si el rol no es `admin` |
| `EmployeeRoute` | Permite acceso a `employee` y `admin` |

---

## Paginación

Las siguientes vistas tienen paginación implementada con el componente `Pagination.jsx`:

| Vista | Página size | Trigger de reset |
|-------|------------|-----------------|
| `GestionEmpleados` — tabla de empleados | 25 por página | Cambio en el buscador |
| `Attendance` — registros del día | 25 por página | Cambio de fecha |
| `MyAttendance` — historial propio | 25 por página | — |
| `Dashboard → AlertsWidget` — vencimientos (cada sección) | 5 por página | — |

---

## Sistema de notificaciones (Toast)

`useToastStore.js` + `ToastContainer.jsx` implementan un sistema de **un solo toast activo**:

- Un nuevo toast **reemplaza** al anterior (no se acumulan).
- Deduplicación: notificaciones con el mismo contenido dentro de 800 ms se descartan.
- Auto-dismiss configurable (default: 4.500 ms).
- Animación de entrada/salida vertical (bottom-right).
- Tipos: `success`, `error`, `warning`, `info`.

```js
import { toast } from '../stores/useToastStore';

toast.success('Título', 'Mensaje opcional');
toast.error('Error', 'Detalle del error', 6000); // 6 seg
toast.warning('Atención', 'Mensaje');
toast.info('Info', 'Mensaje', 0);                // no auto-cierra
```

---

## Stores Zustand

| Store | Responsabilidad |
|-------|-----------------|
| `useAuthStore` | Sesión global: `login()`, `logout()`, `checkAuth()`, `esAdmin()` |
| `useThemeStore` | Tema oscuro/claro persistido en `localStorage` |
| `useDepartmentStore` | CRUD de departamentos → `/api/departamentos` |
| `usePositionStore` | CRUD de cargos → `/api/cargos` |
| `useCatalogStore` | Carga paralela de departamentos + cargos (para formularios) |
| `useToastStore` | Sistema de notificaciones (un solo toast activo, deduplicación) |

El JWT no se expone en `localStorage` ni `sessionStorage`. Se almacena exclusivamente en cookie `HTTP-only` gestionada por el backend.

---

## Diseño y estilos

El sistema de diseño está definido completamente en `src/styles/globals.css` usando variables CSS (`--surface`, `--text`, `--accent`, `--border`, `--radio`, etc.). No se usa Tailwind ni ninguna librería de estilos externa.

- Soporte completo de tema oscuro/claro mediante la clase `.dark` en `<body>`.
- Clases de componente: `.card`, `.table`, `.field__*`, `.btn`, `.badge`, `.pagination`, `.toast`, `.emp-chip`, etc.
