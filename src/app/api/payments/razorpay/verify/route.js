import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "../../../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireUser(request);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing payment fields",
        },
        {
          status: 400,
        }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("RAZORPAY VERIFY ERROR:", error);

    return NextResponse.json(
      {
        message: error.status
          ? error.message
          : "Payment verification error",
      },
      {
        status: error.status || 500,
      }
    );
  }
}