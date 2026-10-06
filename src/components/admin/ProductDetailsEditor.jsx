"use client";

import { FiPlus, FiX } from "react-icons/fi";

const OTHER_VALUE = "__other__";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-950";

export default function ProductDetailsEditor({
  contextLabel = "",
  sections,
  specifications,
  onSectionsChange,
  onSpecificationsChange,
}) {
  /* Headings */

  const updateSection = (index, field, value) => {
    onSectionsChange(
      sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    );
  };

  const addSection = () => {
    onSectionsChange([...sections, { title: "", content: "" }]);
  };

  const removeSection = (indexToRemove) => {
    onSectionsChange(
      sections.filter((_, sectionIndex) => sectionIndex !== indexToRemove),
    );
  };

  /* Specifications */

  const updateSpecification = (index, patch) => {
    onSpecificationsChange(
      specifications.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const addSpecification = () => {
    onSpecificationsChange([
      ...specifications,
      {
        label: "",
        value: "",
        options: [],
        isTemplate: false,
        isOther: false,
      },
    ]);
  };

  const removeSpecification = (indexToRemove) => {
    onSpecificationsChange(
      specifications.filter((_, rowIndex) => rowIndex !== indexToRemove),
    );
  };

  const handleSelectChange = (index, selectedValue) => {
    if (selectedValue === OTHER_VALUE) {
      updateSpecification(index, { isOther: true, value: "" });
      return;
    }

    updateSpecification(index, { isOther: false, value: selectedValue });
  };

  const templateRows = specifications
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.isTemplate);

  const customRows = specifications
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !row.isTemplate);

  return (
    <section className="rounded-xl border border-zinc-200 p-5">
      <div>
        <h2 className="text-lg font-black text-zinc-950">Product details</h2>

        <p className="mt-1 text-sm text-zinc-600">
          Shown on the product page below &ldquo;About this item&rdquo;.
          {contextLabel ? ` Fields for ${contextLabel}.` : ""}
        </p>
      </div>

      {/* Headings */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-zinc-950">Headings</h3>

            <p className="mt-1 text-xs text-zinc-500">
              Write one point per line. Each line is shown on its own line.
            </p>
          </div>

          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-zinc-800"
          >
            <FiPlus size={15} />
            Add heading
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {sections.map((section, index) => (
            <div
              key={`section-${index}`}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={section.title}
                  maxLength={80}
                  onChange={(event) =>
                    updateSection(index, "title", event.target.value)
                  }
                  placeholder="Heading, e.g. Size & Fit"
                  className={`${inputClass} font-bold`}
                />

                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  aria-label={`Remove heading ${section.title || index + 1}`}
                  className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                >
                  <FiX size={17} />
                </button>
              </div>

              <textarea
                rows={4}
                value={section.content}
                onChange={(event) =>
                  updateSection(index, "content", event.target.value)
                }
                placeholder={"One point per line\nBlack printed sweatshirt\nRound neck"}
                className={`${inputClass} mt-2 resize-y`}
              />
            </div>
          ))}

          {sections.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-3 text-xs font-semibold text-zinc-500">
              No headings yet. Click &ldquo;Add heading&rdquo; to add one.
            </p>
          )}
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-zinc-950">Specifications</h3>

            <p className="mt-1 text-xs text-zinc-500">
              Pick a value for each field. Leave a field empty to hide it.
            </p>
          </div>

          <button
            type="button"
            onClick={addSpecification}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-extrabold text-zinc-800 transition hover:bg-zinc-100"
          >
            <FiPlus size={15} />
            Add specification
          </button>
        </div>

        {templateRows.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {templateRows.map(({ row, index }) => (
              <div key={`spec-${index}`}>
                <label className="mb-1.5 block text-sm font-bold text-zinc-800">
                  {row.label}
                </label>

                {row.options.length > 0 ? (
                  <>
                    <select
                      value={row.isOther ? OTHER_VALUE : row.value}
                      onChange={(event) =>
                        handleSelectChange(index, event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">Select {row.label.toLowerCase()}</option>

                      {row.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}

                      <option value={OTHER_VALUE}>Other (type your own)</option>
                    </select>

                    {row.isOther && (
                      <input
                        type="text"
                        value={row.value}
                        maxLength={120}
                        onChange={(event) =>
                          updateSpecification(index, {
                            value: event.target.value,
                          })
                        }
                        placeholder={`Type ${row.label.toLowerCase()}`}
                        className={`${inputClass} mt-2`}
                      />
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    value={row.value}
                    maxLength={120}
                    onChange={(event) =>
                      updateSpecification(index, { value: event.target.value })
                    }
                    placeholder={`Enter ${row.label.toLowerCase()}`}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {templateRows.length === 0 && customRows.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-3 text-xs font-semibold text-zinc-500">
            Choose a department and subcategory to load its fields, or click
            &ldquo;Add specification&rdquo; to add your own.
          </p>
        )}

        {customRows.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-zinc-500">
              Extra specifications
            </p>

            <div className="space-y-3">
              {customRows.map(({ row, index }) => (
                <div
                  key={`custom-spec-${index}`}
                  className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <input
                    type="text"
                    value={row.label}
                    maxLength={80}
                    onChange={(event) =>
                      updateSpecification(index, { label: event.target.value })
                    }
                    placeholder="Name, e.g. Fabric Finish"
                    className={inputClass}
                  />

                  <input
                    type="text"
                    value={row.value}
                    maxLength={120}
                    onChange={(event) =>
                      updateSpecification(index, { value: event.target.value })
                    }
                    placeholder="Value, e.g. Brushed"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    aria-label={`Remove specification ${row.label || index + 1}`}
                    className="grid size-10 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                  >
                    <FiX size={17} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}