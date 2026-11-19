import { CoreApiError } from "../../integration/core-api/core-api.client.js";

const VALID_ROLES = ["owner", "manager", "sales_staff"];

export function authorizeOrganization(...allowedRoles) {
  if (allowedRoles.length === 0) {
    throw new Error("At least one allowed role must be specified.");
  }

  for (const role of allowedRoles) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Invalid organization role: ${role}`);
    }
  }

  return function (req, res, next) {
    try {
      if (!req.membership?.role) {
        throw new CoreApiError(
          "Organization membership is required.",
          403,
          "MEMBERSHIP_CONTEXT_REQUIRED",
        );
      }

      const userRole = req.membership.role;

      if (!allowedRoles.includes(userRole)) {
        throw new CoreApiError(
          "You do not have permission to perform this action.",
          403,
          "INSUFFICIENT_ORGANIZATION_ROLE",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
