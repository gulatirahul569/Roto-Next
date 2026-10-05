"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEdit3,
  FiExternalLink,
  FiImage,
  FiLoader,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import {
  deleteProduct,
  fetchProducts,
  updateProduct,
  uploadProductImage,
} from "../../../services/productService";
import {
  departmentOptions,
  getSubcategoryOptions,
} from "../../../data/departmentData";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function createSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getProductImages(product) {
  const allImages = [
    product?.image,
    ...(Array.isArray(product?.images) ? product.images : []),
  ].filter(Boolean);

  return Array.from(new Set(allImages));
}

function getStockStyle(stock) {
  const stockCount = Number(stock || 0);

  if (stockCount > 10) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (stockCount > 0) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function getSourceStyle(source) {
  if (source === "AMAZON") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (source === "VENDOR") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getSourceLabel(source) {
  if (source === "AMAZON") {
    return "Amazon";
  }

  if (source === "VENDOR") {
    return "Vendor";
  }

  return "Inventory";
}

function ProductImage({ product, size = "size-12", showCount = false }) {
  const images = getProductImages(product);
  const mainImage = images[0];

  if (!mainImage) {
    return (
      <div
        className={`grid ${size} shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-400`}
      >
        <FiImage size={18} />
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div
        className={`${size} overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50`}
      >
        <img
          src={mainImage}
          alt={product.name || "Product"}
          className="size-full object-cover"
        />
      </div>

      {showCount && images.length > 1 && (
        <span className="absolute -bottom-2 -right-2 rounded-full bg-zinc-950 px-1.5 py-0.5 text-[9px] font-black text-white">
          {images.length}
        </span>
      )}
    </div>
  );
}

function EditProductModal({
  product,
  isUploading,
  isSaving,
  onClose,
  onChange,
  onImageUpload,
  onAddImageUrl,
  onRemoveGalleryImage,
  onSetMainImage,
  onSave,
}) {
  const [newImageUrl, setNewImageUrl] = useState("");

  if (!product) {
    return null;
  }

  const isAmazonProduct = product.source === "AMAZON";

  const isExternalProduct =
    product.purchaseMode === "EXTERNAL_LINK" || isAmazonProduct;

  const isVendorProduct = product.source === "VENDOR";

  const galleryImages = getProductImages(product);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
              Product management
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
              Edit product
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isUploading}
            aria-label="Close product editor"
            className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-5 p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-700">
              Product source
            </span>

            <select
              name="source"
              value={product.source || "INVENTORY"}
              onChange={onChange}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
            >
              <option value="INVENTORY">Roto Inventory</option>
              <option value="VENDOR">Vendor Product</option>
              <option value="AMAZON">Amazon Affiliate Product</option>
            </select>
          </label>

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <div>
              <p className="text-sm font-black text-violet-950">
                Store placement
              </p>

              <p className="mt-1 text-xs leading-5 text-violet-800">
                Choose where customers can find this product in the Men, Women,
                Kids, Home, or Accessories navigation.
              </p>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  Department
                </span>

                <select
                  name="department"
                  value={product.department || "ALL"}
                  onChange={onChange}
                  className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                >
                  <option value="ALL">All Products only</option>

                  {departmentOptions.map((department) => (
                    <option key={department.key} value={department.key}>
                      {department.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  Subcategory
                </span>

                <select
                  name="subcategory"
                  value={product.subcategory || ""}
                  onChange={onChange}
                  disabled={!product.department || product.department === "ALL"}
                  className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                >
                  <option value="">
                    {product.department && product.department !== "ALL"
                      ? "Select subcategory"
                      : "Choose a department first"}
                  </option>

                  {getSubcategoryOptions(product.department).map(
                    (subcategory) => (
                      <option key={subcategory.slug} value={subcategory.slug}>
                        {subcategory.title}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            {product.department &&
              product.department !== "ALL" &&
              product.subcategory && (
                <p className="mt-4 rounded-xl border border-violet-200 bg-white/70 px-4 py-3 text-xs font-bold text-violet-900">
                  Product route: /category/
                  {product.department.toLowerCase()}/{product.subcategory}
                </p>
              )}
          </div>

          {isAmazonProduct && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-black text-orange-950">
                Amazon external product
              </p>

              <p className="mt-1 text-xs leading-5 text-orange-800">
                Customers cannot add this product to the Roto cart. They will be
                sent to Amazon through the affiliate link below.
              </p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-zinc-700">
                Product name
              </span>

              <input
                name="name"
                value={product.name || ""}
                onChange={onChange}
                placeholder="Product name"
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-zinc-700">
                Category
              </span>

              <input
                name="category"
                value={product.category || ""}
                onChange={onChange}
                placeholder="Example: Casual"
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-bold text-zinc-700">
                Brand
              </span>

              <input
                type="text"
                name="brand"
                value={product.brand || ""}
                onChange={onChange}
                placeholder="Example: Roto, Puma, Noise, Adidas"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
              />
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-bold text-zinc-700">
                  Product images
                </span>

                <p className="mt-1 text-xs text-zinc-500">
                  The first image is the main product image.
                </p>
              </div>

              <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-extrabold text-zinc-600">
                {galleryImages.length} image
                {galleryImages.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-5">
              <div className="flex flex-col items-center justify-center text-center">
                {isUploading ? (
                  <>
                    <div className="grid size-20 place-items-center rounded-2xl bg-white text-zinc-600 shadow-sm">
                      <FiLoader size={25} className="animate-spin" />
                    </div>

                    <p className="mt-3 text-sm font-bold text-zinc-700">
                      Uploading image...
                    </p>
                  </>
                ) : galleryImages[0] ? (
                  <img
                    src={galleryImages[0]}
                    alt={product.name || "Product preview"}
                    className="size-28 rounded-2xl border border-zinc-200 bg-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="grid size-20 place-items-center rounded-2xl bg-white text-zinc-400 shadow-sm">
                    <FiImage size={27} />
                  </div>
                )}

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-zinc-800">
                    <FiUpload size={16} />
                    Replace main image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(event) => {
                        const selectedFile = event.target.files?.[0];

                        if (selectedFile) {
                          onImageUpload(selectedFile, "main");
                        }

                        event.target.value = "";
                      }}
                    />
                  </label>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-extrabold text-zinc-700 transition hover:bg-zinc-100">
                    <FiPlus size={16} />
                    Add gallery image
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={isUploading}
                      onChange={(event) => {
                        const selectedFiles = Array.from(
                          event.target.files || [],
                        );

                        selectedFiles.forEach((file) => {
                          onImageUpload(file, "gallery");
                        });

                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(event) => setNewImageUrl(event.target.value)}
                placeholder="Paste an additional image URL"
                className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
              />

              <button
                type="button"
                onClick={() => {
                  onAddImageUrl(newImageUrl);
                  setNewImageUrl("");
                }}
                disabled={!newImageUrl.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                <FiPlus size={16} />
                Add
              </button>
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className={`group relative overflow-hidden rounded-xl border bg-white ${
                      index === 0
                        ? "border-zinc-950 ring-2 ring-zinc-950/10"
                        : "border-zinc-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name || "Product"} view ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-zinc-950 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                        Main
                      </span>
                    )}

                    <div className="absolute inset-x-1 top-1 flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => onSetMainImage(image)}
                          className="rounded-lg bg-white px-2 py-1 text-[9px] font-extrabold text-zinc-950 shadow"
                        >
                          Set main
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveGalleryImage(image)}
                        aria-label={`Remove image ${index + 1}`}
                        className="grid size-6 place-items-center rounded-full bg-red-500 text-white shadow"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {isAmazonProduct && (
            <div className="space-y-5 rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <div>
                <p className="text-sm font-black text-orange-950">
                  Amazon affiliate details
                </p>

                <p className="mt-1 text-xs leading-5 text-orange-800">
                  Add an Amazon Associate SiteStripe link for this product.
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  Amazon affiliate link
                </span>

                <input
                  type="url"
                  name="externalUrl"
                  value={product.externalUrl || ""}
                  onChange={onChange}
                  placeholder="https://www.amazon.in/dp/PRODUCT-ASIN?tag=yourtag-21"
                  required
                  className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  Amazon ASIN
                </span>

                <input
                  type="text"
                  name="amazonAsin"
                  value={product.amazon?.asin || ""}
                  onChange={onChange}
                  placeholder="Example: B0ABCDE123"
                  maxLength={10}
                  className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm uppercase outline-none transition focus:border-orange-500"
                />
              </label>

              <div className="rounded-xl border border-orange-200 bg-white/70 px-4 py-3 text-xs font-semibold text-orange-900">
                Customer button: Explore on Amazon ↗
              </div>
            </div>
          )}

          {isVendorProduct && (
            <div className="space-y-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div>
                <p className="text-sm font-black text-blue-950">
                  Vendor information
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-800">
                  These fields support future vendor stock synchronization.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-700">
                    Vendor name
                  </span>

                  <input
                    name="vendorName"
                    value={product.vendor?.name || ""}
                    onChange={onChange}
                    placeholder="Vendor or distributor name"
                    className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-700">
                    Vendor SKU
                  </span>

                  <input
                    name="vendorSku"
                    value={product.vendor?.sku || ""}
                    onChange={onChange}
                    placeholder="Vendor SKU"
                    className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-700">
                    Vendor product ID
                  </span>

                  <input
                    name="vendorProductId"
                    value={product.vendor?.vendorProductId || ""}
                    onChange={onChange}
                    placeholder="Vendor product ID"
                    className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-700">
                    Vendor product URL
                  </span>

                  <input
                    type="url"
                    name="vendorUrl"
                    value={product.vendor?.vendorUrl || ""}
                    onChange={onChange}
                    placeholder="https://vendor.example/product"
                    className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {!isAmazonProduct && (
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-zinc-700">
                Customer purchase method
              </span>

              <select
                name="purchaseMode"
                value={product.purchaseMode || "CHECKOUT"}
                onChange={onChange}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
              >
                <option value="CHECKOUT">Roto checkout</option>
                <option value="EXTERNAL_LINK">Open external seller link</option>
              </select>
            </label>
          )}

          {!isAmazonProduct && product.purchaseMode === "EXTERNAL_LINK" && (
            <div className="space-y-5 rounded-2xl border border-purple-200 bg-purple-50 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  External product URL
                </span>

                <input
                  name="externalUrl"
                  type="url"
                  value={product.externalUrl || ""}
                  onChange={onChange}
                  placeholder="https://partner.example/product"
                  required
                  className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  Customer button text
                </span>

                <input
                  name="externalButtonText"
                  value={product.externalButtonText || ""}
                  onChange={onChange}
                  placeholder="Explore Product"
                  className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                />
              </label>
            </div>
          )}

          {!isExternalProduct && (
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  Selling price
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={product.price ?? ""}
                  onChange={onChange}
                  placeholder="899"
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
                />

                <span className="mt-1 block text-xs text-zinc-500">
                  Final customer price.
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  Compare-at price
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="compareAtPrice"
                  value={product.compareAtPrice ?? ""}
                  onChange={onChange}
                  placeholder="1299"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
                />

                <span className="mt-1 block text-xs text-zinc-500">
                  Original price shown crossed out.
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-700">
                  Stock quantity
                </span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  name="stock"
                  value={product.stock ?? ""}
                  onChange={onChange}
                  placeholder="10"
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:bg-white"
                />
              </label>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <input
              type="checkbox"
              name="isActive"
              checked={product.isActive !== false}
              onChange={onChange}
              className="mt-0.5 size-4 accent-zinc-950"
            />

            <span>
              <span className="block text-sm font-bold text-zinc-800">
                Product is active
              </span>

              <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                Hidden products remain visible in Admin but are not shown to
                customers.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={product.isFeatured === true}
              onChange={onChange}
              className="mt-0.5 size-4 accent-blue-600"
            />

            <span>
              <span className="block text-sm font-bold text-blue-950">
                Mark as featured product
              </span>

              <span className="mt-0.5 block text-xs leading-5 text-blue-800">
                Show this product in the Featured section for its department.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <input
              type="checkbox"
              name="isNewDrop"
              checked={
                String(product.newCategory || "").toLowerCase() === "new"
              }
              onChange={onChange}
              className="mt-0.5 size-4 accent-amber-600"
            />

            <span>
              <span className="block text-sm font-bold text-amber-950">
                Show in New Drops
              </span>

              <span className="mt-0.5 block text-xs leading-5 text-amber-800">
                Display this product in the homepage New Drops section and New
                in department rows.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isSaving ? (
                <>
                  <FiLoader size={17} className="animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <FiCheckCircle size={17} />
                  Save changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isUploading}
              className="rounded-xl border border-zinc-300 px-5 py-3.5 text-sm font-extrabold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteProductModal({ product, isDeleting, onClose, onConfirm }) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600">
          <FiTrash2 size={22} />
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-tight text-zinc-950">
          Delete product?
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-600">
          You are about to permanently delete{" "}
          <span className="font-bold text-zinc-950">{product.name}</span>. This
          action cannot be undone.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isDeleting ? (
              <>
                <FiLoader size={17} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 size={17} />
                Delete product
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-zinc-300 px-5 py-3.5 text-sm font-extrabold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep product
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadProducts = async ({ showRefreshState = false } = {}) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage("");

      const data = await fetchProducts(token);
      const productList = data?.products || data || [];

      setProducts(Array.isArray(productList) ? productList : []);
    } catch (error) {
      console.error("Product loading error:", error);

      setErrorMessage(
        error.message || "Unable to load products. Please try again.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      return (
        String(product.name || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.brand || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.category || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.department || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.subcategory || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.source || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [products, searchTerm]);
  const openProductEditor = (product) => {
    const images = getProductImages(product);

    setEditingProduct({
      ...product,
      image: images[0] || "",
      images,
    });
  };

  const handleEditFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditingProduct((currentProduct) => {
      if (!currentProduct) {
        return currentProduct;
      }

      if (name === "isActive") {
        return {
          ...currentProduct,
          isActive: checked,
        };
      }

      if (name === "isFeatured") {
        return {
          ...currentProduct,
          isFeatured: checked,
        };
      }

      if (name === "isNewDrop") {
        return {
          ...currentProduct,
          newCategory: checked
            ? "new"
            : createSlug(currentProduct.category || "") || "all",
        };
      }

      if (name === "department") {
        return {
          ...currentProduct,
          department: value,
          subcategory: "",
        };
      }

      if (name === "source") {
        if (value === "AMAZON") {
          return {
            ...currentProduct,
            source: "AMAZON",
            purchaseMode: "EXTERNAL_LINK",
            externalButtonText: "Explore on Amazon",
            price: 0,
            stock: 0,
          };
        }

        return {
          ...currentProduct,
          source: value,
          purchaseMode:
            currentProduct.purchaseMode === "EXTERNAL_LINK"
              ? "EXTERNAL_LINK"
              : "CHECKOUT",
        };
      }

      if (name === "purchaseMode") {
        return {
          ...currentProduct,
          purchaseMode: value,
          externalButtonText:
            value === "EXTERNAL_LINK" && !currentProduct.externalButtonText
              ? "Explore Product"
              : currentProduct.externalButtonText,
        };
      }

      if (name === "amazonAsin") {
        return {
          ...currentProduct,
          amazon: {
            ...currentProduct.amazon,
            asin: value.toUpperCase().replace(/\s/g, ""),
          },
        };
      }

      if (
        name === "vendorName" ||
        name === "vendorSku" ||
        name === "vendorProductId" ||
        name === "vendorUrl"
      ) {
        const vendorFieldMap = {
          vendorName: "name",
          vendorSku: "sku",
          vendorProductId: "vendorProductId",
          vendorUrl: "vendorUrl",
        };

        return {
          ...currentProduct,
          vendor: {
            ...currentProduct.vendor,
            [vendorFieldMap[name]]: value,
          },
        };
      }

      return {
        ...currentProduct,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleEditImageUpload = async (file, uploadMode = "gallery") => {
    if (!file || !token) {
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage("");

      const response = await uploadProductImage(file, token);

      const imageUrl = response?.imageUrl || response?.image || "";

      if (!imageUrl) {
        throw new Error("The backend did not return an uploaded image URL.");
      }

      setEditingProduct((currentProduct) => {
        if (!currentProduct) {
          return currentProduct;
        }

        const currentImages = getProductImages(currentProduct);

        const updatedImages =
          uploadMode === "main"
            ? [imageUrl, ...currentImages.filter((image) => image !== imageUrl)]
            : [...currentImages, imageUrl];

        const images = Array.from(new Set(updatedImages));

        return {
          ...currentProduct,
          image: images[0] || "",
          images,
        };
      });

      setMessage(
        uploadMode === "main"
          ? "Main product image updated successfully."
          : "Product gallery image uploaded successfully.",
      );
    } catch (error) {
      console.error("Product image upload error:", error);

      setErrorMessage(
        error.message || "Image upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = (imageUrl) => {
    const cleanedImageUrl = String(imageUrl || "").trim();

    if (!cleanedImageUrl) {
      return;
    }

    setEditingProduct((currentProduct) => {
      if (!currentProduct) {
        return currentProduct;
      }

      const images = Array.from(
        new Set([...getProductImages(currentProduct), cleanedImageUrl]),
      );

      return {
        ...currentProduct,
        image: images[0] || "",
        images,
      };
    });
  };

  const handleRemoveGalleryImage = (imageToRemove) => {
    setEditingProduct((currentProduct) => {
      if (!currentProduct) {
        return currentProduct;
      }

      const images = getProductImages(currentProduct).filter(
        (image) => image !== imageToRemove,
      );

      return {
        ...currentProduct,
        image: images[0] || "",
        images,
      };
    });
  };

  const handleSetMainImage = (imageToSetAsMain) => {
    setEditingProduct((currentProduct) => {
      if (!currentProduct) {
        return currentProduct;
      }

      const currentImages = getProductImages(currentProduct);

      const images = [
        imageToSetAsMain,
        ...currentImages.filter((image) => image !== imageToSetAsMain),
      ];

      return {
        ...currentProduct,
        image: images[0],
        images,
      };
    });
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    if (!editingProduct || !token) {
      setErrorMessage("Your admin session has expired. Please log in again.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const isAmazonProduct = editingProduct.source === "AMAZON";

      const isExternalProduct =
        editingProduct.purchaseMode === "EXTERNAL_LINK" || isAmazonProduct;

      const galleryImages = getProductImages(editingProduct);

      if (galleryImages.length === 0) {
        throw new Error("Please add at least one product image.");
      }

      const sellingPrice = isExternalProduct
        ? 0
        : Number(editingProduct.price || 0);

      const compareAtPrice =
        !isExternalProduct && editingProduct.compareAtPrice
          ? Number(editingProduct.compareAtPrice)
          : null;

      if (
        compareAtPrice !== null &&
        compareAtPrice > 0 &&
        compareAtPrice <= sellingPrice
      ) {
        throw new Error(
          "Compare-at price must be greater than the selling price.",
        );
      }

      const updatedProduct = {
        ...editingProduct,

        image: galleryImages[0],
        images: galleryImages,

        price: sellingPrice,
        compareAtPrice,

        stock: isExternalProduct ? 0 : Number(editingProduct.stock || 0),

        purchaseMode: isAmazonProduct
          ? "EXTERNAL_LINK"
          : editingProduct.purchaseMode || "CHECKOUT",

        externalButtonText: isAmazonProduct
          ? "Explore on Amazon"
          : editingProduct.externalButtonText || "",
      };

      await updateProduct(updatedProduct._id, updatedProduct, token);

      setEditingProduct(null);
      setMessage("Product updated successfully.");

      await loadProducts();
    } catch (error) {
      console.error("Product update error:", error);

      setErrorMessage(
        error.message || "Unable to update product. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct || !token) {
      setErrorMessage("Your admin session has expired. Please log in again.");
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage("");

      await deleteProduct(deletingProduct._id, token);

      setDeletingProduct(null);
      setMessage("Product deleted successfully.");

      await loadProducts();
    } catch (error) {
      console.error("Product delete error:", error);

      setErrorMessage(
        error.message || "Unable to delete product. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Inventory management
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Products.
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Manage inventory, vendor products, Amazon products, pricing, and
            product visibility.
          </p>
        </div>

        <Link
          href="/admin/add-product"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
        >
          <FiPlus size={17} />
          Add product
        </Link>
      </section>

      {message && (
        <div className="mt-7 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <div className="flex items-start gap-3">
            <FiCheckCircle size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-bold">{message}</p>
          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Close success message"
            className="text-emerald-700"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mt-7 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <FiAlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
            aria-label="Close error message"
            className="text-red-700"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      <section className="mt-7 flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search name, brand, department, collection, category, or source..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
          />
        </div>

        <button
          type="button"
          onClick={() => loadProducts({ showRefreshState: true })}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-extrabold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl bg-zinc-100"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="grid min-h-80 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-zinc-100 text-zinc-500">
                <FiPackage size={24} />
              </div>

              <h2 className="mt-5 text-xl font-black tracking-tight text-zinc-950">
                No products found.
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Try another search term or add a new product.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Price / Type</th>
                    <th className="px-6 py-4">Placement</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.map((product) => {
                    const isExternalProduct =
                      product.purchaseMode === "EXTERNAL_LINK" ||
                      product.source === "AMAZON";

                    const isNewDrop =
                      String(product.newCategory || "").toLowerCase() === "new";

                    const imageCount = getProductImages(product).length;

                    return (
                      <tr
                        key={product._id}
                        className="transition hover:bg-zinc-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <ProductImage product={product} showCount />

                            <div className="min-w-0">
                              <p className="max-w-56 truncate text-sm font-bold text-zinc-950">
                                {product.name}
                              </p>

                              <p className="mt-1 max-w-56 truncate text-xs text-zinc-400">
                                {product.brand ? `${product.brand} · ` : ""}
                                ID: {String(product._id).slice(-6)}
                              </p>

                              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                                {imageCount} image
                                {imageCount === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getSourceStyle(
                              product.source,
                            )}`}
                          >
                            {getSourceLabel(product.source)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {isExternalProduct ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-700">
                              <FiExternalLink size={14} />
                              External product
                            </span>
                          ) : (
                            <span className="text-sm font-black text-zinc-950">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex max-w-48 flex-wrap gap-2">
                            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                              {product.department || "ALL"}
                            </span>

                            {product.subcategory && (
                              <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold capitalize text-zinc-600">
                                {product.subcategory.replace(/-/g, " ")}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex max-w-48 flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${
                                product.isActive === false
                                  ? "border-zinc-200 bg-zinc-100 text-zinc-500"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {product.isActive === false ? "Hidden" : "Active"}
                            </span>

                            {product.isFeatured && (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                                Featured
                              </span>
                            )}

                            {isNewDrop && (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                                New Drop
                              </span>
                            )}

                            {!isExternalProduct && (
                              <span
                                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getStockStyle(
                                  product.stock,
                                )}`}
                              >
                                {Number(product.stock || 0) > 0
                                  ? `${product.stock} in stock`
                                  : "Out of stock"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openProductEditor(product)}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 transition hover:bg-blue-100"
                            >
                              <FiEdit3 size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingProduct(product)}
                              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 transition hover:bg-red-100"
                            >
                              <FiTrash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 p-4 md:hidden">
              {filteredProducts.map((product) => {
                const isExternalProduct =
                  product.purchaseMode === "EXTERNAL_LINK" ||
                  product.source === "AMAZON";

                const isNewDrop =
                  String(product.newCategory || "").toLowerCase() === "new";

                const imageCount = getProductImages(product).length;

                return (
                  <article
                    key={product._id}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex gap-4">
                      <ProductImage
                        product={product}
                        size="size-20"
                        showCount
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h2 className="truncate text-sm font-black text-zinc-950">
                            {product.name}
                          </h2>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getSourceStyle(
                              product.source,
                            )}`}
                          >
                            {getSourceLabel(product.source)}
                          </span>
                        </div>

                        {product.brand && (
                          <p className="mt-1 truncate text-xs font-semibold text-zinc-500">
                            {product.brand}
                          </p>
                        )}

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                          {imageCount} image
                          {imageCount === 1 ? "" : "s"}
                        </p>

                        {isExternalProduct ? (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700">
                            <FiExternalLink size={14} />
                            External product
                          </p>
                        ) : (
                          <p className="mt-2 text-sm font-bold text-zinc-950">
                            {formatPrice(product.price)}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                            {product.department || "ALL"}
                          </span>

                          {product.subcategory && (
                            <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[10px] font-bold capitalize text-zinc-600">
                              {product.subcategory.replace(/-/g, " ")}
                            </span>
                          )}

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              product.isActive === false
                                ? "border-zinc-200 bg-zinc-100 text-zinc-500"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {product.isActive === false ? "Hidden" : "Active"}
                          </span>

                          {product.isFeatured && (
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                              Featured
                            </span>
                          )}

                          {isNewDrop && (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                              New Drop
                            </span>
                          )}

                          {!isExternalProduct && (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStockStyle(
                                product.stock,
                              )}`}
                            >
                              {Number(product.stock || 0) > 0
                                ? `${product.stock} in stock`
                                : "Out of stock"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => openProductEditor(product)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100"
                      >
                        <FiEdit3 size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingProduct(product)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:bg-red-100"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <EditProductModal
        product={editingProduct}
        isUploading={isUploading}
        isSaving={isSaving}
        onClose={() => {
          if (!isSaving && !isUploading) {
            setEditingProduct(null);
          }
        }}
        onChange={handleEditFieldChange}
        onImageUpload={handleEditImageUpload}
        onAddImageUrl={handleAddImageUrl}
        onRemoveGalleryImage={handleRemoveGalleryImage}
        onSetMainImage={handleSetMainImage}
        onSave={handleSaveProduct}
      />

      <DeleteProductModal
        product={deletingProduct}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeletingProduct(null);
          }
        }}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}
