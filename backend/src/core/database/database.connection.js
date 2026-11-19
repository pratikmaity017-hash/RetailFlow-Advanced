import mongoose from "mongoose";
import { env } from "../../config/env.js";
import dotenv from "dotenv";

let isConnecting = false;

export async function connectDatabase() {
  // Reload .env before every retry in development.
  if (env.nodeEnv === "development") {
    dotenv.config({ override: true, quiet: true });
  }

  const currentMongoUri = process.env.MONGODB_URI?.trim();

  if (!currentMongoUri) {
    console.error("MongoDB URI is missing.");
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  isConnecting = true;

  try {
    await mongoose.connect(currentMongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return false;
  } finally {
    isConnecting = false;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  console.log("MongoDB disconnected.");
}

export function getDatabaseStatus() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  const state = mongoose.connection.readyState;

  return {
    configured: env.dependencies.mongodbConfigured,
    connected: state === 1,
    state: states[state] ?? "unknown",
  };
}
