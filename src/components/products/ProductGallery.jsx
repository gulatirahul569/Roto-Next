"use client";

import { useEffect, useMemo, useState } from "react";
import { FiHeart } from "react-icons/fi";

function getImageUrl(image) {
  if (typeof image === "string") {
    return image;
  }

  if (image?.url) {
    return image.url;
  }

  return "";
}

export default function ProductGallery({
  product,
  isInWishlist,
  onToggleWishlist,
}) {
  const gallery = useMemo(() => {
    const allProductImages = [
      product?.image,
      ...(Array.isArray(product?.images) ? product.images : []),
    ];

    const validImages = allProductImages
      .map(getImageUrl)
      .filter(Boolean);

    const uniqueImages = Array.from(new Set(validImages));

    return uniqueImages.length > 0
      ? uniqueImages
      : ["/images/placeholders/product-placeholder.png"];
  }, [product?.image, product?.images]);

  const [selectedImage, setSelectedImage] = useState(gallery[0]);

  useEffect(() => {
    setSelectedImage(gallery[0]);
  }, [gallery]);

  return (
    <section className="w-full p-2 pt-0">
      {/* Desktop: Thumbnails Left + Main Image Right */}
      <div className="flex w-full gap-4">
        {/* Thumbnails */}
        {gallery.length > 1 && (
          <div className="hidden w-[82px] shrink-0 flex-col pt-2 gap-3 lg:flex">
            {gallery.map((image, index) => {
              const isSelected = selectedImage === image;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={isSelected}
                  className={`relative aspect-square w-full overflow-hidden rounded-2xl bg-[#141414] transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-black ring-offset-2 ring-offset-white opacity-100"
                      : "opacity-65 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product?.name || "Product"} thumbnail ${
                      index + 1
                    }`}
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Main Image */}
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-[28px] bg-[#141414] shadow-sm">
          <img
            src={selectedImage}
            alt={product?.name || "Product image"}
            className="h-full min-h-[500px] w-full object-fill transition-all duration-300 hover:scale-105 lg:min-h-0"
          />

          {/* Wishlist floating toggle */}
          {onToggleWishlist && (
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-label={
                isInWishlist
                  ? `Remove ${product?.name} from wishlist`
                  : `Add ${product?.name} to wishlist`
              }
              className={`absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/80 backdrop-blur-md shadow-sm transition hover:scale-105 ${
                isInWishlist
                  ? "text-rose-500"
                  : "text-zinc-700 hover:text-rose-500"
              }`}
            >
              <FiHeart
                size={18}
                fill={isInWishlist ? "currentColor" : "none"}
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Thumbnails */}
      {gallery.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:hidden">
          {gallery.map((image, index) => {
            const isSelected = selectedImage === image;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                aria-label={`Show product image ${index + 1}`}
                aria-pressed={isSelected}
                className={`relative aspect-square w-full overflow-hidden rounded-2xl bg-[#141414] transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-black ring-offset-2 ring-offset-white opacity-100"
                    : "opacity-65 hover:opacity-100"
                }`}
              >
                <img
                  src={image}
                  alt={`${product?.name || "Product"} thumbnail ${
                    index + 1
                  }`}
                className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

