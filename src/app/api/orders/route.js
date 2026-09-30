import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "../../../lib/auth";
import { connectDatabase } from "../../../lib/db";
import Order from "../../../models/Order";
import "../../../models/User";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const user = await requireUser(request);

    const {
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      paymentMethod,
      paymentStatus,
      paymentId,
      razorpayOrderId,
    } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          message: "Cart is empty",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const newOrder = new Order({
      userId: user._id,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentStatus || "Pending",
      paymentId: paymentId || "",
      razorpayOrderId: razorpayOrderId || "",
    });

    await newOrder.save();

    return NextResponse.json(
      {
        message: "Order placed successfully",
        order: newOrder,
      },
      {
        status: 201,
      }
    );
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

export async function GET(request) {
  try {
    await requireAdmin(request);
    await connectDatabase();

    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({
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