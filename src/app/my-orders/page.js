"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowUpRight,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getMyOrders } from "../../services/orderService";

const statusStyles = {
  Pending: {
    label: "Pending",
    classes: "border-amber-200 bg-amber-50 text-amber-700",
    icon: FiClock,
  },

  Processing: {
    label: "Processing",
    classes: "border-blue-200 bg-blue-50 text-blue-700",
    icon: FiPackage,
  },

  Shipped: {
    label: "Shipped",
    classes: "border-purple-200 bg-purple-50 text-purple-700",
    icon: FiTruck,
  },

  Delivered: {
    label: "Delivered",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: FiCheckCircle,
  },

  Cancelled: {
    label: "Cancelled",
    classes: "border-red-200 bg-red-50 text-red-700",
    icon: FiXCircle,
  },
};

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function formatDate(date) {
  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function OrderSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-zinc-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 sm:flex-row sm:justify-between">
        <div className="space-y-3">
          <div className="h-4 w-40 rounded bg-zinc-200" />
          <div className="h-3 w-56 rounded bg-zinc-100" />
        </div>

        <div className="h-8 w-24 rounded-full bg-zinc-200" />
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2">
        <div className="h-20 rounded-2xl bg-zinc-100" />
        <div className="h-20 rounded-2xl bg-zinc-100" />
      </div>

      <div className="h-20 border-t border-zinc-100 bg-zinc-50" />
    </div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();

  const { user, token, isAuthLoaded } = useAuth();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!user) {
      router.replace("/login?next=/my-orders");
    }
  }, [isAuthLoaded, user, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMyOrders(token);
        const orderList = data?.orders || data || [];

        setOrders(Array.isArray(orderList) ? orderList : []);
      } catch (error) {
        console.error("Order history error:", error);

        setErrorMessage(
          error.message || "Unable to load your orders. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (!isAuthLoaded) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50">
        <p className="text-sm font-semibold text-zinc-500">
          Loading your account...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-zinc-50">
        <p className="text-sm font-semibold text-zinc-500">
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
              Your purchases
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Order history.
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Track all the orders you have placed with Roto.
            </p>
          </div>

          <Link
            href="/category/all"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-extrabold text-zinc-950 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
          >
            Continue shopping
            <FiArrowUpRight size={16} />
          </Link>
        </div>

        {/* Error state */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">Unable to load orders.</p>
            <p className="mt-1 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6">
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !errorMessage && orders.length === 0 && (
          <section className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-zinc-100">
              <FiBox size={28} className="text-zinc-600" />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight text-zinc-950">
              No orders yet.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Products you purchase from Roto will appear here with their
              delivery and payment status.
            </p>

            <Link
              href="/category/all"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
            >
              <FiShoppingBag size={16} />
              Browse products
            </Link>
          </section>
        )}

        {/* Orders */}
        {!isLoading && !errorMessage && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = statusStyles[order.status] || {
                label: order.status || "Pending",
                classes: "border-zinc-200 bg-zinc-100 text-zinc-700",
                icon: FiClock,
              };

              const StatusIcon = status.icon;

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                >
                  {/* Order top section */}
                  <div className="flex flex-col gap-5 border-b border-zinc-200 p-5 sm:p-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">
                        Order reference
                      </p>

                      <p className="mt-1 break-all text-sm font-bold text-zinc-950">
                        #{order._id}
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-600">
                        <FiCreditCard size={16} />

                        <span>
                          {order.paymentMethod === "online"
                            ? "Online payment"
                            : "Cash on delivery"}

                          {order.paymentStatus
                            ? ` · ${order.paymentStatus}`
                            : ""}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-extrabold ${status.classes}`}
                    >
                      <StatusIcon size={15} />
                      {status.label}
                    </span>
                  </div>

                  {/* Product items */}
                  <div className="p-5 sm:p-6">
                    <h2 className="mb-4 text-lg font-black tracking-tight text-zinc-950">
                      Items in this order
                    </h2>

                    <div className="grid gap-3 md:grid-cols-2">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={`${item._id || item.name}-${index}`}
                          className="flex gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
                        >
                          <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-white">
                            <img
                              src={item.image}
                              alt={item.name || "Ordered product"}
                              className="size-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-zinc-950">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs font-medium text-zinc-500">
                              Quantity: {item.quantity}
                            </p>

                            <p className="mt-2 text-sm font-black text-zinc-950">
                              {formatPrice(
                                Number(item.price || 0) *
                                  Number(item.quantity || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom section */}
                  <div className="flex flex-col gap-5 border-t border-zinc-200 bg-zinc-50 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3 text-sm text-zinc-600">
                      <FiMapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-zinc-950"
                      />

                      <div>
                        <p className="font-bold text-zinc-950">
                          Shipping address
                        </p>

                        <p className="mt-1">
                          {order.shippingAddress?.fullName && (
                            <span>{order.shippingAddress.fullName}, </span>
                          )}

                          {order.shippingAddress?.city || "City unavailable"}
                          {order.shippingAddress?.state
                            ? `, ${order.shippingAddress.state}`
                            : ""}
                          {order.shippingAddress?.pincode
                            ? ` - ${order.shippingAddress.pincode}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-zinc-500">
                        Total paid
                      </p>

                      <p className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}   