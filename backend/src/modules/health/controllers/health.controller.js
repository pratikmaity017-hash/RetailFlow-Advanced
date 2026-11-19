import {
  getHealthStatus,
  getReadinessStatus,
} from "../services/health.service.js";

export function getHealth(req, res) {
  res.status(200).json({
    success: true,
    data: getHealthStatus(),
  });
}

export function getReadiness(req, res) {
  const readiness = getReadinessStatus();

  res.status(readiness.status === "ready" ? 200 : 503).json({
    success: readiness.status === "ready",
    data: readiness,
  });
}
