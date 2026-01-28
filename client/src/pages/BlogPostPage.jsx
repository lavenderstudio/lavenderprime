// client/src/pages/BlogPostPage.jsx
// ----------------------------------------------------
// Public blog post detail
// - GET /api/blogs/:slug
// - Renders cover + title + author + content
// NOTE: content is assumed to be HTML for now.
// If you store Markdown, we can render markdown instead.
// ----------------------------------------------------

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { Container } from "../components/home/ui.jsx";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const res = await api.get(`/blogs/${slug}`);
        const data = res.data;

        if (!data?.ok) throw new Error(data?.message || "Blog not found");

        if (!alive) return;
        setBlog(data.blog);
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
  }, [slug]);

  return (
    <Page>
      <Container className="py-10">
        <Link to="/blog" className="text-sm font-semibold text-slate-700 hover:underline">
          ← Back to Blog
        </Link>

        {err && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {err}
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-sm text-slate-600">Loading…</div>
        ) : blog ? (
          <article className="mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm">
            {blog.coverImage?.url && (
              <div className="aspect-16/7 bg-slate-100">
                <img
                  src={blog.coverImage.url}
                  alt={blog.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-5 sm:p-8">
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {blog.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
                  {blog.author?.fullName || "Team"}
                </span>
                <span>•</span>
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>

              {blog.excerpt && (
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  {blog.excerpt}
                </p>
              )}

              {/* Content */}
              <div className="prose prose-slate mt-6 max-w-none">
                {/* ⚠️ Only use this if your content is sanitized HTML.
                    If you store markdown, we’ll render markdown instead. */}
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>

              {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {blog.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ) : null}
      </Container>
    </Page>
  );
}
