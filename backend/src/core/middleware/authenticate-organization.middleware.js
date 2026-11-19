import { CoreApiError } from "../../integration/core-api/core-api.client.js";

import { verifyOrganizationContext } from "../../integration/organization-context/organization-context.service.js";

export async function authenticateOrganization(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new CoreApiError(
        "Authentication token is required.",
        401,
        "AUTH_TOKEN_REQUIRED",
      );
    }

    const match = authorization.match(/^Bearer\s+(.+)$/i);
    const accessToken = match?.[1]?.trim();

    if (!accessToken) {
      throw new CoreApiError(
        "A valid Bearer token is required.",
        401,
        "INVALID_AUTHORIZATION_HEADER",
      );
    }

    const organizationId = req.params.organizationId;

    if (!organizationId) {
      throw new CoreApiError(
        "Organization ID is required in the request URL.",
        400,
        "ORGANIZATION_ID_REQUIRED",
      );
    }

    const context = await verifyOrganizationContext({
      organizationId,
      accessToken,
    });

    // Attach only Core-verified information.
    req.auth = {
      userId: context.user.id,
      sessionId: context.user.sessionId,
    };
    req.coreAccessToken = accessToken;
    req.organization = context.organization;
    req.membership = context.membership;

    next();
  } catch (error) {
    next(error);
  }
}
