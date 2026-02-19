// client/src/pages/ForgotPasswordPage.jsx
// ----------------------------------------------------
// Forgot Password page
// - User enters their email
// - Calls POST /api/auth/forgot-password
// - Shows a generic "check your email" message on success
// ----------------------------------------------------

import { useState } from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Forgot Password">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-linear-to-b from-[#FF633F]/5 via-white to-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Forgot your password?</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your account email and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <p className="font-semibold">Check your inbox!</p>
            <p className="mt-1">
              If an account exists for <span className="font-medium">{email}</span>, a password
              reset link has been sent. It expires in 1 hour.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block font-semibold text-[#FF633F] hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <b>Error:</b> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Email address</label>
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

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-2xl bg-[#FF633F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#FF633F]/90 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99] transition-all duration-300 hover:scale-105"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </Page>
  );
}
