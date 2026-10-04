"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiExternalLink,
  FiStar,
} from "react-icons/fi";
import { fetchProducts } from "../../services/productService";

const MIN_ITEMS_PER_SET = 8;
const SECONDS_PER_CARD = 5;
const MAX_NEW_DROPS = 12;

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

function DropCardSkeleton() {
  return (
    <div className="h-[340px] animate-pulse rounded-3xl  sm:h-96" />
  );
}

function DropCard({ product }) {
  const { rating, count } = getReviewInfo(product);

  const image = product.image || product.images?.[0];

  const isExternalProduct =
    product.purchaseMode === "EXTERNAL_LINK" ||
    product.source === "AMAZON";

  const isAmazonProduct = product.source === "AMAZON";

  return (
    <Link
      href={`/product/${product._id}`}
      className="group/card relative block  h-[340px] overflow-hidden rounded-3xl border border-black/5  shadow-xl transition-transform duration-300 hover:-translate-y-2 sm:h-96"
    >
      {image && (
        <img
          src={image}
          alt={product.name || "Product"}
          draggable={false}
          className="size-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      {isAmazonProduct && (
        <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
          Amazon
        </span>
      )}

      {!isAmazonProduct && isExternalProduct && (
        <span className="absolute left-4 top-4 rounded-full bg-violet-600 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
          External
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        {!isExternalProduct && (
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-yellow-400">
            <FiStar size={14} className="fill-yellow-400" />

            <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>

            {rating > 0 && count > 0 && (
              <span className="font-medium text-white/70">
                ({count})
              </span>
            )}
          </div>
        )}

        {isExternalProduct && (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-orange-300">
            <FiExternalLink size={14} />
            Available through partner
          </div>
        )}

        <h3 className="line-clamp-1 text-lg font-bold text-white">
          {product.name}
        </h3>

        {isExternalProduct ? (
          <p className="mt-1 text-sm font-semibold text-white/85">
            {isAmazonProduct ? "Explore on Amazon" : "Explore product"}
          </p>
        ) : (
          <p className="mt-1 text-base font-semibold text-white/90">
            {formatPrice(product.price)}
          </p>
        )}
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

        /*
          Only products explicitly marked as:

          newCategory: "new"

          appear in the homepage New Drops section.
        */
        const manuallyMarkedNewProducts = allProducts.filter(
          (product) =>
            String(product.newCategory || "").toLowerCase() === "new",
        );

        setProducts(
          manuallyMarkedNewProducts.slice(0, MAX_NEW_DROPS),
        );
      } catch (requestError) {
        console.error("Error fetching new drops:", requestError);

        setError("Unable to load new drops right now.");
      } finally {
        setIsLoading(false);
      }
    }

    getProducts();
  }, []);

  const repeatCount = products.length
    ? Math.ceil(MIN_ITEMS_PER_SET / products.length)
    : 0;

  const baseSet = Array.from({
    length: repeatCount,
  }).flatMap(() => products);

  const marqueeDuration = baseSet.length * SECONDS_PER_CARD;

  return (
    <section className="overflow-hidden py-8 bg-gray-50">
      <div className="mx-auto  max-w-full  px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Fresh arrivals
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            New drops.
          </h2>

          <p className="mt-4 text-base leading-7 text-zinc-600">
            Explore the latest products selected for the Roto store.
          </p>
        </div>
      </div>

      {error && (
        <div className="mx-auto mt-10 max-w-full px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {error}
          </div>
        </div>
      )}

      {!error && isLoading && (
        <div className="mt-10 flex gap-5 overflow-hidden px-6 pb-4 lg:px-8">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="w-[250px] shrink-0 sm:w-[280px]"
            >
              <DropCardSkeleton />
            </div>
          ))}
        </div>
      )}

      {!error && !isLoading && products.length === 0 && (
        <div className="mx-auto mt-10 max-w-full px-6 lg:px-8">
          <div className="flex min-h-52 w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
            <div>
              <p className="font-bold text-zinc-950">
                No new drops are available yet.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Check back soon for fresh arrivals.
              </p>

              <Link
                href="/category/all"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-900 underline underline-offset-4"
              >
                Browse all products
                <FiArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {!error && !isLoading && products.length > 0 && (
        <div className="drops-marquee-wrap mt-10 py-4">
          <div
            className="drops-marquee-track flex w-max"
            style={{
              "--drops-duration": `${marqueeDuration}s`,
            }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className={`flex ${
                  copy === 1 ? "drops-marquee-dup" : ""
                }`}
              >
                {baseSet.map((product, index) => (
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

          <style>{`
            @keyframes drops-marquee-scroll {
              from {
                transform: translateX(0);
              }

              to {
                transform: translateX(-50%);
              }
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

      <div className="mx-auto mt-8 flex max-w-full justify-center px-6 sm:mt-9 lg:justify-start lg:px-8">
        <Link
          href="/category/new"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-zinc-950 underline underline-offset-4 transition hover:text-zinc-600"
        >
          Explore New Products
          <FiArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}