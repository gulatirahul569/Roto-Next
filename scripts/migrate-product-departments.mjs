import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
const shouldApply = process.argv.includes("--apply");

if (!MONGO_URI) {
  throw new Error(
    "MONGO_URI is missing. Run this script with --env-file=.env.local.",
  );
}

async function migrateProductDepartments() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("\nConnected to MongoDB.\n");

    const collection = mongoose.connection.db.collection("products");

    const totalProducts = await collection.countDocuments();

    const productsMissingDepartment = await collection.countDocuments({
      department: {
        $exists: false,
      },
    });

    const productsMissingSubcategory = await collection.countDocuments({
      subcategory: {
        $exists: false,
      },
    });

    console.log("Department migration preview");
    console.log("----------------------------");
    console.log(`Total products: ${totalProducts}`);
    console.log(
      `Products missing department: ${productsMissingDepartment}`,
    );
    console.log(
      `Products missing subcategory: ${productsMissingSubcategory}`,
    );

    if (!shouldApply) {
      console.log("\nNo database changes were made.");
      console.log(
        "\nTo apply this migration, run:\nnode --env-file=.env.local scripts/migrate-product-departments.mjs --apply\n",
      );

      return;
    }

    console.log("\nApplying department migration...\n");

    const result = await collection.updateMany(
      {},
      [
        {
          $set: {
            /*
              Existing products remain visible under /category/all.

              You will later assign each product to MEN, WOMEN, KIDS,
              HOME, or ACCESSORIES through the Admin edit screen.
            */
            department: {
              $ifNull: ["$department", "ALL"],
            },

            subcategory: {
              $ifNull: ["$subcategory", ""],
            },
          },
        },
      ],
    );

    console.log("Department migration completed successfully.\n");
    console.log(`Matched products: ${result.matchedCount}`);
    console.log(`Modified products: ${result.modifiedCount}`);

    console.log(
      "\nExisting products were assigned to the ALL department. Use Admin Products to assign them to Men, Women, Kids, Home, or Accessories.\n",
    );
  } catch (error) {
    console.error("\nDEPARTMENT MIGRATION ERROR:\n", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrateProductDepartments();