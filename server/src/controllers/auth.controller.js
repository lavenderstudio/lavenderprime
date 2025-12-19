// server/src/controllers/auth.controller.js
// ----------------------------------------------------
// Auth controllers
// - register: create a new user
// - login: validate credentials and issue JWT cookie
// - me: return current logged-in user
// - logout: clear cookie
// ----------------------------------------------------

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Create JWT token
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing in environment");

  // ✅ Keep payload small
  return jwt.sign(
    { uid: user._id.toString(), role: user.role },
    secret,
    { expiresIn: "7d" }
  );
}

// Set JWT cookie (httpOnly for security)
function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,          // ✅ JS cannot read it (safer)
    secure: isProd,          // ✅ https only in production
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email Is Required" });
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password Must Be At Least 8 Characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: "Email Already In Use" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName || "",
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "user",
    });

    const token = signToken(user);
    setAuthCookie(res, token);

    // ✅ Never return passwordHash
    return res.status(201).json({
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email Is Required" });
    if (!password) return res.status(400).json({ message: "Password Is Required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid Credentials" });

    const token = signToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function me(req, res) {
  try {
    // req.user is set by middleware
    return res.json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
