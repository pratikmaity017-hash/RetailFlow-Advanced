import { Router } from "express";

import { authenticateOrganization } from "../../../core/middleware/authenticate-organization.middleware.js";
import { authorizeOrganization } from "../../../core/middleware/authorize-organization.middleware.js";

import { getAnalyticsOverviewController } from "../controllers/analytics.controller.js";

const router = Router({ mergeParams: true });

router.get(
  "/overview",
  authenticateOrganization,
  authorizeOrganization("owner", "manager"),
  getAnalyticsOverviewController,
);

export default router;
