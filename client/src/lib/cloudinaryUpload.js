// client/src/lib/cloudinaryUpload.js
// ----------------------------------------------------
// Upload a File/Blob to Cloudinary (unsigned preset).
// Returns { url, publicId, filename, width, height }.
// ----------------------------------------------------

export async function uploadToCloudinary({ file, folder = "user-uploads" }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary env vars (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).");
  }

  const form = new FormData();
  form.append("file", file); // ✅ File or Blob
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary upload failed: ${txt}`);
  }

  const data = await res.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    filename: data.original_filename,
    width: data.width,
    height: data.height,
  };
}
