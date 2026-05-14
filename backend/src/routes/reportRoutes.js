import express from 'express';
import {
  getMonthlyAttendanceReport,
  getHeadcountReport,
  getEmployeeSummary,
  getAttendanceTrend
} from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Todas las rutas de reportes requieren autenticación + rol de admin
router.use(protect);
router.use(authorize('admin'));

// Reporte de asistencia mensual
/**
 * @swagger
 * /api/reports/attendance/monthly:
 *   get:
 *     summary: Obtener reporte mensual de asistencia
 *     tags: [Reportes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mes numerico (1-12)
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *         description: Ano del reporte
 *     responses:
 *       200:
 *         description: Reporte mensual generado
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
 *                 month:
 *                   type: integer
 *                 year:
 *                   type: integer
 *                 totalEmployees:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       employeeId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       position:
 *                         type: string
 *                       department:
 *                         type: string
 *                       present:
 *                         type: integer
 *                       absent:
 *                         type: integer
 *                       late:
 *                         type: integer
 *                       totalDays:
 *                         type: integer
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
router.get('/attendance/monthly', getMonthlyAttendanceReport);

// Reporte de cantidad de empleados por departamento
/**
 * @swagger
 * /api/reports/headcount:
 *   get:
 *     summary: Obtener headcount por departamento
 *     tags: [Reportes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Reporte de cantidad de empleados por departamento
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
 *                 totalEmployees:
 *                   type: integer
 *                 departments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       departmentId:
 *                         type: string
 *                       departmentName:
 *                         type: string
 *                       headcount:
 *                         type: integer
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
router.get('/headcount', getHeadcountReport);

// Resumen individual del empleado
/**
 * @swagger
 * /api/reports/employee/{employeeId}/summary:
 *   get:
 *     summary: Obtener resumen individual de empleado
 *     tags: [Reportes]
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
 *         description: Resumen del empleado
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
 *                 employee:
 *                   type: object
 *                   properties:
 *                     employeeId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     position:
 *                       type: string
 *                     department:
 *                       type: string
 *                     hireDate:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                     currentMonthAttendance:
 *                       type: object
 *                       properties:
 *                         present:
 *                           type: integer
 *                         absent:
 *                           type: integer
 *                         late:
 *                           type: integer
 *                         total:
 *                           type: integer
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
router.get('/employee/:employeeId/summary', getEmployeeSummary);

// Tendencia de asistencia mensual (últimos N meses)
router.get('/attendance/trend', getAttendanceTrend);

export default router;
