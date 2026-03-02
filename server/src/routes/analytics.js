// server/src/routes/analytics.js
// ─────────────────────────────────────────────────────────────────────────────
// Public analytics routes — no auth required.
// POST /api/analytics/pageview  → records a page visit
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import PageView from "../models/PageView.js";

const router = express.Router();

/**
 * Infer traffic source and medium from a referrer URL.
 * Returns { source, medium }.
 */
function inferSource(referrer = "") {
  if (!referrer) return { source: "direct", medium: "direct" };

  let hostname = "";
  try {
    hostname = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return { source: "referral", medium: "referral" };
  }

  if (/google\./.test(hostname))    return { source: "google",    medium: "organic" };
  if (/bing\./.test(hostname))      return { source: "bing",      medium: "organic" };
  if (/yahoo\./.test(hostname))     return { source: "yahoo",     medium: "organic" };
  if (/facebook\./.test(hostname))  return { source: "facebook",  medium: "social"  };
  if (/instagram\./.test(hostname)) return { source: "instagram", medium: "social"  };
  if (/tiktok\./.test(hostname))    return { source: "tiktok",    medium: "social"  };
  if (/twitter\./.test(hostname) || /x\.com/.test(hostname)) return { source: "twitter", medium: "social" };
  if (/linkedin\./.test(hostname))  return { source: "linkedin",  medium: "social"  };
  if (/snapchat\./.test(hostname))  return { source: "snapchat",  medium: "social"  };
  if (/youtube\./.test(hostname))   return { source: "youtube",   medium: "social"  };

  return { source: hostname || "referral", medium: "referral" };
}

/**
 * POST /api/analytics/pageview
 * Body: { path, referrer, source?, medium?, campaign? }
 */
router.post("/pageview", async (req, res) => {
  try {
    const { path = "/", referrer = "", source, medium, campaign = "" } = req.body;

    // UTM params override inferred values
    const inferred = inferSource(referrer);
    const finalSource = source || inferred.source;
    const finalMedium = medium || inferred.medium;

    const ip = (
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      ""
    ).trim();

    await PageView.create({
      path,
      referrer,
      source: finalSource,
      medium: finalMedium,
      campaign,
      ip,
      userAgent: req.headers["user-agent"] || "",
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    // Swallow errors silently — never let analytics break the site
    console.error("pageview track error:", err.message);
    return res.status(200).json({ ok: false });
  }
});

export default router;
