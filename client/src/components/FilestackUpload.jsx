// client/src/components/FilestackUpload.jsx
// ----------------------------------------------------
// Opens Filestack picker with crop locked to a ratio.
// Calls onDone({ url, handle, filename }) when saved.
// ----------------------------------------------------

import * as filestack from "filestack-js";

export default function FilestackUpload({ ratio, onDone }) {
  const client = filestack.init(import.meta.env.VITE_FILESTACK_API_KEY);

  const openPicker = () => {
    const picker = client.picker({
      accept: ["image/*"],
      maxFiles: 1,

      // Lock crop ratio (MVP)
      transformations: {
        crop: {
          force: true,
          aspectRatio: ratio.w / ratio.h,
        },
      },

      onUploadDone: (res) => {
        const file = res.filesUploaded?.[0];
        if (!file) return;

        onDone({
          url: file.url,
          handle: file.handle,
          filename: file.filename,
        });
      },
    });

    picker.open();
  };

  return (
    <button
      onClick={openPicker}
      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 shadow-sm hover:bg-gray-50 active:scale-[0.99]"
    >
      Choose Image
    </button>
  );
}
