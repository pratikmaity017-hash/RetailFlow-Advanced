const CORE_API_BASE_URL = (
  import.meta.env.VITE_CORE_API_BASE_URL || "http://localhost:3000"
)
  .trim()
  .replace(/\/+$/, "");

export class CoreApiError extends Error {
  constructor(message, status, data = null) {
    super(message);

    this.name = "CoreApiError";
    this.status = status;
    this.data = data;
  }
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, options = {}) {
  if (!CORE_API_BASE_URL) {
    throw new Error("Core API URL is not configured.");
  }

  const { method = "GET", body, signal, headers: customHeaders = {} } = options;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const headers = {
    Accept: "application/json",
    "X-Client-Type": "web",
    ...customHeaders,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${CORE_API_BASE_URL}${normalizedPath}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    signal,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      `Core API request failed with status ${response.status}.`;

    throw new CoreApiError(message, response.status, data);
  }

  return data;
}

export const coreAuthService = {
  login(credentials, options = {}) {
    return request("/api/auth/login", {
      method: "POST",
      body: credentials,
      signal: options.signal,
    });
  },

  refresh(options = {}) {
    return request("/api/auth/refresh", {
      method: "POST",
      body: {},
      signal: options.signal,
    });
  },

  getCurrentUser(accessToken, options = {}) {
    return request("/api/auth/me", {
      signal: options.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  logout(accessToken, options = {}) {
    return request("/api/auth/logout", {
      method: "POST",
      signal: options.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  logoutAll(accessToken, options = {}) {
    return request("/api/auth/logout-all", {
      method: "POST",
      signal: options.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
