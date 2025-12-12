// server/src/controllers/upload.controller.js
// ----------------------------------------------------
// Upload controller
// Accepts an image file and returns a public URL.
// ----------------------------------------------------

export const uploadImage = async (req, res) => {
  try {
    // Multer puts the file on req.file
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Public URL (served by /uploads static route)
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(201).json({
      message: "Upload successful",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
