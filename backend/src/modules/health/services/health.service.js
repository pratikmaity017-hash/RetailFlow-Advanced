import { env } from "../../../config/env.js";
import { getDatabaseStatus } from "../../../core/database/database.connection.js";
import { getCoreApiStatus } from "../../../integration/core-api/core-api.health.js";

export function getHealthStatus() {
  const database = getDatabaseStatus();
  const coreApi = getCoreApiStatus();

  return {
    status: "ok",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: database,
      coreApi,
    },
  };
}

export function getReadinessStatus() {
  const database = getDatabaseStatus();

  return {
    status: database.connected ? "ready" : "not_ready",
    database,
  };
}
