import Link from "next/link";

export default function InlinePromoTile({
  href = "/category/all",
  imageUrl,
  title = "Featured offer",
}) {
  if (!imageUrl) return null;

  return (
    <Link
      href={href}
      aria-label={title}
      className="group relative block min-h-[420px] overflow-hidden rounded-xl bg-zinc-100 sm:min-h-[500px]"
    >
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />

      <span className="sr-only">{title}</span>
    </Link>
  );
}