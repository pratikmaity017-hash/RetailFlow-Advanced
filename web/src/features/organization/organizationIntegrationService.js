const API_BASE_URL = (import.meta.env.VITE_ADVANCED_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

export async function verifyOrganizationIntegration(
  organizationId,
  accessToken,
  options = {},
) {
  if (!API_BASE_URL) {
    throw new Error("Advanced API URL is not configured.");
  }

  if (!organizationId) {
    throw new Error("Organization ID is required.");
  }

  if (!accessToken) {
    throw new Error("Authentication token is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/advanced/organizations/${encodeURIComponent(organizationId)}/integration-check`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal: options.signal,
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Organization verification failed (${response.status}).`,
    );
  }

  if (
    data?.success !== true ||
    !data?.data?.organization ||
    !data?.data?.membership
  ) {
    throw new Error("Invalid organization verification response.");
  }

  return data.data;
}
