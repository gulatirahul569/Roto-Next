import HelpPageLayout from "@/components/site/HelpPageLayout";

export default function ReturnsPage() {
  return (
    <HelpPageLayout
      title="Returns & Refunds"
      description="Information about return eligibility, refund processing, and support."
    >
      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Return eligibility
        </h2>

        <p className="mt-3">
          Return eligibility depends on the product category, seller policy,
          product condition, and the reason for the return request.
        </p>

        <p className="mt-3">
          Products should generally be unused, undamaged, and returned with
          original packaging, labels, accessories, and any included items.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Non-returnable products
        </h2>

        <p className="mt-3">
          Some items may not be returnable due to hygiene, personalization,
          product category restrictions, clearance terms, or seller-specific
          policies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Refunds
        </h2>

        <p className="mt-3">
          Once a returned item is inspected and approved, refunds are processed
          to the original payment method or according to the applicable seller
          policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Need help?
        </h2>

        <p className="mt-3">
          Contact Roto Support with your order number, product name, and the
          reason for your return request.
        </p>
      </section>
    </HelpPageLayout>
  );
}