import Link from "next/link";

export default function StoreBanner() {
  return (
    <section className="store-banner">
      <div className="container store-banner-content">
        <p>
          New arrivals are here. Discover products selected for everyday life.
        </p>

        <Link href="/category/all">Explore collection</Link>
      </div>
    </section>
  );
}