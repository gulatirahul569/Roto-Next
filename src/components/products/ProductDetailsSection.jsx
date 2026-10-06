import { FiFileText } from "react-icons/fi";

export default function ProductDetailsSection({ product }) {
  const sections = (Array.isArray(product?.detailSections)
    ? product.detailSections
    : []
  )
    .map((section) => ({
      title: String(section?.title || "").trim(),
      lines: String(section?.content || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    }))
    .filter((section) => section.title && section.lines.length > 0);

  const specifications = (Array.isArray(product?.specifications)
    ? product.specifications
    : []
  )
    .map((row) => ({
      label: String(row?.label || "").trim(),
      value: String(row?.value || "").trim(),
    }))
    .filter((row) => row.label && row.value);

  if (sections.length === 0 && specifications.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 w-full min-w-0 max-w-full overflow-hidden border-t border-zinc-200 pt-6">
      <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold uppercase tracking-wide text-zinc-950">
        <span className="min-w-0 break-words">
          Product details
        </span>

        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
          <FiFileText size={15} />
        </span>
      </h2>

      {sections.map((section, index) => (
        <div
          key={`${section.title}-${index}`}
          className="mt-5 min-w-0 max-w-full"
        >
          <h3 className="flex min-w-0 items-start gap-2 text-base font-bold text-amber-700">
            <span
              className="mt-1 h-4 w-1 shrink-0 rounded-full bg-amber-400"
              aria-hidden="true"
            />

            <span className="min-w-0 break-words">
              {section.title}
            </span>
          </h3>

          <div className="mt-1.5 min-w-0 max-w-full space-y-0.5 text-[15px] leading-6 text-zinc-800">
            {section.lines.map((line, lineIndex) => (
              <p
                key={lineIndex}
                className="min-w-0 max-w-full break-words [overflow-wrap:anywhere]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}

      {specifications.length > 0 && (
        <div className="mt-6 min-w-0 max-w-full">
          <h3 className="flex min-w-0 items-start gap-2 text-base font-bold text-amber-700">
            <span
              className="mt-1 h-4 w-1 shrink-0 rounded-full bg-amber-400"
              aria-hidden="true"
            />

            <span className="min-w-0 break-words">
              Specifications
            </span>
          </h3>

          <dl className="mt-2 grid w-full min-w-0 grid-cols-1 gap-x-8 sm:grid-cols-2">
            {specifications.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className="min-w-0 max-w-full border-b border-zinc-200 py-3"
              >
                <dt className="min-w-0 break-words text-xs font-medium uppercase tracking-wide text-sky-700 [overflow-wrap:anywhere]">
                  {row.label}
                </dt>

                <dd className="mt-0.5 min-w-0 break-words text-[15px] font-medium text-zinc-950 [overflow-wrap:anywhere]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}