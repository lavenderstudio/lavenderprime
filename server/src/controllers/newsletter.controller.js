// server/src/controllers/newsletter.controller.js
// ----------------------------------------------------
// Newsletter Controller
// - subscribe(req, res): adds email to subscribers (idempotent)
// - unsubscribe(req, res): marks email unsubscribed
// ----------------------------------------------------

import NewsletterSubscriber from "../models/NewsletterSubscriber.js";

/**
 * Simple email validator.
 * Keeps it lightweight and avoids false positives from overly strict regex.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/newsletter/subscribe
 * Body: { email }
 */
export async function subscribe(req, res) {
  try {
    // ✅ Normalize email (trim + lowercase)
    const emailRaw = (req.body?.email || "").toString();
    const email = emailRaw.trim().toLowerCase();

    // ✅ Validate input
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email." });
    }

    // ✅ Idempotent behavior:
    // - If new => create subscribed record
    // - If exists unsubscribed => re-subscribe
    // - If already subscribed => return ok
    const existing = await NewsletterSubscriber.findOne({ email });

    if (!existing) {
      await NewsletterSubscriber.create({
        email,
        status: "subscribed",
        subscribedAt: new Date(),
      });

      return res.json({ ok: true, message: "Subscribed successfully." });
    }

    if (existing.status === "unsubscribed") {
      existing.status = "subscribed";
      existing.unsubscribedAt = null;
      existing.subscribedAt = new Date();
      await existing.save();

      return res.json({ ok: true, message: "Welcome back! You're subscribed again." });
    }

    // Already subscribed
    return res.json({ ok: true, message: "You're already subscribed." });
  } catch (err) {
    // ✅ Handle Mongo duplicate key error (unique email)
    if (err?.code === 11000) {
      return res.json({ ok: true, message: "You're already subscribed." });
    }

    console.error("Newsletter subscribe error:", err);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Body: { email }
 */
export async function unsubscribe(req, res) {
  try {
    // ✅ Normalize email
    const emailRaw = (req.body?.email || "").toString();
    const email = emailRaw.trim().toLowerCase();

    // ✅ Validate input
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email." });
    }

    const existing = await NewsletterSubscriber.findOne({ email });

    // ✅ For privacy, do NOT reveal if an email exists
    if (!existing) {
      return res.json({
        ok: true,
        message: "If this email exists, it has been unsubscribed.",
      });
    }

    existing.status = "unsubscribed";
    existing.unsubscribedAt = new Date();
    await existing.save();

    return res.json({ ok: true, message: "You have been unsubscribed." });
  } catch (err) {
    console.error("Newsletter unsubscribe error:", err);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
}
