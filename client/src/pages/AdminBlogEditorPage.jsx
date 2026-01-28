// client/src/pages/admin/AdminBlogEditorPage.jsx
// ----------------------------------------------------
// Create/Edit blog page:
// - mode="create": POST /api/admin/blogs
// - mode="edit":   GET (admin list already has items, but we load by list + find) OR add GET-by-id endpoint later
//                  PATCH /api/admin/blogs/:id
//
// For simplicity, we'll load all admin blogs and find by id.
// (We can add GET /api/admin/blogs/:id later if you want.)
// ----------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Page from "../components/Page.jsx";
import api from "../lib/api.js";
import { uploadToCloudinary } from "../lib/uploadToCloudinary.js";
import TiptapEditor from "../components/blog/TiptapEditor.jsx";
import { Container, ACCENT_BG, ACCENT_HOVER } from "../components/home/ui.jsx";



export default function AdminBlogEditorPage({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    tagsText: "", // comma separated
    status: "draft",
    coverUrl: "",
    coverPublicId: "",
  });

  // Load existing blog if edit
  useEffect(() => {
    let alive = true;

    async function load() {
      if (!isEdit) return;

      try {
        setLoading(true);
        setErr("");

        // ✅ quick approach: list admin blogs and find one
        const res = await api.get("/admin/blogs?limit=100");
        const items = res.data?.items || [];
        const found = items.find((x) => x._id === id);

        if (!found) throw new Error("Blog not found");

        if (!alive) return;

        setForm({
          title: found.title || "",
          excerpt: found.excerpt || "",
          content: found.content || "",
          tagsText: Array.isArray(found.tags) ? found.tags.join(", ") : "",
          status: found.status || "draft",
          coverUrl: found.coverImage?.url || "",
          coverPublicId: found.coverImage?.publicId || "",
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, isEdit]);

  const tagsArray = useMemo(() => {
    return form.tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [form.tagsText]);

  const onSave = async () => {
    try {
      setSaving(true);
      setErr("");

      if (!form.title.trim()) throw new Error("Title is required");
      if (!form.content.trim()) throw new Error("Content is required");

      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content, // HTML for now
        tags: tagsArray,
        status: form.status,
        coverImage: {
          url: form.coverUrl,
          publicId: form.coverPublicId,
        },
      };

      if (isEdit) {
        const res = await api.patch(`/admin/blogs/${id}`, payload);
        if (!res.data?.ok) throw new Error(res.data?.message || "Update failed");
      } else {
        const res = await api.post("/admin/blogs", payload);
        if (!res.data?.ok) throw new Error(res.data?.message || "Create failed");
      }

      navigate("/admin/blogs");
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Handle cover image upload directly to Cloudinary
	const onCoverUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploadingCover(true);
			setErr("");

			// Basic client-side validation
			if (!file.type.startsWith("image/")) {
				throw new Error("Please select an image file");
			}

			// Upload to Cloudinary
			const uploaded = await uploadToCloudinary(file, "blog-covers");

			// Save result into form state
			setForm((f) => ({
				...f,
				coverUrl: uploaded.url,
				coverPublicId: uploaded.publicId,
			}));
		} catch (err) {
			setErr(err.message || "Image upload failed");
		} finally {
			setUploadingCover(false);
		}
	};


  // ✅ Cover image upload: keep it simple for now (paste URL)
  // If you want, we’ll swap this to your Cloudinary uploader component next.
  const CoverHelp = () => (
    <div className="text-xs text-slate-500">
      Tip: Upload image to Cloudinary and paste the secure URL here. Later we’ll integrate your uploader button.
    </div>
  );

  return (
    <Page>
      <Container className="py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isEdit ? "Edit Blog" : "New Blog"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Only Admin/Manager can publish.
            </p>
          </div>

          <Link to="/admin/blogs" className="text-sm font-semibold text-slate-700 hover:underline">
            ← Back
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
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Left: editor */}
            <div className="lg:col-span-2 rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
              <label className="text-xs font-bold text-slate-700">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                placeholder="e.g. How to choose the perfect frame"
              />

              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="mt-1 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  rows={3}
                  placeholder="Short summary shown on the blog list page…"
                />
              </div>

              <div className="mt-4">
								<label className="text-xs font-bold text-slate-700">Content</label>

								<div className="mt-1">
									<TiptapEditor
										value={form.content}
										onChange={(html) => {
											// ✅ Save HTML into form state
											setForm((f) => ({ ...f, content: html }));
										}}
										placeholder="Write your blog post…"
									/>
								</div>

								<p className="mt-2 text-xs text-slate-500">
									Tip: use headings (H2/H3), bullet lists, and short paragraphs for readability.
								</p>
							</div>
            </div>

            {/* Right: meta */}
            <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
              <label className="text-xs font-bold text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700">Tags (comma separated)</label>
                <input
                  value={form.tagsText}
                  onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))}
                  className="mt-1 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  placeholder="e.g. frames, printing, tips"
                />
              </div>

              <div className="mt-4">
								<label className="text-xs font-bold text-slate-700">Cover Image</label>

								{/* Upload button */}
								<input
									type="file"
									accept="image/*"
									onChange={onCoverUpload}
									disabled={uploadingCover}
									className="mt-1 block w-full text-sm"
								/>

								{uploadingCover && (
									<div className="mt-2 text-xs font-semibold text-slate-600">
										Uploading image…
									</div>
								)}

								{/* Preview */}
								{form.coverUrl && (
									<div className="mt-4 overflow-hidden rounded-2xl border bg-slate-50">
										<img
											src={form.coverUrl}
											alt="Cover preview"
											className="h-44 w-full object-cover"
										/>
										<div className="flex items-center justify-between px-3 py-2 text-xs text-slate-600">
											<span>Uploaded</span>
											<button
												type="button"
												onClick={() =>
													setForm((f) => ({
														...f,
														coverUrl: "",
														coverPublicId: "",
													}))
												}
												className="font-bold text-red-600 hover:underline"
											>
												Remove
											</button>
										</div>
									</div>
								)}
							</div>

              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700">Cover publicId (optional)</label>
                <input
                  value={form.coverPublicId}
                  onChange={(e) => setForm((f) => ({ ...f, coverPublicId: e.target.value }))}
                  className="mt-1 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  placeholder="user-uploads/xxxx"
                />
              </div>

              {form.coverUrl && (
                <div className="mt-4 overflow-hidden rounded-2xl border bg-slate-50">
                  <img src={form.coverUrl} alt="cover preview" className="h-44 w-full object-cover" />
                </div>
              )}

              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className={`mt-6 w-full rounded-2xl ${ACCENT_BG} ${ACCENT_HOVER} px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60`}
              >
                {saving ? "Saving…" : isEdit ? "Update Blog" : "Create Blog"}
              </button>
            </div>
          </div>
        )}
      </Container>
    </Page>
  );
}
