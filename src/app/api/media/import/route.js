import { NextResponse } from "next/server";
import { putImage } from "@vercel/blob";
import { connectDatabase } from "../../../../lib/db";
import Media from "../../../../models/Media";
export const runtime = "nodejs";

const allowedFolders = ["products/", "categories/", "banners/", "logos/"];

const allowedHosts = ["images.pexels.com"];

function isAllowedDestination(destination) {
  return allowedFolders.some((folder) => destination.startsWith(folder));
}

function getSafeFileName(value = "store-image") {
  return (
    String(value)
      .toLowerCase()
      .trim()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "store-image"
  );
}

function getMediaType(destination) {
  if (destination.startsWith("banners/")) {
    return "banner";
  }

  if (destination.startsWith("categories/")) {
    return "subcategory";
  }

  if (destination.startsWith("products/")) {
    return "product";
  }

  if (destination.startsWith("logos/")) {
    return "logo";
  }

  return "other";
}

function getImageOptions(destination) {
  if (destination.startsWith("banners/")) {
    return {
      width: 1920,
      quality: 76,
    };
  }

  if (destination.startsWith("products/")) {
    return {
      width: 1400,
      quality: 78,
    };
  }

  if (destination.startsWith("logos/")) {
    return {
      width: 800,
      quality: 82,
    };
  }

  return {
    width: 1200,
    quality: 76,
  };
}

export async function POST(request) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized request.",
        },
        {
          status: 401,
        },
      );
    }

    /*
      IMPORTANT:
      Add the same JWT/admin verification logic that is already
      used in src/app/api/blob/upload/route.js.

      This endpoint must verify that token belongs to an admin.
    */

    const body = await request.json();

    const imageUrl = String(body.imageUrl || "").trim();

    const destination = String(body.destination || "")
      .trim()
      .replace(/^\/+/, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    if (!imageUrl || !destination) {
      return NextResponse.json(
        {
          message: "Image URL and destination are required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isAllowedDestination(destination)) {
      return NextResponse.json(
        {
          message:
            "Destination must begin with products/, categories/, banners/, or logos/.",
        },
        {
          status: 400,
        },
      );
    }

    let sourceUrl;

    try {
      sourceUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        {
          message: "Please enter a valid direct image URL.",
        },
        {
          status: 400,
        },
      );
    }

    if (sourceUrl.protocol !== "https:") {
      return NextResponse.json(
        {
          message: "Only secure HTTPS image URLs are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    if (!allowedHosts.includes(sourceUrl.hostname)) {
      return NextResponse.json(
        {
          message:
            "Only direct images.pexels.com image URLs are currently supported.",
        },
        {
          status: 400,
        },
      );
    }

    const destinationParts = destination.split("/");
    const rawFileName = destinationParts.pop();
    const folder = destinationParts.join("/");
    const safeFileName = getSafeFileName(rawFileName);

    const pathname = `${folder}/${safeFileName}.webp`;

    const imageOptions = getImageOptions(destination);

    const blob = await putImage(pathname, sourceUrl, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      optimizeImage: {
        width: imageOptions.width,
        quality: imageOptions.quality,
        format: "webp",
      },
    });

    await connectDatabase();

    const mediaType = getMediaType(destination);

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

    return NextResponse.json(
      {
        imageUrl: savedMedia.imageUrl,
        pathname: blob.pathname,
        key: savedMedia.key,
        type: savedMedia.type,
        originalSize: 0,
        compressedSize: 0,
      },
      {
        status: 200,
      },
    );
    return NextResponse.json(
      {
        imageUrl: blob.url,
        pathname: blob.pathname,
        originalSize: 0,
        compressedSize: 0,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("EXTERNAL IMAGE IMPORT ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Unable to import and optimize this image.",
      },
      {
        status: 500,
      },
    );
  }
}
