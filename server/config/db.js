import mongoose from 'mongoose';
import dns from 'dns';

// Use public DNS servers for SRV record resolution (fixes Atlas on restrictive networks)
dns.setServers(['1.1.1.1', '8.8.8.8']);

/**
 * Connect to MongoDB using the MONGO_URI environment variable.
 * Exits the process on connection failure.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
