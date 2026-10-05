"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  applyMediaOverrides,
  getDepartmentBySlug,
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
  "Under ₹1000",
  "₹1000 - ₹3000",
  "₹3000 - ₹5000",
  "₹5000 - ₹10000",
  "Above ₹10000",
];

const priceQueryMap = {
  "under-1000": "Under ₹1000",
  "1000-3000": "₹1000 - ₹3000",
  "3000-5000": "₹3000 - ₹5000",
  "5000-10000": "₹5000 - ₹10000",
  "above-10000": "Above ₹10000",
};

const priceOptionToQueryMap = {
  "Under ₹1000": "under-1000",
  "₹1000 - ₹3000": "1000-3000",
  "₹3000 - ₹5000": "3000-5000",
  "₹5000 - ₹10000": "5000-10000",
  "Above ₹10000": "above-10000",
};

/* Shared page gutter: 16px on phones, 24px tablet, 32px desktop */
const GUTTER = "px-4 sm:px-6 lg:px-8";

function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
        >
          <div className="aspect-[4/4.7] animate-pulse bg-zinc-200" />

          <div className="space-y-3 p-3 sm:p-4">
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

function TrustStrip() {
  const trustItems = [
    { icon: FiShield, title: "Secure payments", text: "Safe and protected checkout" },
    { icon: FiRefreshCw, title: "Easy returns", text: "Simple return support" },
    { icon: FiTruck, title: "Fast delivery", text: "Products delivered with care" },
    { icon: FiCheckCircle, title: "Curated products", text: "Selected for everyday life" },
  ];

  return (
    <section className="border-y border-zinc-200 bg-white">
      {/* 2x2 on mobile, 4 across on desktop; gap-px over a grey bg draws the dividers */}
      <div className={`mx-auto max-w-full ${GUTTER}`}>
        <div className="grid grid-cols-2 gap-px bg-zinc-200 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex flex-col items-start gap-2 bg-white px-3 py-4 sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-5 lg:px-6"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700 sm:size-10">
                  <Icon size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-black text-zinc-950 sm:text-sm">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-zinc-500 sm:text-xs">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, description, href, linkText }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-700 sm:text-xs">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-4xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-zinc-600 sm:mt-3 sm:text-base">
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
      className="group relative min-h-[240px] overflow-hidden rounded-2xl bg-zinc-900 sm:min-h-[340px] lg:min-h-[416px]"
    >
      <img
        src={image}
        alt={subcategory.title}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

      <div className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full border border-white/30 bg-black/15 text-white backdrop-blur-sm transition group-hover:bg-white group-hover:text-zinc-950 sm:right-4 sm:top-4 sm:size-10">
        <FiArrowRight size={15} />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-5">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/70 sm:text-[10px] sm:tracking-[0.16em]">
          Explore collection
        </p>

        <h3 className="mt-1 text-lg font-black leading-tight tracking-tight sm:mt-2 sm:text-2xl">
          {subcategory.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/80 sm:mt-2 sm:text-sm sm:leading-6">
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
  onPriceChange,
  filterTitle = "Subcategory",
}) {
  const chip = (active) =>
    `rounded-full border px-3.5 py-2 text-xs font-bold transition sm:px-4 sm:py-2.5 lg:w-full lg:rounded-xl lg:text-left ${
      active
        ? "border-zinc-950 bg-zinc-950 text-white"
        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
    }`;

  return (
    <div className="space-y-6 lg:space-y-7">
      <div>
        <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
          {filterTitle}
        </h3>

        <div className="flex flex-wrap gap-2 lg:flex-col">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={chip(selectedFilter === filter)}
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
              onClick={() => onPriceChange(price)}
              className={chip(selectedPrice === price)}
            >
              {price}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryMediaSkeleton() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="relative min-h-[480px] animate-pulse overflow-hidden bg-zinc-900 sm:min-h-[450px] lg:min-h-[560px]">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-700" />

        <div className={`relative mx-auto flex min-h-[480px] max-w-full items-end py-10 sm:min-h-[450px] sm:py-14 lg:min-h-[560px] ${GUTTER}`}>
          <div className="w-full max-w-2xl">
            <div className="h-3 w-28 rounded bg-white/20" />
            <div className="mt-6 h-14 max-w-md rounded bg-white/20 sm:h-20" />
            <div className="mt-5 h-5 max-w-xl rounded bg-white/15" />
            <div className="mt-3 h-5 max-w-lg rounded bg-white/15" />
            <div className="mt-8 h-12 w-44 rounded-full bg-white/20" />
          </div>
        </div>
      </section>

      <section className={`mx-auto max-w-full py-10 sm:py-16 ${GUTTER}`}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl bg-zinc-200 sm:h-72"
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function CategoryPageClient({ initialMediaOverrides }) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const priceQuery = String(searchParams.get("price") || "").toLowerCase();

  const selectedPriceFromUrl = priceQueryMap[priceQuery] || "All";
  const handlePriceChange = (nextPrice) => {
    setSelectedPrice(nextPrice);

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    const priceQueryValue = priceOptionToQueryMap[nextPrice];

    if (nextPrice === "All" || !priceQueryValue) {
      nextSearchParams.delete("price");
    } else {
      nextSearchParams.set("price", priceQueryValue);
    }

    const categoryPath = `/category/${segments
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`;

    const queryString = nextSearchParams.toString();

    router.push(queryString ? `${categoryPath}?${queryString}` : categoryPath, {
      scroll: false,
    });
  };

  const segments = Array.isArray(params?.segments)
    ? params.segments
    : params?.segments
      ? [params.segments]
      : ["all"];

  const departmentSlug = String(segments[0] || "all").toLowerCase();

  const subcategorySlug = segments[1] ? String(segments[1]).toLowerCase() : "";

  const [mediaOverrides] = useState(initialMediaOverrides || {});

  const baseDepartment = getDepartmentBySlug(departmentSlug);

  const department = useMemo(() => {
    return applyMediaOverrides(baseDepartment, mediaOverrides);
  }, [baseDepartment, mediaOverrides]);

  const subcategory = subcategorySlug
    ? department?.subcategories?.find(
        (item) => item.slug === subcategorySlug,
      ) || null
    : null;

  const isValidRoute =
    Boolean(department) && (!subcategorySlug || Boolean(subcategory));

  const isDepartmentLanding = department?.key !== "ALL" && !subcategory;

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
    setSelectedPrice(selectedPriceFromUrl);
    setSelectedBrand("All");
    setSortOption("Newest");
    setIsMobileFiltersOpen(false);
    setIsSortOpen(false);
  }, [departmentSlug, subcategorySlug, selectedPriceFromUrl]);

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
    // /category/all → show main store departments
    if (department?.slug === "all") {
      return ["All", "Men", "Women", "Kids", "Home", "Accessories"];
    }

    // /category/new → already loads category=new, no extra filter needed
    if (department?.slug === "new") {
      return ["All"];
    }

    // /category/men/t-shirts → URL already loads only that subcategory
    if (subcategory) {
      return ["All", subcategory.title];
    }

    // /category/men, /women, /kids, /home, /accessories
    return [
      "All",
      ...(department?.subcategories || []).map((item) => item.title),
    ];
  }, [department, subcategory]);

  const filterTitle = department?.slug === "all" ? "Department" : "Subcategory";

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
        (product) => String(product.newCategory || "").toLowerCase() === "new",
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
      if (department?.slug === "all") {
        result = result.filter(
          (product) =>
            String(product.department || "").toUpperCase() ===
            selectedFilter.toUpperCase(),
        );
      } else {
        const selectedSubcategory = department?.subcategories?.find(
          (item) => item.title === selectedFilter,
        );

        if (selectedSubcategory) {
          result = result.filter(
            (product) =>
              String(product.subcategory || "").toLowerCase() ===
              selectedSubcategory.slug,
          );
        }
      }
    }

    if (selectedBrand !== "All") {
      result = result.filter(
        (product) =>
          String(product.brand || "").toLowerCase() ===
          selectedBrand.toLowerCase(),
      );
    }

    if (selectedPrice === "Under ₹1000") {
      result = result.filter((product) => Number(product.price || 0) < 1000);
    }

    if (selectedPrice === "₹1000 - ₹3000") {
      result = result.filter((product) => {
        const price = Number(product.price || 0);

        return price >= 1000 && price <= 3000;
      });
    }

    if (selectedPrice === "₹3000 - ₹5000") {
      result = result.filter((product) => {
        const price = Number(product.price || 0);

        return price > 3000 && price <= 5000;
      });
    }

    if (selectedPrice === "₹5000 - ₹10000") {
      result = result.filter((product) => {
        const price = Number(product.price || 0);

        return price > 5000 && price <= 10000;
      });
    }

    if (selectedPrice === "Above ₹10000") {
      result = result.filter((product) => Number(product.price || 0) > 10000);
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
          Number(secondProduct.rating || 0) - Number(firstProduct.rating || 0),
      );
    }

    return result;
  }, [
    products,
    department,
    selectedBrand,
    selectedFilter,
    selectedPrice,
    sortOption,
  ]);

  if (!isValidRoute) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50 px-4 sm:px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700">
            Roto
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Collection not found.
          </h1>

          <p className="mt-4 text-sm text-zinc-600 sm:text-base">
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
    !isLoading && !isNewDropsPage && !subcategory && newProducts.length > 0;

  const shouldShowFeaturedProducts =
    !isLoading &&
    !isNewDropsPage &&
    !subcategory &&
    featuredProducts.length > 0;

  const shouldShowBrands = !isLoading && !subcategory && brands.length > 0;

  const scrollToProducts = () =>
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  const brandChip = (active) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-[13px] font-extrabold transition sm:px-5 sm:py-3 sm:text-sm ${
      active
        ? "border-zinc-950 bg-zinc-950 text-white"
        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950"
    }`;

  return (
    <main className="min-h-screen overflow-x-clip bg-zinc-50">
      {/* ---------- HERO ---------- */}
      <section className="relative isolate min-h-[480px] overflow-hidden sm:min-h-[450px] lg:min-h-[560px]">
        <img
          src={department.banner}
          alt={pageTitle}
          className="absolute inset-0 size-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20 sm:bg-gradient-to-r sm:from-black/85 sm:via-black/55 sm:to-black/20" />

        <div className={`relative z-10 mx-auto flex min-h-[480px] max-w-full items-end py-10 sm:min-h-[450px] sm:py-16 lg:min-h-[560px] lg:py-20 ${GUTTER}`}>
          <div className="w-full max-w-3xl text-white">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold text-white/70 sm:text-xs">
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

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-300 sm:mt-8 sm:text-xs sm:tracking-[0.22em]">
              {subcategory
                ? department.title
                : department.slug === "new"
                  ? "Fresh arrivals"
                  : "Roto collection"}
            </p>

            <h1 className="mt-3 break-words text-[clamp(2.25rem,12vw,3rem)] font-black uppercase leading-[0.95] tracking-[-0.05em] sm:mt-4 sm:text-6xl lg:text-8xl">
              {pageTitle}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:mt-5 sm:text-base sm:leading-7">
              {pageSubtitle}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <a
                href="#products"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-zinc-950 transition hover:bg-zinc-200"
              >
                {heroPrimaryLabel}
                <FiArrowRight size={17} />
              </a>

              <Link
                href={heroSecondaryHref}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/40 bg-black/15 px-6 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white hover:text-zinc-950"
              >
                {heroSecondaryLabel}
                <FiArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* ---------- COLLECTION CARDS (2 columns on mobile) ---------- */}
      {shouldShowCollectionCards && (
        <section className={`mx-auto max-w-full py-10 sm:py-16 lg:py-20 ${GUTTER}`}>
          <SectionHeading
            eyebrow="Shop by collection"
            title={`Shop ${department.title}`}
            description={`Explore curated ${department.title.toLowerCase()} collections designed for daily life, movement, and everything ahead.`}
          />

          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-9 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
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
        <section className="border-y border-zinc-200 bg-white py-8 sm:py-10">
          <div className={`mx-auto max-w-full ${GUTTER}`}>
            <SectionHeading
              eyebrow="Fresh arrivals"
              title={`New in ${department.title}`}
              description={`Recently added products selected for the ${department.title.toLowerCase()} collection.`}
              href="/category/new"
              linkText="View all new drops"
            />
          </div>

          <div className="mt-6 sm:mt-9">
            <ProductMarquee products={newProducts} />
          </div>
        </section>
      )}

      {shouldShowFeaturedProducts && (
        <section className="bg-zinc-50 py-8 sm:py-10">
          <div className={`mx-auto max-w-full ${GUTTER}`}>
            <SectionHeading
              eyebrow="Customer favourites"
              title={`Featured in ${department.title}`}
              description="Popular picks and highlighted products from this collection."
              href="#products"
              linkText={`Shop ${department.title}`}
            />

            <div className="mt-6 sm:mt-9">
              <ProductRow products={featuredProducts} />
            </div>
          </div>
        </section>
      )}

      {/* ---------- BRANDS (swipeable row on mobile) ---------- */}
      {shouldShowBrands && (
        <section className="border-y border-zinc-200 bg-white py-8 sm:py-14">
          <div className={`mx-auto max-w-full ${GUTTER}`}>
            <SectionHeading
              eyebrow="Discover brands"
              title={`Shop ${department.title} by brand`}
              description="Choose a brand to refine the products shown below."
            />

            <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mt-7 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand("All");
                  scrollToProducts();
                }}
                className={brandChip(selectedBrand === "All")}
              >
                All brands
              </button>

              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    setSelectedBrand(brand);
                    scrollToProducts();
                  }}
                  className={brandChip(selectedBrand === brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- PRODUCTS ---------- */}
      <section
        id="products"
        className="scroll-mt-20 border-t border-zinc-200 bg-zinc-50"
      >
        <div className="border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 sm:py-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
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

            <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white shadow-2xl">
              <div className="shrink-0 px-5 pt-3 sm:px-6">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-200" />

                <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
                      Refine results
                    </p>

                    <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
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
              </div>

              {/* Only the filter list scrolls; the button below stays visible */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                <FilterContent
                  filters={productTypeFilters}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                  selectedPrice={selectedPrice}
                  onPriceChange={handlePriceChange}
                  filterTitle={filterTitle}
                />
              </div>

              <div className="shrink-0 border-t border-zinc-200 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full rounded-full bg-zinc-950 py-3.5 text-sm font-extrabold text-white"
                >
                  Show {finalProducts.length} products
                </button>
              </div>
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
                onPriceChange={handlePriceChange}
                filterTitle={filterTitle}
              />
            </div>
          </aside>

          <section className="min-w-0 flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-700 sm:text-xs">
                  {subcategory
                    ? department.title
                    : department.slug === "new"
                      ? "Fresh arrivals"
                      : department.title}
                </p>

                <h2 className="mt-2 flex items-center gap-2 text-2xl font-black tracking-tight text-zinc-950 sm:gap-3 sm:text-4xl">
                  {subcategory && <FiLayers className="size-6 shrink-0 sm:size-7" />}

                  <span className="min-w-0 break-words">
                    {subcategory
                      ? subcategory.title
                      : department.slug === "new"
                        ? "All New Drops"
                        : department.slug === "all"
                          ? "All Products"
                          : `All ${department.title} Products`}
                  </span>
                </h2>

                <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
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
                  className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-left text-sm font-bold text-zinc-900 transition hover:border-zinc-500"
                >
                  <span className="truncate">Sort: {sortOption}</span>

                  <FiChevronDown
                    size={17}
                    className={`shrink-0 transition ${isSortOpen ? "rotate-180" : ""}`}
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
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 sm:p-6">
                <p className="font-bold">Unable to load products.</p>

                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : isLoading ? (
              <ProductGridSkeleton />
            ) : finalProducts.length === 0 ? (
              <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center sm:min-h-80 sm:p-8">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-zinc-950 sm:text-xl">
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