import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../../../../lib/db";
import { createToken } from "../../../../lib/auth";
import User from "../../../../models/User";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "All fields required",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 400,
        }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        {
          message: "Wrong password",
        },
        {
          status: 400,
        }
      );
    }

    const token = createToken(user._id);

    return NextResponse.json(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}