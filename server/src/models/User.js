// server/src/models/User.js
// ----------------------------------------------------
// User model for authentication
// - Stores password as a bcrypt hash (never plain text)
// - role can be "user" or "admin"
// ----------------------------------------------------

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: "" },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: { type: String, required: true },

    shippingAddress: {
			line1: { type: String, default: "" },
			line2: { type: String, default: "" },
			city: { type: String, default: "" },
			postcode: { type: String, default: "" },
			country: { type: String, default: "" },
		},

		phone: { type: String, default: "" },

    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
