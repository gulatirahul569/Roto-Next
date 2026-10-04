import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const budgetCards = [
  {
    title: "Under ₹1,000",
    subtitle: "Everyday essentials at easy prices",
    href: "/category/all?price=under-1000",
    imageKey: "promos/home/under-1000",
    gradient:
      "from-amber-500 via-orange-500 to-rose-500",
    accent: "text-amber-200",
  },
  {
    title: "₹1,000 – ₹3,000",
    subtitle: "Fashion, accessories, and everyday finds",
    href: "/category/all?price=1000-3000",
    imageKey: "promos/home/1000-3000",
    gradient:
      "from-emerald-600 via-teal-600 to-cyan-700",
    accent: "text-emerald-200",
  },
  {
    title: "₹3,000 – ₹5,000",
    subtitle: "Popular picks selected for every day",
    href: "/category/all?price=3000-5000",
    imageKey: "promos/home/3000-5000",
    gradient:
      "from-sky-600 via-blue-700 to-indigo-800",
    accent: "text-sky-200",
  },
  {
    title: "₹5,000 – ₹10,000",
    subtitle: "Premium quality with exceptional value",
    href: "/category/all?price=5000-10000",
    imageKey: "promos/home/5000-10000",
    gradient:
      "from-violet-600 via-purple-700 to-fuchsia-800",
    accent: "text-violet-200",
  },
  {
    title: "Above ₹10,000",
    subtitle: "Elevated collections and premium products",
    href: "/category/all?price=above-10000",
    imageKey: "promos/home/above-10000",
    gradient:
      "from-zinc-700 via-zinc-900 to-black",
    accent: "text-zinc-300",
  },
];

export default function ShopByBudget({ media = {} }) {
  return (
    <section className=" bg-gray-50 py-10">
      <div className="mx-auto max-w-full px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">
              Shop your way
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              Shop by budget
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
              Find fashion, accessories, home essentials, and more at a price
              that works for you.
            </p>
          </div>

          <Link
            href="/category/all"
            className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-zinc-950 transition hover:text-zinc-600"
          >
            Explore all products
            <FiArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {budgetCards.map((card) => {
            const imageUrl = media[card.imageKey];

            return (
              <Link
                key={card.imageKey}
                href={card.href}
                className={`group relative min-h-85 overflow-hidden bg-gradient-to-br ${card.gradient} p-5 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt=""
                    className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110"
                  />
                )}

                <div
                  className={`absolute inset-0 ${
                    imageUrl
                      ? "bg-gradient-to-t from-black/90 via-black/45 to-black/10"
                      : "bg-black/10"
                  }`}
                />

                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <p
                      className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${
                        imageUrl ? "text-white/75" : card.accent
                      }`}
                    >
                      Roto picks
                    </p>

                    <h3 className="mt-3 text-2xl font-black tracking-tight">
                      {card.title}
                    </h3>

                    <p className="mt-2  text-sm leading-5 text-white/85">
                      {card.subtitle}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 text-sm font-extrabold">
                    Shop now
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