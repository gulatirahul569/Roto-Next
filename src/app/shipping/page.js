import HelpPageLayout from "@/components/site/HelpPageLayout";

export default function ShippingPage() {
  return (
    <HelpPageLayout
      title="Shipping Information"
      description="Learn how Roto processes, dispatches, and delivers your orders."
    >
      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Order processing
        </h2>

        <p className="mt-3">
          Orders are generally processed after successful payment confirmation.
          Processing time may vary during sale events, holidays, or periods of
          unusually high demand.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Delivery updates
        </h2>

        <p className="mt-3">
          Once your order is dispatched, you will receive shipment and tracking
          details through the contact information used while placing your order.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Delivery locations
        </h2>

        <p className="mt-3">
          Delivery availability depends on your pincode, logistics coverage,
          product type, seller location, and inventory availability.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Shipping charges
        </h2>

        <p className="mt-3">
          Applicable shipping charges, if any, are shown during checkout before
          you complete payment.
        </p>
      </section>
    </HelpPageLayout>
  );
}