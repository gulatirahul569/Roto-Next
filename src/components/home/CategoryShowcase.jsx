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

export default function CategoryShowcase({ media = {} }) {
  return (
    <section className="bg-gray-50 py-8">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
        <div className="mx-auto max-w-full">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Shop by department
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Find your next essential.
          </h2>

          <p className="mt-4 text-base leading-7 text-zinc-600">
            Explore products for men, women, kids, home, and everyday
            accessories—all in one place.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const imageUrl =
              media[category.imageKey] || category.fallbackImage;

            return (
              <Link
                key={category.title}
                href={category.route}
                className="group relative min-h-[420px] overflow-hidden bg-zinc-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={imageUrl}
                  alt={`${category.title} collection`}
                  className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                <div className="absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-white/30 bg-black/15 text-white backdrop-blur-sm transition duration-300 group-hover:bg-white group-hover:text-zinc-950">
                  <FiArrowUpRight size={20} />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                    {category.collection}
                  </p>

                  <h3 className="mt-2 text-3xl font-black uppercase tracking-tight">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/80">
                    {category.subtitle}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-bold">
                    Explore collection

                    <FiArrowUpRight
                      size={17}
                      className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/category/all"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-zinc-800"
          >
            Explore all products
            <FiArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}