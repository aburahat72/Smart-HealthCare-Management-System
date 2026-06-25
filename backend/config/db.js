import mongoose from 'mongoose';

const mongoOptions = {
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_TIMEOUT_MS) || 10000,
};

let connectionPromise = null;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    if (connectionPromise) return connectionPromise;

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is missing. Add it to backend/.env or your online hosting environment variables.');
    }

    connectionPromise = mongoose.connect(mongoUri, mongoOptions);
    const conn = await connectionPromise;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    connectionPromise = null;
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;

