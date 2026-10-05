import InfoPageLayout from "@/components/site/InfoPageLayout";

export default function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="Roto Legal"
      title="Terms of Service"
      description="Rules and conditions for using Roto and purchasing products through the platform."
      updatedAt="October 5, 2026"
    >
      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Using Roto
        </h2>

        <p className="mt-3">
          By accessing or using Roto, you agree to use the platform lawfully
          and provide accurate information when placing orders or creating an
          account.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Product information
        </h2>

        <p className="mt-3">
          We aim to keep product descriptions, images, pricing, and
          availability accurate. However, product details may change, and
          display colours can vary between screens.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          External products
        </h2>

        <p className="mt-3">
          Some products may link to external seller or affiliate websites.
          Purchases completed outside Roto are governed by that seller’s own
          pricing, shipping, payment, and return policies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Changes to these terms
        </h2>

        <p className="mt-3">
          Roto may update these terms when required. Continued use after an
          update means you accept the revised version.
        </p>
      </section>
    </InfoPageLayout>
  );
}