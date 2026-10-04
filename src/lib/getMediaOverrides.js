import { connectDatabase } from "./db";
import Media from "../models/Media";

export async function getMediaOverrides() {
  try {
    await connectDatabase();

    const mediaItems = await Media.find({})
      .select("key imageUrl")
      .lean();

    return mediaItems.reduce((result, item) => {
      result[item.key] = item.imageUrl;
      return result;
    }, {});
  } catch (error) {
    console.error("GET MEDIA OVERRIDES ERROR:", error);

    return {};
  }
}