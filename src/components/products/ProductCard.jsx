"use client";

import { useRouter } from "next/navigation";
import {
  FiEye,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function ProductCard({ product }) {
  const router = useRouter();

  const { user } = useAuth();
  const { cartItems, addToCart, increaseQty, decreaseQty } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productName = product.name || product.title || "Roto product";

  const isExternalProduct =
    product.purchaseMode === "EXTERNAL_LINK" ||
    product.source === "AMAZON";

  const isAmazonProduct = product.source === "AMAZON";

  const externalButtonText =
    product.externalButtonText ||
    (isAmazonProduct ? "Explore on Amazon" : "Explore Product");

  const cartItem = isExternalProduct
    ? null
    : cartItems.find((item) => item._id === product._id);

  const productIsInWishlist = isInWishlist(product._id);

  const rating = Math.max(
    0,
    Math.min(5, Math.floor(Number(product.rating) || 0))
  );

  const handleWishlist = () => {
    if (!user) {
      window.alert("Please login to add products to your wishlist.");
      router.push("/login");
      return;
    }

    toggleWishlist(product);
  };

  const openProductDetails = () => {
    router.push(`/product/${product._id}`);
  };

  const handleAddToCart = () => {
    if (isExternalProduct) {
      return;
    }

    addToCart(product);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Product image */}
      <div className="relative flex aspect-[4/4.7] items-center justify-center overflow-hidden bg-zinc-100">
        <img
          src={product.image || "/images/product-placeholder.png"}
          alt={productName}
          className="size-full object-contain transition duration-500 group-hover:scale-105"
        />

        {/* New badge */}
        {String(product.newCategory || "").toLowerCase() === "new" && (
          <span className="absolute left-3 top-3 rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
            New
          </span>
        )}

        {/* Amazon badge */}
        {isAmazonProduct && (
          <span className="absolute bottom-3 left-3 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
            Amazon
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            productIsInWishlist
              ? `Remove ${productName} from wishlist`
              : `Add ${productName} to wishlist`
          }
          className={`absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-white shadow-sm transition hover:scale-110 ${
            productIsInWishlist
              ? "text-red-500"
              : "text-zinc-700 hover:text-red-500"
          }`}
        >
          <FiHeart
            size={18}
            fill={productIsInWishlist ? "currentColor" : "none"}
          />
        </button>

        {/* View product: desktop */}
        <div className="absolute inset-0 hidden items-center justify-center bg-black/20 opacity-0 transition duration-300 group-hover:opacity-100 md:flex">
          <button
            type="button"
            onClick={openProductDetails}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-zinc-950 shadow-lg transition hover:bg-zinc-950 hover:text-white"
          >
            <FiEye size={16} />
            View product
          </button>
        </div>
      </div>

      {/* Product information */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={openProductDetails}
            className="min-w-0 text-left"
          >
            <h3 className="truncate text-sm font-bold text-zinc-950 transition hover:text-zinc-600">
              {productName}
            </h3>
          </button>

          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-500">
            {product.category || "Roto"}
          </span>
        </div>

        {/* Rating: shown only for normal Roto products */}
        {!isExternalProduct && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <FiStar
                  key={index}
                  size={13}
                  className={
                    index < rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-300"
                  }
                />
              ))}
            </div>

            <span className="text-xs font-medium text-zinc-500">
              ({Number(product.rating || 0).toFixed(1)})
            </span>
          </div>
        )}

        {/* Product action */}
        <div className="mt-5">
          {isExternalProduct ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-zinc-500">
                Available through partner
              </p>

              <a
                href={product.externalUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-orange-600"
              >
                <FiShoppingBag size={15} />
                {externalButtonText}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-black tracking-tight text-zinc-950">
                {formatPrice(product.price)}
              </p>

              {cartItem ? (
                <div className="inline-grid grid-cols-[30px_34px_30px] items-center overflow-hidden rounded-full border border-zinc-300">
                  <button
                    type="button"
                    onClick={() => decreaseQty(product._id)}
                    aria-label={`Decrease quantity of ${productName}`}
                    className="grid size-[30px] place-items-center text-zinc-900 transition hover:bg-zinc-100"
                  >
                    <FiMinus size={14} />
                  </button>

                  <span className="text-center text-xs font-extrabold text-zinc-950">
                    {cartItem.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => increaseQty(product._id)}
                    aria-label={`Increase quantity of ${productName}`}
                    className="grid size-[30px] place-items-center text-zinc-900 transition hover:bg-zinc-100"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-zinc-800"
                >
                  <FiShoppingBag size={15} />
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}