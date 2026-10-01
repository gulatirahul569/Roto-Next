import { apiRequest } from "../lib/api";

function createSearchParams(filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams;
}

/*
  Compatible with your existing calls:

  fetchProducts()
  fetchProducts(token)

  New supported usage:

  fetchProducts(undefined, {
    department: "MEN",
    subcategory: "t-shirts",
  })
*/
export function fetchProducts(token, filters = {}) {
  const searchParams = createSearchParams(filters);

  const query = searchParams.toString();

  return apiRequest(`/products${query ? `?${query}` : ""}`, {
    token,
  });
}

export function searchProducts(query, token) {
  const searchParams = createSearchParams({
    search: query,
  });

  return apiRequest(`/products?${searchParams.toString()}`, {
    token,
  });
}

export function fetchProductById(id, token) {
  return apiRequest(`/products/${id}`, {
    token,
  });
}

export function createProduct(productData, token) {
  return apiRequest("/products/create", {
    method: "POST",
    body: productData,
    token,
  });
}

export function updateProduct(id, productData, token) {
  return apiRequest(`/products/${id}`, {
    method: "PUT",
    body: productData,
    token,
  });
}

export function deleteProduct(id, token) {
  return apiRequest(`/products/${id}`, {
    method: "DELETE",
    token,
  });
}

export function uploadProductImage(file, token) {
  const formData = new FormData();

  formData.append("image", file);

  return apiRequest("/upload", {
    method: "POST",
    body: formData,
    token,
  });
}