const API_BASE_URL = (import.meta.env.VITE_ADVANCED_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

export async function getExecutiveOverview(
  organizationId,
  accessToken,
  filters,
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

  if (!filters || !filters.from || !filters.to) {
    throw new Error("Both reporting dates are required.");
  }

  const query = new URLSearchParams({
    from: filters.from,
    to: filters.to,
    compare: filters.compare || "previous_period",
    groupBy: filters.groupBy || "day",
  });

  const endpoint =
    `${API_BASE_URL}/api/v1/advanced/organizations/` +
    `${encodeURIComponent(organizationId)}/analytics/executive-overview`;

  const response = await fetch(`${endpoint}?${query.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    signal: options.signal,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Unable to retrieve Executive Overview (${response.status}).`,
    );
  }

  if (
    data?.success !== true ||
    !data?.data?.current ||
    !data?.data?.current?.summary ||
    !data?.data?.current?.metrics ||
    !data?.data?.filters
  ) {
    throw new Error("Invalid Executive Overview response.");
  }

  return data.data;
}
