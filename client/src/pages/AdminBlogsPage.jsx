// client/src/pages/admin/AdminBlogsPage.jsx
// ----------------------------------------------------
// Admin/Manager blog management:
// - GET /api/admin/blogs (shows draft + published)
// - Create button
// - Edit + Delete actions
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { Container, ACCENT_BG, ACCENT_HOVER } from "../components/home/ui.jsx";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

export default function AdminBlogsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const res = await api.get("/admin/blogs?limit=50");
      const data = res.data;

      if (!data?.ok) throw new Error(data?.message || "Failed to load");

      setItems(data.items || []);
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    const ok = confirm("Delete this blog? This cannot be undone.");
    if (!ok) return;

    try {
      await api.delete(`/admin/blogs/${id}`);
      await load();
    } catch (e) {
      alert(e?.message || "Delete failed");
    }
  };

  return (
    <Page>
      <Container className="py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Manage Blogs</h1>
            <p className="mt-1 text-sm text-slate-600">Create, edit, publish.</p>
          </div>

          <Link
            to="/admin/blogs/new"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition sm:w-auto`}
          >
            + New Blog
          </Link>
        </div>

        {err && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {err}
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-sm text-slate-600">Loading…</div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
            <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-extrabold text-slate-700">
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {items.map((b) => (
              <div
                key={b._id}
                className="grid grid-cols-12 items-center gap-2 border-b px-4 py-3"
              >
                <div className="col-span-6">
                  <div className="text-sm font-extrabold text-slate-900">{b.title}</div>
                  <div className="text-xs text-slate-500">/{b.slug}</div>
                </div>

                <div className="col-span-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      b.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="col-span-2 text-xs text-slate-600">
                  {formatDate(b.publishedAt || b.createdAt)}
                </div>

                <div className="col-span-2 flex justify-end gap-2">
                  <Link
                    to={`/admin/blogs/${b._id}/edit`}
                    className="rounded-xl border bg-white px-3 py-2 text-xs font-bold hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(b._id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="p-6 text-sm text-slate-600">No blogs yet.</div>
            )}
          </div>
        )}
      </Container>
    </Page>
  );
}
