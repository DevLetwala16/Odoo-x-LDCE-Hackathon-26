import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from server/ directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Validate that all required environment variables are set.
 * Throws if any are missing.
 */
const requiredVars = ['MONGO_URI', 'JWT_SECRET'];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    console.error(`   Copy .env.example to server/.env and fill in the values.`);
    process.exit(1);
  }
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
};
