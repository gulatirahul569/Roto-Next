"use client";

import { useState } from "react";
import HelpPageLayout from "@/components/site/HelpPageLayout";
import { FiPackage, FiSearch } from "react-icons/fi";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");

  function handleTrackOrder(event) {
    event.preventDefault();

    if (!orderNumber.trim()) {
      setMessage("Enter your order number to continue.");
      return;
    }

    setMessage(
      "Order tracking will appear here after your tracking API is connected.",
    );
  }

  return (
    <HelpPageLayout
      title="Track Your Order"
      description="Enter your order number to check the latest shipment status."
    >
      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
        <div className="grid size-12 place-items-center rounded-xl bg-zinc-950 text-white">
          <FiPackage size={22} />
        </div>

        <h2 className="mt-4 text-xl font-black text-zinc-950">
          Find your order
        </h2>

        <p className="mt-2 text-sm text-zinc-600">
          Enter the order number from your order confirmation message.
        </p>

        <form
          onSubmit={handleTrackOrder}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="Example: ROTO-123456"
            className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
          >
            <FiSearch size={16} />
            Track order
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {message}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Tracking not available?
        </h2>

        <p className="mt-3">
          Shipment tracking becomes available after your order is dispatched.
          Check your email or contact Roto Support if you need help locating an
          order.
        </p>
      </section>
    </HelpPageLayout>
  );
}