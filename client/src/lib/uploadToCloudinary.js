// client/src/lib/uploadToCloudinary.js
// ----------------------------------------------------
// Uploads a File directly to Cloudinary (unsigned preset)
// Returns { url, publicId, width, height }
// ----------------------------------------------------

export async function uploadToCloudinary(file, folder = "blog-covers") {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_BLOG_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary env variables");
  }

  const form = new FormData();
  form.append("file", file);                 // actual image file
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error("Upload failed: " + txt);
  }

  const data = await res.json();

  return {
    url: data.secure_url,        // final image URL
    publicId: data.public_id,    // used for deletes later
    width: data.width,
    height: data.height,
  };
}
