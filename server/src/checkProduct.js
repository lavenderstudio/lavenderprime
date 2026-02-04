
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const p = await Product.findOne({ slug: "multiple-prints" });
    if (p) {
        console.log("✅ FOUND: multiple-prints");
        console.log(JSON.stringify(p.purchaseConfig, null, 2));
    } else {
        console.log("❌ NOT FOUND: multiple-prints");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
