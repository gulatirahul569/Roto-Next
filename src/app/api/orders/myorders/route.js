import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { connectDatabase } from "../../../../lib/db";
import Order from "../../../../models/Order";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const user = await requireUser(request);

    await connectDatabase();

    const orders = await Order.find({
      userId: user._id,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(orders, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: error.status || 500,
      }
    );
  }
}