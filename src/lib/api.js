export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    token,
    headers = {},
    cache = "no-store",
  } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const requestHeaders = {
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(`/api${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      cache,
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}