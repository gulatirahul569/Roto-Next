"use client";

import { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  departmentOptions,
  getSubcategoryOptions,
} from "../../../data/departmentData";
import { createProduct } from "../../../services/productService";

const initialForm = {
  title: "",
  slug: "",

  description: "",
  shortDescription: "",
  brand: "",
  category: "",

  department: "ALL",
  subcategory: "",

  image: "",
  additionalImages: "",

  price: "",
  compareAtPrice: "",
  stock: "",

  isActive: true,
  isFeatured: false,
  isNewDrop: false,

  source: "INVENTORY",
  purchaseMode: "CHECKOUT",

  externalUrl: "",
  externalButtonText: "",

  vendorName: "",
  vendorSku: "",
  vendorProductId: "",
  vendorUrl: "",

  amazonAsin: "",
};

function createSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isValidExternalUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isAmazonUrl(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();

    return ["amazon.in", "www.amazon.in", "amzn.in", "amzn.to"].includes(
      hostname,
    );
  } catch {
    return false;
  }
}

export default function AddProductPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAmazon = form.source === "AMAZON";
  const isVendor = form.source === "VENDOR";
  const isExternal = form.purchaseMode === "EXTERNAL_LINK";

  const subcategoryOptions = useMemo(() => {
    return getSubcategoryOptions(form.department);
  }, [form.department]);

  const additionalImageList = useMemo(() => {
    const mainImage = form.image.trim();

    return Array.from(
      new Set(
        form.additionalImages
          .split("\n")
          .map((image) => image.trim())
          .filter(Boolean)
          .filter((image) => image !== mainImage),
      ),
    );
  }, [form.additionalImages, form.image]);

  const imageList = useMemo(() => {
    const mainImage = form.image.trim();

    return Array.from(
      new Set([mainImage, ...additionalImageList].filter(Boolean)),
    );
  }, [form.image, additionalImageList]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleTitleChange(event) {
    const title = event.target.value;

    setForm((previous) => ({
      ...previous,
      title,
      slug: previous.slug || createSlug(title),
    }));
  }

  function handleDepartmentChange(event) {
    const department = event.target.value;

    setForm((previous) => ({
      ...previous,
      department,
      subcategory: "",
    }));
  }

  function handleSourceChange(event) {
    const source = event.target.value;

    setForm((previous) => {
      if (source === "AMAZON") {
        return {
          ...previous,
          source,
          purchaseMode: "EXTERNAL_LINK",
          externalButtonText: "Explore on Amazon",
          price: "",
          compareAtPrice: "",
          stock: "",
        };
      }

      if (source === "INVENTORY") {
        return {
          ...previous,
          source,
          purchaseMode: "CHECKOUT",
          externalUrl: "",
          externalButtonText: "",
          amazonAsin: "",
        };
      }

      return {
        ...previous,
        source,
        purchaseMode: "CHECKOUT",
        externalButtonText: "",
        amazonAsin: "",
      };
    });
  }

  function handlePurchaseModeChange(event) {
    const purchaseMode = event.target.value;

    setForm((previous) => ({
      ...previous,
      purchaseMode,
      externalButtonText:
        purchaseMode === "EXTERNAL_LINK" && !previous.externalButtonText
          ? "Explore Product"
          : previous.externalButtonText,
    }));
  }

  function removeAdditionalImage(imageToRemove) {
    const updatedImages = additionalImageList.filter(
      (image) => image !== imageToRemove,
    );

    updateField("additionalImages", updatedImages.join("\n"));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = form.title.trim();
    const slug = createSlug(form.slug || form.title);
    const externalUrl = form.externalUrl.trim();
    const mainImage = form.image.trim();

    if (!title) {
      setError("Please enter a product title.");
      return;
    }

    if (!slug) {
      setError("Please enter a valid product slug.");
      return;
    }

    if (!form.category.trim()) {
      setError("Please enter a category.");
      return;
    }

    if (form.department !== "ALL" && !form.subcategory) {
      setError("Please select a subcategory.");
      return;
    }

    if (!mainImage) {
      setError("Please enter a main product image URL.");
      return;
    }

    if (isExternal && !externalUrl) {
      setError("Please enter the external product URL.");
      return;
    }

    if (isExternal && !isValidExternalUrl(externalUrl)) {
      setError("Please enter a valid external URL beginning with https://.");
      return;
    }

    if (isAmazon && !isAmazonUrl(externalUrl)) {
      setError(
        "For an Amazon product, use a valid Amazon.in, amzn.in, or amzn.to affiliate link.",
      );
      return;
    }

    if (!isAmazon && !isExternal && !form.price) {
      setError("Please enter a price for a checkout product.");
      return;
    }

    const payload = {
      title,
      slug,

      description: form.description.trim(),
      shortDescription: form.shortDescription.trim(),
      brand: form.brand.trim(),
      category: form.category.trim(),

      newCategory: form.isNewDrop
        ? "new"
        : createSlug(form.category.trim()) || "all",

      department: form.department,
      subcategory: form.subcategory,

      image: imageList[0],
      images: imageList,

      price: isExternal ? 0 : Number(form.price || 0),

      compareAtPrice:
        !isExternal && form.compareAtPrice
          ? Number(form.compareAtPrice)
          : null,

      stock: isExternal ? 0 : Number(form.stock || 0),

      currency: "INR",

      isActive: form.isActive,
      isFeatured: form.isFeatured,

      source: form.source,
      purchaseMode: isAmazon ? "EXTERNAL_LINK" : form.purchaseMode,

      externalUrl: isExternal ? externalUrl : "",

      externalButtonText: isAmazon
        ? "Explore on Amazon"
        : isExternal
          ? form.externalButtonText.trim() || "Explore Product"
          : "",

      vendor: {
        name: isVendor ? form.vendorName.trim() : "",
        sku: isVendor ? form.vendorSku.trim() : "",
        vendorProductId: isVendor ? form.vendorProductId.trim() : "",
        vendorUrl: isVendor ? form.vendorUrl.trim() : "",
      },

      amazon: {
        asin: isAmazon ? form.amazonAsin.trim().toUpperCase() : "",
      },
    };

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your admin session has expired. Please log in again.");
      }

      await createProduct(payload, token);

      setSuccess("Product added successfully.");
      setForm(initialForm);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Something went wrong while creating the product.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Roto Admin
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
            Add Product
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Add inventory, vendor, or Amazon products and assign them to a
            customer-facing department.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <section className="rounded-xl border border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">
              Product source
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Select whether Roto sells the product directly, through a vendor,
              or through Amazon.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-zinc-800">
                Source
              </label>

              <select
                value={form.source}
                onChange={handleSourceChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              >
                <option value="INVENTORY">Roto inventory</option>
                <option value="VENDOR">Vendor product</option>
                <option value="AMAZON">Amazon affiliate product</option>
              </select>
            </div>

            {isAmazon && (
              <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-950">
                This product opens Amazon through your affiliate link. It cannot
                be added to the Roto cart or checkout.
              </div>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">
              Store placement
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              This controls where customers find the product in the new store
              navigation.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Department
                </label>

                <select
                  value={form.department}
                  onChange={handleDepartmentChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                >
                  <option value="ALL">All Products only</option>

                  {departmentOptions.map((department) => (
                    <option key={department.key} value={department.key}>
                      {department.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Subcategory
                </label>

                <select
                  value={form.subcategory}
                  onChange={(event) =>
                    updateField("subcategory", event.target.value)
                  }
                  disabled={form.department === "ALL"}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                >
                  <option value="">
                    {form.department === "ALL"
                      ? "Choose a department first"
                      : "Select subcategory"}
                  </option>

                  {subcategoryOptions.map((subcategory) => (
                    <option key={subcategory.slug} value={subcategory.slug}>
                      {subcategory.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {form.department !== "ALL" && form.subcategory && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Customers will find this product at:
                <span className="ml-1 font-black">
                  /category/{form.department.toLowerCase()}/
                  {form.subcategory}
                </span>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">
              Basic information
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Product title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="Example: Oversized Cotton T-Shirt"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Product slug
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", createSlug(event.target.value))
                  }
                  placeholder="oversized-cotton-t-shirt"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Product type
                </label>

                <input
                  type="text"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="Example: Casual"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Brand
                </label>

                <input
                  type="text"
                  value={form.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  placeholder="Example: Roto"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Product visibility
                </label>

                <select
                  value={form.isActive ? "active" : "hidden"}
                  onChange={(event) =>
                    updateField("isActive", event.target.value === "active")
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                >
                  <option value="active">Active and visible</option>
                  <option value="hidden">Hidden from customers</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-zinc-800">
                Short description
              </label>

              <input
                type="text"
                value={form.shortDescription}
                onChange={(event) =>
                  updateField("shortDescription", event.target.value)
                }
                placeholder="A short one-line product summary"
                maxLength={300}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-zinc-800">
                Full description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Write the complete product description..."
                rows={6}
                className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">
              Product images
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              The main image appears first on the product page. Add extra image
              URLs one per line to create the product gallery.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-zinc-800">
                Main image URL
              </label>

              <input
                type="url"
                value={form.image}
                onChange={(event) => updateField("image", event.target.value)}
                placeholder="https://example.com/product-main-image.jpg"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-zinc-800">
                Additional image URLs
              </label>

              <textarea
                value={form.additionalImages}
                onChange={(event) =>
                  updateField("additionalImages", event.target.value)
                }
                placeholder={
                  "One image URL per line\nhttps://example.com/product-back.jpg\nhttps://example.com/product-side.jpg"
                }
                rows={5}
                className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            {imageList.length > 0 && (
              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-zinc-950">
                      Product image preview
                    </p>

                    <p className="mt-1 text-xs font-medium text-zinc-500">
                      {imageList.length} image
                      {imageList.length === 1 ? "" : "s"} ready for this
                      product.
                    </p>
                  </div>

                  <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                    First image is main
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    <img
                      src={imageList[0]}
                      alt="Main product preview"
                      className="h-72 w-full object-contain p-3"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="grid max-h-72 grid-cols-3 content-start gap-2 overflow-y-auto pr-1">
                    {imageList.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className={`group relative aspect-square overflow-hidden rounded-lg border bg-white ${
                          index === 0
                            ? "border-zinc-950 ring-2 ring-zinc-950/10"
                            : "border-zinc-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Product preview ${index + 1}`}
                          className="size-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />

                        {index === 0 ? (
                          <span className="absolute bottom-1 left-1 rounded bg-zinc-950 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                            Main
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(image)}
                            aria-label={`Remove image ${index + 1}`}
                            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white text-zinc-700 shadow transition hover:bg-red-500 hover:text-white"
                          >
                            <FiX size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {isAmazon && (
            <section className="rounded-xl border border-orange-200 bg-orange-50 p-5">
              <h2 className="text-lg font-black text-orange-950">
                Amazon affiliate details
              </h2>

              <p className="mt-1 text-sm text-orange-900">
                Paste an Amazon Associate SiteStripe link for this product.
              </p>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Amazon affiliate link
                </label>

                <input
                  type="url"
                  value={form.externalUrl}
                  onChange={(event) =>
                    updateField("externalUrl", event.target.value)
                  }
                  placeholder="https://www.amazon.in/dp/PRODUCT-ASIN?tag=yourtag-21"
                  className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Amazon ASIN
                </label>

                <input
                  type="text"
                  value={form.amazonAsin}
                  onChange={(event) =>
                    updateField(
                      "amazonAsin",
                      event.target.value.toUpperCase().replace(/\s/g, ""),
                    )
                  }
                  placeholder="Example: B0ABCDE123"
                  maxLength={10}
                  className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2.5 uppercase outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </section>
          )}

          {isVendor && (
            <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <h2 className="text-lg font-black text-blue-950">
                Vendor information
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-800">
                    Vendor name
                  </label>

                  <input
                    type="text"
                    value={form.vendorName}
                    onChange={(event) =>
                      updateField("vendorName", event.target.value)
                    }
                    placeholder="Vendor or distributor name"
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-800">
                    Vendor SKU
                  </label>

                  <input
                    type="text"
                    value={form.vendorSku}
                    onChange={(event) =>
                      updateField("vendorSku", event.target.value)
                    }
                    placeholder="VENDOR-SKU-001"
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-800">
                    Vendor product ID
                  </label>

                  <input
                    type="text"
                    value={form.vendorProductId}
                    onChange={(event) =>
                      updateField("vendorProductId", event.target.value)
                    }
                    placeholder="Vendor product ID"
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-800">
                    Vendor product URL
                  </label>

                  <input
                    type="url"
                    value={form.vendorUrl}
                    onChange={(event) =>
                      updateField("vendorUrl", event.target.value)
                    }
                    placeholder="https://vendor.example/product"
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>
          )}

          {!isAmazon && (
            <section className="rounded-xl border border-zinc-200 p-5">
              <h2 className="text-lg font-black text-zinc-950">
                Purchase settings
              </h2>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Customer purchase method
                </label>

                <select
                  value={form.purchaseMode}
                  onChange={handlePurchaseModeChange}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                >
                  <option value="CHECKOUT">Buy through Roto checkout</option>
                  <option value="EXTERNAL_LINK">
                    Open an external seller link
                  </option>
                </select>
              </div>

              {isExternal && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-800">
                      External product URL
                    </label>

                    <input
                      type="url"
                      value={form.externalUrl}
                      onChange={(event) =>
                        updateField("externalUrl", event.target.value)
                      }
                      placeholder="https://partner.example/product"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-800">
                      Customer button text
                    </label>

                    <input
                      type="text"
                      value={form.externalButtonText}
                      onChange={(event) =>
                        updateField("externalButtonText", event.target.value)
                      }
                      placeholder="Explore Product"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                    />
                  </div>
                </div>
              )}

              {!isExternal && (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-800">
                      Selling price (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateField("price", event.target.value)
                      }
                      placeholder="899"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-800">
                      Compare-at price (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.compareAtPrice}
                      onChange={(event) =>
                        updateField("compareAtPrice", event.target.value)
                      }
                      placeholder="1299"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-800">
                      Available stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(event) =>
                        updateField("stock", event.target.value)
                      }
                      placeholder="10"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="space-y-4 rounded-xl border border-zinc-200 p-5">
            <label className="flex cursor-pointer items-start gap-3 text-sm font-bold text-zinc-800">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  updateField("isFeatured", event.target.checked)
                }
                className="mt-0.5 size-4 accent-zinc-950"
              />

              <span>
                <span className="block">Mark as featured product</span>

                <span className="mt-1 block text-xs font-medium leading-5 text-zinc-500">
                  Featured products can be prioritized in important store
                  sections.
                </span>
              </span>
            </label>

            <div className="border-t border-zinc-200 pt-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm font-bold text-zinc-800">
                <input
                  type="checkbox"
                  checked={form.isNewDrop}
                  onChange={(event) =>
                    updateField("isNewDrop", event.target.checked)
                  }
                  className="mt-0.5 size-4 accent-amber-600"
                />

                <span>
                  <span className="block text-amber-800">
                    Mark as New Drop
                  </span>

                  <span className="mt-1 block text-xs font-medium leading-5 text-zinc-500">
                    Show this product in the homepage New Drops section.
                    Customers still open the product through its normal
                    department and subcategory.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-zinc-950 px-5 py-3.5 font-extrabold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSubmitting ? "Saving product..." : "Save Product"}
          </button>
        </form>
      </div>
    </main>
  );
}