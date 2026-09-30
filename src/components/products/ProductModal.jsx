"use client";

import { useEffect, useState } from "react";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) {
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    }
  }, [product]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  const isExternalProduct =
    product.purchaseMode === "EXTERNAL_LINK" ||
    product.source === "AMAZON";

  const productImages = Array.from(
    new Set(
      [product.image, ...(product.images || [])].filter(Boolean)
    )
  );

  const isOutOfStock =
    !isExternalProduct &&
    Number(product.stock || 0) <= 0;

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  function handleAddToCart() {
    if (isExternalProduct) {
      return;
    }

    if (isOutOfStock) {
      return;
    }

    onAddToCart?.(product);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product preview"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl text-gray-700 shadow-md transition hover:bg-gray-100"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2">
          <section className="bg-gray-50 p-5 sm:p-8">
            <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl bg-white">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title || "Product image"}
                  className="h-[320px] w-full object-contain"
                />
              ) : (
                <div className="text-sm text-gray-500">
                  Product image unavailable
                </div>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {productImages.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white ${
                      selectedImage === image
                        ? "border-orange-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={product.title || "Product thumbnail"}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {product.category}
                </span>
              )}

              {product.source === "AMAZON" && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                  Amazon affiliate
                </span>
              )}

              {product.source === "VENDOR" && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Vendor product
                </span>
              )}
            </div>

            {product.brand && (
              <p className="mt-5 text-sm font-medium text-gray-500">
                {product.brand}
              </p>
            )}

            <h2
              id="product-modal-title"
              className="mt-1 text-2xl font-bold leading-tight text-gray-950 sm:text-3xl"
            >
              {product.title}
            </h2>

            {!isExternalProduct && (
              <div className="mt-5 flex items-center gap-3">
                <p className="text-2xl font-bold text-gray-950">
                  {formatPrice(product.price)}
                </p>

                {Number(product.compareAtPrice || 0) >
                  Number(product.price || 0) && (
                  <p className="text-base text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </p>
                )}
              </div>
            )}

            {isExternalProduct && (
              <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
                This product is available through an external seller. Clicking
                the button below will open the seller&apos;s website in a new
                tab.
              </div>
            )}

            {product.shortDescription && (
              <p className="mt-5 text-base leading-7 text-gray-700">
                {product.shortDescription}
              </p>
            )}

            {product.description && (
              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-600">
                {product.description}
              </div>
            )}

            {!isExternalProduct && (
              <div className="mt-6">
                {isOutOfStock ? (
                  <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700">
                    Out of stock
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
                    In stock
                  </span>
                )}
              </div>
            )}

            <div className="mt-8">
              {isExternalProduct ? (
                <a
                  href={product.externalUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3.5 text-center font-semibold text-white transition hover:bg-orange-600"
                >
                  {product.externalButtonText ||
                    (product.source === "AMAZON"
                      ? "Explore on Amazon"
                      : "Explore Product")}{" "}
                  ↗
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full rounded-xl bg-black px-5 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}