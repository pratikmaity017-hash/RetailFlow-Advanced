import { env } from "../../config/env.js";

let isChecking = false;

let coreApiStatus = {
  configured: Boolean(env.coreApiBaseUrl),
  available: false,
  state: env.coreApiBaseUrl ? "unknown" : "not_configured",
  httpStatus: null,
  lastCheckedAt: null,
};

export function getCoreApiStatus() {
  return { ...coreApiStatus };
}

export async function checkCoreApiAvailability() {
  if (!env.coreApiBaseUrl) {
    coreApiStatus = {
      ...coreApiStatus,
      available: false,
      state: "not_configured",
      httpStatus: null,
      lastCheckedAt: new Date().toISOString(),
    };

    return coreApiStatus;
  }

  if (isChecking) {
    return coreApiStatus;
  }

  isChecking = true;

  try {
    // Any HTTP response means the Core server is reachable.
    // A 404 at the root URL still confirms network connectivity.
    const response = await fetch(env.coreApiBaseUrl, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });

    coreApiStatus = {
      configured: true,
      available: true,
      state: "available",
      httpStatus: response.status,
      lastCheckedAt: new Date().toISOString(),
    };
  } catch (error) {
    coreApiStatus = {
      configured: true,
      available: false,
      state: "unavailable",
      httpStatus: null,
      lastCheckedAt: new Date().toISOString(),
    };

    console.error("Core API check failed:", error.message);
  } finally {
    isChecking = false;
  }

  return coreApiStatus;
}

export function startCoreApiMonitor() {
  // Run one check immediately.
  checkCoreApiAvailability();

  // Then check every 15 seconds.
  const monitor = setInterval(() => {
    checkCoreApiAvailability();
  }, 15000);

  // This monitor should not keep Node.js alive during shutdown.
  monitor.unref();

  return monitor;
}
