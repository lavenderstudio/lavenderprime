// server/src/controllers/admin.users.controller.js
// ----------------------------------------------------
// Admin-only user management
// - listUsers: admin+manager can view
// - updateUserRole: admin only can change roles
// ----------------------------------------------------

import User from "../models/User.js";

export async function listUsers(req, res) {
  try {
    const users = await User.find({})
      .select("_id fullName email role createdAt")
      .sort({ createdAt: -1 })
      .limit(500);

    return res.json({ count: users.length, users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowed = ["user", "manager", "admin"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ optional safety: prevent demoting yourself by accident
    if (req.user.id === id && role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own admin role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("_id fullName email role createdAt");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Role updated", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
