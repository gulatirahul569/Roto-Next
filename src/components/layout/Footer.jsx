import Link from "next/link";
import { CiFacebook } from "react-icons/ci";
import { FaInstagram } from "react-icons/fa";
import { LuYoutube } from "react-icons/lu";
import { TbBrandTwitter } from "react-icons/tb";

const shopLinks = [
  {
    label: "All Products",
    href: "/category/all",
  },
  {
    label: "Men",
    href: "/category/men",
  },
  {
    label: "Women",
    href: "/category/women",
  },
  {
    label: "Kids",
    href: "/category/kids",
  },
  {
    label: "Home",
    href: "/category/home",
  },
  {
    label: "Accessories",
    href: "/category/accessories",
  },
  {
    label: "New Drops",
    href: "/category/new",
  },
];

const helpLinks = [
  {
    label: "Shipping",
    href: "/shipping",
  },
  {
    label: "Returns",
    href: "/returns",
  },
  {
    label: "Order Tracking",
    href: "/track-order",
  },
  {
    label: "Size Guide",
    href: "/size-guide",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const socialLinks = [
  {
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    label: "Facebook",
    icon: CiFacebook,
  },
  {
    label: "Twitter",
    icon: TbBrandTwitter,
  },
  {
    label: "YouTube",
    icon: LuYoutube,
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      {/* Mobile footer */}
      <div className="px-5 py-8 lg:hidden">
        <div className="text-center">
          <h2 className="text-3xl font-bold uppercase tracking-widest">
            Roto
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Fashion, footwear, home essentials, accessories, and curated
            everyday products for every lifestyle.
          </p>
        </div>

        <div className="my-6 border-t border-zinc-800" />

        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Shop */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase">
              Shop
            </h3>

            <ul className="space-y-2 text-xs text-gray-400">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase">
              Help
            </h3>

            <ul className="space-y-2 text-xs text-gray-400">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label === "Order Tracking"
                      ? "Tracking"
                      : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase">
              Follow
            </h3>

            <ul className="space-y-2 text-left text-xs text-gray-400">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <li
                    key={social.label}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Icon size={14} />
                    {social.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="my-6 border-t border-zinc-800" />

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <Link
            href="/privacy-policy"
            className="transition hover:text-white"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="transition hover:text-white"
          >
            Terms
          </Link>

          <Link
            href="/cookies"
            className="transition hover:text-white"
          >
            Cookies
          </Link>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          © {year} Roto. All rights reserved.
        </p>
      </div>

      {/* Desktop footer */}
      <div className="hidden px-4 pb-6 pt-10 sm:px-8 md:px-16 lg:block lg:px-24">
        <div className="grid grid-cols-1 gap-10 border-b border-gray-700 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-2xl font-bold uppercase">
              Roto
            </h2>

            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Fashion, footwear, home essentials, accessories, and curated
              products selected for everyday life.
            </p>

            <Link
              href="/category/all"
              className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition hover:text-amber-400"
            >
              Explore all products
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Shop */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Shop
            </h2>

            <ul className="space-y-2 text-sm text-gray-400">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Help
            </h2>

            <ul className="space-y-2 text-sm text-gray-400">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Follow
            </h2>

            <ul className="space-y-3 text-sm text-gray-400">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <li
                    key={social.label}
                    className="flex items-center gap-2"
                  >
                    <Icon size={18} />
                    {social.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-sm text-gray-400 md:flex-row">
          <p className="text-center md:text-left">
            © {year} Roto. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link
              href="/privacy-policy"
              className="transition hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>

            <Link
              href="/cookies"
              className="transition hover:text-white"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}