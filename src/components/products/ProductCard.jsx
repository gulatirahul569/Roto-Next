"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function formatCount(n) {
  const num = Number(n || 0);
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  return String(num);
}

export default function ProductCard({ product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [hovered, setHovered] = useState(false);

  const name = product.name || product.title || "Roto product";
  const brand = product.brand || product.category || "Roto";

  const isAmazon = product.source === "AMAZON";
  const isExternal = product.purchaseMode === "EXTERNAL_LINK" || isAmazon;
  const externalText =
    product.externalButtonText ||
    (isAmazon ? "Explore on Amazon" : "Explore Product");

  // Collect every possible image source into one clean, de-duplicated list
  const toUrl = (img) =>
    typeof img === "string" ? img : img?.url || img?.src || "";
  const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

  const images = [
    ...new Set(
      [
        product.image,
        ...asArray(product.images),
        ...asArray(product.gallery),
        ...asArray(product.additionalImages),
        ...asArray(product.imageUrls),
      ]
        .map(toUrl)
        .filter(Boolean)
    ),
  ];
  if (images.length === 0) images.push("/images/product-placeholder.png");

  // Pricing: compareAtPrice is the original (crossed-out) price
  const price = Number(product.price || 0);
  const mrp = Number(
    product.compareAtPrice || product.mrp || product.originalPrice || 0
  );
  const discount =
    product.discount ||
    (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

  // Rating
  const rating = Number(product.rating || 0);
  const ratingCount =
    product.reviewCount || product.ratingCount || product.reviewsCount || 0;

  // Sizes: show only sizes that are in stock
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
        .filter((size) => typeof size === "string" || Number(size?.stock) > 0)
        .map((size) => (typeof size === "string" ? size : size.label))
        .filter(Boolean)
        .join(", ")
    : product.sizes || "";

  const wished = isInWishlist(product._id);

  // Auto-slide through images while the card is hovered (desktop)
  useEffect(() => {
    if (!hovered || images.length < 2) return;
    const id = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 900);
    return () => clearInterval(id);
  }, [hovered, images.length]);

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) {
      window.alert("Please login to add products to your wishlist.");
      router.push("/login");
      return;
    }
    toggleWishlist(product);
  };

  const openDetails = () => router.push(`/product/${product._id}`);

  const priceRow = !isExternal ? (
    <p className="flex items-baseline gap-1.5 text-sm">
      <span className="font-bold text-zinc-900">{formatPrice(price)}</span>
      {mrp > price && (
        <span className="text-xs text-zinc-500 line-through">
          {formatPrice(mrp)}
        </span>
      )}
      {discount > 0 && (
        <span className="text-xs text-orange-400">({discount}% OFF)</span>
      )}
    </p>
  ) : (
    <p className="text-xs font-semibold text-zinc-500">
      Available through partner
    </p>
  );

  return (
    <article
      onClick={openDetails}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setActiveImage(0);
      }}
      className="group relative flex cursor-pointer flex-col bg-white transition-shadow duration-200 hover:shadow-[0_2px_16px_4px_rgba(40,44,63,0.07)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-100">
        <img
          src={images[activeImage]}
          alt={name}
          loading="lazy"
          className="size-full object-cover"
        />

        {/* Ad / Amazon tag */}
        {product.isAd && (
          <span className="absolute right-2 top-2 rounded-sm bg-black/40 px-1 text-[10px] font-semibold text-white">
            AD
          </span>
        )}
        {isAmazon && (
          <span className="absolute right-2 top-2 rounded-sm bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            Amazon
          </span>
        )}

        {/* Rating badge */}
        {!isExternal && rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-sm bg-white/90 px-1.5 py-0.5 text-xs font-bold text-zinc-900">
            <span>{rating.toFixed(1)}</span>
            <FiStar size={12} className="fill-teal-600 text-teal-600" />
            {ratingCount > 0 && (
              <>
                <span className="text-zinc-300">|</span>
                <span>{formatCount(ratingCount)}</span>
              </>
            )}
          </div>
        )}

        {/* Mobile wishlist (no hover on touch screens) */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 md:hidden"
        >
          <FiHeart
            size={16}
            className={wished ? "text-red-500" : "text-zinc-700"}
            fill={wished ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Info area: fixed height so hover swap doesn't shift the grid */}
      <div className="relative h-[92px] px-2.5 pt-2.5 md:h-[104px]">
        {/* Default info */}
        <div className="md:group-hover:invisible">
          <h3 className="truncate text-base font-bold text-zinc-900">
            {brand}
          </h3>
          <p className="mb-1 truncate text-sm text-zinc-500">{name}</p>
          {priceRow}
        </div>

        {/* Hover info (desktop only) */}
        <div className="absolute inset-0 hidden flex-col bg-white px-2.5 pb-2 pt-2 md:group-hover:flex">
          {/* Image dots */}
          {images.length > 1 && (
            <div className="mb-2 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(i);
                  }}
                  className={`size-1.5 rounded-full ${
                    i === activeImage ? "bg-pink-500" : "bg-zinc-300"
                  }`}
                />
              ))}
            </div>
          )}

          {isExternal ? (
            <a
              href={product.externalUrl}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-9 items-center justify-center gap-2 rounded-sm bg-orange-500 text-xs font-bold text-white hover:bg-orange-600"
            >
              <FiShoppingBag size={14} />
              {externalText} ↗
            </a>
          ) : (
            <button
              type="button"
              onClick={handleWishlist}
              className="flex h-9 items-center justify-center gap-2 rounded-sm border border-zinc-300 text-xs font-bold uppercase tracking-wide text-zinc-800 hover:border-zinc-800"
            >
              <FiHeart
                size={16}
                className={wished ? "text-red-500" : ""}
                fill={wished ? "currentColor" : "none"}
              />
              {wished ? "Wishlisted" : "Wishlist"}
            </button>
          )}

          {sizes && !isExternal ? (
            <p className="mt-2 truncate text-sm text-zinc-500">
              Sizes: {sizes}
            </p>
          ) : (
            <p className="mt-2 truncate text-sm text-zinc-500">{name}</p>
          )}
          <div className="mt-0.5">{priceRow}</div>
        </div>
      </div>
    </article>
  );
}