import InfoPageLayout from "@/components/site/InfoPageLayout";

export default function CookiesPage() {
  return (
    <InfoPageLayout
      eyebrow="Roto Legal"
      title="Cookie Policy"
      description="How Roto uses cookies and similar technologies."
      updatedAt="October 5, 2026"
    >
      <section>
        <h2 className="text-xl font-black text-zinc-950">
          What are cookies?
        </h2>

        <p className="mt-3">
          Cookies are small files stored in your browser that help websites
          remember information and improve your browsing experience.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Why we use cookies
        </h2>

        <p className="mt-3">
          Roto may use cookies for essential functionality, shopping-cart
          behaviour, login sessions, preferences, analytics, and security.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Managing cookies
        </h2>

        <p className="mt-3">
          You can control cookies through your browser settings. Disabling some
          cookies may affect cart, login, checkout, and other site features.
        </p>
      </section>
    </InfoPageLayout>
  );
}