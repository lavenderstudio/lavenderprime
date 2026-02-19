// server/src/controllers/auth.controller.js
// ----------------------------------------------------
// Auth controllers
// - register: create a new user
// - login: validate credentials and issue JWT cookie
// - me: return current logged-in user
// - logout: clear cookie
// - forgotPassword: generate reset token and email link
// - resetPassword: validate token and set new password
// ----------------------------------------------------

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../utils/brevoMailer.js";

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

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({ ok: true, message: "If that email exists, a reset link has been sent." });
    }

    // Generate a secure random token
    const plainToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = process.env.FORGOT_CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password?token=${plainToken}`;

    await sendPasswordResetEmail(user.email, resetLink);

    return res.json({ ok: true, message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token) return res.status(400).json({ message: "Reset token is required" });
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Hash the incoming plain token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or has expired" });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
