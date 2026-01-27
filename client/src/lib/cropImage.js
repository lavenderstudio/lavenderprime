// client/src/lib/cropImage.js
// ----------------------------------------------------
// Takes an image src (dataURL/objectURL), crop pixels from react-easy-crop,
// returns a Blob (JPEG) containing the cropped image.
// ----------------------------------------------------

export async function getCroppedBlob(imageSrc, cropPixels, outType = "image/jpeg", quality = 0.92) {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  // Draw the cropped area onto the canvas
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  // Convert canvas to Blob
  const blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), outType, quality)
  );

  if (!blob) throw new Error("Failed to create cropped blob.");
  return blob;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
