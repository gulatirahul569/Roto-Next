"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiFilter,
  FiLayers,
  FiRefreshCw,
  FiShield,
  FiSliders,
  FiTruck,
  FiX,
} from "react-icons/fi";
import {
  getDepartmentBySlug,
  getSubcategoryBySlug,
} from "../../../data/departmentData";
import ProductCard from "../../../components/products/ProductCard";
import { fetchProducts } from "../../../services/productService";
import ProductMarquee from "@/components/products/ProductMarquee";

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

function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
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

function ProductRow({ products }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

function TrustStrip() {
  const trustItems = [
    {
      icon: FiShield,
      title: "Secure payments",
      text: "Safe and protected checkout",
    },
    {
      icon: FiRefreshCw,
      title: "Easy returns",
      text: "Simple return support",
    },
    {
      icon: FiTruck,
      title: "Fast delivery",
      text: "Products delivered with care",
    },
    {
      icon: FiCheckCircle,
      title: "Curated products",
      text: "Selected for everyday life",
    },
  ];

  return (
    <section className="border-y border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-7xl divide-y divide-zinc-200 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-8">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 py-5 sm:px-5 lg:px-6"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
                <Icon size={18} />
              </div>

              <div>
                <p className="text-sm font-black text-zinc-950">
                  {item.title}
                </p>

                <p className="mt-0.5 text-xs text-zinc-500">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkText,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
          {title}
        </h2>

        {description && (
          <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {href && linkText && (
        <Link
          href={href}
          className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-zinc-950 transition hover:text-zinc-600"
        >
          {linkText}
          <FiArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function CollectionCard({ department, subcategory }) {
  const image = subcategory.image || department.banner;

  return (
    <Link
      href={`/category/${department.slug}/${subcategory.slug}`}
      className="group relative min-h-104 overflow-hidden rounded-2xl bg-zinc-900"
    >
      <img
        src={image}
        alt={subcategory.title}
        className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

      <div className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/30 bg-black/15 text-white backdrop-blur-sm transition group-hover:bg-white group-hover:text-zinc-950">
        <FiArrowRight size={17} />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
          Explore collection
        </p>

        <h3 className="mt-2 text-2xl font-black tracking-tight">
          {subcategory.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">
          {subcategory.description}
        </p>
      </div>
    </Link>
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
      <div>
        <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
          Product type
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

  const segments = Array.isArray(params?.segments)
    ? params.segments
    : params?.segments
      ? [params.segments]
      : ["all"];

  const departmentSlug = String(segments[0] || "all").toLowerCase();

  const subcategorySlug = segments[1]
    ? String(segments[1]).toLowerCase()
    : "";

  const department = getDepartmentBySlug(departmentSlug);

  const subcategory = subcategorySlug
    ? getSubcategoryBySlug(departmentSlug, subcategorySlug)
    : null;

  const isValidRoute =
    Boolean(department) && (!subcategorySlug || Boolean(subcategory));

  const isDepartmentLanding =
    department?.key !== "ALL" && !subcategory;

  const isNewDropsPage = department?.slug === "new";

  const pageTitle = subcategory
    ? subcategory.title
    : department?.title || "Category";

  const pageSubtitle = subcategory
    ? subcategory.description
    : department?.subtitle || "";

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    if (!isValidRoute || !department) {
      setIsLoading(false);
      return;
    }

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError("");

        const filters = {};

        if (department.key !== "ALL") {
          filters.department = department.key;
        }

        if (subcategory) {
          filters.subcategory = subcategory.slug;
        }

        if (department.slug === "new") {
          filters.category = "new";
        }

        const response = await fetchProducts(undefined, filters);

        const productList = response?.products || response || [];

        setProducts(Array.isArray(productList) ? productList : []);
      } catch (requestError) {
        console.error("Category product loading error:", requestError);

        setError("Unable to load products right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [department?.key, department?.slug, isValidRoute, subcategory?.slug]);

  useEffect(() => {
    setSelectedFilter("All");
    setSelectedPrice("All");
    setSelectedBrand("All");
    setSortOption("Newest");
    setIsMobileFiltersOpen(false);
    setIsSortOpen(false);
  }, [departmentSlug, subcategorySlug]);

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

  const productTypeFilters = useMemo(() => {
    const categories = Array.from(
      new Set(
        products
          .map((product) => String(product.category || "").trim())
          .filter(Boolean),
      ),
    ).sort((first, second) => first.localeCompare(second));

    return ["All", ...categories];
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => String(product.brand || "").trim())
          .filter(Boolean),
      ),
    ).sort((first, second) => first.localeCompare(second));
  }, [products]);

  const newProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          String(product.newCategory || "").toLowerCase() === "new",
      )
      .slice(0, 4);
  }, [products]);

  const featuredProducts = useMemo(() => {
    return products
      .filter((product) => product.isFeatured === true)
      .slice(0, 4);
  }, [products]);

  const finalProducts = useMemo(() => {
    let result = [...products];

    if (selectedFilter !== "All") {
      result = result.filter(
        (product) =>
          String(product.category || "").toLowerCase() ===
          selectedFilter.toLowerCase(),
      );
    }

    if (selectedBrand !== "All") {
      result = result.filter(
        (product) =>
          String(product.brand || "").toLowerCase() ===
          selectedBrand.toLowerCase(),
      );
    }

    if (selectedPrice === "Under ₹3000") {
      result = result.filter((product) => Number(product.price || 0) < 3000);
    }

    if (selectedPrice === "₹3000 - ₹6000") {
      result = result.filter((product) => {
        const price = Number(product.price || 0);

        return price >= 3000 && price <= 6000;
      });
    }

    if (selectedPrice === "₹6000 - ₹9000") {
      result = result.filter((product) => {
        const price = Number(product.price || 0);

        return price >= 6000 && price <= 9000;
      });
    }

    if (selectedPrice === "Above ₹9000") {
      result = result.filter((product) => Number(product.price || 0) > 9000);
    }

    if (sortOption === "Price: Low to High") {
      return result.sort(
        (firstProduct, secondProduct) =>
          Number(firstProduct.price || 0) - Number(secondProduct.price || 0),
      );
    }

    if (sortOption === "Price: High to Low") {
      return result.sort(
        (firstProduct, secondProduct) =>
          Number(secondProduct.price || 0) - Number(firstProduct.price || 0),
      );
    }

    if (sortOption === "Top Rated") {
      return result.sort(
        (firstProduct, secondProduct) =>
          Number(secondProduct.rating || 0) -
          Number(firstProduct.rating || 0),
      );
    }

    return result;
  }, [
    products,
    selectedBrand,
    selectedFilter,
    selectedPrice,
    sortOption,
  ]);

  if (!isValidRoute) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50 px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700">
            Roto
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950">
            Collection not found.
          </h1>

          <p className="mt-4 text-zinc-600">
            The collection you are looking for does not exist or has moved.
          </p>

          <Link
            href="/category/all"
            className="mt-6 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
          >
            Explore all products
          </Link>
        </div>
      </main>
    );
  }

  const heroPrimaryHref = subcategory
    ? "#products"
    : `/category/${department.slug}`;

  const heroPrimaryLabel = subcategory
    ? `Shop ${subcategory.title}`
    : department.slug === "all"
      ? "Explore products"
      : department.slug === "new"
        ? "Explore New Drops"
        : `Shop ${department.title}`;

  const heroSecondaryHref =
    department.slug === "new" ? "/category/all" : "/category/new";

  const heroSecondaryLabel =
    department.slug === "new" ? "Explore all products" : "Explore New Drops";

  const shouldShowCollectionCards =
    isDepartmentLanding &&
    department.subcategories &&
    department.subcategories.length > 0;

  const shouldShowNewProducts =
    !isLoading &&
    !isNewDropsPage &&
    !subcategory &&
    newProducts.length > 0;

  const shouldShowFeaturedProducts =
    !isLoading &&
    !isNewDropsPage &&
    !subcategory &&
    featuredProducts.length > 0;

  const shouldShowBrands =
    !isLoading &&
    !subcategory &&
    brands.length > 0;

  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="relative isolate min-h-[590px] overflow-hidden sm:min-h-[450px] lg:min-h-[560px]">
        <img
          src={department.banner}
          alt={pageTitle}
          className="absolute inset-0 size-full object-cover "
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[590px] max-w-7xl items-end px-6 py-14 sm:min-h-[450px] sm:py-16 lg:min-h-[560px] lg:px-8 lg:py-20">
          <div className="max-w-3xl text-white">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/70">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>

              <span>/</span>

              {subcategory && (
                <>
                  <Link
                    href={`/category/${department.slug}`}
                    className="transition hover:text-white"
                  >
                    {department.title}
                  </Link>

                  <span>/</span>
                </>
              )}

              <span className="text-white">{pageTitle}</span>
            </nav>

            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">
              {subcategory
                ? department.title
                : department.slug === "new"
                  ? "Fresh arrivals"
                  : "Roto collection"}
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl lg:text-8xl">
              {pageTitle}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
              {pageSubtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-zinc-950 transition hover:bg-zinc-200"
              >
                {heroPrimaryLabel}
                <FiArrowRight size={17} />
              </a>

              <Link
                href={heroSecondaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-black/15 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white hover:text-zinc-950"
              >
                {heroSecondaryLabel}
                <FiArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      {shouldShowCollectionCards && (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Shop by collection"
            title={`Shop ${department.title}`}
            description={`Explore curated ${department.title.toLowerCase()} collections designed for daily life, movement, and everything ahead.`}
          />

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {department.subcategories.map((item) => (
              <CollectionCard
                key={item.slug}
                department={department}
                subcategory={item}
              />
            ))}
          </div>
        </section>
      )}

{shouldShowNewProducts && (
  <section className="border-y border-zinc-200 bg-white py-16 lg:py-20">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <SectionHeading
        eyebrow="Fresh arrivals"
        title={`New in ${department.title}`}
        description={`Recently added products selected for the ${department.title.toLowerCase()} collection.`}
        href="/category/new"
        linkText="View all new drops"
      />
    </div>

    <div className="mt-9">
      <ProductMarquee products={newProducts} />
    </div>
  </section>
)}
      {shouldShowFeaturedProducts && (
        <section className="bg-zinc-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading
              eyebrow="Customer favourites"
              title={`Featured in ${department.title}`}
              description="Popular picks and highlighted products from this collection."
              href="#products"
              linkText={`Shop ${department.title}`}
            />

            <div className="mt-9">
              <ProductRow products={featuredProducts} />
            </div>
          </div>
        </section>
      )}

      {shouldShowBrands && (
        <section className="border-y border-zinc-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading
              eyebrow="Discover brands"
              title={`Shop ${department.title} by brand`}
              description="Choose a brand to refine the products shown below."
            />

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand("All");
                  document
                    .getElementById("products")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
                className={`rounded-full border px-5 py-3 text-sm font-extrabold transition ${
                  selectedBrand === "All"
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950"
                }`}
              >
                All brands
              </button>

              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    setSelectedBrand(brand);
                    document
                      .getElementById("products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                  className={`rounded-full border px-5 py-3 text-sm font-extrabold transition ${
                    selectedBrand === brand
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="products"
        className="scroll-mt-20 border-t border-zinc-200 bg-zinc-50"
      >
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

        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-black/45"
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl">
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
                filters={productTypeFilters}
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
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-[1600px]">
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
                filters={productTypeFilters}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />
            </div>
          </aside>

          <section className="min-w-0 flex-1 px-6 py-12 lg:px-10">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">
                  {subcategory
                    ? department.title
                    : department.slug === "new"
                      ? "Fresh arrivals"
                      : department.title}
                </p>

                <h2 className="mt-2 flex items-center gap-3 text-4xl font-black tracking-tight text-zinc-950">
                  {subcategory && <FiLayers size={28} />}

                  {subcategory
                    ? subcategory.title
                    : department.slug === "new"
                      ? "All New Drops"
                      : department.slug === "all"
                        ? "All Products"
                        : `All ${department.title} Products`}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {isLoading
                    ? "Loading products..."
                    : `Showing ${finalProducts.length} product${
                        finalProducts.length === 1 ? "" : "s"
                      }`}
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <button
                  type="button"
                  onClick={() => setIsSortOpen((current) => !current)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-left text-sm font-bold text-zinc-900 transition hover:border-zinc-500"
                >
                  <span>{sortOption}</span>

                  <FiChevronDown
                    size={17}
                    className={`transition ${
                      isSortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
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
                  </div>
                )}
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
                    Try another product type, price range, brand, or filter
                    selection.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilter("All");
                      setSelectedPrice("All");
                      setSelectedBrand("All");
                      setSortOption("Newest");
                    }}
                    className="mt-5 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <ProductRow products={finalProducts} />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}