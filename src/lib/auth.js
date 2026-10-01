import jwt from "jsonwebtoken";
import { connectDatabase } from "./db";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env.local.");
}

export function createToken(userId) {
  return jwt.sign(
    {
      id: userId.toString(),
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function getBearerToken(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.split(" ")[1];
}

export async function requireUser(request) {
  const token = getBearerToken(request);

  if (!token) {
    const error = new Error("Not authorized");
    error.status = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    await connectDatabase();

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }

    return user;
  } catch (error) {
    if (error.status) {
      throw error;
    }

    const authError = new Error("Token failed");
    authError.status = 401;
    throw authError;
  }
}

export async function requireAdmin(request) {
  const user = await requireUser(request);

  if (user.role !== "admin") {
    const error = new Error("Admin access only");
    error.status = 403;
    throw error;
  }

  return user;
}

/*
  This helper is for endpoints that work for both customers and Admins.

  No token:
  → false

  Invalid token:
  → false

  Valid customer token:
  → false

  Valid Admin token:
  → true
*/
export async function isAdminRequest(request) {
  try {
    const user = await requireUser(request);

    return user.role === "admin";
  } catch {
    return false;
  }
}