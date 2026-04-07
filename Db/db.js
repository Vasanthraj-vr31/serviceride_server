import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const connectDb = async () => {
   try {
      await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/ServiceRide');
      console.log("Database connected successfully");
   } catch (err) {
      console.error("Database connection failed:", err);
      process.exit(1);
   }
}

export default connectDb;