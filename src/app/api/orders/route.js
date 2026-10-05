import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "../../../lib/auth";
import { connectDatabase } from "../../../lib/db";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import "../../../models/User";

export const runtime = "nodejs";

function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function toQuantity(value) {
  const quantity = Math.floor(Number(value));

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

/*
  Turns the cart items from the client into order items.
  Adds productId and selectedSize so each ordered size is stored.
*/
function normalizeItems(items) {
  return items.map((item) => ({
    productId: String(item.productId || item._id || ""),
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: toQuantity(item.quantity),
    selectedSize: String(item.selectedSize || "").trim(),
  }));
}

async function restoreSizeStock(reservedItems) {
  for (const item of reservedItems) {
    await Product.updateOne(
      {
        _id: item.productId,
        "sizes.label": item.selectedSize,
      },
      {
        $inc: {
          "sizes.$.stock": item.quantity,
          stock: item.quantity,
        },
      }
    );
  }
}

/*
  Checks and reduces stock for products that have sizes.

  Each reduction is one atomic update that only succeeds while the chosen
  size still has enough stock, so two customers cannot buy the last item.
  If any item fails, everything reduced so far is restored.
*/
async function reserveSizeStock(items) {
  const reservedItems = [];

  try {
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        throw createHttpError("A product in your bag is invalid.", 400);
      }

      if (item.quantity < 1) {
        throw createHttpError("Invalid quantity in your bag.", 400);
      }

      const product = await Product.findById(item.productId)
        .select("name sizes")
        .lean();

      if (!product) {
        if (item.selectedSize) {
          throw createHttpError(
            `${item.name || "A product"} is no longer available.`,
            404
          );
        }

        continue;
      }

      const hasSizes =
        Array.isArray(product.sizes) && product.sizes.length > 0;

      // Products without sizes keep their existing behaviour.
      if (!hasSizes) {
        continue;
      }

      if (!item.selectedSize) {
        throw createHttpError(
          `Please select a size for ${product.name}.`,
          400
        );
      }

      const result = await Product.updateOne(
        {
          _id: product._id,
          sizes: {
            $elemMatch: {
              label: item.selectedSize,
              stock: { $gte: item.quantity },
            },
          },
        },
        {
          $inc: {
            "sizes.$.stock": -item.quantity,
            stock: -item.quantity,
          },
        }
      );

      if (result.modifiedCount !== 1) {
        throw createHttpError(
          `Size ${item.selectedSize} of ${product.name} does not have enough stock.`,
          409
        );
      }

      reservedItems.push(item);
    }
  } catch (error) {
    await restoreSizeStock(reservedItems);
    throw error;
  }

  return reservedItems;
}

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

    const orderItems = normalizeItems(items);

    const reservedItems = await reserveSizeStock(orderItems);

    try {
      const newOrder = new Order({
        userId: user._id,
        items: orderItems,
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
    } catch (saveError) {
      await restoreSizeStock(reservedItems);
      throw saveError;
    }
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