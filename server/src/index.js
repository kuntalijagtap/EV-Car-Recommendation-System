import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { getJwtSecret } from './config/jwt.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  getJwtSecret();
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 EVora Server listening on http://localhost:${PORT}`);
    console.log(`🌐 Health check at http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((error) => {
  console.error(`❌ Server startup failed: ${error.message}`);
  process.exit(1);
});
