process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-for-local-and-ci';
process.env.FRONTEND_URL ||= 'http://localhost:5173';
process.env.MONGO_URI_TEST ||= 'mongodb://127.0.0.1:27017/rrhh_test';
