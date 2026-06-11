const LOCAL_FRONTEND_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000'
];

export const allowedOrigins = [
  ...LOCAL_FRONTEND_ORIGINS,
  process.env.FRONTEND_URL
].filter(Boolean);

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true
};
