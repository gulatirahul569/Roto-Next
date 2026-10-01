import { NextResponse } from "next/server";
import { connectDatabase } from "../../../lib/db";
import Media from "../../../models/Media";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(request.url);

    const key = String(searchParams.get("key") || "")
      .trim()
      .toLowerCase();

    const prefix = String(searchParams.get("prefix") || "")
      .trim()
      .toLowerCase();

    if (key) {
      const media = await Media.findOne({ key }).lean();

      return NextResponse.json(
        {
          media: media
            ? {
                key: media.key,
                imageUrl: media.imageUrl,
                type: media.type,
                updatedAt: media.updatedAt,
              }
            : null,
        },
        { status: 200 },
      );
    }

    if (prefix) {
      const escapedPrefix = prefix.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      const mediaItems = await Media.find({
        key: {
          $regex: `^${escapedPrefix}`,
          $options: "i",
        },
      })
        .sort({ updatedAt: -1 })
        .lean();

      const mediaMap = mediaItems.reduce((result, item) => {
        result[item.key] = item.imageUrl;
        return result;
      }, {});

      return NextResponse.json(
        {
          media: mediaMap,
        },
        { status: 200 },
      );
    }

    const mediaItems = await Media.find({})
      .sort({ updatedAt: -1 })
      .lean();

    const mediaMap = mediaItems.reduce((result, item) => {
      result[item.key] = item.imageUrl;
      return result;
    }, {});

    return NextResponse.json(
      {
        media: mediaMap,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET MEDIA ERROR:", error);

    return NextResponse.json(
      {
        message: error.message || "Unable to load media.",
      },
      { status: 500 },
    );
  }
}