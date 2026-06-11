import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import User from '../models/User.js';

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('Middlewares de seguridad', () => {
  test('protect devuelve 401 cuando no hay token', async () => {
    const req = { cookies: {} };
    const res = mockResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('protect devuelve 401 cuando el token es invalido', async () => {
    const req = { cookies: { token: 'token-invalido' } };
    const res = mockResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('protect devuelve 401 cuando el usuario del token ya no existe', async () => {
    const token = jwt.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);
    const req = { cookies: { token } };
    const res = mockResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('authorize devuelve 401 cuando no hay sesion activa', () => {
    const req = {};
    const res = mockResponse();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
