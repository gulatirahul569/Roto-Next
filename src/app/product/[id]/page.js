"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ProductReviews from "../../../components/products/ProductReviews";
import ProductDetailsSection from "../../../components/products/ProductDetailsSection";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiCreditCard,
  FiHeart,
  FiLock,
  FiMinus,
  FiPercent,
  FiPlus,
  FiRotateCcw,
  FiShield,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import { fetchProductById } from "../../../services/productService";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import DeliveryCheck from "../../../components/products/DeliveryCheck";
import ProductGallery from "../../../components/products/ProductGallery";
import SimilarProducts from "../../../components/products/SimilarProducts";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

// Turns the description into "About this item" bullets.
function getHighlights(description) {
  if (!description) return [];
  return String(description)
    .split(/\n+|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 3)
    .slice(0, 6);
}

function Stars({ value, size = 15 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          size={size}
          className={
            i < value ? "fill-amber-400 text-amber-400" : "text-zinc-200"
          }
        />
      ))}
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-7xl animate-pulse gap-10 lg:grid-cols-12">
        <div className="h-80 rounded-3xl bg-zinc-200 sm:h-[420px] lg:col-span-6 lg:h-[540px]" />
        <div className="space-y-6 lg:col-span-6">
          <div className="h-10 w-3/4 rounded-xl bg-zinc-200" />
          <div className="h-6 w-1/4 rounded-lg bg-zinc-200" />
          <div className="h-28 rounded-2xl bg-zinc-200" />
          <div className="h-14 rounded-full bg-zinc-200" />
          <div className="h-44 rounded-2xl bg-zinc-200" />
        </div>
      </div>
    </main>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const { cartItems, addToCart, increaseQty, decreaseQty } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchProductById(id);
        setProduct(data?.product || data);
      } catch (requestError) {
        console.error("Error fetching product:", requestError);
        setError("Unable to load this product right now.");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  useEffect(() => {
    setSelectedSize("");
    setSizeError("");
  }, [id]);

  useEffect(() => {
    if (!wishlistMessage) return;
    const timeout = setTimeout(() => setWishlistMessage(""), 2200);
    return () => clearTimeout(timeout);
  }, [wishlistMessage]);

  if (isLoading) return <ProductDetailsSkeleton />;

  if (error || !product) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#FAFAFA] px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Product not found
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {error ||
              "This product may no longer be available or may have been moved."}
          </p>
          <Link
            href="/category/all"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            <FiArrowLeft size={16} />
            Browse collection
          </Link>
        </div>
      </main>
    );
  }

  const productSizes = Array.isArray(product.sizes)
    ? product.sizes.filter((size) => size?.label)
    : [];

  const hasSizes = productSizes.length > 0;

  const selectedSizeItem = productSizes.find(
    (size) => size.label === selectedSize,
  );

  const selectedSizeInStock =
    !hasSizes || Number(selectedSizeItem?.stock || 0) > 0;

  const totalStock = hasSizes
    ? productSizes.reduce((total, size) => total + Number(size.stock || 0), 0)
    : Number(product.stock || 0);

  const cartItem = cartItems.find(
    (item) =>
      item._id === product._id && (item.selectedSize || "") === selectedSize,
  );

  const sizeStockLimit = hasSizes ? Number(selectedSizeItem?.stock || 0) : null;

  const isAtSizeLimit =
    hasSizes && cartItem && Number(cartItem.quantity) >= sizeStockLimit;

  const rating = Math.max(
    0,
    Math.min(5, Math.round(Number(product.rating) || 0)),
  );
  const isProductInWishlist = isInWishlist(product._id);
  const isAmazonProduct = product.source === "AMAZON";
  const isExternalProduct =
    product.purchaseMode === "EXTERNAL_LINK" || isAmazonProduct;
  const isInStock = isExternalProduct ? true : totalStock > 0;
  const isLowStock = !isExternalProduct && isInStock && totalStock <= 5;
  const externalButtonText =
    product.externalButtonText ||
    (isAmazonProduct ? "Explore on Amazon" : "Explore Product");
  const departmentSlug = String(product.department || "")
    .trim()
    .toLowerCase();

  const subcategorySlug = String(product.subcategory || "")
    .trim()
    .toLowerCase();

  const categoryHref =
    departmentSlug && departmentSlug !== "all"
      ? subcategorySlug
        ? `/category/${departmentSlug}/${subcategorySlug}`
        : `/category/${departmentSlug}`
      : "/category/all";

  const highlights = getHighlights(product.description);
  const productPrice = Number(product.price || 0);
  const compareAtPrice = Number(product.compareAtPrice || 0);

  const hasDiscount =
    !isExternalProduct && compareAtPrice > productPrice && productPrice > 0;

  const discountPercentage = hasDiscount
    ? Math.round(((compareAtPrice - productPrice) / compareAtPrice) * 100)
    : 0;

  const savingsAmount = hasDiscount ? compareAtPrice - productPrice : 0;

  // Fragrance notes or tags fallback
  const productNotes =
    Array.isArray(product.notes) && product.notes.length > 0
      ? product.notes
      : Array.isArray(product.tags) && product.tags.length > 0
        ? product.tags
        : ["Fresh Spicy", "Amber", "Citrus", "Aromatic", "Musky", "Woody", "Lavender", "Warm Spicy"];

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    setWishlistMessage(
      isProductInWishlist
        ? "Product removed from your wishlist."
        : "Product added to your wishlist.",
    );
  };

  const requireSize = (message) => {
    setSizeError(message);
    document
      .getElementById("size-selector")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleAddToCart = () => {
    if (!isInStock) return;

    if (hasSizes && !selectedSize) {
      requireSize("Please select a size before adding this product.");
      return;
    }

    if (hasSizes && !selectedSizeInStock) {
      requireSize("This size is currently out of stock.");
      return;
    }

    addToCart({
      ...product,
      selectedSize,
    });
  };

  const handleBuyNow = () => {
    if (!isInStock) return;

    if (hasSizes && !selectedSize) {
      requireSize("Please select a size before buying this product.");
      return;
    }

    if (hasSizes && !selectedSizeInStock) {
      requireSize("This size is currently out of stock.");
      return;
    }

    if (!cartItem) {
      addToCart({
        ...product,
        selectedSize,
      });
    }

    router.push("/checkout");
  };

  // Extract any raw specifications if stored as an object or key-value array on product
  const rawSpecifications = product.specifications || product.specs || product.details;
  const specificationsList = Array.isArray(rawSpecifications)
    ? rawSpecifications
    : typeof rawSpecifications === "object" && rawSpecifications !== null
      ? Object.entries(rawSpecifications).map(([key, value]) => ({
          label: key,
          value: String(value),
        }))
      : [];

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFDFD] text-zinc-900 pb-24 lg:pb-16 antialiased">
  <div className="mx-auto w-full max-w-full min-w-0 px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation: < Home / Products */}
        <nav className="flex min-w-0 items-center gap-2 py-4 text-xs text-zinc-500 sm:py-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex shrink-0 items-center gap-1.5 font-medium text-zinc-700 transition hover:text-black"
          >
            <FiArrowLeft size={13} />
            <span>Home</span>
          </button>
          <span className="text-zinc-300">/</span>
          <Link
            href={categoryHref}
            className="truncate text-zinc-600 transition hover:text-black"
          >
            {product.category || product.subcategory || "Products"}
          </Link>
        </nav>

        {/* Top Product Showcase */}
        <div className="grid w-full min-w-0 gap-6 sm:gap-10 lg:grid-cols-12 lg:gap-14">

          {/* Column 1: Gallery with rounded aesthetic */}
          <div className="min-w-0 w-full lg:col-span-6">
            <div className="lg:sticky lg:top-22">
              <div className="overflow-hidden rounded-3xl ">
                <ProductGallery
                  product={product}
                  isInWishlist={isProductInWishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Product information & purchase section */}
          <div className="min-w-0 w-full lg:col-span-6">
            {/* Title & Brand */}
            <div className="flex w-full min-w-0 items-start justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="break-words text-2xl font-light tracking-tight text-zinc-900 sm:text-4xl">
                  {product.name}
                </h1>
                {product.subcategory && (
                  <p className="mt-1 text-xs tracking-wider uppercase text-amber-700 font-semibold">
                    {product.subcategory}
                  </p>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label="Wishlist"
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${
                  isProductInWishlist
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-black"
                }`}
              >
                <FiHeart
                  size={18}
                  fill={isProductInWishlist ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Price block */}
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                {isExternalProduct
                  ? "Available through partner"
                  : formatPrice(productPrice)}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-base text-zinc-400 line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {hasDiscount && (
              <p className="mt-1 text-xs font-medium text-emerald-700">
                You save {formatPrice(savingsAmount)}
              </p>
            )}

            {/* Stock indicator */}
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isInStock
                    ? isLowStock
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isInStock
                    ? isLowStock
                      ? "text-amber-700"
                      : "text-emerald-700"
                    : "text-rose-600"
                }`}
              >
                {!isInStock
                  ? "Currently unavailable"
                  : isLowStock
                    ? `Only ${totalStock} left in stock`
                    : "In stock"}
              </span>
            </div>

            {/* Description Accordion */}
            <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-[#F9F9F9] p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setIsDescOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-zinc-900"
              >
                <span className="text-amber-700" >Description</span>
                {isDescOpen ? (
                  <FiChevronUp size={18} className="text-zinc-500" />
                ) : (
                  <FiChevronDown size={18} className="text-zinc-500" />
                )}
              </button>

              {isDescOpen && (
                <div className="mt-3 text-xs leading-relaxed text-zinc-600 sm:text-sm">
                  <p>
                    {product.description ||
                      "Crafted with the finest ingredients for an enduring, timeless impression."}
                  </p>
                </div>
              )}
            </div>

            {/* Size Selector */}
            {!isExternalProduct && hasSizes && (
              <div id="size-selector" className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs text-amber-700 font-semibold uppercase tracking-wider ">
                    Select Size
                  </h3>
                  <Link
                    href="/size-guide"
                    className="text-xs font-medium text-amber-700 hover:text-amber-900 hover:underline"
                  >
                    Size Guide
                  </Link>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {productSizes.map((size) => {
                    const isSelected = selectedSize === size.label;
                    const isOutOfStock = Number(size.stock || 0) <= 0;

                    return (
                      <button
                        key={size.label}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedSize(size.label);
                          setSizeError("");
                        }}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-black text-white shadow-sm"
                            : isOutOfStock
                              ? "cursor-not-allowed border border-dashed border-zinc-200 bg-zinc-50 text-zinc-300 line-through"
                              : "border border-zinc-200 bg-white text-zinc-800 hover:border-black"
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>

                {selectedSizeItem && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      selectedSizeInStock ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {selectedSizeInStock
                      ? `${selectedSizeItem.stock} available in size ${selectedSizeItem.label}`
                      : `Size ${selectedSizeItem.label} is currently out of stock`}
                  </p>
                )}

                {sizeError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">
                    {sizeError}
                  </p>
                )}
              </div>
            )}

            {/* Quantity Stepper & Action Buttons */}
            <div className="mt-8">
              {isExternalProduct ? (
                <a
                  href={product.externalUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 text-sm font-medium text-white transition hover:bg-black"
                >
                  {externalButtonText}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <div className="grid w-full min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3">

                  {/* Quantity Stepper */}
                  {isInStock && (
                    <div className="flex h-12 w-28 items-center justify-between rounded-xl bg-zinc-900 px-2.5 text-white sm:w-32 sm:px-3">
                      <button
                        type="button"
                        onClick={() => decreaseQty(product._id, selectedSize)}
                        disabled={!cartItem || Number(cartItem?.quantity) <= 0}
                        aria-label="Decrease quantity"
                        className="grid h-8 w-8 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="text-sm font-semibold">
                        {cartItem ? cartItem.quantity : 0}
                      </span>
                      <button
                        type="button"
                        disabled={isAtSizeLimit}
                        onClick={() => {
                          if (cartItem) {
                            increaseQty(product._id, selectedSize);
                          } else {
                            handleAddToCart();
                          }
                        }}
                        aria-label="Increase quantity"
                        className="grid h-8 w-8 place-items-center rounded-lg text-zinc-300 hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  )}

                  {/* Add to Cart */}
                  <button
                    type="button"
                    disabled={!isInStock}
                    onClick={
                      cartItem ? () => router.push("/checkout") : handleAddToCart
                    }
                    className={`h-12 whitespace-nowrap rounded-full border border-zinc-200 bg-[#F2F2F2] px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 sm:flex-1 sm:px-0 ${
                      isInStock ? "" : "col-span-2 sm:col-span-1"
                    }`}
                  >
                    {!isInStock
                      ? "Currently Unavailable"
                      : cartItem
                        ? "Go to Checkout"
                        : "Add to Cart"}
                  </button>

                  {/* Buy Now */}
                  <button
                    type="button"
                    disabled={!isInStock}
                    onClick={handleBuyNow}
                    className="col-span-2 h-12 min-w-0 rounded-full bg-zinc-900 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 sm:col-span-1 sm:flex-1"
                  >
                    Buy Now
                  </button>
                </div>
              )}

              {wishlistMessage && (
                <div
                  role="status"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-700"
                >
                  <FiCheck size={14} className="text-emerald-600" />
                  {wishlistMessage}
                </div>
              )}
            </div>

            {/* Delivery Options Accordion & Badges */}
            <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-[#F9F9F9] p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setIsDeliveryOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-zinc-900"
              >
                <span className="text-amber-700">Delivery Options</span>
                {isDeliveryOpen ? (
                  <FiChevronUp size={18} className="text-zinc-500" />
                ) : (
                  <FiChevronDown size={18} className="text-zinc-500" />
                )}
              </button>

              {isDeliveryOpen && (
                <div className="mt-4 space-y-4">
                  <DeliveryCheck product={product} />

                  <div className="grid grid-cols-1 gap-3 pt-2 min-[380px]:grid-cols-2">
                    {/* Discount */}
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-zinc-100">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                        <FiPercent size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600/80">Discount</p>
                        <p className="text-xs font-semibold text-emerald-700">
                          {hasDiscount ? `Disc ${discountPercentage}%` : "Seasonal Offers"}
                        </p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-zinc-100">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-50 text-sky-600">
                        <FiCreditCard size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-sky-600/80">Payment</p>
                        <p className="text-xs font-semibold text-sky-700">Cash on Delivery/Online Payment</p>
                      </div>
                    </div>

                    {/* Delivery Time */}
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-zinc-100">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-50 text-amber-600">
                        <FiTruck size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-amber-600/80">Delivery Time</p>
                        <p className="text-xs font-semibold text-amber-700">5-7 Working Days</p>
                      </div>
                    </div>

                    {/* Return */}
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-zinc-100">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-50 text-violet-600">
                        <FiRotateCcw size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-violet-600/80">Return & Warranty</p>
                        <p className="text-xs font-semibold text-violet-700">7 Days Easy Return</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* About this item (Highlights) */}
            {highlights.length > 0 && (
              <div className="mt-8 border-t border-zinc-200/80 pt-6">
                <h2 className="text-base font-semibold text-zinc-950">
                  About this item
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-amber-500 text-xs leading-relaxed text-zinc-700 sm:text-sm">
                  {highlights.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Specifications & Details (Always Rendered & Visible) */}
            <div className="prose prose-sm max-w-none text-zinc-700">
              <ProductDetailsSection product={product} />
            </div>

            {/* Trust row */}
            <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-zinc-700 border-t border-zinc-100 pt-5">
              <div className="flex flex-col items-center gap-1.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <FiTruck size={16} />
                </span>
                <span>Delivery by pincode</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <FiShield size={16} />
                </span>
                <span>Secure checkout</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <FiRotateCcw size={16} />
                </span>
                <span>Easy returns</span>
              </div>
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600">
              <FiLock size={12} />
              Encrypted 256-bit secure transaction
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-10 border-zinc-200 sm:my-16" />

        {/* Rating & Reviews Section */}
        <section id="reviews" className="w-full min-w-0 space-y-8">
          <div className="grid w-full min-w-0 gap-8 md:grid-cols-12 md:items-center">

            {/* Rating breakdown */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 md:col-span-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-light tracking-tighter  sm:text-7xl">
                  {Number(product.rating || 4.5).toFixed(1)}
                </span>
                <span className="text-xl font-medium text-zinc-400">/5</span>
              </div>

              <div className="w-full min-w-0 max-w-xs flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((starNum) => (
                  <div key={starNum} className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-0.5 w-6">
                      <FiStar size={11} className="fill-amber-500 text-amber-400" />
                      <span>{starNum}</span>
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full bg-amber-400 ${
                          starNum === 5 ? "w-4/5" : starNum === 4 ? "w-2/5" : "w-1/12"
                        }`}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-zinc-400 pt-1">
                  ({Number(product.reviewCount || 50)} Customer Reviews)
                </p>
              </div>
            </div>

            {/* Review This Product Box */}
            <div className="flex flex-col items-start rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 sm:p-6 md:col-span-6 md:items-end md:text-right">
              <h3 className="text-base font-semibold text-zinc-900">
                Review this product
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Share your thoughts and impressions with other fragrance lovers.
              </p>
              <a
                href="#reviews"
                className="mt-4 inline-flex items-center rounded-full border border-zinc-900 px-5 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
              >
                Write a customer review
              </a>
            </div>
          </div>

          <ProductReviews
            productId={product._id}
            onSummaryChange={(summary) =>
              setProduct((current) =>
                current
                  ? {
                      ...current,
                      rating: summary.average,
                      reviewCount: summary.count,
                    }
                  : current,
              )
            }
          />
        </section>


        {/* Similar Products */}
        <section className="space-y-6">
          <SimilarProducts product={product} />
        </section>

      </div>

      {/* Mobile Sticky Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 w-full max-w-[100vw] overflow-hidden border-t border-zinc-200 bg-white/95 p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        {isExternalProduct ? (
          <a
            href={product.externalUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 text-sm font-medium text-white shadow-sm"
          >
            {externalButtonText}
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <div className="flex w-full min-w-0 items-center gap-2.5">
            <div className="min-w-0 shrink-0">
              <p className="text-lg font-bold text-zinc-950">
                {formatPrice(productPrice)}
              </p>
              {hasDiscount && (
                <p className="text-[11px] font-semibold text-emerald-700">
                  {discountPercentage}% off
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={!isInStock}
              onClick={
                cartItem ? () => router.push("/checkout") : handleAddToCart
              }
              className="h-12 flex-1 rounded-full bg-zinc-900 text-sm font-semibold text-white shadow-sm disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              {!isInStock
                ? "Unavailable"
                : cartItem
                  ? "Checkout"
                  : hasSizes && !selectedSize
                    ? "Select Size"
                    : "Add to Cart"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}