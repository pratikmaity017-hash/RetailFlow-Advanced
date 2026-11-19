import { Router } from "express";

import { authenticateOrganization } from "../../../core/middleware/authenticate-organization.middleware.js";

import { getIntegrationTest } from "../controllers/integration-test.controller.js";
import { authorizeOrganization } from "../../../core/middleware/authorize-organization.middleware.js";

const router = Router();

router.get(
  "/:organizationId/integration-check",
  authenticateOrganization,
  getIntegrationTest,
);

router.get(
  "/:organizationId/owner-check",
  authenticateOrganization,
  authorizeOrganization("owner"),
  getIntegrationTest,
);

export default router;
