import { requestCoreApi, CoreApiError } from "../core-api/core-api.client.js";

function createAccessError(statusCode, code, message) {
  return new CoreApiError(message, statusCode, code);
}

function isFutureDate(value) {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date > new Date();
}

export async function verifyAdvancedFeatureEntitlement({
  organizationId,
  accessToken,
  featureCode,
}) {
  if (!organizationId || !accessToken || !featureCode) {
    throw createAccessError(
      400,
      "INVALID_ENTITLEMENT_REQUEST",
      "Organization, authentication and feature information are required.",
    );
  }

  const response = await requestCoreApi(
    `/api/organizations/${encodeURIComponent(organizationId)}/subscription`,
    {
      token: accessToken,
      method: "GET",
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw createAccessError(401, "UNAUTHENTICATED", "Authentication failed.");
    }

    if (response.status === 403) {
      throw createAccessError(
        403,
        "ORGANIZATION_ACCESS_DENIED",
        "You do not have access to this organization.",
      );
    }

    if (response.status === 404) {
      throw createAccessError(
        403,
        "SUBSCRIPTION_REQUIRED",
        "An organization subscription is required.",
      );
    }

    throw createAccessError(
      503,
      "CORE_SUBSCRIPTION_LOOKUP_FAILED",
      "Could not verify the organization subscription.",
    );
  }

  const result = response.data?.data;
  const subscription = result?.subscription;
  const plan = result?.plan;

  if (
    response.data?.success !== true ||
    !subscription?.status ||
    !plan?.code ||
    typeof plan.isActive !== "boolean"
  ) {
    throw createAccessError(
      502,
      "INVALID_CORE_SUBSCRIPTION_RESPONSE",
      "Core API returned an invalid subscription response.",
    );
  }

  const now = new Date();

  const isFreePlan = plan.code === "free";

  const hasValidPaidPeriod = isFutureDate(subscription.currentPeriodEnd);

  const isActive =
    subscription.status === "active" && (isFreePlan || hasValidPaidPeriod);

  const isWithinGracePeriod =
    subscription.status === "past_due" &&
    isFutureDate(subscription.gracePeriodEndsAt);

  if (!isActive && !isWithinGracePeriod) {
    throw createAccessError(
      403,
      "SUBSCRIPTION_INACTIVE",
      "The organization subscription is inactive or its grace period has ended.",
    );
  }

  if (!plan.isActive) {
    throw createAccessError(
      403,
      "SUBSCRIPTION_PLAN_UNAVAILABLE",
      "The organization's subscription plan is unavailable.",
    );
  }

  const features = plan.entitlements?.features ?? {};

  if (features[featureCode] !== true) {
    throw createAccessError(
      403,
      "FEATURE_NOT_INCLUDED_IN_PLAN",
      "This feature is not included in the organization's subscription plan.",
    );
  }

  return Object.freeze({
    subscriptionStatus: subscription.status,
    planCode: plan.code,
    featureCode,
  });
}
