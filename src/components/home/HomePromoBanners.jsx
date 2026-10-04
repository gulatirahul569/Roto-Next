"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const promotions = [
  {
    eyebrow: "Limited time",
    title: "Weekend Sale",
    description:
      "Fresh deals across fashion, accessories, home, and more.",
    href: "/category/all",
    imageKey: "promos/home/weekend-sale",
    gradient: "from-rose-700 via-red-600 to-orange-500",
  },
  {
    eyebrow: "Fresh picks",
    title: "New Season",
    description:
      "Discover recently added styles and everyday essentials.",
    href: "/category/new",
    imageKey: "promos/home/new-season",
    gradient: "from-emerald-700 via-teal-600 to-cyan-600",
  },
  {
    eyebrow: "Elevated essentials",
    title: "Premium Picks",
    description:
      "Explore quality products selected for every lifestyle.",
    href: "/category/all?price=above-10000",
    imageKey: "promos/home/premium-picks",
    gradient: "from-violet-800 via-purple-700 to-fuchsia-700",
  },
];

export default function HomePromoBanners() {
  const [media, setMedia] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadHomePromoMedia() {
      try {
        const response = await fetch("/api/media", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load homepage promotion media.");
        }

        const data = await response.json();

        if (isActive) {
          setMedia(data.media || {});
        }
      } catch (error) {
        console.error("Home promotion media error:", error);

        if (isActive) {
          setMedia({});
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadHomePromoMedia();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="bg-gray-50 py-8">
      <div className="mx-auto max-w-full px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">
            Discover more
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Featured offers
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
            Explore selected offers, fresh collections, and premium finds.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promotion) => {
            const imageUrl = media[promotion.imageKey];

            return (
              <Link
                key={promotion.imageKey}
                href={promotion.href}
                className={`group relative min-h-[440px] overflow-hidden bg-gradient-to-br ${promotion.gradient} p-7 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={promotion.title}
                    className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}

                <div
                  className={`absolute inset-0 ${
                    imageUrl
                      ? "bg-gradient-to-t from-black/90 via-black/40 to-black/10"
                      : "bg-black/10"
                  }`}
                />

                <div className="relative flex h-full flex-col justify-end">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/75">
                    {promotion.eyebrow}
                  </p>

                  <h3 className="mt-3 text-4xl font-black tracking-tight">
                    {promotion.title}
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">
                    {promotion.description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold">
                    {isLoading ? "Loading offer..." : "Explore now"}

                    <FiArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}