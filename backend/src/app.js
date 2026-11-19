import express from "express";

import healthRoutes from "./modules/health/routes/health.routes.js";
import integrationTestRoutes from "./modules/health/routes/integration-test.routes.js";
import analyticsRoutes from "./modules/analytics/routes/analytics.routes.js";

import { notFoundHandler } from "./core/middleware/not-found.middleware.js";
import { errorHandler } from "./core/middleware/error.middleware.js";

const app = express();

// Global middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Module routes
app.use("/health", healthRoutes);

app.use("/api/v1/advanced/organizations", integrationTestRoutes);

app.use(
  "/api/v1/advanced/organizations/:organizationId/analytics",
  analyticsRoutes,
);

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
