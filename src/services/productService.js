import { upload } from "@vercel/blob/client";
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

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getSafeFileName(fileName = "product-image") {
  const normalizedName = String(fileName)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalizedName || "product-image";
}

export async function uploadProductImage(file, token) {
  if (!file) {
    throw new Error("Please select an image file.");
  }

  if (!token) {
    throw new Error("Your admin session has expired. Please log in again.");
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image size must be 5 MB or smaller.");
  }

  const safeFileName = getSafeFileName(file.name);

  const pathname = `products/${Date.now()}-${safeFileName}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",

    clientPayload: JSON.stringify({
      token,
    }),
  });

  return {
    imageUrl: blob.url,
  };
}

export function fetchProductReviews(productId, token) {
  return apiRequest(`/products/${productId}/reviews`, {
    token,
  });
}

export function submitProductReview(productId, reviewData, token) {
  return apiRequest(`/products/${productId}/reviews`, {
    method: "POST",
    body: reviewData,
    token,
  });
}

export function deleteProductReview(productId, token) {
  return apiRequest(`/products/${productId}/reviews`, {
    method: "DELETE",
    token,
  });
}

export function fetchTopReviews(limit = 4) {
  return apiRequest(`/reviews/top?limit=${limit}`);
}