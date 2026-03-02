// server/src/models/PageView.js
// ─────────────────────────────────────────────────────────────────────────────
// Lightweight page-view model for traffic analytics.
// Stores path, referrer source, UTM params, IP, and user-agent.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const PageViewSchema = new mongoose.Schema(
  {
    path:     { type: String, default: "/" },
    referrer: { type: String, default: "" },

    // Traffic source (utm_source or inferred from referrer domain)
    source:   { type: String, default: "direct" },  // google, facebook, instagram, direct, …
    medium:   { type: String, default: "direct" },  // organic, social, referral, cpc, direct
    campaign: { type: String, default: "" },        // utm_campaign

    ip:        { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

// Fast lookups on createdAt for time-range aggregations
PageViewSchema.index({ createdAt: 1 });
PageViewSchema.index({ source: 1 });
PageViewSchema.index({ path: 1 });

export default mongoose.model("PageView", PageViewSchema);
