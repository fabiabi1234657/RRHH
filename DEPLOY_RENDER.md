# Guía de Despliegue en Render — Sistema de Gestión de RRHH

Esta guía contiene los pasos necesarios para desplegar de forma gratuita y profesional el sistema de RRHH (Frontend en React y Backend en Node.js/Express con base de datos MongoDB) en **Render**.

---

## Arquitectura de Despliegue

Para un rendimiento óptimo y costo cero (Free Tier), utilizaremos la siguiente configuración en Render:
1. **Backend (API REST):** Render Web Service (Node.js).
2. **Frontend (React SPA):** Render Static Site (sitio estático servido por CDN global, siempre rápido y 100% gratuito).
3. **Base de Datos:** MongoDB Atlas (MaaS gratuito con 512 MB de almacenamiento persistente).

---

## Requisitos Previos

1. Una cuenta en [GitHub](https://github.com/) o [GitLab](https://about.gitlab.com/).
2. Una cuenta en [Render](https://render.com/).
3. Una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

## Paso 1 — Crear y Configurar la Base de Datos en MongoDB Atlas

Render no ofrece base de datos MongoDB administrada de forma gratuita, por lo que usaremos MongoDB Atlas:

1. Inicia sesión en **MongoDB Atlas** y crea un nuevo cluster gratuito (M0 Sandbox).
2. Ve a la sección **Database Access** y crea un usuario de base de datos con permisos de lectura y escritura (`Read and write to any database`). Recuerda la contraseña.
3. Ve a **Network Access** y añade una regla de IP. 
   > [!IMPORTANT]
   > Añade la IP `0.0.0.0/0` (permitir acceso desde cualquier lugar). Las direcciones IP de salida de los servidores de Render son dinámicas y cambian constantemente; si no permites todo, el backend de Render no se podrá conectar a la base de datos.
4. Ve a la pestaña **Database**, haz clic en **Connect** -> **Drivers** y copia la cadena de conexión (`Connection String`).
   - Tendrá un formato similar a: `mongodb+srv://<usuario>:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Reemplaza `<password>` con la contraseña del usuario que creaste.

---

## Paso 2 — Subir el Proyecto a GitHub

Asegúrate de que todo tu código esté subido a un repositorio en GitHub o GitLab (puede ser público o privado). El archivo `render.yaml` que hemos creado debe estar en la raíz de tu repositorio.

---

## Paso 3 — Desplegar en Render usando el Blueprint (Recomendado)

Render cuenta con la función **Blueprints**, que lee el archivo `render.yaml` y configura automáticamente el backend y el frontend con las especificaciones correctas.

1. Ve a tu panel de **Render Dashboard** (`https://dashboard.render.com/`).
2. Haz clic en **New** (arriba a la derecha) y selecciona **Blueprint**.
3. Conecta tu cuenta de GitHub/GitLab si no lo has hecho, y selecciona el repositorio de este proyecto.
4. Render leerá el archivo `render.yaml` y te mostrará el formulario de configuración inicial:
   - **Service Group Name:** Dale un nombre a tu grupo de servicios (ej. `rrhh-system`).
   - **MONGO_URI (backend):** Pega la cadena de conexión de MongoDB Atlas que copiaste en el Paso 1.
   - **JWT_SECRET (backend):** Déjalo en blanco; Render generará un secreto seguro y aleatorio automáticamente.
   - **FRONTEND_URL (backend):** Puedes dejarlo en blanco temporalmente o escribir la URL prevista del frontend (ej: `https://rrhh-frontend.onrender.com`).
   - **VITE_API_URL (frontend):** Escribe la URL de tu backend en Render agregando `/api` al final. Por defecto será: `https://rrhh-backend.onrender.com/api` (o el nombre que hayas elegido para el servicio backend con `/api` al final).
5. Haz clic en **Apply**.

Render comenzará a construir y desplegar ambos servicios de forma paralela.

---

## Paso 4 — Vincular Correctamente Frontend y Backend (CORS)

Dado que las URL finales de Render pueden variar si los nombres por defecto ya están ocupados, realiza este ajuste final si es necesario:

1. Cuando finalice el despliegue del frontend, copia su URL pública (ej. `https://rrhh-frontend-xxxx.onrender.com`).
2. Ve a la configuración del servicio backend (**rrhh-backend**) en Render -> pestaña **Environment**.
3. Edita la variable `FRONTEND_URL` y pega la URL de tu frontend que copiaste en el punto anterior.
4. Haz clic en **Save Changes**. El backend se reiniciará automáticamente con el valor actualizado. Esto garantiza que las cookies y peticiones HTTP-only pasen el filtro CORS del backend de forma exitosa.

---

## Paso 5 — Sembrar la Base de Datos con Datos de Prueba (Seed)

Para que el sistema no esté vacío y puedas probar el panel completo con sus reportes y empleados, ejecuta el script de semillas:

1. En tu panel de Render, entra al servicio del Backend (**rrhh-backend**).
2. En el menú lateral izquierdo, haz clic en la pestaña **Shell**.
3. Ejecuta el comando de semillas:
   ```bash
   npm run seed
   ```
4. El script poblará la base de datos con los catálogos y un conjunto de datos realistas (71 empleados y miles de registros de asistencia entre 2023 y 2026).
5. Una vez completado el script, puedes iniciar sesión con las siguientes credenciales predeterminadas:
   - **Email:** `admin@rrhh.com`
   - **Contraseña:** `Password123`

---

## Notas Importantes sobre Almacenamiento (Gestión de Documentos)

El sistema permite subir documentos de empleados (PDFs, imágenes, etc.).

> [!WARNING]
> En la versión gratuita de Render (Free tier), el backend se ejecuta sobre un **sistema de archivos efímero**. Esto significa que todos los documentos que subas en el panel de empleados **se perderán** cada vez que el backend se reinicie o se vuelva a desplegar.

### ¿Cómo solucionarlo?
Si planeas usar esta aplicación en producción real, tienes dos opciones:
1. **Usar un Render Disk Persistente (Pago):**
   Puedes modificar el archivo `render.yaml` o añadir un disco desde el panel de Render en el backend. Los discos persistentes requieren un plan de pago (Starter de $7 USD/mes o superior).
   - En `render.yaml`, descomenta las líneas finales del backend y añade el disco en la ruta `/opt/render/project/src/backend/uploads`.
2. **Modificar el código para almacenar en la nube:**
   Adaptar la lógica de `documentController.js` para subir los archivos a servicios de almacenamiento externo como AWS S3, Google Cloud Storage, Cloudinary, etc.
