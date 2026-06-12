# CI/CD RRHH

Este proyecto usa GitHub Actions para validar backend, frontend, Docker y despliegue en Render.

## Workflow

Archivo: `.github/workflows/ci-cd.yml`

Se ejecuta en:

- Pull requests hacia `main`.
- Push a `main`.
- Push a `backend-hardening-docs-frontend`.
- Ejecucion manual con `workflow_dispatch`.

## CI

El pipeline valida:

- Backend: `npm ci`, `npm run lint`, `npm test`.
- Coverage backend: `npm run test:coverage` como auditoria visible. Actualmente no bloquea el flujo porque el proyecto aun no alcanza 90%.
- Frontend: `npm ci`, `npm run lint`, `npm run build`.
- Docker: build de imagen backend y frontend.

## CD

El despliegue se dispara en push a `main` o manualmente. Usa deploy hooks de Render.

Configurar estos secrets en GitHub:

- `RENDER_BACKEND_DEPLOY_HOOK_URL`
- `RENDER_FRONTEND_DEPLOY_HOOK_URL`

Si un secret no existe, el paso correspondiente se omite sin romper el workflow.

## Variables de Render

Backend:

- `NODE_ENV=production`
- `PORT=5000`
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

Frontend:

- `VITE_API_URL`

## Nota de cobertura

El umbral Jest global sigue configurado en 90%. La auditoria de coverage queda visible en CI para no ocultar la deuda actual, pero no bloquea despliegue mientras se agregan pruebas a controladores pendientes.
