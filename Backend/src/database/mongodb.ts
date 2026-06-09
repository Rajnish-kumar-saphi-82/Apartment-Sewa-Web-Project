import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant.js";

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
    process.exit(1);
  }
};
