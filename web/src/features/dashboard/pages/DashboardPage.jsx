import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CalendarDays,
  MoreHorizontal,
  Package,
  Warehouse,
  ArrowLeftRight,
  RotateCcw,
} from "lucide-react";

import { useOrganization } from "../../organization/organizationContext";
import BackendStatus from "../components/BackendStatus";
import "./DashboardPage.css";
import "../../../shared/styles/page.css";

const metrics = [
  {
    title: "Total Revenue",
    value: "₹8,42,500",
    change: "+12.8%",
    positive: true,
    description: "Compared to last month",
    icon: TrendingUp,
  },
  {
    title: "Gross Profit",
    value: "₹2,18,400",
    change: "+8.4%",
    positive: true,
    description: "Compared to last month",
    icon: TrendingUp,
  },
  {
    title: "Stock Transfers",
    value: "128",
    change: "+6.2%",
    positive: true,
    description: "Compared to last month",
    icon: ArrowLeftRight,
  },
  {
    title: "Pending Returns",
    value: "14",
    change: "-3.1%",
    positive: false,
    description: "Compared to last month",
    icon: RotateCcw,
  },
];

const activities = [
  {
    title: "Stock transfer completed",
    description: "Warehouse A → Warehouse B",
    time: "10 minutes ago",
    icon: ArrowLeftRight,
  },
  {
    title: "New warehouse added",
    description: "North Kolkata Warehouse",
    time: "45 minutes ago",
    icon: Warehouse,
  },
  {
    title: "Return request received",
    description: "Return #RET-1024",
    time: "1 hour ago",
    icon: RotateCcw,
  },
  {
    title: "Inventory updated",
    description: "12 products updated",
    time: "2 hours ago",
    icon: Package,
  },
];

const chartData = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 65 },
  { day: "Wed", value: 52 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 92 },
  { day: "Sun", value: 72 },
];

function MetricCard({ metric }) {
  const Icon = metric.icon;

  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{metric.title}</span>
        <div className="metric-icon">
          <Icon size={19} />
        </div>
      </div>

      <h2>{metric.value}</h2>

      <div className="metric-bottom">
        <span className={metric.positive ? "trend-positive" : "trend-negative"}>
          {metric.positive ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          {metric.change}
        </span>

        <span>{metric.description}</span>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const {
    selectedOrganization,
    isDemo,
    integrationStatus,
    integrationContext,
    integrationError,
  } = useOrganization();
  return (
    <div className="page-layout">
      <div className="page-heading">
        <div>
          <span className="eyebrow">BUSINESS OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>
            {selectedOrganization
              ? `Viewing ${selectedOrganization.name} · ${
                  isDemo ? "Demonstration data" : "Organization data"
                }`
              : "No organization selected"}
          </p>
        </div>

        <button className="date-filter">
          <CalendarDays size={17} />
          Last 7 days
        </button>
      </div>

      <BackendStatus />

      <section
        className="panel"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>Organization Integration</strong>
          <p style={{ fontSize: "13px", marginTop: "5px" }}>
            {integrationStatus === "checking" &&
              "Verifying organization access..."}
            {integrationStatus === "verified" &&
              "Organization access verified successfully."}
            {integrationStatus === "error" && integrationError}
            {integrationStatus === "idle" &&
              "No organization verification active."}
          </p>
        </div>

        <div>
          {integrationStatus === "verified" && (
            <span style={{ color: "#16a34a", fontWeight: 600 }}>
              Verified · {integrationContext?.membership?.role}
            </span>
          )}

          {integrationStatus === "checking" && (
            <span style={{ color: "#d97706", fontWeight: 600 }}>Checking</span>
          )}

          {integrationStatus === "error" && (
            <span style={{ color: "#dc2626", fontWeight: 600 }}>
              Verification failed
            </span>
          )}

          {integrationStatus === "idle" && (
            <span style={{ opacity: 0.7 }}>Inactive</span>
          )}
        </div>
      </section>

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </section>

      <section className="dashboard-content-grid">
        <article className="panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h3>Revenue Overview</h3>
              <p>Revenue performance for this week</p>
            </div>

            <button className="icon-button" aria-label="More revenue options">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="revenue-summary">
            <strong>₹2,84,650</strong>
            <span className="trend-positive">
              <TrendingUp size={15} /> 12.8%
            </span>
          </div>

          <div className="chart">
            {chartData.map((item) => (
              <div className="chart-column" key={item.day}>
                <div className="chart-bar-area">
                  <div
                    className="chart-bar"
                    style={{ height: `${item.value}%` }}
                    title={`${item.day}: ${item.value}`}
                  />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest business operations</p>
            </div>

            <button className="text-button">
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="activity-list">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div className="activity-item" key={activity.title}>
                  <div className="activity-icon">
                    <Icon size={17} />
                  </div>

                  <div className="activity-info">
                    <strong>{activity.title}</strong>
                    <span>{activity.description}</span>
                  </div>

                  <time>{activity.time}</time>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <div className="demo-notice">
        <span className="demo-dot" />
        Demonstration data — real business data will be connected through the
        approved APIs.
      </div>
    </div>
  );
}
