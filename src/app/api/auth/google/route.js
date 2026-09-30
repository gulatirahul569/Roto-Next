import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectDatabase } from "../../../../lib/db";
import { createToken } from "../../../../lib/auth";
import User from "../../../../models/User";

export const runtime = "nodejs";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        {
          message: "Missing Google credential",
        },
        {
          status: 400,
        }
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    await connectDatabase();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: "google",
      });
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
    console.error("GOOGLE LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Google login failed",
      },
      {
        status: 500,
      }
    );
  }
}