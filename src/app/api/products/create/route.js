import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { connectDatabase } from "../../../../lib/db";
import Product from "../../../../models/Product";

export const runtime = "nodejs";

const VALID_SOURCES = ["INVENTORY", "VENDOR", "AMAZON"];

const VALID_DEPARTMENTS = [
  "ALL",
  "MEN",
  "WOMEN",
  "KIDS",
  "HOME",
  "ACCESSORIES",
];

function createSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stringValue(value = "") {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrDefault(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}
function cleanDetailSections(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((section) => ({
      title: stringValue(section?.title).slice(0, 80),
      content:
        typeof section?.content === "string"
          ? section.content
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .slice(0, 30)
              .join("\n")
          : "",
    }))
    .filter((section) => section.title && section.content)
    .slice(0, 12);
}

function cleanSpecifications(value) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Map(
      value
        .map((row) => ({
          label: stringValue(row?.label).slice(0, 80),
          value: stringValue(row?.value).slice(0, 120),
        }))
        .filter((row) => row.label && row.value)
        .map((row) => [row.label.toLowerCase(), row]),
    ).values(),
  ).slice(0, 40);
}

function isValidUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isAmazonUrl(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();

    return ["amazon.in", "www.amazon.in", "amzn.in", "amzn.to"].includes(
      hostname,
    );
  } catch {
    return false;
  }
}

function createCategorySlug(value = "") {
  return createSlug(value) || "all";
}

function getDepartment(value) {
  const department = String(value || "ALL")
    .trim()
    .toUpperCase();

  return VALID_DEPARTMENTS.includes(department) ? department : "ALL";
}

function getSubcategory(value) {
  return createSlug(value);
}

export async function POST(request) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const source = VALID_SOURCES.includes(body.source)
      ? body.source
      : "INVENTORY";

    const requestedPurchaseMode =
      body.purchaseMode === "EXTERNAL_LINK" ? "EXTERNAL_LINK" : "CHECKOUT";

    const purchaseMode =
      source === "AMAZON" ? "EXTERNAL_LINK" : requestedPurchaseMode;

    const name = stringValue(body.name || body.title);
    const slug = createSlug(body.slug || name);
    const category = stringValue(body.category);
    const department = getDepartment(body.department);
    const subcategory = getSubcategory(body.subcategory);

    const externalUrl = stringValue(body.externalUrl);
    const primaryImage = stringValue(body.image);

    if (!name) {
      return NextResponse.json(
        {
          message: "Product name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          message: "A valid product slug is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          message: "Product category is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (department !== "ALL" && !subcategory) {
      return NextResponse.json(
        {
          message: "Please select a subcategory for this department.",
        },
        {
          status: 400,
        },
      );
    }

    if (!primaryImage) {
      return NextResponse.json(
        {
          message: "A main product image URL is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (purchaseMode === "EXTERNAL_LINK" && !externalUrl) {
      return NextResponse.json(
        {
          message: "An external product URL is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (purchaseMode === "EXTERNAL_LINK" && !isValidUrl(externalUrl)) {
      return NextResponse.json(
        {
          message: "Please provide a valid external product URL.",
        },
        {
          status: 400,
        },
      );
    }

    if (source === "AMAZON" && !isAmazonUrl(externalUrl)) {
      return NextResponse.json(
        {
          message:
            "Amazon products must use a valid Amazon.in, amzn.in, or amzn.to affiliate link.",
        },
        {
          status: 400,
        },
      );
    }

    const additionalImages = Array.isArray(body.images)
      ? body.images.map((image) => stringValue(image)).filter(Boolean)
      : [];

    const images = Array.from(new Set([primaryImage, ...additionalImages]));

    const isExternalProduct = purchaseMode === "EXTERNAL_LINK";

    const sizes = Array.isArray(body.sizes)
      ? Array.from(
          new Map(
            body.sizes
              .map((size) => ({
                label: stringValue(size?.label),
                stock: Math.max(0, Math.floor(numberOrDefault(size?.stock, 0))),
              }))
              .filter((size) => size.label)
              .map((size) => [size.label.toLowerCase(), size]),
          ).values(),
        )
      : [];

    const productSizes = isExternalProduct ? [] : sizes;

    const productData = {
      name,
      slug,

      description: stringValue(body.description),
      shortDescription: stringValue(body.shortDescription),
      brand: stringValue(body.brand),

      category,
      newCategory:
        stringValue(body.newCategory) || createCategorySlug(category),

      department,
      subcategory,

      rating: Math.max(0, Math.min(5, numberOrDefault(body.rating, 0))),

      image: primaryImage,
      images,

      currency: "INR",

      isActive: body.isActive !== false,
      isFeatured: body.isFeatured === true,

      source,
      purchaseMode,

      price: isExternalProduct
        ? 0
        : Math.max(0, numberOrDefault(body.price, 0)),

      compareAtPrice:
        isExternalProduct || !body.compareAtPrice
          ? null
          : Math.max(0, numberOrDefault(body.compareAtPrice, 0)),

      detailSections: cleanDetailSections(body.detailSections),
      specifications: cleanSpecifications(body.specifications),

      sizes: productSizes,

      stock: isExternalProduct
        ? 0
        : productSizes.length > 0
          ? productSizes.reduce((total, size) => total + size.stock, 0)
          : Math.max(0, Math.floor(numberOrDefault(body.stock, 0))),

      externalUrl: isExternalProduct ? externalUrl : "",

      externalButtonText:
        source === "AMAZON"
          ? "Explore on Amazon"
          : isExternalProduct
            ? stringValue(body.externalButtonText) || "Explore Product"
            : "",

      vendor: {
        name:
          source === "VENDOR"
            ? stringValue(body.vendor?.name || body.vendorName)
            : "",

        sku:
          source === "VENDOR"
            ? stringValue(body.vendor?.sku || body.vendorSku)
            : "",

        vendorProductId:
          source === "VENDOR"
            ? stringValue(body.vendor?.vendorProductId || body.vendorProductId)
            : "",

        vendorUrl:
          source === "VENDOR"
            ? stringValue(body.vendor?.vendorUrl || body.vendorUrl)
            : "",
      },

      amazon: {
        asin:
          source === "AMAZON"
            ? stringValue(body.amazon?.asin || body.amazonAsin)
                .toUpperCase()
                .replace(/\s/g, "")
            : "",

        associateTag:
          source === "AMAZON" ? stringValue(body.amazon?.associateTag) : "",
      },
    };

    await connectDatabase();

    const product = await Product.create(productData);

    return NextResponse.json(
      {
        message: "Product created successfully.",
        product,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          message:
            "A product with this slug already exists. Please use a different product name or slug.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        message: error.message || "Unable to create product.",
      },
      {
        status: error.status || 500,
      },
    );
  }
}

function cleanDetailSections(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((section) => ({
      title: stringValue(section?.title).slice(0, 80),
      content:
        typeof section?.content === "string"
          ? section.content
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .slice(0, 30)
              .join("\n")
          : "",
    }))
    .filter((section) => section.title && section.content)
    .slice(0, 12);
}

function cleanSpecifications(value) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Map(
      value
        .map((row) => ({
          label: stringValue(row?.label).slice(0, 80),
          value: stringValue(row?.value).slice(0, 120),
        }))
        .filter((row) => row.label && row.value)
        .map((row) => [row.label.toLowerCase(), row]),
    ).values(),
  ).slice(0, 40);
}
