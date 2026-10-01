import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
    },

    vendorProductId: {
      type: String,
      default: "",
      trim: true,
    },

    vendorUrl: {
      type: String,
      default: "",
      trim: true,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const AmazonSchema = new mongoose.Schema(
  {
    asin: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    associateTag: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 180,
    },

    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    /*
      Existing product type / legacy product grouping.

      Examples:
      Casual
      Premium
      Laptop
      Travel
      Sports
    */
    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /*
      Existing legacy collection field.

      It stays in the model so your current pages and old product data
      continue to work after this upgrade.
    */
    newCategory: {
      type: String,
      default: "all",
      trim: true,
      lowercase: true,
    },

    /*
      New top-level navigation department.

      Examples:
      MEN
      WOMEN
      KIDS
      HOME
      ACCESSORIES
    */
    department: {
      type: String,
      enum: ["ALL", "MEN", "WOMEN", "KIDS", "HOME", "ACCESSORIES"],
      default: "ALL",
      trim: true,
      uppercase: true,
      index: true,
    },

    /*
      New department collection slug.

      Examples:
      t-shirts
      shirts
      pants
      handbags
      watches
      decor
      toys
    */
    subcategory: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    source: {
      type: String,
      enum: ["INVENTORY", "VENDOR", "AMAZON"],
      default: "INVENTORY",
      index: true,
    },

    purchaseMode: {
      type: String,
      enum: ["CHECKOUT", "EXTERNAL_LINK"],
      default: "CHECKOUT",
    },

    externalUrl: {
      type: String,
      default: "",
      trim: true,
    },

    externalButtonText: {
      type: String,
      default: "Explore Product",
      trim: true,
    },

    vendor: {
      type: VendorSchema,
      default: () => ({}),
    },

    amazon: {
      type: AmazonSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

/*
  Makes department + subcategory filtering fast.

  This is used by routes like:

  /api/products?department=MEN&subcategory=t-shirts
*/
ProductSchema.index({
  isActive: 1,
  department: 1,
  subcategory: 1,
});

ProductSchema.pre("validate", function () {
  this.department = String(this.department || "ALL")
    .trim()
    .toUpperCase();

  this.subcategory = String(this.subcategory || "")
    .trim()
    .toLowerCase();

  if (this.source === "AMAZON") {
    this.purchaseMode = "EXTERNAL_LINK";
    this.stock = 0;
    this.price = 0;
    this.compareAtPrice = null;

    if (!this.externalButtonText) {
      this.externalButtonText = "Explore on Amazon";
    }
  }

  if (this.purchaseMode === "EXTERNAL_LINK" && !this.externalUrl) {
    this.invalidate(
      "externalUrl",
      "An external product must have an external URL.",
    );
  }
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);