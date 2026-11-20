const ALLOWED_QUERY_PARAMETERS = new Set(["from", "to", "compare", "groupBy"]);

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const ALLOWED_COMPARISONS = new Set([
  "previous_period",
  "previous_year",
  "none",
]);

const ALLOWED_GROUP_BY = new Set(["day", "week", "month"]);

export function validateExecutiveOverviewQuery(query) {
  for (const parameter of Object.keys(query)) {
    if (!ALLOWED_QUERY_PARAMETERS.has(parameter)) {
      const error = new Error(`Unsupported query parameter: ${parameter}.`);

      error.statusCode = 400;
      error.code = "INVALID_ANALYTICS_QUERY_PARAMETER";

      throw error;
    }
  }

  const { from, to, compare = "previous_period", groupBy = "day" } = query;

  if (!from || !to) {
    const error = new Error("Both from and to dates are required.");

    error.statusCode = 400;
    error.code = "ANALYTICS_DATE_RANGE_REQUIRED";

    throw error;
  }

  if (!DATE_REGEX.test(from) || !DATE_REGEX.test(to)) {
    const error = new Error("Dates must use the YYYY-MM-DD format.");

    error.statusCode = 400;
    error.code = "INVALID_ANALYTICS_DATE_FORMAT";

    throw error;
  }

  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T00:00:00.000Z`);

  if (
    Number.isNaN(fromDate.getTime()) ||
    Number.isNaN(toDate.getTime()) ||
    fromDate.toISOString().slice(0, 10) !== from ||
    toDate.toISOString().slice(0, 10) !== to
  ) {
    const error = new Error("Invalid calendar date.");

    error.statusCode = 400;
    error.code = "INVALID_ANALYTICS_DATE";

    throw error;
  }

  if (fromDate > toDate) {
    const error = new Error("The from date must not exceed the to date.");

    error.statusCode = 400;
    error.code = "INVALID_ANALYTICS_DATE_RANGE";

    throw error;
  }

  const rangeDays = (toDate.getTime() - fromDate.getTime()) / 86400000 + 1;

  if (rangeDays > 366) {
    const error = new Error(
      "The analytics date range must not exceed 366 days.",
    );

    error.statusCode = 400;
    error.code = "ANALYTICS_DATE_RANGE_TOO_LARGE";

    throw error;
  }

  if (!ALLOWED_COMPARISONS.has(compare)) {
    const error = new Error("Invalid comparison period.");

    error.statusCode = 400;
    error.code = "INVALID_ANALYTICS_COMPARISON";

    throw error;
  }

  if (!ALLOWED_GROUP_BY.has(groupBy)) {
    const error = new Error("Invalid analytics grouping interval.");

    error.statusCode = 400;
    error.code = "INVALID_ANALYTICS_GROUP_BY";

    throw error;
  }

  return {
    from,
    to,
    compare,
    groupBy,
  };
}
