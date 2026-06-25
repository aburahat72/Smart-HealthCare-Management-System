//For Production
import mongoose from 'mongoose';

const mongoOptions = {
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_TIMEOUT_MS) || 10000,
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is missing. Add it to backend/.env or your online hosting environment variables.');
    }

    const conn = await mongoose.connect(mongoUri, mongoOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

// Simple connection for testing locally
// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export default connectDB;

