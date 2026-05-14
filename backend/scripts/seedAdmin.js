/**
 * seedAdmin.js — Crea o actualiza el usuario administrador inicial.
 *
 * Uso: npm run seed:admin
 *
 * Variables requeridas en .env:
 *   ADMIN_EMAIL  — email del administrador
 *   ADMIN_PASS   — contraseña del administrador
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASS } = process.env;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI no está definida en .env');
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error('Error: ADMIN_EMAIL y ADMIN_PASS deben estar definidas en .env');
  process.exit(1);
}

if (ADMIN_PASS.length < 8) {
  console.error('Error: ADMIN_PASS debe tener al menos 8 caracteres');
  process.exit(1);
}

const seedAdmin = async () => {
  await mongoose.connect(MONGO_URI);

  let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).select('+password');

  if (!admin) {
    admin = new User({
      name: 'Administrador',
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASS,
      role: 'admin',
    });
    await admin.save();
    console.log(`\nAdmin creado: ${ADMIN_EMAIL}`);
  } else {
    // Actualizar contraseña y rol si ya existe
    admin.password = ADMIN_PASS;
    admin.role = 'admin';
    await admin.save();
    console.log(`\nAdmin actualizado: ${ADMIN_EMAIL}`);
  }

  console.log('Listo. Puedes iniciar sesión con las credenciales del .env\n');
};

seedAdmin()
  .catch((error) => {
    console.error(`Error en seed:admin — ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
