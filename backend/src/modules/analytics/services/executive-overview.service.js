import { CoreApiError } from "../../../integration/core-api/core-api.client.js";

import { getAnalyticsOverview } from "./analytics.service.js";
import { mapExecutiveOverviewMetrics } from "../metrics/executive-overview.metrics.js";

function getDateParts(value) {
  const [year, month, day] = value.split("-").map(Number);

  return { year, month, day };
}

function formatDate(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);

  return result;
}

function createUtcDate(value) {
  const { year, month, day } = getDateParts(value);

  return new Date(Date.UTC(year, month - 1, day));
}

function getPreviousPeriod(from, to) {
  const start = createUtcDate(from);
  const end = createUtcDate(to);

  const durationDays = (end.getTime() - start.getTime()) / 86400000 + 1;

  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -(durationDays - 1));

  return {
    from: formatDate(previousStart),
    to: formatDate(previousEnd),
  };
}

function getPreviousYearPeriod(from, to) {
  function shiftDateBackOneYear(value) {
    const { year, month, day } = getDateParts(value);
    const targetYear = year - 1;
    const maxDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();

    return formatDate(
      new Date(Date.UTC(targetYear, month - 1, Math.min(day, maxDay))),
    );
  }

  return {
    from: shiftDateBackOneYear(from),
    to: shiftDateBackOneYear(to),
  };
}

function validateReport(report) {
  if (
    !report ||
    typeof report !== "object" ||
    !report.summary ||
    typeof report.summary !== "object"
  ) {
    throw new CoreApiError(
      "Core API returned an invalid sales report.",
      502,
      "INVALID_CORE_SALES_REPORT",
    );
  }

  return report;
}

function createComparison(comparisonType, report, dateRange) {
  if (!report) {
    return null;
  }

  return {
    type: comparisonType,
    dateRange,
    summary: report.summary,
    metrics: mapExecutiveOverviewMetrics(report.summary),
    trends: report.trends ?? [],
  };
}

export async function getExecutiveOverview({
  organizationId,
  accessToken,
  from,
  to,
  compare = "previous_period",
  groupBy = "day",
}) {
  const currentReport = validateReport(
    await getAnalyticsOverview({
      organizationId,
      accessToken,
      from,
      to,
      groupBy,
    }),
  );

  let comparison = null;

  if (compare !== "none") {
    const comparisonRange =
      compare === "previous_year"
        ? getPreviousYearPeriod(from, to)
        : getPreviousPeriod(from, to);

    const comparisonReport = validateReport(
      await getAnalyticsOverview({
        organizationId,
        accessToken,
        from: comparisonRange.from,
        to: comparisonRange.to,
        groupBy,
      }),
    );

    comparison = createComparison(compare, comparisonReport, comparisonRange);
  }

  return {
    current: {
      summary: currentReport.summary,
      metrics: mapExecutiveOverviewMetrics(currentReport.summary, comparison?.summary ?? null),
      paymentMethods: currentReport.paymentMethods ?? [],
      trends: currentReport.trends ?? [],
      topProducts: currentReport.topProducts ?? [],
    },
    comparison,
    filters: {
      from,
      to,
      compare,
      groupBy,
    },
    timezone: currentReport.filters?.timezone ?? null,
  };
}



