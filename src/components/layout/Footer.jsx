import Link from "next/link";
import { CiFacebook } from "react-icons/ci";
import { TbBrandTwitter } from "react-icons/tb";
import { FaInstagram } from "react-icons/fa";
import { LuYoutube } from "react-icons/lu";

const shopLinks = [
  { label: "Bags", href: "/category/bags" },
  { label: "Shoes", href: "/category/shoes" },
  { label: "Slings", href: "/category/sling" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "Electronics", href: "/category/electronics" },
  { label: "New Arrivals", href: "/category/new" },
];

const helpLinks = [
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Order Tracking", href: "/track-order" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Contact Us", href: "/contact" },
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
            Built for movement. Durable bags, shoes, electronics, and everyday
            gear designed for city life and adventure.
          </p>
        </div>

        <div className="my-6 border-t border-zinc-800" />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase">Shop</h3>

            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link
                  href="/category/bags"
                  className="transition hover:text-white"
                >
                  Bags
                </Link>
              </li>

              <li>
                <Link
                  href="/category/shoes"
                  className="transition hover:text-white"
                >
                  Shoes
                </Link>
              </li>

              <li>
                <Link
                  href="/category/sling"
                  className="transition hover:text-white"
                >
                  Slings
                </Link>
              </li>

              <li>
                <Link
                  href="/category/accessories"
                  className="transition hover:text-white"
                >
                  Accessories
                </Link>
              </li>

              <li>
                <Link
                  href="/category/electronics"
                  className="transition hover:text-white"
                >
                  Electronics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase">Help</h3>

            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/shipping" className="transition hover:text-white">
                  Shipping
                </Link>
              </li>

              <li>
                <Link href="/returns" className="transition hover:text-white">
                  Returns
                </Link>
              </li>

              <li>
                <Link
                  href="/track-order"
                  className="transition hover:text-white"
                >
                  Tracking
                </Link>
              </li>

              <li>
                <Link href="/contact" className="transition hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase">Follow</h3>

            <ul className="space-y-2 text-xs text-gray-400">
              <li className="inline-flex items-center gap-1.5">
                <FaInstagram size={13} />
                Instagram
              </li>

              <li className="inline-flex items-center gap-1.5">
                <CiFacebook size={15} />
                Facebook
              </li>

              <li className="inline-flex items-center gap-1.5">
                <TbBrandTwitter size={14} />
                Twitter
              </li>

              <li className="inline-flex items-center gap-1.5">
                <LuYoutube size={14} />
                YouTube
              </li>
            </ul>
          </div>
        </div>

        <div className="my-6 border-t border-zinc-800" />

        <p className="text-center text-sm text-gray-500">
          © {year} Roto. All rights reserved.
        </p>
      </div>

      {/* Desktop footer */}
      <div className="hidden px-4 pb-6 pt-10 sm:px-8 md:px-16 lg:block lg:px-24">
        <div className="grid grid-cols-1 gap-10 border-b border-gray-700 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-2xl font-bold uppercase">Roto</h2>

            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Built for movement. Durable bags, shoes, electronics, and
              everyday gear designed for city life and adventure.
            </p>
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
              <li className="flex items-center gap-2">
                <FaInstagram />
                Instagram
              </li>

              <li className="flex items-center gap-2">
                <CiFacebook size={18} />
                Facebook
              </li>

              <li className="flex items-center gap-2">
                <TbBrandTwitter />
                Twitter
              </li>

              <li className="flex items-center gap-2">
                <LuYoutube />
                YouTube
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-sm text-gray-400 md:flex-row">
          <p className="text-center md:text-left">
            © {year} Roto. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/privacy-policy" className="transition hover:text-white">
              Privacy Policy
            </Link>

            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>

            <Link href="/cookies" className="transition hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}