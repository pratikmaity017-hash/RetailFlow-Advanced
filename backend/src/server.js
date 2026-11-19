import app from "./app.js";
import { env } from "./config/env.js";

import {
  connectDatabase,
  disconnectDatabase,
} from "./core/database/database.connection.js";
import { startCoreApiMonitor } from "./integration/core-api/core-api.health.js";

let server;
let isShuttingDown = false;
let retryTimer = null;

async function retryDatabaseConnection() {
  if (isShuttingDown) return;

  const connected = await connectDatabase();

  if (connected || isShuttingDown) return;

  console.log("Retrying MongoDB connection in 10 seconds...");

  retryTimer = setTimeout(() => {
    retryDatabaseConnection().catch((error) => {
      console.error("Database retry error:", error.message);
    });
  }, 10000);
}

async function startServer() {
  // Initial database connection attempt.

  const databaseConnected = await connectDatabase();

  // Start API even if MongoDB is unavailable.
  server = app.listen(env.port, () => {
    console.log(`RetailFlow Advanced API running on port ${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);

    if (!databaseConnected) {
      console.warn("API started in degraded mode. MongoDB is unavailable.");
    }
  });

  startCoreApiMonitor();

  // Retry database connection in the background.
  if (!databaseConnected) {
    await retryDatabaseConnection();
  }
}

async function shutdown(signal) {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down server...`);

  if (retryTimer) {
    clearTimeout(retryTimer);
  }

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectDatabase();

    console.log("Server shutdown completed.");
    process.exit(0);
  } catch (error) {
    console.error("Graceful shutdown failed:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch((error) => {
  console.error("Unexpected server startup error:", error);
  process.exit(1);
});
