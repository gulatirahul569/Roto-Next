import { NextResponse } from "next/server";
import { connectDatabase } from "../../../lib/db";
import Product from "../../../models/Product";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    const products = await Product.find(filter);

    return NextResponse.json(products, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}