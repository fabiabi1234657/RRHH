import './config/env.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { corsOptions } from './config/cors.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'));
}

app.use(cors(corsOptions));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'rrhh-backend'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/empleados', employeeRoutes);
app.use('/api/departamentos', departmentRoutes);
app.use('/api/cargos', positionRoutes);
app.use('/api', documentRoutes);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'API de RRHH funcionando correctamente'
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

export default app;
