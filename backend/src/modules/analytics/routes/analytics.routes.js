import { Router } from "express";

import { authenticateOrganization } from "../../../core/middleware/authenticate-organization.middleware.js";
import { authorizeOrganization } from "../../../core/middleware/authorize-organization.middleware.js";
import { requireAdvancedFeature } from "../../../core/middleware/require-advanced-feature.middleware.js";

import {
  getAnalyticsOverviewController,
  getProfitAnalysisController,
} from "../controllers/analytics.controller.js";

const router = Router({ mergeParams: true });

// Analytics Overview
router.get(
  "/overview",
  authenticateOrganization,
  authorizeOrganization("owner", "manager"),
  getAnalyticsOverviewController,
);

// Profit Analysis
router.get(
  "/profit",
  authenticateOrganization,
  authorizeOrganization("owner", "manager"),
  requireAdvancedFeature("advanced_analytics"),
  getProfitAnalysisController,
);

export default router;
