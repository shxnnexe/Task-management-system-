import mongoose from "mongoose";

export const connectToDatabase = async (uri) => {
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(uri);
};
