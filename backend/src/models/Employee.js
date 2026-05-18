import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
      required: [true, 'Por favor asigna un cargo']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Por favor asigna un departamento']
    },
    hireDate: {
      type: Date,
      required: [true, 'Por favor ingresa la fecha de contratación'],
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    // === Campos para gestión documental y legal ===
    // Fin del periodo de prueba (alerta antes de vencer)
    trialEndDate: {
      type: Date,
      default: null
    },
    // Fin de contrato (alerta antes de vencer)
    contractEndDate: {
      type: Date,
      default: null
    },
    // Fecha de firma de política de Habeas Data
    // null = pendiente de firma
    dataPolicySignedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
