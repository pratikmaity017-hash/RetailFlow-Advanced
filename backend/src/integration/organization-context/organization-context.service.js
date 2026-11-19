import { requestCoreApi, CoreApiError } from "../core-api/core-api.client.js";

export async function verifyOrganizationContext({
  organizationId,
  accessToken,
}) {
  if (!organizationId) {
    throw new CoreApiError(
      "Organization ID is required.",
      400,
      "ORGANIZATION_ID_REQUIRED",
    );
  }

  if (!accessToken) {
    throw new CoreApiError(
      "Access token is required.",
      401,
      "AUTH_TOKEN_REQUIRED",
    );
  }

  // 1. Verify the authenticated user through Core.
  const userResponse = await requestCoreApi("/api/auth/me", {
    token: accessToken,
    method: "GET",
  });

  if (!userResponse.ok) {
    if (userResponse.status === 401) {
      throw new CoreApiError("Authentication failed.", 401, "UNAUTHENTICATED");
    }

    throw new CoreApiError(
      "Core API could not verify the user.",
      503,
      "CORE_USER_VERIFICATION_FAILED",
    );
  }

  const userData = userResponse.data?.data;

  if (
    userResponse.data?.success !== true ||
    !userData?.userId ||
    !userData?.sessionId
  ) {
    throw new CoreApiError(
      "Core API returned an invalid user identity.",
      502,
      "INVALID_CORE_USER",
    );
  }

  // 2. Verify organization membership and role through Core.
  const organizationResponse = await requestCoreApi(
    `/api/organizations/${encodeURIComponent(organizationId)}/context`,
    {
      token: accessToken,
      method: "GET",
    },
  );

  if (!organizationResponse.ok) {
    if (organizationResponse.status === 400) {
      throw new CoreApiError(
        "Invalid organization ID.",
        400,
        "INVALID_ORGANIZATION_ID",
      );
    }

    if (organizationResponse.status === 401) {
      throw new CoreApiError("Authentication failed.", 401, "UNAUTHENTICATED");
    }

    if (organizationResponse.status === 403) {
      throw new CoreApiError(
        "You do not have access to this organization.",
        403,
        "ORGANIZATION_ACCESS_DENIED",
      );
    }

    if (organizationResponse.status === 404) {
      throw new CoreApiError(
        "Organization not found.",
        404,
        "ORGANIZATION_NOT_FOUND",
      );
    }

    throw new CoreApiError(
      "Core API could not verify organization access.",
      503,
      "CORE_API_VERIFICATION_FAILED",
    );
  }

  const result = organizationResponse.data?.data;

  if (
    organizationResponse.data?.success !== true ||
    !result?.organization?.id ||
    !result?.membership?.id ||
    !result?.membership?.role
  ) {
    throw new CoreApiError(
      "Core API returned an invalid organization context.",
      502,
      "INVALID_CORE_CONTEXT",
    );
  }

  return Object.freeze({
    user: Object.freeze({
      id: userData.userId,
      sessionId: userData.sessionId,
    }),

    organization: Object.freeze({
      id: result.organization.id,
      name: result.organization.name,
      slug: result.organization.slug,
    }),

    membership: Object.freeze({
      id: result.membership.id,
      role: result.membership.role,
    }),
  });
}
