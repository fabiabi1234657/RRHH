import './src/config/env.js';
import connectDB from './src/config/database.js';
import app from './src/app.js';

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n Servidor iniciado en puerto ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Swagger API Docs: http://localhost:${PORT}/api-docs`);
  console.log('\nPara desarrollar usar: npm run dev\n');
});
