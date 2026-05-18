import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// Definir el esquema (estructura) del usuario
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor ingresa tu nombre'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Por favor ingresa tu email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
    },
    password: {
      type: String,
      required: [true, 'Por favor ingresa una contraseña'],
      minlength: 6,
      select: false // No incluir contraseña por defecto en las consultas
    },
    role: {
      type: String,
      enum: ['employee', 'admin'],
      default: 'employee'
    },
    // === MFA / TOTP (Google Authenticator) ===
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaSecret: {
      type: String,
      select: false,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Middleware: encriptar contraseña ANTES de guardar
// Este middleware se ejecuta antes de guardar un nuevo usuario
userSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generar un "salt" (número aleatorio para más seguridad)
    const salt = await bcryptjs.genSalt(10);
    // Encriptar la contraseña con el salt
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método: comparar contraseña ingresada con la encriptada en la BD
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Crear el modelo (tabla) con el esquema definido
const User = mongoose.model('User', userSchema);

export default User;
