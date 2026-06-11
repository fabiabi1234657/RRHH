import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import EmployeeDocument from '../models/EmployeeDocument.js';
import Employee from '../models/Employee.js';

// Carpeta de uploads (montada como volumen en docker-compose)
const uploadDir = path.resolve(process.cwd(), 'uploads', 'employee-documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer con storage en disco
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const random = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${random}${ext}`);
  }
});

// Tipos MIME permitidos (PDF + imágenes + documentos office comunes)
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Límite 10 MB
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ===== Controllers =====

export const subirDocumento = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: 'ID de empleado inválido' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      // Limpiar archivo huérfano
      try { fs.unlinkSync(req.file.path); } catch { /* noop */ }
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    const doc = await EmployeeDocument.create({
      employeeId,
      category: req.body.category || 'otro',
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      description: req.body.description || '',
      uploadedBy: req.user.id,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null
    });

    return res.status(201).json({
      success: true,
      message: 'Documento subido correctamente',
      document: doc
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error subiendo documento',
      error: error.message
    });
  }
};

export const listarDocumentos = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ success: false, message: 'ID de empleado inválido' });
    }

    const docs = await EmployeeDocument.find({ employeeId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');

    return res.json({ success: true, total: docs.length, documents: docs });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error obteniendo documentos',
      error: error.message
    });
  }
};

export const descargarDocumento = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ success: false, message: 'ID de documento inválido' });
    }

    const doc = await EmployeeDocument.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado' });
    }

    const filePath = path.join(uploadDir, doc.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo físico no encontrado' });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(doc.originalName)}"`
    );
    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error descargando documento',
      error: error.message
    });
  }
};

export const eliminarDocumento = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ success: false, message: 'ID de documento inválido' });
    }

    const doc = await EmployeeDocument.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado' });
    }

    const filePath = path.join(uploadDir, doc.storedName);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch { /* noop */ }
    }
    await doc.deleteOne();

    return res.json({ success: true, message: 'Documento eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error eliminando documento',
      error: error.message
    });
  }
};
