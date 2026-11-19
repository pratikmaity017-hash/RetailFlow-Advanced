import { env } from "../../config/env.js";

export class CoreApiError extends Error {
  constructor(message, statusCode = 503, code = "CORE_API_ERROR") {
    super(message);

    this.name = "CoreApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function requestCoreApi(
  path,
  { token, method = "GET", body, timeoutMs = 5000 } = {},
) {
  if (!env.coreApiBaseUrl) {
    throw new CoreApiError(
      "Core API is not configured.",
      503,
      "CORE_API_NOT_CONFIGURED",
    );
  }

  if (!token) {
    throw new CoreApiError(
      "Authentication token is required.",
      401,
      "AUTH_TOKEN_REQUIRED",
    );
  }

  const baseUrl = env.coreApiBaseUrl.replace(/\/+$/, "");
  const endpoint = path.startsWith("/") ? path : `/${path}`;

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const data = await response.json().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    const isTimeout = error.name === "TimeoutError";

    throw new CoreApiError(
      isTimeout
        ? "Core API request timed out."
        : "Core API is currently unavailable.",
      503,
      isTimeout ? "CORE_API_TIMEOUT" : "CORE_API_UNAVAILABLE",
    );
  }
}
