"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

const categories = [
  {
    title: "Men",
    subtitle: "Everyday clothing, shoes, bags, watches, and essentials.",
    route: "/category/men",
    imageKey: "home/categories/men",
    fallbackImage: "/images/Bagcover.jpg",
    collection: "Shop Men",
  },
  {
    title: "Women",
    subtitle: "Fashion, handbags, footwear, jewellery, and more.",
    route: "/category/women",
    imageKey: "home/categories/women",
    fallbackImage: "/images/Accessorycover.jpg",
    collection: "Shop Women",
  },
  {
    title: "Kids",
    subtitle: "Clothing, school essentials, toys, footwear, and fun.",
    route: "/category/kids",
    imageKey: "home/categories/kids",
    fallbackImage: "/images/newcover.jpg",
    collection: "Shop Kids",
  },
  {
    title: "Home",
    subtitle: "Decor, kitchen essentials, lighting, storage, and living.",
    route: "/category/home",
    imageKey: "home/categories/home",
    fallbackImage: "/images/Electronics.jpg",
    collection: "Shop Home",
  },
  {
    title: "Accessories",
    subtitle: "Watches, wallets, sunglasses, travel gear, and more.",
    route: "/category/accessories",
    imageKey: "home/categories/accessories",
    fallbackImage: "/images/Accessorycover.jpg",
    collection: "Shop Accessories",
  },
];

export default function CategoryShowcase() {
  const [media, setMedia] = useState({});

  useEffect(() => {
    let isActive = true;

    async function loadCategoryShowcaseMedia() {
      try {
        const response = await fetch("/api/media?prefix=home/categories/", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load Category Showcase images.");
        }

        const data = await response.json();

        if (isActive) {
          setMedia(data.media || {});
        }
      } catch (error) {
        console.error("Category Showcase media loading error:", error);

        if (isActive) {
          setMedia({});
        }
      }
    }

    loadCategoryShowcaseMedia();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="bg-gray-50 py-8 sm:py-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-full">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-700 sm:text-xs sm:tracking-[0.22em]">
            Shop by department
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:mt-4 sm:text-5xl">
            Find your next essential.
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-600 sm:mt-4 sm:text-base sm:leading-7">
            Explore products for men, women, kids, home, and everyday
            accessories—all in one place.
          </p>
        </div>

        {/* 2 columns on mobile; the 5th card spans full width so there's no empty gap */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-5">
          {categories.map((category, index) => {
            const imageUrl = media[category.imageKey] || category.fallbackImage;
            const isLast = index === categories.length - 1;

            return (
              <Link
                key={category.title}
                href={category.route}
                className={`group relative overflow-hidden bg-zinc-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 ${
                  isLast
                    ? "col-span-2 min-h-[200px] lg:col-span-1 lg:min-h-[420px]"
                    : "min-h-[250px]"
                } sm:min-h-[360px] lg:min-h-[420px]`}
              >
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={`${category.title} collection`}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                <div className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-white/30 bg-black/15 text-white backdrop-blur-sm transition duration-300 group-hover:bg-white group-hover:text-zinc-950 sm:right-5 sm:top-5 sm:size-11">
                  <FiArrowUpRight className="size-4 sm:size-5" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/75 sm:text-xs sm:tracking-[0.16em]">
                    {category.collection}
                  </p>

                  <h3 className="mt-1 text-xl font-black uppercase tracking-tight sm:mt-2 sm:text-3xl">
                    {category.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/80 sm:mt-2 sm:text-sm sm:leading-6">
                    {category.subtitle}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold sm:mt-5 sm:gap-2 sm:text-sm">
                    Explore collection
                    <FiArrowUpRight
                      className="size-3.5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:size-[17px]"
                    />
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