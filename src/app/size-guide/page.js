import HelpPageLayout from "@/components/site/HelpPageLayout";

const sizeRows = [
  {
    size: "S",
    chest: "36–38 in",
    waist: "30–32 in",
    hip: "36–38 in",
  },
  {
    size: "M",
    chest: "38–40 in",
    waist: "32–34 in",
    hip: "38–40 in",
  },
  {
    size: "L",
    chest: "40–42 in",
    waist: "34–36 in",
    hip: "40–42 in",
  },
  {
    size: "XL",
    chest: "42–44 in",
    waist: "36–38 in",
    hip: "42–44 in",
  },
  {
    size: "XXL",
    chest: "44–46 in",
    waist: "38–40 in",
    hip: "44–46 in",
  },
];

export default function SizeGuidePage() {
  return (
    <HelpPageLayout
      title="Size Guide"
      description="Use this reference guide to help find your preferred fit."
    >
      <section>
        <h2 className="text-xl font-black text-zinc-950">
          How to measure
        </h2>

        <p className="mt-3">
          Use a soft measuring tape and measure over light clothing. Compare
          your measurements with the specific product size chart whenever one
          is provided.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-zinc-950 text-white">
              <tr>
                <th className="px-5 py-4">Size</th>
                <th className="px-5 py-4">Chest</th>
                <th className="px-5 py-4">Waist</th>
                <th className="px-5 py-4">Hip</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200">
              {sizeRows.map((row) => (
                <tr key={row.size}>
                  <td className="px-5 py-4 font-black text-zinc-950">
                    {row.size}
                  </td>
                  <td className="px-5 py-4">{row.chest}</td>
                  <td className="px-5 py-4">{row.waist}</td>
                  <td className="px-5 py-4">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black text-zinc-950">
          Product-specific sizing
        </h2>

        <p className="mt-3">
          Sizes may vary between brands and product types. Always check the
          product description and product-specific size information before
          placing your order.
        </p>
      </section>
    </HelpPageLayout>
  );
}