"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowUpRight,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/products/ProductCard";

export default function WishlistPage() {
  const router = useRouter();

  const { user, isAuthLoaded } = useAuth();
  const { wishlist, isWishlistLoaded } = useWishlist();

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!user) {
      router.replace("/login?next=/wishlist");
    }
  }, [isAuthLoaded, user, router]);

  if (!isAuthLoaded || !isWishlistLoaded) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50">
        <p className="text-sm font-semibold text-zinc-500">
          Loading your wishlist...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50">
        <p className="text-sm font-semibold text-zinc-500">
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full bg-red-50 text-red-500">
                <FiHeart size={20} fill="currentColor" />
              </div>

              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
                Saved for later
              </p>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              My wishlist.
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {wishlist.length === 0
                ? "Save products you love and come back to them anytime."
                : `${wishlist.length} saved product${
                    wishlist.length === 1 ? "" : "s"
                  } in your wishlist.`}
            </p>
          </div>

          <Link
            href="/category/all"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-extrabold text-zinc-950 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
          >
            Continue shopping
            <FiArrowUpRight size={16} />
          </Link>
        </div>

        {/* Empty wishlist */}
        {wishlist.length === 0 ? (
          <section className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-500">
              <FiHeart size={28} />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight text-zinc-950">
              Your wishlist is empty.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Explore the Roto collection and tap the heart icon on any product
              you want to save for later.
            </p>

            <Link
              href="/category/all"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
            >
              <FiShoppingBag size={16} />
              Explore products
            </Link>
          </section>
        ) : (
          <>
            {/* Product grid */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {wishlist.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </section>

            {/* Bottom message */}
            <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 text-center">
              <p className="text-sm text-zinc-600">
                To remove an item, click its{" "}
                <span className="font-bold text-red-500">heart icon</span>.
                You can also add any saved product directly to your cart.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}