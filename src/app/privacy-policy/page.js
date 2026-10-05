import InfoPageLayout from "@/components/site/InfoPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      eyebrow="Roto Legal"
      title="Privacy Policy"
      description="How Roto collects, uses, stores, and protects customer information."
      updatedAt="October 5, 2026"
    >
      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Information we collect
        </h2>

        <p className="mt-3">
          We may collect information you provide when creating an account,
          placing an order, contacting support, subscribing to updates, or
          using Roto services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          How we use information
        </h2>

        <p className="mt-3">
          Information may be used to process orders, provide support, prevent
          fraud, improve our services, communicate important updates, and meet
          legal obligations.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Sharing information
        </h2>

        <p className="mt-3">
          We may share necessary information with payment providers, delivery
          partners, sellers, service providers, and authorities where required
          by law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Contact
        </h2>

        <p className="mt-3">
          For privacy questions, contact Roto Support using the Contact Us page.
        </p>
      </section>
    </InfoPageLayout>
  );
}