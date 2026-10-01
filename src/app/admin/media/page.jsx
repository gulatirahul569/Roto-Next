"use client";

import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiCopy,
  FiImage,
  FiLink,
  FiLoader,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
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

const mediaPresets = [
  {
    label: "Department banner",
    destination: "banners/men",
    hint: "Examples: banners/men, banners/women, banners/kids",
  },
  {
    label: "Subcategory image",
    destination: "categories/men/t-shirts",
    hint: "Examples: categories/men/t-shirts, categories/women/dresses",
  },
  {
    label: "Product image",
    destination: "products/manual/product-image",
    hint: "For manual product uploads. Usually use Admin → Products instead.",
  },
  {
    label: "Logo",
    destination: "logos/roto-logo",
    hint: "Examples: logos/roto-logo or logos/footer-logo",
  },
];

export default function AdminMediaPage() {
  const { token, user, isAuthLoaded } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [externalImageUrl, setExternalImageUrl] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [destination, setDestination] = useState("categories/men/t-shirts");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

  const isUrlMode = Boolean(externalImageUrl.trim());

  const previewUrl = selectedFile ? filePreviewUrl : externalImageUrl.trim();

  const selectedPreset = mediaPresets.find(
    (preset) => preset.destination === destination,
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setUploadedMedia(null);
    setCopied(false);
    setExternalImageUrl("");
    setSelectedFile(file || null);
  };

  const handleExternalUrlChange = (event) => {
    const url = event.target.value;

    setError("");
    setUploadedMedia(null);
    setCopied(false);
    setSelectedFile(null);
    setExternalImageUrl(url);
  };

  const handlePresetChange = (event) => {
    const preset = mediaPresets[Number(event.target.value)];

    if (!preset) {
      return;
    }

    setDestination(preset.destination);
  };

  const handleUpload = async () => {
    if (!selectedFile && !externalImageUrl.trim()) {
      setError("Select an image file or paste a direct public image URL.");
      return;
    }

    if (!destination.trim()) {
      setError("Please enter an image destination path.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setUploadedMedia(null);
      setCopied(false);

      const media = selectedFile
        ? await uploadStoreMedia(selectedFile, token, destination)
        : await importStoreMediaFromUrl(
            externalImageUrl.trim(),
            token,
            destination,
          );

      setUploadedMedia({
        ...media,
        source: selectedFile ? "device" : "url",
      });
    } catch (uploadError) {
      setError(
        uploadError.message || "Unable to optimize and upload the image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const copyUrl = async () => {
    if (!uploadedMedia?.imageUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(uploadedMedia.imageUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the URL. Please copy it manually.");
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
          Upload and optimize department banners, category images, logos, and
          other store media for Vercel Blob.
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
            Upload store image
          </h2>

          <p className="mt-1 text-sm text-zinc-600">
            Device uploads are converted to WebP and resized before they are
            sent to storage.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-800">
              Image type
            </span>

            <select
              defaultValue="1"
              onChange={handlePresetChange}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
            >
              {mediaPresets.map((preset, index) => (
                <option key={preset.label} value={index}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-zinc-800">
              Blob destination path
            </span>

            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="categories/men/t-shirts"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
            />
          </label>
        </div>

        {selectedPreset?.hint && (
          <p className="mt-2 text-xs font-semibold text-zinc-500">
            {selectedPreset.hint}
          </p>
        )}

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
            Paste a direct public image file URL, for example an
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 font-bold">
              images.pexels.com
            </code>
            image URL. Do not paste a normal Pexels photo-page URL.
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
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected media preview"
                onError={() => {
                  if (isUrlMode) {
                    setError(
                      "This image URL could not be previewed. Use a direct public image URL.",
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
                accept="image/jpeg,image/png,image/webp"
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
              Local files: JPG, PNG, or WebP, maximum 10 MB before optimization.
              Collection images target about 300 KB, products about 450 KB, and
              banners about 700 KB.
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
                : "Optimizing and uploading..."}
            </>
          ) : (
            <>
              <FiUpload size={17} />
              {isUrlMode
                ? "Import image to Vercel Blob"
                : "Optimize and upload to Vercel Blob"}
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
                Image uploaded successfully
              </h2>

              <p className="mt-1 text-sm text-emerald-800">
                {uploadedMedia.source === "url"
                  ? "The external image was imported, optimized, and stored in Vercel Blob."
                  : "The image was optimized and stored in Vercel Blob."}
              </p>
            </div>
          </div>

          <img
            src={uploadedMedia.imageUrl}
            alt="Uploaded Blob image"
            className="mt-5 h-64 w-full rounded-2xl bg-white object-contain"
          />

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

          {uploadedMedia.source === "url" && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-white/70 p-4">
              <p className="text-sm font-black text-emerald-950">
                Image imported and optimized
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                The original external image was converted to an optimized WebP
                asset and saved under your chosen Blob destination.
              </p>
            </div>
          )}

          <div className="mt-5">
            <p className="mb-2 text-sm font-bold text-emerald-950">
              Vercel Blob URL
            </p>

            <div className="flex gap-2">
              <input
                readOnly
                value={uploadedMedia.imageUrl}
                className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs text-zinc-700 outline-none"
              />

              <button
                type="button"
                onClick={copyUrl}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800"
              >
                {copied ? <FiCheckCircle size={16} /> : <FiCopy size={16} />}

                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-white/70 p-4">
            <p className="text-sm font-black text-emerald-950">
              Image saved and published
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              This image has been stored in Vercel Blob and its URL has been
              saved in MongoDB automatically. Refresh the relevant department
              page to see the updated image.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
