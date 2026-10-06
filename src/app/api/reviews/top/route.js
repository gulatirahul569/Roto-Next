import { NextResponse } from "next/server";
import { connectDatabase } from "../../../../lib/db";
import Product from "../../../../models/Product";
import Review from "../../../../models/Review";

export const runtime = "nodejs";

function shorten(text = "", maxLength = 260) {
  const value = String(text).trim();

  return value.length > maxLength
    ? `${value.slice(0, maxLength - 3).trimEnd()}...`
    : value;
}

/*
  Home page testimonials.

  "Top" reviews = 4 and 5 star reviews that have written text,
  highest rating first, then newest first.
*/
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = Math.min(
      8,
      Math.max(1, Math.floor(Number(searchParams.get("limit"))) || 4)
    );

    await connectDatabase();

    // Fetch extra so reviews of hidden/deleted products can be skipped.
    const candidates = await Review.find({
      rating: { $gte: 4 },
      comment: { $exists: true, $ne: "" },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 3)
      .lean();

    const productIds = Array.from(
      new Set(candidates.map((review) => String(review.productId)))
    );

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: { $ne: false },
    })
      .select("name")
      .lean();

    const productNames = new Map(
      products.map((product) => [String(product._id), product.name])
    );

    const reviews = candidates
      .filter((review) => productNames.has(String(review.productId)))
      .slice(0, limit)
      .map((review) => ({
        _id: String(review._id),
        userName: review.userName,
        rating: review.rating,
        title: review.title,
        comment: shorten(review.comment),
        isVerifiedPurchase: review.isVerifiedPurchase,
        productId: String(review.productId),
        productName: productNames.get(String(review.productId)),
        createdAt: review.createdAt,
      }));

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error("TOP REVIEWS ERROR:", error);

    return NextResponse.json(
      { message: error.message || "Unable to load reviews." },
      { status: 500 }
    );
  }
}