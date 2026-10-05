import imageCompression from "browser-image-compression";
import { upload } from "@vercel/blob/client";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024;

function getSafeFileName(value = "store-image") {
  return (
    String(value)
      .toLowerCase()
      .trim()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "store-image"
  );
}

function getUploadSettings(destination) {
  if (destination.startsWith("banners/")) {
    return {
      maxSizeMB: 0.7,
      maxWidthOrHeight: 1920,
    };
  }

  if (destination.startsWith("products/")) {
    return {
      maxSizeMB: 0.45,
      maxWidthOrHeight: 1400,
    };
  }

  if (destination.startsWith("logos/")) {
    return {
      maxSizeMB: 0.25,
      maxWidthOrHeight: 1000,
    };
  }

  return {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1200,
  };
}

function isAllowedDestination(destination) {
  return [
    "products/",
    "categories/",
    "banners/",
    "logos/",
    "promos/",
    "home/categories/",
  ].some((folder) => destination.startsWith(folder));
}

function getMediaType(destination) {
  if (destination.startsWith("banners/")) {
    return "banner";
  }

  if (destination.startsWith("categories/")) {
    return "subcategory";
  }

  if (destination.startsWith("home/categories/")) {
    return "category-showcase";
  }

  if (destination.startsWith("products/")) {
    return "product";
  }

  if (destination.startsWith("logos/")) {
    return "logo";
  }

  if (destination.startsWith("promos/")) {
    return "promo";
  }

  return "other";
}
export async function uploadStoreMedia(file, token, destination) {
  if (!file) {
    throw new Error("Please select an image file.");
  }

  if (!token) {
    throw new Error("Your admin session has expired. Please log in again.");
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }

  if (file.size > MAX_ORIGINAL_SIZE) {
    throw new Error("Original image must be 10 MB or smaller.");
  }

  const normalizedDestination = String(destination || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  if (!isAllowedDestination(normalizedDestination)) {
    throw new Error("Invalid media destination selected.");
  }

  const settings = getUploadSettings(normalizedDestination);

  const compressedFile = await imageCompression(file, {
    ...settings,
    fileType: "image/webp",
    useWebWorker: true,
    initialQuality: 0.82,
  });

  const safeFileName = getSafeFileName(
    normalizedDestination.split("/").pop() || file.name,
  );

  const folderPath = normalizedDestination.split("/").slice(0, -1).join("/");

  const pathname = `${folderPath}/${safeFileName}.webp`;

  const blob = await upload(pathname, compressedFile, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    clientPayload: JSON.stringify({
      token,
      destination: normalizedDestination,
      mediaType: getMediaType(normalizedDestination),
    }),
  });

  return {
    imageUrl: blob.url,
    pathname: blob.pathname,
    destination: normalizedDestination,
    mediaType: getMediaType(normalizedDestination),
    originalSize: file.size,
    compressedSize: compressedFile.size,
  };
}

export async function importStoreMediaFromUrl(imageUrl, token, destination) {
  if (!imageUrl) {
    throw new Error("Please paste an image URL.");
  }

  if (!token) {
    throw new Error("Your admin session has expired. Please log in again.");
  }

  const normalizedDestination = String(destination || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  if (!isAllowedDestination(normalizedDestination)) {
    throw new Error("Invalid media destination selected.");
  }

  const response = await fetch("/api/media/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      imageUrl,
      destination: normalizedDestination,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to import image from URL.");
  }

  return {
    ...data,
    destination: normalizedDestination,
    mediaType: getMediaType(normalizedDestination),
  };
}
