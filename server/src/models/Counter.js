// server/src/models/Counter.js
// ----------------------------------------------------
// Atomic counters for auto-increment fields (orderNumber, etc.)
// Uses findOneAndUpdate + $inc for concurrency-safe increments.
// ----------------------------------------------------

import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "order"
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Counter", CounterSchema);