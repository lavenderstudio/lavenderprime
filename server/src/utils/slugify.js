// server/src/utils/slugify.js
// ----------------------------------------------------
// Make a URL-friendly slug from a title.
// ----------------------------------------------------

export function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")          // remove quotes
    .replace(/[^a-z0-9]+/g, "-")   // non-alphanum => "-"
    .replace(/^-+|-+$/g, "");      // trim "-" ends
}
