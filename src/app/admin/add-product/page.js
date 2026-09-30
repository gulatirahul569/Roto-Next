"use client";

import { useMemo, useState } from "react";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  shortDescription: "",
  brand: "",
  category: "",
  image: "",
  additionalImages: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  isActive: true,
  isFeatured: false,

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

function createSlug(value) {
  return value
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

  const imageList = useMemo(() => {
    const additionalImages = form.additionalImages
      .split("\n")
      .map((image) => image.trim())
      .filter(Boolean);

    return [form.image.trim(), ...additionalImages].filter(Boolean);
  }, [form.image, form.additionalImages]);

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

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = form.title.trim();
    const slug = createSlug(form.slug || form.title);
    const externalUrl = form.externalUrl.trim();

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

    if (!form.image.trim()) {
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

    if (!isAmazon && form.purchaseMode === "CHECKOUT" && !form.price) {
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
      image: form.image.trim(),
      images: imageList,

      price: isAmazon ? 0 : Number(form.price || 0),

      compareAtPrice:
        !isAmazon && form.compareAtPrice ? Number(form.compareAtPrice) : null,

      stock: isAmazon || isExternal ? 0 : Number(form.stock || 0),

      currency: "INR",
      isActive: form.isActive,
      isFeatured: form.isFeatured,

      source: form.source,
      purchaseMode: isAmazon ? "EXTERNAL_LINK" : form.purchaseMode,

      externalUrl:
        isAmazon || form.purchaseMode === "EXTERNAL_LINK" ? externalUrl : "",

      externalButtonText: isAmazon
        ? "Explore on Amazon"
        : form.purchaseMode === "EXTERNAL_LINK"
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

      const response = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create product.");
      }

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
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Roto Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">Add Product</h1>

          <p className="mt-2 text-sm text-gray-600">
            Add Roto inventory, vendor products, or temporary Amazon affiliate
            products.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <section className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-950">
              Product source
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Select where this product comes from.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Source
              </label>

              <select
                value={form.source}
                onChange={handleSourceChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="INVENTORY">Roto inventory</option>
                <option value="VENDOR">Vendor product</option>
                <option value="AMAZON">Amazon affiliate product</option>
              </select>
            </div>

            {isAmazon && (
              <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
                This product will open Amazon through your affiliate link. It
                will not be added to the Roto cart or checkout.
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-950">
              Basic information
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Product title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="Example: American Tourister Laptop Backpack"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Product slug
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", createSlug(event.target.value))
                  }
                  placeholder="american-tourister-backpack"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Category
                </label>

                <input
                  type="text"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="Backpacks"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Brand
                </label>

                <input
                  type="text"
                  value={form.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  placeholder="Example: American Tourister"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Product visibility
                </label>

                <select
                  value={form.isActive ? "active" : "hidden"}
                  onChange={(event) =>
                    updateField("isActive", event.target.value === "active")
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="active">Active and visible</option>
                  <option value="hidden">Hidden from customers</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-800">
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Full description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Write the product description..."
                rows={6}
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-950">
              Product images
            </h2>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Main image URL
              </label>

              <input
                type="url"
                value={form.image}
                onChange={(event) => updateField("image", event.target.value)}
                placeholder="https://example.com/product-image.jpg"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Additional image URLs
              </label>

              <textarea
                value={form.additionalImages}
                onChange={(event) =>
                  updateField("additionalImages", event.target.value)
                }
                placeholder={
                  "One image URL per line\nhttps://example.com/image-2.jpg"
                }
                rows={4}
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {form.image && (
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Image preview
                </p>

                <img
                  src={form.image}
                  alt="Product preview"
                  className="h-48 w-full rounded-lg object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </section>

          {isAmazon && (
            <section className="rounded-xl border border-orange-200 bg-orange-50 p-5">
              <h2 className="text-lg font-semibold text-orange-950">
                Amazon affiliate details
              </h2>

              <p className="mt-1 text-sm text-orange-900">
                Paste the Amazon Associate SiteStripe link you generated for
                this product.
              </p>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-800">
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
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  ASIN
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
              <h2 className="text-lg font-semibold text-blue-950">
                Vendor information
              </h2>

              <p className="mt-1 text-sm text-blue-900">
                These details prepare the product for future vendor CSV or API
                stock synchronization.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Vendor name
                  </label>

                  <input
                    type="text"
                    value={form.vendorName}
                    onChange={(event) =>
                      updateField("vendorName", event.target.value)
                    }
                    placeholder="ABC Luggage Distributor"
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Vendor SKU
                  </label>

                  <input
                    type="text"
                    value={form.vendorSku}
                    onChange={(event) =>
                      updateField("vendorSku", event.target.value)
                    }
                    placeholder="ABC-CABIN-004"
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Vendor product ID
                  </label>

                  <input
                    type="text"
                    value={form.vendorProductId}
                    onChange={(event) =>
                      updateField("vendorProductId", event.target.value)
                    }
                    placeholder="983"
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Vendor product URL
                  </label>

                  <input
                    type="url"
                    value={form.vendorUrl}
                    onChange={(event) =>
                      updateField("vendorUrl", event.target.value)
                    }
                    placeholder="https://vendor.example/product/983"
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>
          )}

          {!isAmazon && (
            <section className="rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-950">
                Purchase settings
              </h2>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Customer purchase method
                </label>

                <select
                  value={form.purchaseMode}
                  onChange={handlePurchaseModeChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      External product URL
                    </label>

                    <input
                      type="url"
                      value={form.externalUrl}
                      onChange={(event) =>
                        updateField("externalUrl", event.target.value)
                      }
                      placeholder="https://partner.example/product"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Customer button text
                    </label>

                    <input
                      type="text"
                      value={form.externalButtonText}
                      onChange={(event) =>
                        updateField("externalButtonText", event.target.value)
                      }
                      placeholder="Explore Product"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              )}

              {!isExternal && (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
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
                      placeholder="2499"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
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
                      placeholder="2999"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="rounded-xl border border-gray-200 p-5">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  updateField("isFeatured", event.target.checked)
                }
                className="h-4 w-4 accent-orange-500"
              />
              Mark as featured product
            </label>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-black px-5 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? "Saving product..." : "Save Product"}
          </button>
        </form>
      </div>
    </main>
  );
}
