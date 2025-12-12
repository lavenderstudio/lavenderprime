// server/src/routes/uploads.js
// ----------------------------------------------------
// Upload routes (local storage with multer)
// ----------------------------------------------------

import express from "express";
import multer from "multer";
import path from "path";
import { uploadImage } from "../controllers/upload.controller.js";

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // relative to server/ root
  },
  filename: (req, file, cb) => {
    // Create a unique name: timestamp-random + original extension
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

// File filter (allow only images)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("Only JPG, PNG, WEBP images are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * POST /api/uploads/image
 * form-data: key = "image"
 */
router.post("/image", upload.single("image"), uploadImage);

export default router;
