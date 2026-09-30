import { apiRequest } from "../lib/api";

export function fetchProducts() {
  return apiRequest("/products");
}

export function searchProducts(query) {
  const searchParams = new URLSearchParams({
    search: query,
  });

  return apiRequest(`/products?${searchParams.toString()}`);
}

export function fetchProductById(id) {
  return apiRequest(`/products/${id}`);
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