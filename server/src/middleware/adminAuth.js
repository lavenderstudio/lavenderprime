// server/src/middleware/adminAuth.js
// ----------------------------------------------------
// MVP admin auth using a shared secret token.
// Send header: x-admin-token: <token>
// ----------------------------------------------------

export function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];

  // ✅ Token must match server env
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}
