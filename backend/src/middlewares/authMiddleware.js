import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Este middleware protege las rutas privadas
// Lo usamos en cualquier ruta que necesite que el usuario esté autenticado
export const protect = async (req, res, next) => {
  try {
    // Obtener el token de la cookie
    const token = req.cookies.token;

    // Validar que exista el token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token, acceso denegado'
      });
    }

    // Verificar y decodificar el token
    // Si el token es válido, obtenemos los datos del usuario
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('role');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o sesión inválida'
      });
    }

    // Guardar el ID y rol para que los usen otros middlewares/controladores
    req.user = {
      id: decoded.id,
      role: user.role
    };

    // Permitir que continue a la siguiente función
    next();
  } catch (_error) {
    // El token no es válido, expiró, o algo salió mal
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Alias para admin (para comodidad)
export const admin = protect;
