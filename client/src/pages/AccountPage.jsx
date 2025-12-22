// client/src/pages/AccountPage.jsx
// ----------------------------------------------------
// Account Page (logged-in user)
// - Loads profile via GET /api/users/me
// - Updates profile via PATCH /api/users/me
// - Allows user to save fullName, phone, and shipping address
// ----------------------------------------------------

import { useEffect, useState } from "react";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "user",
    shippingAddress: {
      line1: "",
      line2: "",
      city: "",
      postcode: "",
      country: "",
    },
  });

  // ✅ Load profile once
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);

        const res = await api.get("/users/me"); // ✅ matches your backend
        const u = res.data?.user;

        setForm({
          fullName: u?.fullName || "",
          email: u?.email || "",
          phone: u?.phone || "",
          role: u?.role || "user",
          shippingAddress: {
            line1: u?.shippingAddress?.line1 || "",
            line2: u?.shippingAddress?.line2 || "",
            city: u?.shippingAddress?.city || "",
            postcode: u?.shippingAddress?.postcode || "",
            country: u?.shippingAddress?.country || "",
          },
        });
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddr = (key, value) => {
    setForm((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [key]: value,
      },
    }));
  };

  const onSave = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");
      setSaving(true);

      const res = await api.patch("/users/me", {
        fullName: form.fullName,
        phone: form.phone,
        shippingAddress: form.shippingAddress,
      });

      const u = res.data?.user;

      // ✅ keep UI in sync with server response
      setForm((prev) => ({
        ...prev,
        fullName: u?.fullName || prev.fullName,
        phone: u?.phone || prev.phone,
        shippingAddress: u?.shippingAddress || prev.shippingAddress,
        role: u?.role || prev.role,
        email: u?.email || prev.email,
      }));

      setSuccess("Saved ✅");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="My Account">
      {loading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <div className="mx-auto max-w-3xl space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <b>Error:</b> {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 bg-linear-to-b from-amber-50 via-white to-white shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="mt-1 text-sm text-gray-600">
              Update your name, phone number, and saved address for faster checkout.
            </p>

            <form onSubmit={onSave} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Full name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input
                    value={form.email}
                    disabled
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm"
                    placeholder="+971..."
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Role</label>
                  <input
                    value={form.role.toUpperCase()}
                    disabled
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">Saved shipping address</h3>
                <p className="mt-1 text-sm text-gray-600">
                  This can be auto-filled in checkout.
                </p>

                <div className="mt-3 grid gap-3">
                  <input
                    value={form.shippingAddress.line1}
                    onChange={(e) => updateAddr("line1", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                    placeholder="Address line 1"
                  />
                  <input
                    value={form.shippingAddress.line2}
                    onChange={(e) => updateAddr("line2", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                    placeholder="Address line 2 (optional)"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={form.shippingAddress.city}
                      onChange={(e) => updateAddr("city", e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                      placeholder="City"
                    />
                    <input
                      value={form.shippingAddress.postcode}
                      onChange={(e) => updateAddr("postcode", e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                      placeholder="Postcode"
                    />
                  </div>

                  <input
                    value={form.shippingAddress.country}
                    onChange={(e) => updateAddr("country", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm"
                    placeholder="Country"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-amber-800 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
}
