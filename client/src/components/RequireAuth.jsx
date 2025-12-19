// client/src/components/RequireAuth.jsx
// ----------------------------------------------------
// Route guard for protected pages (e.g. Checkout, My Orders)
// - Calls GET /api/auth/me
// - If 401, redirects to /login and remembers destination
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api.js";

export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        await api.get("/auth/me");
        if (isMounted) setChecking(false);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login", { state: { from: location.pathname }, replace: true });
          return;
        }
        // Any other error, still block to be safe
        navigate("/login", { state: { from: location.pathname }, replace: true });
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [navigate, location.pathname]);

  if (checking) {
    return <div className="p-6 text-gray-600">Checking login…</div>;
  }

  return children;
}
