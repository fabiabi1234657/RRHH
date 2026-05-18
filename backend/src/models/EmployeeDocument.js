import mongoose from 'mongoose';

/**
 * Modelo de Documentos de Empleado.
 * Almacena metadatos; el archivo binario vive en disco (uploads/employee-documents/).
 */
const employeeDocumentSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true
    },
    // Categoría libre: contrato, cedula, hoja_vida, certificacion, habeas_data, otro
    category: {
      type: String,
      enum: ['contrato', 'cedula', 'hoja_vida', 'certificacion', 'habeas_data', 'otro'],
      default: 'otro'
    },
    // Nombre original tal como lo subió el usuario
    originalName: {
      type: String,
      required: true
    },
    // Nombre en disco (uuid o hash) — no exponer
    storedName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Para documentos con vencimiento (ej. certificación, contrato a término fijo)
    expiresAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const EmployeeDocument = mongoose.model('EmployeeDocument', employeeDocumentSchema);

export default EmployeeDocument;
