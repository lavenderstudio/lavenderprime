// server/src/middleware/requireAuth.js
// ----------------------------------------------------
// Reads JWT from cookie "token"
// Attaches req.user (safe fields only)
// ----------------------------------------------------

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET missing in environment");

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.uid).select("_id fullName email role");
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    req.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Not authenticated" });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}
