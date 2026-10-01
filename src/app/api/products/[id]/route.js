import mongoose from "mongoose";
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

function createCategorySlug(value = "") {
  return createSlug(value) || "all";
}

function stringValue(value = "") {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrDefault(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
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

function isValidProductId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function getDepartment(value, fallback = "ALL") {
  const department = String(value || fallback)
    .trim()
    .toUpperCase();

  return VALID_DEPARTMENTS.includes(department)
    ? department
    : fallback;
}

function getSubcategory(value) {
  return createSlug(value);
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!isValidProductId(id)) {
      return NextResponse.json(
        {
          message: "Invalid product ID.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    const product = await Product.findOne({
      _id: id,
      isActive: {
        $ne: false,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        product,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Unable to load product.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin(request);

    const { id } = await params;

    if (!isValidProductId(id)) {
      return NextResponse.json(
        {
          message: "Invalid product ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    await connectDatabase();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    const source = VALID_SOURCES.includes(body.source)
      ? body.source
      : product.source || "INVENTORY";

    const requestedPurchaseMode =
      body.purchaseMode === "EXTERNAL_LINK"
        ? "EXTERNAL_LINK"
        : "CHECKOUT";

    const purchaseMode =
      source === "AMAZON"
        ? "EXTERNAL_LINK"
        : requestedPurchaseMode;

    const name = stringValue(body.name || body.title || product.name);

    const slug = createSlug(body.slug || name || product.slug);

    const category = stringValue(body.category || product.category);

    const department = getDepartment(
      body.department,
      product.department || "ALL",
    );

    const subcategory = getSubcategory(
      body.subcategory ?? product.subcategory,
    );

    const externalUrl =
      purchaseMode === "EXTERNAL_LINK"
        ? stringValue(body.externalUrl)
        : "";

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
          message: "Please enter a valid external product URL.",
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

    const image = stringValue(body.image || product.image);

    if (!image) {
      return NextResponse.json(
        {
          message: "A main product image URL is required.",
        },
        {
          status: 400,
        },
      );
    }

    const requestedImages = Array.isArray(body.images)
      ? body.images
      : product.images || [];

    const images = Array.from(
      new Set(
        [image, ...requestedImages]
          .map((item) => stringValue(item))
          .filter(Boolean),
      ),
    );

    const isExternalProduct = purchaseMode === "EXTERNAL_LINK";

    product.name = name;
    product.slug = slug;

    product.description = stringValue(body.description);
    product.shortDescription = stringValue(body.shortDescription);
    product.brand = stringValue(body.brand);

    product.category = category;

    product.newCategory =
      stringValue(body.newCategory) || createCategorySlug(category);

    product.department = department;
    product.subcategory = subcategory;

    product.rating = Math.max(
      0,
      Math.min(5, numberOrDefault(body.rating, product.rating || 0)),
    );

    product.image = image;
    product.images = images;

    product.currency = "INR";

    product.isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : product.isActive;

    product.isFeatured =
      typeof body.isFeatured === "boolean"
        ? body.isFeatured
        : product.isFeatured;

    product.source = source;
    product.purchaseMode = purchaseMode;

    product.price = isExternalProduct
      ? 0
      : Math.max(0, numberOrDefault(body.price, product.price || 0));

    product.compareAtPrice =
      isExternalProduct || !body.compareAtPrice
        ? null
        : Math.max(0, numberOrDefault(body.compareAtPrice));

    product.stock = isExternalProduct
      ? 0
      : Math.max(
          0,
          Math.floor(numberOrDefault(body.stock, product.stock || 0)),
        );

    product.externalUrl = isExternalProduct ? externalUrl : "";

    product.externalButtonText =
      source === "AMAZON"
        ? "Explore on Amazon"
        : isExternalProduct
          ? stringValue(body.externalButtonText) || "Explore Product"
          : "";

    product.vendor = {
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
                body.vendorProductId,
            )
          : "",

      vendorUrl:
        source === "VENDOR"
          ? stringValue(body.vendor?.vendorUrl || body.vendorUrl)
          : "",

      lastSyncedAt: product.vendor?.lastSyncedAt || null,
    };

    product.amazon = {
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
    };

    await product.save();

    return NextResponse.json(
      {
        message: "Product updated successfully.",
        product,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

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
        message: error.message || "Unable to update product.",
      },
      {
        status: error.status || 500,
      },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin(request);

    const { id } = await params;

    if (!isValidProductId(id)) {
      return NextResponse.json(
        {
          message: "Invalid product ID.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Product deleted successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Unable to delete product.",
      },
      {
        status: error.status || 500,
      },
    );
  }
}