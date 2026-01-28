// client/src/components/auth/RequireRole.jsx
// ----------------------------------------------------
// Guard component for RBAC.
// Uses your axios baseURL (/api already included).
// Uses cookies auth (withCredentials true in api.js).
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";

export default function RequireRole({ roles = [], children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        // ✅ baseURL already includes /api
        const res = await api.get("/users/me");

        // Support different backend response shapes
        const me = res.data?.user || res.data?.me || res.data;

        const role = me?.role;

        // Not logged in
        if (!role) {
          navigate("/login");
          return;
        }

        // Role not allowed
        if (roles.length && !roles.includes(role)) {
          navigate("/");
          return;
        }
      } catch (err) {
        navigate("/login");
        console.log(err);
        return;
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [navigate, roles]);

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Checking permissions…</div>;
  }

  return children;
}
