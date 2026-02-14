import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Err : ${error.message}`);
    } else {
      console.log(`Unknown Error ${error}`);
    }
    process.exit(1);
  }
};

export default connectDB;
