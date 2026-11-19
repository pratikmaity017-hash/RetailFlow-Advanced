import { CoreApiError } from "../../../integration/core-api/core-api.client.js";
import { getAnalyticsOverview } from "../services/analytics.service.js";

const ALLOWED_QUERY_PARAMETERS = new Set(["from", "to", "groupBy"]);

const ALLOWED_GROUPS = new Set(["day", "week", "month"]);

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function validateQueryParameters(query) {
  const unknownParameters = Object.keys(query).filter(
    (key) => !ALLOWED_QUERY_PARAMETERS.has(key),
  );

  if (unknownParameters.length > 0) {
    throw new CoreApiError(
      "Unsupported analytics query parameter.",
      400,
      "UNKNOWN_ANALYTICS_QUERY_PARAMETER",
    );
  }
}

function validateDateRange(from, to) {
  if (!isValidDate(from) || !isValidDate(to)) {
    throw new CoreApiError(
      "Valid from and to dates are required in YYYY-MM-DD format.",
      400,
      "INVALID_ANALYTICS_DATE",
    );
  }

  if (from > to) {
    throw new CoreApiError(
      "The from date cannot be later than the to date.",
      400,
      "INVALID_ANALYTICS_DATE_RANGE",
    );
  }

  const startDate = new Date(`${from}T00:00:00.000Z`);
  const endDate = new Date(`${to}T00:00:00.000Z`);

  const differenceInDays = (endDate.getTime() - startDate.getTime()) / 86400000;

  if (differenceInDays > 365) {
    throw new CoreApiError(
      "Analytics date range cannot exceed 366 days.",
      400,
      "ANALYTICS_DATE_RANGE_EXCEEDED",
    );
  }
}

export async function getAnalyticsOverviewController(req, res, next) {
  try {
    validateQueryParameters(req.query);

    const { from, to, groupBy = "day" } = req.query;

    validateDateRange(from, to);

    if (!ALLOWED_GROUPS.has(groupBy)) {
      throw new CoreApiError(
        "groupBy must be day, week, or month.",
        400,
        "INVALID_ANALYTICS_GROUP_BY",
      );
    }

    const data = await getAnalyticsOverview({
      // Use only the organization verified by Core.
      organizationId: req.organization.id,
      accessToken: req.coreAccessToken,
      from,
      to,
      groupBy,
    });

    res.status(200).json({
      success: true,
      message: "Advanced analytics overview retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
