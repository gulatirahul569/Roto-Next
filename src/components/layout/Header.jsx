"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiChevronDown,
  FiHeart,
  FiMapPin,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLocation } from "../../context/LocationContext";
import { useWishlist } from "../../context/WishlistContext";
import { departmentData } from "../../data/departmentData";
import { searchProducts } from "../../services/productService";
import CartDrawer from "../cart/CartDrawer";

const LOGO_DEFAULT = "/images/roto_logo_transparent.png";
const LOGO_WHITE = "/images/Roto-transparent-white-logo.png";

const navLinks = [
  {
    name: "Men",
    href: "/category/men",
    department: "men",
  },
  {
    name: "Women",
    href: "/category/women",
    department: "women",
  },
  {
    name: "Kids",
    href: "/category/kids",
    department: "kids",
  },
  {
    name: "Home",
    href: "/category/home",
    department: "home",
  },
  {
    name: "Accessories",
    href: "/category/accessories",
    department: "accessories",
  },
  {
    name: "All Products",
    href: "/category/all",
    department: "all",
  },
];

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function getSearchProductMeta(product) {
  const isExternalProduct =
    product.purchaseMode === "EXTERNAL_LINK" || product.source === "AMAZON";

  if (isExternalProduct) {
    return product.source === "AMAZON"
      ? "Explore on Amazon"
      : "External product";
  }

  return formatPrice(product.price);
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, logout, isAuthLoaded } = useAuth();
  const { totalQuantity } = useCart();
  const { wishlist } = useWishlist();
  const { location, loading, error, detectLocation } = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDesktopDepartment, setOpenDesktopDepartment] = useState("");
  const [openMobileDepartment, setOpenMobileDepartment] = useState("");
  const [logoMedia, setLogoMedia] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const accountMenuRef = useRef(null);
  const searchRef = useRef(null);

  const hasHero = pathname === "/" || pathname.startsWith("/category/");

  const isTransparent = hasHero && !isScrolled && !isMobileMenuOpen;

  const defaultLogoUrl = logoMedia["logos/roto-logo"] || LOGO_DEFAULT;

  const whiteLogoUrl = logoMedia["logos/roto-logo-white"] || LOGO_WHITE;
  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
    setIsSearchOpen(false);
    setOpenMobileDepartment("");
    setOpenDesktopDepartment("");
  };

  useEffect(() => {
    setOpenDesktopDepartment("");
    setOpenMobileDepartment("");
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let isActive = true;

    async function loadLogoMedia() {
      try {
        const response = await fetch("/api/media", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load logo media.");
        }

        const data = await response.json();

        if (isActive) {
          setLogoMedia(data.media || {});
        }
      } catch (logoError) {
        console.error("Header logo loading error:", logoError);
      }
    }

    loadLogoMedia();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setIsAccountMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();

    if (!trimmedSearchTerm) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearchLoading(true);

        const data = await searchProducts(trimmedSearchTerm);
        const products = data?.products || data || [];

        setSearchResults(products);
      } catch (requestError) {
        console.error("Product search error:", requestError);
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleLogout = () => {
    logout();
    closeAllMenus();
    router.push("/");
  };

  const handleSearchProductClick = (productId) => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearchOpen(false);

    router.push(`/product/${productId}`);
  };

  const getLocationLabel = () => {
    if (loading) {
      return "Locating...";
    }

    if (location?.area) {
      return location.area;
    }

    if (location?.city) {
      return location.city;
    }

    return "Set location";
  };

  const iconButtonClass = isTransparent
    ? "text-white hover:bg-white/15"
    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950";

  const chipClass = isTransparent
    ? "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
    : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200";

  const navLinkClass = isTransparent
    ? "text-white/85 hover:text-white"
    : "text-zinc-600 hover:text-zinc-950";

  const badgeClass = isTransparent
    ? "bg-white text-zinc-950"
    : "bg-zinc-950 text-white";

  return (
    <>
      <header
        className={`z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          hasHero ? "fixed inset-x-0 top-0" : "sticky top-0"
        } ${
          isTransparent
            ? "border-transparent bg-transparent"
            : "border-zinc-200 bg-white shadow-sm shadow-black/5"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ${
            isTransparent ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="mx-auto flex h-[72px] max-w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className={`grid size-10 place-items-center rounded-full transition lg:hidden ${chipClass}`}
            >
              {isMobileMenuOpen ? <FiX size={21} /> : <FiMenu size={21} />}
            </button>

            <Link
              href="/"
              onClick={closeAllMenus}
              aria-label="ROTO home"
              className="relative block shrink-0"
            >
              <img
                src={defaultLogoUrl}
                alt="ROTO"
                className={`h-16 object-contain transition-opacity duration-300 md:h-20 ${
                  isTransparent ? "opacity-0" : "opacity-100"
                }`}
              />

              <img
                src={whiteLogoUrl}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 size-full object-contain transition-opacity duration-300 ${
                  isTransparent ? "opacity-100" : "opacity-0"
                }`}
              />
            </Link>

            <button
              type="button"
              title={error || "Click to refresh your location"}
              onClick={detectLocation}
              className={`hidden max-w-40 items-center gap-2 truncate rounded-full px-3 py-2 text-xs font-bold transition xl:flex ${
                isTransparent
                  ? "bg-white/15 text-white/90 backdrop-blur-sm hover:bg-white/25 hover:text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
              }`}
            >
              <FiMapPin size={15} className="shrink-0" />
              <span className="truncate">{getLocationLabel()}</span>
            </button>
          </div>

          <nav className="hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => {
              const department = departmentData[link.department];
              const hasSubcategories =
                department?.subcategories &&
                department.subcategories.length > 0;

              if (!hasSubcategories) {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeAllMenus}
                    className={`relative text-xs font-extrabold uppercase tracking-[0.08em] transition ${navLinkClass}`}
                  >
                    {link.name}
                  </Link>
                );
              }

              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setOpenDesktopDepartment(link.department)}
                  onMouseLeave={() => setOpenDesktopDepartment("")}
                >
                  <div className="flex items-center">
                    <Link
                      href={link.href}
                      onClick={closeAllMenus}
                      className={`text-xs font-extrabold uppercase tracking-[0.08em] transition ${navLinkClass}`}
                    >
                      {link.name}
                    </Link>

                    <button
                      type="button"
                      aria-label={`Toggle ${link.name} categories`}
                      aria-expanded={openDesktopDepartment === link.department}
                      onClick={() =>
                        setOpenDesktopDepartment((current) =>
                          current === link.department ? "" : link.department,
                        )
                      }
                      className={`ml-1 grid size-5 place-items-center rounded-full transition ${navLinkClass}`}
                    >
                      <FiChevronDown
                        size={13}
                        className={`transition duration-200 ${
                          openDesktopDepartment === link.department
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {openDesktopDepartment === link.department && (
                    <div className="absolute left-1/2 top-full z-50 w-[540px] -translate-x-1/2 pt-4">
                      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-3 shadow-2xl">
                        <Link
                          href="/category/all"
                          onClick={closeAllMenus}
                          className="flex items-center justify-between rounded-2xl bg-zinc-950 px-5 py-4 text-white transition hover:bg-zinc-800"
                        >
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-300">
                              ROTO collection
                            </p>
                          </div>

                          <FiArrowUpRight size={20} className="shrink-0" />
                        </Link>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {department.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.slug}
                              href={`/category/${link.department}/${subcategory.slug}`}
                              onClick={closeAllMenus}
                              className="group/item rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-4 transition hover:border-zinc-300 hover:bg-white hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-black text-zinc-950 transition group-hover/item:text-amber-700">
                                    {subcategory.title}
                                  </p>

                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                                    {subcategory.description}
                                  </p>
                                </div>

                                <FiArrowUpRight
                                  size={16}
                                  className="mt-0.5 shrink-0 text-zinc-400 transition group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-zinc-950"
                                />
                              </div>
                            </Link>
                          ))}
                        </div>

                        <Link
                          href={link.href}
                          onClick={closeAllMenus}
                          className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.1em] text-zinc-800 transition hover:bg-zinc-100"
                        >
                          View all {link.name}
                          <FiArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/wishlist"
              aria-label="Open wishlist"
              className={`relative grid size-10 place-items-center rounded-full transition ${iconButtonClass}`}
            >
              <FiHeart size={19} />

              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-red-500 text-[9px] font-black text-white">
                  {wishlist.length > 99 ? "99+" : wishlist.length}
                </span>
              )}
            </Link>

            <div ref={searchRef} className="relative">
              <button
                type="button"
                aria-label="Search products"
                onClick={() => {
                  setIsSearchOpen((current) => !current);
                  setIsAccountMenuOpen(false);
                }}
                className={`grid size-10 place-items-center rounded-full transition ${iconButtonClass}`}
              >
                <FiSearch size={19} />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-3 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
                  <div className="border-b border-zinc-200 p-3">
                    <input
                      autoFocus
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search products..."
                      className="w-full rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:bg-zinc-50 focus:ring-2 focus:ring-zinc-950"
                    />
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {!searchTerm.trim() && (
                      <p className="p-5 text-center text-sm text-zinc-500">
                        Search Men, Women, Kids, Home, accessories, brands, or
                        products.
                      </p>
                    )}

                    {isSearchLoading && (
                      <p className="p-5 text-center text-sm text-zinc-500">
                        Searching products...
                      </p>
                    )}

                    {!isSearchLoading &&
                      searchTerm.trim() &&
                      searchResults.length === 0 && (
                        <p className="p-5 text-center text-sm text-zinc-500">
                          No products found.
                        </p>
                      )}

                    {!isSearchLoading &&
                      searchResults.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleSearchProductClick(product._id)}
                          className="flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-zinc-50"
                        >
                          <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                            <img
                              src={
                                product.image ||
                                "/images/product-placeholder.png"
                              }
                              alt={product.name || "Product"}
                              className="size-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-zinc-950">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {getSearchProductMeta(product)}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Open shopping bag"
              onClick={() => {
                setIsCartOpen(true);
                closeAllMenus();
              }}
              className={`relative grid size-10 place-items-center rounded-full transition ${iconButtonClass}`}
            >
              <FiShoppingBag size={20} />

              {totalQuantity > 0 && (
                <span
                  className={`absolute right-0 top-0 grid min-w-4 size-4 place-items-center rounded-full px-1 text-[9px] font-black transition-colors duration-300 ${badgeClass}`}
                >
                  {totalQuantity > 99 ? "99+" : totalQuantity}
                </span>
              )}
            </button>

            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                aria-label="Open account menu"
                onClick={() => {
                  setIsAccountMenuOpen((current) => !current);
                  setIsSearchOpen(false);
                }}
                className={`grid size-10 place-items-center rounded-full transition ${iconButtonClass}`}
              >
                <FiUser size={19} />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
                  {isAuthLoaded && user ? (
                    <>
                      <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4">
                        <p className="truncate text-sm font-extrabold text-zinc-950">
                          {user.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {user.email}
                        </p>
                      </div>

                      <div className="p-2">
                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={closeAllMenus}
                            className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                          >
                            Admin Panel
                          </Link>
                        )}

                        <Link
                          href="/my-orders"
                          onClick={closeAllMenus}
                          className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                        >
                          My Orders
                        </Link>

                        <Link
                          href="/wishlist"
                          onClick={closeAllMenus}
                          className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                        >
                          Wishlist
                        </Link>
                      </div>

                      <div className="border-t border-zinc-200 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2">
                      <Link
                        href="/login"
                        onClick={closeAllMenus}
                        className="block rounded-xl px-3 py-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100"
                      >
                        Login to your account
                      </Link>

                      <Link
                        href="/register"
                        onClick={closeAllMenus}
                        className="block rounded-xl px-3 py-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100"
                      >
                        Create an account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-zinc-200 bg-white px-4 py-5 lg:hidden">
            <button
              type="button"
              onClick={detectLocation}
              className="mb-4 flex w-full items-center gap-3 rounded-xl bg-zinc-100 px-4 py-3 text-left text-sm font-bold text-zinc-700"
            >
              <FiMapPin size={18} />
              <span>{getLocationLabel()}</span>
            </button>

            <nav className="flex flex-col">
              {navLinks.map((link) => {
                const department = departmentData[link.department];
                const hasSubcategories =
                  department?.subcategories &&
                  department.subcategories.length > 0;

                if (!hasSubcategories) {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeAllMenus}
                      className="border-b border-zinc-100 py-4 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950"
                    >
                      {link.name}
                    </Link>
                  );
                }

                const isOpen = openMobileDepartment === link.department;

                return (
                  <div
                    key={link.name}
                    className="border-b border-zinc-100 py-1"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={link.href}
                        onClick={closeAllMenus}
                        className="py-3 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950"
                      >
                        {link.name}
                      </Link>

                      <button
                        type="button"
                        aria-label={`Toggle ${link.name} categories`}
                        onClick={() =>
                          setOpenMobileDepartment((current) =>
                            current === link.department ? "" : link.department,
                          )
                        }
                        className="grid size-10 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-100"
                      >
                        <FiChevronDown
                          size={18}
                          className={`transition ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-3">
                        {department.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.slug}
                            href={`/category/${link.department}/${subcategory.slug}`}
                            onClick={closeAllMenus}
                            className="rounded-lg bg-white px-3 py-3 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-950 hover:text-white"
                          >
                            {subcategory.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              
            </nav>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
