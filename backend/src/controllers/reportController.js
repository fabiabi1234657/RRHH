import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Department from '../models/Department.js';

// GET /api/reports/attendance/monthly?month=3&year=2024
// Retorna asistencia mensual de todos los empleados
export const getMonthlyAttendanceReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validar que se proporcione month y year
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona "month" y "year" como parámetros de query'
      });
    }

    // Validar que sean números válidos
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12 || yearNum < 2000) {
      return res.status(400).json({
        success: false,
        message: 'Month debe ser 1-12 y year debe ser un año válido'
      });
    }

    // Crear rango de fechas para el mes especificado
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    // Obtener todos los empleados activos
    const employees = await Employee.find({ status: 'active' })
      .populate('userId', 'name email')
      .populate('department', 'name')
      .populate('position', 'title')
      .sort({ hireDate: -1 });

    // Para cada empleado, obtener su asistencia del mes
    const report = await Promise.all(
      employees.map(async (employee) => {
        const attendance = await Attendance.find({
          employeeId: employee._id,
          date: { $gte: startDate, $lte: endDate }
        });

        // Contar por estado
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const late = attendance.filter(a => a.status === 'late').length;
        return {
          employeeId: employee._id,
          name: employee.userId?.name,
          email: employee.userId?.email,
          position: employee.position?.title,
          department: employee.department?.name,
          present,
          absent,
          late,
          totalDays: attendance.length
        };
      })
    );

    return res.json({
      success: true,
      message: `Reporte de asistencia para ${monthNum}/${yearNum}`,
      month: monthNum,
      year: yearNum,
      totalEmployees: report.length,
      data: report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generando reporte de asistencia mensual',
      error: error.message
    });
  }
};

// GET /api/reports/headcount
// Retorna total de empleados activos agrupados por departamento
export const getHeadcountReport = async (req, res) => {
  try {
    // Obtener todos los departamentos con sus empleados activos
    const departments = await Department.find().sort({ name: 1 });

    const report = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({
          department: dept._id,
          status: 'active'
        });

        return {
          departmentId: dept._id,
          departmentName: dept.name,
          headcount: employeeCount
        };
      })
    );

    // Filtrar solo departamentos que tienen empleados
    const departmentsWithEmployees = report.filter(d => d.headcount > 0);
    const totalEmployees = departmentsWithEmployees.reduce((sum, d) => sum + d.headcount, 0);

    return res.json({
      success: true,
      message: 'Reporte de cantidad de empleados por departamento',
      totalEmployees,
      departments: departmentsWithEmployees
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generando reporte de cantidad de empleados',
      error: error.message
    });
  }
};

// GET /api/reports/employee/:employeeId/summary
// Retorna resumen individual del empleado
export const getEmployeeSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Validar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de empleado inválido'
      });
    }

    // Obtener el empleado
    const employee = await Employee.findById(employeeId)
      .populate('userId', 'name email')
      .populate('department', 'name')
      .populate('position', 'title');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    // Obtener asistencia del mes actual
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyAttendance = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Contar por estado
    const present = monthlyAttendance.filter(a => a.status === 'present').length;
    const absent = monthlyAttendance.filter(a => a.status === 'absent').length;
    const late = monthlyAttendance.filter(a => a.status === 'late').length;
    return res.json({
      success: true,
      message: 'Resumen del empleado',
      employee: {
        employeeId: employee._id,
        name: employee.userId?.name,
        email: employee.userId?.email,
        position: employee.position?.title,
        department: employee.department?.name,
        hireDate: employee.hireDate,
        status: employee.status,
        currentMonthAttendance: {
          present,
          absent,
          late,
          total: monthlyAttendance.length
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generando resumen del empleado',
      error: error.message
    });
  }
};

// GET /api/reports/attendance/trend?months=5
// Retorna resumen de asistencia de los últimos N meses para gráficas de tendencia
export const getAttendanceTrend = async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months) || 5, 1), 12);
    const now = new Date();
    const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const records = await Attendance.find({ date: { $gte: start, $lte: end } });
      const present   = records.filter(r => r.status === 'present').length;
      const late      = records.filter(r => r.status === 'late').length;
      const absent    = records.filter(r => r.status === 'absent').length;
      const justified = records.filter(r => r.status === 'justified').length;
      const total     = records.length;

      result.push({
        month:     d.getMonth() + 1,
        year:      d.getFullYear(),
        label:     MESES_ES[d.getMonth()],
        present,
        late,
        absent,
        justified,
        total,
        rate: total ? Math.round(((present + justified) / total) * 100) : 0,
      });
    }

    return res.json({ success: true, trend: result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generando tendencia de asistencia',
      error: error.message,
    });
  }
};

// GET /api/reports/alerts?days=30
// Retorna alertas de RRHH: contratos próximos a vencer, periodos de prueba a punto
// de terminar, y empleados sin firmar política de Habeas Data.
export const getAlerts = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const now = new Date();
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const employees = await Employee.find({ status: 'active' })
      .populate('userId', 'name email')
      .populate('department', 'name')
      .populate('position', 'title')
      .lean();

    const daysBetween = (date) => {
      if (!date) return null;
      const diff = new Date(date).getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const severity = (d) => {
      if (d === null) return null;
      if (d < 0) return 'expired';
      if (d <= 7) return 'critical';
      if (d <= 30) return 'warning';
      return 'info';
    };

    const contracts = [];
    const trials = [];
    const policies = [];

    employees.forEach((emp) => {
      const base = {
        employeeId: emp._id,
        name: emp.userId?.name || 'Sin nombre',
        email: emp.userId?.email || '',
        position: emp.position?.title || '',
        department: emp.department?.name || ''
      };

      if (emp.contractEndDate && new Date(emp.contractEndDate) <= limit) {
        const d = daysBetween(emp.contractEndDate);
        contracts.push({
          ...base,
          type: 'contract',
          date: emp.contractEndDate,
          daysLeft: d,
          severity: severity(d)
        });
      }

      if (emp.trialEndDate && new Date(emp.trialEndDate) <= limit) {
        const d = daysBetween(emp.trialEndDate);
        trials.push({
          ...base,
          type: 'trial',
          date: emp.trialEndDate,
          daysLeft: d,
          severity: severity(d)
        });
      }

      if (!emp.dataPolicySignedAt) {
        policies.push({
          ...base,
          type: 'habeas_data',
          date: null,
          daysLeft: null,
          severity: 'warning'
        });
      }
    });

    return res.json({
      success: true,
      windowDays: days,
      totals: {
        contracts: contracts.length,
        trials: trials.length,
        policies: policies.length
      },
      alerts: { contracts, trials, policies }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error generando alertas',
      error: error.message
    });
  }
};
