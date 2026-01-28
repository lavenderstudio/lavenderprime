/* eslint-disable no-unused-vars */
// client/src/pages/BlogListPage.jsx
// ----------------------------------------------------
// Public blog list:
// - GET /api/blogs?status=published&page=1&limit=10&q=
// - Shows cards + search + pagination
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { Container } from "../components/home/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ACCENT_BG, ACCENT_HOVER } from "../components/home/ui.jsx";


function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

export default function BlogListPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
	const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { user: me, setUser } = useAuth();
  const isStaff = !!me && ["admin", "manager"].includes(me.role);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  const limit = 9;

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "published");
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (q.trim()) params.set("q", q.trim());
    return params.toString();
  }, [page, q]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const res = await api.get(`/blogs?${queryParams}`);
        const data = res.data;

        if (!data?.ok) throw new Error(data?.message || "Failed to load blogs");

        if (!alive) return;

        setItems(data.items || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Something went wrong");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [queryParams]);

  return (
    <Page>
      <Container className="py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Blog</h1>
            <p className="mt-1 text-sm text-slate-600">
              Tips, guides, and product updates.
            </p>
          </div>

					{isStaff && (
						<button
							onClick={() => navigate("/admin/blogs")}
							className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-bold text-white transition sm:w-auto`}
						>
							Admin Settings
						</button>
					)}

          <div className="w-full sm:w-96">
            <label className="text-xs font-bold text-slate-700">Search</label>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1); // reset pagination on search
              }}
              placeholder="Search Posts…"
              className="mt-1 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {err && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {err}
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-sm text-slate-600">Loading…</div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((b) => (
                <Link
                  key={b._id}
                  to={`/blog/${b.slug}`}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-16/10 bg-slate-100">
                    {b.coverImage?.url ? (
                      <img
                        src={b.coverImage.url}
                        alt={b.title}
                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                        No cover
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatDate(b.publishedAt || b.createdAt)}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
                        {b.author?.fullName || "Team"}
                      </span>
                    </div>

                    <h3 className="mt-2 line-clamp-2 text-base font-extrabold text-slate-900">
                      {b.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                      {b.excerpt || "Read more…"}
                    </p>

                    {Array.isArray(b.tags) && b.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {b.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                ← Prev
              </button>

              <div className="text-sm font-semibold text-slate-700">
                Page {pagination.page} / {pagination.pages}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page >= pagination.pages}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </Container>
    </Page>
  );
}
