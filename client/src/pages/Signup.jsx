// client/src/pages/Signup.jsx
// ----------------------------------------------------
// Signup page
// - Calls POST /api/auth/register
// - Backend sets httpOnly cookie "token"
// - Redirects to intended page (location.state.from)
// ----------------------------------------------------

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      await api.post("/auth/register", {
        fullName,
        email,
        password,
      });

      // ✅ user is now logged in via cookie
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Sign Up">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Sign up to checkout and track your orders.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <b>Error:</b> {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Areez Khan"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Use at least 8 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from: redirectTo }} // ✅ preserve redirect flow
            className="font-semibold text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </Page>
  );
}
