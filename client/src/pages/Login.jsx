// client/src/pages/Login.jsx
// ----------------------------------------------------
// Login page
// - Calls POST /api/auth/login
// - Uses httpOnly cookie auth (axios withCredentials already enabled)
// - After login, fetches /auth/me and updates global auth state (Navbar updates instantly)
// - Redirects to previous page if provided (location.state.from)
// ----------------------------------------------------

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx"; // ✅ NEW

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // If user was redirected here, we store where they wanted to go (e.g. /checkout)
  const redirectTo = location.state?.from || "/";
  const resetSuccess = location.state?.resetSuccess || false;

  const { setUser } = useAuth(); // ✅ NEW

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      // ✅ Backend sets httpOnly cookie
      await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ SAFEST: cookie is set, now ask server who we are
      const meRes = await api.get("/auth/me");
      setUser(meRes.data?.user || null); // ✅ Navbar updates instantly

      // ✅ Go back to intended page (checkout), or home
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setUser(null); // ✅ keep state clean if login fails
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Login">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-linear-to-b from-[#FF633F]/5 via-white to-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-600">
          Log in to continue to checkout and view your orders.
        </p>

        {resetSuccess && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <b>Password reset successful!</b> You can now log in with your new password.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <b>Error:</b> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#FF633F] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-[#FF633F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#FF633F]/90 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99] transition-all duration-300 hover:scale-105"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            state={{ from: redirectTo }} // ✅ preserve redirect flow
            className="font-semibold text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </Page>
  );
}
