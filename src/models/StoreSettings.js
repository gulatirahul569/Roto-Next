import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "Roto",
      trim: true,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    paymentCOD: {
      type: Boolean,
      default: true,
    },

    paymentOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;