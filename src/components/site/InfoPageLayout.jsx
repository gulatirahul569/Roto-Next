import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function InfoPageLayout({
  eyebrow = "Roto Support",
  title,
  description,
  updatedAt,
  children,
}) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
        >
          <FiArrowLeft size={16} />
          Back to home
        </Link>

        <article className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <header className="border-b border-zinc-200 bg-zinc-950 px-6 py-10 text-white sm:px-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">
              {eyebrow}
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              {title}
            </h1>

            {description && (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                {description}
              </p>
            )}

            {updatedAt && (
              <p className="mt-5 text-xs font-semibold text-zinc-400">
                Last updated: {updatedAt}
              </p>
            )}
          </header>

          <div className="space-y-10 px-6 py-8 text-sm leading-7 text-zinc-700 sm:px-10 sm:py-10 sm:text-base">
            {children}
          </div>
        </article>
      </div>
    </main>
  );
}