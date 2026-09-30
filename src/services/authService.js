import { apiRequest } from "../lib/api";

export function registerUser(formData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: formData,
  });
}

export function loginUser(formData) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: formData,
  });
}

export function googleLoginUser(credential) {
  return apiRequest("/auth/google", {
    method: "POST",
    body: { credential },
  });
}