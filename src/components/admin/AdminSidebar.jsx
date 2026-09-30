"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiBox,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: FiGrid,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: FiPackage,
  },
  {
    label: "Add Product",
    href: "/admin/add-product",
    icon: FiBox,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: FiShoppingBag,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: FiUsers,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: FiSettings,
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-zinc-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand area */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-white text-sm font-black tracking-[0.16em] text-zinc-950">
              R
            </div>

            <div>
              <p className="text-sm font-black tracking-[0.16em]">ROTO</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Admin Panel
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin menu"
            className="grid size-9 place-items-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
            Management
          </p>

          <div className="space-y-1">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-6 border-t border-white/10" />

          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
            Store
          </p>

          <div className="space-y-1">
            {navigationItems.slice(4).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-6 border-t border-white/10" />

          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-extrabold text-zinc-950 transition hover:bg-zinc-200"
          >
            <FiArrowLeft size={18} />
            Back to Store
          </Link>
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500">
              Logged in as
            </p>

            <p className="mt-2 truncate text-sm font-bold text-white">
              {user?.name || "Admin"}
            </p>

            <p className="mt-1 truncate text-xs text-zinc-400">
              {user?.email || ""}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2.5 text-sm font-extrabold text-white transition hover:bg-red-600"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}