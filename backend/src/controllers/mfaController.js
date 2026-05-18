import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const APP_NAME = 'CorpHR';

// Token temporal de 5 minutos para completar segundo factor
const generateMfaPendingToken = (userId) =>
  jwt.sign({ id: userId, mfa: 'pending' }, process.env.JWT_SECRET, { expiresIn: '5m' });

const generateSessionToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setSessionCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

// POST /api/auth/mfa/setup
// Usuario autenticado solicita configurar MFA. Devuelve QR + secret en base32.
// El MFA NO queda activo hasta que /enable confirme un código válido.
export const setupMfa = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+mfaSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA ya está habilitado. Desactívalo antes de reconfigurar.'
      });
    }

    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${user.email})`,
      issuer: APP_NAME,
      length: 20
    });

    user.mfaSecret = secret.base32;
    await user.save();

    const otpauthUrl = secret.otpauth_url;
    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

    return res.json({
      success: true,
      message: 'Escanea el QR con Google Authenticator y confirma con /mfa/enable',
      qr: qrDataUrl,
      secret: secret.base32,
      otpauthUrl
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error iniciando configuración de MFA',
      error: error.message
    });
  }
};

// POST /api/auth/mfa/enable  { token: '123456' }
// Verifica el primer código TOTP y activa MFA
export const enableMfa = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Código TOTP requerido' });
    }

    const user = await User.findById(req.user.id).select('+mfaSecret');
    if (!user || !user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'Debes iniciar la configuración con /mfa/setup primero'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: String(token),
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Código TOTP inválido' });
    }

    user.mfaEnabled = true;
    await user.save();

    return res.json({ success: true, message: 'MFA activado correctamente' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error activando MFA',
      error: error.message
    });
  }
};

// POST /api/auth/mfa/disable  { token: '123456' }
// Requiere un código válido para desactivar el segundo factor
export const disableMfa = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select('+mfaSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (!user.mfaEnabled) {
      return res.status(400).json({ success: false, message: 'MFA no está activo' });
    }

    if (!token) {
      return res.status(400).json({ success: false, message: 'Código TOTP requerido' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: String(token),
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Código TOTP inválido' });
    }

    user.mfaEnabled = false;
    user.mfaSecret = null;
    await user.save();

    return res.json({ success: true, message: 'MFA desactivado correctamente' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error desactivando MFA',
      error: error.message
    });
  }
};

// POST /api/auth/mfa/verify-login  { mfaToken, code }
// Segundo paso del login cuando el usuario tiene MFA activo
export const verifyMfaLogin = async (req, res) => {
  try {
    const { mfaToken, code } = req.body;
    if (!mfaToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'mfaToken y código TOTP son requeridos'
      });
    }

    let payload;
    try {
      payload = jwt.verify(mfaToken, process.env.JWT_SECRET);
    } catch (_e) {
      return res.status(401).json({ success: false, message: 'Token MFA inválido o expirado' });
    }

    if (payload.mfa !== 'pending') {
      return res.status(401).json({ success: false, message: 'Token MFA inválido' });
    }

    const user = await User.findById(payload.id).select('+mfaSecret');
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(401).json({ success: false, message: 'MFA no está activo para este usuario' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: String(code),
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Código TOTP inválido' });
    }

    const token = generateSessionToken(user._id);
    setSessionCookie(res, token);

    return res.json({
      success: true,
      message: 'Autenticación de dos factores completada',
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
      message: 'Error verificando MFA',
      error: error.message
    });
  }
};

// Helpers exportados para login (paso 1)
export const buildMfaPendingResponse = (user) => ({
  success: true,
  mfaRequired: true,
  message: 'Se requiere segundo factor (TOTP)',
  mfaToken: generateMfaPendingToken(user._id)
});
