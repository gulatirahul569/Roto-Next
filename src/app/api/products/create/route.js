import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { connectDatabase } from "../../../../lib/db";
import Product from "../../../../models/Product";

export const runtime = "nodejs";

function createSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createCategorySlug(value = "") {
  const slug = createSlug(value);
  return slug || "all";
}

function numberOrDefault(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringValue(value = "") {
  return typeof value === "string" ? value.trim() : "";
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

    return [
      "amazon.in",
      "www.amazon.in",
      "amzn.in",
      "amzn.to",
    ].includes(hostname);
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    await requireAdmin(request);

    const body = await request.json();

    const source = ["INVENTORY", "VENDOR", "AMAZON"].includes(body.source)
      ? body.source
      : "INVENTORY";

    const requestedPurchaseMode =
      body.purchaseMode === "EXTERNAL_LINK"
        ? "EXTERNAL_LINK"
        : "CHECKOUT";

    const purchaseMode =
      source === "AMAZON"
        ? "EXTERNAL_LINK"
        : requestedPurchaseMode;

    const name = stringValue(body.name || body.title);
    const slug = createSlug(body.slug || name);
    const category = stringValue(body.category);
    const externalUrl = stringValue(body.externalUrl);

    if (!name) {
      return NextResponse.json(
        {
          message: "Product name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          message: "A valid product slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          message: "Product category is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (purchaseMode === "EXTERNAL_LINK" && !externalUrl) {
      return NextResponse.json(
        {
          message: "An external product URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (purchaseMode === "EXTERNAL_LINK" && !isValidUrl(externalUrl)) {
      return NextResponse.json(
        {
          message: "Please provide a valid external product URL.",
        },
        {
          status: 400,
        }
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
        }
      );
    }

    const primaryImage = stringValue(body.image);

    if (!primaryImage) {
      return NextResponse.json(
        {
          message: "A main product image URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    const additionalImages = Array.isArray(body.images)
      ? body.images
          .map((image) => stringValue(image))
          .filter(Boolean)
      : [];

    const images = Array.from(
      new Set([primaryImage, ...additionalImages])
    );

    const productData = {
      name,
      slug,
      description: stringValue(body.description),
      shortDescription: stringValue(body.shortDescription),
      brand: stringValue(body.brand),
      category,
      newCategory: stringValue(body.newCategory) || createCategorySlug(category),
      rating: Math.max(
        0,
        Math.min(5, numberOrDefault(body.rating, 0))
      ),

      image: primaryImage,
      images,

      currency: "INR",
      isActive: body.isActive !== false,
      isFeatured: body.isFeatured === true,

      source,
      purchaseMode,

      price:
        purchaseMode === "EXTERNAL_LINK"
          ? 0
          : Math.max(0, numberOrDefault(body.price, 0)),

      compareAtPrice:
        purchaseMode === "EXTERNAL_LINK" || !body.compareAtPrice
          ? null
          : Math.max(0, numberOrDefault(body.compareAtPrice, 0)),

      stock:
        purchaseMode === "EXTERNAL_LINK"
          ? 0
          : Math.max(0, Math.floor(numberOrDefault(body.stock, 0))),

      externalUrl:
        purchaseMode === "EXTERNAL_LINK"
          ? externalUrl
          : "",

      externalButtonText:
        source === "AMAZON"
          ? "Explore on Amazon"
          : purchaseMode === "EXTERNAL_LINK"
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
            ? stringValue(
                body.vendor?.vendorProductId ||
                  body.vendorProductId
              )
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
          source === "AMAZON"
            ? stringValue(body.amazon?.associateTag)
            : "",
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
      }
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
        }
      );
    }

    return NextResponse.json(
      {
        message: error.message || "Unable to create product.",
      },
      {
        status: error.status || 500,
      }
    );
  }
}