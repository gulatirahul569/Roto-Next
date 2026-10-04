"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiImage,
  FiLink,
  FiLoader,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { departmentData } from "../../../data/departmentData";
import {
  importStoreMediaFromUrl,
  uploadStoreMedia,
} from "../../../services/mediaService";

function formatFileSize(bytes = 0) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const imageTypes = [
  {
    value: "banner",
    label: "Department banner",
    description: "Large hero image used at the top of a department page.",
  },
  {
    value: "subcategory",
    label: "Subcategory image",
    description: "Collection-card image such as Men → T-Shirts.",
  },
  {
    value: "category-showcase",
    label: "Homepage category showcase",
    description:
      "Large image card for Men, Women, Kids, Home, or Accessories on the homepage.",
  },
  {
    value: "promo",
    label: "Home promotion",
    description: "Budget card, offer banner, or animated homepage promotion.",
  },
  {
    value: "logo",
    label: "Logo",
    description: "Roto logo or footer/logo branding image.",
  },
];

const departments = [
  {
    value: "all",
    label: "All Products",
  },
  {
    value: "new",
    label: "New Drops",
  },
  {
    value: "men",
    label: "Men",
  },
  {
    value: "women",
    label: "Women",
  },
  {
    value: "kids",
    label: "Kids",
  },
  {
    value: "home",
    label: "Home",
  },
  {
    value: "accessories",
    label: "Accessories",
  },
];

const logoOptions = [
  {
    value: "roto-logo",
    label: "Main Header Logo",
  },
  {
    value: "roto-logo-white",
    label: "White Header Logo",
  },
  {
    value: "footer-logo",
    label: "Footer Logo",
  },
];

const promotionOptions = [
  {
    value: "under-1000",
    label: "Budget Card: Under ₹1,000",
  },
  {
    value: "1000-3000",
    label: "Budget Card: ₹1,000 – ₹3,000",
  },
  {
    value: "3000-5000",
    label: "Budget Card: ₹3,000 – ₹5,000",
  },
  {
    value: "5000-10000",
    label: "Budget Card: ₹5,000 – ₹10,000",
  },
  {
    value: "above-10000",
    label: "Budget Card: Above ₹10,000",
  },
  {
    value: "weekend-sale",
    label: "Featured Offer: Weekend Sale",
  },
  {
    value: "new-season",
    label: "Featured Offer: New Season",
  },
  {
    value: "premium-picks",
    label: "Featured Offer: Premium Picks",
  },
  {
    value: "category-showcase-mini-offer",
    label: "Animated Promo: After Category Showcase",
  },
];

function getDepartmentFallbackBanner(departmentSlug) {
  return departmentData[departmentSlug]?.banner || "";
}

function getSubcategoryFallbackImage(departmentSlug, subcategorySlug) {
  const department = departmentData[departmentSlug];

  if (!department) {
    return "";
  }

  const subcategory = department.subcategories?.find(
    (item) => item.slug === subcategorySlug,
  );

  return subcategory?.image || "";
}

export default function AdminMediaPage() {
  const { token, user, isAuthLoaded } = useAuth();

  const [mediaType, setMediaType] = useState("subcategory");
  const [departmentSlug, setDepartmentSlug] = useState("men");
  const [subcategorySlug, setSubcategorySlug] = useState("t-shirts");
  const [logoSlug, setLogoSlug] = useState("roto-logo");
  const [promotionSlug, setPromotionSlug] = useState("under-1000");

  const [selectedFile, setSelectedFile] = useState(null);
  const [externalImageUrl, setExternalImageUrl] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");

  const [mediaMap, setMediaMap] = useState({});
  const [isMediaLoading, setIsMediaLoading] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [error, setError] = useState("");

  const availableSubcategories = useMemo(() => {
    return departmentData[departmentSlug]?.subcategories || [];
  }, [departmentSlug]);

  const destination = useMemo(() => {
    if (mediaType === "banner") {
      return `banners/${departmentSlug}`;
    }

    if (mediaType === "subcategory") {
      return `categories/${departmentSlug}/${subcategorySlug}`;
    }

    if (mediaType === "promo") {
      return `promos/home/${promotionSlug}`;
    }

    if (mediaType === "logo") {
      return `logos/${logoSlug}`;
    }
    if (mediaType === "category-showcase") {
      return `home/categories/${departmentSlug}`;
    }

    return "";
  }, [departmentSlug, logoSlug, mediaType, promotionSlug, subcategorySlug]);

  const currentImageUrl = useMemo(() => {
    if (mediaMap[destination]) {
      return mediaMap[destination];
    }

    if (mediaType === "banner") {
      return getDepartmentFallbackBanner(departmentSlug);
    }

    if (mediaType === "subcategory") {
      return getSubcategoryFallbackImage(departmentSlug, subcategorySlug);
    }

    return "";
  }, [departmentSlug, destination, mediaMap, mediaType, subcategorySlug]);

  const isUrlMode = Boolean(externalImageUrl.trim());

  const uploadPreviewUrl = selectedFile
    ? filePreviewUrl
    : externalImageUrl.trim();

  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);

    setFilePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    let isActive = true;

    async function loadCurrentMedia() {
      try {
        setIsMediaLoading(true);

        const response = await fetch("/api/media", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load current media.");
        }

        const data = await response.json();

        if (isActive) {
          setMediaMap(data.media || {});
        }
      } catch (mediaError) {
        console.error("Media Library loading error:", mediaError);

        if (isActive) {
          setMediaMap({});
        }
      } finally {
        if (isActive) {
          setIsMediaLoading(false);
        }
      }
    }

    loadCurrentMedia();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (mediaType !== "subcategory") {
      return;
    }

    const firstSubcategory = departmentData[departmentSlug]?.subcategories?.[0];

    if (!firstSubcategory) {
      setDepartmentSlug("men");
      setSubcategorySlug("t-shirts");
      return;
    }

    const currentSubcategoryExists = departmentData[
      departmentSlug
    ]?.subcategories?.some((item) => item.slug === subcategorySlug);

    if (!currentSubcategoryExists) {
      setSubcategorySlug(firstSubcategory.slug);
    }
  }, [departmentSlug, mediaType, subcategorySlug]);

  const handleMediaTypeChange = (event) => {
    const nextMediaType = event.target.value;

    setMediaType(nextMediaType);
    setSelectedFile(null);
    setExternalImageUrl("");
    setUploadedMedia(null);
    setError("");

    if (nextMediaType === "subcategory") {
      setDepartmentSlug("men");
      setSubcategorySlug("t-shirts");
    }
    if (nextMediaType === "banner" || nextMediaType === "category-showcase") {
      setDepartmentSlug("men");
    }

    if (nextMediaType === "promo") {
      setPromotionSlug("under-1000");
    }
  };

  const handleDepartmentChange = (event) => {
    const nextDepartmentSlug = event.target.value;

    setDepartmentSlug(nextDepartmentSlug);
    setUploadedMedia(null);
    setError("");

    const firstSubcategory =
      departmentData[nextDepartmentSlug]?.subcategories?.[0];

    if (firstSubcategory) {
      setSubcategorySlug(firstSubcategory.slug);
    }
  };

  const handleSubcategoryChange = (event) => {
    setSubcategorySlug(event.target.value);
    setUploadedMedia(null);
    setError("");
  };

  const handleLogoChange = (event) => {
    setLogoSlug(event.target.value);
    setUploadedMedia(null);
    setError("");
  };

  const handlePromotionChange = (event) => {
    setPromotionSlug(event.target.value);
    setUploadedMedia(null);
    setError("");
  };
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setUploadedMedia(null);
    setExternalImageUrl("");
    setSelectedFile(file || null);
  };

  const handleExternalUrlChange = (event) => {
    const url = event.target.value;

    setError("");
    setUploadedMedia(null);
    setSelectedFile(null);
    setExternalImageUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile && !externalImageUrl.trim()) {
      setError("Select an image file or paste a direct public image URL.");
      return;
    }

    if (!destination) {
      setError("Please select a valid media destination.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setUploadedMedia(null);

      const media = selectedFile
        ? await uploadStoreMedia(selectedFile, token, destination)
        : await importStoreMediaFromUrl(
            externalImageUrl.trim(),
            token,
            destination,
          );

      const savedMedia = {
        ...media,
        source: selectedFile ? "device" : "url",
        destination,
      };

      setUploadedMedia(savedMedia);

      setMediaMap((currentMedia) => ({
        ...currentMedia,
        [destination]: savedMedia.imageUrl,
      }));

      setSelectedFile(null);
      setExternalImageUrl("");
    } catch (uploadError) {
      setError(
        uploadError.message || "Unable to optimize and upload the image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthLoaded) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <p className="text-sm font-bold text-zinc-500">
          Loading media library...
        </p>
      </main>
    );
  }

  if (user?.role !== "admin") {
    return (
      <main className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-black text-zinc-950">
            Admin access required.
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Only administrators can upload store media.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700">
          Roto Admin
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
          Media Library
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Select a department and subcategory. The Vercel Blob destination is
          created automatically, so image paths stay correct.
        </p>
      </header>

      {error && (
        <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error message"
            className="shrink-0"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <div>
          <h2 className="text-lg font-black text-zinc-950">
            Replace store image
          </h2>

          <p className="mt-1 text-sm text-zinc-600">
            Choose what the image is for, then choose its department or
            subcategory.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-800">
              Image type
            </span>

            <select
              value={mediaType}
              onChange={handleMediaTypeChange}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
            >
              {imageTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          {mediaType !== "logo" && mediaType !== "promo" && (
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-zinc-800">
                Department
              </span>

              <select
                value={departmentSlug}
                onChange={handleDepartmentChange}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
              >
                {departments.map((department) => (
                  <option
                    key={department.value}
                    value={department.value}
                    disabled={
                      mediaType === "subcategory" &&
                      !departmentData[department.value]?.subcategories?.length
                    }
                  >
                    {department.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {mediaType === "subcategory" && (
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-zinc-800">
                Subcategory
              </span>

              <select
                value={subcategorySlug}
                onChange={handleSubcategoryChange}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
              >
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory.slug} value={subcategory.slug}>
                    {subcategory.title}
                  </option>
                ))}
              </select>
            </label>
          )}

          {mediaType === "promo" && (
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-zinc-800">
                Homepage promotion
              </span>

              <select
                value={promotionSlug}
                onChange={handlePromotionChange}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
              >
                {promotionOptions.map((promotion) => (
                  <option key={promotion.value} value={promotion.value}>
                    {promotion.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {mediaType === "logo" && (
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-zinc-800">
                Logo location
              </span>

              <select
                value={logoSlug}
                onChange={handleLogoChange}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
              >
                {logoOptions.map((logo) => (
                  <option key={logo.value} value={logo.value}>
                    {logo.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
            Automatic Vercel Blob destination
          </p>

          <code className="mt-2 block break-all rounded-xl bg-white px-4 py-3 text-sm font-black text-zinc-950">
            {destination || "Select a media type"}
          </code>

          <p className="mt-2 text-xs leading-5 text-amber-800">
            This path is generated by the selected options and cannot be typed
            manually.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-zinc-950">
                Current published image
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                This is the current image used by your website for the selected
                destination.
              </p>
            </div>

            {isMediaLoading && (
              <FiLoader
                size={18}
                className="shrink-0 animate-spin text-zinc-400"
              />
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl bg-zinc-200">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Current published store media"
                className="h-60 w-full object-cover"
              />
            ) : (
              <div className="grid h-60 place-items-center bg-zinc-100 text-center">
                <div>
                  <FiImage size={30} className="mx-auto text-zinc-400" />

                  <p className="mt-3 text-sm font-bold text-zinc-500">
                    No image has been published yet.
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    Upload the first image for this destination.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-800">
              <FiLink size={16} />
              Import from Pexels or public image URL
            </span>

            <input
              type="url"
              value={externalImageUrl}
              onChange={handleExternalUrlChange}
              placeholder="https://images.pexels.com/photos/..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
            />
          </label>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Paste a direct image URL, such as an
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 font-bold">
              images.pexels.com
            </code>
            URL. The image will be optimized, converted to WebP, stored in Blob,
            and saved in MongoDB automatically.
          </p>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />

          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
            Or
          </span>

          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6">
          <div className="flex flex-col items-center justify-center text-center">
            {uploadPreviewUrl ? (
              <img
                src={uploadPreviewUrl}
                alt="New selected media preview"
                onError={() => {
                  if (isUrlMode) {
                    setError(
                      "This URL could not be previewed. Use a direct public image URL.",
                    );
                  }
                }}
                className="h-56 w-full rounded-2xl bg-white object-contain"
              />
            ) : (
              <div className="grid size-20 place-items-center rounded-2xl bg-white text-zinc-400 shadow-sm">
                <FiImage size={30} />
              </div>
            )}

            <label
              className={`mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition ${
                isUrlMode
                  ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
                  : "cursor-pointer bg-zinc-950 text-white hover:bg-zinc-800"
              }`}
            >
              <FiUpload size={16} />
              Choose image from device
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isUrlMode}
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {selectedFile && (
              <p className="mt-3 text-xs font-semibold text-zinc-500">
                {selectedFile.name} · {formatFileSize(selectedFile.size)}
              </p>
            )}

            {isUrlMode && (
              <button
                type="button"
                onClick={() => {
                  setExternalImageUrl("");
                  setError("");
                }}
                className="mt-3 text-xs font-extrabold text-zinc-600 underline underline-offset-4 hover:text-zinc-950"
              >
                Clear pasted image URL
              </button>
            )}

            <p className="mt-4 max-w-md text-xs leading-5 text-zinc-500">
              Local files: JPG, PNG, WebP, or GIF, maximum 10 MB before optimization.
Animated GIF and animated WebP files keep their motion only when animation
preservation is enabled in the upload service.
              Category images target about 300 KB, product images target about
              450 KB, and banners target about 700 KB.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={(!selectedFile && !externalImageUrl.trim()) || isUploading}
          onClick={handleUpload}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-extrabold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
        >
          {isUploading ? (
            <>
              <FiLoader size={17} className="animate-spin" />
              {isUrlMode
                ? "Importing and optimizing image..."
                : "Optimizing and uploading image..."}
            </>
          ) : (
            <>
              <FiUpload size={17} />
              {isUrlMode
                ? "Import and publish image"
                : "Optimize and publish image"}
            </>
          )}
        </button>
      </section>

      {uploadedMedia && (
        <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <FiCheckCircle size={20} />
            </div>

            <div>
              <h2 className="text-lg font-black text-emerald-950">
                Image saved and published
              </h2>

              <p className="mt-1 text-sm text-emerald-800">
                The image is stored in Vercel Blob and saved in MongoDB
                automatically.
              </p>
            </div>
          </div>

          <img
            src={uploadedMedia.imageUrl}
            alt="Newly published store media"
            className="mt-5 h-64 w-full rounded-2xl bg-white object-contain"
          />

          <div className="mt-5 rounded-xl border border-emerald-200 bg-white/70 p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
              Published destination
            </p>

            <code className="mt-2 block break-all text-sm font-black text-emerald-950">
              {uploadedMedia.destination}
            </code>
          </div>

          {uploadedMedia.source === "device" && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-white/70 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                  Original size
                </p>

                <p className="mt-1 text-lg font-black text-emerald-950">
                  {formatFileSize(uploadedMedia.originalSize)}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white/70 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                  Optimized size
                </p>

                <p className="mt-1 text-lg font-black text-emerald-950">
                  {formatFileSize(uploadedMedia.compressedSize)}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-emerald-200 bg-white/70 p-4">
            <p className="text-sm font-black text-emerald-950">
              Website update complete
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Refresh the relevant category page to view the new published
              image. You do not need to copy the Blob URL or edit
              <code className="mx-1 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold">
                departmentData.js
              </code>
              .
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
