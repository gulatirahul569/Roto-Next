"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import {
  getAllOrders,
  updateOrderStatus,
} from "../../../services/orderService";

const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusStyles = {
  Pending: {
    classes: "border-amber-200 bg-amber-50 text-amber-700",
    icon: FiClock,
  },

  Processing: {
    classes: "border-blue-200 bg-blue-50 text-blue-700",
    icon: FiPackage,
  },

  Shipped: {
    classes: "border-purple-200 bg-purple-50 text-purple-700",
    icon: FiTruck,
  },

  Delivered: {
    classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: FiCheckCircle,
  },

  Cancelled: {
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

function StatusBadge({ status }) {
  const statusData = statusStyles[status] || {
    classes: "border-zinc-200 bg-zinc-100 text-zinc-700",
    icon: FiClock,
  };

  const StatusIcon = statusData.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusData.classes}`}
    >
      <StatusIcon size={14} />
      {status || "Pending"}
    </span>
  );
}

function OrderSkeleton() {
  return (
    <article className="animate-pulse overflow-hidden rounded-3xl border border-zinc-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="h-4 w-44 rounded bg-zinc-200" />
          <div className="h-3 w-64 rounded bg-zinc-100" />
          <div className="h-3 w-52 rounded bg-zinc-100" />
        </div>

        <div className="h-10 w-36 rounded-xl bg-zinc-200" />
      </div>

      <div className="grid gap-3 p-6 md:grid-cols-2">
        <div className="h-20 rounded-2xl bg-zinc-100" />
        <div className="h-20 rounded-2xl bg-zinc-100" />
      </div>
    </article>
  );
}

export default function AdminOrdersPage() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadOrders = async ({ showRefreshState = false } = {}) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage("");

      const data = await getAllOrders(token);
      const orderList = data?.orders || data || [];

      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (error) {
      console.error("Admin orders error:", error);

      setErrorMessage(
        error.message || "Unable to load customer orders. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = String(
        order.userId?.name || order.shippingAddress?.fullName || ""
      ).toLowerCase();

      const customerEmail = String(order.userId?.email || "").toLowerCase();

      const orderId = String(order._id || "").toLowerCase();

      const city = String(order.shippingAddress?.city || "").toLowerCase();

      const pincode = String(
        order.shippingAddress?.pincode || ""
      ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        customerName.includes(normalizedSearch) ||
        customerEmail.includes(normalizedSearch) ||
        orderId.includes(normalizedSearch) ||
        city.includes(normalizedSearch) ||
        pincode.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!token) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      setErrorMessage("");
      setSuccessMessage("");

      await updateOrderStatus(orderId, newStatus, token);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setSuccessMessage(`Order status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Order status update error:", error);

      setErrorMessage(
        error.message || "Unable to update order status. Please try again."
      );
    } finally {
      setUpdatingOrderId("");
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">
            Order management
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Customer orders.
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Review customer purchases and update delivery progress.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-extrabold text-zinc-600 shadow-sm">
          <FiShoppingBag size={15} />
          {orders.length} total order{orders.length === 1 ? "" : "s"}
        </div>
      </section>

      {/* Alerts */}
      {successMessage && (
        <div className="mt-7 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <div className="flex items-start gap-3">
            <FiCheckCircle size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-bold">{successMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Close success message"
          >
            <FiXCircle size={18} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mt-7 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <FiAlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
            aria-label="Close error message"
          >
            <FiXCircle size={18} />
          </button>
        </div>
      )}

      {/* Filters */}
      <section className="mt-7 flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search order ID, customer, email, city, or pincode..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white"
          />
        </div>

        <div className="relative">
          <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full appearance-none rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-10 text-sm font-bold text-zinc-700 outline-none transition focus:border-zinc-950 lg:w-48"
          >
            <option value="All">All statuses</option>

            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => loadOrders({ showRefreshState: true })}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-extrabold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </section>

      {/* Loading */}
      {isLoading && (
        <section className="mt-6 space-y-5">
          <OrderSkeleton />
          <OrderSkeleton />
          <OrderSkeleton />
        </section>
      )}

      {/* Empty state */}
      {!isLoading && filteredOrders.length === 0 && (
        <section className="mt-6 grid min-h-80 place-items-center rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div>
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-zinc-100 text-zinc-500">
              <FiShoppingBag size={24} />
            </div>

            <h2 className="mt-5 text-xl font-black tracking-tight text-zinc-950">
              No matching orders found.
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Try another search value or choose a different order status.
            </p>

            {(searchTerm || statusFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
                className="mt-5 rounded-full bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>
      )}

      {/* Orders */}
      {!isLoading && filteredOrders.length > 0 && (
        <section className="mt-6 space-y-5">
          {filteredOrders.map((order) => {
            const customerName =
              order.userId?.name ||
              order.shippingAddress?.fullName ||
              "Customer";

            return (
              <article
                key={order._id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
              >
                {/* Order header */}
                <div className="flex flex-col gap-5 border-b border-zinc-200 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">
                      Order reference
                    </p>

                    <p className="mt-1 break-all text-sm font-black text-zinc-950">
                      #{order._id}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                      <span className="inline-flex items-center gap-2">
                        <FiUser size={15} />
                        {customerName}
                      </span>

                      {order.userId?.email && (
                        <span>{order.userId.email}</span>
                      )}

                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <StatusBadge status={order.status} />

                    <div className="relative">
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />

                      <select
                        value={order.status || "Pending"}
                        disabled={updatingOrderId === order._id}
                        onChange={(event) =>
                          handleStatusChange(order._id, event.target.value)
                        }
                        className="appearance-none rounded-xl border border-zinc-300 bg-white px-3 py-2 pr-9 text-sm font-bold text-zinc-700 outline-none transition focus:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {updatingOrderId === order._id && (
                      <FiRefreshCw
                        size={17}
                        className="animate-spin text-zinc-500"
                      />
                    )}
                  </div>
                </div>

                {/* Payment information */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-zinc-100 bg-zinc-50 px-5 py-4 text-sm text-zinc-600 sm:px-6">
                  <span className="inline-flex items-center gap-2">
                    <FiCreditCard size={16} className="text-zinc-950" />

                    <span>
                      Payment:{" "}
                      <strong className="text-zinc-950">
                        {order.paymentMethod === "online"
                          ? "Online"
                          : "Cash on Delivery"}
                      </strong>
                    </span>
                  </span>

                  {order.paymentStatus && (
                    <span>
                      Payment status:{" "}
                      <strong className="text-zinc-950">
                        {order.paymentStatus}
                      </strong>
                    </span>
                  )}
                </div>

                {/* Items */}
                <div className="p-5 sm:p-6">
                  <h2 className="mb-4 text-lg font-black tracking-tight text-zinc-950">
                    Order items
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

                          <p className="mt-1 text-xs text-zinc-500">
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

                {/* Footer */}
                <div className="flex flex-col gap-5 border-t border-zinc-200 bg-zinc-50 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3 text-sm text-zinc-600">
                    <FiMapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-zinc-950"
                    />

                    <div>
                      <p className="font-bold text-zinc-950">
                        Delivery address
                      </p>

                      <p className="mt-1">
                        {order.shippingAddress?.fullName && (
                          <span>{order.shippingAddress.fullName}, </span>
                        )}

                        {order.shippingAddress?.address && (
                          <span>{order.shippingAddress.address}, </span>
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
                      Order total
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}