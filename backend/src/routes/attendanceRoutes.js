import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getByEmployee,
  getByDate
} from '../controllers/attendanceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Endpoints para empleado autenticado
/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: Registrar entrada del empleado autenticado
 *     tags: [Asistencia]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckInRequest'
 *     responses:
 *       201:
 *         description: Entrada registrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       200:
 *         $ref: '#/components/responses/Ok'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/checkin', protect, authorize('employee', 'admin'), checkIn);

/**
 * @swagger
 * /api/attendance/checkout:
 *   put:
 *     summary: Registrar salida del empleado autenticado
 *     tags: [Asistencia]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckOutRequest'
 *     responses:
 *       200:
 *         description: Salida registrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       201:
 *         $ref: '#/components/responses/Created'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/checkout', protect, authorize('employee', 'admin'), checkOut);

router.get('/me', protect, authorize('employee', 'admin'), getMyAttendance);

// Endpoints administrativos
/**
 * @swagger
 * /api/attendance/date/{date}:
 *   get:
 *     summary: Listar asistencias por fecha
 *     tags: [Asistencia]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Fecha en formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Asistencias de la fecha indicada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 total:
 *                   type: number
 *                 attendance:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 *       201:
 *         $ref: '#/components/responses/Created'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/date/:date', protect, authorize('admin'), getByDate);

/**
 * @swagger
 * /api/attendance/{employeeId}:
 *   get:
 *     summary: Listar asistencias por empleado
 *     tags: [Attendance]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del empleado
 *     responses:
 *       200:
 *         description: Asistencias del empleado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: number
 *                 attendance:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 *       201:
 *         $ref: '#/components/responses/Created'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:employeeId', protect, authorize('admin'), getByEmployee);

export default router;
