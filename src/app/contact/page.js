"use client";

import { useState } from "react";
import HelpPageLayout from "@/components/site/HelpPageLayout";
import {
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiSend,
} from "react-icons/fi";

export default function ContactPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setMessage(
      "Your message form is ready. Connect this form to your support email or support-ticket API next.",
    );

    event.currentTarget.reset();
  }

  return (
    <HelpPageLayout
      title="Contact Us"
      description="Need help with a product, order, payment, return, or delivery question? Send us a message."
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <FiMail size={20} className="text-amber-700" />
          <h2 className="mt-3 text-sm font-black text-zinc-950">
            Email support
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            support@roto.example
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <FiPhone size={20} className="text-amber-700" />
          <h2 className="mt-3 text-sm font-black text-zinc-950">
            Phone support
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Add your support number
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <FiMessageCircle size={20} className="text-amber-700" />
          <h2 className="mt-3 text-sm font-black text-zinc-950">
            Order support
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Include your order number.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Send a message
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              type="text"
              placeholder="Your name"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
            />

            <input
              required
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          <input
            type="text"
            placeholder="Order number, if applicable"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
          />

          <textarea
            required
            rows={6}
            placeholder="How can we help?"
            className="w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-100"
          />

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-zinc-800"
          >
            <FiSend size={16} />
            Send message
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {message}
          </p>
        )}
      </section>
    </HelpPageLayout>
  );
}