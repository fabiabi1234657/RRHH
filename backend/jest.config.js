export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/routes/authRoutes.js',
    'src/routes/attendanceRoutes.js',
    'src/routes/reportRoutes.js',
    'src/middlewares/**/*.js',
    'src/models/User.js',
    'src/models/Employee.js',
    'src/models/Department.js',
    'src/models/Position.js',
    'src/models/Attendance.js'
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  },
  testTimeout: 30000,
  verbose: true
};
