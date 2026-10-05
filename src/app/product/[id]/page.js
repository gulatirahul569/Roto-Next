"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheck,
  FiHeart,
  FiLock,
  FiMinus,
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

function Stars({ value, size = 16 }) {
  return (
    <div className="flex items-center" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          size={size}
          className={
            i < value ? "fill-[#FFA41C] text-[#FFA41C]" : "text-zinc-300"
          }
        />
      ))}
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto grid max-w-[1500px] animate-pulse gap-8 lg:grid-cols-12">
        <div className="h-[520px] rounded bg-zinc-200 lg:col-span-5" />
        <div className="space-y-4 lg:col-span-4">
          <div className="h-8 w-4/5 rounded bg-zinc-200" />
          <div className="h-4 w-1/3 rounded bg-zinc-200" />
          <div className="h-10 w-1/4 rounded bg-zinc-200" />
          <div className="h-32 rounded bg-zinc-100" />
        </div>
        <div className="h-80 rounded-lg bg-zinc-100 lg:col-span-3" />
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
      <main className="grid min-h-[70vh] place-items-center bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-zinc-950">
            Product not found
          </h1>
          <p className="mt-3 text-zinc-600">
            {error ||
              "This product may no longer be available or may have been moved."}
          </p>
          <Link
            href="/category/all"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FFD814] px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-[#F7CA00]"
          >
            <FiArrowLeft size={16} />
            Browse products
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
    Math.min(5, Math.floor(Number(product.rating) || 0)),
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
    if (!isInStock) {
      return;
    }

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
    if (!isInStock) {
      return;
    }

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

  const stockLabel = isInStock ? (
    <p
      className={`text-lg font-medium ${isLowStock ? "text-[#B12704]" : "text-[#007600]"}`}
    >
      {isLowStock ? `Only ${totalStock} left in stock` : "In stock"}
    </p>
  ) : (
    <p className="text-lg font-medium text-[#B12704]">Currently unavailable</p>
  );

  return (
    <main className="min-h-screen bg-white pb-28 lg:pb-10">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-3 text-xs text-zinc-600">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 font-medium text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            <FiArrowLeft size={14} />
            Back to results
          </button>
          <span className="text-zinc-300">|</span>
          <Link
            href={categoryHref}
            className="text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            {product.category || "Collection"}
          </Link>
        </nav>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: gallery */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-4">
              <ProductGallery
                product={product}
                isInWishlist={isProductInWishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            </div>
          </div>

          {/* Column 2: product information */}
          <section className="lg:col-span-4">
            <h1 className="text-2xl font-medium leading-snug text-zinc-950 sm:text-[26px]">
              {product.name}
            </h1>

            <Link
              href={categoryHref}
              className="mt-1 inline-block text-sm text-[#007185] hover:text-[#C7511F] hover:underline"
            >
              Visit the {product.subcategory || "Roto"} store
            </Link>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-medium text-zinc-900">
                {Number(product.rating || 0).toFixed(1)}
              </span>
              <Stars value={rating} />
              {isAmazonProduct && (
                <span className="text-[#007185]">Amazon partner product</span>
              )}
            </div>

            <hr className="my-4 border-zinc-200" />

            {/* Price block */}
            {isExternalProduct ? (
              <div>
                <p className="text-2xl font-medium text-zinc-950">
                  Available through partner
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {isAmazonProduct
                    ? "Price and delivery are shown on Amazon."
                    : "Price and delivery are shown on the partner site."}
                </p>
              </div>
            ) : (
              <div>
                {hasDiscount && (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-extrabold text-rose-700">
                      {discountPercentage}% OFF
                    </span>

                    <span className="text-sm font-medium text-zinc-500">
                      Save {formatPrice(savingsAmount)}
                    </span>
                  </div>
                )}

                <p className="flex items-baseline gap-1 text-zinc-950">
                  <span className="text-sm">₹</span>

                  <span className="text-3xl font-medium">
                    {formatPrice(productPrice).replace(/[^\d,]/g, "")}
                  </span>
                </p>

                {hasDiscount && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-zinc-500">M.R.P.:</span>

                    <span className="text-sm text-zinc-500 line-through">
                      {formatPrice(compareAtPrice)}
                    </span>

                    <span className="text-sm font-bold text-[#007600]">
                      ({discountPercentage}% off)
                    </span>
                  </div>
                )}

                <p className="mt-1 text-sm text-zinc-600">
                  Inclusive of all taxes
                </p>
              </div>
            )}

            {/* Size selector */}
            {!isExternalProduct && hasSizes && (
              <div
                id="size-selector"
                className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-zinc-950">
                    Select size
                  </h2>

                  <Link
                    href="/size-guide"
                    className="text-xs font-bold text-[#007185] hover:underline"
                  >
                    Size guide
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
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
                        className={`min-w-12 rounded-lg border px-4 py-2.5 text-sm font-extrabold transition ${
                          isSelected
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : isOutOfStock
                              ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 line-through"
                              : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-950"
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>

                {selectedSizeItem && (
                  <p
                    className={`mt-3 text-xs font-bold ${
                      selectedSizeInStock ? "text-[#007600]" : "text-[#B12704]"
                    }`}
                  >
                    {selectedSizeInStock
                      ? `${selectedSizeItem.stock} available in size ${selectedSizeItem.label}`
                      : `Size ${selectedSizeItem.label} is out of stock`}
                  </p>
                )}

                {sizeError && (
                  <p className="mt-3 text-xs font-bold text-[#B12704]">
                    {sizeError}
                  </p>
                )}
              </div>
            )}

            {/* Trust row */}
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-zinc-700">
              <div className="flex flex-col items-center gap-1.5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100">
                  <FiTruck size={18} />
                </span>
                Delivery by pincode
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100">
                  <FiShield size={18} />
                </span>
                Secure checkout
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100">
                  <FiRotateCcw size={18} />
                </span>
                Easy returns
              </div>
            </div>

            <hr className="my-5 border-zinc-200" />

            {/* About this item */}
            {highlights.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-zinc-950">
                  About this item
                </h2>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-zinc-800">
                  {highlights.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Column 3: buy box */}
          <aside className="lg:col-span-3">
            <div className="rounded-lg border border-zinc-300 p-5 lg:sticky lg:top-4">
              {isExternalProduct ? (
                <>
                  <p className="text-xl font-medium text-zinc-950">
                    Available through partner
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    You'll complete this purchase on the partner's website.
                  </p>

                  <a
                    href={product.externalUrl}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#FFA41C] px-4 text-sm font-medium text-zinc-950 transition hover:bg-[#FA8900]"
                  >
                    {externalButtonText}
                    <span aria-hidden="true">↗</span>
                  </a>
                </>
              ) : (
                <>
                  {!isExternalProduct && (
                    <div>
                      <p className="text-2xl font-medium text-zinc-950">
                        {formatPrice(productPrice)}
                      </p>

                      {hasDiscount && (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-zinc-500 line-through">
                            {formatPrice(compareAtPrice)}
                          </span>

                          <span className="text-sm font-bold text-[#007600]">
                            {discountPercentage}% off
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    <DeliveryCheck product={product} />
                  </div>

                  <div className="mt-3">{stockLabel}</div>

                  {hasSizes && (
                    <p className="mt-2 text-sm text-zinc-700">
                      {selectedSize
                        ? `Size: ${selectedSize}`
                        : "Select a size to continue"}
                    </p>
                  )}

                  {isInStock && (
                    <div className="mt-4">
                      {cartItem ? (
                        <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-300 bg-zinc-100">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQty(product._id, selectedSize)
                            }
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="grid h-9 w-10 place-items-center hover:bg-zinc-200"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="grid h-9 w-12 place-items-center bg-white text-sm font-medium">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isAtSizeLimit}
                            onClick={() =>
                              increaseQty(product._id, selectedSize)
                            }
                            aria-label={`Increase quantity of ${product.name}`}
                            className="grid h-9 w-10 place-items-center hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-700">Quantity: 1</p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 space-y-2.5">
                    {cartItem ? (
                      <button
                        type="button"
                        onClick={() => router.push("/checkout")}
                        className="h-10 w-full rounded-full bg-[#FFD814] text-sm font-medium text-zinc-950 transition hover:bg-[#F7CA00]"
                      >
                        Go to checkout
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!isInStock}
                        onClick={handleAddToCart}
                        className="h-10 w-full rounded-full bg-[#FFD814] text-sm font-medium text-zinc-950 transition hover:bg-[#F7CA00] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                      >
                        {isInStock ? "Add to bag" : "Currently unavailable"}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={!isInStock}
                      onClick={handleBuyNow}
                      className="h-10 w-full rounded-full bg-[#FFA41C] text-sm font-medium text-zinc-950 transition hover:bg-[#FA8900] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                    >
                      Buy now
                    </button>
                  </div>

                  <p className="mt-4 flex items-center gap-1.5 text-xs text-[#007185]">
                    <FiLock size={13} />
                    Secure transaction
                  </p>
                </>
              )}

              <hr className="my-4 border-zinc-200" />

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`flex h-9 w-full items-center justify-center gap-2 rounded-lg border text-sm transition ${
                  isProductInWishlist
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-zinc-300 text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                <FiHeart
                  size={16}
                  fill={isProductInWishlist ? "currentColor" : "none"}
                />
                {isProductInWishlist ? "Saved to wishlist" : "Add to wishlist"}
              </button>

              {wishlistMessage && (
                <div
                  role="status"
                  className="mt-3 flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700"
                >
                  <FiCheck size={14} />
                  {wishlistMessage}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Similar products from the same subcategory */}
        <SimilarProducts product={product} />
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white p-3 lg:hidden">
        {isExternalProduct ? (
          <a
            href={product.externalUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#FFA41C] text-sm font-medium text-zinc-950"
          >
            {externalButtonText}
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-medium text-zinc-950">
                {formatPrice(productPrice)}
              </p>

              {hasDiscount && (
                <p className="mt-0.5 text-xs font-bold text-[#007600]">
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
              className="h-11 flex-1 rounded-full bg-[#FFD814] text-sm font-medium text-zinc-950 disabled:bg-zinc-200 disabled:text-zinc-500"
            >
              {!isInStock
                ? "Currently unavailable"
                : cartItem
                  ? "Go to checkout"
                  : hasSizes && !selectedSize
                    ? "Select size"
                    : "Add to bag"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}