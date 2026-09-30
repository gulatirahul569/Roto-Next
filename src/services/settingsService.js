import { apiRequest } from "../lib/api";

export function getStoreSettings(token) {
  return apiRequest("/settings", {
    token,
  });
}

export function updateStoreSettings(settings, token) {
  return apiRequest("/settings", {
    method: "PUT",
    body: settings,
    token,
  });
}