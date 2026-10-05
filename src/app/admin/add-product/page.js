"use client";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import {
  FiImage,
  FiLoader,
  FiUpload,
  FiX,
} from "react-icons/fi";
import {
  departmentOptions,
  getSubcategoryOptions,
} from "../../../data/departmentData";
import { createProduct } from "../../../services/productService";
import {
  importStoreMediaFromUrl,
  uploadStoreMedia,
} from "../../../services/mediaService";

const initialForm = {
  title: "",
  slug: "",

  description: "",
  shortDescription: "",
  brand: "",

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

function formatFileSize(bytes = 0) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
  const { token, user, isAuthLoaded } = useAuth();

  const [form, setForm] = useState(initialForm);

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAmazon = form.source === "AMAZON";
  const isVendor = form.source === "VENDOR";
  const isExternal = form.purchaseMode === "EXTERNAL_LINK";

  const subcategoryOptions = useMemo(() => {
    return getSubcategoryOptions(form.department);
  }, [form.department]);

  const selectedSubcategory = useMemo(() => {
    return subcategoryOptions.find(
      (subcategory) => subcategory.slug === form.subcategory,
    );
  }, [form.subcategory, subcategoryOptions]);

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

  const externalImageList = useMemo(() => {
    const mainImage = form.image.trim();

    return Array.from(
      new Set(
        [mainImage, ...additionalImageList].filter(Boolean),
      ),
    );
  }, [form.image, additionalImageList]);

  useEffect(() => {
    const previewUrls = selectedImages.map((file) =>
      URL.createObjectURL(file),
    );

    setImagePreviewUrls(previewUrls);

    return () => {
      previewUrls.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, [selectedImages]);

  const allImagePreviewItems = useMemo(() => {
    const urlItems = externalImageList.map((imageUrl, index) => ({
      id: `url-${imageUrl}-${index}`,
      type: "url",
      value: imageUrl,
      urlIndex: index,
    }));

    const uploadItems = selectedImages.map((file, index) => ({
      id: `file-${file.name}-${file.lastModified}-${index}`,
      type: "file",
      value: imagePreviewUrls[index],
      fileIndex: index,
    }));

    return [...urlItems, ...uploadItems];
  }, [
    externalImageList,
    imagePreviewUrls,
    selectedImages,
  ]);

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
        purchaseMode === "EXTERNAL_LINK" &&
          !previous.externalButtonText
          ? "Explore Product"
          : previous.externalButtonText,
    }));
  }

  function handleProductImagesChange(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles = files.filter((file) =>
      allowedTypes.includes(file.type),
    );

    if (validFiles.length !== files.length) {
      setError("Only JPG, PNG, and WebP image files are allowed.");
    } else {
      setError("");
    }

    setSelectedImages((previousImages) => [
      ...previousImages,
      ...validFiles,
    ]);

    event.target.value = "";
  }

  function removeSelectedImage(indexToRemove) {
    setSelectedImages((previousImages) =>
      previousImages.filter((_, index) => index !== indexToRemove),
    );
  }

  function removeExternalImage(urlIndex) {
    if (urlIndex === 0) {
      const remainingUrls = externalImageList.slice(1);

      setForm((previous) => ({
        ...previous,
        image: "",
        additionalImages: remainingUrls.join("\n"),
      }));

      return;
    }

    const remainingUrls = externalImageList.filter(
      (_, index) => index !== urlIndex,
    );

    setForm((previous) => ({
      ...previous,
      image: remainingUrls[0] || "",
      additionalImages: remainingUrls.slice(1).join("\n"),
    }));
  }

  async function uploadProductImages(productSlug, token) {
    const uploadedUrls = [];
    const uploadBatchId = Date.now();

    for (
      let index = 0;
      index < externalImageList.length;
      index += 1
    ) {
      const sourceUrl = externalImageList[index];

      const imageRole =
        index === 0
          ? "main-url"
          : `gallery-url-${index}`;

      const destination = `products/${productSlug}/${imageRole}-${uploadBatchId}-${index}`;

      const uploadedMedia = await importStoreMediaFromUrl(
        sourceUrl,
        token,
        destination,
      );

      if (!uploadedMedia?.imageUrl) {
        throw new Error(
          `Unable to import image URL ${index + 1}. Use a supported direct public image URL.`,
        );
      }

      uploadedUrls.push(uploadedMedia.imageUrl);
    }

    for (
      let index = 0;
      index < selectedImages.length;
      index += 1
    ) {
      const file = selectedImages[index];

      const imageRole =
        uploadedUrls.length === 0 && index === 0
          ? "main-upload"
          : `gallery-upload-${index}`;

      const destination = `products/${productSlug}/${imageRole}-${uploadBatchId}-${index}`;

      const uploadedMedia = await uploadStoreMedia(
        file,
        token,
        destination,
      );

      if (!uploadedMedia?.imageUrl) {
        throw new Error(
          `Unable to upload device image ${index + 1}.`,
        );
      }

      uploadedUrls.push(uploadedMedia.imageUrl);
    }

    if (!uploadedUrls.length) {
      throw new Error("No product images could be uploaded.");
    }

    return uploadedUrls;
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

    if (form.department === "ALL") {
      setError("Please select a product department.");
      return;
    }

    if (!form.subcategory) {
      setError("Please select a product subcategory.");
      return;
    }

    if (!selectedImages.length && !externalImageList.length) {
      setError(
        "Choose at least one image from your device or paste an image URL.",
      );
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
        "For an Amazon product, use an Amazon.in, amzn.in, or amzn.to affiliate link.",
      );
      return;
    }

    if (!isExternal && !form.price) {
      setError("Please enter a selling price.");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsUploadingImages(true);

      if (!token) {
        throw new Error("Your admin session has expired. Please log in again.");
      }

      if (user?.role !== "admin") {
        throw new Error("Admin access is required to upload product images.");
      }

      const uploadedImageUrls = await uploadProductImages(
        slug,
        token,
      );

      const payload = {
        title,
        slug,

        description: form.description.trim(),
        shortDescription: form.shortDescription.trim(),
        brand: form.brand.trim(),

        category:
          selectedSubcategory?.title ||
          form.subcategory,

        newCategory: form.isNewDrop
          ? "new"
          : form.subcategory,

        department: form.department,
        subcategory: form.subcategory,

        image: uploadedImageUrls[0],
        images: uploadedImageUrls,

        price: isExternal
          ? 0
          : Number(form.price || 0),

        compareAtPrice:
          !isExternal && form.compareAtPrice
            ? Number(form.compareAtPrice)
            : null,

        stock: isExternal
          ? 0
          : Number(form.stock || 0),

        currency: "INR",

        isActive: form.isActive,
        isFeatured: form.isFeatured,

        source: form.source,

        purchaseMode: isAmazon
          ? "EXTERNAL_LINK"
          : form.purchaseMode,

        externalUrl: isExternal
          ? externalUrl
          : "",

        externalButtonText: isAmazon
          ? "Explore on Amazon"
          : isExternal
            ? form.externalButtonText.trim() || "Explore Product"
            : "",

        vendor: {
          name: isVendor
            ? form.vendorName.trim()
            : "",
          sku: isVendor
            ? form.vendorSku.trim()
            : "",
          vendorProductId: isVendor
            ? form.vendorProductId.trim()
            : "",
          vendorUrl: isVendor
            ? form.vendorUrl.trim()
            : "",
        },

        amazon: {
          asin: isAmazon
            ? form.amazonAsin.trim().toUpperCase()
            : "",
        },
      };

      await createProduct(payload, token);

      setSuccess("Product added successfully.");
      setForm(initialForm);
      setSelectedImages([]);
    } catch (requestError) {
      setError(
        requestError.message ||
        "Something went wrong while creating the product.",
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  }
  if (!isAuthLoaded) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-zinc-50">
        <p className="text-sm font-bold text-zinc-500">
          Loading admin session...
        </p>
      </main>
    );
  }

  if (user?.role !== "admin") {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-zinc-50 px-6 text-center">
        <div>
          <h1 className="text-2xl font-black text-zinc-950">
            Admin access required
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Only administrators can add products and upload product media.
          </p>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
            Roto Admin
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
            Add Product
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Add product details, select a department, and import images from a
            URL or upload them directly from your device.
          </p>
        </header>

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
                This product opens Amazon through your affiliate link and
                cannot be added to the Roto cart.
              </div>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">
              Store placement
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Category is generated automatically from the selected
              subcategory.
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
                  <option value="ALL">Select department</option>

                  {departmentOptions.map((department) => (
                    <option
                      key={department.key}
                      value={department.key}
                    >
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
                  disabled={form.department === "ALL"}
                  onChange={(event) =>
                    updateField("subcategory", event.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                >
                  <option value="">
                    {form.department === "ALL"
                      ? "Choose a department first"
                      : "Select subcategory"}
                  </option>

                  {subcategoryOptions.map((subcategory) => (
                    <option
                      key={subcategory.slug}
                      value={subcategory.slug}
                    >
                      {subcategory.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedSubcategory && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Product category:
                <span className="ml-1 font-black">
                  {selectedSubcategory.title}
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
                    updateField(
                      "slug",
                      createSlug(event.target.value),
                    )
                  }
                  placeholder="oversized-cotton-t-shirt"
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
                  onChange={(event) =>
                    updateField("brand", event.target.value)
                  }
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
                    updateField(
                      "isActive",
                      event.target.value === "active",
                    )
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
                maxLength={300}
                onChange={(event) =>
                  updateField(
                    "shortDescription",
                    event.target.value,
                  )
                }
                placeholder="A short one-line product summary"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-zinc-800">
                Full description
              </label>

              <textarea
                rows={6}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Write the complete product description..."
                className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 p-5">
            <h2 className="text-lg font-black text-zinc-950">
              Product images
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Paste direct image URLs, upload from your device, or use both.
              Every image is copied to Vercel Blob before product creation.
            </p>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold text-zinc-800">
                Main image URL
              </label>

              <input
                type="url"
                value={form.image}
                onChange={(event) =>
                  updateField("image", event.target.value)
                }
                placeholder="https://images.pexels.com/photos/..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                This becomes the main image when a URL is provided.
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-zinc-800">
                Additional image URLs
              </label>

              <textarea
                rows={4}
                value={form.additionalImages}
                onChange={(event) =>
                  updateField(
                    "additionalImages",
                    event.target.value,
                  )
                }
                placeholder={
                  "One image URL per line\nhttps://images.pexels.com/photos/...\nhttps://images.pexels.com/photos/..."
                }
                className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
              />

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Paste one direct public image URL per line.
              </p>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                Or upload from device
              </span>

              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="grid size-16 place-items-center rounded-2xl bg-white text-zinc-400 shadow-sm">
                  <FiImage size={28} />
                </div>

                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800">
                  <FiUpload size={16} />
                  Choose product images

                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleProductImagesChange}
                  />
                </label>

                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  JPG, PNG, or WebP. Select multiple images at once. Maximum
                  size is 5 MB for each file.
                </p>
              </div>
            </div>

            {allImagePreviewItems.length > 0 && (
              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-zinc-950">
                      Product image preview
                    </p>

                    <p className="mt-1 text-xs font-medium text-zinc-500">
                      The first image becomes the main product image.
                    </p>
                  </div>

                  <span className="rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                    {allImagePreviewItems.length} image
                    {allImagePreviewItems.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {allImagePreviewItems.map((imageItem, index) => (
                    <div
                      key={imageItem.id}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-white"
                    >
                      {imageItem.value ? (
                        <img
                          src={imageItem.value}
                          alt={`Product preview ${index + 1}`}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-zinc-400">
                          <FiLoader
                            size={22}
                            className="animate-spin"
                          />
                        </div>
                      )}

                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-md bg-zinc-950 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                          Main image
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (imageItem.type === "file") {
                            removeSelectedImage(imageItem.fileIndex);
                            return;
                          }

                          removeExternalImage(imageItem.urlIndex);
                        }}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white text-zinc-700 shadow transition hover:bg-red-500 hover:text-white"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {isAmazon && (
            <section className="rounded-xl border border-orange-200 bg-orange-50 p-5">
              <h2 className="text-lg font-black text-orange-950">
                Amazon affiliate details
              </h2>

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
                  maxLength={10}
                  value={form.amazonAsin}
                  onChange={(event) =>
                    updateField(
                      "amazonAsin",
                      event.target.value
                        .toUpperCase()
                        .replace(/\s/g, ""),
                    )
                  }
                  placeholder="Example: B0ABCDE123"
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
                <input
                  type="text"
                  value={form.vendorName}
                  onChange={(event) =>
                    updateField("vendorName", event.target.value)
                  }
                  placeholder="Vendor name"
                  className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none"
                />

                <input
                  type="text"
                  value={form.vendorSku}
                  onChange={(event) =>
                    updateField("vendorSku", event.target.value)
                  }
                  placeholder="Vendor SKU"
                  className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none"
                />

                <input
                  type="text"
                  value={form.vendorProductId}
                  onChange={(event) =>
                    updateField(
                      "vendorProductId",
                      event.target.value,
                    )
                  }
                  placeholder="Vendor product ID"
                  className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none"
                />

                <input
                  type="url"
                  value={form.vendorUrl}
                  onChange={(event) =>
                    updateField("vendorUrl", event.target.value)
                  }
                  placeholder="Vendor product URL"
                  className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2.5 outline-none"
                />
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
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none"
                >
                  <option value="CHECKOUT">
                    Buy through Roto checkout
                  </option>
                  <option value="EXTERNAL_LINK">
                    Open an external seller link
                  </option>
                </select>
              </div>

              {isExternal ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <input
                    type="url"
                    value={form.externalUrl}
                    onChange={(event) =>
                      updateField("externalUrl", event.target.value)
                    }
                    placeholder="External product URL"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none"
                  />

                  <input
                    type="text"
                    value={form.externalButtonText}
                    onChange={(event) =>
                      updateField(
                        "externalButtonText",
                        event.target.value,
                      )
                    }
                    placeholder="Explore Product"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none"
                  />
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    placeholder="Selling price (₹)"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(event) =>
                      updateField(
                        "compareAtPrice",
                        event.target.value,
                      )
                    }
                    placeholder="Compare-at price (₹)"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none"
                  />

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) =>
                      updateField("stock", event.target.value)
                    }
                    placeholder="Available stock"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none"
                  />
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
                  updateField(
                    "isFeatured",
                    event.target.checked,
                  )
                }
                className="mt-0.5 size-4 accent-zinc-950"
              />

              <span>
                <span className="block">
                  Mark as featured product
                </span>

                <span className="mt-1 block text-xs font-medium text-zinc-500">
                  Featured products can be prioritised in store sections.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 border-t border-zinc-200 pt-4 text-sm font-bold text-zinc-800">
              <input
                type="checkbox"
                checked={form.isNewDrop}
                onChange={(event) =>
                  updateField(
                    "isNewDrop",
                    event.target.checked,
                  )
                }
                className="mt-0.5 size-4 accent-amber-600"
              />

              <span>
                <span className="block text-amber-800">
                  Mark as New Drop
                </span>

                <span className="mt-1 block text-xs font-medium text-zinc-500">
                  Show this product in the homepage New Drops section.
                </span>
              </span>
            </label>
          </section>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImages}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3.5 font-extrabold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {(isSubmitting || isUploadingImages) && (
              <FiLoader size={18} className="animate-spin" />
            )}

            {isUploadingImages
              ? "Importing and uploading images..."
              : isSubmitting
                ? "Saving product..."
                : "Save Product"}
          </button>
        </form>
      </div>
    </main>
  );
}