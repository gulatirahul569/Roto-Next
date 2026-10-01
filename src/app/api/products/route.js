import { NextResponse } from "next/server";
import { connectDatabase } from "../../../lib/db";
import Product from "../../../models/Product";

export const runtime = "nodejs";

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const department = searchParams.get("department")?.trim();
    const subcategory = searchParams.get("subcategory")?.trim();
    const source = searchParams.get("source")?.trim();

    /*
      Customers only receive products that are active.

      $ne: false also keeps legacy products visible until the migration
      writes explicit isActive: true into every existing record.
    */
    const filter = {
      isActive: {
        $ne: false,
      },
    };

    if (search) {
      const safeSearch = escapeRegex(search);

      filter.$or = [
        {
          name: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          category: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          department: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          subcategory: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    /*
      Supports older category pages such as:

      /api/products?category=bags
    */
    if (category && category.toLowerCase() !== "all") {
      filter.newCategory = category.toLowerCase();
    }

    /*
      New department routes:

      /api/products?department=MEN
      /api/products?department=MEN&subcategory=t-shirts
    */
    const validDepartments = [
      "ALL",
      "MEN",
      "WOMEN",
      "KIDS",
      "HOME",
      "ACCESSORIES",
    ];

    const normalizedDepartment = department?.toUpperCase();

    if (
      normalizedDepartment &&
      normalizedDepartment !== "ALL" &&
      validDepartments.includes(normalizedDepartment)
    ) {
      filter.department = normalizedDepartment;
    }

    if (subcategory) {
      filter.subcategory = subcategory.toLowerCase();
    }

    if (["INVENTORY", "VENDOR", "AMAZON"].includes(source)) {
      filter.source = source;
    }

    const products = await Product.find(filter)
      .sort({
        isFeatured: -1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json(products, {
      status: 200,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Unable to load products.",
      },
      {
        status: 500,
      },
    );
  }
}