import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { connectDatabase } from "../../../../lib/db";
import Order from "../../../../models/Order";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const { status } = await request.json();

    await connectDatabase();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          message: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    order.status = status;

    await order.save();

    return NextResponse.json(order, {
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