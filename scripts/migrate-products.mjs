import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
const shouldApply = process.argv.includes("--apply");

if (!MONGO_URI) {
  throw new Error(
    "MONGO_URI is missing. Run this script with: node --env-file=.env.local scripts/migrate-products.mjs"
  );
}

function printCount(label, value) {
  console.log(`${label}: ${value}`);
}

async function migrateProducts() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("\nConnected to MongoDB.\n");

    const collection = mongoose.connection.db.collection("products");

    const totalProducts = await collection.countDocuments();

    const missingIsActive = await collection.countDocuments({
      isActive: {
        $exists: false,
      },
    });

    const missingSource = await collection.countDocuments({
      source: {
        $exists: false,
      },
    });

    const missingPurchaseMode = await collection.countDocuments({
      purchaseMode: {
        $exists: false,
      },
    });

    const missingImages = await collection.countDocuments({
      $or: [
        {
          images: {
            $exists: false,
          },
        },
        {
          images: {
            $size: 0,
          },
        },
      ],
    });

    console.log("Product migration preview");
    console.log("-------------------------");

    printCount("Total products", totalProducts);
    printCount("Products missing isActive", missingIsActive);
    printCount("Products missing source", missingSource);
    printCount("Products missing purchaseMode", missingPurchaseMode);
    printCount("Products missing image gallery array", missingImages);

    if (!shouldApply) {
      console.log("\nNo database changes were made.");
      console.log(
        "\nTo apply this migration, run:\nnode --env-file=.env.local scripts/migrate-products.mjs --apply\n"
      );

      return;
    }

    console.log("\nApplying migration...\n");

    const result = await collection.updateMany(
      {},
      [
        {
          $set: {
            isActive: {
              $ifNull: ["$isActive", true],
            },

            source: {
              $ifNull: ["$source", "INVENTORY"],
            },

            purchaseMode: {
              $cond: [
                {
                  $eq: [
                    {
                      $ifNull: ["$source", "INVENTORY"],
                    },
                    "AMAZON",
                  ],
                },
                "EXTERNAL_LINK",
                {
                  $ifNull: ["$purchaseMode", "CHECKOUT"],
                },
              ],
            },

            currency: {
              $ifNull: ["$currency", "INR"],
            },

            externalUrl: {
              $ifNull: ["$externalUrl", ""],
            },

            externalButtonText: {
              $cond: [
                {
                  $eq: [
                    {
                      $ifNull: ["$source", "INVENTORY"],
                    },
                    "AMAZON",
                  ],
                },
                "Explore on Amazon",
                {
                  $ifNull: [
                    "$externalButtonText",
                    "Explore Product",
                  ],
                },
              ],
            },

            vendor: {
              $mergeObjects: [
                {
                  name: "",
                  sku: "",
                  vendorProductId: "",
                  vendorUrl: "",
                  lastSyncedAt: null,
                },
                {
                  $ifNull: ["$vendor", {}],
                },
              ],
            },

            amazon: {
              $mergeObjects: [
                {
                  asin: "",
                  associateTag: "",
                },
                {
                  $ifNull: ["$amazon", {}],
                },
              ],
            },

            images: {
              $let: {
                vars: {
                  existingImages: {
                    $ifNull: ["$images", []],
                  },

                  primaryImage: {
                    $ifNull: ["$image", ""],
                  },
                },

                in: {
                  $cond: [
                    {
                      $gt: [
                        {
                          $size: "$$existingImages",
                        },
                        0,
                      ],
                    },
                    "$$existingImages",
                    {
                      $cond: [
                        {
                          $ne: ["$$primaryImage", ""],
                        },
                        ["$$primaryImage"],
                        [],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },

        {
          $set: {
            price: {
              $cond: [
                {
                  $eq: ["$source", "AMAZON"],
                },
                0,
                "$price",
              ],
            },

            stock: {
              $cond: [
                {
                  $eq: ["$source", "AMAZON"],
                },
                0,
                "$stock",
              ],
            },
          },
        },
      ]
    );

    console.log("Migration completed successfully.\n");

    printCount("Matched products", result.matchedCount);
    printCount("Modified products", result.modifiedCount);

    console.log(
      "\nExisting products now have the required fields for Inventory, Vendor, and Amazon product support.\n"
    );
  } catch (error) {
    console.error("\nPRODUCT MIGRATION ERROR:\n", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrateProducts();