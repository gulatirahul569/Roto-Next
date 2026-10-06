import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { connectDatabase } from "../../../../../lib/db";
import Order from "../../../../../models/Order";
import Product from "../../../../../models/Product";
import Review from "../../../../../models/Review";
import "../../../../../models/User";

export const runtime = "nodejs";

function stringValue(value = "") {
  return typeof value === "string" ? value.trim() : "";
}

function jsonResponse(body, status = 200) {
  return NextResponse.json(body, { status });
}

async function getOptionalUser(request) {
  try {
    return await requireUser(request);
  } catch {
    return null;
  }
}

async function getSummary(productId) {
  const rows = await Review.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  let count = 0;
  let total = 0;

  rows.forEach((row) => {
    distribution[row._id] = row.count;
    count += row.count;
    total += row._id * row.count;
  });

  const average = count > 0 ? Math.round((total / count) * 10) / 10 : 0;

  return { average, count, distribution };
}

/*
  Keeps Product.rating and Product.reviewCount in sync, so product cards
  and the product page always show the real average.
*/
async function syncProductRating(productId) {
  const summary = await getSummary(productId);

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        rating: summary.average,
        reviewCount: summary.count,
      },
    }
  );

  return summary;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid product ID." }, 400);
    }

    await connectDatabase();

    const [reviews, summary, user] = await Promise.all([
      Review.find({ productId: id }).sort({ createdAt: -1 }).limit(100).lean(),
      getSummary(id),
      getOptionalUser(request),
    ]);

    return jsonResponse({
      reviews: reviews.map((review) => ({
        _id: String(review._id),
        userName: review.userName,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        isMine: Boolean(user) && String(review.userId) === String(user._id),
      })),
      summary,
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);

    return jsonResponse(
      { message: error.message || "Unable to load reviews." },
      error.status || 500
    );
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireUser(request);

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid product ID." }, 400);
    }

    const body = await request.json();

    const rating = Math.round(Number(body.rating));

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return jsonResponse({ message: "Please choose a rating from 1 to 5 stars." }, 400);
    }

    const title = stringValue(body.title).slice(0, 120);
    const comment = stringValue(body.comment).slice(0, 1500);

    await connectDatabase();

    const product = await Product.findById(id).select("_id").lean();

    if (!product) {
      return jsonResponse({ message: "Product not found." }, 404);
    }

    const hasPurchased = Boolean(
      await Order.exists({
        userId: user._id,
        "items.productId": String(id),
      })
    );

    const review = await Review.findOneAndUpdate(
      { productId: id, userId: user._id },
      {
        $set: {
          userName: user.name || "Roto customer",
          rating,
          title,
          comment,
          isVerifiedPurchase: hasPurchased,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const summary = await syncProductRating(id);

    return jsonResponse({ message: "Review saved.", review, summary }, 201);
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    return jsonResponse(
      { message: error.message || "Unable to save your review." },
      error.status || 500
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser(request);

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid product ID." }, 400);
    }

    await connectDatabase();

    await Review.deleteOne({ productId: id, userId: user._id });

    const summary = await syncProductRating(id);

    return jsonResponse({ message: "Review deleted.", summary });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);

    return jsonResponse(
      { message: error.message || "Unable to delete your review." },
      error.status || 500
    );
  }
}