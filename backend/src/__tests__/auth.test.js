import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from '../routes/authRoutes.js';
import User from '../models/User.js';

// Cargar variables de entorno
dotenv.config();

// Crear app de prueba
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Rutas
app.use('/api/auth', authRoutes);

// Conectar a BD de prueba antes de las pruebas
beforeAll(async () => {
  try {
    // Usar una BD separada para tests
    const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/rrhh_test';
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error('Error conectando a la BD de prueba:', error);
  }
});

// Limpiar BD después de las pruebas
afterAll(async () => {
  try {
    await User.deleteMany({});
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error limpiando BD:', error);
  }
});

// Limpiar usuarios después de cada test
afterEach(async () => {
  await User.deleteMany({});
});

describe('Autenticación - POST /api/auth/register', () => {
  test('Registro exitoso devuelve 201', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('juan@example.com');
  });

  test('Email duplicado devuelve 400', async () => {
    // Crear primer usuario
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123'
      });

    // Intentar crear otro con el mismo email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Otro Usuario',
        email: 'juan@example.com',
        password: 'Password123'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

describe('Autenticación - POST /api/auth/login', () => {
  beforeEach(async () => {
    // Crear un usuario para login
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123'
      });
  });

  test('Credenciales correctas devuelven 200 con cookie', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan@example.com',
        password: 'Password123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('Credenciales incorrectas devuelven 401', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan@example.com',
        password: 'WrongPassword'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});

describe('Autenticacion - perfil, recuperacion y registro admin', () => {
  test('PUT /api/auth/profile actualiza nombre del usuario autenticado', async () => {
    const agent = request.agent(app);

    await agent
      .post('/api/auth/register')
      .send({
        name: 'Juan Perez',
        email: 'juan@example.com',
        password: 'Password123'
      })
      .expect(201);

    await agent
      .post('/api/auth/login')
      .send({
        email: 'juan@example.com',
        password: 'Password123'
      })
      .expect(200);

    const response = await agent
      .put('/api/auth/profile')
      .send({ name: 'Juan Actualizado' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.user.name).toBe('Juan Actualizado');
  });

  test('POST /api/auth/recover devuelve respuesta controlada', async () => {
    const response = await request(app)
      .post('/api/auth/recover')
      .send({ email: 'desconocido@example.com' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('POST /api/auth/register-admin permite crear admin solo con rol admin', async () => {
    const agent = request.agent(app);

    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'Password123',
      role: 'admin'
    });

    await agent
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123'
      })
      .expect(200);

    const response = await agent
      .post('/api/auth/register-admin')
      .send({
        name: 'Nuevo Admin',
        email: 'nuevo.admin@example.com',
        password: 'Password123',
        role: 'admin'
      })
      .expect(201);

    expect(response.body.user.role).toBe('admin');
  });
});
