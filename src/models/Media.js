import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "banner",
        "subcategory",
        "product",
        "logo",
        "other",
      ],
      default: "other",
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

const Media =
  mongoose.models.Media ||
  mongoose.model("Media", MediaSchema);

export default Media;