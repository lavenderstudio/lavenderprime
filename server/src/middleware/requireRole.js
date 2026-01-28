// server/src/middleware/requireRole.js
// ----------------------------------------------------
// Only allow users whose role matches allowed roles.
// Assumes req.user exists (set by your auth middleware).
// ----------------------------------------------------

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const role = req.user?.role;

    // ✅ If not logged in or role not allowed
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ ok: false, message: "Forbidden: Insufficient Permissions" });
    }

    next();
  };
}
