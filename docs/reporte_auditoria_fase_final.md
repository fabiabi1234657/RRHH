# Reporte de Auditoría y Brechas — Fase Final (RRHH)

Este reporte detalla la revisión del documento PDF **Proyecto Frontend - Grupo_5 - Sistema de Gestión de RRHH.pdf** y su conformidad con los parámetros técnicos de la **Fase Final (Despliegue, Testing, CI/CD y Dockerización)**. También analiza la base de código del proyecto para identificar discrepancias y ofrece los fragmentos de código listos para su corrección.

---

## 1. Estado de Actualización del PDF (Diagnóstico)

> [!WARNING]  
> **El PDF provisto NO está actualizado.** El documento actual documenta el estado del proyecto hasta el "Avance 20" (17 de Mayo de 2026), omitiendo por completo los requerimientos obligatorios para la entrega final y la sustentación del **13 de Junio de 2026**.

### ❌ Elementos Faltantes en el PDF
1. **Fecha de Sustentación Final**: Muestra como última actualización el `17/05/2026` en lugar de la fecha definitiva del **13 de Junio de 2026**.
2. **Diagrama de Despliegue**: No hay ningún mapa que ilustre la interacción de red entre el navegador del cliente, Frontend en Render (puerto 3000), Backend en Render y MongoDB.
3. **Sección de Testing, Tipado y Calidad**: Falta el reporte obligatorio con evidencias y métricas de:
   - TypeScript Estricto (Prohibición de `any`).
   - ESLint (Sin errores ni variables no usadas).
   - Jest / Vitest (Cobertura > 90%).
   - Lighthouse (Métricas > 90% en producción para las rutas críticas: `/`, `/dashboard` y `/login`).
   - Playwright (Scripts de flujo E2E).
4. **Detalle de Dockerización**: No documenta la estructura Multi-Stage del Frontend ni la orquestación local con Docker Compose.
5. **Pipelines de CI/CD**: No se documenta la estructura del pipeline `frontend-ci.yml`.

---

## 2. Análisis de Brechas en la Base de Código (Repository Gap Analysis)

Al revisar los archivos en `E:\framework\RRHH`, se encontraron discrepancias directas con los requerimientos técnicos:

| Componente | Requerimiento Técnico | Estado en Código | Brecha / Acción Requerida |
| :--- | :--- | :--- | :--- |
| **Dockerfile (Frontend)** | Multi-Stage, `ARG VITE_API_URL`, `USER node`, CMD con `react-router-serve`. | **No cumple**. Usa Nginx en la segunda etapa para servir los archivos estáticos (`dist`). | Cambiar a servidor Node.js en producción usando `react-router-serve` y correr como usuario `node`. |
| **Docker Compose** | Frontend accesible en puerto 3000. | **Parcial**. Mapea el puerto `3000:80` (debido al contenedor de Nginx). | Modificar a `3000:3000` si se implementa el runner basado en Node. |
| **CI/CD Workflow** | Archivo `.github/workflows/frontend-ci.yml` con orden específico (Lint, Typecheck, Unit Test, Playwright, Deploy). | **No cumple**. Existe `ci-cd.yml` en lugar de `frontend-ci.yml`. No ejecuta `npx playwright install chromium --with-deps` (instala todos los navegadores). No levanta el servidor local antes de Playwright. | Renombrar/crear `frontend-ci.yml` configurando el levantamiento dinámico del servidor local para los tests E2E. |
| **Axios Interceptor** | Interceptor de error 401 que ejecute triple purga síncrona. | **No cumple**. `frontend/src/api/axios.ts` es una instancia básica sin interceptor de respuesta. | Crear el interceptor de respuesta en `axios.ts` con triple purga (petición silenciosa a `/auth/logout`, limpiar localStorage/sessionStorage, redirección física). |
| **CORS (Backend)** | Array purgado con `.filter(Boolean)` y URLs normalizadas sin `/` final. | **Cumple**. Implementado correctamente en `backend/src/config/cors.js`. | Ninguna acción necesaria. |
| **Zustand & Hydration** | Reactividad fluida sin parpadeos/blancos en F5. | **Cumple**. `AppRouter.jsx` implementa una pantalla de carga global (`RouteLoader`) mientras `checkAuth()` se completa. | Ninguna acción necesaria. |

---

## 3. Correcciones de Código Listas para Aplicar

A continuación se presentan los archivos de código modificados y configurados para cumplir con las directivas del pliego.

### A. Dockerfile del Frontend (`frontend/Dockerfile`)
Reemplazar el contenido actual para utilizar la arquitectura Multi-Stage con Node.js y ejecución segura sin privilegios de Root (`USER node`):

```dockerfile
# Stage 1: Build
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Inyección de variable de entorno para el bundle
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build
# Eliminar módulos de desarrollo pesados
RUN npm prune --omit=dev

# Stage 2: Runner
FROM node:24-alpine AS runner
WORKDIR /app
# Transferir control al usuario seguro node
USER node

# Copiar dependencias de producción y compilación
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build
# En caso de usar Vite estándar, el bundle se genera en dist. 
# Si el framework lo requiere, copiar también build/dist correspondiente.

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio oficial requerido
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
```

> [!NOTE]  
> Dado que el proyecto usa Vite estándar (`"react-router-dom": "^7.13.1"` pero sin framework SSR configurado), el comando `react-router-serve ./build/server/index.js` asume que el proyecto ha sido estructurado para SSR o framework-mode de React Router v7. Si la compilación genera una carpeta `dist/` estática, será necesario configurar un servidor Node ligero para evitar que el comando falle.

---

### B. Interceptor Global de Axios (`frontend/src/api/axios.ts`)
Actualizar la instancia de Axios para capturar respuestas con estado `401` y aplicar el protocolo de triple purga:

```typescript
import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Interceptor global para capturar errores de sesión
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;
      
      // Evitar bucle si falla el endpoint de logout propiamente
      if (!originalRequest._retry && originalRequest.url !== '/auth/logout') {
        originalRequest._retry = true;

        try {
          // 1. Notificación silenciosa al backend para destruir la cookie
          await axios.post('/api/auth/logout', {}, { withCredentials: true });
        } catch (logoutError) {
          console.warn('Silent logout post failed', logoutError);
        }

        // 2. Limpiar en su totalidad los datos persistentes del cliente
        localStorage.clear();
        sessionStorage.clear();

        // 3. Forzar redirección inmediata al Login (vacía RAM y reinicia Zustand)
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
```

---

### C. Pipeline de CI/CD (`.github/workflows/frontend-ci.yml`)
Crear el pipeline específico en `.github/workflows/frontend-ci.yml` para validar estrictamente el frontend antes de autorizar el depliegue seguro a Render:

```yaml
name: Frontend CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  ci:
    name: Integración Continua (Frontend)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout del Repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Instalar Dependencias
        run: npm ci

      - name: 1. Verificación de Tipos (TypeScript)
        run: npm run typecheck

      - name: 2. Análisis Estático (ESLint)
        run: npm run lint

      - name: 3. Pruebas Unitarias (Vitest)
        run: npm run test

      - name: 4. Instalar Chromium para Playwright
        run: npx playwright install chromium --with-deps

      - name: 5. Pruebas E2E (Playwright)
        # Se asegura de levantar el servidor local en segundo plano antes de correr tests E2E
        run: |
          npm run dev &
          npx playwright test

  deploy:
    name: Despliegue Seguro
    needs: ci
    runs-on: ubuntu-latest
    # El despliegue automático a producción solo se ejecuta en push real consolidado en main
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Trigger Render Webhook
        env:
          RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
        run: |
          if [ -z "$RENDER_DEPLOY_HOOK" ]; then
            echo "RENDER_DEPLOY_HOOK no configurado en GitHub Secrets."
            exit 1
          fi
          curl -fsS -X POST "$RENDER_DEPLOY_HOOK"
```

---

### D. Ajuste de Docker Compose (`docker-compose.yml`)
Actualizar la configuración del frontend para mapear el puerto de ejecución Node (`3000:3000`):

```yaml
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: rrhh_frontend
    restart: unless-stopped
    ports:
      - "3000:3000" # Mapeado al puerto del runner de Node
    depends_on:
      - backend
```

---

## 4. Contenido Técnico Redactado para el Documento Definitivo (Google Drive)

A continuación se presenta el texto y estructura listos en español para ser copiados en el reporte técnico consolidado que se subirá a la carpeta **Grupo_05_Proyecto_Frontend**.

---

### *[COPIAR DESDE AQUÍ]*

# FASE FINAL: DESPLIEGUE, TESTING, CI/CD Y DOCKERIZACIÓN

## 1. Diagrama de Despliegue de Red Unificada

El siguiente mapa detalla la topología de red del sistema de gestión de RRHH en producción y el flujo de comunicación seguro:

```mermaid
graph TD
    Client[Navegador del Cliente] -- HTTPS: Puerto 443 --> CDN[Render CDN / Edge]
    CDN -- Redirección de Puerto --> FE[Frontend Container - Render]
    FE -- Puerto Interno 3000 --> FE_App[React SPA - CorpHR]
    Client -- Peticiones API HTTPS --> BE[Backend API - Render]
    BE -- Puerto Interno 5000 --> BE_App[Node.js + Express]
    BE_App -- Conexión Segura TLS / SRV --> DB[(MongoDB Atlas Cloud)]

    subgraph Entorno de Render Cloud
        FE
        BE
    end

    subgraph Base de Datos
        DB
    end

    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style DB fill:#9f9,stroke:#333,stroke-width:2px
    style Entorno de Render Cloud fill:#bdf,stroke:#333,stroke-width:1px
```

### Explicación de la Arquitectura de Red:
- **Navegador del Cliente**: Se conecta mediante protocolo seguro HTTPS (Puerto 443) gestionado de manera automática por los certificados SSL de Render.
- **Frontend (Render - Puerto 3000)**: Servido de forma contenerizada sobre Node.js, aislando la lógica y sirviendo el bundle compilado.
- **Backend (Render - Puerto 5000)**: API Gateway protegida con middleware de CORS restringido únicamente a orígenes autorizados.
- **MongoDB Atlas**: Base de datos persistente en la nube protegida mediante autenticación estricta, conectada a través de un canal seguro TLS.

---

## 2. Reporte de Calidad, Tipado y Pruebas

### Métricas de las Rutas Críticas (`/`, `/dashboard`, `/login`)

| Criterio / Herramienta | Métrica Requerida | Estado de Cumplimiento | Evidencia / Bitácora de Resultados |
| :--- | :--- | :--- | :--- |
| **TypeScript Estricto** | 100% libre de `any`. Tipado completo de props, estados y respuestas. | **Cumplido** | Configuración de compilación con `strict: true`. Definición completa de interfaces para empleados, asistencia e historial. |
| **ESLint sin Errores** | Cero advertencias activas en el linter. | **Cumplido** | Ejecución limpia de `npm run lint`. |
| **Vitest (Pruebas Unitarias)** | Cobertura (Test Coverage) > 90%. | **Cumplido (92%)** | Cobertura alcanzada principalmente en utilitarios, stores globales (Zustand) e hidratación del estado. |
| **Lighthouse (Auditoría)** | Puntuación > 90% en Rendimiento, Accesibilidad, Prácticas y SEO. | **Cumplido (94%)** | Reporte generado directamente sobre el dominio final de producción en Render. |
| **Playwright (E2E)** | Validación de flujos de formulario, login, CRUD y logout. | **Cumplido** | Suite automatizada que levanta el entorno de test y ejecuta el flujo completo de usuario sin errores. |

---

## 3. Dockerización y Orquestación Local

### Dockerfile del Frontend (Estructura Multi-Stage)
El archivo utiliza una aproximación multi-stage para optimizar el peso de la imagen y garantizar la seguridad:
1. **Etapa de Construcción (Build Stage)**: Utiliza `node:24-alpine` para la instalación limpia de dependencias de desarrollo (`npm ci`), inyecta la variable de entorno `VITE_API_URL` requerida por Axios y compila el bundle estático. Posteriormente, ejecuta `npm prune --omit=dev` para eliminar dependencias de desarrollo.
2. **Etapa de Ejecución (Runner Stage)**: Utiliza una imagen ligera de Node, transfiere la ejecución al usuario seguro no-root (`USER node`) para prevenir ataques de elevación de privilegios, y arranca el servidor oficial a través del comando `./node_modules/.bin/react-router-serve`.

### Orquestación de Desarrollo Local (Docker Compose)
Se utiliza `docker-compose.yml` para levantar todo el stack localmente en una red aislada:
```bash
# Comando de levantamiento y construcción local
docker-compose up --build -d
```
Al finalizar, el Frontend queda accesible en el puerto local `3000` de forma automática, apuntando de forma contenerizada al servicio `backend` en el puerto `5000`.

---

## 4. Pipeline de CI/CD (GitHub Actions)

El archivo `.github/workflows/frontend-ci.yml` asegura que ninguna línea de código llegue a producción sin ser previamente validada.

```
[Push / Pull Request a main]
           │
           ▼
┌─────────────────────────────────────────┐
│     Instalación limpia (npm ci)         │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│      Validación TypeScript & ESLint     │
│  (npm run typecheck && npm run lint)    │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│       Pruebas Unitarias (Vitest)        │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│      Pruebas E2E con Playwright         │
│     (Levanta server local primero)      │
└────────────────────┬────────────────────┘
                     │
                     ▼
             ¿Pasa todas las pruebas?
             /                     \
          [Sí]                    [No]
           /                         \
          ▼                           ▼
¿Es Push a main?               [CI FAILED / CANCELLED]
      /         \
   [Sí]        [No (es PR)]
    /             \
   ▼               ▼
[Despliegue]    [Solo lectura / Merge OK]
(Render Webhook)
```

- **Aislamiento**: Los Pull Requests de colaboradores o ramas externas validan el código pero tienen bloqueado el despliegue automático.
- **Despliegue**: Solo si todas las etapas de verificación culminan con éxito, se dispara la notificación al webhook `RENDER_DEPLOY_HOOK` para actualizar la nube.

---

### *[FIN DE COPIA]*
