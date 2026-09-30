"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import { fetchProductById } from "../../../services/productService";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import DeliveryCheck from "../../../components/products/DeliveryCheck";
import ProductGallery from "../../../components/products/ProductGallery";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function ProductDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="grid animate-pulse lg:grid-cols-2">
          <div className="min-h-[580px] bg-zinc-200" />

          <div className="space-y-6 p-8 lg:p-12">
            <div className="h-4 w-28 rounded bg-zinc-200" />
            <div className="h-16 w-4/5 rounded bg-zinc-200" />
            <div className="h-6 w-1/4 rounded bg-zinc-200" />
            <div className="h-24 rounded bg-zinc-100" />
            <div className="h-14 rounded-full bg-zinc-200" />
          </div>
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

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        setError("");

        const data = await fetchProductById(id);
        const productData = data?.product || data;

        setProduct(productData);
      } catch (requestError) {
        console.error("Error fetching product:", requestError);
        setError("Unable to load this product right now.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    if (!wishlistMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setWishlistMessage("");
    }, 2200);

    return () => clearTimeout(timeout);
  }, [wishlistMessage]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50 px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700">
            Roto
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950">
            Product not found.
          </h1>

          <p className="mt-4 text-zinc-600">
            {error ||
              "This product may no longer be available or may have been moved."}
          </p>

          <Link
            href="/category/all"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white"
          >
            <FiArrowLeft size={16} />
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  const cartItem = cartItems.find((item) => item._id === product._id);

  const rating = Math.max(
    0,
    Math.min(5, Math.floor(Number(product.rating) || 0)),
  );

  const isProductInWishlist = isInWishlist(product._id);

  const isExternalProduct =
    product.purchaseMode === "EXTERNAL_LINK" || product.source === "AMAZON";

  const isAmazonProduct = product.source === "AMAZON";

  const isInStock = isExternalProduct ? true : Number(product.stock) > 0;

  const externalButtonText =
    product.externalButtonText ||
    (isAmazonProduct ? "Explore on Amazon" : "Explore Product");

  const handleToggleWishlist = () => {
    toggleWishlist(product);

    setWishlistMessage(
      isProductInWishlist
        ? "Product removed from your wishlist."
        : "Product added to your wishlist.",
    );
  };

  const handleAddToCart = () => {
    if (!isInStock) {
      return;
    }

    addToCart(product);
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {/* Product-page navigation */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
          >
            <FiArrowLeft size={17} />
            Back
          </button>

          <Link
            href={`/category/${product.newCategory || "all"}`}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-zinc-800 sm:px-5 sm:text-sm"
          >
            Explore collection
            <FiChevronRight size={16} />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2">
          {/* Product gallery */}
          <ProductGallery
            product={product}
            isInWishlist={isProductInWishlist}
            onToggleWishlist={handleToggleWishlist}
          />

          {/* Product information */}
          <section className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="flex items-center justify-between gap-4">
              <Link
                href={`/category/${product.newCategory || "all"}`}
                className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-950"
              >
                Home / {product.category || "Collection"}
              </Link>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`inline-flex items-center gap-2 text-xs font-bold transition ${
                  isProductInWishlist
                    ? "text-red-500"
                    : "text-zinc-500 hover:text-red-500"
                }`}
              >
                <FiHeart
                  size={17}
                  fill={isProductInWishlist ? "currentColor" : "none"}
                />
                <span className="hidden sm:inline">
                  {isProductInWishlist ? "Saved" : "Save"}
                </span>
              </button>
            </div>

            {/* Rating */}
            <div className="mt-8 flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FiStar
                    key={index}
                    size={17}
                    className={
                      index < rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-300"
                    }
                  />
                ))}
              </div>

              <span className="text-sm font-medium text-zinc-500">
                {Number(product.rating || 0).toFixed(1)} rating
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-[-0.045em] text-zinc-950 sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
                {product.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
              {isExternalProduct ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                      Availability
                    </p>

                    <p className="mt-1 text-xl font-black tracking-tight text-zinc-950">
                      Available through partner
                    </p>
                  </div>

                  <div className="rounded-full bg-orange-50 px-4 py-2 text-xs font-extrabold text-orange-700">
                    {isAmazonProduct
                      ? "Amazon affiliate product"
                      : "External partner product"}
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                    {isExternalProduct ? (
                      <>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                            Availability
                          </p>

                          <p className="mt-1 text-xl font-black tracking-tight text-zinc-950">
                            Available through partner
                          </p>
                        </div>

                        <div className="rounded-full bg-orange-50 px-4 py-2 text-xs font-extrabold text-orange-700">
                          {isAmazonProduct
                            ? "Amazon affiliate product"
                            : "External partner product"}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                            Price
                          </p>

                          <p className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        <div
                          className={`rounded-full px-4 py-2 text-xs font-extrabold ${
                            isInStock
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {isInStock
                            ? `In stock${product.stock ? ` · ${product.stock} left` : ""}`
                            : "Out of stock"}
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-xs font-extrabold ${
                      isInStock
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {isInStock
                      ? `In stock${product.stock ? ` · ${product.stock} left` : ""}`
                      : "Out of stock"}
                  </div>
                </>
              )}
            </div>
            {!isExternalProduct && <DeliveryCheck product={product} />}

            {/* Add to cart / quantity */}
            {/* Purchase action */}
            <div className="mt-8">
              {isExternalProduct ? (
                <a
                  href={product.externalUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-orange-500 px-6 text-sm font-extrabold text-white transition hover:bg-orange-600"
                >
                  <FiShoppingBag size={19} />
                  {externalButtonText}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : cartItem ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="inline-grid w-full grid-cols-[1fr_80px_1fr] items-center overflow-hidden rounded-full border border-zinc-300 sm:w-52">
                    <button
                      type="button"
                      onClick={() => decreaseQty(product._id)}
                      aria-label={`Decrease quantity of ${product.name}`}
                      className="flex h-14 items-center justify-center text-zinc-950 transition hover:bg-zinc-100"
                    >
                      <FiMinus size={18} />
                    </button>

                    <span className="text-center text-base font-black text-zinc-950">
                      {cartItem.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => increaseQty(product._id)}
                      aria-label={`Increase quantity of ${product.name}`}
                      className="flex h-14 items-center justify-center text-zinc-950 transition hover:bg-zinc-100"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/checkout")}
                    className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-extrabold text-white transition hover:bg-zinc-800"
                  >
                    <FiShoppingBag size={18} />
                    Go to checkout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!isInStock}
                  onClick={handleAddToCart}
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-zinc-950 px-6 text-sm font-extrabold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  <FiShoppingBag size={19} />
                  {isInStock ? "Add to bag" : "Currently unavailable"}
                </button>
              )}
            </div>

            {/* Trust items */}
            <div className="mt-8 grid gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <FiTruck size={18} className="text-zinc-950" />
                Delivery availability by pincode
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <FiShield size={18} className="text-zinc-950" />
                Secure checkout experience
              </div>
            </div>

            {/* Wishlist feedback */}
            {wishlistMessage && (
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700">
                <FiCheck size={17} />
                {wishlistMessage}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
