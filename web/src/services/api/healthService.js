import { apiClient } from "./apiClient";

export const healthService = {
  getHealth() {
    return apiClient.get("/health");
  },

  getReadiness() {
    return apiClient.get("/health/ready");
  },
};
