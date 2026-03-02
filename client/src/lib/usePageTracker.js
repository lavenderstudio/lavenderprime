// client/src/lib/usePageTracker.js
// ─────────────────────────────────────────────────────────────────────────────
// Fires a silent pageview beacon on every route navigation.
// Reads document.referrer + UTM query params and POSTs to /api/analytics/pageview.
// Any error is swallowed — this must NEVER break the UX.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "./api.js";

export function usePageTracker() {
  const location = useLocation();

  useEffect(() => {
    const track = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const payload = {
          path:     location.pathname,
          referrer: document.referrer || "",
          source:   params.get("utm_source")   || "",
          medium:   params.get("utm_medium")   || "",
          campaign: params.get("utm_campaign") || "",
        };
        await api.post("/analytics/pageview", payload);
      } catch {
        // Silent — analytics must never break navigation
      }
    };

    track();
  }, [location.pathname]);
}
