"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiStar } from "react-icons/fi";
import { fetchProducts } from "../../services/productService";

// One set of cards must be at least this long so the loop never shows a gap
const MIN_ITEMS_PER_SET = 8;
// Seconds each card takes to travel past (bigger = slower)
const SECONDS_PER_CARD = 5;

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

/* Reads rating + review count from the product.
   Adjust the field names here if your product model uses different ones. */
function getReviewInfo(product) {
  const rating = Number(product.rating ?? product.averageRating ?? 0);

  const count = Array.isArray(product.reviews)
    ? product.reviews.length
    : Number(
        product.numReviews ?? product.reviewCount ?? product.reviews ?? 0
      ) || 0;

  return { rating, count };
}

function DropCardSkeleton() {
  return (
    <div className="h-[340px] animate-pulse rounded-3xl bg-zinc-200 sm:h-96" />
  );
}

/* Image-first card: only name, review and price, laid over the photo */
function DropCard({ product }) {
  const { rating, count } = getReviewInfo(product);
  const image = product.image || product.images?.[0];

  return (
    <Link
      href={`/product/${product._id}`}
      className="group/card relative block h-[340px] overflow-hidden rounded-3xl border border-black/5 bg-zinc-200 shadow-xl transition-transform duration-300 hover:-translate-y-2 sm:h-96"
    >
      {image && (
        <img
          src={image}
          alt={product.name}
          draggable={false}
          className="size-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-yellow-400">
          <FiStar size={14} className="fill-yellow-400" />
          <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>

          {rating > 0 && count > 0 && (
            <span className="font-medium text-white/70">({count})</span>
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

export default function NewDrops() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getProducts() {
      try {
        setIsLoading(true);
        setError("");

        const data = await fetchProducts();
        const allProducts = data?.products || data || [];

        const newDrops = allProducts.filter(
          (product) =>
            String(product.newCategory || "").toLowerCase() === "new"
        );

        setProducts(newDrops);
      } catch (requestError) {
        console.error("Error fetching new drops:", requestError);
        setError("Unable to load new drops right now.");
      } finally {
        setIsLoading(false);
      }
    }

    getProducts();
  }, []);

  /* Build one "set" long enough to fill the screen, then render it twice.
     The track slides exactly half its width, so the loop is seamless. */
  const repeatCount = products.length
    ? Math.ceil(MIN_ITEMS_PER_SET / products.length)
    : 0;
  const baseSet = Array.from({ length: repeatCount }).flatMap(() => products);
  const marqueeDuration = baseSet.length * SECONDS_PER_CARD;

  return (
    <section className="overflow-hidden bg-zinc-50 py-20 sm:py-24">
      {/* Heading */}
      <div className="mx-auto flex justify-center max-w-full px-6 lg:px-8">
        <div className="max-w-2xl flex flex-col items-center ">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Fresh arrivals
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            New drops.
          </h2>

          <p className="mt-4 text-base leading-7 text-zinc-600">
            The latest gear, ready to ride.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto mt-10 max-w-full px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {!error && isLoading && (
        <div className="mt-10 flex gap-5 overflow-hidden px-6 pb-4 lg:px-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="w-[250px] shrink-0 sm:w-[280px]">
              <DropCardSkeleton />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!error && !isLoading && products.length === 0 && (
        <div className="mx-auto mt-10 max-w-full px-6 lg:px-8">
          <div className="flex min-h-52 w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
            <div>
              <p className="font-bold text-zinc-950">
                No new drops are available yet.
              </p>

              <Link
                href="/category/all"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-zinc-900 underline underline-offset-4"
              >
                Browse all products
                <FiArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Auto-scrolling products (right to left, full width) */}
      {!error && !isLoading && products.length > 0 && (
        <div className="drops-marquee-wrap mt-10 py-4">
          <div
            className="drops-marquee-track flex w-max"
            style={{ "--drops-duration": `${marqueeDuration}s` }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className={`flex ${copy === 1 ? "drops-marquee-dup" : ""}`}
              >
                {baseSet.map((product, index) => (
                  // Spacing is padding (not gap) so both halves are exactly
                  // equal in width and the loop has no jump.
                  <div
                    key={`${copy}-${index}-${product._id}`}
                    className="shrink-0 pr-5"
                  >
                    <div className="w-[250px] sm:w-[280px]">
                      <DropCard product={product} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Plain style tag (no styled-jsx) to avoid hydration mismatches.
              Class names are prefixed so they can't clash with other marquees. */}
          <style>{`
            @keyframes drops-marquee-scroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }

            .drops-marquee-wrap {
              overflow: hidden;
            }

            .drops-marquee-track {
              animation: drops-marquee-scroll var(--drops-duration, 40s) linear infinite;
              will-change: transform;
            }

            .drops-marquee-wrap:hover .drops-marquee-track,
            .drops-marquee-wrap:focus-within .drops-marquee-track {
              animation-play-state: paused;
            }

            /* Reduced motion: no auto-scroll, just a normal swipeable row */
            @media (prefers-reduced-motion: reduce) {
              .drops-marquee-wrap {
                overflow-x: auto;
                scrollbar-width: none;
              }
              .drops-marquee-wrap::-webkit-scrollbar {
                display: none;
              }
              .drops-marquee-track {
                animation: none;
                padding-left: 1.5rem;
              }
              .drops-marquee-dup {
                display: none;
              }
            }
          `}</style>
        </div>
      )}

      {/* Link to full collection */}
      <div className="mx-auto mt-8 flex max-w-full justify-center px-6 sm:mt-9 sm:justify-start lg:px-8">
        <Link
          href="/category/new"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-zinc-950 underline underline-offset-4 transition hover:text-zinc-600"
        >
          Explore all new drops
          <FiArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}