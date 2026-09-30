import Link from "next/link";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10 sm:px-6">
      {/* Background shapes */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-amber-500/25 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[32rem] rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_48%)]" />

      {/* Home logo */}
      <Link
        href="/"
        className="absolute left-6 top-6 text-xl font-black tracking-[0.22em] text-white sm:left-8 sm:top-8"
      >
        ROTO
      </Link>

      {/* Auth card */}
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-300">
          Welcome to Roto
        </p>

        <h1 className="mt-4 text-center text-4xl font-black tracking-tight text-white">
          {title}
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-zinc-300">
          {subtitle}
        </p>

        <div className="mt-8">{children}</div>

        <p className="mt-7 text-center text-sm text-zinc-300">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-extrabold text-white underline underline-offset-4 transition hover:text-amber-200"
          >
            {footerLinkText}
          </Link>
        </p>
      </section>
    </main>
  );
}