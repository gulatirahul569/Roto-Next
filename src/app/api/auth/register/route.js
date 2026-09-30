import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../../../../lib/db";
import { createToken } from "../../../../lib/auth";
import User from "../../../../models/User";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    await connectDatabase();

    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json(
        {
          message: "User already exists",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

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
    console.error("REGISTER ERROR:", error);

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