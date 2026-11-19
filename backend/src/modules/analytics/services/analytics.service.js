import {
  CoreApiError,
  requestCoreApi,
} from "../../../integration/core-api/core-api.client.js";

export async function getAnalyticsOverview({
  organizationId,
  accessToken,
  from,
  to,
  groupBy = "day",
}) {
  const query = new URLSearchParams({
    from,
    to,
    groupBy,
  });

  const path =
    `/api/organizations/${encodeURIComponent(organizationId)}` +
    `/reports/sales?${query.toString()}`;

  const response = await requestCoreApi(path, {
    token: accessToken,
    method: "GET",
    timeoutMs: 10000,
  });

  if (!response.ok) {
    const upstreamError = response.data?.error || response.data;

    const statusCode =
      response.status >= 400 && response.status < 500 ? response.status : 502;

    throw new CoreApiError(
      statusCode === 502
        ? "Core Sales Report service is currently unavailable."
        : upstreamError?.message || "Unable to retrieve the sales report.",
      statusCode,
      upstreamError?.code || "CORE_SALES_REPORT_FAILED",
    );
  }

  if (
    response.data?.success !== true ||
    !response.data?.data ||
    !response.data.data.summary
  ) {
    throw new CoreApiError(
      "Core API returned an invalid sales report.",
      502,
      "INVALID_CORE_SALES_REPORT",
    );
  }

  return response.data.data;
}
