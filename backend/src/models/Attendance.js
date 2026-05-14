import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Por favor especifica el empleado']
    },
    date: {
      type: Date,
      required: [true, 'Por favor ingresa la fecha']
    },
    checkIn: {
      type: Date
    },
    checkOut: {
      type: Date
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'justified'],
      required: [true, 'Por favor especifica el estado']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Índice compuesto para evitar duplicados de asistencia en el mismo día
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
