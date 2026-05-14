import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import Attendance from '../src/models/Attendance.js';
import Department from '../src/models/Department.js';
import Employee from '../src/models/Employee.js';
import Position from '../src/models/Position.js';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PASSWORD = process.env.SEED_PASSWORD || 'Password123';

const departmentsSeed = [
  {
    name: 'Tecnologia',
    description: 'Equipo encargado de sistemas, soporte y desarrollo interno.'
  },
  {
    name: 'Recursos Humanos',
    description: 'Gestion de talento, bienestar y procesos del personal.'
  },
  {
    name: 'Finanzas',
    description: 'Control financiero, pagos y analisis presupuestal.'
  },
  {
    name: 'Operaciones',
    description: 'Coordinacion de procesos y ejecucion operativa diaria.'
  },
  {
    name: 'Comercial',
    description: 'Relacion con clientes, ventas y seguimiento de oportunidades.'
  }
];

const positionsSeed = [
  {
    title: 'Desarrollador Frontend',
    department: 'Tecnologia',
    description: 'Construccion de interfaces y experiencia de usuario.',
    salary: 4500000
  },
  {
    title: 'Analista de Talento Humano',
    department: 'Recursos Humanos',
    description: 'Apoyo en seleccion, vinculacion y bienestar laboral.',
    salary: 3200000
  },
  {
    title: 'Auxiliar Contable',
    department: 'Finanzas',
    description: 'Registro contable, conciliaciones y soporte a tesoreria.',
    salary: 2400000
  },
  {
    title: 'Coordinador de Operaciones',
    department: 'Operaciones',
    description: 'Seguimiento de procesos, recursos y cumplimiento operativo.',
    salary: 3800000
  },
  {
    title: 'Ejecutivo Comercial',
    department: 'Comercial',
    description: 'Gestion de oportunidades, clientes y pipeline comercial.',
    salary: 3100000
  }
];

const usersSeed = [
  {
    name: 'Administrador RRHH',
    email: 'admin@rrhh.com',
    role: 'admin'
  },
  {
    name: 'Camila Torres',
    email: 'camila.torres@rrhh.com',
    role: 'employee',
    position: 'Desarrollador Frontend'
  },
  {
    name: 'Mateo Rojas',
    email: 'mateo.rojas@rrhh.com',
    role: 'employee',
    position: 'Analista de Talento Humano'
  },
  {
    name: 'Valentina Gomez',
    email: 'valentina.gomez@rrhh.com',
    role: 'employee',
    position: 'Auxiliar Contable'
  },
  {
    name: 'Nicolas Herrera',
    email: 'nicolas.herrera@rrhh.com',
    role: 'employee',
    position: 'Coordinador de Operaciones'
  },
  {
    name: 'Laura Medina',
    email: 'laura.medina@rrhh.com',
    role: 'employee',
    position: 'Ejecutivo Comercial'
  }
];

const normalizeEmail = (email) => email.trim().toLowerCase();

const upsertUser = async ({ name, email, role }) => {
  const normalizedEmail = normalizeEmail(email);
  let user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    user = new User({ name, email: normalizedEmail, password: PASSWORD, role });
  } else {
    user.name = name;
    user.email = normalizedEmail;
    user.password = PASSWORD;
    user.role = role;
  }

  await user.save();
  return user;
};

const upsertByFilter = async (Model, filter, values) => {
  let document = await Model.findOne(filter);

  if (!document) {
    document = new Model(values);
  } else {
    Object.assign(document, values);
  }

  await document.save();
  return document;
};

const seedDepartments = async () => {
  const departmentMap = new Map();

  for (const department of departmentsSeed) {
    const rrhhDepartment = await upsertByFilter(Department, { name: department.name }, department);
    departmentMap.set(department.name, rrhhDepartment);
  }

  return departmentMap;
};

const seedPositions = async (departmentMap) => {
  const positionMap = new Map();

  for (const position of positionsSeed) {
    const department = departmentMap.get(position.department);

    const rrhhPosition = await upsertByFilter(
      Position,
      { title: position.title },
      {
        title: position.title,
        department: department._id
      }
    );

    positionMap.set(position.title, rrhhPosition);
  }

  return positionMap;
};

const seedEmployees = async ({ departmentMap, positionMap, userMap }) => {
  const employees = [];

  for (const userSeed of usersSeed.filter((user) => user.role === 'employee')) {
    const user = userMap.get(normalizeEmail(userSeed.email));
    const positionSeed = positionsSeed.find((position) => position.title === userSeed.position);
    const department = departmentMap.get(positionSeed.department);
    const position = positionMap.get(userSeed.position);

    const employee = await upsertByFilter(
      Employee,
      { userId: user._id },
      {
        userId: user._id,
        position: position._id,
        department: department._id,
        hireDate: new Date(2026, 0, 15),
        status: 'active'
      }
    );

    employees.push(employee);
  }

  return employees;
};

const seedAttendance = async (employees) => {
  const statuses = ['present', 'present', 'late', 'present', 'absent'];
  const attendance = [];

  for (const [employeeIndex, employee] of employees.entries()) {
    for (let day = 1; day <= 5; day += 1) {
      const status = statuses[(employeeIndex + day - 1) % statuses.length];
      const date = new Date(2026, 4, day);
      const checkIn = status === 'absent' ? undefined : new Date(2026, 4, day, status === 'late' ? 9 : 8, 15);
      const checkOut = status === 'absent' ? undefined : new Date(2026, 4, day, 17, 30);

      const attendanceRecord = await upsertByFilter(
        Attendance,
        { employeeId: employee._id, date },
        {
          employeeId: employee._id,
          date,
          checkIn,
          checkOut,
          status
        }
      );

      attendance.push(attendanceRecord);
    }
  }

  return attendance;
};

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI no esta definida en backend/.env');
  }

  await mongoose.connect(mongoUri);

  const departmentMap = await seedDepartments();
  const positionMap = await seedPositions(departmentMap);

  const userMap = new Map();
  for (const userSeed of usersSeed) {
    const user = await upsertUser(userSeed);
    userMap.set(user.email, user);
  }

  const employees = await seedEmployees({ departmentMap, positionMap, userMap });
  const attendance = await seedAttendance(employees);

  console.log('\nBase de datos lista para desarrollo.');
  console.log(`MongoDB: ${mongoose.connection.name}`);
  console.log(`Usuarios: ${usersSeed.length}`);
  console.log(`Departamentos: ${departmentMap.size}`);
  console.log(`Cargos: ${positionMap.size}`);
  console.log(`Empleados: ${employees.length}`);
  console.log(`Asistencias: ${attendance.length}`);
  console.log('\nCredenciales de prueba:');
  console.table(
    usersSeed.map(({ name, email, role }) => ({
      name,
      email,
      role,
      password: PASSWORD
    }))
  );
};

seedDatabase()
  .catch((error) => {
    console.error(`Error sembrando base de datos: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
