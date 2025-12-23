import mongoose from "mongoose";

/**
 * Stores newsletter subscribers.
 * - email: unique, lowercased
 * - status: "subscribed" | "unsubscribed"
 */
const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);
