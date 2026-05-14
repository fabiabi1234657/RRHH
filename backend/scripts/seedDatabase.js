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

// ─── DEPARTAMENTOS ────────────────────────────────────────────────────────────
const departmentsSeed = [
  { name: 'Tecnologia',        description: 'Equipo encargado de sistemas, soporte y desarrollo interno.' },
  { name: 'Recursos Humanos',  description: 'Gestion de talento, bienestar y procesos del personal.' },
  { name: 'Finanzas',          description: 'Control financiero, pagos y analisis presupuestal.' },
  { name: 'Operaciones',       description: 'Coordinacion de procesos y ejecucion operativa diaria.' },
  { name: 'Comercial',         description: 'Relacion con clientes, ventas y seguimiento de oportunidades.' },
  { name: 'Marketing',         description: 'Estrategia de marca, contenido digital y campanas publicitarias.' },
  { name: 'Legal',             description: 'Asesoria juridica, contratos y cumplimiento normativo.' },
  { name: 'Logistica',         description: 'Gestion de inventarios, transporte y cadena de suministro.' },
  { name: 'Atencion al Cliente', description: 'Soporte posventa, quejas y fidelizacion del cliente.' },
  { name: 'Gerencia',          description: 'Direccion estrategica y toma de decisiones corporativas.' }
];

// ─── CARGOS (3‑4 por departamento) ───────────────────────────────────────────
const positionsSeed = [
  // Tecnologia
  { title: 'Desarrollador Frontend',       department: 'Tecnologia',        salary: 4500000 },
  { title: 'Desarrollador Backend',        department: 'Tecnologia',        salary: 4800000 },
  { title: 'Ingeniero DevOps',             department: 'Tecnologia',        salary: 5200000 },
  { title: 'QA Engineer',                  department: 'Tecnologia',        salary: 3900000 },
  // Recursos Humanos
  { title: 'Analista de Talento Humano',   department: 'Recursos Humanos',  salary: 3200000 },
  { title: 'Coordinador de Bienestar',     department: 'Recursos Humanos',  salary: 3600000 },
  { title: 'Auxiliar de Nomina',           department: 'Recursos Humanos',  salary: 2600000 },
  // Finanzas
  { title: 'Auxiliar Contable',            department: 'Finanzas',          salary: 2400000 },
  { title: 'Contador Senior',              department: 'Finanzas',          salary: 4200000 },
  { title: 'Analista Financiero',          department: 'Finanzas',          salary: 3700000 },
  // Operaciones
  { title: 'Coordinador de Operaciones',   department: 'Operaciones',       salary: 3800000 },
  { title: 'Supervisor Operativo',         department: 'Operaciones',       salary: 3100000 },
  { title: 'Analista de Procesos',         department: 'Operaciones',       salary: 2900000 },
  // Comercial
  { title: 'Ejecutivo Comercial',          department: 'Comercial',         salary: 3100000 },
  { title: 'Gerente de Ventas',            department: 'Comercial',         salary: 5500000 },
  { title: 'Asesor Comercial',             department: 'Comercial',         salary: 2700000 },
  // Marketing
  { title: 'Disenador Grafico',            department: 'Marketing',         salary: 3000000 },
  { title: 'Estratega Digital',            department: 'Marketing',         salary: 3500000 },
  { title: 'Community Manager',            department: 'Marketing',         salary: 2500000 },
  // Legal
  { title: 'Abogado Corporativo',          department: 'Legal',             salary: 5000000 },
  { title: 'Asistente Legal',              department: 'Legal',             salary: 2800000 },
  // Logistica
  { title: 'Supervisor de Logistica',      department: 'Logistica',         salary: 3400000 },
  { title: 'Auxiliar de Bodega',           department: 'Logistica',         salary: 2200000 },
  { title: 'Coordinador de Inventarios',   department: 'Logistica',         salary: 3000000 },
  // Atencion al Cliente
  { title: 'Agente de Soporte',            department: 'Atencion al Cliente', salary: 2300000 },
  { title: 'Supervisor de Servicio',       department: 'Atencion al Cliente', salary: 3200000 },
  // Gerencia
  { title: 'Director General',             department: 'Gerencia',          salary: 9000000 },
  { title: 'Gerente Administrativo',       department: 'Gerencia',          salary: 7000000 }
];

// ─── USUARIOS / EMPLEADOS ─────────────────────────────────────────────────────
const usersSeed = [
  { name: 'Administrador RRHH',     email: 'admin@rrhh.com',                  role: 'admin' },
  // Tecnologia
  { name: 'Camila Torres',          email: 'camila.torres@rrhh.com',           role: 'employee', position: 'Desarrollador Frontend',       hireDate: new Date(2023, 2, 10),  status: 'active' },
  { name: 'Andres Castillo',        email: 'andres.castillo@rrhh.com',         role: 'employee', position: 'Desarrollador Backend',        hireDate: new Date(2022, 8, 5),   status: 'active' },
  { name: 'Sofia Jimenez',          email: 'sofia.jimenez@rrhh.com',           role: 'employee', position: 'Ingeniero DevOps',             hireDate: new Date(2024, 1, 20),  status: 'active' },
  { name: 'Daniel Ramirez',         email: 'daniel.ramirez@rrhh.com',          role: 'employee', position: 'QA Engineer',                  hireDate: new Date(2023, 10, 14), status: 'active' },
  // Recursos Humanos
  { name: 'Mateo Rojas',            email: 'mateo.rojas@rrhh.com',             role: 'employee', position: 'Analista de Talento Humano',   hireDate: new Date(2022, 5, 1),   status: 'active' },
  { name: 'Isabella Vargas',        email: 'isabella.vargas@rrhh.com',         role: 'employee', position: 'Coordinador de Bienestar',     hireDate: new Date(2023, 7, 22),  status: 'active' },
  { name: 'Samuel Mora',            email: 'samuel.mora@rrhh.com',             role: 'employee', position: 'Auxiliar de Nomina',           hireDate: new Date(2025, 0, 8),   status: 'active' },
  // Finanzas
  { name: 'Valentina Gomez',        email: 'valentina.gomez@rrhh.com',         role: 'employee', position: 'Auxiliar Contable',            hireDate: new Date(2023, 3, 17),  status: 'active' },
  { name: 'Felipe Ospina',          email: 'felipe.ospina@rrhh.com',           role: 'employee', position: 'Contador Senior',              hireDate: new Date(2021, 11, 1),  status: 'active' },
  { name: 'Mariana Perez',          email: 'mariana.perez@rrhh.com',           role: 'employee', position: 'Analista Financiero',          hireDate: new Date(2024, 4, 3),   status: 'active' },
  // Operaciones
  { name: 'Nicolas Herrera',        email: 'nicolas.herrera@rrhh.com',         role: 'employee', position: 'Coordinador de Operaciones',   hireDate: new Date(2022, 2, 28),  status: 'active' },
  { name: 'Alejandra Cruz',         email: 'alejandra.cruz@rrhh.com',          role: 'employee', position: 'Supervisor Operativo',         hireDate: new Date(2023, 9, 11),  status: 'active' },
  { name: 'Jorge Salcedo',          email: 'jorge.salcedo@rrhh.com',           role: 'employee', position: 'Analista de Procesos',         hireDate: new Date(2024, 6, 15),  status: 'inactive' },
  // Comercial
  { name: 'Laura Medina',           email: 'laura.medina@rrhh.com',            role: 'employee', position: 'Ejecutivo Comercial',          hireDate: new Date(2023, 1, 6),   status: 'active' },
  { name: 'Carlos Fuentes',         email: 'carlos.fuentes@rrhh.com',          role: 'employee', position: 'Gerente de Ventas',            hireDate: new Date(2020, 7, 12),  status: 'active' },
  { name: 'Paula Rios',             email: 'paula.rios@rrhh.com',              role: 'employee', position: 'Asesor Comercial',             hireDate: new Date(2025, 2, 19),  status: 'active' },
  // Marketing
  { name: 'Esteban Arango',         email: 'esteban.arango@rrhh.com',          role: 'employee', position: 'Disenador Grafico',            hireDate: new Date(2023, 5, 25),  status: 'active' },
  { name: 'Natalia Gutierrez',      email: 'natalia.gutierrez@rrhh.com',       role: 'employee', position: 'Estratega Digital',            hireDate: new Date(2022, 11, 9),  status: 'active' },
  { name: 'Tomas Cardona',          email: 'tomas.cardona@rrhh.com',           role: 'employee', position: 'Community Manager',            hireDate: new Date(2025, 3, 7),   status: 'active' },
  // Legal
  { name: 'Lucia Montoya',          email: 'lucia.montoya@rrhh.com',           role: 'employee', position: 'Abogado Corporativo',          hireDate: new Date(2021, 6, 14),  status: 'active' },
  { name: 'Ricardo Bermudez',       email: 'ricardo.bermudez@rrhh.com',        role: 'employee', position: 'Asistente Legal',              hireDate: new Date(2024, 8, 30),  status: 'active' },
  // Logistica
  { name: 'Diana Palacios',         email: 'diana.palacios@rrhh.com',          role: 'employee', position: 'Supervisor de Logistica',      hireDate: new Date(2022, 4, 18),  status: 'active' },
  { name: 'Hector Zapata',          email: 'hector.zapata@rrhh.com',           role: 'employee', position: 'Auxiliar de Bodega',           hireDate: new Date(2025, 1, 24),  status: 'active' },
  { name: 'Andrea Velasquez',       email: 'andrea.velasquez@rrhh.com',        role: 'employee', position: 'Coordinador de Inventarios',   hireDate: new Date(2023, 0, 30),  status: 'inactive' },
  // Atencion al Cliente
  { name: 'Juliana Suarez',         email: 'juliana.suarez@rrhh.com',          role: 'employee', position: 'Agente de Soporte',            hireDate: new Date(2024, 10, 5),  status: 'active' },
  { name: 'Mauricio Lozano',        email: 'mauricio.lozano@rrhh.com',         role: 'employee', position: 'Supervisor de Servicio',       hireDate: new Date(2023, 6, 3),   status: 'active' },
  // Gerencia
  { name: 'Gloria Mendez',          email: 'gloria.mendez@rrhh.com',           role: 'employee', position: 'Director General',             hireDate: new Date(2019, 3, 1),   status: 'active' },
  { name: 'Roberto Pineda',         email: 'roberto.pineda@rrhh.com',          role: 'employee', position: 'Gerente Administrativo',       hireDate: new Date(2020, 1, 15),  status: 'active' }
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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

// Devuelve todos los días laborables (lun‑vie) de un mes dado
const workdaysOfMonth = (year, month) => {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Distribución de estados: ~65% present, ~15% late, ~12% absent, ~8% justified
const STATUS_POOL = [
  ...Array(65).fill('present'),
  ...Array(15).fill('late'),
  ...Array(12).fill('absent'),
  ...Array(8).fill('justified')
];

const pickStatus = (seed) => STATUS_POOL[seed % STATUS_POOL.length];

// ─── SEED FUNCTIONS ───────────────────────────────────────────────────────────
const seedDepartments = async () => {
  const departmentMap = new Map();
  for (const dept of departmentsSeed) {
    const doc = await upsertByFilter(Department, { name: dept.name }, dept);
    departmentMap.set(dept.name, doc);
  }
  return departmentMap;
};

const seedPositions = async (departmentMap) => {
  const positionMap = new Map();
  for (const pos of positionsSeed) {
    const department = departmentMap.get(pos.department);
    const doc = await upsertByFilter(
      Position,
      { title: pos.title },
      { title: pos.title, department: department._id, salary: pos.salary ?? 0 }
    );
    positionMap.set(pos.title, doc);
  }
  return positionMap;
};

const seedEmployees = async ({ departmentMap, positionMap, userMap }) => {
  const employees = [];
  for (const userSeed of usersSeed.filter((u) => u.role === 'employee')) {
    const user = userMap.get(normalizeEmail(userSeed.email));
    const positionSeed = positionsSeed.find((p) => p.title === userSeed.position);
    const department = departmentMap.get(positionSeed.department);
    const position = positionMap.get(userSeed.position);

    const employee = await upsertByFilter(
      Employee,
      { userId: user._id },
      {
        userId: user._id,
        position: position._id,
        department: department._id,
        hireDate: userSeed.hireDate,
        status: userSeed.status
      }
    );
    employees.push(employee);
  }
  return employees;
};

/**
 * Genera 4 meses de asistencia (enero–abril 2026) para todos los empleados.
 * Solo genera registros para empleados activos.
 * Los inactivos reciben un mes reducido para que aparezcan en históricos.
 */
const seedAttendance = async (employees, userMap) => {
  const attendance = [];
  // Meses: enero(0), febrero(1), marzo(2), abril(3) de 2026
  const months = [0, 1, 2, 3];

  // Mapear employee._id → userSeed para saber el status
  const employeeUserMap = new Map();
  for (const userSeed of usersSeed.filter((u) => u.role === 'employee')) {
    const user = userMap.get(normalizeEmail(userSeed.email));
    employeeUserMap.set(String(user._id), userSeed);
  }

  for (const [empIdx, employee] of employees.entries()) {
    const userSeed = employeeUserMap.get(String(employee.userId));
    // Empleados inactivos: solo enero para tener algo en histórico
    const activeMonths = userSeed.status === 'inactive' ? [0] : months;

    for (const month of activeMonths) {
      const workdays = workdaysOfMonth(2026, month);
      for (const [dayIdx, date] of workdays.entries()) {
        const seed = empIdx * 37 + month * 23 + dayIdx * 7;
        const status = pickStatus(seed);

        const checkIn =
          status === 'absent' || status === 'justified'
            ? undefined
            : new Date(2026, month, date.getDate(), status === 'late' ? 9 : 8, (seed % 30) + 1);

        const checkOut =
          status === 'absent' || status === 'justified'
            ? undefined
            : new Date(2026, month, date.getDate(), 17, (seed % 45) + 15);

        const record = await upsertByFilter(
          Attendance,
          { employeeId: employee._id, date },
          { employeeId: employee._id, date, checkIn, checkOut, status }
        );
        attendance.push(record);
      }
    }
  }

  return attendance;
};

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI no esta definida en backend/.env');

  await mongoose.connect(mongoUri);

  const departmentMap = await seedDepartments();
  const positionMap = await seedPositions(departmentMap);

  const userMap = new Map();
  for (const userSeed of usersSeed) {
    const user = await upsertUser(userSeed);
    userMap.set(user.email, user);
  }

  const employees = await seedEmployees({ departmentMap, positionMap, userMap });
  const attendance = await seedAttendance(employees, userMap);

  const activeCount = employees.filter((_, i) => {
    const seed = usersSeed.filter((u) => u.role === 'employee')[i];
    return seed?.status === 'active';
  }).length;

  console.log('\n✅  Base de datos lista para desarrollo.');
  console.log(`   MongoDB     : ${mongoose.connection.name}`);
  console.log(`   Departamentos: ${departmentMap.size}`);
  console.log(`   Cargos       : ${positionMap.size}`);
  console.log(`   Usuarios     : ${usersSeed.length}`);
  console.log(`   Empleados    : ${employees.length} (activos: ${activeCount}, inactivos: ${employees.length - activeCount})`);
  console.log(`   Asistencias  : ${attendance.length} registros (ene–abr 2026)`);
  console.log('\n📋  Credenciales de prueba:');
  console.table(
    usersSeed.map(({ name, email, role }) => ({ name, email, role, password: PASSWORD }))
  );
};

seedDatabase()
  .catch((error) => {
    console.error(`❌  Error sembrando base de datos: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
