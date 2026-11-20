const API_BASE_URL = (import.meta.env.VITE_ADVANCED_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

const VALID_GROUPS = new Set(["day", "week", "month"]);

function isValidDateString(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function validateFilters(filters) {
  if (!filters?.from || !filters?.to) {
    throw new Error("Both reporting dates are required.");
  }

  if (!isValidDateString(filters.from) || !isValidDateString(filters.to)) {
    throw new Error("Invalid reporting date format.");
  }

  if (filters.from > filters.to) {
    throw new Error("Start date cannot be after end date.");
  }

  const groupBy = filters.groupBy || "day";

  if (!VALID_GROUPS.has(groupBy)) {
    throw new Error("Invalid reporting group.");
  }

  return groupBy;
}

function validateResponse(data) {
  if (
    data?.success !== true ||
    !data?.data ||
    typeof data.data.summary !== "object" ||
    data.data.summary === null ||
    Array.isArray(data.data.summary)
  ) {
    throw new Error("Invalid Sales Intelligence response.");
  }

  const { trends, paymentMethods, topProducts } = data.data;

  if (
    !Array.isArray(trends) ||
    !Array.isArray(paymentMethods) ||
    !Array.isArray(topProducts)
  ) {
    throw new Error("Invalid Sales Intelligence data structure.");
  }

  return data.data;
}

export async function getSalesIntelligence(
  organizationId,
  accessToken,
  filters,
  options = {},
) {
  if (!API_BASE_URL) {
    throw new Error("Advanced API URL is not configured.");
  }

  if (!organizationId || typeof organizationId !== "string") {
    throw new Error("Organization ID is required.");
  }

  if (!accessToken || typeof accessToken !== "string") {
    throw new Error("Authentication token is required.");
  }

  const groupBy = validateFilters(filters);

  const query = new URLSearchParams({
    from: filters.from,
    to: filters.to,
    groupBy,
  });

  const endpoint =
    `${API_BASE_URL}/api/v1/advanced/organizations/` +
    `${encodeURIComponent(organizationId)}/analytics/overview`;

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
        `Unable to retrieve Sales Intelligence (${response.status}).`,
    );
  }

  return validateResponse(data);
}
