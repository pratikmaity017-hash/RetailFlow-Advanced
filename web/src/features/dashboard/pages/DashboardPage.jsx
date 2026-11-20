import { useContext, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
  Receipt,
  RotateCcw,
  IndianRupee,
  BarChart3,
  CreditCard,
  Package,
} from "lucide-react";

import { AuthContext } from "../../auth/AuthContext";
import { useOrganization } from "../../organization/organizationContext";
import { getExecutiveOverview } from "../services/executiveOverviewService";
import BackendStatus from "../components/BackendStatus";
import "./DashboardPage.css";
import "../../../shared/styles/page.css";

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialDateRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);

  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to),
  };
}

function formatCurrency(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatComparison(comparison, comparisonType = "previous_period") {
  if (!comparison || comparison.direction === "indeterminate") {
    return "No comparable baseline";
  }

  if (comparison.percentageChange === null) {
    if (comparison.direction === "unchanged") {
      return "No change";
    }

    const baselineLabel =
      comparisonType === "previous_year" ? "Previous year" : "Previous period";

    return `${baselineLabel} was zero`;
  }

  const sign = comparison.percentageChange > 0 ? "+" : "";
  const comparisonLabel =
    comparisonType === "previous_year"
      ? "vs previous year"
      : "vs previous period";

  return `${sign}${comparison.percentageChange}% ${comparisonLabel}`;
}

function MetricCard({
  title,
  value,
  description,
  comparison,
  comparisonType,
  icon: Icon,
}) {
  const direction = comparison?.direction;
  const TrendIcon = direction === "decrease" ? TrendingDown : TrendingUp;

  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <div className="metric-icon">
          <Icon size={19} />
        </div>
      </div>

      <h2>{value}</h2>

      <div className="metric-bottom">
        {comparison && direction !== "indeterminate" ? (
          <span className="metric-comparison">
            <TrendIcon size={14} />
            {formatComparison(comparison, comparisonType)}
          </span>
        ) : (
          <span className="metric-comparison muted">
            {formatComparison(comparison, comparisonType)}
          </span>
        )}
        <span>{description}</span>
      </div>
    </article>
  );
}

function TrendChart({ trends = [], loading }) {
  const chartRows = useMemo(
    () =>
      trends.map((item) => ({
        ...item,
        amount:
          typeof item.netSalesPaise === "number" ? item.netSalesPaise / 100 : 0,
      })),
    [trends],
  );

  const maxValue = Math.max(
    1,
    ...chartRows.map((item) => Math.max(0, item.amount)),
  );

  function formatBucket(period) {
    if (!period) return "—";

    const date = new Date(period);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
    }).format(date);
  }

  return (
    <article className="panel revenue-panel">
      <div className="panel-heading">
        <div>
          <h3>Net Sales Trend</h3>
          <p>Actual net sales across the selected reporting period</p>
        </div>
        <div className="panel-heading-icon">
          <BarChart3 size={18} />
        </div>
      </div>

      {loading ? (
        <div className="chart-state">Loading sales trend…</div>
      ) : chartRows.length === 0 ? (
        <div className="chart-state">
          No trend data is available for this date range.
        </div>
      ) : (
        <>
          <div className="chart">
            {chartRows.map((item, index) => {
              const height =
                item.amount > 0
                  ? Math.max(4, (item.amount / maxValue) * 100)
                  : 2;

              return (
                <div className="chart-column" key={`${item.period}-${index}`}>
                  <div className="chart-bar-area">
                    <div
                      className={`chart-bar${item.amount === 0 ? " is-zero" : ""}`}
                      style={{ height: `${height}%` }}
                      title={`${formatBucket(item.period)}: ${formatCurrency(item.amount)}`}
                    />
                  </div>
                  <span>{formatBucket(item.period)}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-legend">
            <span className="chart-legend-dot" />
            Net sales
            <span className="chart-legend-note">
              {chartRows.length} reporting{" "}
              {chartRows.length === 1 ? "period" : "periods"}
            </span>
          </div>
        </>
      )}
    </article>
  );
}

function formatPaymentMethod(method) {
  if (typeof method !== "string" || !method.trim()) {
    return "Other";
  }

  return method
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function PaymentMethodsPanel({ paymentMethods = [] }) {
  return (
    <article className="panel period-summary-panel">
      <div className="panel-heading">
        <div>
          <h3>Payment Methods</h3>
          <p>Collection breakdown by payment method</p>
        </div>
        <div className="panel-heading-icon">
          <CreditCard size={18} />
        </div>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="chart-state">
          No payment method activity is available for this period.
        </div>
      ) : (
        <div className="summary-list">
          {paymentMethods.map((item, index) => (
            <div key={`${item.method || "other"}-${index}`}>
              <span>
                {formatPaymentMethod(item.method)}
                <small>
                  {formatNumber(item.totalPayments)}{" "}
                  {item.totalPayments === 1 ? "payment" : "payments"}
                </small>
              </span>
              <strong>
                {formatCurrency(
                  typeof item.amountPaise === "number"
                    ? item.amountPaise / 100
                    : null,
                )}
              </strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function TopProductsPanel({ products = [] }) {
  return (
    <article className="panel period-summary-panel">
      <div className="panel-heading">
        <div>
          <h3>Top Products</h3>
          <p>Best-selling products by net quantity sold</p>
        </div>
        <div className="panel-heading-icon">
          <Package size={18} />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="chart-state">
          No product sales are available for this period.
        </div>
      ) : (
        <div className="summary-list">
          {products.map((item, index) => (
            <div
              key={`${item.productId || item.sku || item.productName}-${index}`}
            >
              <span>
                {item.productName || "Unnamed product"}
                <small>
                  {item.sku ? `SKU: ${item.sku} · ` : ""}
                  {formatNumber(item.quantitySold)} sold
                  {typeof item.returnedQuantity === "number" &&
                    ` · ${formatNumber(item.returnedQuantity)} returned`}
                </small>
              </span>
              <strong>
                {formatCurrency(
                  typeof item.netSalesPaise === "number"
                    ? item.netSalesPaise / 100
                    : null,
                )}
              </strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default function DashboardPage() {
  const { accessToken, isLoading: authLoading } = useContext(AuthContext);
  const {
    selectedOrganization,
    isLoading: organizationLoading,
    integrationStatus,
    integrationContext,
    integrationError,
  } = useOrganization();

  const [dateRange, setDateRange] = useState(getInitialDateRange);
  const [groupBy, setGroupBy] = useState("day");
  const [compare, setCompare] = useState("previous_period");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (
      authLoading ||
      organizationLoading ||
      !accessToken ||
      !selectedOrganization?.id ||
      integrationStatus !== "verified" ||
      !dateRange.from ||
      !dateRange.to ||
      dateRange.from > dateRange.to
    ) {
      setReport(null);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadExecutiveOverview() {
      setLoading(true);
      setError("");

      try {
        const result = await getExecutiveOverview(
          selectedOrganization.id,
          accessToken,
          {
            from: dateRange.from,
            to: dateRange.to,
            compare,
            groupBy,
          },
          { signal: controller.signal },
        );

        if (!controller.signal.aborted) {
          setReport(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setReport(null);
          setError(err.message || "Unable to load Executive Overview.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadExecutiveOverview();

    return () => controller.abort();
  }, [
    accessToken,
    authLoading,
    organizationLoading,
    selectedOrganization?.id,
    integrationStatus,
    dateRange.from,
    dateRange.to,
    compare,
    groupBy,
    retryCount,
  ]);

  const metrics = report?.current?.metrics;
  const summary = report?.current?.summary;
  const trends = report?.current?.trends ?? [];
  const paymentMethods = report?.current?.paymentMethods ?? [];
  const topProducts = report?.current?.topProducts ?? [];

  const metricCards = [
    {
      title: "Net Sales",
      value: formatCurrency(metrics?.sales?.netSales?.value),
      description: "Gross sales less reported returns",
      comparison: metrics?.sales?.netSales?.comparison,
      icon: IndianRupee,
      comparisonType: report?.filters?.compare,
    },
    {
      title: "Gross Sales",
      value: formatCurrency(metrics?.sales?.grossSales?.value),
      description: "Sales before return deductions",
      comparison: metrics?.sales?.grossSales?.comparison,
      icon: Wallet,
      comparisonType: report?.filters?.compare,
    },
    {
      title: "Collected",
      value: formatCurrency(metrics?.collections?.collected?.value),
      description: "Payments collected in this period",
      comparison: metrics?.collections?.collected?.comparison,
      icon: Receipt,
      comparisonType: report?.filters?.compare,
    },
    {
      title: "Outstanding",
      value: formatCurrency(metrics?.collections?.outstanding?.value),
      description: "Outstanding amount in the sales report",
      comparison: metrics?.collections?.outstanding?.comparison,
      icon: CircleAlert,
      comparisonType: report?.filters?.compare,
    },
    {
      title: "Sales Count",
      value: formatNumber(metrics?.sales?.salesCount?.value),
      description: "Completed sales",
      comparison: metrics?.sales?.salesCount?.comparison,
      icon: BarChart3,
      comparisonType: report?.filters?.compare,
    },
    {
      title: "Total Returns",
      value: formatNumber(metrics?.returns?.totalReturns?.value),
      description: "Returns reported in this period",
      comparison: metrics?.returns?.totalReturns?.comparison,
      icon: RotateCcw,
      comparisonType: report?.filters?.compare,
    },
  ];

  const hasValidDateRange =
    Boolean(dateRange.from && dateRange.to) && dateRange.from <= dateRange.to;

  function updateDateRange(field, value) {
    setDateRange((current) => ({ ...current, [field]: value }));
  }

  function applyPreset(days) {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - (days - 1));

    setDateRange({
      from: toDateInputValue(from),
      to: toDateInputValue(to),
    });
  }

  const isWaitingForContext =
    authLoading || organizationLoading || integrationStatus === "checking";

  return (
    <div className="page-layout dashboard-page">
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">BUSINESS INTELLIGENCE</span>
          <h1>Executive Overview</h1>
          <p>
            {selectedOrganization
              ? `Live performance for ${selectedOrganization.name}`
              : "Select an organization to view business performance"}
          </p>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          disabled={loading || !selectedOrganization}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <BackendStatus />

      <section className="panel organization-status">
        <div>
          <strong>Organization access</strong>
          <p>
            {isWaitingForContext && "Verifying your organization access…"}
            {!isWaitingForContext &&
              integrationStatus === "verified" &&
              "Access verified. Executive analytics are being requested securely."}
            {!isWaitingForContext &&
              integrationStatus === "error" &&
              (integrationError || "Organization verification failed.")}
            {!isWaitingForContext &&
              integrationStatus === "idle" &&
              "No active organization is available."}
          </p>
        </div>

        <span className={`status-pill status-${integrationStatus}`}>
          {integrationStatus === "verified"
            ? `Verified${integrationContext?.membership?.role ? ` · ${integrationContext.membership.role}` : ""}`
            : integrationStatus === "checking"
              ? "Checking"
              : integrationStatus === "error"
                ? "Access issue"
                : "Unavailable"}
        </span>
      </section>

      <section className="panel report-filters">
        <div className="filter-heading">
          <div>
            <h3>Reporting period</h3>
            <p>Choose a date range and reporting interval</p>
          </div>
          <CalendarDays size={19} />
        </div>

        <div className="filter-controls">
          <label>
            <span>From</span>
            <input
              type="date"
              value={dateRange.from}
              max={dateRange.to || undefined}
              onChange={(event) => updateDateRange("from", event.target.value)}
            />
          </label>

          <label>
            <span>To</span>
            <input
              type="date"
              value={dateRange.to}
              min={dateRange.from || undefined}
              max={toDateInputValue(new Date())}
              onChange={(event) => updateDateRange("to", event.target.value)}
            />
          </label>

          <label>
            <span>Group by</span>
            <select
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value)}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </label>

          <label>
            <span>Compare with</span>
            <select
              value={compare}
              onChange={(event) => setCompare(event.target.value)}
            >
              <option value="previous_period">Previous period</option>
              <option value="previous_year">Previous year</option>
              <option value="none">No comparison</option>
            </select>
          </label>

          <div className="preset-actions">
            <button type="button" onClick={() => applyPreset(7)}>
              7 days
            </button>
            <button type="button" onClick={() => applyPreset(30)}>
              30 days
            </button>
          </div>
        </div>

        {!hasValidDateRange && (
          <p className="filter-error">
            The start date must not be later than the end date.
          </p>
        )}
      </section>

      {!selectedOrganization && !isWaitingForContext && (
        <div className="dashboard-state">
          <CircleAlert size={22} />
          <strong>No organization selected</strong>
          <p>Choose an organization before requesting its analytics.</p>
        </div>
      )}

      {integrationStatus === "error" && (
        <div className="dashboard-state error-state">
          <CircleAlert size={22} />
          <strong>Organization verification failed</strong>
          <p>
            {integrationError ||
              "The selected organization could not be verified."}
          </p>
        </div>
      )}

      {error && (
        <div className="dashboard-state error-state" role="alert">
          <CircleAlert size={22} />
          <strong>Executive Overview unavailable</strong>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {isWaitingForContext && (
        <div className="dashboard-state">
          <span className="loading-indicator" />
          <strong>Preparing your business overview</strong>
          <p>Checking authentication and organization access.</p>
        </div>
      )}

      {loading && !report && (
        <div className="dashboard-state">
          <span className="loading-indicator" />
          <strong>Loading Executive Overview</strong>
          <p>Retrieving verified business metrics for the selected period.</p>
        </div>
      )}

      {report && (
        <>
          <section className="metrics-grid">
            {metricCards.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </section>

          <section className="dashboard-content-grid">
            <TrendChart trends={trends} loading={loading} />

            <article className="panel period-summary-panel">
              <div className="panel-heading">
                <div>
                  <h3>Period summary</h3>
                  <p>Additional operational totals from the report</p>
                </div>
                <div className="panel-heading-icon">
                  <CalendarDays size={18} />
                </div>
              </div>

              <div className="summary-list">
                <div>
                  <span>Return amount</span>
                  <strong>
                    {formatCurrency(metrics?.sales?.returnAmount?.value)}
                  </strong>
                </div>
                <div>
                  <span>Processed refunds</span>
                  <strong>
                    {formatCurrency(metrics?.refunds?.processedRefund?.value)}
                  </strong>
                </div>
                <div>
                  <span>Pending refund liability</span>
                  <strong>
                    {formatCurrency(metrics?.refunds?.pendingRefund?.value)}
                  </strong>
                </div>
                <div>
                  <span>Returned quantity</span>
                  <strong>
                    {formatNumber(metrics?.returns?.returnedQuantity?.value)}
                  </strong>
                </div>
                <div>
                  <span>Payment events</span>
                  <strong>
                    {formatNumber(metrics?.payments?.totalPayments?.value)}
                  </strong>
                </div>
              </div>

              <p className="summary-footnote">
                Values are reported by the connected Core sales report. Metrics
                not supplied by that report are not estimated here.
              </p>
            </article>
          </section>

          <section className="dashboard-content-grid">
            <PaymentMethodsPanel paymentMethods={paymentMethods} />
            <TopProductsPanel products={topProducts} />
          </section>

          <div className="report-meta">
            <span>
              Reporting {report.filters?.from} to {report.filters?.to}
            </span>
            <span>
              Comparison:{" "}
              {report.filters?.compare === "none"
                ? "None"
                : report.filters?.compare === "previous_year"
                  ? "Previous year"
                  : "Previous period"}
            </span>
            {report.timezone && <span>Timezone: {report.timezone}</span>}
            {summary && <span>Source: Core sales reporting API</span>}
          </div>
        </>
      )}
    </div>
  );
}
