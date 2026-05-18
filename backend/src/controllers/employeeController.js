import Employee from '../models/Employee.js';

// Obtener todos los empleados
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'name email role')
      .populate('department', 'name description')
      .populate('position', 'title');

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleados',
      error: error.message
    });
  }
};

// Obtener empleado por ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('department', 'name description')
      .populate('position', 'title');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleado',
      error: error.message
    });
  }
};

// Crear nuevo empleado
export const createEmployee = async (req, res) => {
  try {
    const {
      userId,
      position,
      department,
      hireDate,
      status,
      trialEndDate,
      contractEndDate,
      dataPolicySignedAt
    } = req.body;

    const employee = new Employee({
      userId,
      position,
      department,
      hireDate: hireDate || new Date(),
      status: status || 'active',
      trialEndDate: trialEndDate || null,
      contractEndDate: contractEndDate || null,
      dataPolicySignedAt: dataPolicySignedAt || null
    });

    await employee.save();

    await employee.populate('userId', 'name email role');
    await employee.populate('department', 'name description');
    await employee.populate('position', 'title');

    res.status(201).json({
      success: true,
      message: 'Empleado creado correctamente',
      employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear empleado',
      error: error.message
    });
  }
};

// Actualizar empleado
export const updateEmployee = async (req, res) => {
  try {
    const {
      position,
      department,
      hireDate,
      status,
      trialEndDate,
      contractEndDate,
      dataPolicySignedAt
    } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        ...(position && { position }),
        ...(department && { department }),
        ...(hireDate && { hireDate }),
        ...(status && { status }),
        ...(trialEndDate !== undefined && { trialEndDate: trialEndDate || null }),
        ...(contractEndDate !== undefined && { contractEndDate: contractEndDate || null }),
        ...(dataPolicySignedAt !== undefined && { dataPolicySignedAt: dataPolicySignedAt || null })
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email role')
      .populate('department', 'name description')
      .populate('position', 'title');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Empleado actualizado correctamente',
      employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar empleado',
      error: error.message
    });
  }
};

// Eliminar empleado
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Empleado eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar empleado',
      error: error.message
    });
  }
};
