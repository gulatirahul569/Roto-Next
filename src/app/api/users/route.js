import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { connectDatabase } from "../../../lib/db";
import User from "../../../models/User";
import Order from "../../../models/Order";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request);
    await connectDatabase();

    const users = await User.find().select("-password").lean();

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({
          userId: user._id,
        });

        return {
          ...user,
          orderCount,
        };
      })
    );

    return NextResponse.json(usersWithOrders, {
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