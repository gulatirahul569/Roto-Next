/*
  Product details templates.

  Each department (and optionally each subcategory) has a list of
  specification fields. A field with `options` becomes a dropdown in Admin,
  a field without `options` becomes a normal text box.

  Subcategory keys must match your subcategory slugs
  (for example "t-shirts", "shirts", "pants"). A department's `default`
  list is used when a subcategory has no template of its own.

  Admins can always add extra specifications and extra headings for a
  single product, even if they are not in this file.
*/

export const defaultSectionTitles = [
  "Product Design Details",
  "Size & Fit",
  "Material & Care",
];

const sleeveLength = {
  label: "Sleeve Length",
  options: [
    "Short Sleeves",
    "Long Sleeves",
    "Three-Quarter Sleeves",
    "Sleeveless",
  ],
};

const neck = {
  label: "Neck",
  options: [
    "Round Neck",
    "V-Neck",
    "Polo Collar",
    "Henley Neck",
    "Hooded",
    "Mock Neck",
  ],
};

const fit = {
  label: "Fit",
  options: [
    "Regular Fit",
    "Slim Fit",
    "Relaxed Fit",
    "Oversized Fit",
    "Skinny Fit",
  ],
};

const pattern = {
  label: "Pattern",
  options: [
    "Solid",
    "Printed",
    "Graphic Print",
    "Striped",
    "Checked",
    "Colourblocked",
  ],
};

const occasion = {
  label: "Occasion",
  options: ["Casual", "Sports", "Lounge", "Formal", "Party"],
};

const netQuantity = {
  label: "Net Quantity",
  options: ["1", "2", "3", "4", "5"],
};

const length = {
  label: "Length",
  options: ["Regular", "Cropped", "Longline"],
};

export const specificationTemplates = {
  MEN: {
    default: [sleeveLength, neck, fit, pattern, occasion, netQuantity],

    "t-shirts": [
      sleeveLength,
      neck,
      fit,
      length,
      { label: "Type", options: ["Pullover", "Zip-Up", "Button-Up"] },
      { label: "Hemline", options: ["Ribbed", "Straight", "Curved"] },
      pattern,
      occasion,
      netQuantity,
    ],

    shirts: [
      sleeveLength,
      {
        label: "Collar",
        options: [
          "Spread Collar",
          "Button-Down Collar",
          "Mandarin Collar",
          "Cutaway Collar",
        ],
      },
      fit,
      pattern,
      occasion,
      { label: "Placket", options: ["Button Placket", "Concealed Placket"] },
      netQuantity,
    ],

    pants: [
      fit,
      {
        label: "Rise",
        options: ["Low-Rise", "Mid-Rise", "High-Rise"],
      },
      {
        label: "Closure",
        options: ["Button & Zip", "Drawstring", "Elasticated Waist"],
      },
      { label: "Length", options: ["Regular", "Cropped", "Ankle Length"] },
      pattern,
      netQuantity,
    ],
  },

  WOMEN: {
    default: [sleeveLength, neck, fit, length, pattern, occasion, netQuantity],
  },

  KIDS: {
    default: [
      {
        label: "Age Group",
        options: [
          "0-12 Months",
          "1-3 Years",
          "4-6 Years",
          "7-10 Years",
          "11-14 Years",
        ],
      },
      sleeveLength,
      fit,
      pattern,
      netQuantity,
    ],
  },

  HOME: {
    default: [
      { label: "Material" },
      { label: "Colour" },
      { label: "Dimensions" },
      { label: "Pack Of", options: ["1", "2", "3", "4", "6"] },
    ],
  },

  ACCESSORIES: {
    default: [
      { label: "Material" },
      { label: "Colour" },
      { label: "Closure" },
      netQuantity,
    ],
  },
};

export function getSpecificationTemplate(department = "ALL", subcategory = "") {
  const departmentKey = String(department || "").toUpperCase();
  const subcategoryKey = String(subcategory || "").toLowerCase();

  const group = specificationTemplates[departmentKey];

  if (!group) {
    return [];
  }

  return group[subcategoryKey] || group.default || [];
}

/*
  Builds the specification rows shown in Admin.

  - Fields from the template come first (dropdowns when they have options).
  - Anything the admin typed that is not in the template stays as a custom row.

  Used when a product is opened for editing, and again whenever the
  department or subcategory changes, so typed values are never lost.
*/
export function buildSpecificationRows(department, subcategory, current = []) {
  const currentRows = Array.isArray(current) ? current : [];
  const template = getSpecificationTemplate(department, subcategory);

  const usedRows = new Set();

  const templateRows = template.map((field) => {
    const existing = currentRows.find(
      (row) =>
        String(row?.label || "").trim().toLowerCase() ===
        field.label.toLowerCase(),
    );

    if (existing) {
      usedRows.add(existing);
    }

    const value = existing ? String(existing.value || "") : "";
    const options = field.options || [];

    return {
      label: field.label,
      value,
      options,
      isTemplate: true,
      isOther: Boolean(value) && options.length > 0 && !options.includes(value),
    };
  });

  const customRows = currentRows
    .filter((row) => !usedRows.has(row))
    .filter(
      (row) =>
        String(row?.label || "").trim() || String(row?.value || "").trim(),
    )
    .map((row) => ({
      label: String(row.label || ""),
      value: String(row.value || ""),
      options: [],
      isTemplate: false,
      isOther: false,
    }));

  return [...templateRows, ...customRows];
}

/*
  Heading rows. A product without saved headings starts with the
  default three headings, ready to fill in.
*/
export function buildSectionRows(saved = []) {
  const rows = Array.isArray(saved)
    ? saved.filter(Boolean).map((section) => ({
        title: String(section.title || ""),
        content: String(section.content || ""),
      }))
    : [];

  return rows.length > 0
    ? rows
    : defaultSectionTitles.map((title) => ({ title, content: "" }));
}

/*
  Removes empty rows and the Admin-only helper fields before saving.
*/
export function cleanProductDetails(sections = [], specifications = []) {
  const detailSections = (Array.isArray(sections) ? sections : [])
    .map((section) => ({
      title: String(section?.title || "").trim(),
      content: String(section?.content || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n"),
    }))
    .filter((section) => section.title && section.content);

  const cleanedSpecifications = (
    Array.isArray(specifications) ? specifications : []
  )
    .map((row) => ({
      label: String(row?.label || "").trim(),
      value: String(row?.value || "").trim(),
    }))
    .filter((row) => row.label && row.value);

  return {
    detailSections,
    specifications: cleanedSpecifications,
  };
}