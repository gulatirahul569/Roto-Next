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
    const productImages =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images
        : [product?.image];

    const validImages = productImages
      .map(getImageUrl)
      .filter(Boolean);

    return validImages.length > 0
      ? validImages
      : ["/images/placeholders/product-placeholder.png"];
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(gallery[0]);

  useEffect(() => {
    setSelectedImage(gallery[0]);
  }, [gallery]);

  return (
    <section className="bg-zinc-100 p-5 sm:p-8 lg:p-10">
      <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-2xl bg-white p-6 sm:min-h-[540px]">
        <img
          src={selectedImage}
          alt={product?.name || "Product image"}
          className="max-h-[470px] w-full object-contain drop-shadow-2xl"
        />

        <button
          type="button"
          onClick={onToggleWishlist}
          aria-label={
            isInWishlist
              ? `Remove ${product?.name} from wishlist`
              : `Add ${product?.name} to wishlist`
          }
          className={`absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white shadow-lg transition hover:scale-110 ${
            isInWishlist
              ? "text-red-500"
              : "text-zinc-700 hover:text-red-500"
          }`}
        >
          <FiHeart
            size={21}
            fill={isInWishlist ? "currentColor" : "none"}
          />
        </button>
      </div>

      {gallery.length > 1 && (
        <div className="mt-5 flex justify-center gap-3 overflow-x-auto pb-1">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`Show product image ${index + 1}`}
              className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition sm:size-24 ${
                selectedImage === image
                  ? "border-zinc-950"
                  : "border-transparent hover:border-zinc-300"
              }`}
            >
              <img
                src={image}
                alt={`${product?.name || "Product"} thumbnail ${index + 1}`}
                className="size-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}