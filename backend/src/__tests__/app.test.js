import request from 'supertest';
import app from '../app.js';

describe('Aplicacion - healthcheck y CORS', () => {
  test('GET /health responde estado operativo', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      status: 'ok',
      service: 'rrhh-backend'
    });
  });

  test('CORS permite el frontend local de Vite', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  test('CORS no devuelve cabecera allow-origin para origen no permitido', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://frontend-no-autorizado.example')
      .set('Access-Control-Request-Method', 'POST')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
