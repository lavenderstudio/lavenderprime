// client/src/pages/PrintPortrait.jsx
// Tailwind version: mobile-friendly landing page

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import Page from "../components/Page.jsx";

export default function PrintPortrait() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/products/print");
        setProduct(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };
    load();
  }, []);

  return (
    <Page title="Print (Portrait)">
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
          <b>Error:</b> {error}
        </div>
      )}

      {!product ? (
        <p className="text-gray-600">Loading product…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-gray-700">
              Product loaded: <span className="font-semibold">{product.name}</span>
            </p>

            <p className="mt-3 text-sm font-semibold text-gray-900">Available portrait sizes</p>

            <ul className="mt-2 space-y-2">
              {product.variants
                .filter((v) => v.orientation === "portrait")
                .map((v) => (
                  <li
                    key={v.sku}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                  >
                    <span className="text-gray-800">{v.size}</span>
                    <span className="text-gray-700">{v.basePrice} AED</span>
                  </li>
                ))}
            </ul>

            <button
              onClick={() => navigate("/editor/print/portrait")}
              className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 shadow-sm hover:bg-gray-50 active:scale-[0.99]"
            >
              Start Editing
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-gray-700">
              Next you’ll upload a photo, crop/zoom, preview the output, and add it to cart.
            </p>

            <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
              Tip: keep this page clean — DraftFrames-style pages are simple funnels into the editor.
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
