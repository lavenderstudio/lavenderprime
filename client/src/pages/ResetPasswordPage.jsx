// client/src/pages/ResetPasswordPage.jsx
// ----------------------------------------------------
// Reset Password page
// - Reads ?token= from the URL query string
// - Calls POST /api/auth/reset-password
// - On success, redirects to /login with a success message
// ----------------------------------------------------

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login", { state: { resetSuccess: true } });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Page title="Reset Password">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
          <p className="font-semibold">Invalid reset link.</p>
          <p className="mt-1">This link is missing a reset token. Please request a new one.</p>
          <Link to="/forgot-password" className="mt-4 inline-block font-semibold text-[#FF633F] hover:underline">
            Request a password reset
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Reset Password">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-linear-to-b from-[#FF633F]/5 via-white to-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Set a new password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your new password below. It must be at least 8 characters.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <b>Error:</b> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-[#FF633F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#FF633F]/90 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99] transition-all duration-300 hover:scale-105"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </Page>
  );
}
