// client/src/lib/cropImage.js
// ----------------------------------------------------
// Creates a cropped image blob from an image URL + crop pixels.
// Used to generate a preview image after the user positions the crop.
// ----------------------------------------------------

/**
 * Load an image element from a URL.
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Needed if your images are served from a different origin
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Crop an image (by pixel coordinates) and return a Blob.
 * @param {string} imageUrl - URL to the original image
 * @param {{x:number,y:number,width:number,height:number}} cropPixels
 * @returns {Promise<Blob>}
 */
export async function getCroppedImageBlob(imageUrl, cropPixels) {
  const image = await loadImage(imageUrl);

  const canvas = document.createElement("canvas");
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  const ctx = canvas.getContext("2d");

  // Draw cropped area into canvas
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

  // Convert canvas to Blob (PNG)
  return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) return reject(new Error("Canvas export failed (blob was null)."));
			resolve(blob);
		}, "image/png");
	});
  
}
