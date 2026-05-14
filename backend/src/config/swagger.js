import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API RRHH',
      version: '1.0.0',
      description:
        'Documentacion de la API de RRHH con autenticacion JWT en cookie HTTP-only y control de roles.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor local'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Autenticacion y sesion de usuarios' },
      { name: 'Empleados', description: 'Gestion de empleados' },
      { name: 'Departamentos', description: 'Gestion de departamentos' },
      { name: 'Cargos', description: 'Gestion de cargos y posiciones' },
      { name: 'Asistencia', description: 'Control de asistencia y registros diarios' },
      { name: 'Reportes', description: 'Reportes administrativos' }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT enviado mediante cookie HTTP-only llamada token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f0a1b2c3d4e5f678901234' },
            name: { type: 'string', example: 'Juan Perez' },
            email: { type: 'string', format: 'email', example: 'juan@empresa.com' },
            role: { type: 'string', enum: ['admin', 'employee'], example: 'employee' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Department: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f0a1b2c3d4e5f678901235' },
            name: { type: 'string', example: 'Recursos Humanos' },
            description: { type: 'string', example: 'Departamento de gestion del talento humano' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-03-22T10:00:00Z' }
          }
        },
        Position: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f0a1b2c3d4e5f678901236' },
            title: { type: 'string', example: 'Analista de Nomina' },
            department: {
              oneOf: [
                { type: 'string', example: '65f0a1b2c3d4e5f678901235' },
                {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' }
                  }
                }
              ]
            },
            createdAt: { type: 'string', format: 'date-time', example: '2024-03-22T10:00:00Z' }
          }
        },
        Employee: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f0a1b2c3d4e5f678901237' },
            userId: {
              oneOf: [
                { type: 'string', example: '65f0a1b2c3d4e5f678901234' },
                {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' }
                  }
                }
              ]
            },
            position: {
              oneOf: [
                { type: 'string', example: '65f0a1b2c3d4e5f678901236' },
                {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' }
                  }
                }
              ]
            },
            department: {
              oneOf: [
                { type: 'string', example: '65f0a1b2c3d4e5f678901235' },
                {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' }
                  }
                }
              ]
            },
            hireDate: { type: 'string', format: 'date-time', example: '2024-03-22T00:00:00Z' },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-03-22T10:00:00Z' }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f0a1b2c3d4e5f678901238' },
            employeeId: { type: 'string', example: '65f0a1b2c3d4e5f678901237' },
            date: { type: 'string', format: 'date-time' },
            checkIn: { type: 'string', format: 'date-time', nullable: true },
            checkOut: { type: 'string', format: 'date-time', nullable: true },
            status: {
              type: 'string',
              enum: ['present', 'absent', 'late'],
              example: 'present'
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Juan Perez' },
            email: { type: 'string', format: 'email', example: 'juan@empresa.com' },
            password: { type: 'string', format: 'password', minLength: 6, example: 'Secreto123' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'juan@empresa.com' },
            password: { type: 'string', format: 'password', example: 'Secreto123' }
          }
        },
        CheckInRequest: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-22T00:00:00.000Z'
            },
            checkIn: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-22T08:05:00.000Z'
            },
            status: { type: 'string', enum: ['present', 'late'], example: 'present' }
          }
        },
        CheckOutRequest: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-22T00:00:00.000Z'
            },
            checkOut: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-22T17:30:00.000Z'
            }
          }
        },
        CreateEmployeeRequest: {
          type: 'object',
          required: ['userId', 'position', 'department'],
          properties: {
            userId: { type: 'string', example: '65f0a1b2c3d4e5f678901234', description: 'ID del usuario asociado' },
            position: { type: 'string', example: '65f0a1b2c3d4e5f678901236', description: 'ID del cargo' },
            department: { type: 'string', example: '65f0a1b2c3d4e5f678901235', description: 'ID del departamento' },
            hireDate: { type: 'string', format: 'date-time', example: '2024-03-22T00:00:00Z', description: 'Fecha de contratacion' },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active', description: 'Estado del empleado' }
          }
        },
        UpdateEmployeeRequest: {
          type: 'object',
          properties: {
            position: { type: 'string', example: '65f0a1b2c3d4e5f678901236', description: 'ID del cargo' },
            department: { type: 'string', example: '65f0a1b2c3d4e5f678901235', description: 'ID del departamento' },
            hireDate: { type: 'string', format: 'date-time', example: '2024-03-22T00:00:00Z', description: 'Fecha de contratacion' },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active', description: 'Estado del empleado' }
          }
        },
        CreateDepartmentRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Recursos Humanos', description: 'Nombre del departamento' },
            description: { type: 'string', example: 'Departamento de gestion del talento humano', description: 'Descripcion del departamento' }
          }
        },
        CreatePositionRequest: {
          type: 'object',
          required: ['title', 'department'],
          properties: {
            title: { type: 'string', example: 'Analista de Nomina', description: 'Titulo o nombre del cargo' },
            department: { type: 'string', example: '65f0a1b2c3d4e5f678901235', description: 'ID del departamento' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operacion realizada correctamente' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Ocurrio un error' },
            error: { type: 'string', example: 'Detalle tecnico del error' }
          }
        }
      },
      responses: {
        Ok: {
          description: 'Operacion exitosa (200)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        Created: {
          description: 'Recurso creado correctamente (201)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        BadRequest: {
          description: 'Solicitud invalida (400)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        Unauthorized: {
          description: 'No autenticado o token invalido (401)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        Forbidden: {
          description: 'No autorizado por rol (403)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado (404)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        ServerError: {
          description: 'Error interno del servidor (500)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;