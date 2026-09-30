import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/auth";
import { connectDatabase } from "../../../lib/db";
import StoreSettings from "../../../models/StoreSettings";

export const runtime = "nodejs";

const defaultSettings = {
  storeName: "Roto",
  shippingCharge: 0,
  taxPercent: 0,
  paymentCOD: true,
  paymentOnline: false,
};

export async function GET(request) {
  try {
    await requireAdmin(request);
    await connectDatabase();

    let settings = await StoreSettings.findOne();

    if (!settings) {
      settings = await StoreSettings.create(defaultSettings);
    }

    return NextResponse.json(settings, {
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

export async function PUT(request) {
  try {
    await requireAdmin(request);

    const {
      storeName,
      shippingCharge,
      taxPercent,
      paymentCOD,
      paymentOnline,
    } = await request.json();

    const normalizedStoreName = String(storeName || "").trim();
    const normalizedShippingCharge = Math.max(
      0,
      Number(shippingCharge || 0)
    );
    const normalizedTaxPercent = Math.min(
      100,
      Math.max(0, Number(taxPercent || 0))
    );

    if (!normalizedStoreName) {
      return NextResponse.json(
        {
          message: "Please enter a store name before saving.",
        },
        {
          status: 400,
        }
      );
    }

    if (!paymentCOD && !paymentOnline) {
      return NextResponse.json(
        {
          message: "Keep at least one payment method enabled.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const settings = await StoreSettings.findOneAndUpdate(
      {},
      {
        storeName: normalizedStoreName,
        shippingCharge: normalizedShippingCharge,
        taxPercent: normalizedTaxPercent,
        paymentCOD: Boolean(paymentCOD),
        paymentOnline: Boolean(paymentOnline),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json(settings, {
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