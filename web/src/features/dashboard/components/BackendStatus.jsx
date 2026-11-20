import { useEffect, useState } from "react";
import { healthService } from "../../../services/api/healthService";

export default function BackendStatus() {
  const [status, setStatus] = useState("checking");
  const [environment, setEnvironment] = useState(null);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function checkBackend() {
      setStatus("checking");
      setError("");

      try {
        const response = await healthService.getHealth();

        if (response?.success && response?.data?.status === "ok") {
          setStatus("connected");
          setEnvironment(response.data.environment ?? null);
        } else {
          setStatus("error");
          setError("Unexpected health response.");
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setStatus("error");
        setError(err.message || "Unable to connect to backend.");
      }
    }

    checkBackend();

    return () => controller.abort();
  }, [retryCount]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        padding: "12px 16px",
        marginBottom: "20px",
        border: "1px solid var(--border-color, #ddd)",
        borderRadius: "12px",
      }}
    >
      <div>
        <strong>Advanced Backend</strong>

        <div style={{ fontSize: "13px", marginTop: "4px" }}>
          {status === "checking" && "Checking connection..."}
          {status === "connected" &&
            `Connected${environment ? ` · ${environment}` : ""}`}
          {status === "error" && error}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          aria-label={`Backend status: ${status}`}
          style={{
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            background:
              status === "connected"
                ? "#16a34a"
                : status === "error"
                  ? "#dc2626"
                  : "#d97706",
          }}
        />

        <span style={{ fontSize: "13px" }}>
          {status === "checking" && "Checking"}
          {status === "connected" && "Online"}
          {status === "error" && "Offline"}
        </span>

        {status === "error" && (
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
