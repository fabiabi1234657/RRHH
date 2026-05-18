import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import connectDB from './src/config/database.js';
import swaggerSpec from './src/config/swagger.js';
import authRoutes from './src/routes/authRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import departmentRoutes from './src/routes/departmentRoutes.js';
import positionRoutes from './src/routes/positionRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';

// Cargar variables de entorno desde .env usando ruta absoluta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Crear la aplicación Express
const app = express();

// MIDDLEWARES - Estos procesos se ejecutan para TODAS las peticiones
// 1. Parsear JSON del cuerpo de la petición
app.use(express.json());

// 2. Parsear cookies
app.use(cookieParser());

// 3. Logging HTTP (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Configurar CORS (para que el frontend pueda hacer peticiones)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Permitir envío de cookies
}));

// Conectar a la base de datos
connectDB();

// RUTAS DE LA API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/empleados', employeeRoutes);
app.use('/api/departamentos', departmentRoutes);
app.use('/api/cargos', positionRoutes);
// Documentos: rutas anidadas /api/empleados/:id/documents y /api/documents/:id
app.use('/api', documentRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de RRHH funcionando correctamente ✓'
  });
});

// Ruta 404 - si no encuentra la ruta
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n Servidor iniciado en puerto ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Swagger API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`\nPara desarrollar usar: npm run dev\n`);
});
