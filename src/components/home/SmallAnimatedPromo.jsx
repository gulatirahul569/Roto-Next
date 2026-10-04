import Link from "next/link";

const PROMO_GIF =
  "https://assets.myntassets.com/f_webp,w_980,c_limit,fl_progressive,dpr_2.0/assets/images/2026/SEPTEMBER/24/a73a997ce95c4dee92f25082087d45b5.gif";

export default function SmallAnimatedPromo({
  href = "/category/all",
  imageUrl = PROMO_GIF,
  title = "Shop the latest offer",
}) {
  return (
    <section className="overflow-hidden bg-gray-50">

    <div className="mx-auto w-full bg-gray-50 max-w-full ">
      <Link
        href={href}
        aria-label={title}
        className="group block overflow-hidden bg-zinc-100 shadow-sm transition duration-300 "
      >
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </Link>
    </div>
    </section>
  );
}