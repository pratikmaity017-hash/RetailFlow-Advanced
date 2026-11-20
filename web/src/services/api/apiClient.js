const API_BASE_URL = (import.meta.env.VITE_ADVANCED_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);

    this.name = "ApiError";
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
  if (!API_BASE_URL) {
    throw new Error(
      "Advanced API URL is not configured. Set VITE_ADVANCED_API_BASE_URL.",
    );
  }

  if (typeof path !== "string" || !path.trim()) {
    throw new Error("A valid API path is required.");
  }

  const { method = "GET", headers = {}, body, signal } = options;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  let requestBody;

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && data.message
        ? data.message
        : `API request failed with status ${response.status}.`;

    throw new ApiError(message, response.status, data);
  }

  return data;
}

export const apiClient = {
  request,

  get(path, options = {}) {
    return request(path, {
      ...options,
      method: "GET",
    });
  },

  post(path, body, options = {}) {
    return request(path, {
      ...options,
      method: "POST",
      body,
    });
  },

  put(path, body, options = {}) {
    return request(path, {
      ...options,
      method: "PUT",
      body,
    });
  },

  patch(path, body, options = {}) {
    return request(path, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  delete(path, options = {}) {
    return request(path, {
      ...options,
      method: "DELETE",
    });
  },
};
