import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

const categories = [
  {
    title: "Bags",
    subtitle: "Built to carry what matters.",
    route: "/category/bags",
    image: "/images/Bagcover.jpg",
  },
  {
    title: "Accessories",
    subtitle: "Everyday accessories, selected better.",
    route: "/category/accessories",
    image: "/images/Accessorycover.jpg",
  },
  {
    title: "Sling",
    subtitle: "Small carry. Big utility.",
    route: "/category/sling",
    image: "/images/slingcover.jpg",
  },
  {
    title: "Shoes",
    subtitle: "Move comfortably, wherever you go.",
    route: "/category/shoes",
    image: "/images/Shoecover.jpg",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-full px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Built for movement
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Made for what&apos;s ahead.
          </h2>

          <p className="mt-4 text-base leading-7 text-zinc-600">
            Discover products designed for daily routines, busy commutes, and
            everything in between.
          </p>
        </div>

        {/* Category cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.route}
              className="group relative min-h-[500px] overflow-hidden rounded-2xl bg-zinc-900"
            >
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-white/30 bg-black/15 text-white backdrop-blur-sm transition duration-300 group-hover:bg-white group-hover:text-zinc-950">
                <FiArrowUpRight size={20} />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                  Shop collection
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
          ))}
        </div>
      </div>
    </section>
  );
}