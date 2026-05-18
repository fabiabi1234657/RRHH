import express from 'express';
import {
  upload,
  subirDocumento,
  listarDocumentos,
  descargarDocumento,
  eliminarDocumento
} from '../controllers/documentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/empleados/{employeeId}/documents:
 *   get:
 *     summary: Listar documentos de un empleado
 *     tags: [Documentos]
 *     security:
 *       - cookieAuth: []
 *   post:
 *     summary: Subir un documento para el empleado (multipart/form-data)
 *     tags: [Documentos]
 *     security:
 *       - cookieAuth: []
 */
router.get(
  '/empleados/:employeeId/documents',
  protect,
  authorize('admin'),
  listarDocumentos
);

router.post(
  '/empleados/:employeeId/documents',
  protect,
  authorize('admin'),
  upload.single('file'),
  subirDocumento
);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   get:
 *     summary: Descargar el archivo de un documento
 *   delete:
 *     summary: Eliminar un documento (admin)
 */
router.get(
  '/documents/:documentId',
  protect,
  authorize('admin'),
  descargarDocumento
);

router.delete(
  '/documents/:documentId',
  protect,
  authorize('admin'),
  eliminarDocumento
);

export default router;
