import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { buildMfaPendingResponse } from './mfaController.js';
import { authCookieOptions, clearAuthCookieOptions } from '../config/cookies.js';

// Función para generar JWT
const generateToken = (id) => {
  // El token expira en 7 días
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// REGISTER: Crear un nuevo usuario
export const register = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la petición
    const { name, email, password } = req.body;

    // Validar que todos los campos estén presentes
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear nuevo usuario
    const user = await User.create({
      name,
      email,
      password,
      role: 'employee'
    });

    // Responder al cliente (sin cookie — el usuario debe hacer login explícito)
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el registro',
      error: error.message
    });
  }
};

// REGISTER ADMIN: crear usuarios desde una sesion con rol admin
export const registerByAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos'
      });
    }

    if (!['employee', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol invalido'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya esta registrado'
      });
    }

    const user = await User.create({ name, email, password, role });

    return res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creando usuario',
      error: error.message
    });
  }
};

// LOGIN: Autenticar usuario existente
export const login = async (req, res) => {
  try {
    // Extraer email y contraseña
    const { email, password } = req.body;

    // Validar que tenga ambos datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa email y contraseña'
      });
    }

    // Buscar usuario por email
    // Notar que usamos select('+password') porque la contraseña no se incluye por defecto
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Comparar contraseñas
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Si el usuario tiene MFA habilitado, NO se emite cookie aún.
    // Se devuelve un token temporal para completar el segundo factor.
    if (user.mfaEnabled) {
      return res.json(buildMfaPendingResponse(user));
    }

    // Generar token
    const token = generateToken(user._id);

    // Enviar token en cookie HTTP-only
    res.cookie('token', token, authCookieOptions);

    // Responder
    res.json({
      success: true,
      message: 'Sesión iniciada correctamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el login',
      error: error.message
    });
  }
};

// LOGOUT: Cerrar sesión
export const logout = (req, res) => {
  // Limpiar la cookie del token
  res.clearCookie('token', clearAuthCookieOptions);

  res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
};

// GET PROFILE: Obtener datos del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    // El middleware de autenticación ya validó el token y puso el ID en req.user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// UPDATE PROFILE: actualizar nombre y/o contrasena del usuario autenticado
export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name && !password) {
      return res.status(400).json({
        success: false,
        message: 'Envia al menos un campo para actualizar'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (name) user.name = name;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contrasena debe tener al menos 6 caracteres'
        });
      }
      user.password = password;
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

// RECOVER: genera token y envia correo
export const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa tu correo electronico'
      });
    }

    const user = await User.findOne({ email });

    // Por seguridad, no revelamos si el usuario existe
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el correo esta registrado, recibiras instrucciones de recuperacion'
      });
    }

    // Obtener token de reset
    const resetToken = user.getResetPasswordToken();

    // Guardar token en la BD (sin validación de otros campos)
    await user.save({ validateBeforeSave: false });

    // Crear URL de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace:\n\n${resetUrl}\n\nSi no solicitaste esto, ignora este correo.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Recuperación de contraseña - CorpHR',
        message
      });

      res.json({
        success: true,
        message: 'Si el correo esta registrado, recibiras instrucciones de recuperacion'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'No se pudo enviar el correo',
        error: error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en la recuperacion',
      error: error.message
    });
  }
};

// GET USERS: listar todos los usuarios (solo admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('_id name email role').sort({ name: 1 });
    return res.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message,
    });
  }
};

// RESET PASSWORD: valida token y cambia contrasena
export const resetPassword = async (req, res) => {
  try {
    // Obtener token hasheado
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'El token es invalido o ha expirado'
      });
    }

    // Establecer nueva contraseña
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Contraseña restablecida correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña',
      error: error.message
    });
  }
};
