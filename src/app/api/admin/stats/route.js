import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { connectDatabase } from "../../../../lib/db";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";
import User from "../../../../models/User";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request);
    await connectDatabase();

    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const users = await User.countDocuments();

    const allOrders = await Order.find();

    const revenue = allOrders.reduce(
      (accumulator, order) => accumulator + order.total,
      0
    );

    const pendingOrders = await Order.countDocuments({
      status: "Pending",
    });

    const shippedOrders = await Order.countDocuments({
      status: "Shipped",
    });

    const deliveredOrders = await Order.countDocuments({
      status: "Delivered",
    });

    const productMap = {};

    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productMap[item.name]) {
          productMap[item.name] = 0;
        }

        productMap[item.name] += item.price * item.quantity;
      });
    });

    const topProducts = Object.keys(productMap)
      .map((name) => ({
        name,
        sales: productMap[name],
      }))
      .sort((firstProduct, secondProduct) => {
        return secondProduct.sales - firstProduct.sales;
      })
      .slice(0, 5);

    return NextResponse.json(
      {
        products,
        orders,
        users,
        revenue,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        topProducts,
        recentOrders: allOrders.slice(-5).reverse(),
        revenueChart: [
          {
            month: "Jan",
            revenue: 0,
          },
          {
            month: "Feb",
            revenue: 0,
          },
          {
            month: "Mar",
            revenue,
          },
        ],
      },
      {
        status: 200,
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