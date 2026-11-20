import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { RefreshCw, TrendingUp, CalendarDays } from "lucide-react";

import { AuthContext } from "../../auth/AuthContext";
import { useOrganization } from "../../organization/organizationContext";
import { getSalesIntelligence } from "../services/salesIntelligenceService";
import "./SalesIntelligencePage.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCompactCurrency = (value) => {
  const amount = Number(value || 0);

  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;

  return `₹${amount.toFixed(0)}`;
};

const convertPaise = (value) => Number(value || 0) / 100;

const currencyValue = (value) => formatCurrency(convertPaise(value));

const chartCurrencyValue = (value) =>
  formatCompactCurrency(convertPaise(value));

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTrendDate = (period) => {
  if (!period) return "Unknown";

  const date = new Date(period);

  if (Number.isNaN(date.getTime())) return String(period);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

function MetricCard({ label, value, description, icon: Icon }) {
  return (
    <div className="si-metric-card">
      <div className="si-metric-top">
        <span className="si-metric-label">{label}</span>
        <div className="si-metric-icon">
          <Icon size={18} />
        </div>
      </div>

      <div className="si-metric-value">{value}</div>
      <div className="si-metric-description">{description}</div>
    </div>
  );
}

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="si-chart-tooltip">
      <div className="si-tooltip-label">{label}</div>

      {payload.map((item) => (
        <div className="si-tooltip-row" key={item.dataKey}>
          <span className="si-tooltip-dot" style={{ background: item.color }} />
          <span>{item.name}</span>
          <strong>{currencyValue(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function SalesIntelligencePage() {
  const { accessToken, isLoading: authLoading } = useContext(AuthContext);
  const { selectedOrganization } = useOrganization();

  const organizationId =
    selectedOrganization?._id ||
    selectedOrganization?.id ||
    selectedOrganization?.organizationId;

  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return toDateInput(date);
  });

  const [to, setTo] = useState(() => toDateInput(new Date()));
  const [groupBy, setGroupBy] = useState("day");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const loadData = useCallback(
    async (signal) => {
      if (authLoading) {
        setLoading(true);
        return;
      }

      if (!organizationId || !accessToken) {
        setData(null);
        setLoading(false);
        setError("Organization or authentication context is unavailable.");
        return;
      }

      if (!from || !to || from > to) {
        setData(null);
        setLoading(false);
        setError("Please select a valid date range.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await getSalesIntelligence(
          organizationId,
          accessToken,
          { from, to, groupBy },
          { signal },
        );

        if (!signal.aborted) {
          setData(result);
          setError("");
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(err.message || "Unable to load Sales Intelligence.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [organizationId, accessToken, from, to, groupBy, retry, authLoading],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

  const summary = data?.summary || {};
  const trends = data?.trends || [];

  const chartData = useMemo(() => {
    if (!Array.isArray(trends)) return [];

    return trends.map((item) => ({
      date: formatTrendDate(item.period),
      sales: Number(item.netSalesPaise ?? 0),
      gross: Number(item.grossSalesPaise ?? 0),
    }));
  }, [trends]);

  const metrics = useMemo(() => {
    return {
      grossSales: Number(summary.grossSalesPaise ?? 0),
      netSales: Number(summary.netSalesPaise ?? 0),
      returnAmount: Number(summary.returnAmountPaise ?? 0),
      salesCount: Number(summary.totalSales ?? 0),
      totalReturns: Number(summary.totalReturns ?? 0),
    };
  }, [summary]);

  return (
    <div className="si-page">
      <div className="si-page-header">
        <div className="si-heading-content">
          <div className="si-heading-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <h1>Sales Intelligence</h1>
            <p>
              Understand sales performance, revenue trends and business
              activity.
            </p>
          </div>
        </div>

        <button
          className="si-refresh-button"
          onClick={() => setRetry((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "si-spinning" : ""} />
          Refresh
        </button>
      </div>

      <div className="si-filter-panel">
        <div className="si-filter-title">
          <CalendarDays size={18} />
          <span>Reporting Period</span>
        </div>

        <div className="si-filter-controls">
          <div className="si-filter-field">
            <label htmlFor="si-from">From</label>
            <input
              id="si-from"
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>

          <div className="si-filter-field">
            <label htmlFor="si-to">To</label>
            <input
              id="si-to"
              type="date"
              value={to}
              min={from}
              max={toDateInput(new Date())}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>

          <div className="si-filter-field">
            <label htmlFor="si-group">Grouping</label>
            <select
              id="si-group"
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value)}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="si-error">
          <div>
            <strong>Unable to load sales data</strong>
            <p>{error}</p>
          </div>

          <button onClick={() => setRetry((value) => value + 1)}>Retry</button>
        </div>
      )}

      {loading && !data ? (
        <div className="si-loading">
          <div className="si-loading-spinner" />
          <p>Loading Sales Intelligence...</p>
        </div>
      ) : data && !error ? (
        <>
          <div className="si-metrics-grid">
            <MetricCard
              label="Gross Sales"
              value={currencyValue(metrics.grossSales)}
              description="Total sales before returns"
              icon={TrendingUp}
            />

            <MetricCard
              label="Net Sales"
              value={currencyValue(metrics.netSales)}
              description="Sales after returns"
              icon={TrendingUp}
            />

            <MetricCard
              label="Return Amount"
              value={currencyValue(metrics.returnAmount)}
              description="Total returned sales amount"
              icon={RefreshCw}
            />

            <MetricCard
              label="Sales Count"
              value={metrics.salesCount.toLocaleString("en-IN")}
              description="Reported sales transactions"
              icon={CalendarDays}
            />

            <MetricCard
              label="Returns Count"
              value={metrics.totalReturns.toLocaleString("en-IN")}
              description="Total recorded returns"
              icon={RefreshCw}
            />
          </div>

          <section className="si-panel si-trend-panel">
            <div className="si-panel-header">
              <div>
                <h2>Sales Trend</h2>
                <p>Revenue movement across the selected reporting period</p>
              </div>

              <div className="si-chart-legend">
                <span>
                  <span className="si-legend-dot si-legend-net" />
                  Net Sales
                </span>

                <span>
                  <span className="si-legend-dot si-legend-gross" />
                  Gross Sales
                </span>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="si-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="siNetGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6366f1"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor="#6366f1"
                          stopOpacity={0.02}
                        />
                      </linearGradient>

                      <linearGradient
                        id="siGrossGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#14b8a6"
                          stopOpacity={0.14}
                        />
                        <stop
                          offset="100%"
                          stopColor="#14b8a6"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--si-chart-grid)"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tickFormatter={chartCurrencyValue}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                    />

                    <Tooltip content={<SalesTooltip />} />

                    <Area
                      type="monotone"
                      dataKey="gross"
                      name="Gross Sales"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      fill="url(#siGrossGradient)"
                    />

                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="Net Sales"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#siNetGradient)"
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="si-empty-chart">
                <TrendingUp size={35} />
                <h3>No trend data available</h3>
                <p>
                  No sales trend information was returned for this reporting
                  period.
                </p>
              </div>
            )}
          </section>

          {loading && (
            <div className="si-refreshing-indicator">
              Updating reporting data...
            </div>
          )}
        </>
      ) : (
        !error && (
          <div className="si-empty-chart">
            <TrendingUp size={35} />
            <h3>No reporting data</h3>
            <p>There is no sales data available for this period.</p>
          </div>
        )
      )}
    </div>
  );
}
