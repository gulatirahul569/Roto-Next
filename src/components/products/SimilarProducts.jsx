"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { fetchProducts } from "../../services/productService";

const PRODUCT_PATH = "/product";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

// Handles image stored as string, array of strings, or array of { url }.
function getImage(product) {
  const first = Array.isArray(product.images) ? product.images[0] : null;
  const candidate =
    first || product.image || product.thumbnail || product.imageUrl || "";
  return typeof candidate === "string" ? candidate : candidate?.url || "";
}

function SimilarCard({ item }) {
  const image = getImage(item);
  const rating = Math.max(0, Math.min(5, Math.floor(Number(item.rating) || 0)));
  const isExternal =
    item.purchaseMode === "EXTERNAL_LINK" || item.source === "AMAZON";

  return (
    <Link
      href={`${PRODUCT_PATH}/${item._id}`}
      className="group w-44 shrink-0 snap-start sm:w-52"
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-zinc-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-[#007185] group-hover:text-[#C7511F] group-hover:underline">
        {item.name}
      </p>

      <div className="mt-1 flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar
            key={i}
            size={13}
            className={
              i < rating ? "fill-[#FFA41C] text-[#FFA41C]" : "text-zinc-300"
            }
          />
        ))}
      </div>

      <p className="mt-1 text-base font-medium text-zinc-950">
        {isExternal ? "View on partner site" : formatPrice(item.price)}
      </p>
    </Link>
  );
}

export default function SimilarProducts({ product }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scroller = useRef(null);

  // Same subcategory (and department, when the product has one).
  const subcategory = product.subcategory || product.subCategory || "";
  const department = product.department || "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchProducts(undefined, {
          subcategory,
          department,
        });
        const list = Array.isArray(data)
          ? data
          : data?.products || data?.items || [];

        if (!cancelled) {
          setItems(
            list
              .filter((item) => item._id !== product._id)
              // Safety net in case the API ignores the filter.
              .filter((item) => {
                const itemSub = item.subcategory || item.subCategory;
                return !itemSub || itemSub === subcategory;
              })
              .slice(0, 12),
          );
        }
      } catch (error) {
        console.error("Error fetching similar products:", error);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (subcategory) load();
    else setIsLoading(false);

    return () => {
      cancelled = true;
    };
  }, [subcategory, department, product._id]);

  const scrollBy = (direction) => {
    scroller.current?.scrollBy({ left: direction * 480, behavior: "smooth" });
  };

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="mt-10 border-t border-zinc-200 pt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-zinc-950">
          Similar products you may like
        </h2>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="grid h-9 w-9 place-items-center rounded-full border border-zinc-300 hover:bg-zinc-50"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="grid h-9 w-9 place-items-center rounded-full border border-zinc-300 hover:bg-zinc-50"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="mt-5 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-44 shrink-0 animate-pulse sm:w-52">
                <div className="aspect-square rounded-lg bg-zinc-200" />
                <div className="mt-2 h-4 w-4/5 rounded bg-zinc-200" />
                <div className="mt-2 h-4 w-1/3 rounded bg-zinc-200" />
              </div>
            ))
          : items.map((item) => <SimilarCard key={item._id} item={item} />)}
      </div>
    </section>
  );
}