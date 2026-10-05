"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

const budgetCards = [
  {
    title: "Under ₹1,000",
    subtitle: "Everyday essentials at easy prices.",
    href: "/category/all?price=under-1000",
    imageKey: "promos/home/under-1000",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    accent: "text-amber-200",
  },
  {
    title: "₹1,000 – ₹3,000",
    subtitle: "Fashion, accessories, and everyday finds.",
    href: "/category/all?price=1000-3000",
    imageKey: "promos/home/1000-3000",
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    accent: "text-emerald-200",
  },
  {
    title: "₹3,000 – ₹5,000",
    subtitle: "Popular picks selected for every day.",
    href: "/category/all?price=3000-5000",
    imageKey: "promos/home/3000-5000",
    gradient: "from-sky-600 via-blue-700 to-indigo-800",
    accent: "text-sky-200",
  },
  {
    title: "₹5,000 – ₹10,000",
    subtitle: "Premium quality with exceptional value.",
    href: "/category/all?price=5000-10000",
    imageKey: "promos/home/5000-10000",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    accent: "text-violet-200",
  },
  {
    title: "Above ₹10,000",
    subtitle: "Elevated collections and premium products.",
    href: "/category/all?price=above-10000",
    imageKey: "promos/home/above-10000",
    gradient: "from-zinc-700 via-zinc-900 to-black",
    accent: "text-zinc-300",
  },
];

export default function ShopByBudget() {
  const [media, setMedia] = useState({});

  useEffect(() => {
    let isActive = true;

    async function loadBudgetMedia() {
      try {
        const response = await fetch("/api/media", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load budget card images.");
        }

        const data = await response.json();

        if (isActive) {
          setMedia(data.media || {});
        }
      } catch (error) {
        console.error("Budget card media error:", error);

        if (isActive) {
          setMedia({});
        }
      }
    }

    loadBudgetMedia();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="bg-gray-50 py-8 sm:py-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-full">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-700 sm:text-xs sm:tracking-[0.22em]">
            Shop your way
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:mt-4 sm:text-5xl">
            Find your perfect price.
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-600 sm:mt-4 sm:text-base sm:leading-7">
            Explore fashion, accessories, home essentials, and more at a price
            that works for you.
          </p>
        </div>

        {/* 2 columns on mobile; the 5th card spans full width so there's no empty gap */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-5">
          {budgetCards.map((card, index) => {
            const imageUrl = media[card.imageKey];
            const isLast = index === budgetCards.length - 1;

            return (
              <Link
                key={card.imageKey}
                href={card.href}
                className={`group relative overflow-hidden bg-gradient-to-br ${card.gradient} shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 ${
                  isLast
                    ? "col-span-2 min-h-[200px] lg:col-span-1 lg:min-h-[420px]"
                    : "min-h-[250px]"
                } sm:min-h-[360px] lg:min-h-[420px]`}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={`${card.title} budget collection`}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-110"
                  />
                )}

                <div
                  className={`absolute inset-0 ${
                    imageUrl
                      ? "bg-gradient-to-t from-black/90 via-black/25 to-transparent"
                      : "bg-black/10"
                  }`}
                />

                <div className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-white/30 bg-black/15 text-white backdrop-blur-sm transition duration-300 group-hover:bg-white group-hover:text-zinc-950 sm:right-5 sm:top-5 sm:size-11">
                  <FiArrowUpRight className="size-4 sm:size-5" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-6">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.16em] ${
                      imageUrl ? "text-white/75" : card.accent
                    }`}
                  >
                    Roto picks
                  </p>

                  <h3 className="mt-1 text-lg font-black tracking-tight sm:mt-2 sm:text-2xl">
                    {card.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/80 sm:mt-2 sm:text-sm sm:leading-6">
                    {card.subtitle}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold sm:mt-5 sm:gap-2 sm:text-sm">
                    Shop collection
                    <FiArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:size-[17px]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/category/all"
            className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800 sm:py-3.5"
          >
            Explore all products
            <FiArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}