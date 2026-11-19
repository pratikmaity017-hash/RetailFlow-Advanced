import { CoreApiError } from "../../integration/core-api/core-api.client.js";

import { verifyAdvancedFeatureEntitlement } from "../../integration/subscription-entitlement/subscription-entitlement.service.js";

export function requireAdvancedFeature(featureCode) {
  if (
    typeof featureCode !== "string" ||
    !/^[a-z0-9_-]{2,100}$/.test(featureCode)
  ) {
    throw new Error("A valid feature code is required.");
  }

  return async function (req, res, next) {
    try {
      if (!req.organization?.id) {
        throw new CoreApiError(
          "Organization context is required.",
          403,
          "ORGANIZATION_CONTEXT_REQUIRED",
        );
      }

      if (!req.coreAccessToken) {
        throw new CoreApiError(
          "Core authentication token is required.",
          401,
          "AUTH_TOKEN_REQUIRED",
        );
      }

      const entitlement = await verifyAdvancedFeatureEntitlement({
        organizationId: req.organization.id,
        accessToken: req.coreAccessToken,
        featureCode,
      });

      req.feature = entitlement;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
