"use client";

import Link from "next/link";
import { FiStar } from "react-icons/fi";

const MIN_ITEMS_PER_SET = 8;
const SECONDS_PER_CARD = 5;

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function getReviewInfo(product) {
  const rating = Number(product.rating ?? product.averageRating ?? 0);

  const count = Array.isArray(product.reviews)
    ? product.reviews.length
    : Number(
        product.numReviews ??
          product.reviewCount ??
          product.reviews ??
          0,
      ) || 0;

  return {
    rating,
    count,
  };
}

function ProductMarqueeCard({ product }) {
  const { rating, count } = getReviewInfo(product);

  const image =
    product.image ||
    product.images?.[0] ||
    "/images/product-placeholder.png";

  return (
    <Link
      href={`/product/${product._id}`}
      className="group/card relative block h-[340px] overflow-hidden rounded-3xl border border-black/5 bg-zinc-200 shadow-xl transition-transform duration-300 hover:-translate-y-2 sm:h-96"
    >
      <img
        src={image}
        alt={product.name || "Product"}
        draggable={false}
        className="size-full object-cover transition-transform duration-500 group-hover/card:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-yellow-400">
          <FiStar size={14} className="fill-yellow-400" />

          <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>

          {rating > 0 && count > 0 && (
            <span className="font-medium text-white/70">
              ({count})
            </span>
          )}
        </div>

        <h3 className="line-clamp-1 text-lg font-bold text-white">
          {product.name}
        </h3>

        <p className="mt-1 text-base font-semibold text-white/90">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default function ProductMarquee({ products }) {
  if (!products?.length) {
    return null;
  }

  const repeatCount = Math.ceil(MIN_ITEMS_PER_SET / products.length);

  const baseSet = Array.from({
    length: repeatCount,
  }).flatMap(() => products);

  const marqueeDuration = baseSet.length * SECONDS_PER_CARD;

  return (
    <div className="product-marquee-wrap py-4">
      <div
        className="product-marquee-track flex w-max"
        style={{
          "--product-marquee-duration": `${marqueeDuration}s`,
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className={`flex ${
              copy === 1 ? "product-marquee-duplicate" : ""
            }`}
          >
            {baseSet.map((product, index) => (
              <div
                key={`${copy}-${product._id}-${index}`}
                className="shrink-0 pr-5"
              >
                <div className="w-[250px] sm:w-[280px]">
                  <ProductMarqueeCard product={product} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes product-marquee-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .product-marquee-wrap {
          overflow: hidden;
        }

        .product-marquee-track {
          animation: product-marquee-scroll
            var(--product-marquee-duration, 40s)
            linear
            infinite;
          will-change: transform;
        }

        .product-marquee-wrap:hover .product-marquee-track,
        .product-marquee-wrap:focus-within .product-marquee-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .product-marquee-wrap {
            overflow-x: auto;
            scrollbar-width: none;
          }

          .product-marquee-wrap::-webkit-scrollbar {
            display: none;
          }

          .product-marquee-track {
            animation: none;
            padding-left: 1.5rem;
          }

          .product-marquee-duplicate {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}