// server/src/controllers/user.controller.js
// ----------------------------------------------------
// User profile endpoints (logged-in users)
// - getMeProfile: return saved profile fields
// - updateMeProfile: update saved address/phone/name
// ----------------------------------------------------

import User from "../models/User.js";

export async function getMeProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      "_id fullName email phone shippingAddress role"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        shippingAddress: user.shippingAddress || {},
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function updateMeProfile(req, res) {
  try {
    const { fullName, phone, shippingAddress } = req.body;

    const update = {};

    if (typeof fullName === "string") update.fullName = fullName;
    if (typeof phone === "string") update.phone = phone;

    if (shippingAddress && typeof shippingAddress === "object") {
      update.shippingAddress = {
        line1: shippingAddress.line1 || "",
        line2: shippingAddress.line2 || "",
        city: shippingAddress.city || "",
        postcode: shippingAddress.postcode || "",
        country: shippingAddress.country || "",
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
    }).select("_id fullName email phone shippingAddress role");

    return res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        shippingAddress: user.shippingAddress || {},
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
