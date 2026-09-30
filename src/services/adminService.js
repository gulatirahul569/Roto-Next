import { apiRequest } from "../lib/api";

export function getAdminStats(token) {
  return apiRequest("/admin/stats", {
    token,
  });
}