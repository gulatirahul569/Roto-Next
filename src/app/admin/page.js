"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getAdminStats } from "../../services/adminService";

const RevenueChart = dynamic(
  () => import("../../components/admin/RevenueChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-2xl bg-zinc-100" />
    ),
  }
);

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function KpiCard({ title, value, subtitle, icon: Icon, tone }) {
  const tones = {
    zinc: "bg-zinc-950 text-white",
    emerald: "bg-emerald-600 text-white",
    amber: "bg-amber-500 text-white",
    violet: "bg-violet-600 text-white",
  };

  return (
    <article
      className={`relative overflow-hidden rounded-3xl p-5 shadow-sm ${tones[tone]}`}
    >
      <div className="absolute -right-8 -top-8 size-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-2 size-20 rounded-full bg-white/10" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
            {title}
          </p>

          <div className="grid size-10 place-items-center rounded-xl bg-white/15">
            <Icon size={19} />
          </div>
        </div>

        <p className="mt-5 text-3xl font-black tracking-tight">{value}</p>

        <p className="mt-2 text-xs font-semibold text-white/70">
          {subtitle}
        </p>
      </div>
    </article>
  );
}

function StatusRow({ label, value, color, totalOrders }) {
  const percentage = totalOrders
    ? Math.round((Number(value || 0) / totalOrders) * 100)
    : 0;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <span className={`size-2 rounded-full ${color}`} />
          {label}
        </div>

        <span className="text-sm font-black text-zinc-950">{value || 0}</span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-1 text-right text-[11px] font-semibold text-zinc-400">
        {percentage}%
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6">
      <div className="h-20 w-72 rounded-2xl bg-zinc-200" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-3xl bg-zinc-200" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 rounded-3xl bg-zinc-200" />
        <div className="h-80 rounded-3xl bg-zinc-200 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token, user, isAuthLoaded } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setErrorMessage("");

        const data = await getAdminStats(token);
        setDashboardData(data);
      } catch (error) {
        console.error("Admin dashboard error:", error);

        setErrorMessage(
          error.message || "Unable to load dashboard statistics."
        );
      }
    }

    if (token && user?.role === "admin") {
      loadDashboard();
    }
  }, [token, user]);

  const totalStatusOrders = useMemo(() => {
    if (!dashboardData) {
      return 0;
    }

    return (
      Number(dashboardData.pendingOrders || 0) +
      Number(dashboardData.shippedOrders || 0) +
      Number(dashboardData.deliveredOrders || 0)
    );
  }, [dashboardData]);

  if (!isAuthLoaded || !dashboardData) {
    if (errorMessage) {
      return (
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-black">Dashboard could not be loaded.</p>
            <p className="mt-2 text-sm">{errorMessage}</p>
          </div>
        </div>
      );
    }

    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Control centre
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Admin dashboard.
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Store performance and order activity at a glance.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          Live dashboard data
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Products"
          value={dashboardData.products || 0}
          subtitle="Products in catalog"
          icon={FiPackage}
          tone="zinc"
        />

        <KpiCard
          title="Orders"
          value={dashboardData.orders || 0}
          subtitle="Total customer orders"
          icon={FiShoppingBag}
          tone="emerald"
        />

        <KpiCard
          title="Users"
          value={dashboardData.users || 0}
          subtitle="Registered customers"
          icon={FiUsers}
          tone="amber"
        />

        <KpiCard
          title="Revenue"
          value={formatPrice(dashboardData.revenue)}
          subtitle="Total store revenue"
          icon={FiDollarSign}
          tone="violet"
        />
      </section>

      {/* Status + chart */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Order status */}
        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-zinc-100">
              <FiClock size={18} />
            </div>

            <div>
              <h2 className="font-black tracking-tight text-zinc-950">
                Order status
              </h2>

              <p className="text-xs text-zinc-500">
                Current order pipeline
              </p>
            </div>
          </div>

          <div className="mt-5 divide-y divide-zinc-100">
            <StatusRow
              label="Pending"
              value={dashboardData.pendingOrders}
              color="bg-amber-400"
              totalOrders={totalStatusOrders}
            />

            <StatusRow
              label="Shipped"
              value={dashboardData.shippedOrders}
              color="bg-blue-500"
              totalOrders={totalStatusOrders}
            />

            <StatusRow
              label="Delivered"
              value={dashboardData.deliveredOrders}
              color="bg-emerald-500"
              totalOrders={totalStatusOrders}
            />
          </div>

          <Link
            href="/admin/orders"
            className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-zinc-950 underline underline-offset-4 transition hover:text-zinc-600"
          >
            Manage orders
            <FiArrowUpRight size={16} />
          </Link>
        </article>

        {/* Revenue chart */}
        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <FiTrendingUp size={19} />
                </div>

                <div>
                  <h2 className="font-black tracking-tight text-zinc-950">
                    Revenue trend
                  </h2>

                  <p className="text-xs text-zinc-500">
                    Monthly revenue overview
                  </p>
                </div>
              </div>
            </div>

            <span className="w-fit rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-extrabold text-zinc-600">
              This year
            </span>
          </div>

          <div className="mt-6 h-72">
            <RevenueChart revenueChart={dashboardData.revenueChart || []} />
          </div>
        </article>
      </section>

      {/* Bottom cards */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Top products */}
        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">
                Best performers
              </p>

              <h2 className="mt-2 text-xl font-black tracking-tight text-zinc-950">
                Top products
              </h2>
            </div>

            <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <FiBox size={18} />
            </div>
          </div>

          {dashboardData.topProducts?.length ? (
            <div className="mt-5 divide-y divide-zinc-100">
              {dashboardData.topProducts.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-xs font-black text-zinc-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="truncate text-sm font-bold text-zinc-800">
                      {product.name}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-black text-zinc-950">
                    {formatPrice(product.sales)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 grid min-h-44 place-items-center rounded-2xl bg-zinc-50 p-6 text-center">
              <p className="text-sm font-semibold text-zinc-500">
                No product sales data is available yet.
              </p>
            </div>
          )}

          <Link
            href="/admin/products"
            className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-zinc-950 underline underline-offset-4 transition hover:text-zinc-600"
          >
            View all products
            <FiArrowUpRight size={16} />
          </Link>
        </article>

        {/* Recent orders */}
        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">
                Latest activity
              </p>

              <h2 className="mt-2 text-xl font-black tracking-tight text-zinc-950">
                Recent orders
              </h2>
            </div>

            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <FiShoppingBag size={18} />
            </div>
          </div>

          {dashboardData.recentOrders?.length ? (
            <div className="mt-5 divide-y divide-zinc-100">
              {dashboardData.recentOrders.map((order, index) => {
                const customerName =
                  order.shippingAddress?.fullName || "Customer";

                return (
                  <div
                    key={order._id || index}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-black text-zinc-700">
                        {customerName.charAt(0).toUpperCase()}
                      </div>

                      <p className="truncate text-sm font-bold text-zinc-800">
                        {customerName}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-black text-zinc-950">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 grid min-h-44 place-items-center rounded-2xl bg-zinc-50 p-6 text-center">
              <p className="text-sm font-semibold text-zinc-500">
                No recent orders are available yet.
              </p>
            </div>
          )}

          <Link
            href="/admin/orders"
            className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-zinc-950 underline underline-offset-4 transition hover:text-zinc-600"
          >
            View all orders
            <FiArrowUpRight size={16} />
          </Link>
        </article>
      </section>
    </div>
  );
}