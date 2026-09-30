import { apiRequest } from "../lib/api";

export function getAllUsers(token) {
  return apiRequest("/users", {
    token,
  });
}