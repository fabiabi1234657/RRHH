import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

const startOfDay = (dateValue) => {
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const endOfDay = (dateValue) => {
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

const getEmployeeFromSession = async (userId) => {
  return Employee.findOne({ userId })
    .populate('userId', 'name email role')
    .populate('position', 'title')
    .populate('department', 'name');
};

export const checkIn = async (req, res) => {
  try {
    const employee = await getEmployeeFromSession(req.user.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No existe perfil de empleado para este usuario'
      });
    }

    const now = new Date();
    const attendanceDate = startOfDay(req.body?.date || now);
    const checkInTime = req.body?.checkIn ? new Date(req.body.checkIn) : now;

    if (Number.isNaN(attendanceDate.getTime()) || Number.isNaN(checkInTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida para registrar entrada'
      });
    }

    const existingAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date: attendanceDate
    });

    if (existingAttendance?.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'La entrada ya fue registrada para esta fecha'
      });
    }

    const status = req.body?.status === 'late' ? 'late' : 'present';

    const attendance = existingAttendance
      ? await Attendance.findByIdAndUpdate(
          existingAttendance._id,
          { checkIn: checkInTime, status },
          { new: true, runValidators: true }
        )
      : await Attendance.create({
          employeeId: employee._id,
          date: attendanceDate,
          checkIn: checkInTime,
          status
        });

    const result = await Attendance.findById(attendance._id)
      .populate({
        path: 'employeeId',
        populate: [
          { path: 'userId', select: 'name email role' },
          { path: 'position', select: 'title' },
          { path: 'department', select: 'name' }
        ]
      });

    return res.status(201).json({
      success: true,
      message: 'Entrada registrada correctamente',
      attendance: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error registrando entrada',
      error: error.message
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const employee = await getEmployeeFromSession(req.user.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No existe perfil de empleado para este usuario'
      });
    }

    const now = new Date();
    const attendanceDate = startOfDay(req.body?.date || now);
    const checkOutTime = req.body?.checkOut ? new Date(req.body.checkOut) : now;

    if (Number.isNaN(attendanceDate.getTime()) || Number.isNaN(checkOutTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida para registrar salida'
      });
    }

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: attendanceDate
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No hay registro de entrada para esta fecha'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'La salida ya fue registrada para esta fecha'
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No puedes registrar salida sin una entrada previa'
      });
    }

    const updated = await Attendance.findByIdAndUpdate(
      attendance._id,
      { checkOut: checkOutTime },
      { new: true, runValidators: true }
    ).populate({
      path: 'employeeId',
      populate: [
        { path: 'userId', select: 'name email role' },
        { path: 'position', select: 'title' },
        { path: 'department', select: 'name' }
      ]
    });

    return res.json({
      success: true,
      message: 'Salida registrada correctamente',
      attendance: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error registrando salida',
      error: error.message
    });
  }
};

export const getByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de empleado inválido'
      });
    }

    const attendance = await Attendance.find({ employeeId })
      .sort({ date: -1 })
      .populate({
        path: 'employeeId',
        populate: [
          { path: 'userId', select: 'name email role' },
          { path: 'position', select: 'title' },
          { path: 'department', select: 'name' }
        ]
      });

    return res.json({
      success: true,
      total: attendance.length,
      attendance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error obteniendo asistencia por empleado',
      error: error.message
    });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const employee = await getEmployeeFromSession(req.user.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No existe perfil de empleado para este usuario'
      });
    }

    const attendance = await Attendance.find({ employeeId: employee._id })
      .sort({ date: -1 })
      .populate({
        path: 'employeeId',
        populate: [
          { path: 'userId', select: 'name email role' },
          { path: 'position', select: 'title' },
          { path: 'department', select: 'name' }
        ]
      });

    return res.json({
      success: true,
      employee,
      total: attendance.length,
      attendance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error obteniendo tu asistencia',
      error: error.message
    });
  }
};

export const getByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida. Usa formato YYYY-MM-DD'
      });
    }

    const attendance = await Attendance.find({
      date: {
        $gte: startOfDay(parsedDate),
        $lte: endOfDay(parsedDate)
      }
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'employeeId',
        populate: [
          { path: 'userId', select: 'name email role' },
          { path: 'position', select: 'title' },
          { path: 'department', select: 'name' }
        ]
      });

    return res.json({
      success: true,
      date: startOfDay(parsedDate),
      total: attendance.length,
      attendance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error obteniendo asistencia por fecha',
      error: error.message
    });
  }
};
