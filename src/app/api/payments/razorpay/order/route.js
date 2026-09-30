import { NextResponse } from "next/server";
import { requireUser } from "../../../../../../lib/auth";
import razorpayInstance from "../../../../../../lib/razorpay";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireUser(request);

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          message: "Invalid amount",
        },
        {
          status: 400,
        }
      );
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    return NextResponse.json(
      {
        success: true,
        order,
        key: process.env.RAZORPAY_KEY_ID,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);

    return NextResponse.json(
      {
        message: error.status
          ? error.message
          : "Failed to create Razorpay order",
      },
      {
        status: error.status || 500,
      }
    );
  }
}