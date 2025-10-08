import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI as string;
  console.log("Connecting to MongoDB...");
  try {
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined");
    }

    const conn = await mongoose.connect(mongoURI);

    console.log("--------------------------------");
    console.log("✅ MongoDB connected successfully");
    console.log(`- Host: ${conn.connection.host}`);
    console.log(`- Port: ${conn.connection.port}`);
    console.log(`- Name: ${conn.connection.name}`);
    console.log("--------------------------------");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
