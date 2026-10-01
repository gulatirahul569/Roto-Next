import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getTokenFromClientPayload(clientPayload) {
  if (!clientPayload) {
    throw new Error("Not authorized");
  }

  try {
    const payload = JSON.parse(clientPayload);

    if (!payload?.token) {
      throw new Error("Not authorized");
    }

    return payload.token;
  } catch {
    throw new Error("Invalid upload authorization");
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const token = getTokenFromClientPayload(clientPayload);

        const authRequest = new Request(request.url, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const admin = await requireAdmin(authRequest);

        if (!pathname.startsWith("products/")) {
          throw new Error("Invalid upload destination");
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_SIZE,
          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            userId: admin._id.toString(),
            role: admin.role,
          }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const uploadInfo = JSON.parse(tokenPayload || "{}");

          console.log("Product image uploaded to Vercel Blob:", {
            url: blob.url,
            pathname: blob.pathname,
            uploadedBy: uploadInfo.userId,
          });
        } catch (error) {
          console.error("Blob upload completion error:", error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Vercel Blob upload authorization error:", error);

    return NextResponse.json(
      {
        message: error.message || "Unable to authorize image upload.",
      },
      {
        status: error.status || 400,
      },
    );
  }
}