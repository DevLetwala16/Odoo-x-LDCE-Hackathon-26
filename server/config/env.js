import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try loading server/.env first, then root/.env, then fallback
const serverEnvPath = path.resolve(__dirname, '..', '.env');
const rootEnvPath = path.resolve(__dirname, '..', '..', '.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

// Fallback defaults so the project works immediately on clone on any teammate's machine
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb+srv://Dev_letwala_Softcap:Dev_mongodb0716@softcapdev.puzklaw.mongodb.net/Musafir?retryWrites=true&w=majority';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'musafir-dev-secret-key-change-in-production-2026';
}

if (!process.env.PORT) {
  process.env.PORT = '5000';
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
