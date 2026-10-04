import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { connectDatabase } from "../../../../lib/db";
import Media from "../../../../models/Media";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedFolders = [
  "products/",
  "categories/",
  "banners/",
  "logos/",
  "promos/",
  "home/categories/",
];

function getClientPayload(clientPayload) {
  if (!clientPayload) {
    throw new Error("Not authorized");
  }

  try {
    const payload = JSON.parse(clientPayload);

    if (!payload?.token) {
      throw new Error("Not authorized");
    }

    return payload;
  } catch {
    throw new Error("Invalid upload authorization");
  }
}

function isAllowedDestination(destination) {
  return allowedFolders.some((folder) => destination.startsWith(folder));
}

function getMediaType(destination) {
  if (destination.startsWith("banners/")) {
    return "banner";
  }

  if (destination.startsWith("categories/")) {
    return "subcategory";
  }

  if (destination.startsWith("home/categories/")) {
    return "category-showcase";
  }

  if (destination.startsWith("products/")) {
    return "product";
  }

  if (destination.startsWith("logos/")) {
    return "logo";
  }

  if (destination.startsWith("promos/")) {
    return "promo";
  }

  return "other";
}

export async function POST(request) {
  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = getClientPayload(clientPayload);

        const token = payload.token;

        const destination = String(payload.destination || "")
          .trim()
          .replace(/^\/+/, "")
          .replace(/\s+/g, "-")
          .toLowerCase();

        const mediaType = String(payload.mediaType || "")
          .trim()
          .toLowerCase();

        if (!destination) {
          throw new Error("Missing media destination.");
        }

        throw new Error(
          "Invalid upload destination. Choose a supported media location.",
        );
        /*
          Security check:
          The Blob pathname must match the destination generated
          by Admin Media Library.
        */
        const safeDestinationPrefix = `${destination}.`;

        if (
          pathname !== `${destination}.webp` &&
          !pathname.startsWith(safeDestinationPrefix)
        ) {
          throw new Error(
            "Blob upload path does not match selected media destination.",
          );
        }

        const authRequest = new Request(request.url, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const admin = await requireAdmin(authRequest);

        if (admin.role !== "admin") {
          throw new Error("Admin access required.");
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_SIZE,
          addRandomSuffix: true,

          /*
            This payload is available after the direct Blob upload
            completes. It is used to save the Blob URL in MongoDB.
          */
          tokenPayload: JSON.stringify({
            userId: admin._id.toString(),
            role: admin.role,
            destination,
            mediaType: mediaType || getMediaType(destination),
          }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const uploadInfo = JSON.parse(tokenPayload || "{}");

          const destination = String(uploadInfo.destination || "")
            .trim()
            .toLowerCase();

          const mediaType = String(uploadInfo.mediaType || "other")
            .trim()
            .toLowerCase();

          if (!destination) {
            throw new Error("Upload completed without a media destination.");
          }

          if (!isAllowedDestination(destination)) {
            throw new Error(
              "Upload completed with an invalid media destination.",
            );
          }

          if (uploadInfo.role !== "admin") {
            throw new Error("Admin access required.");
          }

          await connectDatabase();

          const savedMedia = await Media.findOneAndUpdate(
            {
              key: destination,
            },
            {
              $set: {
                imageUrl: blob.url,
                type: mediaType,
              },
            },
            {
              new: true,
              upsert: true,
              runValidators: true,
            },
          );

          console.log("Device media saved to MongoDB:", {
            key: savedMedia.key,
            type: savedMedia.type,
            imageUrl: savedMedia.imageUrl,
            uploadedBy: uploadInfo.userId,
          });
        } catch (error) {
          console.error("DEVICE MEDIA MONGODB SAVE ERROR:", error);

          throw error;
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
