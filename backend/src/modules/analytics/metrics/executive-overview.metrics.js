import { compareMetricValues } from "./metric-comparison.js";

const METRIC_DEFINITIONS = {
  sales: {
    grossSales: {
      label: "Gross Sales",
      unit: "INR",
      description: "Sales value before return deductions.",
    },
    returnAmount: {
      label: "Return Amount",
      unit: "INR",
      description: "Value deducted for reported returns.",
    },
    netSales: {
      label: "Net Sales",
      unit: "INR",
      description: "Gross sales minus reported return amount.",
    },
    salesCount: {
      label: "Sales Count",
      unit: "count",
      description: "Number of completed sales.",
    },
  },
  collections: {
    collected: {
      label: "Collected",
      unit: "INR",
      description: "Payments collected during the reporting period.",
    },
    outstanding: {
      label: "Outstanding",
      unit: "INR",
      description: "Outstanding amount reported by the Core sales report.",
    },
  },
  returns: {
    totalReturns: {
      label: "Total Returns",
      unit: "count",
      description: "Number of returns reported during the reporting period.",
    },
    returnedQuantity: {
      label: "Returned Quantity",
      unit: "quantity",
      description: "Total quantity of returned items.",
    },
  },
  refunds: {
    processedRefund: {
      label: "Processed Refunds",
      unit: "INR",
      description: "Refund amount processed during the reporting period.",
    },
    pendingRefund: {
      label: "Pending Refund Liability",
      unit: "INR",
      description: "Approved refunds awaiting processing.",
    },
    totalRefunds: {
      label: "Refund Count",
      unit: "count",
      description: "Number of refunds reported during the reporting period.",
    },
  },
  payments: {
    totalPayments: {
      label: "Payment Count",
      unit: "count",
      description: "Number of payment events during the reporting period.",
    },
  },
};

function paiseToRupees(paise) {
  if (typeof paise !== "number" || !Number.isFinite(paise)) {
    return null;
  }

  return paise / 100;
}

function createMetric(value, definition, previousValue = null) {
  return {
    value,
    ...definition,
    comparison:
      previousValue === null ? null : compareMetricValues(value, previousValue),
  };
}

function getPreviousValue(
  previousSummary,
  field,
  conversion = (value) => value,
) {
  if (!previousSummary || typeof previousSummary !== "object") {
    return null;
  }

  return conversion(previousSummary[field]);
}

export function mapExecutiveOverviewMetrics(summary, previousSummary = null) {
  if (!summary || typeof summary !== "object") {
    throw new TypeError("A valid analytics summary is required.");
  }

  return {
    sales: {
      grossSales: createMetric(
        paiseToRupees(summary.grossSalesPaise),
        METRIC_DEFINITIONS.sales.grossSales,
        getPreviousValue(previousSummary, "grossSalesPaise", paiseToRupees),
      ),
      returnAmount: createMetric(
        paiseToRupees(summary.returnAmountPaise),
        METRIC_DEFINITIONS.sales.returnAmount,
        getPreviousValue(previousSummary, "returnAmountPaise", paiseToRupees),
      ),
      netSales: createMetric(
        paiseToRupees(summary.netSalesPaise),
        METRIC_DEFINITIONS.sales.netSales,
        getPreviousValue(previousSummary, "netSalesPaise", paiseToRupees),
      ),
      salesCount: createMetric(
        summary.totalSales ?? null,
        METRIC_DEFINITIONS.sales.salesCount,
        getPreviousValue(previousSummary, "totalSales"),
      ),
    },
    collections: {
      collected: createMetric(
        paiseToRupees(summary.collectedPaise),
        METRIC_DEFINITIONS.collections.collected,
        getPreviousValue(previousSummary, "collectedPaise", paiseToRupees),
      ),
      outstanding: createMetric(
        paiseToRupees(summary.outstandingPaise),
        METRIC_DEFINITIONS.collections.outstanding,
        getPreviousValue(previousSummary, "outstandingPaise", paiseToRupees),
      ),
    },
    returns: {
      totalReturns: createMetric(
        summary.totalReturns ?? null,
        METRIC_DEFINITIONS.returns.totalReturns,
        getPreviousValue(previousSummary, "totalReturns"),
      ),
      returnedQuantity: createMetric(
        summary.returnedQuantity ?? null,
        METRIC_DEFINITIONS.returns.returnedQuantity,
        getPreviousValue(previousSummary, "returnedQuantity"),
      ),
    },
    refunds: {
      processedRefund: createMetric(
        paiseToRupees(summary.processedRefundPaise),
        METRIC_DEFINITIONS.refunds.processedRefund,
        getPreviousValue(
          previousSummary,
          "processedRefundPaise",
          paiseToRupees,
        ),
      ),
      pendingRefund: createMetric(
        paiseToRupees(summary.pendingRefundPaise),
        METRIC_DEFINITIONS.refunds.pendingRefund,
        getPreviousValue(previousSummary, "pendingRefundPaise", paiseToRupees),
      ),
      totalRefunds: createMetric(
        summary.totalRefunds ?? null,
        METRIC_DEFINITIONS.refunds.totalRefunds,
        getPreviousValue(previousSummary, "totalRefunds"),
      ),
    },
    payments: {
      totalPayments: createMetric(
        summary.totalPayments ?? null,
        METRIC_DEFINITIONS.payments.totalPayments,
        getPreviousValue(previousSummary, "totalPayments"),
      ),
    },
  };
}
