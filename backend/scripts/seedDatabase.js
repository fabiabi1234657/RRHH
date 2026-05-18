import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import Attendance from '../src/models/Attendance.js';
import Department from '../src/models/Department.js';
import Employee   from '../src/models/Employee.js';
import Position   from '../src/models/Position.js';
import User       from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PASSWORD = process.env.SEED_PASSWORD || 'Password123';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const D = (y, m, d) => new Date(y, m, d);
const addMonths = (date, n) => { const r = new Date(date); r.setMonth(r.getMonth() + n); return r; };
const normalizeEmail = (email) => email.trim().toLowerCase();

const workdaysOfMonth = (year, month) => {
  const days = [];
  const cur  = new Date(year, month, 1);
  while (cur.getMonth() === month) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

const STATUS_POOL = [
  ...Array(65).fill('present'),
  ...Array(15).fill('late'),
  ...Array(12).fill('absent'),
  ...Array(8).fill('justified'),
];
const pickStatus = (seed) => STATUS_POOL[seed % STATUS_POOL.length];

const upsertUser = async ({ name, email, role }) => {
  const e = normalizeEmail(email);
  let user = await User.findOne({ email: e }).select('+password');
  if (!user) { user = new User({ name, email: e, password: PASSWORD, role }); }
  else { user.name = name; user.email = e; user.password = PASSWORD; user.role = role; }
  await user.save();
  return user;
};

const upsertByFilter = async (Model, filter, values) => {
  let doc = await Model.findOne(filter);
  if (!doc) { doc = new Model(values); }
  else { Object.assign(doc, values); }
  await doc.save();
  return doc;
};

// ─── CATÁLOGOS ────────────────────────────────────────────────────────────────
const departmentsSeed = [
  { name: 'Tecnologia',          description: 'Sistemas, soporte y desarrollo interno.' },
  { name: 'Recursos Humanos',    description: 'Gestion de talento, bienestar y nomina.' },
  { name: 'Finanzas',            description: 'Control financiero, pagos y presupuesto.' },
  { name: 'Operaciones',         description: 'Procesos y ejecucion operativa diaria.' },
  { name: 'Comercial',           description: 'Ventas, clientes y oportunidades de negocio.' },
  { name: 'Marketing',           description: 'Marca, contenido digital y campanas.' },
  { name: 'Legal',               description: 'Asesoria juridica, contratos y cumplimiento.' },
  { name: 'Logistica',           description: 'Inventarios, transporte y cadena de suministro.' },
  { name: 'Atencion al Cliente', description: 'Soporte posventa y fidelizacion.' },
  { name: 'Gerencia',            description: 'Direccion estrategica corporativa.' },
];

const positionsSeed = [
  // Tecnologia
  { title: 'Desarrollador Frontend',      department: 'Tecnologia',          salary: 4500000 },
  { title: 'Desarrollador Backend',       department: 'Tecnologia',          salary: 4800000 },
  { title: 'Ingeniero DevOps',            department: 'Tecnologia',          salary: 5200000 },
  { title: 'QA Engineer',                 department: 'Tecnologia',          salary: 3900000 },
  { title: 'Arquitecto de Software',      department: 'Tecnologia',          salary: 7500000 },
  // Recursos Humanos
  { title: 'Analista de Talento Humano',  department: 'Recursos Humanos',    salary: 3200000 },
  { title: 'Coordinador de Bienestar',    department: 'Recursos Humanos',    salary: 3600000 },
  { title: 'Auxiliar de Nomina',          department: 'Recursos Humanos',    salary: 2600000 },
  // Finanzas
  { title: 'Auxiliar Contable',           department: 'Finanzas',            salary: 2400000 },
  { title: 'Contador Senior',             department: 'Finanzas',            salary: 4200000 },
  { title: 'Analista Financiero',         department: 'Finanzas',            salary: 3700000 },
  { title: 'Analista BI',                 department: 'Finanzas',            salary: 4000000 },
  // Operaciones
  { title: 'Coordinador de Operaciones',  department: 'Operaciones',         salary: 3800000 },
  { title: 'Supervisor Operativo',        department: 'Operaciones',         salary: 3100000 },
  { title: 'Analista de Procesos',        department: 'Operaciones',         salary: 2900000 },
  // Comercial
  { title: 'Ejecutivo Comercial',         department: 'Comercial',           salary: 3100000 },
  { title: 'Gerente de Ventas',           department: 'Comercial',           salary: 5500000 },
  { title: 'Asesor Comercial',            department: 'Comercial',           salary: 2700000 },
  // Marketing
  { title: 'Disenador Grafico',           department: 'Marketing',           salary: 3000000 },
  { title: 'Estratega Digital',           department: 'Marketing',           salary: 3500000 },
  { title: 'Community Manager',           department: 'Marketing',           salary: 2500000 },
  { title: 'Jefe de Producto',            department: 'Marketing',           salary: 4800000 },
  // Legal
  { title: 'Abogado Corporativo',         department: 'Legal',               salary: 5000000 },
  { title: 'Asistente Legal',             department: 'Legal',               salary: 2800000 },
  { title: 'Director Juridico',           department: 'Legal',               salary: 8000000 },
  // Logistica
  { title: 'Supervisor de Logistica',     department: 'Logistica',           salary: 3400000 },
  { title: 'Auxiliar de Bodega',          department: 'Logistica',           salary: 2200000 },
  { title: 'Coordinador de Inventarios',  department: 'Logistica',           salary: 3000000 },
  // Atencion al Cliente
  { title: 'Agente de Soporte',           department: 'Atencion al Cliente', salary: 2300000 },
  { title: 'Supervisor de Servicio',      department: 'Atencion al Cliente', salary: 3200000 },
  // Gerencia
  { title: 'Director General',            department: 'Gerencia',            salary: 9000000 },
  { title: 'Gerente Administrativo',      department: 'Gerencia',            salary: 7000000 },
];

// ─── USUARIOS / EMPLEADOS ─────────────────────────────────────────────────────
// Campos extra: contractEndDate (null=indefinido), trialMonths, policySignedDelay (días; null=no firmó)
const usersSeed = [
  // ── ADMIN ───────────────────────────────────────────────────────────────────
  { name: 'Administrador RRHH', email: 'admin@rrhh.com', role: 'admin' },

  // ── TECNOLOGIA (10) ─────────────────────────────────────────────────────────
  { name: 'Camila Torres',    email: 'camila.torres@rrhh.com',    role: 'employee', position: 'Desarrollador Frontend',    hireDate: D(2023,2,10),  status: 'active',   contractEndDate: D(2026,5,10),  trialMonths: 2, policySignedDelay: 14  },
  { name: 'Andres Castillo',  email: 'andres.castillo@rrhh.com',  role: 'employee', position: 'Desarrollador Backend',    hireDate: D(2022,8,5),   status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 10  },
  { name: 'Sofia Jimenez',    email: 'sofia.jimenez@rrhh.com',    role: 'employee', position: 'Ingeniero DevOps',          hireDate: D(2024,1,20),  status: 'active',   contractEndDate: D(2026,7,20),  trialMonths: 2, policySignedDelay: 7   },
  { name: 'Daniel Ramirez',   email: 'daniel.ramirez@rrhh.com',   role: 'employee', position: 'QA Engineer',              hireDate: D(2023,10,14), status: 'active',   contractEndDate: D(2026,4,30),  trialMonths: 2, policySignedDelay: null },
  { name: 'Ana Restrepo',     email: 'ana.restrepo@rrhh.com',     role: 'employee', position: 'Desarrollador Frontend',   hireDate: D(2023,5,15),  status: 'active',   contractEndDate: D(2026,5,20),  trialMonths: 2, policySignedDelay: 12  },
  { name: 'Julian Cano',      email: 'julian.cano@rrhh.com',      role: 'employee', position: 'Desarrollador Backend',    hireDate: D(2024,3,1),   status: 'active',   contractEndDate: D(2026,8,1),   trialMonths: 2, policySignedDelay: 8   },
  { name: 'Monica Sandoval',  email: 'monica.sandoval@rrhh.com',  role: 'employee', position: 'QA Engineer',              hireDate: D(2025,0,15),  status: 'active',   contractEndDate: D(2027,0,15),  trialMonths: 2, policySignedDelay: null },
  { name: 'David Oquendo',    email: 'david.oquendo@rrhh.com',    role: 'employee', position: 'Ingeniero DevOps',          hireDate: D(2024,9,1),   status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 5   },
  { name: 'Paola Echeverri',  email: 'paola.echeverri@rrhh.com',  role: 'employee', position: 'Desarrollador Frontend',   hireDate: D(2026,1,10),  status: 'active',   contractEndDate: D(2027,1,10),  trialMonths: 3, policySignedDelay: null },
  { name: 'Carlos Murillo',   email: 'carlos.murillo@rrhh.com',   role: 'employee', position: 'Arquitecto de Software',  hireDate: D(2023,0,3),   status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 20  },

  // ── RECURSOS HUMANOS (7) ────────────────────────────────────────────────────
  { name: 'Mateo Rojas',       email: 'mateo.rojas@rrhh.com',      role: 'employee', position: 'Analista de Talento Humano', hireDate: D(2022,5,1),   status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 9   },
  { name: 'Isabella Vargas',   email: 'isabella.vargas@rrhh.com',  role: 'employee', position: 'Coordinador de Bienestar', hireDate: D(2023,7,22),  status: 'active',   contractEndDate: D(2026,5,22),  trialMonths: 2, policySignedDelay: 15  },
  { name: 'Samuel Mora',       email: 'samuel.mora@rrhh.com',      role: 'employee', position: 'Auxiliar de Nomina',       hireDate: D(2025,0,8),   status: 'active',   contractEndDate: D(2026,6,8),   trialMonths: 2, policySignedDelay: null },
  { name: 'Alejandro Giraldo', email: 'alejandro.giraldo@rrhh.com',role: 'employee', position: 'Analista de Talento Humano', hireDate: D(2023,4,20),  status: 'active',   contractEndDate: D(2026,5,25),  trialMonths: 2, policySignedDelay: 18  },
  { name: 'Catalina Mejia',    email: 'catalina.mejia@rrhh.com',   role: 'employee', position: 'Coordinador de Bienestar', hireDate: D(2024,2,11),  status: 'active',   contractEndDate: D(2026,8,11),  trialMonths: 2, policySignedDelay: 6   },
  { name: 'Sergio Castano',    email: 'sergio.castano@rrhh.com',   role: 'employee', position: 'Auxiliar de Nomina',       hireDate: D(2025,7,1),   status: 'active',   contractEndDate: D(2027,1,1),   trialMonths: 2, policySignedDelay: null },
  { name: 'Vanesa Londono',    email: 'vanesa.londono@rrhh.com',   role: 'employee', position: 'Analista de Talento Humano', hireDate: D(2026,0,5),   status: 'active',   contractEndDate: D(2026,6,5),   trialMonths: 2, policySignedDelay: null },

  // ── FINANZAS (8) ────────────────────────────────────────────────────────────
  { name: 'Valentina Gomez',  email: 'valentina.gomez@rrhh.com',  role: 'employee', position: 'Auxiliar Contable',        hireDate: D(2023,3,17),  status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 11  },
  { name: 'Felipe Ospina',    email: 'felipe.ospina@rrhh.com',    role: 'employee', position: 'Contador Senior',          hireDate: D(2021,11,1),  status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 8   },
  { name: 'Mariana Perez',    email: 'mariana.perez@rrhh.com',    role: 'employee', position: 'Analista Financiero',      hireDate: D(2024,4,3),   status: 'active',   contractEndDate: D(2027,4,3),   trialMonths: 2, policySignedDelay: 5   },
  { name: 'Claudia Velez',    email: 'claudia.velez@rrhh.com',    role: 'employee', position: 'Auxiliar Contable',        hireDate: D(2023,8,12),  status: 'active',   contractEndDate: D(2026,5,12),  trialMonths: 2, policySignedDelay: 14  },
  { name: 'Mario Sanchez',    email: 'mario.sanchez@rrhh.com',    role: 'employee', position: 'Contador Senior',          hireDate: D(2024,1,5),   status: 'active',   contractEndDate: D(2026,5,5),   trialMonths: 2, policySignedDelay: null },
  { name: 'Patricia Morales', email: 'patricia.morales@rrhh.com', role: 'employee', position: 'Analista Financiero',      hireDate: D(2025,3,20),  status: 'active',   contractEndDate: D(2027,3,20),  trialMonths: 2, policySignedDelay: 9   },
  { name: 'Luis Arboleda',    email: 'luis.arboleda@rrhh.com',    role: 'employee', position: 'Analista BI',             hireDate: D(2023,11,4),  status: 'active',   contractEndDate: D(2025,11,4),  trialMonths: 2, policySignedDelay: 7   },
  { name: 'Sandra Quintero',  email: 'sandra.quintero@rrhh.com',  role: 'employee', position: 'Auxiliar Contable',        hireDate: D(2026,2,1),   status: 'active',   contractEndDate: D(2027,2,1),   trialMonths: 2, policySignedDelay: null },

  // ── OPERACIONES (7) ─────────────────────────────────────────────────────────
  { name: 'Nicolas Herrera',  email: 'nicolas.herrera@rrhh.com',  role: 'employee', position: 'Coordinador de Operaciones', hireDate: D(2022,2,28),  status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 10  },
  { name: 'Alejandra Cruz',   email: 'alejandra.cruz@rrhh.com',   role: 'employee', position: 'Supervisor Operativo',     hireDate: D(2023,9,11),  status: 'active',   contractEndDate: D(2026,5,11),  trialMonths: 2, policySignedDelay: 13  },
  { name: 'Jorge Salcedo',    email: 'jorge.salcedo@rrhh.com',    role: 'employee', position: 'Analista de Procesos',     hireDate: D(2024,6,15),  status: 'inactive', contractEndDate: D(2026,6,15),  trialMonths: 2, policySignedDelay: null },
  { name: 'Henry Botero',     email: 'henry.botero@rrhh.com',     role: 'employee', position: 'Supervisor Operativo',     hireDate: D(2023,3,8),   status: 'active',   contractEndDate: D(2026,5,2),   trialMonths: 2, policySignedDelay: 16  },
  { name: 'Yulieth Alzate',   email: 'yulieth.alzate@rrhh.com',   role: 'employee', position: 'Analista de Procesos',     hireDate: D(2024,10,1),  status: 'active',   contractEndDate: D(2026,9,1),   trialMonths: 2, policySignedDelay: null },
  { name: 'German Toro',      email: 'german.toro@rrhh.com',      role: 'employee', position: 'Coordinador de Operaciones', hireDate: D(2025,5,16),  status: 'active',   contractEndDate: D(2026,5,20),  trialMonths: 2, policySignedDelay: 4   },
  { name: 'Adriana Florez',   email: 'adriana.florez@rrhh.com',   role: 'employee', position: 'Supervisor Operativo',     hireDate: D(2026,1,3),   status: 'active',   contractEndDate: D(2027,7,3),   trialMonths: 3, policySignedDelay: null },

  // ── COMERCIAL (7) ───────────────────────────────────────────────────────────
  { name: 'Laura Medina',     email: 'laura.medina@rrhh.com',     role: 'employee', position: 'Ejecutivo Comercial',      hireDate: D(2023,1,6),   status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 12  },
  { name: 'Carlos Fuentes',   email: 'carlos.fuentes@rrhh.com',   role: 'employee', position: 'Gerente de Ventas',        hireDate: D(2020,7,12),  status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 8   },
  { name: 'Paula Rios',       email: 'paula.rios@rrhh.com',       role: 'employee', position: 'Asesor Comercial',         hireDate: D(2025,2,19),  status: 'active',   contractEndDate: D(2026,8,19),  trialMonths: 2, policySignedDelay: 5   },
  { name: 'Diana Cardenas',   email: 'diana.cardenas@rrhh.com',   role: 'employee', position: 'Ejecutivo Comercial',      hireDate: D(2023,7,14),  status: 'active',   contractEndDate: D(2026,5,30),  trialMonths: 2, policySignedDelay: 20  },
  { name: 'Miguel Suarez',    email: 'miguel.suarez@rrhh.com',    role: 'employee', position: 'Asesor Comercial',         hireDate: D(2024,0,22),  status: 'active',   contractEndDate: D(2026,7,22),  trialMonths: 2, policySignedDelay: null },
  { name: 'Claudia Romero',   email: 'claudia.romero@rrhh.com',   role: 'employee', position: 'Ejecutivo Comercial',      hireDate: D(2025,5,1),   status: 'active',   contractEndDate: D(2027,5,1),   trialMonths: 2, policySignedDelay: null },
  { name: 'William Acosta',   email: 'william.acosta@rrhh.com',   role: 'employee', position: 'Asesor Comercial',         hireDate: D(2026,2,10),  status: 'active',   contractEndDate: D(2027,8,10),  trialMonths: 2, policySignedDelay: null },

  // ── MARKETING (8) ───────────────────────────────────────────────────────────
  { name: 'Esteban Arango',   email: 'esteban.arango@rrhh.com',   role: 'employee', position: 'Disenador Grafico',        hireDate: D(2023,5,25),  status: 'active',   contractEndDate: D(2026,5,25),  trialMonths: 2, policySignedDelay: 11  },
  { name: 'Natalia Gutierrez',email: 'natalia.gutierrez@rrhh.com',role: 'employee', position: 'Estratega Digital',        hireDate: D(2022,11,9),  status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 7   },
  { name: 'Tomas Cardona',    email: 'tomas.cardona@rrhh.com',    role: 'employee', position: 'Community Manager',        hireDate: D(2025,3,7),   status: 'active',   contractEndDate: D(2027,3,7),   trialMonths: 2, policySignedDelay: 9   },
  { name: 'Camilo Ruiz',      email: 'camilo.ruiz@rrhh.com',      role: 'employee', position: 'Disenador Grafico',        hireDate: D(2023,9,18),  status: 'active',   contractEndDate: D(2026,5,18),  trialMonths: 2, policySignedDelay: 15  },
  { name: 'Lina Garzon',      email: 'lina.garzon@rrhh.com',      role: 'employee', position: 'Community Manager',        hireDate: D(2024,6,1),   status: 'active',   contractEndDate: D(2026,6,1),   trialMonths: 2, policySignedDelay: null },
  { name: 'Oscar Betancur',   email: 'oscar.betancur@rrhh.com',   role: 'employee', position: 'Estratega Digital',        hireDate: D(2025,1,14),  status: 'active',   contractEndDate: D(2027,1,14),  trialMonths: 2, policySignedDelay: 6   },
  { name: 'Maria Paez',       email: 'maria.paez@rrhh.com',       role: 'employee', position: 'Jefe de Producto',         hireDate: D(2023,2,6),   status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 14  },
  { name: 'Simon Vargas',     email: 'simon.vargas@rrhh.com',     role: 'employee', position: 'Estratega Digital',        hireDate: D(2024,10,20), status: 'active',   contractEndDate: D(2026,5,28),  trialMonths: 2, policySignedDelay: null },

  // ── LEGAL (6) ───────────────────────────────────────────────────────────────
  { name: 'Lucia Montoya',    email: 'lucia.montoya@rrhh.com',    role: 'employee', position: 'Abogado Corporativo',      hireDate: D(2021,6,14),  status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 8   },
  { name: 'Ricardo Bermudez', email: 'ricardo.bermudez@rrhh.com', role: 'employee', position: 'Asistente Legal',          hireDate: D(2024,8,30),  status: 'active',   contractEndDate: D(2026,8,30),  trialMonths: 2, policySignedDelay: 5   },
  { name: 'Alberto Parra',    email: 'alberto.parra@rrhh.com',    role: 'employee', position: 'Abogado Corporativo',      hireDate: D(2023,6,10),  status: 'active',   contractEndDate: D(2026,6,10),  trialMonths: 2, policySignedDelay: 12  },
  { name: 'Carolina Vasquez', email: 'carolina.vasquez@rrhh.com', role: 'employee', position: 'Asistente Legal',          hireDate: D(2025,2,3),   status: 'active',   contractEndDate: D(2026,5,3),   trialMonths: 2, policySignedDelay: null },
  { name: 'Felipe Granados',  email: 'felipe.granados@rrhh.com',  role: 'employee', position: 'Abogado Corporativo',      hireDate: D(2024,11,1),  status: 'active',   contractEndDate: D(2026,5,10),  trialMonths: 2, policySignedDelay: 10  },
  { name: 'Liliana Orozco',   email: 'liliana.orozco@rrhh.com',   role: 'employee', position: 'Director Juridico',        hireDate: D(2023,0,9),   status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 6   },

  // ── LOGISTICA (8) ───────────────────────────────────────────────────────────
  { name: 'Diana Palacios',   email: 'diana.palacios@rrhh.com',   role: 'employee', position: 'Supervisor de Logistica',  hireDate: D(2022,4,18),  status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 9   },
  { name: 'Hector Zapata',    email: 'hector.zapata@rrhh.com',    role: 'employee', position: 'Auxiliar de Bodega',       hireDate: D(2025,1,24),  status: 'active',   contractEndDate: D(2026,7,24),  trialMonths: 2, policySignedDelay: 7   },
  { name: 'Andrea Velasquez', email: 'andrea.velasquez@rrhh.com', role: 'employee', position: 'Coordinador de Inventarios', hireDate: D(2023,0,30), status: 'inactive', contractEndDate: D(2026,0,30),  trialMonths: 2, policySignedDelay: null },
  { name: 'Gustavo Arbelaez', email: 'gustavo.arbelaez@rrhh.com', role: 'employee', position: 'Supervisor de Logistica',  hireDate: D(2023,10,7),  status: 'active',   contractEndDate: D(2026,5,7),   trialMonths: 2, policySignedDelay: 13  },
  { name: 'Nancy Reyes',      email: 'nancy.reyes@rrhh.com',      role: 'employee', position: 'Auxiliar de Bodega',       hireDate: D(2024,8,15),  status: 'active',   contractEndDate: D(2026,8,15),  trialMonths: 2, policySignedDelay: null },
  { name: 'Pilar Moncada',    email: 'pilar.moncada@rrhh.com',    role: 'employee', position: 'Coordinador de Inventarios', hireDate: D(2025,4,26), status: 'active',   contractEndDate: D(2027,4,26),  trialMonths: 2, policySignedDelay: 8   },
  { name: 'Jaime Cifuentes',  email: 'jaime.cifuentes@rrhh.com',  role: 'employee', position: 'Auxiliar de Bodega',       hireDate: D(2026,1,17),  status: 'active',   contractEndDate: D(2027,7,17),  trialMonths: 3, policySignedDelay: null },
  { name: 'Yaneth Correa',    email: 'yaneth.correa@rrhh.com',    role: 'employee', position: 'Supervisor de Logistica',  hireDate: D(2023,3,22),  status: 'active',   contractEndDate: D(2026,5,22),  trialMonths: 2, policySignedDelay: 11  },

  // ── ATENCION AL CLIENTE (8) ─────────────────────────────────────────────────
  { name: 'Juliana Suarez',   email: 'juliana.suarez@rrhh.com',   role: 'employee', position: 'Agente de Soporte',        hireDate: D(2024,10,5),  status: 'active',   contractEndDate: D(2026,9,5),   trialMonths: 2, policySignedDelay: 8   },
  { name: 'Mauricio Lozano',  email: 'mauricio.lozano@rrhh.com',  role: 'employee', position: 'Supervisor de Servicio',   hireDate: D(2023,6,3),   status: 'active',   contractEndDate: D(2026,6,3),   trialMonths: 2, policySignedDelay: 10  },
  { name: 'Deisy Cordoba',    email: 'deisy.cordoba@rrhh.com',    role: 'employee', position: 'Agente de Soporte',        hireDate: D(2023,4,15),  status: 'active',   contractEndDate: D(2026,5,15),  trialMonths: 2, policySignedDelay: 6   },
  { name: 'Harold Pena',      email: 'harold.pena@rrhh.com',      role: 'employee', position: 'Supervisor de Servicio',   hireDate: D(2024,2,4),   status: 'active',   contractEndDate: D(2026,5,25),  trialMonths: 2, policySignedDelay: null },
  { name: 'Marisol Guerrero', email: 'marisol.guerrero@rrhh.com', role: 'employee', position: 'Agente de Soporte',        hireDate: D(2025,8,12),  status: 'active',   contractEndDate: D(2027,2,12),  trialMonths: 2, policySignedDelay: null },
  { name: 'Victor Lopez',     email: 'victor.lopez@rrhh.com',     role: 'employee', position: 'Agente de Soporte',        hireDate: D(2026,0,13),  status: 'active',   contractEndDate: D(2027,6,13),  trialMonths: 2, policySignedDelay: null },
  { name: 'Alba Cifuentes',   email: 'alba.cifuentes@rrhh.com',   role: 'employee', position: 'Supervisor de Servicio',   hireDate: D(2023,11,18), status: 'active',   contractEndDate: D(2026,5,14),  trialMonths: 2, policySignedDelay: 5   },
  { name: 'Fernanda Ortega',  email: 'fernanda.ortega@rrhh.com',  role: 'employee', position: 'Agente de Soporte',        hireDate: D(2025,6,21),  status: 'active',   contractEndDate: D(2027,0,21),  trialMonths: 2, policySignedDelay: null },

  // ── GERENCIA (2) ────────────────────────────────────────────────────────────
  { name: 'Gloria Mendez',    email: 'gloria.mendez@rrhh.com',    role: 'employee', position: 'Director General',         hireDate: D(2019,3,1),   status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 5   },
  { name: 'Roberto Pineda',   email: 'roberto.pineda@rrhh.com',   role: 'employee', position: 'Gerente Administrativo',   hireDate: D(2020,1,15),  status: 'active',   contractEndDate: null,           trialMonths: 2, policySignedDelay: 7   },
];

// ─── SEED FUNCTIONS ───────────────────────────────────────────────────────────
const seedDepartments = async () => {
  const map = new Map();
  for (const dept of departmentsSeed) {
    const doc = await upsertByFilter(Department, { name: dept.name }, dept);
    map.set(dept.name, doc);
  }
  return map;
};

const seedPositions = async (deptMap) => {
  const map = new Map();
  for (const pos of positionsSeed) {
    const dept = deptMap.get(pos.department);
    const doc  = await upsertByFilter(
      Position,
      { title: pos.title },
      { title: pos.title, department: dept._id, salary: pos.salary ?? 0 },
    );
    map.set(pos.title, doc);
  }
  return map;
};

const seedEmployees = async ({ deptMap, posMap, userMap }) => {
  const entries = [];
  const empSeeds = usersSeed.filter((u) => u.role === 'employee');

  for (const seed of empSeeds) {
    const user    = userMap.get(normalizeEmail(seed.email));
    const posSeed = positionsSeed.find((p) => p.title === seed.position);
    const dept    = deptMap.get(posSeed.department);
    const pos     = posMap.get(seed.position);

    const trialEndDate       = addMonths(seed.hireDate, seed.trialMonths ?? 2);
    const dataPolicySignedAt = seed.policySignedDelay != null
      ? new Date(seed.hireDate.getTime() + seed.policySignedDelay * 86400000)
      : null;

    const emp = await upsertByFilter(
      Employee,
      { userId: user._id },
      {
        userId:             user._id,
        position:           pos._id,
        department:         dept._id,
        hireDate:           seed.hireDate,
        status:             seed.status,
        trialEndDate,
        contractEndDate:    seed.contractEndDate ?? null,
        dataPolicySignedAt,
      },
    );
    entries.push({ emp, seed });
  }
  return entries;
};

/**
 * Genera asistencia ene-2023 → abr-2026 para cada empleado desde su hireDate.
 * Inactivos cubren hasta dic-2025. Usa insertMany en lotes para mayor rendimiento.
 */
const seedAttendance = async (empEntries) => {
  await Attendance.deleteMany({});

  const BATCH  = 3000;
  const buffer = [];
  let   total  = 0;

  const flush = async () => {
    if (!buffer.length) return;
    await Attendance.insertMany(buffer, { ordered: false });
    total += buffer.length;
    buffer.length = 0;
  };

  const GLOBAL_START = new Date(2023, 0, 1);
  const GLOBAL_END   = { year: 2026, month: 3 };

  for (const [empIdx, { emp, seed }] of empEntries.entries()) {
    const endMo    = seed.status === 'inactive' ? { year: 2025, month: 11 } : GLOBAL_END;
    const startD   = seed.hireDate > GLOBAL_START ? seed.hireDate : GLOBAL_START;

    let cy = startD.getFullYear();
    let cm = startD.getMonth();

    while (cy < endMo.year || (cy === endMo.year && cm <= endMo.month)) {
      const workdays = workdaysOfMonth(cy, cm).filter((d) => d >= startD);

      for (const [di, date] of workdays.entries()) {
        const rng    = (empIdx * 7919 + cm * 317 + di * 53) % 100;
        const status = pickStatus(rng);
        const absent = status === 'absent' || status === 'justified';

        const checkIn  = absent ? undefined
          : new Date(cy, cm, date.getDate(), status === 'late' ? 9 + (rng % 2) : 8, (rng * 3) % 59 + 1);
        const checkOut = absent ? undefined
          : new Date(cy, cm, date.getDate(), 17, (rng * 7) % 45 + 10);

        buffer.push({ employeeId: emp._id, date, checkIn, checkOut, status });
        if (buffer.length >= BATCH) await flush();
      }

      cm++;
      if (cm > 11) { cm = 0; cy++; }
    }
  }

  await flush();
  return total;
};

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────
const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI no esta definida en backend/.env');

  await mongoose.connect(mongoUri);
  console.log('Conectado a MongoDB. Sembrando datos…\n');

  const deptMap = await seedDepartments();
  const posMap  = await seedPositions(deptMap);

  const userMap = new Map();
  for (const s of usersSeed) {
    const u = await upsertUser(s);
    userMap.set(u.email, u);
  }

  const empEntries = await seedEmployees({ deptMap, posMap, userMap });
  const attTotal   = await seedAttendance(empEntries);

  const empSeeds  = usersSeed.filter((u) => u.role === 'employee');
  const activos   = empSeeds.filter((u) => u.status === 'active').length;
  const inactivos = empSeeds.filter((u) => u.status !== 'active').length;

  console.log('✅  Base de datos lista.');
  console.log(`   MongoDB       : ${mongoose.connection.name}`);
  console.log(`   Departamentos : ${deptMap.size}`);
  console.log(`   Cargos        : ${posMap.size}`);
  console.log(`   Usuarios      : ${usersSeed.length} (1 admin + ${empSeeds.length} empleados)`);
  console.log(`   Empleados     : ${empEntries.length} (activos: ${activos}, inactivos: ${inactivos})`);
  console.log(`   Asistencias   : ${attTotal.toLocaleString()} registros (ene-2023 → abr-2026)`);
  console.log('\n📋  Credenciales (password: ' + PASSWORD + ')');
  console.table(
    usersSeed.slice(0, 10).map(({ name, email, role }) => ({ name, email, role })),
  );
  console.log(`   ... y ${usersSeed.length - 10} usuarios más con el mismo patrón de email.`);
};

seedDatabase()
  .catch((err) => {
    console.error('❌  Error sembrando base de datos:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

