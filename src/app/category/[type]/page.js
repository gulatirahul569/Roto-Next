"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronDown,
  FiFilter,
  FiSliders,
  FiX,
} from "react-icons/fi";
import { fetchProducts } from "../../../services/productService";
import { categoryData } from "../../../data/categoryData";
import ProductCard from "../../../components/products/ProductCard";

const sortOptions = [
  "Newest",
  "Price: Low to High",
  "Price: High to Low",
  "Top Rated",
];

const priceOptions = [
  "All",
  "Under ₹3000",
  "₹3000 - ₹6000",
  "₹6000 - ₹9000",
  "Above ₹9000",
];

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
        >
          <div className="aspect-[4/4.7] animate-pulse bg-zinc-200" />

          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
            <div className="h-9 animate-pulse rounded-full bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterContent({
  filters,
  selectedFilter,
  setSelectedFilter,
  selectedPrice,
  setSelectedPrice,
}) {
  return (
    <div className="space-y-7">
      {/* Product type */}
      <div>
        <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
          Categories
        </h3>

        <div className="flex flex-wrap gap-2 lg:flex-col">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`rounded-full border px-4 py-2.5 text-xs font-bold transition lg:w-full lg:rounded-xl lg:text-left ${
                selectedFilter === filter
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
          Price range
        </h3>

        <div className="flex flex-wrap gap-2 lg:flex-col">
          {priceOptions.map((price) => (
            <button
              key={price}
              type="button"
              onClick={() => setSelectedPrice(price)}
              className={`rounded-full border px-4 py-2.5 text-xs font-bold transition lg:w-full lg:rounded-xl lg:text-left ${
                selectedPrice === price
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
            >
              {price}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const type = String(params?.type || "").toLowerCase();

  const data = categoryData[type];

  const [products, setProducts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetchProducts();
        const productList = response?.products || response || [];

        const normalizedProducts = productList.map((product) => ({
          ...product,
          category: String(product.category || "").toLowerCase().trim(),
          newCategory: String(product.newCategory || "")
            .toLowerCase()
            .trim(),
        }));

        setProducts(normalizedProducts);
      } catch (requestError) {
        console.error("Error fetching products:", requestError);
        setError("Unable to load products right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    setSelectedFilter("All");
    setSelectedPrice("All");
    setSortOption("Newest");
    setIsMobileFiltersOpen(false);
    setIsSortOpen(false);
  }, [type]);

  useEffect(() => {
    if (!isMobileFiltersOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileFiltersOpen]);

  const finalProducts = useMemo(() => {
    if (!data) {
      return [];
    }

    let result = [...products];

    /* Main category/new-category filter */
    if (data.productType !== "all") {
      result = result.filter(
        (product) => product.newCategory === data.productType
      );
    }

    /* Secondary filter */
    if (selectedFilter !== "All") {
      result = result.filter(
        (product) =>
          product.category === selectedFilter.toLowerCase().trim()
      );
    }

    /* Price filter */
    if (selectedPrice === "Under ₹3000") {
      result = result.filter((product) => Number(product.price) < 3000);
    }

    if (selectedPrice === "₹3000 - ₹6000") {
      result = result.filter((product) => {
        const price = Number(product.price);
        return price >= 3000 && price <= 6000;
      });
    }

    if (selectedPrice === "₹6000 - ₹9000") {
      result = result.filter((product) => {
        const price = Number(product.price);
        return price >= 6000 && price <= 9000;
      });
    }

    if (selectedPrice === "Above ₹9000") {
      result = result.filter((product) => Number(product.price) > 9000);
    }

    /* Sorting */
    if (sortOption === "Price: Low to High") {
      return result.sort((firstProduct, secondProduct) => {
        return Number(firstProduct.price) - Number(secondProduct.price);
      });
    }

    if (sortOption === "Price: High to Low") {
      return result.sort((firstProduct, secondProduct) => {
        return Number(secondProduct.price) - Number(firstProduct.price);
      });
    }

    if (sortOption === "Top Rated") {
      return result.sort((firstProduct, secondProduct) => {
        return (
          Number(secondProduct.rating || 0) -
          Number(firstProduct.rating || 0)
        );
      });
    }

    return result;
  }, [data, products, selectedFilter, selectedPrice, sortOption]);

  if (!data) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50 px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700">
            Roto
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950">
            Category not found.
          </h1>

          <p className="mt-4 text-zinc-600">
            The category you are looking for does not exist or has been moved.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Category hero */}
      <section className="relative isolate h-[360px] overflow-hidden sm:h-[430px] lg:h-[500px]">
        <motion.img
          key={data.banner}
          src={data.banner}
          alt={data.title}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="absolute inset-0 size-full object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-6 text-center lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/75 sm:text-xs">
              Roto collection
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl lg:text-8xl">
              {data.title}
            </h1>

            <p className="mt-5 text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
              {data.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Mobile filter button */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
        >
          <FiFilter size={16} />
          Filter products
        </button>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 270, damping: 28 }}
              className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-200" />

              <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
                    Refine results
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                    Filters
                  </h2>
                </div>

                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-950"
                >
                  <FiX size={20} />
                </button>
              </div>

              <FilterContent
                filters={data.filters}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />

              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="mt-8 w-full rounded-full bg-zinc-950 py-3.5 text-sm font-extrabold text-white"
              >
                Show {finalProducts.length} products
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-[1600px]">
        {/* Desktop filter sidebar */}
        <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white p-7 lg:block">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-zinc-100">
              <FiSliders size={18} />
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
                Refine results
              </p>

              <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                Filters
              </h2>
            </div>
          </div>

          <div className="mt-8">
            <FilterContent
              filters={data.filters}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />
          </div>
        </aside>

        {/* Products */}
        <section className="min-w-0 flex-1 px-6 py-10 lg:px-10">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">
                {data.title}
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">
                Products
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {isLoading
                  ? "Loading products..."
                  : `Showing ${finalProducts.length} product${
                      finalProducts.length === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            {/* Sort dropdown */}
            <div className="relative w-full sm:w-56">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm font-bold text-zinc-900 transition hover:border-zinc-500"
              >
                <span>{sortOption}</span>
                <FiChevronDown
                  size={17}
                  className={`transition ${isSortOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSortOption(option);
                          setIsSortOpen(false);
                        }}
                        className={`block w-full px-4 py-3 text-left text-sm font-semibold transition hover:bg-zinc-100 ${
                          sortOption === option
                            ? "bg-zinc-100 text-zinc-950"
                            : "text-zinc-600"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-bold">Unable to load products.</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          ) : isLoading ? (
            <ProductGridSkeleton />
          ) : finalProducts.length === 0 ? (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <div>
                <h3 className="text-xl font-black tracking-tight text-zinc-950">
                  No products found.
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                  Try another category, price range, or filter selection.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilter("All");
                    setSelectedPrice("All");
                    setSortOption("Newest");
                  }}
                  className="mt-5 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {finalProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}