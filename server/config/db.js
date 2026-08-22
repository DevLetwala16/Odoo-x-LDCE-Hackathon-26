import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the MONGO_URI environment variable.
 * Retries up to 5 times before exiting.
 */
export const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // 10s to find a server
        connectTimeoutMS: 15000,         // 15s to establish connection
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection error (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) {
        const wait = attempt * 2000; // 2s, 4s, 6s, 8s back-off
        console.log(`⏳ Retrying in ${wait / 1000}s...`);
        await new Promise(res => setTimeout(res, wait));
      } else {
        console.error('🚫 All connection attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
};
