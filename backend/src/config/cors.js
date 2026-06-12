const LOCAL_FRONTEND_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000'
];

const normalizeOrigin = (origin) => origin?.trim().replace(/\/$/, '');

export const allowedOrigins = [
  ...LOCAL_FRONTEND_ORIGINS,
  process.env.FRONTEND_URL
].filter(Boolean).map(normalizeOrigin);

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true
};
