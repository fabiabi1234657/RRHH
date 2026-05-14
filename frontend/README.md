# Frontend — RRHH

Interfaz de usuario del Sistema de Gestión de Recursos Humanos. SPA construida con React 19 + Vite 8 que consume la API REST del backend mediante Axios y gestiona el estado global con Zustand.

---

## Tecnologías

| Paquete | Versión | Rol |
|---------|---------|-----|
| React | 19 | Interfaz de usuario |
| Vite | 8 | Build tool y servidor de desarrollo |
| React Router | v7 | Navegación SPA |
| Zustand | 5 | Estado global |
| Axios | 1.15 | Cliente HTTP con cookies |
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
│   │   ├── HydrationGuard.tsx
│   │   ├── layout/               ← Layout principal (Sidebar, Topbar)
│   │   └── ui/                   ← Componentes reutilizables (Alert, Badge, Avatar…)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useTheme.js
│   ├── pages/                    ← Vistas de la aplicación
│   ├── router/
│   │   └── AppRouter.jsx         ← Rutas y guardias
│   ├── services/
│   │   └── api.js                ← Funciones de llamada a la API
│   ├── stores/                   ← Stores Zustand
│   │   ├── useAuthStore.js
│   │   ├── useThemeStore.js
│   │   ├── useDepartmentStore.js
│   │   ├── usePositionStore.js
│   │   └── useCatalogStore.js
│   └── styles/
│       └── globals.css
├── index.html
├── vite.config.js
├── Dockerfile
├── nginx.conf
└── .env.example
```

---

## Variables de entorno

Para desarrollo local no se requiere ninguna variable de entorno. Vite proxea `/api` al backend en `http://localhost:5000`.

Copia `.env.example` a `.env.local` solo si necesitas anular la URL base:

```env
# VITE_API_URL=http://localhost:5000
```

En Docker, nginx sirve el build estático y proxea `/api/` al contenedor `backend`.

---

## Ejecución en desarrollo

```bash
cd frontend
npm install
npm run dev
```

Disponible en: `http://localhost:5173`

---

## Build de producción

```bash
npm run build      # genera el directorio dist/
npm run preview   # sirve dist/ localmente para validar
```

---

## Rutas de la aplicación

### Públicas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Home.jsx` | Página de inicio |
| `/login` | `Login.jsx` | Inicio de sesión |
| `/register` | `Register.jsx` | Registro de empleado |
| `/recuperar-contrasena` | `RecoverPassword.jsx` | Recuperación de cuenta |

### Protegidas (requieren sesión activa)

| Ruta | Componente | Rol mínimo |
|------|-----------|------------|
| `/app/dashboard` | `Dashboard.jsx` | Admin |
| `/app/departamentos` | `Departments.jsx` | Admin |
| `/app/empleados` | `Employees.jsx` | Admin |
| `/app/asistencia` | `Attendance.jsx` | Admin |
| `/app/reportes` | `Reports.jsx` | Admin |
| `/app/registro` | `Register.jsx` (admin) | Admin |
| `/app/mi-perfil` | `MyProfile.jsx` | Employee / Admin |
| `/app/mi-asistencia` | `MyAttendance.jsx` | Employee / Admin |

### Guardias

- `PublicRoute`: redirige usuarios ya autenticados al dashboard.
- `PrivateRoute`: redirige a `/login` si no hay sesión activa.
- `AdminRoute`: restringe acceso a usuarios con rol `admin`.
- `EmployeeRoute`: permite acceso a `employee` y `admin`.

---

## Stores Zustand

| Store | Responsabilidad |
|-------|-----------------|
| `useAuthStore` | Sesión global: `login()`, `logout()`, `checkAuth()`, `esAdmin()` |
| `useThemeStore` | Tema oscuro/claro persistido en `localStorage` |
| `useDepartmentStore` | CRUD de departamentos → `/api/departamentos` |
| `usePositionStore` | CRUD de cargos → `/api/cargos` |
| `useCatalogStore` | Carga paralela de departamentos y cargos para el dashboard |

El JWT no se expone en `localStorage` ni `sessionStorage`. Se almacena exclusivamente en cookie `HTTP-only` gestionada por el backend.

---

## Despliegue con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

El frontend queda disponible en `http://localhost` (puerto 80). Nginx sirve los archivos estáticos del build y proxea todas las peticiones `/api/` al servicio `backend`.
